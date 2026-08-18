import { formatDate, loadInsights, loadRoles, loadServices } from "./content-service.js";

const layoutReadyPromise = window.__layoutReady instanceof Promise
  ? window.__layoutReady
  : Promise.resolve();
let yearNode = null;
let navLinks = [];
let menuToggle = null;
let siteNav = null;
let navServicesMenu = null;
let servicesDropdown = null;
let servicesDropdownToggle = null;

const detailTitle = document.querySelector("#detail-title");
const detailEyebrow = document.querySelector("#detail-eyebrow");
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

function renderInlineMarkdown(value) {
  let content = escapeHtml(value);

  content = content.replace(/`([^`]+)`/g, "<code>$1</code>");
  content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  content = content.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = sanitizeUrl(href);
    if (!safeHref) {
      return label;
    }
    return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
  });

  return content;
}

function normalizeInsightUrl(url) {
  if (!url || url === "#contact") {
    return "contact.html";
  }
  return url;
}

function buildDetailPagePath(type, id) {
  return `detail.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
}

function renderServicesNavMenu(services) {
  if (!navServicesMenu) {
    return;
  }

  navServicesMenu.innerHTML = "";

  services.forEach((service) => {
    const link = document.createElement("a");
    link.href = buildDetailPagePath("services", service.id);
    link.textContent = service.title;
    navServicesMenu.append(link);
  });
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
  return path;
}

function applyActiveNavByPath() {
  const rawPath = window.location.pathname.split("/").pop() || "index.html";
  const pageKey = pageKeyFromPath(rawPath);

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("data-page") === pageKey;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupMobileNavigation() {
  if (!menuToggle || !siteNav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open");
  });

  servicesDropdownToggle?.addEventListener("click", (event) => {
    if (!window.matchMedia("(max-width: 820px)").matches || !servicesDropdown) {
      return;
    }

    if (servicesDropdown.classList.contains("is-open")) {
      return;
    }

    event.preventDefault();
    servicesDropdown.classList.toggle("is-open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
      servicesDropdown?.classList.remove("is-open");
    });
  });
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

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      closeList();
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

  container.innerHTML = chunks.join("") || `<p>${escapeHtml(fallback)}</p>`;
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

function renderMissingState() {
  if (detailEyebrow) {
    detailEyebrow.textContent = "Content";
  }
  if (detailTitle) {
    detailTitle.textContent = "Item not found";
  }
  if (detailMeta) {
    detailMeta.textContent = "The requested page may no longer exist.";
  }
  if (detailSummary) {
    detailSummary.textContent = "Please use the main section pages to browse available content.";
  }
  renderMarkdown(detailBody, "", "Return to the relevant listing page to continue browsing.");
  setRequirements([]);

  if (detailPrimary) {
    detailPrimary.textContent = "Go to Home";
    detailPrimary.href = "index.html";
  }

  if (detailBack) {
    detailBack.href = "index.html";
    detailBack.textContent = "Back to Home";
  }
}

function renderService(service) {
  if (detailEyebrow) {
    detailEyebrow.textContent = "Service";
  }
  if (detailTitle) {
    detailTitle.textContent = service.title;
  }
  if (detailMeta) {
    detailMeta.textContent = "ADN Semiconductor Services";
  }
  if (detailSummary) {
    detailSummary.textContent = service.summary;
  }
  renderMarkdown(detailBody, service.body, "Service details are being updated.");
  setRequirements([]);

  if (detailPrimary) {
    detailPrimary.textContent = "Discuss This Service";
    detailPrimary.href = "contact.html";
  }
  if (detailBack) {
    detailBack.href = "services.html";
    detailBack.textContent = "Back to Services";
  }
}

function renderRole(role) {
  if (detailEyebrow) {
    detailEyebrow.textContent = "Career Role";
  }
  if (detailTitle) {
    detailTitle.textContent = role.title;
  }
  if (detailMeta) {
    detailMeta.textContent = `${role.team} · ${role.location} · ${role.type}`;
  }
  if (detailSummary) {
    detailSummary.textContent = role.summary;
  }
  renderMarkdown(detailBody, role.body, "Role details are being updated.");
  setRequirements(role.requirements);

  if (detailPrimary) {
    detailPrimary.textContent = "Apply";
    detailPrimary.href = role.applyUrl;
  }
  if (detailBack) {
    detailBack.href = "careers.html";
    detailBack.textContent = "Back to Careers";
  }
}

function renderInsight(insight) {
  if (detailEyebrow) {
    detailEyebrow.textContent = insight.type;
  }
  if (detailTitle) {
    detailTitle.textContent = insight.title;
  }
  if (detailMeta) {
    detailMeta.textContent = `${formatDate(insight.date)} · ${insight.author}`;
  }
  if (detailSummary) {
    detailSummary.textContent = insight.summary;
  }
  renderMarkdown(detailBody, insight.body, "Insight details are being updated.");
  setRequirements([]);

  if (detailPrimary) {
    detailPrimary.textContent = "Talk to Our Team";
    detailPrimary.href = normalizeInsightUrl(insight.url);
  }
  if (detailBack) {
    detailBack.href = "insights.html";
    detailBack.textContent = "Back to Insights";
  }
}

async function renderByTypeAndId(type, id) {
  if (type === "services") {
    const services = await loadServices();
    const service = services.find((item) => item.id === id);
    if (!service) {
      renderMissingState();
      return;
    }
    renderService(service);
    return;
  }

  if (type === "careers") {
    const roles = await loadRoles();
    const role = roles.find((item) => item.id === id);
    if (!role) {
      renderMissingState();
      return;
    }
    renderRole(role);
    return;
  }

  if (type === "insights") {
    const insights = await loadInsights();
    const insight = insights.find((item) => item.id === id);
    if (!insight) {
      renderMissingState();
      return;
    }
    renderInsight(insight);
    return;
  }

  renderMissingState();
}

async function init() {
  await layoutReadyPromise;

  yearNode = document.querySelector("#year");
  navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  menuToggle = document.querySelector(".menu-toggle");
  siteNav = document.querySelector("#site-nav");
  navServicesMenu = document.querySelector("#nav-services-menu");
  servicesDropdown = document.querySelector(".nav-dropdown");
  servicesDropdownToggle = document.querySelector(".nav-dropdown-toggle");

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || document.body.getAttribute("data-detail-type");
  const id = params.get("id") || document.body.getAttribute("data-detail-id");

  const servicesForMenu = await loadServices();
  renderServicesNavMenu(servicesForMenu);

  await renderByTypeAndId(type, id);

  setupMobileNavigation();
  applyActiveNavByPath();

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

init();
