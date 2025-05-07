const CACHE_NAME = 'ssa-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/site.webmanifest', // aktualizováno podle HTML
  '/favicon.ico',      // dle linků ve stránce
  '/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of FILES_TO_CACHE) {
      try {
        await cache.add(url);
        console.log('[SW] Cached', url);
      } catch (err) {
        console.error('[SW] Cache failed for', url, err);
      }
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => key !== CACHE_NAME && caches.delete(key))
    );
    console.log('[SW] Activated, cleaned old caches');
  })());
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(event.request);
      // volitelně: cache new requests
      return networkResponse;
    } catch (err) {
      console.error('[SW] Fetch failed:', event.request.url, err);
      throw err;
    }
  })());
});
