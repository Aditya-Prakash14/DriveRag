"""
search/rag.py
─────────────
Retrieval-Augmented Generation pipeline.

Flow:
  query → embed → FAISS over-retrieve → rerank by score → build prompt → LLM

LLM priority:
  1. Groq if GROQ_API_KEY is set (fast, free tier available)
  2. Extractive answer (concatenate top chunks) — works with zero API key
"""
from __future__ import annotations

from config.settings import GROQ_API_KEY, LLM_MODEL
from embedding.encoder import embed_query
from search.vector_store import get_store


# ── Extractive fallback ───────────────────────────────────────────────────────

def _extractive_answer(chunks: list[dict], query: str) -> str:
    """
    Extractive answer: return the most relevant chunk texts with synthesis.
    Used when no LLM key is available.
    """
    if not chunks:
        return "I could not find relevant information in the indexed documents."
    
    # Return top 3 chunks as-is, clearly attributed
    lines = []
    for c in chunks[:3]:
        lines.append(f"From **{c['file_name']}** (chunk {c['chunk_index']}):\n{c['text'].strip()}")
    
    return "\n\n---\n\n".join(lines)


# ── Groq answer (OpenAI-compatible) ──────────────────────────────────────────────

def _groq_answer(context: str, query: str, sources: list[str]) -> str:
    from openai import OpenAI
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )

    source_list = ", ".join(sources)

    system = (
        "You are DriveRAG, a precise document assistant. You answer questions "
        "based ONLY on the provided document context.\n\n"
        "Rules:\n"
        "1. Answer the question thoroughly using the provided context.\n"
        "2. If the context contains relevant information, provide a comprehensive answer.\n"
        "3. Structure your answer with clear paragraphs. Use bullet points for lists.\n"
        "4. When referencing specific details, mention which source document it comes from.\n"
        "5. If the context doesn't fully answer the question, say what you CAN answer "
        "and clearly state what information is missing.\n"
        "6. Never fabricate information not present in the context.\n"
        "7. If the user asks to 'read all' or 'summarize', provide a comprehensive "
        "summary of all the context provided, organized by topic."
    )
    user = (
        f"Source documents: {source_list}\n\n"
        f"Document context:\n{context}\n\n"
        f"Question: {query}\n\n"
        f"Provide a thorough answer based on the document context above."
    )

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.3,
        max_tokens=1500,
    )
    return response.choices[0].message.content.strip()


# ── Reranking ──────────────────────────────────────────────────────────────────

def _rerank(results: list[dict], top_k: int) -> list[dict]:
    """
    Simple score-based reranking: results are already sorted by FAISS score.
    Apply diversity filtering — don't return too many chunks from the same doc.
    """
    if len(results) <= top_k:
        return results

    # Diversity: limit to max 2 consecutive chunks from same doc
    selected = []
    doc_consecutive = {}
    
    for r in results:
        doc_id = r["doc_id"]
        consecutive = doc_consecutive.get(doc_id, 0)
        
        if consecutive < 2:
            selected.append(r)
            doc_consecutive[doc_id] = consecutive + 1
        else:
            # Skip this chunk from same doc, reset counter
            doc_consecutive[doc_id] = 0
            
        if len(selected) >= top_k:
            break
    
    # If we didn't get enough from diversity, fill remaining from original order
    if len(selected) < top_k:
        seen_ids = {r["chunk_id"] for r in selected}
        for r in results:
            if r["chunk_id"] not in seen_ids:
                selected.append(r)
                if len(selected) >= top_k:
                    break

    return selected


# ── Main RAG function ─────────────────────────────────────────────────────────

def ask(
    query: str,
    top_k: int = 8,
    doc_ids: list[str] | None = None,
    score_threshold: float = 0.01,
) -> dict:
    """
    Full RAG pipeline with over-retrieval and reranking.
    Returns: { answer, sources, chunks_used, total_chunks_searched }
    """
    # 1. Embed query (with query expansion for short queries)
    q_emb = embed_query(query)

    # 2. Over-retrieve (3x) then rerank for diversity
    store = get_store()
    overfetch_k = min(top_k * 3, store.index.ntotal) if store.index.ntotal > 0 else top_k
    
    raw_results = store.search(
        query_embedding=q_emb,
        top_k=overfetch_k,
        doc_ids=doc_ids,
        score_threshold=0.0,  # No threshold on raw fetch — rerank will filter
    )

    if not raw_results:
        return {
            "answer": "No relevant documents found. Please ensure documents are synced and try again.",
            "sources": [],
            "chunks_used": 0,
            "total_chunks_searched": store.stats()["total_chunks"],
        }

    # 3. Rerank: diversity filter + score threshold
    results = _rerank(raw_results, top_k)
    results = [r for r in results if r["score"] >= score_threshold]

    if not results:
        return {
            "answer": "No relevant documents found for this query. Try rephrasing your question or syncing more documents.",
            "sources": [],
            "chunks_used": 0,
            "total_chunks_searched": store.stats()["total_chunks"],
        }

    # 4. Build context string with relevance scores
    context_parts = []
    for i, r in enumerate(results, 1):
        context_parts.append(
            f"[Source {i}: {r['file_name']} | chunk {r['chunk_index']} | relevance: {r['score']:.2f}]\n{r['text']}"
        )
    context = "\n\n".join(context_parts)

    # 5. Deduplicate sources for LLM prompt
    sources = list(dict.fromkeys(r["file_name"] for r in results))

    # 6. Generate answer
    if GROQ_API_KEY:
        try:
            answer = _groq_answer(context, query, sources)
        except Exception as e:
            answer = _extractive_answer(results, query)
            err_msg = str(e).lower()
            if "rate_limit" in err_msg or "429" in err_msg:
                answer += "\n\n⚠️ *Today's LLM token limit has been reached. Showing extractive answer from documents. LLM answers will resume tomorrow.*"
            elif "decommissioned" in err_msg or ("model" in err_msg and "not" in err_msg and "supported" in err_msg):
                answer += "\n\n⚠️ *LLM model no longer available. Please update LLM_MODEL in your .env file. Showing extractive answer from documents.*"
            elif "invalid_api_key" in err_msg or "401" in err_msg:
                answer += "\n\n⚠️ *Invalid Groq API key. Please check your GROQ_API_KEY in .env. Showing extractive answer from documents.*"
            else:
                answer += "\n\n⚠️ *LLM temporarily unavailable. Showing extractive answer from documents.*"
    else:
        answer = _extractive_answer(results, query)

    return {
        "answer": answer,
        "sources": sources,
        "chunks_used": len(results),
        "total_chunks_searched": store.stats()["total_chunks"],
    }
