"""
embedding/encoder.py
────────────────────
Generates embeddings using TF-IDF (fallback when OpenAI unavailable).
No API key needed, no segfault on macOS Python 3.13.

Uses sklearn TfidfVectorizer with fixed vocabulary for consistent dimensions.
"""
from __future__ import annotations

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from config.settings import EMBEDDING_DIM

# Fixed vocabulary for consistent dimensions
_vectorizer: TfidfVectorizer | None = None
_vocabulary_size = 1000  # Fixed vocabulary size

# Initialize vectorizer with limited features for consistent dimensions
_vectorizer = TfidfVectorizer(
    max_features=_vocabulary_size,
    stop_words='english',
    lowercase=True,
)

print(f"[Embedding] Using TF-IDF fallback ({_vocabulary_size}d) - no API key needed")

# We'll fit on first use, then transform
_is_fitted = False


def _normalize(arr: np.ndarray) -> np.ndarray:
    """L2-normalise rows so cosine similarity == dot product."""
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return arr / norms


def _ensure_fitted(texts: list[str]) -> None:
    """Fit the vectorizer if not already fitted."""
    global _is_fitted
    if not _is_fitted and texts:
        _vectorizer.fit(texts)
        _is_fitted = True


def fit_on_corpus(texts: list[str]) -> None:
    """
    Fit the vectorizer on a corpus of texts.
    Call this with all document chunks to ensure query embeddings use the same vocabulary.
    """
    global _is_fitted
    if texts:
        _vectorizer.fit(texts)
        _is_fitted = True
        print(f"[Embedding] Fitted TF-IDF vectorizer on {len(texts)} documents")


def embed_texts(
    texts: list[str],
    batch_size: int = 100,
    show_progress: bool = False,
) -> np.ndarray:
    """
    Encode a list of strings into normalised TF-IDF embeddings.

    Returns:
        float32 numpy array of shape (N, _vocabulary_size)
    """
    if not texts:
        return np.empty((0, _vocabulary_size), dtype="float32")

    _ensure_fitted(texts)

    if show_progress:
        print(f"[Embedding] Encoding {len(texts)} texts with TF-IDF")

    # Transform texts to TF-IDF matrix
    tfidf_matrix = _vectorizer.transform(texts)
    
    # Convert to dense array and normalize
    embeddings = tfidf_matrix.toarray().astype("float32")
    
    # Pad or truncate to match EMBEDDING_DIM
    if embeddings.shape[1] < EMBEDDING_DIM:
        # Pad with zeros
        padding = np.zeros((embeddings.shape[0], EMBEDDING_DIM - embeddings.shape[1]), dtype="float32")
        embeddings = np.hstack([embeddings, padding])
    elif embeddings.shape[1] > EMBEDDING_DIM:
        # Truncate
        embeddings = embeddings[:, :EMBEDDING_DIM]
    
    return _normalize(embeddings)


def embed_query(query: str) -> np.ndarray:
    """
    Encode a single query string.
    Note: Vectorizer must be fitted on document corpus first via fit_on_corpus().

    Returns:
        float32 numpy array of shape (1, EMBEDDING_DIM)
    """
    if not _is_fitted:
        raise ValueError("Vectorizer not fitted. Call fit_on_corpus() with document texts first.")

    tfidf_matrix = _vectorizer.transform([query])
    embedding = tfidf_matrix.toarray().astype("float32")
    
    # Pad or truncate to match EMBEDDING_DIM
    if embedding.shape[1] < EMBEDDING_DIM:
        padding = np.zeros((1, EMBEDDING_DIM - embedding.shape[1]), dtype="float32")
        embedding = np.hstack([embedding, padding])
    elif embedding.shape[1] > EMBEDDING_DIM:
        embedding = embedding[:, :EMBEDDING_DIM]
    
    return _normalize(embedding)