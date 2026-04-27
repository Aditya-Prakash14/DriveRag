// ─── API client — all requests include credentials for session cookies ────────

const BASE = "";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (res.status === 401) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function authLoginUrl() {
  return "/auth/login";
}

export function getMe() {
  return request("/auth/me");
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

// ── Drive ─────────────────────────────────────────────────────────────────────

export function listDriveFiles() {
  return request("/drive/files");
}

// ── Sync ──────────────────────────────────────────────────────────────────────

export function syncDrive(fileIds, incremental = true) {
  return request("/sync-drive", {
    method: "POST",
    body: JSON.stringify({ file_ids: fileIds, incremental }),
  });
}

// ── RAG Query ─────────────────────────────────────────────────────────────────

export function askQuestion(query, { topK = 5, docIds = null, scoreThreshold = 0.01 } = {}) {
  return request("/ask", {
    method: "POST",
    body: JSON.stringify({
      query,
      top_k: topK,
      doc_ids: docIds,
      score_threshold: scoreThreshold,
    }),
  });
}

// ── Documents ─────────────────────────────────────────────────────────────────

export function listDocuments() {
  return request("/documents");
}

export function deleteDocument(docId) {
  return request(`/documents/${docId}`, { method: "DELETE" });
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getStats() {
  return request("/stats");
}
