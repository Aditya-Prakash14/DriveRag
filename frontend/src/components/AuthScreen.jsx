import { GoogleIcon } from "../icons/GoogleIcon";

export function AuthScreen({ onSignIn }) {
  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-grid" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">D</div>
          <span className="auth-logo-text">DriveRAG</span>
        </div>
        <h1 className="auth-headline">Chat with your<br />Google Drive</h1>
        <p className="auth-sub">Connect your Drive, select documents, and ask questions — powered by RAG with FAISS + SentenceTransformers.</p>
        <button className="btn-google" onClick={onSignIn}>
          <GoogleIcon />
          Continue with Google
        </button>
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">what you get</span>
          <div className="auth-divider-line" />
        </div>
        <div className="auth-features">
          {[
            "Secure OAuth2 — read-only Drive access",
            "Incremental sync — only new files are processed",
            "RAG pipeline — grounded, cited answers",
          ].map((f, i) => (
            <div className="auth-feature" key={i}>
              <div className="auth-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
