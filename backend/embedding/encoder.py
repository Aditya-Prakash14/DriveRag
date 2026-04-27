"""
embedding/encoder.py
────────────────────
Generates embeddings using HashingVectorizer (fallback when OpenAI unavailable).
No API key needed, no segfault on macOS Python 3.13, no fitting required.

Uses sklearn HashingVectorizer with L2 normalization for cosine similarity via dot product.
"""
from __future__ import annotations

import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer

from config.settings import EMBEDDING_DIM

# HashingVectorizer: no fitting needed, fixed output dimensions, works with any vocabulary
_vectorizer = HashingVectorizer(
    n_features=EMBEDDING_DIM,
    stop_words=None,  # Don't remove words — short queries need all features
    lowercase=True,
    norm=None,  # We'll normalize manually for consistency
    alternate_sign=False,  # All-positive counts give better cosine similarity for short texts
    ngram_range=(1, 2),  # Include bigrams for better matching
)

print(f"[Embedding] Using HashingVectorizer ({EMBEDDING_DIM}d, bigrams) - no API key needed")


def _normalize(arr: np.ndarray) -> np.ndarray:
    """L2-normalise rows so cosine similarity == dot product."""
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return arr / norms


def embed_texts(
    texts: list[str],
    batch_size: int = 100,
    show_progress: bool = False,
) -> np.ndarray:
    """
    Encode a list of strings into normalised hash-based embeddings.

    Returns:
        float32 numpy array of shape (N, EMBEDDING_DIM)
    """
    if not texts:
        return np.empty((0, EMBEDDING_DIM), dtype="float32")

    if show_progress:
        print(f"[Embedding] Encoding {len(texts)} texts with HashingVectorizer")

    # Transform texts to hash matrix
    hash_matrix = _vectorizer.transform(texts)
    
    # Convert to dense array and normalize
    embeddings = hash_matrix.toarray().astype("float32")
    
    return _normalize(embeddings)


def embed_query(query: str) -> np.ndarray:
    """
    Encode a single query string.

    Returns:
        float32 numpy array of shape (1, EMBEDDING_DIM)
    """
    hash_matrix = _vectorizer.transform([query])
    embedding = hash_matrix.toarray().astype("float32")
    
    return _normalize(embedding)