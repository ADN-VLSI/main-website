const CACHE_PREFIX = "adn-";
const IMAGE_CACHE_NAME = "adn-images-v1";
const IMAGE_META_CACHE_NAME = "adn-images-meta-v1";
const IMAGE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function isHttpRequest(request) {
  return request.url.startsWith("http://") || request.url.startsWith("https://");
}

function isImageRequest(request) {
  if (request.destination === "image") {
    return true;
  }

  const url = new URL(request.url);
  return /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i.test(url.pathname);
}

function createTimestampResponse(timestamp) {
  return new Response(JSON.stringify({ cachedAt: timestamp }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

async function getCachedAt(metaCache, request) {
  const metaResponse = await metaCache.match(request);
  if (!metaResponse) {
    return 0;
  }

  try {
    const payload = await metaResponse.json();
    const cachedAt = Number(payload?.cachedAt || 0);
    return Number.isFinite(cachedAt) ? cachedAt : 0;
  } catch (_) {
    return 0;
  }
}

function isFresh(cachedAt) {
  if (!cachedAt) {
    return false;
  }
  return Date.now() - cachedAt <= IMAGE_MAX_AGE_MS;
}

async function storeImageCaches(request, response) {
  const imageCache = await caches.open(IMAGE_CACHE_NAME);
  const metaCache = await caches.open(IMAGE_META_CACHE_NAME);
  await imageCache.put(request, response.clone());
  await metaCache.put(request, createTimestampResponse(Date.now()));
}

async function cleanupLegacyCaches() {
  const keep = new Set([IMAGE_CACHE_NAME, IMAGE_META_CACHE_NAME]);
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => name.startsWith(CACHE_PREFIX) && !keep.has(name))
      .map((name) => caches.delete(name))
  );
}

async function cleanupExpiredImages() {
  const imageCache = await caches.open(IMAGE_CACHE_NAME);
  const metaCache = await caches.open(IMAGE_META_CACHE_NAME);
  const requests = await imageCache.keys();

  await Promise.all(
    requests.map(async (request) => {
      const cachedAt = await getCachedAt(metaCache, request);
      if (isFresh(cachedAt)) {
        return;
      }

      await Promise.all([imageCache.delete(request), metaCache.delete(request)]);
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await cleanupLegacyCaches();
      await cleanupExpiredImages();
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isHttpRequest(request) || !isImageRequest(request)) {
    return;
  }

  event.respondWith(
    (async () => {
      const imageCache = await caches.open(IMAGE_CACHE_NAME);
      const metaCache = await caches.open(IMAGE_META_CACHE_NAME);
      const cachedResponse = await imageCache.match(request);
      const cachedAt = await getCachedAt(metaCache, request);

      if (cachedResponse && isFresh(cachedAt)) {
        return cachedResponse;
      }

      if (cachedResponse) {
        await Promise.all([imageCache.delete(request), metaCache.delete(request)]);
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
          await storeImageCaches(request, networkResponse);
        }
        return networkResponse;
      } catch (error) {
        if (cachedResponse && isFresh(cachedAt)) {
          return cachedResponse;
        }
        throw error;
      }
    })()
  );
});
