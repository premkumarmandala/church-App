/**
 * Grace Church Online Bible - Service Worker (Offline Caching)
 */

const CACHE_NAME = 'church-bible-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './bible-react.css',
  './BibleApp.jsx',
  './mockData.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some static assets could not be pre-cached:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // For API or Scripture raw data requests: Stale-While-Revalidate with Cache fallback
  if (url.pathname.startsWith('/api/bible/') || url.pathname.startsWith('/bible-data/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone);
            });
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cachedRes) => {
            if (cachedRes) {
              return cachedRes;
            }
            return new Response(JSON.stringify({
              error: 'Offline mode: requested Scripture data not yet cached. Please connect to internet to cache.',
              offline: true
            }), {
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
              status: 503
            });
          });
        })
    );
    return;
  }

  // For static HTML/CSS/JS/images: Cache-first with Network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((c) => c.put(req, networkRes));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        }
        return networkRes;
      });
    })
  );
});
