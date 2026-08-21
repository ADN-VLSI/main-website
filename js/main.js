import { formatDate, loadInsights, loadPeople, loadRoles, loadServices } from "./content-service.js";
import {
  applyActiveNavByPath,
  buildDetailPagePath,
  registerImageOnlyServiceWorker,
  renderServicesNavMenus,
  setupMobileNavigation,
  setupReveals
} from "./ui-shared.js";

const insightsRoot = document.querySelector("#insights-list");
const careersRoot = document.querySelector("#careers-list");
const servicesRoot = document.querySelector("#services-list");
const peopleRoot = document.querySelector("#people-list");
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
const contactForm = document.querySelector("#contact-inquiry-form");
const contactStatus = document.querySelector("#contact-form-status");
const careerForm = document.querySelector("#career-application-form");
const careerFormStatus = document.querySelector("#career-form-status");
const careerRoleSelect = document.querySelector("#career-role");
const insightsSearchInput = document.querySelector("#insights-search");
const insightsSearchStatus = document.querySelector("#insights-search-status");
const insightsCategoryFilters = document.querySelector("#insights-category-filters");
const insightsPaginationRoot = document.querySelector("#insights-pagination");
const insightsSearchToggle = document.querySelector("#insights-search-toggle");
const insightsSearchWrap = document.querySelector("#insights-search-wrap");
const careersSearchInput = document.querySelector("#careers-search");
const careersSearchStatus = document.querySelector("#careers-search-status");
const careersSearchToggle = document.querySelector("#careers-search-toggle");
const careersSearchWrap = document.querySelector("#careers-search-wrap");
const heroSlider = document.querySelector("#hero-slider");
const heroSlideTrack = document.querySelector("#hero-slide-track");
const heroSlideDotsRoot = document.querySelector("#hero-slider-dots");
let insightsData = [];
let rolesData = [];
let selectedInsightCategory = "all";
let insightsCurrentPage = 1;

const INSIGHTS_PAGE_SIZE = 6;

const INSIGHT_CATEGORY_ALIASES = Object.freeze({
  interview: "interviews",
  guide: "guides",
  benchmark: "benchmarks",
  study: "studies",
  story: "stories",
  article: "stories",
  blog: "stories",
  update: "news",
  event: "events",
  infographic: "infographics",
  announcement: "announcements"
});

const DEFAULT_INSIGHT_CATEGORIES = Object.freeze([
  { slug: "interviews", label: "Interviews" },
  { slug: "guides", label: "Guides" },
  { slug: "benchmarks", label: "Benchmarks" },
  { slug: "studies", label: "Studies" },
  { slug: "stories", label: "Stories" },
  { slug: "news", label: "News" },
  { slug: "events", label: "Events" },
  { slug: "infographics", label: "Infographics" },
  { slug: "announcements", label: "Announcements" }
]);

const DEFAULT_INSIGHT_CATEGORY_LABEL_BY_SLUG = new Map(
  DEFAULT_INSIGHT_CATEGORIES.map((item) => [item.slug, item.label])
);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildResponsiveImageAttributes(srcset, sizes, fallbackSizes) {
  const normalizedSrcset = String(srcset || "").trim();
  const normalizedSizes = String(sizes || fallbackSizes || "").trim();
  let attributes = "";

  if (normalizedSrcset) {
    attributes += ` srcset="${escapeHtml(normalizedSrcset)}"`;
  }

  if (normalizedSizes) {
    attributes += ` sizes="${escapeHtml(normalizedSizes)}"`;
  }

  return attributes;
}

function createEmptyState(message) {
  const card = document.createElement("article");
  card.className = "empty-state";
  card.setAttribute("role", "listitem");
  card.textContent = message;
  return card;
}

function toCategorySlug(value, fallback = "news") {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return fallback;
  }

  return INSIGHT_CATEGORY_ALIASES[slug] || slug;
}

function toCategoryLabel(slug) {
  const defaultLabel = DEFAULT_INSIGHT_CATEGORY_LABEL_BY_SLUG.get(slug);
  if (defaultLabel) {
    return defaultLabel;
  }

  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeInsightRecordCategory(item) {
  const normalizedCategory = toCategorySlug(item?.category || item?.type, "news");
  const normalizedLabel = toCategoryLabel(normalizedCategory);

  return {
    ...item,
    category: normalizedCategory,
    categoryLabel: item?.categoryLabel || normalizedLabel
  };
}

function createInsightCard(item) {
  const card = document.createElement("article");
  card.className = "info-card";
  card.setAttribute("role", "listitem");

  const imageMarkup = item.image
    ? `<img class="card-media" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"${buildResponsiveImageAttributes(item.imageSrcset, item.imageSizes, "(max-width: 980px) 100vw, 33vw")} loading="lazy" decoding="async" fetchpriority="low">`
    : "";

  card.innerHTML = `
    ${imageMarkup}
    <p class="meta">${escapeHtml(item.categoryLabel || item.type)} · ${escapeHtml(formatDate(item.date))}</p>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.summary)}</p>
    <p class="meta">By ${escapeHtml(item.author)}</p>
    <a class="btn btn-secondary" href="${escapeHtml(buildDetailPagePath("insights", item.id))}">Read More</a>
  `;

  return card;
}

function buildInsightCategoryOrder(items) {
  const known = DEFAULT_INSIGHT_CATEGORIES.map((item) => item.slug);
  const knownSet = new Set(known);
  const extra = Array.from(
    new Set(items.map((item) => toCategorySlug(item.category || item.type, "news")))
  ).filter((slug) => !knownSet.has(slug));

  return [...known, ...extra];
}

function readInsightCategoryFromUrl() {
  const categoryParam = new URLSearchParams(window.location.search).get("category");
  if (!categoryParam) {
    return "all";
  }

  return toCategorySlug(categoryParam, "all");
}

function writeInsightCategoryToUrl(categorySlug) {
  const url = new URL(window.location.href);
  if (!categorySlug || categorySlug === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", categorySlug);
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function renderInsightCategoryFilters(items) {
  if (!insightsCategoryFilters) {
    return;
  }

  insightsCategoryFilters.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "listing-category-chip";
  allButton.dataset.category = "all";
  allButton.setAttribute("role", "tab");
  allButton.setAttribute("aria-selected", String(selectedInsightCategory === "all"));
  allButton.classList.toggle("is-active", selectedInsightCategory === "all");
  allButton.textContent = "All";
  insightsCategoryFilters.append(allButton);

  const categoryOrder = buildInsightCategoryOrder(items);
  categoryOrder.forEach((slug) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "listing-category-chip";
    button.dataset.category = slug;
    button.setAttribute("role", "tab");

    const isActive = slug === selectedInsightCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.textContent = toCategoryLabel(slug);

    insightsCategoryFilters.append(button);
  });
}

function renderInsights(items) {
  if (!insightsRoot) {
    return;
  }

  insightsRoot.innerHTML = "";

  if (!items.length) {
    insightsRoot.append(
      createEmptyState(
        "Insights are being prepared. Add entries under content/insights/."
      )
    );
    return;
  }

  items.forEach((item) => {
    insightsRoot.append(createInsightCard(item));
  });
}

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function buildInsightSearchText(item) {
  return [
    item.title,
    item.summary,
    item.author,
    item.type,
    item.category,
    item.categoryLabel,
    item.date
  ]
    .map((value) => normalizeSearchText(value))
    .join(" ");
}

function buildRoleSearchText(role) {
  return [
    role.title,
    role.summary,
    role.team,
    role.location,
    role.type,
    ...(Array.isArray(role.requirements) ? role.requirements : [])
  ]
    .map((value) => normalizeSearchText(value))
    .join(" ");
}

function filterInsightsByQuery(items, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => buildInsightSearchText(item).includes(normalizedQuery));
}

function getInsightsInSelectedCategory() {
  if (selectedInsightCategory === "all") {
    return insightsData;
  }

  return insightsData.filter((item) => item.category === selectedInsightCategory);
}

function filterRoles(query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return rolesData;
  }

  return rolesData.filter((role) => buildRoleSearchText(role).includes(normalizedQuery));
}

function updateInsightsSearchStatus(totalCount, matchCount, pageCount, currentPage, query) {
  if (!insightsSearchStatus) {
    return;
  }

  if (!totalCount) {
    insightsSearchStatus.textContent = "";
    return;
  }

  const trimmedQuery = String(query || "").trim();
  const categorySuffix = selectedInsightCategory === "all"
    ? ""
    : ` in ${toCategoryLabel(selectedInsightCategory)}`;
  const pageSuffix = pageCount ? ` | Page ${currentPage}` : "";

  if (!trimmedQuery) {
    insightsSearchStatus.textContent = `${matchCount} insight${matchCount === 1 ? "" : "s"}${categorySuffix}${pageSuffix}`;
    return;
  }

  insightsSearchStatus.textContent = `${matchCount} of ${totalCount} insight${totalCount === 1 ? "" : "s"}${categorySuffix} match \"${trimmedQuery}\"${pageSuffix}`;
}

function renderInsightsPagination(totalItems, currentPage, pageSize = INSIGHTS_PAGE_SIZE) {
  if (!insightsPaginationRoot) {
    return;
  }

  insightsPaginationRoot.innerHTML = "";

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) {
    insightsPaginationRoot.hidden = true;
    return;
  }

  insightsPaginationRoot.hidden = false;

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "listing-pagination-btn";
  prevButton.dataset.page = String(currentPage - 1);
  prevButton.disabled = currentPage <= 1;
  prevButton.textContent = "Previous";
  insightsPaginationRoot.append(prevButton);

  for (let page = 1; page <= totalPages; page += 1) {
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.className = "listing-pagination-btn";
    pageButton.dataset.page = String(page);
    pageButton.textContent = String(page);

    const isCurrent = page === currentPage;
    pageButton.classList.toggle("is-active", isCurrent);
    pageButton.setAttribute("aria-current", isCurrent ? "page" : "false");

    insightsPaginationRoot.append(pageButton);
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "listing-pagination-btn";
  nextButton.dataset.page = String(currentPage + 1);
  nextButton.disabled = currentPage >= totalPages;
  nextButton.textContent = "Next";
  insightsPaginationRoot.append(nextButton);
}

function updateCareersSearchStatus(totalCount, visibleCount, query) {
  if (!careersSearchStatus) {
    return;
  }

  if (!totalCount) {
    careersSearchStatus.textContent = "";
    return;
  }

  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) {
    careersSearchStatus.textContent = `${visibleCount} role${visibleCount === 1 ? "" : "s"}`;
    return;
  }

  careersSearchStatus.textContent = `${visibleCount} of ${totalCount} role${totalCount === 1 ? "" : "s"} match \"${trimmedQuery}\"`;
}

function applyInsightsSearch() {
  if (!insightsRoot) {
    return;
  }

  const query = insightsSearchInput ? insightsSearchInput.value : "";
  const categoryScoped = getInsightsInSelectedCategory();
  const filtered = filterInsightsByQuery(categoryScoped, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / INSIGHTS_PAGE_SIZE));
  insightsCurrentPage = Math.min(Math.max(insightsCurrentPage, 1), totalPages);

  const start = (insightsCurrentPage - 1) * INSIGHTS_PAGE_SIZE;
  const pagedItems = filtered.slice(start, start + INSIGHTS_PAGE_SIZE);

  renderInsights(pagedItems);
  renderInsightsPagination(filtered.length, insightsCurrentPage);
  updateInsightsSearchStatus(categoryScoped.length, filtered.length, pagedItems.length, insightsCurrentPage, query);
}

function setupInsightCategoryFilters() {
  if (!insightsCategoryFilters || !insightsRoot) {
    return;
  }

  insightsCategoryFilters.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const chip = target.closest(".listing-category-chip");
    if (!(chip instanceof HTMLButtonElement)) {
      return;
    }

    const nextCategory = toCategorySlug(chip.dataset.category || "all", "all");
    if (nextCategory === selectedInsightCategory) {
      return;
    }

    selectedInsightCategory = nextCategory;
    insightsCurrentPage = 1;
    writeInsightCategoryToUrl(nextCategory);

    Array.from(insightsCategoryFilters.querySelectorAll(".listing-category-chip")).forEach((button) => {
      const isActive = (button instanceof HTMLButtonElement) && button.dataset.category === nextCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    applyInsightsSearch();
  });
}

function setupInsightsPagination() {
  if (!insightsPaginationRoot || !insightsRoot) {
    return;
  }

  insightsPaginationRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const pageButton = target.closest(".listing-pagination-btn");
    if (!(pageButton instanceof HTMLButtonElement) || pageButton.disabled) {
      return;
    }

    const nextPage = Number.parseInt(pageButton.dataset.page || "", 10);
    if (!Number.isFinite(nextPage) || nextPage < 1 || nextPage === insightsCurrentPage) {
      return;
    }

    insightsCurrentPage = nextPage;
    applyInsightsSearch();
    insightsRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setupCollapsibleListingSearch(options) {
  const {
    input,
    toggle,
    wrap,
    status
  } = options;

  if (!input || !toggle || !wrap) {
    return;
  }

  function setExpanded(expanded, options = {}) {
    const { focus = false } = options;
    wrap.classList.toggle("is-expanded", expanded);
    wrap.classList.toggle("is-collapsed", !expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    if (status) {
      status.classList.toggle("is-hidden", expanded);
    }

    if (expanded && focus) {
      input.focus();
    }
  }

  setExpanded(false);

  toggle.addEventListener("click", () => {
    const isExpanded = wrap.classList.contains("is-expanded");
    if (isExpanded && !input.value.trim()) {
      setExpanded(false);
      return;
    }

    setExpanded(true, { focus: true });
  });

  input.addEventListener("focus", () => {
    setExpanded(true);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (!input.value.trim()) {
      setExpanded(false);
      input.blur();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (wrap.contains(target) || toggle.contains(target)) {
      return;
    }

    if (!input.value.trim()) {
      setExpanded(false);
    }
  });
}

function setupCollapsibleListingSearches() {
  setupCollapsibleListingSearch({
    input: insightsSearchInput,
    toggle: insightsSearchToggle,
    wrap: insightsSearchWrap,
    status: insightsSearchStatus
  });

  setupCollapsibleListingSearch({
    input: careersSearchInput,
    toggle: careersSearchToggle,
    wrap: careersSearchWrap,
    status: careersSearchStatus
  });
}

function applyCareersSearch() {
  if (!careersRoot) {
    return;
  }

  const query = careersSearchInput ? careersSearchInput.value : "";
  const filtered = filterRoles(query);
  renderRoles(filtered);
  updateCareersSearchStatus(rolesData.length, filtered.length, query);
}

function setupListingSearch() {
  if (insightsSearchInput && insightsRoot) {
    insightsSearchInput.addEventListener("input", () => {
      insightsCurrentPage = 1;
      applyInsightsSearch();
    });
  }

  if (careersSearchInput && careersRoot) {
    careersSearchInput.addEventListener("input", applyCareersSearch);
  }
}

function renderServices(services) {
  if (!servicesRoot) {
    return;
  }

  servicesRoot.innerHTML = "";

  if (!services.length) {
    servicesRoot.append(
      createEmptyState("Service content is being prepared.")
    );
    return;
  }

  services.forEach((service) => {
    const card = document.createElement("article");
    card.className = "info-card";
    card.setAttribute("role", "listitem");

    const imageMarkup = service.image
      ? `<img class="card-media" src="${escapeHtml(service.image)}" alt="${escapeHtml(service.title)}"${buildResponsiveImageAttributes(service.imageSrcset, service.imageSizes, "(max-width: 980px) 100vw, 50vw")} loading="lazy" decoding="async" fetchpriority="low">`
      : "";

    card.innerHTML = `
      ${imageMarkup}
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.summary)}</p>
      <a class="btn btn-secondary" href="${escapeHtml(buildDetailPagePath("services", service.id))}">Learn More</a>
    `;

    servicesRoot.append(card);
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
      <a class="btn btn-secondary" href="${escapeHtml(buildDetailPagePath("careers", role.id))}">View Role</a>
      <a class="btn btn-primary js-career-apply" href="#career-application" data-role-title="${escapeHtml(role.title)}" data-apply-url="${escapeHtml(role.applyUrl)}">Apply</a>
    `;

    careersRoot.append(card);
  });
}

function setupCareerApplyButtons() {
  if (!careersRoot) {
    return;
  }

  careersRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const applyLink = target.closest(".js-career-apply");
    if (!(applyLink instanceof HTMLAnchorElement)) {
      return;
    }

    event.preventDefault();

    const roleTitle = String(applyLink.dataset.roleTitle || "").trim();
    const applyUrl = String(applyLink.dataset.applyUrl || "").trim();
    const formSection = document.querySelector("#career-application");

    if (careerRoleSelect && roleTitle) {
      careerRoleSelect.value = roleTitle;
    }

    if (formSection instanceof HTMLElement) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      if (careerFormStatus) {
        careerFormStatus.textContent = roleTitle
          ? `You are applying for: ${roleTitle}`
          : "Complete the form to apply.";
      }
      return;
    }

    if (applyUrl) {
      window.location.href = applyUrl;
    }
  });
}

function populateCareerRoleOptions(roles) {
  if (!careerRoleSelect) {
    return;
  }

  careerRoleSelect
    .querySelectorAll("option[data-role-option='opening']")
    .forEach((option) => option.remove());

  if (!roles.length) {
    return;
  }

  const roleOptions = document.createDocumentFragment();

  roles.forEach((role) => {
    const option = document.createElement("option");
    option.value = role.title;
    option.textContent = `${role.title} (${role.location})`;
    option.dataset.roleOption = "opening";
    roleOptions.append(option);
  });

  careerRoleSelect.append(roleOptions);
}

function applyCareerRoleFromUrl() {
  if (!careerRoleSelect) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const requestedRole = String(params.get("apply") || "").trim();
  if (!requestedRole) {
    return;
  }

  const hasRequestedRole = Array.from(careerRoleSelect.options).some(
    (option) => option.value === requestedRole
  );

  if (!hasRequestedRole) {
    return;
  }

  careerRoleSelect.value = requestedRole;

  const formSection = document.querySelector("#career-application");
  if (formSection instanceof HTMLElement) {
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (careerFormStatus) {
    careerFormStatus.textContent = `You are applying for: ${requestedRole}`;
  }
}

function renderPeople(people) {
  if (!peopleRoot) {
    return;
  }

  peopleRoot.innerHTML = "";

  const selectedIds = [
    "people-asif-mahmood",
    "people-faruque-a-khan",
    "people-foez-ahmed"
  ];

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const selectedPeople = selectedIds
    .map((id) => peopleById.get(id))
    .filter(Boolean);

  if (!selectedPeople.length) {
    peopleRoot.append(
      createEmptyState(
        "Team profiles are being prepared."
      )
    );
    return;
  }

  const grid = document.createElement("div");
  grid.className = "card-grid people-grid";
  grid.setAttribute("role", "list");

  selectedPeople.forEach((person) => {
    const card = document.createElement("article");
    card.className = "info-card person-card person-card-engineering";
    card.setAttribute("role", "listitem");

    const fallbackImagePath = `/people/${person.id.replace(/^people-/, "person-")}.png`;
    const portraitSrc = person.image || fallbackImagePath;

    const initials = person.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    const portraitMarkup = portraitSrc
      ? `<img class="person-portrait-image" src="${escapeHtml(portraitSrc)}" alt="${escapeHtml(person.name)}"${buildResponsiveImageAttributes(person.imageSrcset, person.imageSizes, "(max-width: 980px) 100vw, 33vw")} loading="lazy" decoding="async" fetchpriority="low">`
      : `<span class="person-portrait-fallback" aria-hidden="true">${escapeHtml(initials || "AD")}</span>`;

    card.innerHTML = `
      <div class="person-portrait">${portraitMarkup}</div>
      <h3>${escapeHtml(person.name)}</h3>
      <p class="meta">${escapeHtml(person.title)}</p>
      <p>${escapeHtml(person.summary)}</p>
      <p class="meta">${escapeHtml(person.focus)}</p>
      <a class="btn btn-secondary" href="${escapeHtml(buildDetailPagePath("people", person.id))}">View Profile</a>
    `;

    grid.append(card);
  });

  peopleRoot.append(grid);
}

function setupContactForm() {
  if (!contactForm) {
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener("submit", async (event) => {
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
        contactStatus.textContent = "Please fill Full Name, Work Email, and Interest.";
      }
      return;
    }

    if (contactStatus) {
      contactStatus.textContent = "Sending your inquiry...";
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    try {
      const payload = new FormData();
      payload.append("name", name);
      payload.append("email", email);
      payload.append("service", service);
      payload.append("stage", stage || "Not specified");
      payload.append("timeline", timeline || "Not specified");
      payload.append("message", message || "No additional notes provided.");
      payload.append("_subject", `Service Inquiry - ${service}`);
      payload.append("_captcha", "false");
      payload.append("_replyto", email);

      const response = await fetch("https://formsubmit.co/ajax/info@adnsemicon.com", {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error(`Failed to submit inquiry: ${response.status}`);
      }

      if (contactStatus) {
        contactStatus.textContent = "Inquiry sent successfully. Our team will contact you soon.";
      }
      contactForm.reset();
    } catch (error) {
      console.error(error);
      if (contactStatus) {
        contactStatus.textContent = "We could not send your inquiry right now. Please try again.";
      }
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}

function setupCareerForm() {
  if (!careerForm) {
    return;
  }

  const submitButton = careerForm.querySelector('button[type="submit"]');

  careerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(careerForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const role = String(formData.get("role") || "").trim();
    const experience = String(formData.get("experience") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const notice = String(formData.get("notice") || "").trim();
    const resume = String(formData.get("resume") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !role || !resume) {
      if (careerFormStatus) {
        careerFormStatus.textContent = "Please fill Full Name, Email Address, Position of Interest, and provide a Resume/LinkedIn URL.";
      }
      return;
    }

    if (careerFormStatus) {
      careerFormStatus.textContent = "Submitting your application...";
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    const subjectInput = careerForm.querySelector('input[name="_subject"]');
    const replyToInput = careerForm.querySelector('input[name="_replyto"]');
    const nextInput = careerForm.querySelector('input[name="_next"]');

    if (subjectInput instanceof HTMLInputElement) {
      subjectInput.value = `Career Application - ${role}`;
    }

    if (replyToInput instanceof HTMLInputElement) {
      replyToInput.value = email;
    }

    if (nextInput instanceof HTMLInputElement) {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.searchParams.set("applied", "1");
      redirectUrl.hash = "career-application";
      nextInput.value = redirectUrl.toString();
    }

    careerForm.setAttribute("action", "https://formsubmit.co/career@adnsemicon.com");
    careerForm.setAttribute("method", "POST");
    careerForm.submit();
  });
}

async function setupHeroSlider() {
  if (!heroSlider || !heroSlideTrack) {
    return;
  }

  const fallbackSrc = "slides/fpga.png";
  const fallbackAlt = "ADN Semiconductors featured capability";
  const slideDurationMs = 4500;
  const transitionMs = 700;
  const manifestPath = heroSlider.getAttribute("data-manifest") || "slides/index.json";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let slides = [];
  let dots = [];
  let slideContents = [];
  let currentIndex = 0;
  let autoplayTimer = null;

  try {
    const response = await fetch(manifestPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${manifestPath}: ${response.status}`);
    }

    const payload = await response.json();
    const records = Array.isArray(payload?.slides) ? payload.slides : [];

    slides = records
      .map((entry) => {
        if (typeof entry === "string") {
          const src = entry.trim();
          return src ? { src, alt: fallbackAlt } : null;
        }

        if (!entry || typeof entry !== "object") {
          return null;
        }

        const src = String(entry.src || "").trim();
        const alt = String(entry.alt || fallbackAlt).trim();
        const srcset = String(entry.srcset || "").trim();
        const sizes = String(entry.sizes || "").trim();
        const eyebrow = String(entry.eyebrow || "").trim();
        const title = String(entry.title || "").trim();
        const description = String(entry.description || "").trim();
        const cta = String(entry.cta || "").trim();
        const href = String(entry.href || "").trim();
        if (!src) {
          return null;
        }

        return {
          src,
          alt: alt || fallbackAlt,
          srcset,
          sizes,
          eyebrow,
          title,
          description,
          cta,
          href
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn(error);
  }

  if (!slides.length) {
    slides = [{ src: fallbackSrc, alt: fallbackAlt }];
  }

  const renderedSlides = slides.length > 1 ? [...slides, slides[0]] : [...slides];

  heroSlideTrack.innerHTML = "";
  slideContents = [];
  renderedSlides.forEach((slide, index) => {
    const frame = document.createElement("div");
    frame.className = "hero-slide-frame";

    const content = document.createElement("div");
    content.className = "hero-slide-content";
    content.setAttribute("aria-hidden", index === 0 ? "false" : "true");
    content.innerHTML = `
      ${slide.eyebrow ? `<p class="hero-slide-eyebrow">${escapeHtml(slide.eyebrow)}</p>` : ""}
      ${slide.title ? `<h1>${escapeHtml(slide.title)}</h1>` : ""}
      ${slide.description ? `<p class="hero-slide-description">${escapeHtml(slide.description)}</p>` : ""}
      ${slide.cta && slide.href ? `<a class="btn btn-primary hero-slide-cta" href="${escapeHtml(slide.href)}">${escapeHtml(slide.cta)}</a>` : ""}
    `;

    const image = document.createElement("img");
    image.className = "hero-slide-image";
    image.src = slide.src;
    image.alt = slide.alt;
    if (slide.srcset) {
      image.srcset = slide.srcset;
    }
    if (slide.sizes) {
      image.sizes = slide.sizes;
    }
    image.loading = index === 0 ? "eager" : "lazy";
    image.fetchPriority = index === 0 ? "high" : "low";
    image.decoding = "async";
    image.addEventListener("error", () => {
      if (image.src.endsWith(fallbackSrc)) {
        return;
      }
      image.src = fallbackSrc;
      image.alt = fallbackAlt;
    });

    frame.append(image, content);
    heroSlideTrack.append(frame);
    slideContents.push(content);
  });

  function setTrackPosition(index, animate = true) {
    heroSlideTrack.style.transition = animate
      ? `transform ${transitionMs}ms cubic-bezier(0.24, 0.72, 0.2, 1)`
      : "none";
    heroSlideTrack.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
  }

  function clearAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function setSlide(index, animate = true) {
    currentIndex = (index + slides.length) % slides.length;
    setTrackPosition(currentIndex, animate);

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
    slideContents.forEach((content, contentIndex) => {
      content.setAttribute("aria-hidden", String(contentIndex !== currentIndex));
    });
  }

  function goToNextSlide() {
    if (slides.length < 2) {
      return;
    }

    if (currentIndex < slides.length - 1) {
      setSlide(currentIndex + 1, true);
      return;
    }

    heroSlideTrack.style.transition = `transform ${transitionMs}ms cubic-bezier(0.24, 0.72, 0.2, 1)`;
    heroSlideTrack.style.transform = `translate3d(-${slides.length * 100}%, 0, 0)`;

    heroSlideTrack.addEventListener("transitionend", () => {
      currentIndex = 0;
      setTrackPosition(0, false);
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });
      slideContents.forEach((content, contentIndex) => {
        content.setAttribute("aria-hidden", String(contentIndex !== currentIndex));
      });
    }, { once: true });
  }

  function startAutoplay() {
    clearAutoplay();
    if (prefersReducedMotion || slides.length < 2) {
      return;
    }

    autoplayTimer = window.setInterval(() => {
      goToNextSlide();
    }, slideDurationMs);
  }

  if (heroSlideDotsRoot) {
    heroSlideDotsRoot.innerHTML = "";
    dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = "hero-slider-dot";
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", "false");
      dot.setAttribute("aria-label", `Slide ${index + 1}`);
      dot.addEventListener("click", () => {
        setSlide(index, true);
        startAutoplay();
      });
      heroSlideDotsRoot.append(dot);
      return dot;
    });
  }

  heroSlider.classList.toggle("is-single", slides.length < 2);

  heroSlider.addEventListener("mouseenter", clearAutoplay);
  heroSlider.addEventListener("mouseleave", startAutoplay);
  heroSlider.addEventListener("focusin", clearAutoplay);
  heroSlider.addEventListener("focusout", startAutoplay);

  setSlide(0, false);
  startAutoplay();
}

async function init() {
  await layoutReadyPromise;

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

  registerImageOnlyServiceWorker();

  const insightPromise = insightsRoot ? loadInsights() : Promise.resolve([]);
  const rolesPromise = careersRoot ? loadRoles() : Promise.resolve([]);
  const servicesPromise = (servicesRoot || navServicesMenu || footerServicesMenu) ? loadServices() : Promise.resolve([]);
  const peoplePromise = peopleRoot ? loadPeople() : Promise.resolve([]);
  const [insights, roles, services, people] = await Promise.all([
    insightPromise,
    rolesPromise,
    servicesPromise,
    peoplePromise
  ]);

  insightsData = insights.map(normalizeInsightRecordCategory);
  selectedInsightCategory = readInsightCategoryFromUrl();
  if (selectedInsightCategory !== "all") {
    const availableCategories = new Set(insightsData.map((item) => item.category));
    if (!availableCategories.has(selectedInsightCategory)) {
      selectedInsightCategory = "all";
      writeInsightCategoryToUrl("all");
    }
  }
  renderInsightCategoryFilters(insightsData);
  setupInsightCategoryFilters();
  setupInsightsPagination();
  setupCollapsibleListingSearches();
  rolesData = roles;
  setupListingSearch();
  applyInsightsSearch();
  applyCareersSearch();
  populateCareerRoleOptions(roles);
  applyCareerRoleFromUrl();
  renderServices(services);
  renderPeople(people);
  renderServicesNavMenus({ navServicesMenu, footerServicesMenu }, services);
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
  setupCareerApplyButtons();
  setupContactForm();
  setupCareerForm();
  await setupHeroSlider();

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

init();
