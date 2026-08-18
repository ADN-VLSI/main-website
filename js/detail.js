import { formatDate, loadInsights, loadRoles, loadServices } from "./content-service.js";

const yearNode = document.querySelector("#year");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const navServicesMenu = document.querySelector("#nav-services-menu");
const servicesDropdown = document.querySelector(".nav-dropdown");
const servicesDropdownToggle = document.querySelector(".nav-dropdown-toggle");

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

function setParagraphs(container, text, fallback) {
  if (!container) {
    return;
  }

  const content = String(text || "").trim() || fallback;
  const paragraphs = content
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  container.innerHTML = paragraphs || `<p>${escapeHtml(fallback)}</p>`;
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
  setParagraphs(detailBody, "", "Return to the relevant listing page to continue browsing.");
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
  setParagraphs(detailBody, service.body, "Service details are being updated.");
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
  setParagraphs(detailBody, role.body, "Role details are being updated.");
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
  setParagraphs(detailBody, insight.body, "Insight details are being updated.");
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
