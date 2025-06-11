const CACHE_NAME = 'ssa-shell-v1';
const APP_SHELL = '/ssa/appShell.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([APP_SHELL]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(APP_SHELL))
    );
  }
});
