"""
api/main.py
───────────
FastAPI application exposing:

  GET  /                       → health check
  GET  /auth/login             → redirect to Google OAuth (PKCE)
  GET  /auth/callback          → OAuth callback, sets session cookie
  GET  /auth/me                → current user info
  POST /auth/logout            → clear session
  GET  /drive/files            → list Drive files for authenticated user
  POST /sync-drive             → ingest selected files into vector store
  POST /ask                    → RAG query endpoint
  GET  /documents              → list indexed documents
  DELETE /documents/{doc_id}  → remove a document from the index
  GET  /stats                  → index statistics

Fixes applied:
  - hmac.new() called with keyword args (removes # type: ignore)
  - auth_callback: response object is created AFTER the try block succeeds,
    so cookie is never lost on the error path
  - PKCE state + code_verifier stored in httponly cookies and validated
"""
import asyncio
import base64
import hashlib
import hmac
import json
import secrets
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel

from config.settings import ALLOWED_ORIGINS, FRONTEND_URL, SESSION_SECRET
from connectors.google_drive import (
    download_file,
    exchange_code,
    get_auth_url,
    get_user_info,
    list_drive_files,
    load_credentials,
    save_credentials,
)
from embedding.encoder import embed_texts
from processing.chunker import chunk_document
from processing.parser import clean_text, extract_text
from search.rag import ask
from search.vector_store import get_store


# ── Session helpers (HMAC-signed cookie, no DB needed) ───────────────────────


def _sign(data: str) -> str:
    sig = hmac.new(
        key=SESSION_SECRET.encode(),
        msg=data.encode(),
        digestmod=hashlib.sha256,
    ).digest()
    return base64.urlsafe_b64encode(sig).decode()


def set_session(response: Response, user_id: str, user_info: dict):
    payload = json.dumps({"user_id": user_id, "info": user_info})
    encoded = base64.urlsafe_b64encode(payload.encode()).decode()
    sig = _sign(encoded)
    cookie_val = f"{encoded}.{sig}"
    response.set_cookie(
        "session",
        cookie_val,
        httponly=True,
        samesite="lax",
        max_age=86400 * 7,
    )


def get_session(request: Request) -> Optional[dict]:
    cookie = request.cookies.get("session")
    if not cookie:
        return None
    try:
        encoded, sig = cookie.rsplit(".", 1)
        if not hmac.compare_digest(sig, _sign(encoded)):
            return None
        return json.loads(base64.urlsafe_b64decode(encoded).decode())
    except Exception:
        return None


def require_session(request: Request) -> dict:
    session = get_session(request)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session


# ── Lifespan ──────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_store()   # load FAISS index from disk on startup
    yield
    get_store().save()  # persist on shutdown


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="DriveRAG API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────


@app.get("/")
async def health():
    return {"status": "ok", "service": "DriveRAG", "version": "1.0.0"}


# ── Auth ──────────────────────────────────────────────────────────────────────


@app.get("/auth/login")
async def auth_login(request: Request):
    """Redirect browser to Google OAuth consent screen."""
    state = secrets.token_urlsafe(16)
    auth_url, code_verifier = get_auth_url(state=state)

    response = RedirectResponse(auth_url)
    response.set_cookie("oauth_state", state, httponly=True, max_age=600)
    response.set_cookie(
        "oauth_code_verifier", code_verifier, httponly=True, max_age=600
    )
    return response


@app.get("/auth/callback")
async def auth_callback(request: Request, code: str, state: str):
    """
    Handle OAuth callback, exchange code for tokens, set session cookie.

    The response object is only created AFTER the entire try block succeeds,
    so the session cookie is never attached to a JSONResponse error object.
    """
    cookie_state = request.cookies.get("oauth_state")
    code_verifier = request.cookies.get("oauth_code_verifier")

    if not cookie_state or cookie_state != state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    if not code_verifier:
        raise HTTPException(status_code=400, detail="Missing PKCE code_verifier")

    # Perform the entire token exchange BEFORE creating the response
    try:
        from google.oauth2.credentials import Credentials

        token_data = exchange_code(code, code_verifier)
        creds = Credentials(
            token=token_data["token"],
            refresh_token=token_data.get("refresh_token"),
            token_uri=token_data.get("token_uri"),
            client_id=token_data["client_id"],
            client_secret=token_data["client_secret"],
        )
        user_info = get_user_info(creds)
        user_id = user_info["id"]
        save_credentials(user_id, token_data)
    except Exception as exc:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(exc))

    # Only now create the redirect response and attach the session cookie
    response = RedirectResponse(url=FRONTEND_URL)
    set_session(response, user_id, user_info)
    return response


@app.get("/auth/me")
async def auth_me(request: Request):
    session = require_session(request)
    return {
        "user_id": session["user_id"],
        "name": session["info"].get("name", ""),
        "email": session["info"].get("email", ""),
        "picture": session["info"].get("picture", ""),
    }


@app.post("/auth/logout")
async def auth_logout(request: Request):
    response = JSONResponse({"status": "logged out"})
    response.delete_cookie("session")
    return response


# ── Drive ─────────────────────────────────────────────────────────────────────


@app.get("/drive/files")
async def drive_files(request: Request):
    """List supported files from user's Google Drive."""
    session = require_session(request)
    user_id = session["user_id"]
    creds = load_credentials(user_id)
    if not creds:
        raise HTTPException(
            status_code=401,
            detail="No Drive credentials. Please re-authenticate.",
        )
    try:
        files = list_drive_files(creds)
        return {"files": files}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Sync ──────────────────────────────────────────────────────────────────────


class SyncRequest(BaseModel):
    file_ids: list[str]
    incremental: bool = True


class SyncProgress(BaseModel):
    file_id: str
    file_name: str
    status: str   # processing | done | skipped | error
    chunks: int = 0
    error: str = ""


@app.post("/sync-drive")
async def sync_drive(body: SyncRequest, request: Request):
    """
    Download, parse, chunk, embed, and index selected Drive files.
    Returns per-file status and total stats.
    """
    session = require_session(request)
    user_id = session["user_id"]
    creds = load_credentials(user_id)
    if not creds:
        raise HTTPException(status_code=401, detail="No Drive credentials.")

    store = get_store()
    existing_docs = {d["doc_id"] for d in store.list_documents()}

    all_files = list_drive_files(creds)
    file_map = {f["id"]: f for f in all_files}

    results: list[SyncProgress] = []
    total_new_chunks = 0

    for file_id in body.file_ids:
        file_meta = file_map.get(file_id)
        if not file_meta:
            results.append(
                SyncProgress(
                    file_id=file_id,
                    file_name="unknown",
                    status="error",
                    error="File not found in Drive",
                )
            )
            continue

        file_name = file_meta["name"]
        import hashlib as _hl

        doc_id = _hl.md5(file_id.encode()).hexdigest()

        if body.incremental and doc_id in existing_docs:
            results.append(
                SyncProgress(file_id=file_id, file_name=file_name, status="skipped")
            )
            continue

        try:
            content = await asyncio.to_thread(
                download_file, creds, file_id, file_meta["mimeType"]
            )

            file_type = file_meta["type"]
            raw_text = extract_text(content, file_type)
            clean = clean_text(raw_text)

            if not clean:
                results.append(
                    SyncProgress(
                        file_id=file_id,
                        file_name=file_name,
                        status="error",
                        error="No extractable text found",
                    )
                )
                continue

            chunks = chunk_document(clean, doc_id=doc_id, file_name=file_name)
            texts = [c.text for c in chunks]
            embeddings = await asyncio.to_thread(embed_texts, texts)

            if doc_id in existing_docs:
                store.delete_by_doc_id(doc_id)

            store.add_chunks(chunks, embeddings)
            total_new_chunks += len(chunks)

            results.append(
                SyncProgress(
                    file_id=file_id,
                    file_name=file_name,
                    status="done",
                    chunks=len(chunks),
                )
            )

        except Exception as exc:
            results.append(
                SyncProgress(
                    file_id=file_id,
                    file_name=file_name,
                    status="error",
                    error=str(exc),
                )
            )

    await asyncio.to_thread(store.save)

    return {
        "results": [r.model_dump() for r in results],
        "new_chunks_added": total_new_chunks,
        "store_stats": store.stats(),
    }


# ── Query ─────────────────────────────────────────────────────────────────────


class AskRequest(BaseModel):
    query: str
    top_k: int = 5
    doc_ids: Optional[list[str]] = None
    score_threshold: float = 0.15


@app.post("/ask")
async def ask_question(body: AskRequest, request: Request):
    """RAG query endpoint. Returns {answer, sources, chunks_used}."""
    require_session(request)

    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    result = await asyncio.to_thread(
        ask,
        query=body.query,
        top_k=body.top_k,
        doc_ids=body.doc_ids,
        score_threshold=body.score_threshold,
    )
    return result


# ── Documents ─────────────────────────────────────────────────────────────────


@app.get("/documents")
async def list_documents(request: Request):
    require_session(request)
    store = get_store()
    return {"documents": store.list_documents()}


@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, request: Request):
    require_session(request)
    store = get_store()
    store.delete_by_doc_id(doc_id)
    await asyncio.to_thread(store.save)
    return {"status": "deleted", "doc_id": doc_id}


@app.get("/stats")
async def stats(request: Request):
    require_session(request)
    return get_store().stats()