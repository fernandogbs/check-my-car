/*
  Minimal, auth-safe PWA service worker.
  - Never caches auth routes or API requests.
  - Static assets: cache-first.
  - Navigations (html): network-first with offline fallback.
*/

const STATIC_CACHE = 'static-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
});

function isAuthPath(pathname) {
  return pathname.startsWith('/auth/') || pathname.includes('/auth/');
}

function isApiPath(pathname) {
  return pathname.startsWith('/api/') || pathname.startsWith('/_next/data/');
}

function isStaticAsset(pathname) {
  if (pathname.startsWith('/_next/static/')) return true;
  if (pathname.startsWith('/fonts/')) return true;
  if (pathname.startsWith('/icons/')) return true;
  // Common static extensions
  return /\.(png|jpg|jpeg|webp|svg|css|js)$/i.test(pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Never intercept/cached auth and API-like routes.
  if (isAuthPath(pathname) || isApiPath(pathname)) return;

  // Navigation requests: network-first.
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          return fresh;
        } catch {
          const cached = await caches.match(OFFLINE_URL);
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Static assets: cache-first.
  if (isStaticAsset(pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        const fresh = await fetch(request);
        // Only cache successful responses.
        if (fresh && fresh.ok) {
          cache.put(request, fresh.clone());
        }
        return fresh;
      })()
    );
  }
});
