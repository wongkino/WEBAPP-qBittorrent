/* qBittorrent Web App — minimal service worker for installability + offline shell.
 * Strategy:
 * - /api/*  → network only（不下載列表不可用過期資料）
 * - navigate → network first，失敗回退已快取的 shell
 * - 靜態資源 → stale-while-revalidate
 */
const CACHE = "qb-webapp-v1";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

/**
 * @param {Request} request
 * @param {Response} response
 */
function putInCache(request, response) {
  if (!response || !response.ok) return;
  const copy = response.clone();
  void caches.open(CACHE).then((cache) => cache.put(request, copy));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API：一律走網路，不攔截快取
  if (url.pathname.startsWith("/api/")) return;

  // 導航：網路優先，離線回退 shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache(request, response);
          // 同步更新預快取的 "/"，方便冷啟動離線
          if (response.ok) {
            putInCache(new Request("/"), response);
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            (await caches.match("/index.html"));
          if (cached) return cached;
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
    );
    return;
  }

  // 其餘同源 GET：stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
