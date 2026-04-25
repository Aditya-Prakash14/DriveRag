"""
search/rag.py
─────────────
Retrieval-Augmented Generation pipeline.

Flow:
  query → embed → FAISS top-k → build prompt → LLM (or extractive fallback)

LLM priority:
  1. OpenAI GPT if OPENAI_API_KEY is set
  2. Extractive answer (concatenate top chunks) — works with zero API key
"""
from __future__ import annotations

from config.settings import OPENAI_API_KEY, LLM_MODEL
from embedding.encoder import embed_query
from search.vector_store import get_store


# ── Extractive fallback ───────────────────────────────────────────────────────

def _extractive_answer(chunks: list[dict], query: str) -> str:
    """
    Simple extractive answer: return the most relevant chunk texts.
    Good enough for demo when no LLM key is available.
    """
    if not chunks:
        return "I could not find relevant information in the indexed documents."
    
    # Return top 2 chunks as-is, clearly attributed
    lines = []
    for c in chunks[:2]:
        lines.append(f"From **{c['file_name']}**:\n{c['text'].strip()}")
    
    return "\n\n---\n\n".join(lines)


# ── OpenAI answer ─────────────────────────────────────────────────────────────

def _openai_answer(context: str, query: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)

    system = (
        "You are a helpful assistant that answers questions strictly based on "
        "the provided document context. Be concise and accurate. "
        "If the context doesn't contain enough information, say so clearly. "
        "Do not make up facts."
    )
    user = f"Context:\n{context}\n\nQuestion: {query}"

    response = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
        max_tokens=600,
    )
    return response.choices[0].message.content.strip()


# ── Main RAG function ─────────────────────────────────────────────────────────

def ask(
    query: str,
    top_k: int = 5,
    doc_ids: list[str] | None = None,
    score_threshold: float = 0.15,
) -> dict:
    """
    Full RAG pipeline.
    Returns: { answer, sources, chunks_used, total_chunks_searched }
    """
    # 1. Embed query
    q_emb = embed_query(query)

    # 2. Retrieve relevant chunks
    store = get_store()
    results = store.search(
        query_embedding=q_emb,
        top_k=top_k,
        doc_ids=doc_ids,
        score_threshold=score_threshold,
    )

    if not results:
        return {
            "answer": "No relevant documents found. Please ensure documents are synced and try again.",
            "sources": [],
            "chunks_used": 0,
            "total_chunks_searched": store.stats()["total_chunks"],
        }

    # 3. Build context string
    context_parts = []
    for r in results:
        context_parts.append(
            f"[Source: {r['file_name']} | chunk {r['chunk_index']}]\n{r['text']}"
        )
    context = "\n\n".join(context_parts)

    # 4. Generate answer
    if OPENAI_API_KEY:
        try:
            answer = _openai_answer(context, query)
        except Exception as e:
            answer = _extractive_answer(results, query)
            answer += f"\n\n*(LLM error: {e})*"
    else:
        answer = _extractive_answer(results, query)

    # 5. Deduplicate sources
    sources = list(dict.fromkeys(r["file_name"] for r in results))

    return {
        "answer": answer,
        "sources": sources,
        "chunks_used": len(results),
        "total_chunks_searched": store.stats()["total_chunks"],
    }
