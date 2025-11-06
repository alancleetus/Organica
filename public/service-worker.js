const CACHE_NAME = "organica-cache-v3";
const APP_SHELL = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
      );
      await self.clients.claim();
    })()
  );
});

// Network-first for navigations (index.html), cache-first for assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // HTML navigations
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put("/", net.clone());
          return net;
        } catch (e) {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match("/")) || Response.error();
        }
      })()
    );
    return;
  }

  // Assets: cache-first
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
    )
  );
});
