/* =========================
   CACHE VERSION
========================= */
const CACHE_NAME = "simply-tributes-v2";

/* Core app shell (must be cached) */
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/script.js",
  "/manifest.json"
];

/* =========================
   INSTALL EVENT
========================= */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

/* =========================
   ACTIVATE EVENT (clean old cache)
========================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* =========================
   FETCH STRATEGY (SMART HYBRID)
========================= */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // ❌ Skip caching API / Supabase calls (important)
  if (
    request.url.includes("supabase.co") ||
    request.url.includes("/auth/") ||
    request.method !== "GET"
  ) {
    return;
  }

  // 🟢 HTML navigation → network first (fresh content)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 🟡 Static assets → cache first (fast mobile load)
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            // optional: dynamically cache new assets
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
            return response;
          })
          .catch(() => {
            // offline fallback (safe return)
            if (request.destination === "image") {
              return new Response("");
            }
          })
      );
    })
  );
});
