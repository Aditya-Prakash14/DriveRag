// ─── Helper: render markdown-lite ─────────────────────────────────────────────
// Handles: **bold**, `inline code`, and \n newlines.
// LLM answers regularly contain all three; the original only handled bold,
// causing multi-paragraph answers to collapse into a single run-on block.

export function renderText(text) {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    // Split on **bold** and `code` markers
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    const rendered = parts.map((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={partIdx}>{part.slice(1, -1)}</code>;
      }
      return part;
    });

    const isLast = lineIdx === lines.length - 1;
    return (
      <span key={lineIdx}>
        {rendered}
        {!isLast && <br />}
      </span>
    );
  });
}