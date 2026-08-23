import {
  applyActiveNavByPath,
  registerImageOnlyServiceWorker,
  renderServicesNavMenus,
  setupMobileNavigation,
  setupReveals
} from "./ui-shared.js";
import { DEDICATED_SERVICES_MENU, PEOPLE_PAGES, SERVICE_PAGES } from "./dedicated-content.js";

const layoutReadyPromise = window.__layoutReady instanceof Promise
  ? window.__layoutReady
  : Promise.resolve();

function renderShell() {
  const root = document.querySelector("#main-content");
  if (!root) {
    return;
  }

  root.innerHTML = `
    <section class="section reveal">
      <div class="container detail-shell">
        <div class="detail-person-layout" id="detail-person-layout">
          <section class="detail-person-primary">
            <div class="detail-person-intro">
              <p class="eyebrow" id="detail-eyebrow">Content</p>
              <h1 id="detail-title">Loading...</h1>
              <p class="meta" id="detail-meta"></p>
              <p id="detail-summary"></p>
            </div>
            <div class="detail-person-portrait">
              <img class="detail-person-image" id="detail-person-image" alt="" hidden>
            </div>
          </section>
          <section class="detail-person-details">
            <div class="detail-body" id="detail-body"></div>
            <ul class="detail-list" id="detail-list" hidden></ul>
            <div class="detail-actions">
              <a class="btn btn-primary" id="detail-primary" href="contact.html">Contact ADN</a>
              <a class="btn btn-secondary" id="detail-back" href="index.html">Back to Home</a>
            </div>
          </section>
        </div>
      </div>
    </section>
  `;
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value;
  }
}

function setImage(imagePath, altText) {
  const image = document.querySelector("#detail-person-image");
  if (!image) {
    return;
  }

  if (!imagePath) {
    image.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    return;
  }

  image.src = imagePath;
  image.alt = altText;
  image.hidden = false;
}

function setListItems(items) {
  const listNode = document.querySelector("#detail-list");
  if (!listNode) {
    return;
  }

  if (!Array.isArray(items) || !items.length) {
    listNode.hidden = true;
    listNode.innerHTML = "";
    return;
  }

  listNode.hidden = false;
  listNode.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function setActions(primary, back) {
  const primaryNode = document.querySelector("#detail-primary");
  const backNode = document.querySelector("#detail-back");

  if (primaryNode) {
    primaryNode.textContent = primary.text;
    primaryNode.href = primary.href;
  }

  if (backNode) {
    backNode.textContent = back.text;
    backNode.href = back.href;
  }
}

function setPageMetadata(title, description) {
  if (title) {
    document.title = `ADN Semiconductors | ${title}`;
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && description) {
    metaDescription.setAttribute("content", description);
  }
}

function normalizeDashes(value) {
  return String(value || "").replace(/[\u2010-\u2015\u2212]/g, "-");
}

function toAnchorSlug(value, fallback = "section") {
  const slug = normalizeDashes(String(value || ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

function assignDetailHeadingIds() {
  const headings = Array.from(document.querySelectorAll("#detail-body h2, #detail-body h3"));
  const used = new Set();

  headings.forEach((heading, index) => {
    const baseId = toAnchorSlug(heading.textContent, `section-${index + 1}`);
    let nextId = baseId;
    let suffix = 2;

    while (used.has(nextId) || document.getElementById(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    heading.id = nextId;
    used.add(nextId);
  });
}

function scrollToDetailHash(hashValue = window.location.hash) {
  const rawHash = String(hashValue || "").replace(/^#/, "").trim();
  if (!rawHash) {
    return;
  }

  const decodedHash = normalizeDashes(decodeURIComponent(rawHash));
  const directTarget = document.getElementById(decodedHash);
  if (directTarget) {
    directTarget.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const slug = toAnchorSlug(decodedHash);
  const slugTarget = document.getElementById(slug);
  if (slugTarget) {
    slugTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderPerson(person) {
  const layout = document.querySelector("#detail-person-layout");
  layout?.classList.add("is-person");

  setText("#detail-eyebrow", "People");
  setText("#detail-title", person.name);
  setText("#detail-meta", `${person.title} · ${person.focus}`);
  setText("#detail-summary", person.summary);
  setPageMetadata(person.name, person.summary);
  setImage(person.image, person.name);

  const bodyNode = document.querySelector("#detail-body");
  if (bodyNode) {
    bodyNode.innerHTML = person.bodyHtml;
  }

  setListItems(person.expertise);
  setActions(person.primary, { text: "Back to People", href: "people.html" });
}

function renderService(service) {
  const layout = document.querySelector("#detail-person-layout");
  layout?.classList.add("is-service");

  if (service.image) {
    layout?.style.setProperty("--detail-hero-image", `url("${service.image}")`);
  }

  setText("#detail-eyebrow", "Service");
  setText("#detail-title", service.title);
  setText("#detail-meta", "ADN Semiconductor Services");
  setText("#detail-summary", service.summary);
  setPageMetadata(service.title, service.summary);
  setImage("", "");

  const bodyNode = document.querySelector("#detail-body");
  if (bodyNode) {
    bodyNode.innerHTML = service.bodyHtml;
    assignDetailHeadingIds();
  }

  setListItems([]);
  setActions(service.primary, { text: "Back to Services", href: "services.html" });
}

function renderMissing() {
  setText("#detail-eyebrow", "Content");
  setText("#detail-title", "Page not found");
  setText("#detail-meta", "The requested content could not be loaded.");
  setText("#detail-summary", "Please use the section listings to continue browsing.");
  setImage("", "");
  setListItems([]);

  const bodyNode = document.querySelector("#detail-body");
  if (bodyNode) {
    bodyNode.innerHTML = "<p>Return to home or visit the main section pages.</p>";
  }

  setActions(
    { text: "Go to Home", href: "index.html" },
    { text: "Back to Home", href: "index.html" }
  );
}

async function init() {
  renderShell();
  await layoutReadyPromise;

  registerImageOnlyServiceWorker();

  const yearNode = document.querySelector("#year");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  const navServicesMenu = document.querySelector("#nav-services-menu");
  const footerServicesMenu = document.querySelector("#footer-services-menu");
  const servicesDropdown = document.querySelector("#nav-services-menu")?.closest(".nav-dropdown") || null;
  const servicesDropdownToggle = servicesDropdown?.querySelector(".nav-dropdown-toggle") || null;
  const insightsDropdown = document.querySelector(".nav-dropdown-menu[aria-label='Insights submenu']")?.closest(".nav-dropdown") || null;
  const insightsDropdownToggle = insightsDropdown?.querySelector(".nav-dropdown-toggle") || null;

  renderServicesNavMenus({ navServicesMenu, footerServicesMenu }, DEDICATED_SERVICES_MENU);
  setupMobileNavigation({
    menuToggle,
    siteNav,
    navLinks,
    servicesDropdown,
    servicesDropdownToggle,
    insightsDropdown,
    insightsDropdownToggle
  });
  applyActiveNavByPath(navLinks);
  setupReveals();

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  const pageType = String(document.body.getAttribute("data-detail-type") || "").trim();
  const pageId = String(document.body.getAttribute("data-detail-id") || "").trim();

  if (pageType === "people") {
    const person = PEOPLE_PAGES[pageId];
    if (person) {
      renderPerson(person);
      return;
    }
  }

  if (pageType === "services") {
    const service = SERVICE_PAGES[pageId];
    if (service) {
      renderService(service);
      scrollToDetailHash(window.location.hash);
      return;
    }
  }

  renderMissing();
}

window.addEventListener("hashchange", () => {
  scrollToDetailHash(window.location.hash);
});

window.addEventListener("load", () => {
  scrollToDetailHash(window.location.hash);
});

init();
