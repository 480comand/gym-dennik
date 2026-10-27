/* Dispečing — service worker: offline cache */
const CACHE = 'dispecing-v3';
const ASSETS = ['./', './index.html', './app.js', './style.css', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './apple-touch-icon.png', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css',
  // hra Linka 155: stránka, 3D mapa a zoznam nahratých hlasov (samotné mp3 sa uložia pri prvom prehraní)
  './hra.html', './vendor/three/three.min.js', './vendor/three/OrbitControls.js', './audio/volajuci/zoznam.json'];

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
        if (r.ok && r.status === 200) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: true })
          .then(r => r || (e.request.mode === 'navigate'
            // offline náhrada podľa stránky: hra ostane hrou, pomocník pomocníkom
            ? caches.match(new URL(e.request.url).pathname.endsWith('/hra.html') ? './hra.html' : './index.html')
            : Response.error()))
      )
  );
});
