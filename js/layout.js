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

function setupReactiveBackground() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (prefersReducedMotion || isCoarsePointer) {
    return;
  }

  if (document.querySelector(".reactive-bg-canvas")) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "reactive-bg-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const cursorRing = document.createElement("div");
  cursorRing.className = "reactive-cursor";
  cursorRing.setAttribute("aria-hidden", "true");
  document.body.append(cursorRing);

  const cursorDot = document.createElement("div");
  cursorDot.className = "reactive-cursor-dot";
  cursorDot.setAttribute("aria-hidden", "true");
  document.body.append(cursorDot);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    canvas.remove();
    cursorRing.remove();
    cursorDot.remove();
    return;
  }

  document.body.classList.add("reactive-ready");

  const pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    active: false
  };

  const cursorState = {
    x: pointer.x,
    y: pointer.y,
    ringX: pointer.x,
    ringY: pointer.y
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let rows = 0;
  let cols = 0;
  let tiles = [];
  let links = [];
  let packets = [];
  let spawnAccumulator = 0;
  let ambientDrift = 0;

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function tileKey(row, col) {
    return row * cols + col;
  }

  function nearestTileToPoint(x, y) {
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;

    tiles.forEach((tile) => {
      const dx = tile.x - x;
      const dy = tile.y - y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = tile;
      }
    });

    return best;
  }

  function createRoute(src, dst) {
    const points = [{ x: src.x, y: src.y }];

    if (src.col !== dst.col) {
      points.push({ x: dst.x, y: src.y });
    }

    if (src.row !== dst.row) {
      points.push({ x: dst.x, y: dst.y });
    }

    if (points.length === 1) {
      points.push({ x: dst.x, y: dst.y });
    }

    return points;
  }

  function makePacket(preferredSource) {
    if (!tiles.length) {
      return null;
    }

    const source = preferredSource || tiles[randomInt(tiles.length)];
    let target = tiles[randomInt(tiles.length)];

    for (let attempts = 0; attempts < 8 && target.key === source.key; attempts += 1) {
      target = tiles[randomInt(tiles.length)];
    }

    if (target.key === source.key) {
      return null;
    }

    return {
      source,
      target,
      route: createRoute(source, target),
      segment: 0,
      progress: Math.random(),
      speed: 0.16 + Math.random() * 0.22,
      size: 2 + Math.random() * 1.7,
      glow: 0.55 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2
    };
  }

  function buildNoCMatrixModel() {
    const visibleCols = Math.max(5, Math.min(11, Math.round(width / 165)));
    const visibleRows = Math.max(4, Math.min(8, Math.round(height / 145)));
    const overscanCols = 2;
    const overscanRows = 2;

    cols = visibleCols + overscanCols * 2;
    rows = visibleRows + overscanRows * 2;

    const stepX = width / (visibleCols - 1);
    const stepY = height / (visibleRows - 1);
    const startX = -overscanCols * stepX;
    const startY = -overscanRows * stepY;

    tiles = [];
    links = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = startX + col * stepX;
        const y = startY + row * stepY;
        tiles.push({
          row,
          col,
          key: tileKey(row, col),
          x,
          y,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }

    const getTile = (row, col) => tiles[tileKey(row, col)];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (col + 1 < cols) {
          links.push({ from: getTile(row, col), to: getTile(row, col + 1) });
        }
        if (row + 1 < rows) {
          links.push({ from: getTile(row, col), to: getTile(row + 1, col) });
        }
      }
    }

    packets = [];
    const packetCount = Math.max(24, Math.min(96, Math.round(rows * cols * 1.7)));
    for (let i = 0; i < packetCount; i += 1) {
      const packet = makePacket();
      if (packet) {
        packets.push(packet);
      }
    }

    spawnAccumulator = 0;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildNoCMatrixModel();
  }

  function updatePointer(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }

  function hidePointer() {
    pointer.active = false;
  }

  function draw(time) {
    const t = time * 0.001;
    ambientDrift += 0.0012;
    ctx.clearRect(0, 0, width, height);

    const nebula = ctx.createRadialGradient(
      pointer.active ? pointer.x : width * 0.5,
      pointer.active ? pointer.y : height * 0.5,
      10,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.95
    );
    nebula.addColorStop(0, "rgba(102, 171, 34, 0.14)");
    nebula.addColorStop(0.45, "rgba(28, 48, 20, 0.1)");
    nebula.addColorStop(1, "rgba(2, 5, 10, 0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);

    const hotspot = pointer.active ? nearestTileToPoint(pointer.x, pointer.y) : null;
    const pointerFactor = pointer.active ? 1.25 : 1;

    links.forEach((link) => {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(88, 146, 58, 0.2)";
      ctx.lineWidth = 1;
      ctx.moveTo(link.from.x, link.from.y);
      ctx.lineTo(link.to.x, link.to.y);
      ctx.stroke();
    });

    tiles.forEach((tile) => {
      const pulse = Math.sin(t * 1.2 + tile.pulse + ambientDrift) * 0.08;
      const isHot = hotspot && hotspot.key === tile.key;
      const alpha = isHot ? 0.62 : 0.32 + pulse;
      const size = isHot ? 10 : 8;

      ctx.fillStyle = `rgba(144, 228, 76, ${Math.max(0.2, alpha)})`;
      ctx.fillRect(tile.x - size * 0.5, tile.y - size * 0.5, size, size);

      ctx.strokeStyle = "rgba(183, 255, 123, 0.2)";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(tile.x - size * 0.75, tile.y - size * 0.75, size * 1.5, size * 1.5);
    });

    const dt = 0.016;
    spawnAccumulator += dt * (pointer.active ? 4.4 : 2.1);
    while (spawnAccumulator > 1) {
      spawnAccumulator -= 1;
      const packet = makePacket(hotspot || undefined);
      if (packet) {
        packets.push(packet);
      }
    }

    const maxPackets = Math.max(36, Math.min(150, rows * cols * 2));
    if (packets.length > maxPackets) {
      packets.splice(0, packets.length - maxPackets);
    }

    packets.forEach((packet, packetIndex) => {
      const route = packet.route;
      const segmentCount = route.length - 1;
      if (segmentCount < 1) {
        return;
      }

      const segmentStart = route[packet.segment];
      const segmentEnd = route[packet.segment + 1];
      const speed = packet.speed * pointerFactor * dt;
      packet.progress += speed;

      if (packet.progress >= 1) {
        packet.progress = 0;
        packet.segment += 1;

        if (packet.segment >= segmentCount) {
          const redirected = makePacket(hotspot || undefined);
          if (!redirected) {
            return;
          }
          packets[packetIndex] = redirected;
          return;
        }
      }

      const x = segmentStart.x + (segmentEnd.x - segmentStart.x) * packet.progress;
      const y = segmentStart.y + (segmentEnd.y - segmentStart.y) * packet.progress;
      const agePulse = 0.75 + Math.sin(t * 3.2 + packet.phase) * 0.25;
      const alpha = packet.glow * agePulse;
      const packetSize = packet.size;

      ctx.fillStyle = `rgba(201, 255, 153, ${alpha})`;
      ctx.fillRect(x - packetSize, y - packetSize, packetSize * 2, packetSize * 2);

      ctx.strokeStyle = `rgba(146, 255, 85, ${alpha * 0.55})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        x - packetSize * 1.5,
        y - packetSize * 1.5,
        packetSize * 3,
        packetSize * 3
      );
    });

    const centerGlow = ctx.createRadialGradient(
      pointer.active ? pointer.x : width * 0.5,
      pointer.active ? pointer.y : height * 0.5,
      8,
      width * 0.5,
      height * 0.5,
      Math.min(300, width * 0.28)
    );
    centerGlow.addColorStop(0, "rgba(166, 255, 104, 0.13)");
    centerGlow.addColorStop(1, "rgba(166, 255, 104, 0)");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    cursorState.x += (pointer.x - cursorState.x) * 0.35;
    cursorState.y += (pointer.y - cursorState.y) * 0.35;
    cursorState.ringX += (pointer.x - cursorState.ringX) * 0.16;
    cursorState.ringY += (pointer.y - cursorState.ringY) * 0.16;

    cursorDot.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0)`;
    cursorRing.style.transform = `translate3d(${cursorState.ringX}px, ${cursorState.ringY}px, 0)`;

    rafId = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", updatePointer, { passive: true });
  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("mouseleave", hidePointer, { passive: true });
  window.addEventListener("blur", hidePointer);

  resize();
  draw(0);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      return;
    }

    if (!rafId) {
      draw(performance.now());
    }
  });
}

window.__layoutReady = injectSharedLayout().catch((error) => {
  console.error(error);
});

window.__layoutReady.finally(() => {
  setupPageScrollIndicator();
  setupReactiveBackground();
});
