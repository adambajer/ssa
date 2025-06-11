const CHECK_URL = 'https://adambajer.github.io/ssa/ping.txt';
let isOnline = true;

// Při instalaci a aktivaci jen základ
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

// Fetch přesměrování, pokud není online
self.addEventListener('fetch', event => {
  if (!isOnline) {
    console.warn('[SW] Offline – vracím fallback stránku');
    event.respondWith(
      new Response(getOfflinePage(), {
        headers: { 'Content-Type': 'text/html' }
      })
    );
  }
});

// Start kontrolní smyčky
startReconnectLoop();

function startReconnectLoop() {
  setInterval(async () => {
    try {
      const res = await fetch(CHECK_URL, { cache: 'no-cache' });
      if (res.ok && !isOnline) {
        console.log('[SW] Připojení navázáno');
        isOnline = true;
      }
    } catch (err) {
      if (isOnline) {
        console.warn('[SW] Ztráta připojení');
        isOnline = false;
      }
    }
  }, 1000);
}

function getOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <title>Offline</title>
      <style>
        body {
          font-family: sans-serif;
          background: #1e1e1e;
          color: #eee;
          text-align: center;
          padding: 50px;
        }
        h1 {
          color: #ff5555;
        }
        .spinner {
          margin: 40px auto;
          width: 60px;
          height: 60px;
          border: 6px solid #ccc;
          border-top: 6px solid #4caf50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .msg {
          margin-top: 20px;
          font-size: 1.2em;
          color: #aaa;
        }
      </style>
    </head>
    <body>
      <h1>Nemám připojení k internetu</h1>
      <div class="spinner"></div>
      <div class="msg">Zkouším znovu navázat spojení...</div>
    </body>
    </html>
  `;
}
