export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { width: 100%; height: 100%; }

  :root {
    --bg: #ffffff;
    --surface: #ffffff;
    --surface2: #f9f9f9;
    --surface3: #f0f0f0;
    --border: #d1d5db;
    --border2: #9ca3af;
    --text: #111827;
    --text2: #374151;
    --text3: #6b7280;
    --accent: #10a37f;
    --accent2: #059669;
    --accent-glow: rgba(16,163,127,0.15);
    --green: #10a37f;
    --amber: #f59e0b;
    --red: #ef4444;
    --radius: 8px;
    --font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --gdrive-blue: #1a73e8;
    --gdrive-bg: #f8f9fa;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); width: 100%; height: 100%; overflow: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }

  #root { width: 100%; height: 100%; }

  .app { width: 100%; height: 100%; display: flex; flex-direction: column; }

  /* ── Auth Screen ── */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
  }

  .auth-card {
    width: 400px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 40px;
    animation: cardIn 0.4s ease-out;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: none; }
  }

  .auth-logo {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 32px;
  }

  .auth-logo-mark {
    width: 36px; height: 36px;
    background: var(--accent);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-weight: 700; font-size: 16px; color: white;
  }

  .auth-logo-text { font-family: var(--font-display); font-weight: 600; font-size: 18px; color: var(--text); }

  .auth-headline {
    font-family: var(--font-display);
    font-size: 28px; font-weight: 800;
    line-height: 1.2;
    margin-bottom: 8px;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  .auth-sub { color: var(--text2); font-size: 16px; font-weight: 500; line-height: 1.6; margin-bottom: 32px; }

  .btn-google {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: white; color: var(--text);
    border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px 18px;
    font-family: var(--font-body); font-size: 15px; font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-google:hover { background: var(--surface2); border-color: var(--border2); }
  .btn-google:active { background: var(--surface3); }

  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
  .auth-divider-text { color: var(--text3); font-size: 12px; }

  .auth-features { display: flex; flex-direction: column; gap: 12px; }
  .auth-feature { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--text2); }
  .auth-feature-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

  /* ═══════════════════════════════════════════════════════════════════════════
     GOOGLE DRIVE STYLE PICKER
     ═══════════════════════════════════════════════════════════════════════════ */

  .picker-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Drive Top Bar ── */
  .drive-topbar {
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .drive-topbar-left {
    display: flex; align-items: center; gap: 12px; flex: 1;
  }

  .drive-topbar-title {
    font-size: 24px; font-weight: 700; color: var(--text);
    font-family: 'Google Sans', 'Inter', sans-serif;
    margin-right: 8px;
    letter-spacing: -0.01em;
  }

  .drive-search-bar {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0 16px;
    height: 46px;
    max-width: 720px;
    flex: 1;
    transition: all 0.2s;
  }
  .drive-search-bar:focus-within {
    background: var(--surface);
    border-color: var(--gdrive-blue);
    box-shadow: 0 2px 8px rgba(26,115,232,0.15);
  }

  .drive-search-bar input {
    background: none; border: none; outline: none;
    color: var(--text); font-family: var(--font-body); font-size: 16px; font-weight: 500;
    width: 100%;
  }
  .drive-search-bar input::placeholder { color: var(--text3); }

  .drive-search-clear {
    background: none; border: none; cursor: pointer; padding: 4px;
    display: flex; align-items: center; justify-content: center;
  }

  .drive-topbar-right {
    display: flex; align-items: center; gap: 12px;
  }

  .drive-user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--gdrive-blue);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 500; color: white;
    cursor: pointer;
  }

  /* ── Drive Layout ── */
  .drive-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* ── Drive Left Sidebar ── */
  .drive-sidebar {
    width: 256px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 12px 0;
    flex-shrink: 0;
    overflow-y: auto;
  }

  .drive-sidebar-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 24px;
    font-size: 15px; font-weight: 500; color: var(--text2);
    background: none; border: none; border-radius: 0 20px 20px 0;
    cursor: pointer; width: 100%; text-align: left;
    transition: background 0.15s;
    font-family: var(--font-body);
  }
  .drive-sidebar-item:hover { background: var(--surface2); }
  .drive-sidebar-item.active { background: #e8f0fe; color: var(--gdrive-blue); font-weight: 700; }

  .drive-sidebar-divider {
    height: 1px; background: var(--border);
    margin: 12px 24px;
  }

  .drive-sidebar-section {
    padding: 8px 24px;
  }

  .drive-sidebar-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--text3); margin-bottom: 4px;
  }

  .drive-sidebar-count {
    font-size: 14px; font-weight: 600; color: var(--text2);
  }

  .drive-sidebar-signout {
    display: flex; align-items: center; gap: 12px;
    padding: 8px 24px;
    font-size: 13px; color: var(--text3);
    background: none; border: none;
    cursor: pointer; width: 100%; text-align: left;
    transition: color 0.15s;
    font-family: var(--font-body);
  }
  .drive-sidebar-signout:hover { color: var(--text); }

  /* ── Drive Main Content ── */
  .drive-main {
    flex: 1;
    display: flex; flex-direction: column;
    overflow: hidden;
    background: var(--surface);
  }

  .drive-loading {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--text2); font-size: 14px;
  }

  /* ── Drive Content Toolbar ── */
  .drive-content-toolbar {
    display: flex; align-items: center; gap: 12px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .drive-checkbox-all {
    background: none; border: none; cursor: pointer; padding: 4px;
    display: flex; align-items: center; justify-content: center;
  }

  .drive-checkbox {
    width: 18px; height: 18px; border-radius: 4px;
    border: 2px solid var(--border2);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .drive-checkbox.checked {
    background: var(--gdrive-blue);
    border-color: var(--gdrive-blue);
  }

  .drive-toolbar-label {
    font-size: 14px; font-weight: 700; color: var(--text);
    flex: 1;
  }

  .drive-sync-btn {
    border-radius: 20px;
    padding: 8px 20px;
  }

  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    background: var(--gdrive-blue); border: none;
    color: white; border-radius: var(--radius);
    padding: 8px 16px; font-family: var(--font-body); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-primary:hover { background: #1557b0; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Drive File List ── */
  .drive-file-list {
    flex: 1;
    overflow-y: auto;
  }
  .drive-file-list::-webkit-scrollbar { width: 8px; }
  .drive-file-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  .drive-file-list::-webkit-scrollbar-thumb:hover { background: var(--border2); }

  .drive-file-row {
    display: flex; align-items: center; gap: 12px;
    padding: 8px 16px;
    border-bottom: 1px solid transparent;
    cursor: pointer;
    transition: all 0.1s;
    min-height: 48px;
  }
  .drive-file-row:hover { background: var(--surface2); }
  .drive-file-row.selected { background: #e8f0fe; }

  .drive-file-checkbox {
    display: flex; align-items: center; justify-content: center;
    width: 24px; flex-shrink: 0;
  }

  .drive-file-icon {
    width: 24px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  .drive-file-name {
    flex: 1; font-size: 15px; font-weight: 600; color: var(--text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .drive-file-meta {
    font-size: 14px; font-weight: 500; color: var(--text3);
    width: 120px; text-align: right; flex-shrink: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CHATGPT STYLE CHAT
     ═══════════════════════════════════════════════════════════════════════════ */

  .chat-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface);
  }

  /* ── ChatGPT Top Bar ── */
  .chatgpt-topbar {
    height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .chatgpt-topbar-left {
    display: flex; align-items: center; gap: 8px;
  }

  .chatgpt-back-btn {
    background: none; border: none; color: var(--text2);
    cursor: pointer; padding: 6px; border-radius: var(--radius);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .chatgpt-back-btn:hover { background: var(--surface2); color: var(--text); }

  .chatgpt-model-label {
    display: flex; align-items: center; gap: 8px;
    font-weight: 800; font-size: 18px; color: var(--text);
    letter-spacing: -0.01em;
  }

  .chatgpt-logo {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: white;
  }

  .chatgpt-context-pill {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 20px; padding: 5px 12px 5px 8px;
    font-size: 13px; font-weight: 600; color: var(--text2);
  }
  .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

  .chatgpt-topbar-right {
    display: flex; align-items: center; gap: 8px;
  }

  .chatgpt-user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #5f6368;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 500; color: white;
  }

  /* ── ChatGPT Main Area ── */
  .chatgpt-main {
    flex: 1;
    display: flex; flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  /* ── Messages ── */
  .chatgpt-messages {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    scroll-behavior: smooth;
  }
  .chatgpt-messages::-webkit-scrollbar { width: 6px; }
  .chatgpt-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .chatgpt-messages::-webkit-scrollbar-thumb:hover { background: var(--border2); }

  .chatgpt-msg {
    padding: 24px 0;
    animation: msgIn 0.3s ease-out;
  }
  .chatgpt-msg.user {
    background: transparent;
  }
  .chatgpt-msg.ai {
    background: transparent;
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  .chatgpt-msg-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 12px; font-weight: 600;
    vertical-align: middle;
    margin-right: 8px;
  }
  .chatgpt-msg-avatar.ai {
    background: var(--accent);
    color: white;
  }
  .chatgpt-msg-avatar.user {
    background: #5f6368;
    color: white;
  }

  .chatgpt-msg-content {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .chatgpt-msg-role {
    font-size: 15px; font-weight: 700; color: var(--text);
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 4px;
  }

  .chatgpt-msg-text {
    font-size: 17px; line-height: 1.8;
    color: var(--text);
    font-weight: 500;
  }
  .chatgpt-msg-text strong { font-weight: 800; }
  .chatgpt-msg-text code { background: var(--surface2); border-radius: 4px; padding: 2px 6px; font-size: 13px; font-family: 'Menlo', 'Monaco', monospace; }
  .chatgpt-msg-text p { margin-bottom: 12px; }
  .chatgpt-msg-text p:last-child { margin-bottom: 0; }

  .chatgpt-sources {
    margin-top: 16px;
    display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  }

  .chatgpt-sources-label {
    font-size: 12px; font-weight: 500; color: var(--text3);
  }

  .chatgpt-source-chip {
    display: flex; align-items: center; gap: 5px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 20px; padding: 5px 12px;
    font-size: 13px; font-weight: 600; color: var(--text2);
    cursor: pointer; transition: all 0.15s;
  }
  .chatgpt-source-chip:hover { border-color: var(--accent); color: var(--accent); }

  .typing-indicator {
    display: flex; align-items: center; gap: 4px;
    padding: 4px 0;
  }
  .typing-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--text3);
    animation: bounce 1.2s ease infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-4px); background: var(--accent); }
  }

  /* ── ChatGPT Input Area ── */
  .chatgpt-input-area {
    padding: 0 24px 24px;
    flex-shrink: 0;
    max-width: 748px;
    width: 100%;
    margin: 0 auto;
  }

  .chatgpt-hints {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 16px;
    justify-content: center;
  }

  .chatgpt-hint-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 10px 18px;
    font-size: 14px; font-weight: 600; color: var(--text2);
    cursor: pointer; transition: all 0.15s;
    font-family: var(--font-body);
  }
  .chatgpt-hint-btn:hover { border-color: var(--border2); color: var(--text); background: var(--surface2); }

  .chatgpt-input-box {
    display: flex; align-items: flex-end; gap: 0;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 8px 8px 8px 20px;
    transition: border-color 0.2s;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  }
  .chatgpt-input-box:focus-within {
    border-color: var(--border2);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .chatgpt-textarea {
    flex: 1; background: none; border: none; outline: none;
    color: var(--text); font-family: var(--font-body); font-size: 17px; font-weight: 500;
    resize: none; line-height: 1.6; max-height: 200px;
    min-height: 24px; padding: 8px 0;
  }
  .chatgpt-textarea::placeholder { color: var(--text3); font-weight: 400; }

  .chatgpt-send-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--accent); border: none; color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;
  }
  .chatgpt-send-btn:hover { background: var(--accent2); }
  .chatgpt-send-btn:disabled { background: var(--surface3); cursor: not-allowed; }

  .chatgpt-input-hint {
    text-align: center; font-size: 13px; font-weight: 500; color: var(--text3);
    margin-top: 8px;
  }

  /* ── Sync overlay ── */
  .sync-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50;
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sync-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px 40px;
    text-align: center;
    width: 320px;
    animation: cardIn 0.3s ease-out;
  }

  .sync-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--surface3);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
    margin: 0 auto 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .sync-title { font-family: var(--font-display); font-size: 18px; font-weight: 800; margin-bottom: 8px; color: var(--text); }
  .sync-sub { font-size: 14px; font-weight: 500; color: var(--text2); line-height: 1.5; }

  .sync-progress { margin-top: 20px; }
  .sync-bar-bg { height: 4px; background: var(--surface3); border-radius: 2px; overflow: hidden; }
  .sync-bar-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s ease; }
  .sync-step { font-size: 12px; color: var(--text3); margin-top: 8px; }

  /* Empty state */
  .empty-state {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px; text-align: center; gap: 12px;
  }
  .empty-state-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .empty-state h3 { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text); }
  .empty-state p { font-size: 15px; font-weight: 500; color: var(--text2); max-width: 320px; line-height: 1.6; }
`;
