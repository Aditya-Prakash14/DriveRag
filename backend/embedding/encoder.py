"""
embedding/encoder.py
────────────────────
Generates embeddings using HashingVectorizer.
No API key needed, no segfault on macOS Python 3.13, no fitting required.

Uses sklearn HashingVectorizer with L2 normalization for cosine similarity via dot product.
Features: bigrams, sublinear TF weighting (log1p), query expansion for short queries.
"""
from __future__ import annotations

import re
import numpy as np
from scipy.sparse import issparse
from sklearn.feature_extraction.text import HashingVectorizer

from config.settings import EMBEDDING_DIM

# HashingVectorizer: no fitting needed, fixed output dimensions, works with any vocabulary
_vectorizer = HashingVectorizer(
    n_features=EMBEDDING_DIM,
    stop_words=None,          # Don't remove words — short queries need all features
    lowercase=True,
    norm=None,                # We'll normalize manually for consistency
    alternate_sign=False,     # All-positive counts give better cosine similarity for short texts
    ngram_range=(1, 2),      # Unigrams + bigrams — trigrams too slow/sparse at this dim
)

print(f"[Embedding] Using HashingVectorizer ({EMBEDDING_DIM}d, bigrams) - no API key needed")


def _to_dense_normalized(matrix) -> np.ndarray:
    """
    Convert sparse/dense matrix → dense float32, apply sublinear TF (log1p),
    then L2-normalize rows so cosine similarity == dot product.
    """
    if issparse(matrix):
        # Apply log1p in-place on sparse data for speed
        matrix = matrix.copy()
        matrix.data = np.log1p(matrix.data)
        # Convert to dense
        arr = matrix.toarray().astype("float32")
    else:
        arr = np.asarray(matrix, dtype="float32")
        arr = np.log1p(arr)

    # L2-normalize rows
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return arr / norms


def _expand_query(query: str) -> str:
    """
    Expand short queries by repeating key terms to boost their weight
    in the sparse vector representation. This helps HashingVectorizer
    produce better similarity scores for brief user queries.
    """
    tokens = re.findall(r'\w+', query.lower())
    if len(tokens) <= 3:
        # For short queries, repeat key terms to boost their weight
        expanded = query
        for t in tokens:
            if len(t) > 2:  # Skip very short words
                expanded += f" {t}"
        return expanded
    return query


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

    # Transform texts to sparse hash matrix
    hash_matrix = _vectorizer.transform(texts)

    # Apply sublinear TF + normalize → dense float32
    return _to_dense_normalized(hash_matrix)


def embed_query(query: str) -> np.ndarray:
    """
    Encode a single query string with query expansion for better retrieval.

    Returns:
        float32 numpy array of shape (1, EMBEDDING_DIM)
    """
    expanded = _expand_query(query)
    hash_matrix = _vectorizer.transform([expanded])
    return _to_dense_normalized(hash_matrix)