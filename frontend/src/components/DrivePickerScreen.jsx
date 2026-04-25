import { useState, useEffect } from "react";
import { Icon } from "../icons/Icon";
import { listDriveFiles } from "../utils/api";

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
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(d => d.id)));
  };

  const badgeClass = (type) => ({
    pdf: "badge-pdf", gdoc: "badge-doc", docx: "badge-doc", txt: "badge-txt"
  }[type] || "badge-txt");

  const selectedDocs = files.filter(d => selected.has(d.id));

  return (
    <div className="picker-screen">
      <div className="topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">D</div>
          <span className="topbar-name">DriveRAG</span>
        </div>
        <div className="topbar-user">
          <div className="avatar">{user.name[0]}</div>
          <span className="avatar-name">{user.email}</span>
          <button className="btn-secondary" style={{marginLeft:8, padding:"5px 10px", fontSize:12}} onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      <div className="picker-body">
        <div className="picker-header">
          <h1>Select Documents</h1>
          <p>Choose files from your Google Drive to index for Q&A</p>
        </div>

        {loading && (
          <div style={{textAlign:"center", padding:"40px 0", color:"var(--text2)"}}>
            <div className="sync-spinner" style={{margin:"0 auto 16px"}} />
            Loading files from Google Drive…
          </div>
        )}

        {error && (
          <div style={{textAlign:"center", padding:"40px 0", color:"var(--red)"}}>
            Failed to load files: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="drive-toolbar">
              <div className="drive-search">
                <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={15} color="var(--text3)" />
                <input
                  placeholder="Search files…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="drive-actions">
                <button className="btn-secondary" onClick={selectAll}>
                  {selected.size === filtered.length ? "Deselect all" : "Select all"}
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{textAlign:"center", padding:"40px 0", color:"var(--text2)"}}>
                No supported files found in your Drive.
              </div>
            ) : (
              <div className="file-grid">
                {filtered.map(doc => (
                  <div
                    key={doc.id}
                    className={`file-card ${selected.has(doc.id) ? "selected" : ""}`}
                    onClick={() => toggle(doc.id)}
                  >
                    <div className="file-card-check">
                      <Icon d="M5 13l4 4L19 7" size={11} color="white" />
                    </div>
                    <span className={`file-type-badge ${badgeClass(doc.type)}`}>{doc.type}</span>
                    <div className="file-name">{doc.name}</div>
                    <div className="file-meta">{doc.size} · {doc.modified}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="picker-footer">
              <span className="selected-count">
                <strong>{selected.size}</strong> of {files.length} files selected
              </span>
              <button
                className="btn-primary"
                disabled={selected.size === 0}
                onClick={() => onSync(selectedDocs)}
              >
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={14} color="white" />
                Sync & Open Chat
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
