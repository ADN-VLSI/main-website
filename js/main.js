import { formatDate, loadInsights, loadRoles } from "./content-service.js";

const insightsRoot = document.querySelector("#insights-list");
const careersRoot = document.querySelector("#careers-list");
const yearNode = document.querySelector("#year");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const contactForm = document.querySelector("#contact-inquiry-form");
const contactStatus = document.querySelector("#contact-form-status");

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Fail silently; caching is an enhancement and should not block site behavior.
    });
  });
}

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

function applyActiveNavByPath() {
  const path = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("data-page") === path;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function createEmptyState(message) {
  const card = document.createElement("article");
  card.className = "empty-state";
  card.setAttribute("role", "listitem");
  card.textContent = message;
  return card;
}

function renderInsights(items) {
  if (!insightsRoot) {
    return;
  }

  insightsRoot.innerHTML = "";

  if (!items.length) {
    insightsRoot.append(
      createEmptyState(
        "Insights are being prepared. Add entries in data/insights.json or use the local content tools."
      )
    );
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "info-card";
    card.setAttribute("role", "listitem");

    card.innerHTML = `
      <p class="meta">${escapeHtml(item.type)} · ${escapeHtml(formatDate(item.date))}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <p class="meta">By ${escapeHtml(item.author)}</p>
      <a class="btn btn-secondary" href="${escapeHtml(normalizeInsightUrl(item.url))}">Read More</a>
    `;

    insightsRoot.append(card);
  });
}

function renderRoles(roles) {
  if (!careersRoot) {
    return;
  }

  careersRoot.innerHTML = "";

  if (!roles.length) {
    careersRoot.append(
      createEmptyState(
        "No roles are open right now. Check back soon or contact us for future opportunities."
      )
    );
    return;
  }

  roles.forEach((role) => {
    const card = document.createElement("article");
    card.className = "info-card";
    card.setAttribute("role", "listitem");

    const requirements = role.requirements.length
      ? `<ul>${role.requirements.map((req) => `<li>${escapeHtml(req)}</li>`).join("")}</ul>`
      : "";

    card.innerHTML = `
      <p class="meta">${escapeHtml(role.team)} · ${escapeHtml(role.location)}</p>
      <h3>${escapeHtml(role.title)}</h3>
      <p>${escapeHtml(role.summary)}</p>
      <p class="meta">${escapeHtml(role.type)}</p>
      ${requirements}
      <a class="btn btn-primary" href="${escapeHtml(role.applyUrl)}">Apply</a>
    `;

    careersRoot.append(card);
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

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

function setupReveals() {
  const revealTargets = document.querySelectorAll(".reveal");
  if (!revealTargets.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -5%"
    }
  );

  revealTargets.forEach((node) => observer.observe(node));
}

function setupContactForm() {
  if (!contactForm) {
    return;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const stage = String(formData.get("stage") || "").trim();
    const timeline = String(formData.get("timeline") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !service) {
      if (contactStatus) {
        contactStatus.textContent = "Please fill Full Name, Work Email, and Service Interest.";
      }
      return;
    }

    const subject = `Service Inquiry - ${service}`;
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Service Interest: ${service}`,
      `Program Stage: ${stage || "Not specified"}`,
      `Desired Timeline: ${timeline || "Not specified"}`,
      "",
      "Project Notes:",
      message || "No additional notes provided."
    ];

    const href = `mailto:contact@adnsemiconductors.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    if (contactStatus) {
      contactStatus.textContent = "Opening your mail app with a prefilled inquiry...";
    }

    window.location.href = href;
  });
}

async function init() {
  registerServiceWorker();

  const insightPromise = insightsRoot ? loadInsights() : Promise.resolve([]);
  const rolesPromise = careersRoot ? loadRoles() : Promise.resolve([]);
  const [insights, roles] = await Promise.all([insightPromise, rolesPromise]);

  renderInsights(insights);
  renderRoles(roles);
  setupMobileNavigation();
  applyActiveNavByPath();
  setupReveals();
  setupContactForm();

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

init();
