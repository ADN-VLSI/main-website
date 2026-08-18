async function injectSharedLayout() {
  const headerHost = document.querySelector("site-header");
  const footerHost = document.querySelector("site-footer");

  if (!headerHost && !footerHost) {
    return;
  }

  const response = await fetch("partials/layout.html");
  if (!response.ok) {
    throw new Error(`Failed to load shared layout: ${response.status}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headerTemplate = doc.querySelector("#site-header-template");
  const footerTemplate = doc.querySelector("#site-footer-template");

  if (headerHost && headerTemplate) {
    headerHost.replaceWith(headerTemplate.content.cloneNode(true));
  }

  if (footerHost && footerTemplate) {
    footerHost.replaceWith(footerTemplate.content.cloneNode(true));
  }
}

function setupPageScrollIndicator() {
  const existing = document.querySelector(".page-scroll-indicator");
  if (existing) {
    return;
  }

  const rail = document.createElement("div");
  rail.className = "page-scroll-indicator";
  rail.setAttribute("aria-hidden", "true");

  const fill = document.createElement("span");
  fill.className = "page-scroll-indicator-fill";
  rail.append(fill);
  document.body.append(rail);

  let rafId = 0;

  function sync() {
    rafId = 0;
    const root = document.documentElement;
    const scrollable = root.scrollHeight - root.clientHeight;

    if (scrollable <= 0) {
      rail.classList.add("is-hidden");
      fill.style.transform = "scaleY(0)";
      return;
    }

    rail.classList.remove("is-hidden");
    const ratio = Math.min(Math.max(root.scrollTop / scrollable, 0), 1);
    fill.style.transform = `scaleY(${ratio})`;
  }

  function requestSync() {
    if (rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(sync);
  }

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  requestSync();
}

window.__layoutReady = injectSharedLayout().catch((error) => {
  console.error(error);
});

window.__layoutReady.finally(() => {
  setupPageScrollIndicator();
});
