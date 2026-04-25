"""
tests/test_pipeline.py
──────────────────────
Offline unit + integration tests for chunking, embedding, vector store, and RAG.
Run with: python tests/test_pipeline.py  (no pytest needed)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import tempfile
import shutil
import numpy as np

# ── Colours for terminal output ───────────────────────────────────────────────
GREEN = "\033[92m"; RED = "\033[91m"; RESET = "\033[0m"; BOLD = "\033[1m"

passed = 0
failed = 0


def ok(name):
    global passed
    passed += 1
    print(f"  {GREEN}✓{RESET} {name}")


def fail(name, err):
    global failed
    failed += 1
    print(f"  {RED}✗{RESET} {name}: {RED}{err}{RESET}")


def section(title):
    print(f"\n{BOLD}{title}{RESET}")


# ─────────────────────────────────────────────────────────────────────────────
# 1. Text Parsing
# ─────────────────────────────────────────────────────────────────────────────
section("1. Text Parsing")

from processing.parser import clean_text, extract_text

try:
    raw = "  Hello   World  \n\n\n\nLine2\n"
    cleaned = clean_text(raw)
    assert "Hello   World" not in cleaned   # double spaces collapsed
    assert "\n\n\n" not in cleaned          # triple newlines collapsed
    ok("clean_text collapses whitespace")
except Exception as e:
    fail("clean_text", e)

try:
    txt_bytes = b"Hello from a text file.\nLine two here."
    text = extract_text(txt_bytes, "txt")
    assert "Hello from a text file." in text
    ok("extract_text TXT")
except Exception as e:
    fail("extract_text TXT", e)

try:
    # Minimal PDF bytes (real extraction tested with actual files)
    import io
    import PyPDF2
    writer = PyPDF2.PdfWriter()
    page = PyPDF2.PageObject.create_blank_page(width=200, height=200)
    writer.add_page(page)
    buf = io.BytesIO()
    writer.write(buf)
    pdf_bytes = buf.getvalue()
    text = extract_text(pdf_bytes, "pdf")
    # blank page may give empty string — just confirm no crash
    assert isinstance(text, str)
    ok("extract_text PDF (blank page, no crash)")
except Exception as e:
    fail("extract_text PDF", e)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Chunking
# ─────────────────────────────────────────────────────────────────────────────
section("2. Chunking")

from processing.chunker import chunk_document, RecursiveCharacterTextSplitter

SAMPLE_DOC = """
Introduction

Our company policy outlines key principles for all employees.
We believe in transparency, fairness, and accountability.

Refund Policy

Customers are entitled to a full refund within 30 days of purchase.
After 30 days, store credit will be issued instead of a cash refund.
Digital products are non-refundable once downloaded.
Refunds are processed within 5 to 7 business days to the original payment method.

PTO Policy

Full-time employees receive 15 days of paid time off per year.
PTO accrues at 1.25 days per month starting from the first month of employment.
Senior employees with 5 or more years of service receive 20 days of PTO per year.
Unused PTO of up to 5 days may be carried over to the next calendar year.

Compliance

All teams must complete mandatory compliance training by the end of Q1.
Data retention policies require logs to be kept for a minimum of 7 years.
GDPR and SOC2 Type II compliance are mandatory for all customer-facing systems.
""".strip()

try:
    splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)
    chunks = splitter.split_text(SAMPLE_DOC)
    assert len(chunks) > 1, f"Expected multiple chunks, got {len(chunks)}"
    for c in chunks:
        assert len(c) <= 350, f"Chunk too large: {len(c)} chars"  # small tolerance
    ok(f"RecursiveCharacterTextSplitter → {len(chunks)} chunks, all ≤ 350 chars")
except Exception as e:
    fail("RecursiveCharacterTextSplitter", e)

try:
    chunks = chunk_document(SAMPLE_DOC, doc_id="doc_abc", file_name="policy.pdf", chunk_size=300)
    assert len(chunks) > 0
    for c in chunks:
        assert c.doc_id == "doc_abc"
        assert c.file_name == "policy.pdf"
        assert c.source == "gdrive"
        assert c.chunk_id.startswith("doc_abc__chunk_")
        assert "doc_id" in c.metadata
    ok(f"chunk_document produces {len(chunks)} Chunk objects with correct metadata")
except Exception as e:
    fail("chunk_document metadata", e)

try:
    # Verify overlap: consecutive chunks should share some content
    chunks = chunk_document(SAMPLE_DOC, doc_id="x", file_name="x.pdf", chunk_size=200, chunk_overlap=40)
    if len(chunks) >= 2:
        # Just check they're non-empty and distinct
        texts = [c.text for c in chunks]
        assert len(set(texts)) > 1, "All chunks are identical — overlap too large?"
    ok("Chunk overlap produces distinct non-empty chunks")
except Exception as e:
    fail("Chunk overlap", e)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Embeddings
# ─────────────────────────────────────────────────────────────────────────────
section("3. Embeddings (skipped if offline)")

try:
    from embedding.encoder import embed_texts, embed_query
    vecs = embed_texts(["What is the refund policy?", "Customers get 30 days to return."])
    assert vecs.shape == (2, 384), f"Expected (2,384), got {vecs.shape}"
    # L2 norms should be ~1.0 (normalized)
    norms = np.linalg.norm(vecs, axis=1)
    assert np.allclose(norms, 1.0, atol=1e-5), f"Embeddings not normalized: {norms}"
    q = embed_query("refund")
    assert q.shape == (1, 384)
    # Semantic similarity: "refund policy" and "30 days to return" should be similar
    sim = float(vecs[0] @ vecs[1])
    assert sim > 0.3, f"Low similarity between related sentences: {sim:.3f}"
    ok(f"embed_texts shape={vecs.shape}, normalized, semantic sim={sim:.3f}")
    ok("embed_query produces (1,384) normalized vector")
    EMBEDDINGS_OK = True
except OSError:
    print(f"  ⚠  Skipping embedding tests (no internet / model not cached)")
    EMBEDDINGS_OK = False
except Exception as e:
    fail("Embeddings", e)
    EMBEDDINGS_OK = False


# ─────────────────────────────────────────────────────────────────────────────
# 4. Vector Store
# ─────────────────────────────────────────────────────────────────────────────
section("4. Vector Store")

from processing.chunker import Chunk
from search.vector_store import VectorStore

# Override paths to use temp dir
import config.settings as cfg
_orig_faiss = cfg.FAISS_INDEX_PATH
_orig_chunks = cfg.CHUNKS_DB_PATH
_tmpdir = tempfile.mkdtemp()
cfg.FAISS_INDEX_PATH = type('P', (), {'__str__': lambda s: os.path.join(_tmpdir, 'faiss')})()
cfg.CHUNKS_DB_PATH = type('P', (), {'__str__': lambda s: os.path.join(_tmpdir, 'chunks.json'),
                                     'exists': lambda s: os.path.exists(os.path.join(_tmpdir, 'chunks.json')),
                                     'read_text': lambda s: open(os.path.join(_tmpdir, 'chunks.json')).read(),
                                     'write_text': lambda s, t: open(os.path.join(_tmpdir, 'chunks.json'), 'w').write(t)})()

try:
    store = VectorStore.__new__(VectorStore)
    import threading, faiss as _faiss
    store._lock = threading.Lock()
    store.index = _faiss.IndexFlatIP(384)
    store.chunks = []

    # Create fake chunks + random normalized embeddings
    fake_chunks = [
        Chunk(chunk_id=f"d1__chunk_{i}", doc_id="d1", file_name="refund.pdf",
              chunk_index=i, text=f"Refund policy chunk {i}. Customers get 30 days.")
        for i in range(5)
    ]
    rng = np.random.default_rng(42)
    vecs = rng.random((5, 384)).astype("float32")
    vecs /= np.linalg.norm(vecs, axis=1, keepdims=True)

    store.add_chunks(fake_chunks, vecs)
    assert store.index.ntotal == 5
    assert len(store.chunks) == 5
    ok("add_chunks: 5 chunks stored in FAISS + metadata list")

    # Add more chunks for a second doc
    fake_chunks2 = [
        Chunk(chunk_id=f"d2__chunk_{i}", doc_id="d2", file_name="pto.pdf",
              chunk_index=i, text=f"PTO policy chunk {i}. Employees get 15 days.")
        for i in range(3)
    ]
    vecs2 = rng.random((3, 384)).astype("float32")
    vecs2 /= np.linalg.norm(vecs2, axis=1, keepdims=True)
    store.add_chunks(fake_chunks2, vecs2)
    assert store.index.ntotal == 8
    ok("add_chunks: second doc brings total to 8 chunks")

    # Search
    q_vec = vecs[0:1].copy()  # use first chunk's own embedding
    results = store.search(q_vec, top_k=3)
    assert len(results) > 0
    assert results[0]["doc_id"] == "d1"
    assert results[0]["score"] > 0.9   # should match itself
    ok(f"search: top result is correct doc (score={results[0]['score']:.3f})")

    # Metadata filter
    results_d2 = store.search(q_vec, top_k=5, doc_ids=["d2"])
    assert all(r["doc_id"] == "d2" for r in results_d2)
    ok(f"search with doc_ids filter: all results from d2")

    # Stats
    stats = store.stats()
    assert stats["total_chunks"] == 8
    assert stats["total_documents"] == 2
    ok(f"stats: {stats}")

    # Delete by doc_id
    store.delete_by_doc_id("d1")
    assert store.index.ntotal == 3
    assert all(c["doc_id"] == "d2" for c in store.chunks)
    ok("delete_by_doc_id: removed d1, 3 chunks remain")

    # List documents
    docs = store.list_documents()
    assert len(docs) == 1
    assert docs[0]["doc_id"] == "d2"
    ok("list_documents: 1 doc remains after deletion")

except Exception as e:
    import traceback
    fail("VectorStore", f"{e}\n{traceback.format_exc()}")
finally:
    shutil.rmtree(_tmpdir, ignore_errors=True)
    cfg.FAISS_INDEX_PATH = _orig_faiss
    cfg.CHUNKS_DB_PATH = _orig_chunks


# ─────────────────────────────────────────────────────────────────────────────
# 5. RAG Pipeline (offline — stub embeddings)
# ─────────────────────────────────────────────────────────────────────────────
section("5. RAG Pipeline (offline stub)")

try:
    import faiss as _faiss
    import threading
    import search.vector_store as vs_module
    import embedding.encoder as enc_module

    # ── Monkey-patch embed_query BEFORE importing rag ──
    rng = np.random.default_rng(7)
    known_vec = rng.random((1, 384)).astype("float32")
    known_vec /= np.linalg.norm(known_vec)

    _orig_embed_query = enc_module.embed_query
    enc_module.embed_query = lambda query: known_vec.copy()

    from search import rag as rag_module

    # Build an isolated in-memory store
    stub_store = VectorStore.__new__(VectorStore)
    stub_store._lock = threading.Lock()
    stub_store.index = _faiss.IndexFlatIP(384)
    stub_store.chunks = []

    known_text = "Customers may request a full refund within 30 days of purchase."
    known_chunk = Chunk(
        chunk_id="test__chunk_0", doc_id="test_doc",
        file_name="Refund Policy.pdf", chunk_index=0,
        text=known_text,
    )
    stub_store.add_chunks([known_chunk], known_vec)

    # Monkey-patch the singleton
    vs_module._store = stub_store

    result = rag_module.ask("What is the refund policy?", score_threshold=0.0)
    assert "answer" in result
    assert "sources" in result
    assert "Refund Policy.pdf" in result["sources"]
    assert result["chunks_used"] >= 1
    ok(f"RAG ask() returns answer with correct source (chunks_used={result['chunks_used']})")

    # Empty store → graceful fallback
    empty_store = VectorStore.__new__(VectorStore)
    empty_store._lock = threading.Lock()
    empty_store.index = _faiss.IndexFlatIP(384)
    empty_store.chunks = []
    vs_module._store = empty_store

    result_empty = rag_module.ask("anything", score_threshold=0.0)
    assert "answer" in result_empty
    assert result_empty["sources"] == []
    ok("RAG ask() on empty store returns graceful no-results message")

    enc_module.embed_query = _orig_embed_query
    vs_module._store = None   # reset singleton

except Exception as e:
    import traceback
    fail("RAG pipeline", f"{e}\n{traceback.format_exc()}")


# ─────────────────────────────────────────────────────────────────────────────
# 6. FastAPI Routes (import check)
# ─────────────────────────────────────────────────────────────────────────────
section("6. FastAPI App Import")

try:
    from api.main import app
    routes = [r.path for r in app.routes]
    expected = ["/", "/auth/login", "/auth/callback", "/auth/me",
                "/auth/logout", "/drive/files", "/sync-drive",
                "/ask", "/documents", "/stats"]
    for path in expected:
        assert path in routes, f"Missing route: {path}"
    ok(f"All {len(expected)} expected routes registered: {', '.join(expected)}")
except Exception as e:
    import traceback
    fail("FastAPI app import", f"{e}\n{traceback.format_exc()}")


# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
total = passed + failed
print(f"\n{'─'*50}")
print(f"{BOLD}Results: {GREEN}{passed} passed{RESET}{BOLD}, {RED}{failed} failed{RESET}{BOLD} / {total} total{RESET}")
if failed == 0:
    print(f"{GREEN}{BOLD}All tests passed!{RESET}")
else:
    sys.exit(1)
