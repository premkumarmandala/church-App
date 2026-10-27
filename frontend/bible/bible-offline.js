/**
 * Bible Offline Storage & Service Worker Manager
 * Handles offline reading, cache warming, and network status updates.
 */

(function (window) {
  'use strict';

  const CACHE_NAME = 'church-bible-v1';

  class BibleOfflineManager {
    constructor() {
      this.isOnline = navigator.onLine;
      this.statusListeners = [];
      this.progressListeners = [];
      this.isCaching = false;
    }

    async init() {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/bible/sw.js', { scope: '/' });
          console.log('[Offline] ServiceWorker registered with scope:', reg.scope);
        } catch (e) {
          // If scope '/' is not permitted by server headers, fall back to default scope (/bible/)
          try {
            const reg = await navigator.serviceWorker.register('/bible/sw.js');
            console.log('[Offline] ServiceWorker registered with default scope:', reg.scope);
          } catch (e2) {
            console.warn('[Offline] ServiceWorker registration failed:', e2);
          }
        }
      }
    }

    handleNetworkChange(online) {
      this.isOnline = online;
      for (const cb of this.statusListeners) {
        try { cb(online); } catch (e) { console.error(e); }
      }
    }

    onNetworkStatusChange(cb) {
      this.statusListeners.push(cb);
      cb(this.isOnline);
    }

    onProgress(cb) {
      this.progressListeners.push(cb);
    }

    notifyProgress(current, total, translation) {
      for (const cb of this.progressListeners) {
        try { cb({ current, total, percentage: Math.round((current / total) * 100), translation }); } catch (e) { console.error(e); }
      }
    }

    async getCachedBook(translation, fileName) {
      if (!('caches' in window)) return null;
      try {
        const cache = await caches.open(CACHE_NAME);
        const folder = translation === 'telugu' ? 'telugu' : 'kjv';
        const url = `/bible-data/${folder}/${fileName}`;
        const match = await cache.match(url);
        if (match) {
          return await match.json();
        }
      } catch (e) {
        console.warn('[Offline] Error retrieving cached book:', e);
      }
      return null;
    }

    async cacheBookDirectly(translation, fileName, jsonData) {
      if (!('caches' in window)) return;
      try {
        const cache = await caches.open(CACHE_NAME);
        const folder = translation === 'telugu' ? 'telugu' : 'kjv';
        const url = `/bible-data/${folder}/${fileName}`;
        const res = new Response(JSON.stringify(jsonData), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
        await cache.put(url, res);
      } catch (e) {
        console.warn('[Offline] Direct cache failed:', e);
      }
    }

    async getOfflineStatus(booksList) {
      if (!('caches' in window) || !booksList) {
        return { kjvCount: 0, teluguCount: 0, total: 66, kjvReady: false, teluguReady: false };
      }
      try {
        const cache = await caches.open(CACHE_NAME);
        let kjvCount = 0;
        let teluguCount = 0;

        for (const b of booksList) {
          const kjvMatch = await cache.match(`/bible-data/kjv/${b.kjvFile}`);
          if (kjvMatch) kjvCount++;

          const telMatch = await cache.match(`/bible-data/telugu/${b.teluguFile}`);
          if (telMatch) teluguCount++;
        }

        return {
          kjvCount,
          teluguCount,
          total: booksList.length,
          kjvReady: kjvCount === booksList.length,
          teluguReady: teluguCount === booksList.length
        };
      } catch (e) {
        console.error('[Offline] Error checking cache status:', e);
        return { kjvCount: 0, teluguCount: 0, total: 66, kjvReady: false, teluguReady: false };
      }
    }

    async downloadTranslationForOffline(translation, booksList) {
      if (this.isCaching) return;
      this.isCaching = true;

      try {
        const cache = await caches.open(CACHE_NAME);
        const folder = translation === 'telugu' ? 'telugu' : 'kjv';
        const total = booksList.length;

        for (let i = 0; i < total; i++) {
          const book = booksList[i];
          const fileName = translation === 'telugu' ? book.teluguFile : book.kjvFile;
          const url = `/bible-data/${folder}/${fileName}`;

          try {
            const res = await fetch(url);
            if (res.ok) {
              await cache.put(url, res.clone());
            }
          } catch (fetchErr) {
            console.warn(`[Offline] Failed to cache ${url}:`, fetchErr);
          }

          this.notifyProgress(i + 1, total, translation);
        }
      } finally {
        this.isCaching = false;
      }
    }
  }

  window.BibleOffline = new BibleOfflineManager();
})(window);
