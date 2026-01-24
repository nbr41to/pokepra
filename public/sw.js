const CACHE_NAME = "mcpt-static-v1";
const PRECACHE_URLS = [
  "/",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/qr.png",
  "/qr-dark.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
        clients.forEach((client) => client.postMessage({ type: "sw-ready" }));
      }),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  const fetchAndCache = () =>
    fetch(request).then((response) => {
      const responseClone = response.clone();
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.put(request, responseClone));
      return response;
    });

  if (request.mode === "navigate") {
    event.respondWith(fetchAndCache().catch(() => caches.match("/")));
    return;
  }

  event.respondWith(fetchAndCache().catch(() => caches.match(request)));
});
