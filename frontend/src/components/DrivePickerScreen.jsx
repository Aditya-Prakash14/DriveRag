import { useState, useEffect } from "react";
import { Icon } from "../icons/Icon";
import { listDriveFiles } from "../utils/api";

/* ── Distinct file type icons matching Google Drive colors ── */
function FileTypeIcon({ type, size = 24 }) {
  const icons = {
    pdf: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V20a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#ea433515" stroke="#ea4335" strokeWidth="1.5"/>
        <path d="M14 2v5a1 1 0 001 1h5" stroke="#ea4335" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="12" y="17" textAnchor="middle" fill="#ea4335" fontSize="6" fontWeight="800" fontFamily="Inter, sans-serif">PDF</text>
      </svg>
    ),
    gdoc: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V20a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#4285f415" stroke="#4285f4" strokeWidth="1.5"/>
        <path d="M14 2v5a1 1 0 001 1h5" stroke="#4285f4" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 13h8M8 16h5" stroke="#4285f4" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    docx: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V20a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#185abd15" stroke="#185abd" strokeWidth="1.5"/>
        <path d="M14 2v5a1 1 0 001 1h5" stroke="#185abd" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="12" y="17" textAnchor="middle" fill="#185abd" fontSize="5.5" fontWeight="800" fontFamily="Inter, sans-serif">W</text>
      </svg>
    ),
    txt: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V20a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#5f636815" stroke="#5f6368" strokeWidth="1.5"/>
        <path d="M14 2v5a1 1 0 001 1h5" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 13h8M8 16h6M8 10h4" stroke="#5f6368" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  };

  return icons[type] || icons.txt;
}

export function DrivePickerScreen({ user, onSync, onSignOut }) {
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await listDriveFiles();
        setFiles(data.files || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = files.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    setSelected(prev => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        if (s.size >= 10) {
          alert("You can only select up to 10 files at a time.");
          return s;
        }
        s.add(id);
      }
      return s;
    });
  };

  const selectAll = () => {
    if (selected.size === Math.min(filtered.length, 10)) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.slice(0, 10).map(d => d.id)));
    }
  };

  const typeBadge = (type) => ({
    pdf: { label: "PDF", cls: "badge-pdf" },
    gdoc: { label: "DOC", cls: "badge-doc" },
    docx: { label: "DOCX", cls: "badge-doc" },
    txt: { label: "TXT", cls: "badge-txt" },
  }[type] || { label: type?.toUpperCase() || "FILE", cls: "badge-txt" });

  const selectedDocs = files.filter(d => selected.has(d.id));

  return (
    <div className="picker-screen">
      {/* Google Drive style top bar */}
      <div className="drive-topbar">
        <div className="drive-topbar-left">
          <svg width="40" height="40" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.1 9.1 0 0 0-1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 13.15z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="m73.55 23.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27.9h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
          <span className="drive-topbar-title">Drive</span>
          <div className="drive-search-bar">
            <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={18} color="var(--text3)" />
            <input
              placeholder="Search your Drive"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="drive-search-clear" onClick={() => setSearch("")}>
                <Icon d="M6 18L18 6M6 6l12 12" size={14} color="var(--text3)" />
              </button>
            )}
          </div>
        </div>
        <div className="drive-topbar-right">
          <div className="drive-user-avatar">{user.name[0]}</div>
        </div>
      </div>

      <div className="drive-layout">
        {/* Google Drive style left sidebar */}
        <div className="drive-sidebar">
          <button
            className={`drive-sidebar-item ${selected.size === 0 ? "active" : ""}`}
            onClick={selectAll}
          >
            <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" size={16} color="var(--text2)" />
            <span>My Drive</span>
          </button>
          <div className="drive-sidebar-divider" />
          <div className="drive-sidebar-section">
            <div className="drive-sidebar-label">Selected</div>
            <div className="drive-sidebar-count">{selected.size} of {files.length} files</div>
          </div>
          <div style={{flex:1}} />
          <button className="drive-sidebar-signout" onClick={onSignOut}>
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={16} color="var(--text2)" />
            <span>Sign out</span>
          </button>
        </div>

        {/* Main content area */}
        <div className="drive-main">
          {loading && (
            <div className="drive-loading">
              <div className="sync-spinner" style={{margin:"0 auto 16px"}} />
              Loading files from Google Drive…
            </div>
          )}

          {error && (
            <div className="drive-loading" style={{color:"var(--red)"}}>
              Failed to load files: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Toolbar */}
              <div className="drive-content-toolbar">
                <button className="drive-checkbox-all" onClick={selectAll} title="Select up to 10 files">
                  <div className={`drive-checkbox ${selected.size > 0 && selected.size === Math.min(filtered.length, 10) ? "checked" : ""}`}>
                    {selected.size > 0 && selected.size === Math.min(filtered.length, 10) && (
                      <Icon d="M5 13l4 4L19 7" size={12} color="white" />
                    )}
                  </div>
                </button>
                <span className="drive-toolbar-label">
                  {selected.size > 0 ? `${selected.size} selected (Max 10)` : "Name"}
                </span>
                {selected.size > 0 && (
                  <button
                    className="btn-primary drive-sync-btn"
                    disabled={selected.size === 0}
                    onClick={() => onSync(selectedDocs)}
                  >
                    <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={14} color="white" />
                    Sync & Chat
                  </button>
                )}
              </div>

              {/* File list - Google Drive style table */}
              {filtered.length === 0 ? (
                <div className="drive-loading">
                  No supported files found in your Drive.
                </div>
              ) : (
                <div className="drive-file-list">
                  {filtered.map(doc => (
                    <div
                      key={doc.id}
                      className={`drive-file-row ${selected.has(doc.id) ? "selected" : ""}`}
                      onClick={() => toggle(doc.id)}
                    >
                      <div className="drive-file-checkbox">
                        <div className={`drive-checkbox ${selected.has(doc.id) ? "checked" : ""}`}>
                          {selected.has(doc.id) && (
                            <Icon d="M5 13l4 4L19 7" size={12} color="white" />
                          )}
                        </div>
                      </div>
                      <div className="drive-file-icon">
                        <FileTypeIcon type={doc.type} />
                      </div>
                      <div className="drive-file-name">
                        {doc.name}
                        <span className={`file-type-badge ${typeBadge(doc.type).cls}`}>{typeBadge(doc.type).label}</span>
                      </div>
                      <div className="drive-file-meta">{doc.size}</div>
                      <div className="drive-file-meta">{doc.modified}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
