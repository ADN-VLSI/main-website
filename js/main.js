import { formatDate, loadInsights, loadRoles } from "./content-service.js";

const insightsRoot = document.querySelector("#insights-list");
const careersRoot = document.querySelector("#careers-list");
const yearNode = document.querySelector("#year");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

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
      <p class="meta">${item.type} · ${formatDate(item.date)}</p>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <p class="meta">By ${item.author}</p>
      <a class="btn btn-secondary" href="${item.url}">Read More</a>
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
      ? `<ul>${role.requirements.map((req) => `<li>${req}</li>`).join("")}</ul>`
      : "";

    card.innerHTML = `
      <p class="meta">${role.team} · ${role.location}</p>
      <h3>${role.title}</h3>
      <p>${role.summary}</p>
      <p class="meta">${role.type}</p>
      ${requirements}
      <a class="btn btn-primary" href="${role.applyUrl}">Apply</a>
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

function setupScrollSpy() {
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          const active = link.getAttribute("data-nav") === id;
          link.classList.toggle("active", active);
          if (active) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-10% 0px -35%"
    }
  );

  sections.forEach((section) => observer.observe(section));
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

async function init() {
  const [insights, roles] = await Promise.all([loadInsights(), loadRoles()]);

  renderInsights(insights);
  renderRoles(roles);
  setupMobileNavigation();
  setupScrollSpy();
  setupReveals();

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

init();
