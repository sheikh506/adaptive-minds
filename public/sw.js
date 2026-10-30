/**
 * AdaptiveMinds Service Worker — P2 Offline Learning
 *
 * Strategy:
 *   - Static assets (_next/static/**): cache-first (content-hashed, safe forever)
 *   - App pages: network-first, fallback to cache
 *   - API routes: network-only (never cache — data must be fresh)
 *   - /print/* routes: network-first (parent must be online to access printables)
 *
 * Safety rules:
 *   - Never cache auth routes (/api/auth/**, /login, /register)
 *   - Never cache API responses containing student data
 *   - Cache is versioned: stale caches are deleted on activate
 *
 * Note: This service worker provides resilience (faster loads on repeat visits)
 * and a basic offline shell. It does NOT mark any cached learning activity as
 * mastered — progress synchronisation requires a verified server round-trip.
 */

const CACHE_VERSION = "am-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const NEVER_CACHE = [
  "/api/",
  "/login",
  "/register",
  "/_next/image",
];

const OFFLINE_FALLBACK = "/offline";

// ─── Install ──────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) =>
      cache.addAll([
        "/offline",
        "/dashboard",
      ]).catch(() => {
        // Non-fatal: offline page not available during first install
      })
    )
  );
  // Activate immediately
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache these paths
  if (NEVER_CACHE.some((p) => url.pathname.startsWith(p))) return;

  // Static assets — cache-first (they are content-hashed by Next.js)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // All other pages — network-first, fall back to cache, then offline page
  event.respondWith(
    caches.open(PAGE_CACHE).then(async (cache) => {
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        const offline = await cache.match(OFFLINE_FALLBACK);
        return offline ?? new Response("Offline — please reconnect.", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })
  );
});
