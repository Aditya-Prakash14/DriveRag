"""
config/settings.py
──────────────────
Central configuration loaded from .env.

Using HashingVectorizer (1000d) — no API key needed for embeddings.
GROQ_API_KEY is optional for LLM-generated answers;
the system falls back to extractive answers without it.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent.parent

# ── Environment ───────────────────────────────────────────────────────────────
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

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
# Model to use with Groq (e.g., llama-3.3-70b-versatile, llama3-70b-8192)
LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

# ── Embedding ─────────────────────────────────────────────────────────────────
# Model: HashingVectorizer (no API key needed, no segfault on macOS Python 3.13)
# EMBEDDING_DIM must match the model output AND the FAISS index dimension.
# If you change the model, delete data/faiss_index and data/chunks.json
# so the index is rebuilt at the correct dimension.
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "hashing")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "1024"))  # HashingVectorizer feature count — balances quality vs speed

# ── Chunking ──────────────────────────────────────────────────────────────────
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "800"))       # Larger chunks = more context per hit
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))  # 25% overlap preserves context across boundaries

# ── Storage paths ─────────────────────────────────────────────────────────────
DATA_DIR = BASE_DIR / "data"
FAISS_INDEX_PATH = DATA_DIR / "faiss_index"
CHUNKS_DB_PATH = DATA_DIR / "chunks.json"
CREDENTIALS_DIR = DATA_DIR / "credentials"

DATA_DIR.mkdir(exist_ok=True)
CREDENTIALS_DIR.mkdir(exist_ok=True)

# ── OpenAI API (optional - kept for backward compat) ─────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ── CORS / Frontend ───────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Session ───────────────────────────────────────────────────────────────────
SESSION_SECRET = os.getenv("SESSION_SECRET", "change-me-in-production-please")