/* Dispečing — service worker: offline cache */
const CACHE = 'dispecing-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './apple-touch-icon.png', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('dispecing-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* network-first: aktualizácie sa stiahnu hneď, offline padá na cache.
   Mapové dlaždice a vyhľadávanie adries (iné domény) idú priamo na sieť. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then(r => r || caches.match('./index.html'))
      )
  );
});
