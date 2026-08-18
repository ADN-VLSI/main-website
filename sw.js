const CACHE_NAME = "adn-large-images-v1";
const LARGE_IMAGE_FILES = new Set(["silver-metallic-textured-background.jpg"]);

function getFileName(pathname) {
  const lastSlash = pathname.lastIndexOf("/");
  return lastSlash >= 0 ? pathname.slice(lastSlash + 1) : pathname;
}

function shouldCacheRequest(requestUrl) {
  if (requestUrl.origin !== self.location.origin) {
    return false;
  }

  return LARGE_IMAGE_FILES.has(getFileName(requestUrl.pathname));
}

self.addEventListener("install", (event) => {
  const urlsToCache = Array.from(LARGE_IMAGE_FILES, (fileName) =>
    new URL(fileName, self.registration.scope).toString()
  );

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (!shouldCacheRequest(requestUrl)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return networkResponse;
      });
    })
  );
});
