const CACHE_NAME = 'ssa-shell-v1';
const APP_SHELL = '/ssa/appShell.html';
const CHECK_URL = 'https://adambajer.github.io/ssa/ping.txt';

let isOnline = true;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([APP_SHELL]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => self.clients.claim());

// FETCH s fallbackem na shell
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // Pokud je offline, dej shell
    e.respondWith(
      fetch(e.request).catch(() => caches.match(APP_SHELL))
    );
  }
});

// Reconnect smyčka
startReconnectLoop();

function startReconnectLoop() {
  setInterval(async () => {
    try {
      const res = await fetch(CHECK_URL, { cache: 'no-cache' });
      if (res.ok && !isOnline) {
        isOnline = true;
        notifyClients('connected');
      }
    } catch (_) {
      if (isOnline) {
        isOnline = false;
        notifyClients('disconnected');
      }
    }
  }, 1000);
}

function notifyClients(status) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'connection', status });
    });
  });
}
