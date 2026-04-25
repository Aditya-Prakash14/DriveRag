"""
connectors/google_drive.py
──────────────────────────
Handles Google OAuth2 flow and Drive file listing/downloading.
Supports: PDF, Google Docs (exported as DOCX), plain TXT.
"""
import io
import json
from pathlib import Path
from typing import Optional

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from config.settings import (
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI, GOOGLE_SCOPES, CREDENTIALS_DIR
)

# ── OAuth helpers ────────────────────────────────────────────────────────────

def get_oauth_flow() -> Flow:
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [GOOGLE_REDIRECT_URI],
        }
    }
    flow = Flow.from_client_config(
        client_config,
        scopes=GOOGLE_SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI,
    )
    return flow


def get_auth_url(state: str) -> tuple[str, str]:
    """Return (auth_url, code_verifier) for PKCE."""
    flow = get_oauth_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return auth_url, flow.code_verifier


def exchange_code(code: str, code_verifier: str) -> dict:
    """Exchange auth code → token dict using PKCE code_verifier."""
    flow = get_oauth_flow()
    flow.fetch_token(code=code, code_verifier=code_verifier)
    creds = flow.credentials
    return {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes or []),
    }


def save_credentials(user_id: str, token_data: dict):
    path = CREDENTIALS_DIR / f"{user_id}.json"
    path.write_text(json.dumps(token_data))


def load_credentials(user_id: str) -> Optional[Credentials]:
    path = CREDENTIALS_DIR / f"{user_id}.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text())
    return Credentials(
        token=data["token"],
        refresh_token=data.get("refresh_token"),
        token_uri=data.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=data["client_id"],
        client_secret=data["client_secret"],
        scopes=data.get("scopes"),
    )


# ── Drive file operations ────────────────────────────────────────────────────

SUPPORTED_MIME_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.google-apps.document": "gdoc",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}


def list_drive_files(creds: Credentials, page_size: int = 100) -> list[dict]:
    """Return list of supported files from Drive."""
    service = build("drive", "v3", credentials=creds)
    mime_query = " or ".join(
        f"mimeType='{m}'" for m in SUPPORTED_MIME_TYPES
    )
    results = service.files().list(
        q=f"({mime_query}) and trashed=false",
        pageSize=page_size,
        fields="files(id, name, mimeType, size, modifiedTime)",
    ).execute()
    files = results.get("files", [])
    return [
        {
            "id": f["id"],
            "name": f["name"],
            "type": SUPPORTED_MIME_TYPES.get(f["mimeType"], "unknown"),
            "mimeType": f["mimeType"],
            "size": f.get("size", "—"),
            "modified": f.get("modifiedTime", "")[:10],
        }
        for f in files
        if f["mimeType"] in SUPPORTED_MIME_TYPES
    ]


def download_file(creds: Credentials, file_id: str, mime_type: str) -> bytes:
    """Download file bytes. Google Docs are exported as DOCX."""
    service = build("drive", "v3", credentials=creds)

    if mime_type == "application/vnd.google-apps.document":
        # Export Google Doc as DOCX
        request = service.files().export_media(
            fileId=file_id,
            mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    else:
        request = service.files().get_media(fileId=file_id)

    buffer = io.BytesIO()
    downloader = MediaIoBaseDownload(buffer, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    return buffer.getvalue()


def get_user_info(creds: Credentials) -> dict:
    """Fetch basic profile info."""
    service = build("oauth2", "v2", credentials=creds)
    return service.userinfo().get().execute()
