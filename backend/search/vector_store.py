"""
search/vector_store.py
──────────────────────
FAISS-backed vector store with JSON metadata sidecar.
Supports: add, search, delete by doc_id, persist/load.

Index type: IndexFlatIP (Inner Product on normalized vecs = cosine sim)
Optionally upgrades to IVF for large corpora (>10k chunks).
"""
from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Optional

import faiss
import numpy as np

from config.settings import EMBEDDING_DIM, FAISS_INDEX_PATH, CHUNKS_DB_PATH
from processing.chunker import Chunk


class VectorStore:
    """Thread-safe FAISS store with chunk metadata sidecar."""

    def __init__(self):
        self._lock = threading.Lock()
        self.index: faiss.Index = faiss.IndexFlatIP(EMBEDDING_DIM)
        self.chunks: list[dict] = []   # parallel list to FAISS internal IDs
        self._load_if_exists()

    # ── Persistence ──────────────────────────────────────────────────────────

    def _load_if_exists(self):
        idx_path = Path(str(FAISS_INDEX_PATH) + ".index")
        meta_path = Path(CHUNKS_DB_PATH)
        if idx_path.exists() and meta_path.exists():
            self.index = faiss.read_index(str(idx_path))
            self.chunks = json.loads(meta_path.read_text())
            print(f"[VectorStore] Loaded {len(self.chunks)} chunks from disk.")

    def save(self):
        idx_path = Path(str(FAISS_INDEX_PATH) + ".index")
        meta_path = Path(CHUNKS_DB_PATH)
        with self._lock:
            faiss.write_index(self.index, str(idx_path))
            meta_path.write_text(json.dumps(self.chunks, ensure_ascii=False, indent=2))
        print(f"[VectorStore] Saved {len(self.chunks)} chunks.")

    # ── Ingestion ─────────────────────────────────────────────────────────────

    def add_chunks(self, chunks: list[Chunk], embeddings: np.ndarray):
        """Add chunk metadata + their embeddings to the store."""
        if len(chunks) == 0:
            return
        with self._lock:
            self.index.add(embeddings)
            for chunk in chunks:
                self.chunks.append({
                    "chunk_id": chunk.chunk_id,
                    "doc_id": chunk.doc_id,
                    "file_name": chunk.file_name,
                    "source": chunk.source,
                    "chunk_index": chunk.chunk_index,
                    "text": chunk.text,
                    "metadata": chunk.metadata,
                })

    def delete_by_doc_id(self, doc_id: str):
        """
        Remove all chunks for a doc. FAISS FlatIP doesn't support removal,
        so we rebuild the index from remaining vectors.
        """
        with self._lock:
            keep_indices = [
                i for i, c in enumerate(self.chunks) if c["doc_id"] != doc_id
            ]
            if len(keep_indices) == len(self.chunks):
                return  # nothing to remove

            remaining_chunks = [self.chunks[i] for i in keep_indices]

            # Reconstruct embeddings for remaining
            all_vecs = faiss.rev_swig_ptr(
                self.index.get_xb(), self.index.ntotal * EMBEDDING_DIM
            ).reshape(self.index.ntotal, EMBEDDING_DIM).copy()
            kept_vecs = all_vecs[keep_indices]

            new_index = faiss.IndexFlatIP(EMBEDDING_DIM)
            if len(kept_vecs) > 0:
                new_index.add(kept_vecs.astype("float32"))

            self.index = new_index
            self.chunks = remaining_chunks

    # ── Search ────────────────────────────────────────────────────────────────

    def search(
        self,
        query_embedding: np.ndarray,
        top_k: int = 5,
        doc_ids: Optional[list[str]] = None,
        score_threshold: float = 0.0,
    ) -> list[dict]:
        """
        Return top_k most similar chunks.
        Optionally filter to specific doc_ids (metadata filtering).
        """
        with self._lock:
            if self.index.ntotal == 0:
                return []

            # Fetch more candidates if we need to filter
            fetch_k = top_k * 5 if doc_ids else top_k
            fetch_k = min(fetch_k, self.index.ntotal)

            scores, indices = self.index.search(
                query_embedding.reshape(1, -1).astype("float32"),
                fetch_k,
            )
            scores = scores[0]
            indices = indices[0]

            results = []
            for score, idx in zip(scores, indices):
                if idx < 0 or idx >= len(self.chunks):
                    continue
                chunk = self.chunks[idx]
                if score < score_threshold:
                    continue
                if doc_ids and chunk["doc_id"] not in doc_ids:
                    continue
                results.append({**chunk, "score": float(score)})
                if len(results) >= top_k:
                    break

            return results

    # ── Stats ─────────────────────────────────────────────────────────────────

    def stats(self) -> dict:
        with self._lock:
            doc_ids = {c["doc_id"] for c in self.chunks}
            return {
                "total_chunks": len(self.chunks),
                "total_documents": len(doc_ids),
                "index_size": self.index.ntotal,
            }

    def list_documents(self) -> list[dict]:
        """Return one summary entry per unique doc_id."""
        with self._lock:
            seen = {}
            for c in self.chunks:
                did = c["doc_id"]
                if did not in seen:
                    seen[did] = {
                        "doc_id": did,
                        "file_name": c["file_name"],
                        "chunk_count": 0,
                    }
                seen[did]["chunk_count"] += 1
            return list(seen.values())


# ── Singleton ────────────────────────────────────────────────────────────────
_store: VectorStore | None = None


def get_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
    return _store
