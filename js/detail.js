import { formatDate, loadInsights, loadPeople, loadRoles, loadServices } from "./content-service.js";
import {
  applyActiveNavByPath,
  registerImageOnlyServiceWorker,
  renderServicesNavMenus,
  setupMobileNavigation,
  setupReveals
} from "./ui-shared.js";

const layoutReadyPromise = window.__layoutReady instanceof Promise
  ? window.__layoutReady
  : Promise.resolve();
let yearNode = null;
let navLinks = [];
let menuToggle = null;
let siteNav = null;
let navServicesMenu = null;
let footerServicesMenu = null;
let servicesDropdown = null;
let servicesDropdownToggle = null;
let insightsDropdown = null;
let insightsDropdownToggle = null;

const detailTitle = document.querySelector("#detail-title");
const detailEyebrow = document.querySelector("#detail-eyebrow");
const detailPersonLayout = document.querySelector("#detail-person-layout");
const detailPersonImage = document.querySelector("#detail-person-image");
const detailMeta = document.querySelector("#detail-meta");
const detailSummary = document.querySelector("#detail-summary");
const detailBody = document.querySelector("#detail-body");
const detailList = document.querySelector("#detail-list");
const detailPrimary = document.querySelector("#detail-primary");
const detailBack = document.querySelector("#detail-back");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) {
    return "";
  }

  if (/^(javascript|data):/i.test(url)) {
    return "";
  }

  return url;
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

function resolveAssetUrl(value) {
  const safeUrl = sanitizeUrl(value);
  if (!safeUrl) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(safeUrl)) {
    return safeUrl;
  }

  if (safeUrl.startsWith("/")) {
    return safeUrl;
  }

  return `/${safeUrl.replace(/^\.?\//, "")}`;
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
    if (!safeHref) {
      return label;
    }
    return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
  });
  content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  content = content.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  content = content.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  content = content.replace(/_([^_]+)_/g, "<em>$1</em>");
  content = content.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  content = content.replace(/==([^=]+)==/g, '<span class="term-highlight">$1</span>');
  content = content.replace(/\$\$([^$]+)\$\$/g, (_, math) => `<span class="math-block" data-math="${escapeHtml(math)}">${renderMathFallback(math)}</span>`);
  content = content.replace(/\$([^$]+)\$/g, (_, math) => `<span class="math-inline" data-math="${escapeHtml(math)}">${renderMathFallback(math)}</span>`);
  content = content.replace(/\u0000(\d+)\u0000/g, (_, index) => codeSpans[index]);

  return content;
}

function normalizeInsightUrl(url) {
  if (!url || url === "#contact") {
    return "contact.html";
  }
  return url;
}

function pageKeyFromPath(path) {
  if (path === "detail.html") {
    const type = new URLSearchParams(window.location.search).get("type");
    if (type === "services") {
      return "services.html";
    }
    if (type === "careers") {
      return "careers.html";
    }
    if (type === "insights") {
      return "insights.html";
    }
    if (type === "people") {
      return "people.html";
    }
  }

  if (path.startsWith("service-")) {
    return "services.html";
  }
  if (path.startsWith("insight-")) {
    return "insights.html";
  }
  if (path.startsWith("role-")) {
    return "careers.html";
  }
  if (path.startsWith("person-")) {
    return "people.html";
  }
  return path;
}

function renderMarkdown(container, text, fallback) {
  if (!container) {
    return;
  }

  const content = String(text || "").trim() || fallback;
  const lines = content.split(/\r?\n/);
  const chunks = [];
  const paragraphLines = [];
  let listType = null;
  let blockquoteLines = [];
  let codeLines = [];
  let codeLanguage = "";
  let inCodeBlock = false;
  let tableRows = [];

  function isTableSeparator(line) {
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
  }

  function splitTableRow(line) {
    const value = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return value.split("|").map((cell) => cell.trim());
  }

  function flushBlockquote() {
    if (!blockquoteLines.length) return;
    chunks.push(`<blockquote>${renderMarkdownToHtml(blockquoteLines.join("\n"))}</blockquote>`);
    blockquoteLines = [];
  }

  function flushTable() {
    if (!tableRows.length) return;
    const [header, , ...rows] = tableRows;
    chunks.push(`<div class="table-scroll"><table><thead><tr>${header.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    tableRows = [];
  }

  function renderMarkdownToHtml(value) {
    const temporary = document.createElement("div");
    renderMarkdown(temporary, value, "");
    return temporary.innerHTML;
  }

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    chunks.push(`<p>${renderInlineMarkdown(paragraphLines.join(" "))}</p>`);
    paragraphLines.length = 0;
  }

  function closeList() {
    if (!listType) {
      return;
    }

    chunks.push(listType === "ol" ? "</ol>" : "</ul>");
    listType = null;
  }

  function openList(type) {
    if (listType === type) {
      return;
    }

    closeList();
    chunks.push(type === "ol" ? "<ol>" : "<ul>");
    listType = type;
  }

  lines.forEach((line, lineIndex) => {
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
      flushParagraph();
      closeList();
      flushBlockquote();
      flushTable();
      codeLanguage = trimmed.slice(3).trim();
      codeLines = [];
      inCodeBlock = true;
      return;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      closeList();
      flushTable();
      blockquoteLines.push(trimmed.replace(/^>\s?/, ""));
      return;
    }

    if (blockquoteLines.length) flushBlockquote();

    if (trimmed.includes("|") && (tableRows.length || isTableSeparator(lines[lineIndex + 1]?.trim() || ""))) {
      flushParagraph();
      closeList();
      tableRows.push(splitTableRow(trimmed));
      return;
    }

    if (tableRows.length) flushTable();

    if (!trimmed) {
      flushParagraph();
      closeList();
      flushTable();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      chunks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }

    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      flushParagraph();
      closeList();
      chunks.push("<hr>");
      return;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      closeList();
      const altText = escapeHtml(imageMatch[1]);
      const safeSrc = sanitizeUrl(imageMatch[2]);
      if (safeSrc) {
        chunks.push(`<img src="${escapeHtml(safeSrc)}" alt="${altText}" loading="lazy">`);
      }
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      openList("ul");
      chunks.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`);
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      openList("ol");
      chunks.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`);
      return;
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

function setRequirements(items) {
  if (!detailList) {
    return;
  }

  detailList.innerHTML = "";

  if (!items.length) {
    detailList.hidden = true;
    return;
  }

  detailList.hidden = false;
  detailList.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function clearDetailPersonImage() {
  if (!detailPersonImage) {
    return;
  }

  detailPersonImage.hidden = true;
  detailPersonImage.removeAttribute("src");
  detailPersonImage.alt = "";
}

function resetDetailVisualState(options = {}) {
  const {
    isService = false,
    isPerson = false,
    heroImage = ""
  } = options;

  detailPersonLayout?.classList.toggle("is-service", isService);
  detailPersonLayout?.classList.toggle("is-person", isPerson);

  if (heroImage) {
    detailPersonLayout?.style.setProperty("--detail-hero-image", `url("${heroImage}")`);
  } else {
    detailPersonLayout?.style.removeProperty("--detail-hero-image");
  }

  if (!isPerson) {
    clearDetailPersonImage();
  }
}

function setText(node, value) {
  if (node) {
    node.textContent = value;
  }
}

function setDetailActions(primaryText, primaryHref, backText, backHref) {
  if (detailPrimary) {
    detailPrimary.textContent = primaryText;
    detailPrimary.href = primaryHref;
  }

  if (detailBack) {
    detailBack.textContent = backText;
    detailBack.href = backHref;
  }
}

function renderMissingState() {
  resetDetailVisualState();
  setText(detailEyebrow, "Content");
  setText(detailTitle, "Item not found");
  setText(detailMeta, "The requested page may no longer exist.");
  setText(detailSummary, "Please use the main section pages to browse available content.");
  renderMarkdown(detailBody, "", "Return to the relevant listing page to continue browsing.");
  setRequirements([]);

  setDetailActions("Go to Home", "index.html", "Back to Home", "index.html");
}

function renderService(service) {
  const heroImage = resolveAssetUrl(service.heroImage || service.image);
  resetDetailVisualState({ isService: true, heroImage });
  setText(detailEyebrow, "Service");
  setText(detailTitle, service.title);
  setText(detailMeta, "ADN Semiconductor Services");
  setText(detailSummary, service.summary);
  renderMarkdown(detailBody, service.body, "Service details are being updated.");
  setRequirements([]);

  setDetailActions("Discuss This Service", "contact.html", "Back to Services", "services.html");
}

function renderRole(role) {
  resetDetailVisualState();
  setText(detailEyebrow, "Career Role");
  setText(detailTitle, role.title);
  setText(detailMeta, `${role.team} · ${role.location} · ${role.type}`);
  setText(detailSummary, role.summary);
  renderMarkdown(detailBody, role.body, "Role details are being updated.");
  setRequirements(role.requirements);

  setDetailActions(
    "Apply",
    `careers.html?apply=${encodeURIComponent(role.title)}#career-application`,
    "Back to Careers",
    "careers.html"
  );
}

function renderInsight(insight) {
  resetDetailVisualState();
  setText(detailEyebrow, insight.type);
  setText(detailTitle, insight.title);
  setText(detailMeta, `${formatDate(insight.date)} · ${insight.author}`);
  setText(detailSummary, insight.summary);
  renderMarkdown(detailBody, insight.body, "Insight details are being updated.");
  setRequirements([]);

  setDetailActions(
    "Talk to Our Team",
    normalizeInsightUrl(insight.url),
    "Back to Insights",
    "insights.html"
  );
}

function renderPerson(person) {
  resetDetailVisualState({ isPerson: true });
  setText(detailEyebrow, "People");
  if (detailPersonImage) {
    detailPersonImage.src = person.image;
    detailPersonImage.alt = person.name;
    detailPersonImage.hidden = !person.image;
  }
  setText(detailTitle, person.name);
  setText(detailMeta, `${person.title} · ${person.focus}`);
  setText(detailSummary, person.summary);
  renderMarkdown(detailBody, person.body, "Profile details are being updated.");
  setRequirements(person.expertise);

  if (detailPrimary) {
    if (person.profileUrl) {
      detailPrimary.textContent = "View Profile";
      detailPrimary.href = person.profileUrl;
    } else if (person.linkedin) {
      detailPrimary.textContent = "Open LinkedIn";
      detailPrimary.href = person.linkedin;
    } else if (person.email) {
      detailPrimary.textContent = "Email This Person";
      detailPrimary.href = `mailto:${person.email}`;
    } else {
      detailPrimary.textContent = "Contact ADN";
      detailPrimary.href = "contact.html";
    }
  }
  if (detailBack) {
    detailBack.href = "people.html";
    detailBack.textContent = "Back to People";
  }
}

const DETAIL_RENDERERS = {
  services: {
    load: loadServices,
    render: renderService
  },
  careers: {
    load: loadRoles,
    render: renderRole
  },
  insights: {
    load: loadInsights,
    render: renderInsight
  },
  people: {
    load: loadPeople,
    render: renderPerson
  }
};

async function renderByTypeAndId(type, id) {
  const config = DETAIL_RENDERERS[type];
  if (!config || !id) {
    renderMissingState();
    return;
  }

  const records = await config.load();
  const record = records.find((item) => item.id === id);
  if (!record) {
    renderMissingState();
    return;
  }

  config.render(record);
}

async function init() {
  await layoutReadyPromise;

  registerImageOnlyServiceWorker();

  yearNode = document.querySelector("#year");
  navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  menuToggle = document.querySelector(".menu-toggle");
  siteNav = document.querySelector("#site-nav");
  navServicesMenu = document.querySelector("#nav-services-menu");
  footerServicesMenu = document.querySelector("#footer-services-menu");
  servicesDropdown = document.querySelector("#nav-services-menu")?.closest(".nav-dropdown") || null;
  servicesDropdownToggle = servicesDropdown?.querySelector(".nav-dropdown-toggle") || null;
  insightsDropdown = document.querySelector(".nav-dropdown-menu[aria-label='Insights submenu']")?.closest(".nav-dropdown") || null;
  insightsDropdownToggle = insightsDropdown?.querySelector(".nav-dropdown-toggle") || null;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || document.body.getAttribute("data-detail-type");
  const id = params.get("id") || document.body.getAttribute("data-detail-id");

  const servicesForMenuPromise = loadServices();
  const detailRenderPromise = renderByTypeAndId(type, id);
  const [servicesForMenu] = await Promise.all([
    servicesForMenuPromise,
    detailRenderPromise
  ]);

  renderServicesNavMenus({ navServicesMenu, footerServicesMenu }, servicesForMenu);

  setupMobileNavigation({
    menuToggle,
    siteNav,
    navLinks,
    servicesDropdown,
    servicesDropdownToggle,
    insightsDropdown,
    insightsDropdownToggle
  });
  applyActiveNavByPath(navLinks, pageKeyFromPath);
  setupReveals();

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

init();
