import { useState, useEffect, useRef, useCallback } from "react";
import { askQuestion } from "../utils/api";
import { renderText } from "../utils/textUtils";
import { Icon } from "../icons/Icon";
import { DriveIcon } from "../icons/DriveIcon";

export function ChatScreen({ user, files, onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: `Knowledge base ready. I've indexed **${files.length} document${files.length !== 1 ? "s"  : ""}** from your Drive. Ask me anything about their contents.`,
      sources: null,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const HINTS = [
    "What is our refund policy?",
    "How many PTO days do employees get?",
    "What are our GDPR compliance requirements?",
    "Summarise the engineering runbook",
    "What SLA do we commit to for enterprise clients?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");

    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: q }]);
    setLoading(true);

    try {
      const result = await askQuestion(q);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: result.answer,
        sources: result.sources || [],
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: `Sorry, something went wrong: ${err.message}`,
        sources: [],
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  return (
    <div className="chat-screen">
      <div className="chat-topbar">
        <div className="chat-topbar-left">
          <button className="topbar-back" onClick={onBack}>
            <Icon d="M19 12H5M12 19l-7-7 7-7" size={13} />
            Drive
          </button>
          <div className="topbar-brand" style={{marginLeft:4}}>
            <div className="topbar-logo">D</div>
            <span className="topbar-name">DriveRAG</span>
          </div>
          <div className="chat-context-pill">
            <div className="pill-dot" />
            {files.length} docs indexed
          </div>
        </div>
        <div className="topbar-user">
          <div className="avatar">{user.name[0]}</div>
          <span className="avatar-name">{user.name}</span>
        </div>
      </div>

      <div className="chat-layout">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Indexed Files</div>
            {files.map(f => (
              <div className="sidebar-file" key={f.id}>
                <DriveIcon />
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{f.name}</span>
              </div>
            ))}
          </div>
          <div className="sidebar-divider" />
          <div className="sidebar-hints">
            <div className="hint-label">Try asking</div>
            {HINTS.map((h, i) => (
              <button className="hint-chip" key={i} onClick={() => send(h)}>{h}</button>
            ))}
          </div>
        </div>

        {/* Chat main */}
        <div className="chat-main">
          <div className="messages-area">
            {messages.map(msg => (
              <div className={`msg ${msg.role}`} key={msg.id}>
                <div className={`msg-avatar ${msg.role === "ai" ? "ai" : "user-av"}`}>
                  {msg.role === "ai" ? "D" : user.name[0]}
                </div>
                <div className="msg-body">
                  <div className="msg-bubble">
                    {renderText(msg.text)}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="msg-sources">
                      {msg.sources.map((s, i) => (
                        <span className="source-chip" key={i}>
                          <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={11} color="var(--accent2)" />
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg ai">
                <div className="msg-avatar ai">D</div>
                <div className="msg-body">
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-input-box">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Ask anything about your documents…"
                rows={1}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(e); }}
                onKeyDown={onKeyDown}
              />
              <button className="send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
                <Icon d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" size={16} color="white" />
              </button>
            </div>
            <div className="chat-input-hint">Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </div>
  );
}
