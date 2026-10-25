/**
 * Church Bible Service Worker - Offline Caching
 */

const CACHE_NAME = 'church-bible-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/bible/',
  '/bible/index.html',
  '/bible/bible-styles.css',
  '/bible/bible-app.js',
  '/bible/bible-navigation.js',
  '/bible/bible-reader.js',
  '/bible/bible-search.js',
  '/bible/bible-bookmarks.js',
  '/bible/bible-daily-verse.js',
  '/bible/bible-offline.js',
  '/bible-data/books.json',
  '/bible-data/daily-verses.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Some static assets could not be pre-cached:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // For API or Bible data requests: Stale-While-Revalidate or Network-first with Cache fallback
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
            // Return offline JSON message
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

  // For static HTML/CSS/JS: Cache-first with Network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Fetch in background to update cache
        fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(req, networkRes));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, resClone));
        }
        return networkRes;
      });
    })
  );
});
