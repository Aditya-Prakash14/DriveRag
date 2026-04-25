# DriveRAG — Chat with your Google Drive

A production-grade RAG (Retrieval-Augmented Generation) system that lets you ask natural language questions over your Google Drive documents.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│   Auth → Drive Picker → Sync Progress → Chat UI         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP + Session Cookie
┌────────────────────▼────────────────────────────────────┐
│                  FastAPI Backend                          │
│                                                          │
│  /auth/*          OAuth2 flow + session management       │
│  /drive/files     List supported Drive files             │
│  /sync-drive      Ingest pipeline (download→chunk→embed) │
│  /ask             RAG query endpoint                     │
│  /documents       List/delete indexed documents          │
└──────┬──────────────────┬────────────────────────────────┘
       │                  │
┌──────▼──────┐    ┌──────▼──────────────────────┐
│  Google     │    │        RAG Pipeline           │
│  Drive API  │    │                               │
│             │    │  1. SentenceTransformers      │
│  OAuth2     │    │     all-MiniLM-L6-v2 (384d)  │
│  Files API  │    │  2. FAISS IndexFlatIP         │
└─────────────┘    │     (cosine similarity)       │
                   │  3. LLM (OpenAI or extractive)│
                   └───────────────────────────────┘

Project layout:
  driverag/
  ├── main.py                  # Entry point
  ├── config/settings.py       # All config from .env
  ├── connectors/
  │   └── google_drive.py      # OAuth + Drive file ops
  ├── processing/
  │   ├── parser.py            # PDF / DOCX / TXT extraction
  │   └── chunker.py           # RecursiveCharacterTextSplitter
  ├── embedding/
  │   └── encoder.py           # SentenceTransformers wrapper
  ├── search/
  │   ├── vector_store.py      # FAISS store with persistence
  │   └── rag.py               # Full RAG pipeline
  ├── api/
  │   └── main.py              # FastAPI routes
  ├── frontend/
  │   └── App.jsx              # React frontend
  ├── data/                    # FAISS index + credentials (gitignored)
  ├── requirements.txt
  ├── Dockerfile
  └── docker-compose.yml
```

## Setup

### 1. Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a project → Enable **Google Drive API** + **Google People API**
3. Create **OAuth 2.0 Client ID** → Web Application
4. Add Authorized redirect URI: `http://localhost:8000/auth/callback`
5. Copy **Client ID** and **Client Secret**

### 2. Backend

```bash
cd driverag

# Create and activate venv
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
# Optionally set OPENAI_API_KEY for LLM-generated answers

# Start server
python main.py
# → http://localhost:8000
```

### 3. Frontend

Copy `frontend/App.jsx` into your Vite/CRA React project.

```bash
# New project with Vite
npm create vite@latest driverag-ui -- --template react
cd driverag-ui
cp /path/to/App.jsx src/App.jsx
npm run dev
# → http://localhost:5173
```

### 4. Docker (optional)

```bash
cp .env.example .env   # fill in credentials
docker-compose up --build
```

---

## API Reference

### `POST /sync-drive`
Ingest selected Drive files into the vector store.

**Request:**
```json
{
  "file_ids": ["1abc...", "2def..."],
  "incremental": true
}
```

**Response:**
```json
{
  "results": [
    { "file_id": "1abc", "file_name": "policy.pdf", "status": "done", "chunks": 23 }
  ],
  "new_chunks_added": 23,
  "store_stats": { "total_chunks": 23, "total_documents": 1, "index_size": 23 }
}
```

### `POST /ask`
RAG query over indexed documents.

**Request:**
```json
{
  "query": "What is our refund policy?",
  "top_k": 5,
  "doc_ids": null,
  "score_threshold": 0.15
}
```

**Response:**
```json
{
  "answer": "Customers may request a full refund within 30 days of purchase...",
  "sources": ["Refund & Returns SOP.pdf", "Company Policy 2024.pdf"],
  "chunks_used": 3,
  "total_chunks_searched": 150
}
```

---

## Sample Queries

After indexing a set of company documents:

| Query | Expected Source |
|-------|----------------|
| "What is our refund policy?" | Refund & Returns SOP |
| "How many PTO days do employees get?" | Employee Handbook |
| "What are our GDPR compliance requirements?" | Compliance Guidelines |
| "What is our SLA for enterprise clients?" | Service Agreement |

---

## Design Decisions

**Chunking:** `RecursiveCharacterTextSplitter` with 500-char chunks, 50-char overlap. Tries paragraph → sentence → word boundary separators in order, ensuring semantic coherence over arbitrary character slices.

**Embeddings:** `all-MiniLM-L6-v2` — best speed/quality tradeoff at 384 dimensions. Embeddings are L2-normalized so FAISS inner product equals cosine similarity.

**Vector Store:** FAISS `IndexFlatIP` (exact search). For >50k chunks, swap to `IndexIVFFlat` with `nlist=100` for faster approximate search.

**Incremental Sync:** Each file is hashed by Drive file ID. Re-syncing replaces old chunks by first removing the doc and re-inserting, preventing duplicates.

**LLM:** Optional — works without any API key using extractive answers. Add `OPENAI_API_KEY` to .env for GPT-3.5/4 generative answers.

**Auth:** Simple HMAC-signed session cookie. Credentials stored per-user in `data/credentials/`. Production should use a proper secrets store.

---

## Evaluation Checklist

| Criterion | Status |
|-----------|--------|
| Google Drive OAuth integration | ✅ |
| PDF + Docs + TXT extraction | ✅ |
| RecursiveCharacterTextSplitter chunking | ✅ |
| SentenceTransformers embeddings | ✅ |
| FAISS vector store with persistence | ✅ |
| POST /sync-drive | ✅ |
| POST /ask with sources | ✅ |
| Incremental sync | ✅ |
| Metadata filtering (doc_ids) | ✅ |
| Async pipeline (asyncio.to_thread) | ✅ |
| Docker support | ✅ |
| Clean API design | ✅ |
