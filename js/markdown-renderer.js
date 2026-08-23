export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUrl(value) {
  const url = String(value || "").trim();
  return url && !/^(javascript|data):/i.test(url) ? url : "";
}

function renderMathFallback(value) {
  return escapeHtml(value)
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\\(to|rightarrow)/g, "->")
    .replace(/\\oplus/g, "xor")
    .replace(/\\ge/g, ">=")
    .replace(/\\le/g, "<=")
    .replace(/\\gg/g, ">>")
    .replace(/\\log_\{([^{}]*)\}/g, "log_$1")
    .replace(/\\([a-zA-Z]+)/g, "$1")
    .replace(/[{}]/g, "");
}

function renderInlineMarkdown(value) {
  const codeSpans = [];
  let content = escapeHtml(value).replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });

  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const safeSrc = sanitizeUrl(src);
    return safeSrc ? `<img src="${escapeHtml(safeSrc)}" alt="${alt}">` : alt;
  });
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = sanitizeUrl(href);
    return safeHref ? `<a href="${escapeHtml(safeHref)}">${label}</a>` : label;
  });
  content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  content = content.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  content = content.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  content = content.replace(/_([^_]+)_/g, "<em>$1</em>");
  content = content.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  content = content.replace(/==([^=]+)==/g, '<span class="term-highlight">$1</span>');
  content = content.replace(/\$\$([^$]+)\$\$/g, (_, math) => `<span class="math-block" data-math="${escapeHtml(math)}">${renderMathFallback(math)}</span>`);
  content = content.replace(/\$([^$]+)\$/g, (_, math) => `<span class="math-inline" data-math="${escapeHtml(math)}">${renderMathFallback(math)}</span>`);

  return content.replace(/\u0000(\d+)\u0000/g, (_, index) => codeSpans[index]);
}

export function renderMarkdown(container, text, fallback) {
  if (!container) return;

  const lines = (String(text || "").trim() || fallback).split(/\r?\n/);
  const chunks = [];
  const paragraphLines = [];
  let listType = null;
  let blockquoteLines = [];
  let codeLines = [];
  let codeLanguage = "";
  let inCodeBlock = false;
  let tableRows = [];

  const isTableSeparator = (line) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
  const splitTableRow = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  const closeList = () => {
    if (listType) chunks.push(listType === "ol" ? "</ol>" : "</ul>");
    listType = null;
  };
  const openList = (type) => {
    if (listType !== type) {
      closeList();
      chunks.push(type === "ol" ? "<ol>" : "<ul>");
      listType = type;
    }
  };
  const flushParagraph = () => {
    if (paragraphLines.length) chunks.push(`<p>${renderInlineMarkdown(paragraphLines.join(" "))}</p>`);
    paragraphLines.length = 0;
  };
  const flushTable = () => {
    if (!tableRows.length) return;
    const [header, , ...rows] = tableRows;
    chunks.push(`<div class="table-scroll"><table><thead><tr>${header.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    tableRows = [];
  };
  const flushBlockquote = () => {
    if (!blockquoteLines.length) return;
    const temporary = document.createElement("div");
    renderMarkdown(temporary, blockquoteLines.join("\n"), "");
    chunks.push(`<blockquote>${temporary.innerHTML}</blockquote>`);
    blockquoteLines = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (inCodeBlock) {
      if (/^```/.test(trimmed)) {
        chunks.push(`<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ""}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        codeLanguage = "";
        inCodeBlock = false;
      } else {
        codeLines.push(line);
      }
      return;
    }
    if (/^```/.test(trimmed)) {
      flushParagraph(); closeList(); flushBlockquote(); flushTable();
      codeLanguage = trimmed.slice(3).trim();
      return void (inCodeBlock = true);
    }
    if (trimmed.startsWith(">")) {
      flushParagraph(); closeList(); flushTable();
      blockquoteLines.push(trimmed.replace(/^>\s?/, ""));
      return;
    }
    if (blockquoteLines.length) flushBlockquote();
    if (trimmed.includes("|") && (tableRows.length || isTableSeparator(lines[index + 1]?.trim() || ""))) {
      flushParagraph(); closeList(); tableRows.push(splitTableRow(trimmed)); return;
    }
    if (tableRows.length) flushTable();
    if (!trimmed) {
      flushParagraph(); closeList(); return;
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph(); closeList();
      return void chunks.push(`<h${heading[1].length}>${renderInlineMarkdown(heading[2])}</h${heading[1].length}>`);
    }
    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      flushParagraph(); closeList(); return void chunks.push("<hr>");
    }
    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushParagraph(); closeList();
      const safeSrc = sanitizeUrl(image[2]);
      if (safeSrc) chunks.push(`<img src="${escapeHtml(safeSrc)}" alt="${escapeHtml(image[1])}" loading="lazy">`);
      return;
    }
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph(); openList("ul"); return void chunks.push(`<li>${renderInlineMarkdown(unordered[1])}</li>`);
    }
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph(); openList("ol"); return void chunks.push(`<li>${renderInlineMarkdown(ordered[1])}</li>`);
    }
    closeList();
    paragraphLines.push(trimmed);
  });

  flushParagraph();
  closeList();
  flushBlockquote();
  flushTable();
  container.innerHTML = chunks.join("") || `<p>${escapeHtml(fallback)}</p>`;
  if (window.MathJax?.typesetPromise) {
    container.querySelectorAll("[data-math]").forEach((node) => {
      node.textContent = `\\(${node.dataset.math}\\)`;
    });
    window.MathJax.typesetPromise([container]).catch(() => {});
  }
}