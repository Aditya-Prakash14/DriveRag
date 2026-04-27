// ─── Markdown-lite renderer ──────────────────────────────────────────────────
// Handles: **bold**, *italic*, `inline code`, ```code blocks```,
// ## headers, - bullet lists, 1. numbered lists, > blockquotes,
// --- horizontal rules, [links](url), and \n newlines.

function renderInline(text, keyPrefix = "") {
  if (!text) return null;

  // Split on inline patterns: **bold**, *italic*, `code`, [link](url)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key} className="inline-code">{part.slice(1, -1)}</code>;
    }
    // [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={key} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="msg-link">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

export function renderText(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Code block ───────────────────────────────────────────────
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={`code-${i}`} className="msg-code-block">
          {lang && <div className="msg-code-lang">{lang}</div>}
          <pre><code>{codeLines.join("\n")}</code></pre>
        </div>
      );
      continue;
    }

    // ── Horizontal rule ──────────────────────────────────────────
    if (/^-{3,}$|^\*{3,}$|^_{3,}$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="msg-hr" />);
      i++;
      continue;
    }

    // ── Headers ──────────────────────────────────────────────────
    const headerMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const Tag = `h${Math.min(level + 1, 6)}`; // h2-h5
      elements.push(
        <Tag key={`h-${i}`} className={`msg-heading msg-h${level}`}>
          {renderInline(headerMatch[2], `h-${i}`)}
        </Tag>
      );
      i++;
      continue;
    }

    // ── Blockquote ───────────────────────────────────────────────
    if (trimmed.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="msg-blockquote">
          {renderInline(quoteLines.join(" "), `bq-${i}`)}
        </blockquote>
      );
      continue;
    }

    // ── Bullet list ──────────────────────────────────────────────
    if (/^[-•]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-•]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="msg-list">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item, `ul-${i}-${j}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list ────────────────────────────────────────────
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="msg-list msg-ol">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item, `ol-${i}-${j}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Empty line → spacer ──────────────────────────────────────
    if (trimmed === "") {
      elements.push(<div key={`sp-${i}`} className="msg-spacer" />);
      i++;
      continue;
    }

    // ── Regular paragraph ────────────────────────────────────────
    const paraLines = [line];
    i++;
    // Collect consecutive non-special lines into one paragraph
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("> ") &&
      !lines[i].trim().startsWith("```") &&
      !/^[-•]\s+/.test(lines[i].trim()) &&
      !/^\d+[.)]\s+/.test(lines[i].trim()) &&
      !/^-{3,}$|^\*{3,}$|^_{3,}$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    elements.push(
      <p key={`p-${i}`} className="msg-para">
        {renderInline(paraLines.join(" "), `p-${i}`)}
      </p>
    );
  }

  return <div className="msg-rendered">{elements}</div>;
}