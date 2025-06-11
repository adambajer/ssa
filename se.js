const CHECK_URL = 'https://adambajer.github.io/ssa/ping.txt';

let isOnline = true;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('fetch', e => {
  // Normální fetch, nic nepřepisujeme
});

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
      client.postMessage({ type: 'connection-status', status });
    });
  });
}
