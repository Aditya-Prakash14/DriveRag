export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { width: 100%; height: 100%; }

  :root {
    --bg: #ffffff;
    --surface: #ffffff;
    --surface2: #f7f7f8;
    --surface3: #ececf1;
    --border: #d9d9e3;
    --border2: #c5c5d2;
    --text: #0d0d0d;
    --text2: #6e6e80;
    --text3: #9b9b9b;
    --accent: #10a37f;
    --accent2: #0d8a6a;
    --accent-glow: rgba(16,163,127,0.1);
    --green: #10a37f;
    --amber: #f59e0b;
    --red: #ef4444;
    --radius: 8px;
    --font-display: 'Inter', sans-serif;
    --font-body: 'Inter', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); width: 100%; height: 100%; overflow: hidden; -webkit-font-smoothing: antialiased; }

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
    font-size: 24px; font-weight: 600;
    line-height: 1.3;
    margin-bottom: 8px;
    color: var(--text);
  }

  .auth-sub { color: var(--text2); font-size: 14px; line-height: 1.5; margin-bottom: 32px; }

  .btn-google {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: white; color: var(--text);
    border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px 16px;
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-google:hover { background: var(--surface2); border-color: var(--border2); }
  .btn-google:active { background: var(--surface3); }

  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
  .auth-divider-text { color: var(--text3); font-size: 12px; }

  .auth-features { display: flex; flex-direction: column; gap: 12px; }
  .auth-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text2); }
  .auth-feature-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

  /* ── Drive Picker ── */
  .picker-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .topbar-brand { display: flex; align-items: center; gap: 8px; }
  .topbar-logo { width: 24px; height: 24px; background: var(--accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 600; font-size: 12px; color: white; }
  .topbar-name { font-family: var(--font-display); font-weight: 600; font-size: 15px; color: var(--text); }

  .topbar-user { display: flex; align-items: center; gap: 8px; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; color: white; }
  .avatar-name { font-size: 13px; color: var(--text2); }

  .picker-body {
    flex: 1;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 24px;
    overflow-y: auto;
  }
  .picker-body::-webkit-scrollbar { width: 6px; }
  .picker-body::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }
  .picker-body::-webkit-scrollbar-thumb:hover { background: var(--border2); }

  .picker-header { margin-bottom: 24px; }
  .picker-header h1 { font-family: var(--font-display); font-size: 22px; font-weight: 600; margin-bottom: 6px; color: var(--text); }
  .picker-header p { color: var(--text2); font-size: 14px; }

  .drive-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }

  .drive-search {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
    width: 280px;
  }

  .drive-search input {
    background: none; border: none; outline: none;
    color: var(--text); font-family: var(--font-body); font-size: 14px;
    width: 100%;
  }
  .drive-search input::placeholder { color: var(--text3); }

  .drive-actions { display: flex; gap: 8px; }

  .btn-secondary {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); border-radius: var(--radius);
    padding: 8px 12px; font-family: var(--font-body); font-size: 13px;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-secondary:hover { background: var(--surface3); border-color: var(--border2); }

  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    background: var(--accent); border: none;
    color: white; border-radius: var(--radius);
    padding: 8px 16px; font-family: var(--font-body); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-primary:hover { background: var(--accent2); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
    margin-bottom: 24px;
  }

  .file-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }
  .file-card:hover { border-color: var(--border2); background: var(--surface2); }
  .file-card.selected { border-color: var(--accent); background: rgba(16,163,127,0.05); }

  .file-card-check {
    position: absolute; top: 8px; right: 8px;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: scale(0.6);
    transition: all 0.2s;
  }
  .file-card.selected .file-card-check { opacity: 1; transform: scale(1); }

  .file-type-badge {
    display: inline-flex; align-items: center;
    padding: 2px 6px; border-radius: 4px;
    font-size: 10px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .badge-pdf { background: rgba(239,68,68,0.1); color: #ef4444; }
  .badge-doc { background: rgba(66,133,244,0.1); color: #3b82f6; }
  .badge-txt { background: rgba(100,100,120,0.1); color: var(--text2); }

  .file-name { font-size: 13px; font-weight: 500; line-height: 1.4; margin-bottom: 4px; color: var(--text); }
  .file-meta { font-size: 11px; color: var(--text3); }

  .picker-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .selected-count { font-size: 13px; color: var(--text2); }
  .selected-count strong { color: var(--text); }

  /* ── Chat Screen ── */
  .chat-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-topbar {
    height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .chat-topbar-left { display: flex; align-items: center; gap: 12px; }
  .topbar-back { background: none; border: 1px solid var(--border); color: var(--text2); border-radius: var(--radius); padding: 6px 10px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: var(--font-body); transition: all 0.15s; }
  .topbar-back:hover { border-color: var(--border2); color: var(--text); }

  .chat-context-pill {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 20px; padding: 4px 10px 4px 6px;
    font-size: 12px; color: var(--text2);
  }
  .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

  .chat-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .chat-sidebar {
    width: 260px;
    border-right: 1px solid var(--border);
    background: var(--surface);
    display: flex; flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }

  .sidebar-section { padding: 16px; }
  .sidebar-label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }

  .sidebar-file {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: var(--radius);
    font-size: 13px; color: var(--text2);
    transition: background 0.12s;
    cursor: default;
  }
  .sidebar-file:hover { background: var(--surface2); }

  .sidebar-divider { height: 1px; background: var(--border); margin: 0 16px; }

  .sidebar-hints { padding: 16px; flex: 1; overflow-y: auto; }
  .hint-label { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }

  .hint-chip {
    display: block; width: 100%;
    text-align: left;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 8px 10px;
    font-size: 13px; color: var(--text2); font-family: var(--font-body);
    cursor: pointer; margin-bottom: 6px;
    transition: all 0.15s; line-height: 1.4;
  }
  .hint-chip:hover { border-color: var(--accent); color: var(--text); background: rgba(16,163,127,0.05); }

  /* ── Messages ── */
  .chat-main {
    flex: 1;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px 24px 24px 32px;
    display: flex; flex-direction: column; gap: 24px;
    scroll-behavior: smooth;
  }

  .messages-area::-webkit-scrollbar { width: 6px; }
  .messages-area::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }
  .messages-area::-webkit-scrollbar-thumb:hover { background: var(--border2); }

  .msg {
    display: flex; gap: 16px;
    animation: msgIn 0.3s ease-out;
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  .msg.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 12px; font-weight: 600;
  }
  .msg-avatar.ai {
    background: var(--accent);
    color: white; font-family: var(--font-display);
  }
  .msg-avatar.user-av {
    background: var(--text2);
    color: white;
  }

  .msg-body { max-width: 700px; flex: 1; }

  .msg-bubble {
    padding: 0;
    font-size: 15px; line-height: 1.6;
    color: var(--text);
  }
  .msg.ai .msg-bubble {
    color: var(--text);
  }
  .msg.user .msg-bubble {
    color: var(--text);
  }

  .msg-bubble strong { font-weight: 600; }
  .msg-bubble code { background: var(--surface2); border-radius: 4px; padding: 2px 6px; font-size: 13px; font-family: monospace; }

  .msg-sources {
    margin-top: 12px;
    display: flex; flex-wrap: wrap; gap: 6px;
  }

  .source-chip {
    display: flex; align-items: center; gap: 5px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 20px; padding: 4px 10px;
    font-size: 12px; color: var(--text2);
  }
  .source-chip:hover { border-color: var(--accent); color: var(--accent); }

  .typing-indicator {
    display: flex; align-items: center; gap: 4px;
    padding: 12px 16px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--radius);
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

  /* ── Input ── */
  .chat-input-area {
    padding: 16px 24px 20px 32px;
    border-top: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .chat-input-box {
    display: flex; align-items: flex-end; gap: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 12px 12px 16px;
    transition: border-color 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .chat-input-box:focus-within { border-color: var(--border2); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

  .chat-textarea {
    flex: 1; background: none; border: none; outline: none;
    color: var(--text); font-family: var(--font-body); font-size: 15px;
    resize: none; line-height: 1.5; max-height: 200px;
    min-height: 24px;
  }
  .chat-textarea::placeholder { color: var(--text3); }

  .send-btn {
    width: 32px; height: 32px; border-radius: var(--radius);
    background: var(--accent); border: none; color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;
  }
  .send-btn:hover { background: var(--accent2); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .chat-input-hint { text-align: center; font-size: 11px; color: var(--text3); margin-top: 8px; }

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

  .sync-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
  .sync-sub { font-size: 13px; color: var(--text2); line-height: 1.5; }

  .sync-progress { margin-top: 20px; }
  .sync-bar-bg { height: 4px; background: var(--surface3); border-radius: 2px; overflow: hidden; }
  .sync-bar-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s ease; }
  .sync-step { font-size: 12px; color: var(--text3); margin-top: 8px; }

  /* Empty state */
  .empty-state {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px; text-align: center; gap: 12px;
  }
  .empty-state-icon { font-size: 36px; margin-bottom: 8px; opacity: 0.4; }
  .empty-state h3 { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--text); }
  .empty-state p { font-size: 13px; color: var(--text2); max-width: 320px; line-height: 1.6; }
`;
