"""
config/settings.py
──────────────────
Central configuration loaded from .env.

Using SentenceTransformers (all-MiniLM-L6-v2, 384d) — no API key needed
for embeddings. OPENAI_API_KEY is only needed if you want GPT-generated
answers; the system falls back to extractive answers without it.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent.parent

# ── Google OAuth ──────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback"
)

GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
]

# ── Groq API (optional - for fast LLM-generated answers) ───────────────────────
# Get from https://console.groq.com/keys
# Leave empty to use extractive answers (no API key needed)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# ── LLM (optional) ────────────────────────────────────────────────────────────
# Model to use with Groq (e.g., llama3-8b-8192, mixtral-8x7b-32768)
LLM_MODEL = os.getenv("LLM_MODEL", "llama3-8b-8192")

# ── Embedding ─────────────────────────────────────────────────────────────────
# Model: TF-IDF (fallback, no API key needed, no segfault on macOS Python 3.13)
# EMBEDDING_DIM must match the model output AND the FAISS index dimension.
# If you change the model, delete data/faiss_index and data/chunks.json
# so the index is rebuilt at the correct dimension.
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "tfidf")
EMBEDDING_DIM = 1000  # TF-IDF vocabulary size

# ── Chunking ──────────────────────────────────────────────────────────────────
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

# ── Storage paths ─────────────────────────────────────────────────────────────
DATA_DIR = BASE_DIR / "data"
FAISS_INDEX_PATH = DATA_DIR / "faiss_index"
CHUNKS_DB_PATH = DATA_DIR / "chunks.json"
CREDENTIALS_DIR = DATA_DIR / "credentials"

DATA_DIR.mkdir(exist_ok=True)
CREDENTIALS_DIR.mkdir(exist_ok=True)

# ── LLM (optional) ────────────────────────────────────────────────────────────
# Without OPENAI_API_KEY the system returns extractive answers (top chunks).
# Add the key to .env to get GPT-3.5/4 generated answers instead.
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")

# ── CORS / Frontend ───────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Session ───────────────────────────────────────────────────────────────────
SESSION_SECRET = os.getenv("SESSION_SECRET", "change-me-in-production-please")