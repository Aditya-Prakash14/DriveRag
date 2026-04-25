"""
embedding/encoder.py
────────────────────
Generates sentence embeddings using OpenAI API.
Model: text-embedding-3-small (1536-dim)
Singleton pattern — client loaded once at startup.
"""
from __future__ import annotations

import numpy as np
from openai import OpenAI

from config.settings import OPENAI_API_KEY, EMBEDDING_DIM

_openai_client = None

if OPENAI_API_KEY:
    _openai_client = OpenAI(api_key=OPENAI_API_KEY)
    print("[Embedding] Using OpenAI embeddings (text-embedding-3-small)")
else:
    print("[Embedding] ERROR: OPENAI_API_KEY not set. Please add it to .env")
    raise ValueError("OPENAI_API_KEY is required for embeddings")


def embed_texts(texts: list[str], batch_size: int = 100, show_progress: bool = False) -> np.ndarray:
    """
    Encode a list of texts → numpy array of shape (N, EMBEDDING_DIM).
    Normalizes embeddings for cosine similarity via dot product.
    """
    if not _openai_client:
        raise ValueError("OpenAI client not initialized. Set OPENAI_API_KEY in .env")
    
    embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        if show_progress:
            print(f"[Embedding] Batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
        
        response = _openai_client.embeddings.create(
            input=batch,
            model="text-embedding-3-small"
        )
        batch_emb = np.array([item.embedding for item in response.data], dtype="float32")
        embeddings.append(batch_emb)
    
    result = np.vstack(embeddings)
    # Normalize for cosine similarity
    result = result / np.linalg.norm(result, axis=1, keepdims=True)
    return result


def embed_query(query: str) -> np.ndarray:
    """Encode a single query string → shape (1, EMBEDDING_DIM)."""
    if not _openai_client:
        raise ValueError("OpenAI client not initialized. Set OPENAI_API_KEY in .env")
    
    response = _openai_client.embeddings.create(
        input=query,
        model="text-embedding-3-small"
    )
    embedding = np.array([response.data[0].embedding], dtype="float32")
    # Normalize for cosine similarity
    embedding = embedding / np.linalg.norm(embedding, axis=1, keepdims=True)
    return embedding
