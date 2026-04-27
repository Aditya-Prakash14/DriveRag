"""
search/vector_store.py
──────────────────────
FAISS-backed vector store with persistence.

Stores chunk text + metadata in a JSON sidecar file.
Raw embeddings are stored alongside metadata so the index can be
rebuilt after selective deletion (FAISS IndexFlatIP has no remove-by-id).

Singleton: call get_store() everywhere — one instance per process.
"""
from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Optional

import faiss
import numpy as np

from config.settings import CHUNKS_DB_PATH, EMBEDDING_DIM, FAISS_INDEX_PATH
from processing.chunker import Chunk

# ── Singleton ─────────────────────────────────────────────────────────────────

_store: Optional["VectorStore"] = None


def get_store() -> "VectorStore":
    global _store
    if _store is None:
        _store = VectorStore()
    return _store


# ── VectorStore ───────────────────────────────────────────────────────────────


class VectorStore:
    """
    Thread-safe FAISS vector store.

    Internal data structures:
      self.index   — faiss.IndexFlatIP  (exact cosine similarity via dot product
                     on L2-normalised vectors)
      self.chunks  — list[dict]  parallel to index rows, each dict holds:
                       chunk_id, doc_id, file_name, chunk_index, text, vector
    """

    def __init__(self):
        self._lock = threading.Lock()
        self.index: faiss.IndexFlatIP = faiss.IndexFlatIP(EMBEDDING_DIM)
        self.chunks: list[dict] = []
        self._load()

    # ── Persistence ───────────────────────────────────────────────────────────

    def _load(self):
        """Load FAISS index + chunk metadata from disk (silent on first run)."""
        faiss_path = Path(str(FAISS_INDEX_PATH))
        chunks_path = Path(str(CHUNKS_DB_PATH))

        try:
            if faiss_path.exists():
                self.index = faiss.read_index(str(faiss_path))
        except Exception as exc:
            print(f"[VectorStore] Could not load FAISS index: {exc}. Starting fresh.")
            self.index = faiss.IndexFlatIP(EMBEDDING_DIM)

        try:
            if chunks_path.exists():
                self.chunks = json.loads(chunks_path.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"[VectorStore] Could not load chunks DB: {exc}. Starting fresh.")
            self.chunks = []

        # Sanity-check: index row count must match metadata list length
        if self.index.ntotal != len(self.chunks):
            print(
                f"[VectorStore] WARNING: index has {self.index.ntotal} vectors but "
                f"metadata has {len(self.chunks)} entries. Rebuilding from metadata."
            )
            self._rebuild_index_from_chunks()

    def save(self):
        """Persist index and metadata to disk."""
        faiss_path = Path(str(FAISS_INDEX_PATH))
        chunks_path = Path(str(CHUNKS_DB_PATH))

        faiss_path.parent.mkdir(parents=True, exist_ok=True)

        with self._lock:
            faiss.write_index(self.index, str(faiss_path))
            # Exclude the raw vector from the JSON to keep file size sane when
            # EMBEDDING_DIM=1536; we only need it in memory for rebuild after delete.
            serialisable = [
                {k: v for k, v in c.items() if k != "vector"} for c in self.chunks
            ]
            chunks_path.write_text(
                json.dumps(serialisable, ensure_ascii=False), encoding="utf-8"
            )

    # ── Write ─────────────────────────────────────────────────────────────────

    def add_chunks(self, chunks: list[Chunk], embeddings: np.ndarray):
        """
        Add a batch of chunks and their embeddings to the store.

        Args:
            chunks:     list of Chunk dataclass instances
            embeddings: float32 numpy array of shape (N, EMBEDDING_DIM),
                        L2-normalised (encoder guarantees this)
        """
        if len(chunks) != embeddings.shape[0]:
            raise ValueError(
                f"chunks length ({len(chunks)}) != embeddings rows ({embeddings.shape[0]})"
            )

        with self._lock:
            self.index.add(embeddings)
            for chunk, vec in zip(chunks, embeddings):
                self.chunks.append(
                    {
                        "chunk_id": chunk.chunk_id,
                        "doc_id": chunk.doc_id,
                        "file_name": chunk.file_name,
                        "chunk_index": chunk.chunk_index,
                        "text": chunk.text,
                        # Store raw vector in memory so we can rebuild after deletion
                        "vector": vec.tolist(),
                    }
                )

    # ── Read ──────────────────────────────────────────────────────────────────

    def search(
        self,
        query_embedding: np.ndarray,
        top_k: int = 5,
        doc_ids: list[str] | None = None,
        score_threshold: float = 0.0,
    ) -> list[dict]:
        """
        Retrieve the top-k most similar chunks.

        Args:
            query_embedding:  float32 array of shape (1, EMBEDDING_DIM)
            top_k:            number of results to return (after filtering)
            doc_ids:          optional whitelist of doc_id strings to restrict search
            score_threshold:  minimum cosine similarity score to include a result

        Returns:
            list of dicts: {chunk_id, doc_id, file_name, chunk_index, text, score}
        """
        if self.index.ntotal == 0:
            return []

        # Over-fetch so we still get top_k results after metadata filtering
        fetch_k = min(top_k * 10, self.index.ntotal)
        scores, indices = self.index.search(query_embedding.astype("float32"), fetch_k)

        results: list[dict] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            if float(score) < score_threshold:
                continue
            chunk = self.chunks[idx]
            if doc_ids is not None and chunk["doc_id"] not in doc_ids:
                continue
            results.append(
                {
                    "chunk_id": chunk["chunk_id"],
                    "doc_id": chunk["doc_id"],
                    "file_name": chunk["file_name"],
                    "chunk_index": chunk["chunk_index"],
                    "text": chunk["text"],
                    "score": float(score),
                }
            )
            if len(results) >= top_k:
                break

        return results

    # ── Delete ────────────────────────────────────────────────────────────────

    def delete_by_doc_id(self, doc_id: str):
        """
        Remove all chunks belonging to doc_id and rebuild the FAISS index.

        FAISS IndexFlatIP has no native delete; we rebuild from the stored
        in-memory vectors of the remaining chunks.
        """
        with self._lock:
            remaining = [c for c in self.chunks if c["doc_id"] != doc_id]
            if len(remaining) == len(self.chunks):
                return  # nothing to delete

            new_index = faiss.IndexFlatIP(EMBEDDING_DIM)
            if remaining:
                vectors = np.array(
                    [c["vector"] for c in remaining], dtype="float32"
                )
                new_index.add(vectors)

            self.index = new_index
            self.chunks = remaining

    # ── Metadata helpers ──────────────────────────────────────────────────────

    def list_documents(self) -> list[dict]:
        """Return one entry per unique doc_id: {doc_id, file_name, chunk_count}."""
        seen: dict[str, dict] = {}
        for c in self.chunks:
            doc_id = c["doc_id"]
            if doc_id not in seen:
                seen[doc_id] = {
                    "doc_id": doc_id,
                    "file_name": c["file_name"],
                    "chunk_count": 0,
                }
            seen[doc_id]["chunk_count"] += 1
        return list(seen.values())

    def stats(self) -> dict:
        return {
            "total_chunks": self.index.ntotal,
            "total_documents": len(self.list_documents()),
            "index_size": self.index.ntotal,
        }

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _rebuild_index_from_chunks(self):
        """Rebuild FAISS index from vectors stored in self.chunks (recovery path)."""
        chunks_with_vectors = [c for c in self.chunks if "vector" in c]
        if not chunks_with_vectors:
            self.index = faiss.IndexFlatIP(EMBEDDING_DIM)
            self.chunks = []
            return

        vectors = np.array(
            [c["vector"] for c in chunks_with_vectors], dtype="float32"
        )
        new_index = faiss.IndexFlatIP(EMBEDDING_DIM)
        new_index.add(vectors)
        self.index = new_index
        self.chunks = chunks_with_vectors