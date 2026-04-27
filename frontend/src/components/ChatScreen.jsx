import { useState, useEffect, useRef, useCallback } from "react";
import { askQuestion } from "../utils/api";
import { renderText } from "../utils/textUtils";
import { Icon } from "../icons/Icon";

/* ═══════════════════════════════════════════════════════════
   TYPEWRITER — reveals AI text word-by-word with natural pacing
   ═══════════════════════════════════════════════════════════ */
function TypewriterText({ text, onDone, scrollRef }) {
  const [revealed, setRevealed] = useState("");
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const tokens = text.split(/(\s+)/);
    let idx = 0;
    let buffer = "";

    const reveal = () => {
      const count = Math.min(2 + Math.floor(Math.random() * 2), tokens.length - idx);
      for (let j = 0; j < count && idx < tokens.length; j++) {
        buffer += tokens[idx++];
      }
      setRevealed(buffer);
      scrollRef?.current?.scrollIntoView({ behavior: "smooth", block: "end" });

      if (idx >= tokens.length) {
        setFinished(true);
        onDone?.();
      } else {
        const lastChar = buffer.slice(-1);
        const delay = ".!?".includes(lastChar)
          ? 80
          : ",:;".includes(lastChar)
          ? 50
          : 25;
        timerRef.current = setTimeout(reveal, delay);
      }
    };

    timerRef.current = setTimeout(reveal, 150);
    return () => clearTimeout(timerRef.current);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="typewriter-wrap">
      {renderText(revealed)}
      {!finished && <span className="tw-cursor" />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COPY BUTTON — appears on message hover
   ═══════════════════════════════════════════════════════════ */
function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);

  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      className={`msg-copy ${ok ? "done" : ""}`}
      onClick={copy}
      title={ok ? "Copied!" : "Copy to clipboard"}
    >
      <Icon
        d={
          ok
            ? "M5 13l4 4L19 7"
            : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        }
        size={14}
        color={ok ? "var(--green)" : "currentColor"}
      />
      {ok && <span className="copy-toast">Copied!</span>}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   REGENERATE BUTTON
   ═══════════════════════════════════════════════════════════ */
function RegenerateBtn({ onClick }) {
  return (
    <button className="msg-copy" onClick={onClick} title="Regenerate response">
      <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={14} color="currentColor" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHAT SCREEN
   ═══════════════════════════════════════════════════════════ */
export function ChatScreen({ user, files, docIds, onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: `Knowledge base ready. I've indexed **${files.length} document${files.length !== 1 ? "s" : ""}** from your Drive. Ask me anything about their contents.`,
      sources: null,
      typed: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkPhase, setThinkPhase] = useState("");
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
  }, [messages.length, loading]);

  useEffect(() => {
    if (!loading) textareaRef.current?.focus();
  }, [loading]);

  const markTyped = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, typed: true } : m))
    );
  }, []);

  const send = useCallback(
    async (text) => {
      const q = (text || input).trim();
      if (!q || loading) return;

      // Instantly finish any ongoing typewriter
      setMessages((prev) => prev.map((m) => ({ ...m, typed: true })));

      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      const userMsgId = Date.now();
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", text: q, typed: true },
      ]);
      setLoading(true);
      setThinkPhase("searching");

      const phaseTimer = setTimeout(() => setThinkPhase("generating"), 1500);

      try {
        const result = await askQuestion(q, { docIds: docIds || null });
        clearTimeout(phaseTimer);
        setThinkPhase("");

        const aiMsgId = Date.now() + 1;
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            role: "ai",
            text: result.answer,
            sources: result.sources || [],
            typed: false,
          },
        ]);
      } catch (err) {
        clearTimeout(phaseTimer);
        setThinkPhase("");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "ai",
            text: `Sorry, something went wrong: ${err.message}`,
            sources: [],
            typed: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const regenerateLast = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      // Remove the last AI response
      setMessages((prev) => {
        const idx = prev.length - 1;
        if (prev[idx]?.role === "ai") return prev.slice(0, idx);
        return prev;
      });
      setTimeout(() => send(lastUserMsg.text), 100);
    }
  }, [messages, send]);

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
  const charCount = input.length;

  return (
    <div className="chat-screen">
      {/* ── Top bar ── */}
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

      {/* ── Main chat area ── */}
      <div className="chatgpt-main">
        <div className="chatgpt-messages">
          {messages.map((msg, msgIdx) => (
            <div className={`chatgpt-msg ${msg.role}`} key={msg.id}>
              <div
                className={`chatgpt-msg-avatar ${msg.role === "ai" ? "ai" : "user"}`}
              >
                {msg.role === "ai" ? "D" : user.name[0]}
              </div>
              <div className="chatgpt-msg-content">
                <div className="chatgpt-msg-role">
                  {msg.role === "ai" ? "DriveRAG" : "You"}
                </div>
                <div className="chatgpt-msg-text">
                  {msg.role === "ai" && !msg.typed ? (
                    <TypewriterText
                      text={msg.text}
                      onDone={() => markTyped(msg.id)}
                      scrollRef={messagesEndRef}
                    />
                  ) : (
                    renderText(msg.text)
                  )}
                </div>

                {/* Sources — fade in after typewriter completes */}
                {msg.sources && msg.sources.length > 0 && msg.typed && (
                  <div className="chatgpt-sources sources-enter">
                    <span className="chatgpt-sources-label">Sources:</span>
                    {msg.sources.map((s, i) => (
                      <span className="chatgpt-source-chip" key={i}>
                        <Icon
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          size={11}
                          color="var(--accent)"
                        />
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message actions — visible on hover */}
                {msg.typed && (
                  <div className="msg-actions">
                    <CopyBtn text={msg.text} />
                    {msg.role === "ai" && msgIdx === messages.length - 1 && !loading && (
                      <RegenerateBtn onClick={regenerateLast} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ── Thinking indicator ── */}
          {loading && (
            <div className="chatgpt-msg ai">
              <div className="chatgpt-msg-avatar ai">D</div>
              <div className="chatgpt-msg-content">
                <div className="chatgpt-msg-role">DriveRAG</div>
                <div className="thinking-bubble">
                  <div className="thinking-dots">
                    <div className="thinking-dot" />
                    <div className="thinking-dot" />
                    <div className="thinking-dot" />
                  </div>
                  <span className="thinking-label">
                    {thinkPhase === "searching"
                      ? "Searching documents…"
                      : thinkPhase === "generating"
                      ? "Generating response…"
                      : "Thinking…"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ── */}
        <div className="chatgpt-input-area">
          {showHints && (
            <div className="chatgpt-hints">
              {HINTS.map((h, i) => (
                <button className="chatgpt-hint-btn" key={i} onClick={() => send(h)}>
                  <Icon
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
                    size={14}
                    color="var(--accent)"
                  />
                  {h}
                </button>
              ))}
            </div>
          )}
          <div className={`chatgpt-input-box ${loading ? "disabled" : ""}`}>
            <textarea
              ref={textareaRef}
              className="chatgpt-textarea"
              placeholder="Ask anything about your documents…"
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e);
              }}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <div className="input-right">
              {charCount > 0 && <span className="char-count">{charCount}</span>}
              <button
                className={`chatgpt-send-btn ${input.trim() && !loading ? "active" : ""}`}
                onClick={() => send()}
                disabled={!input.trim() || loading}
              >
                <Icon
                  d="M5 12h14M12 5l7 7-7 7"
                  size={18}
                  color={input.trim() && !loading ? "white" : "var(--text3)"}
                />
              </button>
            </div>
          </div>
          <div className="chatgpt-input-footer">
            <span className="chatgpt-input-hint">
              DriveRAG can make mistakes. Check important info in source documents.
            </span>
            <span className="chatgpt-input-shortcut">
              <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
