const CACHE_NAME = 'marte-hud-offline-v20';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css?v=20',
  './app.js?v=20',
  './panoramas/PIA24264-landing.jpg',
  './panoramas/PIA24921-kodiak-delta.jpg',
  './panoramas/PIA26369-bright-angel.jpg',
  './panoramas/PIA26474-rio-chiquito.jpg',
  './panoramas/PIA22545-gale-curiosity.jpg',
  './panoramas/PIA26363-gediz-vallis.jpg',
  './panoramas/PIA13077-valles-marineris.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.allSettled(PRECACHE_ASSETS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Never intercept cross-origin requests (NASA API, NASA images CDN, map tiles)
  const reqUrl = new URL(event.request.url);
  if (reqUrl.origin !== self.location.origin) return;

  // Network-First strategy for same-origin app assets so updates always load immediately
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return undefined;
        })
      )
  );
});
