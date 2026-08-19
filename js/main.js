import { formatDate, loadInsights, loadPeople, loadRoles, loadServices } from "./content-service.js";

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
const contactForm = document.querySelector("#contact-inquiry-form");
const contactStatus = document.querySelector("#contact-form-status");
const heroSlider = document.querySelector("#hero-slider");
const heroSlideTrack = document.querySelector("#hero-slide-track");
const heroSlideDotsRoot = document.querySelector("#hero-slider-dots");

function shouldEnableServiceWorker() {
  return false;
}

async function disableLocalServiceWorkerCaching() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch (_) {
    // Ignore cleanup failures in development.
  }

  if (!window.caches) {
    return;
  }

  try {
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys
        .filter((key) => key.startsWith("adn-"))
        .map((key) => caches.delete(key))
    );
  } catch (_) {
    // Ignore cleanup failures in development.
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (!shouldEnableServiceWorker()) {
    // Keep local and production behavior deterministic: no SW caching.
    disableLocalServiceWorkerCaching();
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

function buildDetailPagePath(type, id) {
  return `detail.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
}

function applyActiveNavByPath() {
  const rawPath = window.location.pathname.split("/").pop() || "index.html";
  let path = rawPath;

  if (path.startsWith("service-")) {
    path = "services.html";
  } else if (path.startsWith("insight-")) {
    path = "insights.html";
  } else if (path.startsWith("role-")) {
    path = "careers.html";
  }

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

function renderServiceMenu(menuRoot, services) {
  if (!menuRoot) {
    return;
  }

  menuRoot.innerHTML = "";

  services.forEach((service) => {
    const link = document.createElement("a");
    link.href = buildDetailPagePath("services", service.id);
    link.textContent = service.title;
    menuRoot.append(link);
  });
}

function renderServicesNavMenu(services) {
  renderServiceMenu(navServicesMenu, services);
  renderServiceMenu(footerServicesMenu, services);
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
    const card = document.createElement("article");
    card.className = "info-card";
    card.setAttribute("role", "listitem");

    const imageMarkup = item.image
      ? `<img class="card-media" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"${buildResponsiveImageAttributes(item.imageSrcset, item.imageSizes, "(max-width: 980px) 100vw, 33vw")} loading="lazy" decoding="async" fetchpriority="low">`
      : "";

    card.innerHTML = `
      ${imageMarkup}
      <p class="meta">${escapeHtml(item.type)} · ${escapeHtml(formatDate(item.date))}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <p class="meta">By ${escapeHtml(item.author)}</p>
      <a class="btn btn-secondary" href="${escapeHtml(buildDetailPagePath("insights", item.id))}">Read More</a>
    `;

    insightsRoot.append(card);
  });
}

function renderServices(services) {
  if (!servicesRoot) {
    return;
  }

  servicesRoot.innerHTML = "";

  if (!services.length) {
    servicesRoot.append(
      createEmptyState("Service content is being prepared. Add entries under content/services/.")
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
      <a class="btn btn-primary" href="${escapeHtml(role.applyUrl)}">Apply</a>
    `;

    careersRoot.append(card);
  });
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
        "Team profiles are being prepared. Add entries under content/people/."
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

    const fallbackImagePath = `content/people/${person.id.replace(/^people-/, "person-")}.png`;
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

function setupMobileNavigation() {
  if (!menuToggle || !siteNav) {
    return;
  }

  const isCompactNavigation = () => window.matchMedia("(max-width: 820px)").matches;
  const closeNavigation = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    servicesDropdown?.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeNavigation();
      return;
    }

    menuToggle.setAttribute("aria-expanded", "true");
    siteNav.classList.add("is-open");
  });

  servicesDropdownToggle?.addEventListener("click", (event) => {
    if (!isCompactNavigation() || !servicesDropdown) {
      return;
    }

    event.preventDefault();
    servicesDropdown.classList.toggle("is-open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("click", (event) => {
    if (!isCompactNavigation() || !siteNav.classList.contains("is-open")) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (siteNav.contains(target) || menuToggle.contains(target)) {
      return;
    }

    closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });

  window.addEventListener("resize", () => {
    if (!isCompactNavigation()) {
      closeNavigation();
    }
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
        contactStatus.textContent = "Please fill Full Name, Work Email, and Service Interest.";
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

      const response = await fetch("https://formsubmit.co/ajax/foez.ahmed@adnsemicon.com", {
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

async function setupHeroSlider() {
  if (!heroSlider || !heroSlideTrack) {
    return;
  }

  const fallbackSrc = "silver-metallic-textured-background.jpg";
  const fallbackAlt = "ADN Semiconductors featured capability";
  const slideDurationMs = 4500;
  const transitionMs = 700;
  const manifestPath = heroSlider.getAttribute("data-manifest") || "slides/index.json";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let slides = [];
  let dots = [];
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
        if (!src) {
          return null;
        }

        return {
          src,
          alt: alt || fallbackAlt,
          srcset,
          sizes
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
  renderedSlides.forEach((slide, index) => {
    const frame = document.createElement("div");
    frame.className = "hero-slide-frame";

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

    frame.append(image);
    heroSlideTrack.append(frame);
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
  servicesDropdown = document.querySelector(".nav-dropdown");
  servicesDropdownToggle = document.querySelector(".nav-dropdown-toggle");

  registerServiceWorker();

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

  renderInsights(insights);
  renderRoles(roles);
  renderServices(services);
  renderPeople(people);
  renderServicesNavMenu(services);
  setupMobileNavigation();
  applyActiveNavByPath();
  setupReveals();
  setupContactForm();
  await setupHeroSlider();

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

init();
