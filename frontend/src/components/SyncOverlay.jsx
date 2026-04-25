export function SyncOverlay({ files, progress, step }) {
  const isError = step.startsWith("Sync failed");
  return (
    <div className="sync-overlay">
      <div className="sync-card">
        {isError ? (
          <>
            <div style={{fontSize:32, marginBottom:16}}>⚠️</div>
            <div className="sync-title" style={{color:"var(--red)"}}>Sync Failed</div>
            <div className="sync-sub">{step.replace("Sync failed: ", "")}</div>
          </>
        ) : (
          <>
            <div className="sync-spinner" />
            <div className="sync-title">Indexing Documents</div>
            <div className="sync-sub">Chunking, embedding and building your knowledge base…</div>
            <div className="sync-progress">
              <div className="sync-bar-bg">
                <div className="sync-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="sync-step">{step}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
