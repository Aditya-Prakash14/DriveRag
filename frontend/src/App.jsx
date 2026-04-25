import { useState, useEffect } from "react";
import { styles } from "./styles/theme";
import { AuthScreen } from "./components/AuthScreen";
import { DrivePickerScreen } from "./components/DrivePickerScreen";
import { ChatScreen } from "./components/ChatScreen";
import { SyncOverlay } from "./components/SyncOverlay";
import { getMe, logout, syncDrive } from "./utils/api";

export default function App() {
  const [screen, setScreen] = useState("loading"); // loading | auth | picker | syncing | chat
  const [user, setUser] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState("");

  // Check if user is already authenticated on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser({ name: me.name, email: me.email, picture: me.picture });
        setScreen("picker");
      } catch {
        setUser(null);
        setScreen("auth");
      }
    })();
  }, []);

  const handleSignIn = () => {
    // Redirect browser to backend OAuth login
    window.location.href = "/auth/login";
  };

  const handleSignOut = async () => {
    try { await logout(); } catch { /* ignore */ }
    setUser(null);
    setScreen("auth");
  };

  const handleSync = async (files) => {
    setSelectedFiles(files);
    setScreen("syncing");
    setSyncProgress(10);
    setSyncStep(`Syncing ${files.length} files from Google Drive…`);

    try {
      const fileIds = files.map(f => f.id);
      await syncDrive(fileIds);

      setSyncProgress(90);
      setSyncStep("Indexing complete. Building knowledge base…");

      await new Promise(r => setTimeout(r, 400));
      setSyncProgress(100);
      setScreen("chat");
    } catch (err) {
      setSyncStep(`Sync failed: ${err.message}`);
      setSyncProgress(0);
      // Stay on syncing screen so user sees the error
    }
  };

  if (screen === "loading") {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          <div className="auth-screen">
            <div className="sync-card" style={{ textAlign: "center" }}>
              <div className="sync-spinner" />
              <div className="sync-title">Checking authentication…</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {screen === "auth" && <AuthScreen onSignIn={handleSignIn} />}
        {screen === "picker" && (
          <DrivePickerScreen
            user={user}
            onSync={handleSync}
            onSignOut={handleSignOut}
          />
        )}
        {screen === "syncing" && (
          <>
            <DrivePickerScreen user={user} onSync={() => {}} onSignOut={() => {}} />
            <SyncOverlay files={selectedFiles} progress={syncProgress} step={syncStep} />
          </>
        )}
        {screen === "chat" && (
          <ChatScreen
            user={user}
            files={selectedFiles}
            onBack={() => setScreen("picker")}
          />
        )}
      </div>
    </>
  );
}


