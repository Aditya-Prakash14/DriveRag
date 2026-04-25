export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { width: 100%; height: 100%; }

  :root {
    --bg: #ffffff;
    --surface: #ffffff;
    --surface2: #f5f5f5;
    --surface3: #ececec;
    --border: rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.12);
    --text: #1a1a1a;
    --text2: #666666;
    --text3: #999999;
    --accent: #6c63ff;
    --accent2: #8b84ff;
    --accent-glow: rgba(108,99,255,0.15);
    --green: #22c55e;
    --amber: #f59e0b;
    --red: #ef4444;
    --radius: 14px;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); width: 100%; height: 100%; overflow: hidden; }

  #root { width: 100%; height: 100%; }

  .app { width: 100%; height: 100%; display: flex; flex-direction: column; }

  /* ── Auth Screen ── */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .auth-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.08) 0%, transparent 70%),
                radial-gradient(ellipse 60% 40% at 80% 80%, rgba(34,197,94,0.06) 0%, transparent 60%);
  }

  .auth-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
  }

  .auth-card {
    position: relative;
    width: 420px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 24px;
    padding: 48px 40px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.08);
    animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1);
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to { opacity: 1; transform: none; }
  }

  .auth-logo {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 32px;
  }

  .auth-logo-mark {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-weight: 800; font-size: 18px; color: white;
    box-shadow: 0 4px 20px var(--accent-glow);
  }

  .auth-logo-text { font-family: var(--font-display); font-weight: 700; font-size: 20px; }

  .auth-headline {
    font-family: var(--font-display);
    font-size: 28px; font-weight: 800;
    line-height: 1.15;
    margin-bottom: 10px;
    color: #1a1a1a;
  }

  .auth-sub { color: var(--text2); font-size: 14px; line-height: 1.6; margin-bottom: 36px; }

  .btn-google {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: white; color: #1a1a2e;
    border: 1px solid #ddd; border-radius: 12px;
    padding: 14px 20px;
    font-family: var(--font-body); font-size: 15px; font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .btn-google:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .btn-google:active { transform: none; }

  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
  .auth-divider-text { color: var(--text3); font-size: 12px; }

  .auth-features { display: flex; flex-direction: column; gap: 10px; }
  .auth-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text2); }
  .auth-feature-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

  /* ── Drive Picker ── */
  .picker-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .topbar-brand { display: flex; align-items: center; gap: 8px; }
  .topbar-logo { width: 28px; height: 28px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 13px; color: white; }
  .topbar-name { font-family: var(--font-display); font-weight: 700; font-size: 16px; }

  .topbar-user { display: flex; align-items: center; gap: 8px; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), #22c55e); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; }
  .avatar-name { font-size: 13px; color: var(--text2); }

  .picker-body {
    flex: 1;
    max-width: 860px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 24px;
    overflow-y: auto;
  }
  .picker-body::-webkit-scrollbar { width: 6px; }
  .picker-body::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }
  .picker-body::-webkit-scrollbar-thumb:hover { background: var(--border2); }

  .picker-header { margin-bottom: 32px; }
  .picker-header h1 { font-family: var(--font-display); font-size: 26px; font-weight: 800; margin-bottom: 6px; }
  .picker-header p { color: var(--text2); font-size: 14px; }

  .drive-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }

  .drive-search {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 14px;
    width: 260px;
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
    background: var(--surface2); border: 1px solid var(--border2);
    color: var(--text); border-radius: 10px;
    padding: 8px 14px; font-family: var(--font-body); font-size: 13px;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-secondary:hover { background: var(--surface3); border-color: var(--border2); }

  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    background: var(--accent); border: none;
    color: white; border-radius: 10px;
    padding: 8px 18px; font-family: var(--font-body); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 16px var(--accent-glow);
  }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 28px;
  }

  .file-card {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.18s;
    position: relative;
  }
  .file-card:hover { border-color: var(--border2); background: var(--surface3); }
  .file-card.selected { border-color: var(--accent); background: rgba(108,99,255,0.08); }

  .file-card-check {
    position: absolute; top: 10px; right: 10px;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: scale(0.6);
    transition: all 0.2s;
  }
  .file-card.selected .file-card-check { opacity: 1; transform: scale(1); }

  .file-type-badge {
    display: inline-flex; align-items: center;
    padding: 3px 8px; border-radius: 6px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
    margin-bottom: 10px;
  }
  .badge-pdf { background: rgba(239,68,68,0.15); color: #f87171; }
  .badge-doc { background: rgba(66,133,244,0.15); color: #60a5fa; }
  .badge-txt { background: rgba(100,100,120,0.2); color: var(--text2); }

  .file-name { font-size: 13px; font-weight: 500; line-height: 1.4; margin-bottom: 6px; }
  .file-meta { font-size: 11px; color: var(--text3); }

  .picker-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 14px;
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
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .chat-topbar-left { display: flex; align-items: center; gap: 12px; }
  .topbar-back { background: none; border: 1px solid var(--border); color: var(--text2); border-radius: 8px; padding: 5px 10px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: var(--font-body); transition: all 0.15s; }
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
    width: 240px;
    border-right: 1px solid var(--border);
    background: var(--surface);
    display: flex; flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }

  .sidebar-section { padding: 16px; }
  .sidebar-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }

  .sidebar-file {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 8px; border-radius: 8px;
    font-size: 12px; color: var(--text2);
    transition: background 0.12s;
    cursor: default;
  }
  .sidebar-file:hover { background: var(--surface2); }

  .sidebar-divider { height: 1px; background: var(--border); margin: 0 16px; }

  .sidebar-hints { padding: 16px; flex: 1; overflow-y: auto; }
  .hint-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }

  .hint-chip {
    display: block; width: 100%;
    text-align: left;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 10px;
    font-size: 12px; color: var(--text2); font-family: var(--font-body);
    cursor: pointer; margin-bottom: 6px;
    transition: all 0.15s; line-height: 1.4;
  }
  .hint-chip:hover { border-color: var(--accent); color: var(--text); background: rgba(108,99,255,0.06); }

  /* ── Messages ── */
  .chat-main {
    flex: 1;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px;
    display: flex; flex-direction: column; gap: 20px;
    scroll-behavior: smooth;
  }

  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 2px; }

  .msg {
    display: flex; gap: 12px;
    animation: msgIn 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: none; }
  }

  .msg.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 13px; font-weight: 600;
  }
  .msg-avatar.ai {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; font-family: var(--font-display);
  }
  .msg-avatar.user-av {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
  }

  .msg-body { max-width: 640px; }

  .msg-bubble {
    padding: 12px 16px; border-radius: 14px;
    font-size: 14px; line-height: 1.65;
  }
  .msg.ai .msg-bubble {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 4px 14px 14px 14px;
    color: var(--text);
  }
  .msg.user .msg-bubble {
    background: var(--accent);
    border-radius: 14px 4px 14px 14px;
    color: white;
  }

  .msg-bubble strong { font-weight: 600; }
  .msg-bubble code { background: rgba(255,255,255,0.08); border-radius: 4px; padding: 1px 5px; font-size: 12px; }

  .msg-sources {
    margin-top: 8px;
    display: flex; flex-wrap: wrap; gap: 5px;
  }

  .source-chip {
    display: flex; align-items: center; gap: 5px;
    background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2);
    border-radius: 20px; padding: 3px 10px;
    font-size: 11px; color: var(--accent2);
  }

  .typing-indicator {
    display: flex; align-items: center; gap: 4px;
    padding: 14px 16px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 4px 14px 14px 14px;
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
    30% { transform: translateY(-5px); background: var(--accent2); }
  }

  /* ── Input ── */
  .chat-input-area {
    padding: 16px 32px 20px;
    border-top: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .chat-input-box {
    display: flex; align-items: flex-end; gap: 10px;
    background: var(--surface2);
    border: 1.5px solid var(--border2);
    border-radius: 16px;
    padding: 12px 12px 12px 16px;
    transition: border-color 0.2s;
  }
  .chat-input-box:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }

  .chat-textarea {
    flex: 1; background: none; border: none; outline: none;
    color: var(--text); font-family: var(--font-body); font-size: 14px;
    resize: none; line-height: 1.5; max-height: 140px;
    min-height: 22px;
  }
  .chat-textarea::placeholder { color: var(--text3); }

  .send-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--accent); border: none; color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;
  }
  .send-btn:hover { background: var(--accent2); transform: translateY(-1px); }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

  .chat-input-hint { text-align: center; font-size: 11px; color: var(--text3); margin-top: 8px; }

  /* ── Sync overlay ── */
  .sync-overlay {
    position: fixed; inset: 0;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50;
    animation: fadeIn 0.3s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sync-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 20px;
    padding: 36px 40px;
    text-align: center;
    width: 340px;
    animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1);
  }

  .sync-spinner {
    width: 52px; height: 52px; border-radius: 50%;
    border: 3px solid var(--surface3);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
    margin: 0 auto 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .sync-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .sync-sub { font-size: 13px; color: var(--text2); line-height: 1.5; }

  .sync-progress { margin-top: 20px; }
  .sync-bar-bg { height: 4px; background: var(--surface3); border-radius: 2px; overflow: hidden; }
  .sync-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 2px; transition: width 0.4s ease; }
  .sync-step { font-size: 11px; color: var(--text3); margin-top: 8px; }

  /* Empty state */
  .empty-state {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px; text-align: center; gap: 8px;
  }
  .empty-state-icon { font-size: 40px; margin-bottom: 8px; opacity: 0.5; }
  .empty-state h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
  .empty-state p { font-size: 13px; color: var(--text2); max-width: 320px; line-height: 1.6; }
`;
