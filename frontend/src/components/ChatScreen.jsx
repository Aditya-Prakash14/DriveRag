import { useState, useEffect, useRef, useCallback } from "react";
import { askQuestion } from "../utils/api";
import { renderText } from "../utils/textUtils";
import { Icon } from "../icons/Icon";

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
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const showHints = messages.length <= 1;

  return (
    <div className="chat-screen">
      {/* ChatGPT style top bar */}
      <div className="chatgpt-topbar">
        <div className="chatgpt-topbar-left">
          <button className="chatgpt-back-btn" onClick={onBack}>
            <Icon d="M19 12H5M12 19l-7-7 7-7" size={16} />
          </button>
          <div className="chatgpt-model-label">
            <div className="chatgpt-logo">D</div>
            DriveRAG
          </div>
          <div className="chatgpt-context-pill">
            <div className="pill-dot" />
            {files.length} docs indexed
          </div>
        </div>
        <div className="chatgpt-topbar-right">
          <div className="chatgpt-user-avatar">{user.name[0]}</div>
        </div>
      </div>

      {/* ChatGPT style main area - centered */}
      <div className="chatgpt-main">
        <div className="chatgpt-messages">
          {messages.map(msg => (
            <div className={`chatgpt-msg ${msg.role}`} key={msg.id}>
              <div className={`chatgpt-msg-avatar ${msg.role === "ai" ? "ai" : "user"}`}>
                {msg.role === "ai" ? "D" : user.name[0]}
              </div>
              <div className="chatgpt-msg-content">
                <div className="chatgpt-msg-role">{msg.role === "ai" ? "DriveRAG" : "You"}</div>
                <div className="chatgpt-msg-text">
                  {renderText(msg.text)}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="chatgpt-sources">
                    <span className="chatgpt-sources-label">Sources:</span>
                    {msg.sources.map((s, i) => (
                      <span className="chatgpt-source-chip" key={i}>
                        <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={11} color="var(--accent)" />
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chatgpt-msg ai">
              <div className="chatgpt-msg-avatar ai">D</div>
              <div className="chatgpt-msg-content">
                <div className="chatgpt-msg-role">DriveRAG</div>
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

        {/* ChatGPT style input area - centered at bottom */}
        <div className="chatgpt-input-area">
          {showHints && (
            <div className="chatgpt-hints">
              {HINTS.map((h, i) => (
                <button className="chatgpt-hint-btn" key={i} onClick={() => send(h)}>
                  {h}
                </button>
              ))}
            </div>
          )}
          <div className="chatgpt-input-box">
            <textarea
              ref={textareaRef}
              className="chatgpt-textarea"
              placeholder="Ask anything about your documents…"
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={onKeyDown}
            />
            <button className="chatgpt-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
              <Icon d="M5 12h14M12 5l7 7-7 7" size={18} color={input.trim() && !loading ? "white" : "var(--text3)"} />
            </button>
          </div>
          <div className="chatgpt-input-hint">DriveRAG can make mistakes. Check important info in source documents.</div>
        </div>
      </div>
    </div>
  );
}
