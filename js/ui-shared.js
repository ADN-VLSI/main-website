export function buildDetailPagePath(type, id) {
  if (type === "services" && String(id || "").startsWith("service-")) {
    return `services/${String(id).replace(/^service-/, "")}.html`;
  }

  if (type === "people" && String(id || "").startsWith("people-")) {
    return `people/${String(id).replace(/^people-/, "")}.html`;
  }

  return `detail.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
}

export function renderServiceMenu(menuRoot, services) {
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

export function renderServicesNavMenus(hosts, services) {
  const { navServicesMenu, footerServicesMenu } = hosts;
  renderServiceMenu(navServicesMenu, services);
  renderServiceMenu(footerServicesMenu, services);
}

function defaultPageKeyFromPath(path) {
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

export function applyActiveNavByPath(navLinks, resolvePageKey = defaultPageKeyFromPath) {
  const explicitPageKey = document.body?.getAttribute("data-page-key");
  if (explicitPageKey) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("data-page") === explicitPageKey;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    return;
  }

  const rawPath = window.location.pathname.split("/").pop() || "index.html";
  const pageKey = resolvePageKey(rawPath);

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

export function setupMobileNavigation(options) {
  const {
    menuToggle,
    siteNav,
    navLinks,
    compactMediaQuery = "(max-width: 1599px)"
  } = options;

  if (!menuToggle || !siteNav) {
    return;
  }

  // Every dropdown in the nav, so opening one collapses any other that's open.
  const dropdowns = Array.from(siteNav.querySelectorAll(".nav-dropdown"));

  const isCompactNavigation = () => window.matchMedia(compactMediaQuery).matches;
  const closeNavigation = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
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

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const dropdown = link.closest(".nav-dropdown");
      const isDropdownToggle = Boolean(dropdown) && link.classList.contains("nav-dropdown-toggle");

      if (isCompactNavigation() && isDropdownToggle) {
        if (!dropdown.classList.contains("is-open")) {
          event.preventDefault();
          dropdowns.forEach((other) => {
            if (other !== dropdown) {
              other.classList.remove("is-open");
            }
          });
          dropdown.classList.add("is-open");
          return;
        }
      }

      closeNavigation();
    });
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

export function setupReveals() {
  const revealTargets = document.querySelectorAll(".reveal");
  if (!revealTargets.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const initiallyVisible = [];

  revealTargets.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < viewHeight * 0.95 && rect.bottom > 0) {
      initiallyVisible.push(node);
    }
  });

  initiallyVisible
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
    .forEach((node, index) => {
      window.setTimeout(() => {
        node.classList.add("is-visible");
      }, index * 120);
    });

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

  revealTargets.forEach((node) => {
    if (!initiallyVisible.includes(node)) {
      observer.observe(node);
    }
  });
}

function shouldEnableServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  // Disable SW locally so content edits appear immediately without cache friction.
  if (isLocalHost) {
    return false;
  }

  return window.isSecureContext;
}

async function clearAdnServiceWorkerState() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch (_) {
    // Ignore cleanup failures.
  }

  if (!("caches" in window)) {
    return;
  }

  try {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith("adn-"))
        .map((name) => caches.delete(name))
    );
  } catch (_) {
    // Ignore cleanup failures.
  }
}

export function registerImageOnlyServiceWorker() {
  if (!shouldEnableServiceWorker()) {
    clearAdnServiceWorkerState();
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Fail silently; caching is optional.
    });
  });
}