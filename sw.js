const cacheName = 'hrpp-refeicoes-v1';
const files = ['./', './index.html', './style.css', './config.js', './app.js', './manifest.json',
  './assets/logo_hospital.png', './assets/insatisfeito.svg', './assets/indiferente.svg',
  './assets/satisfeito.svg', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('hrpp-refeicoes-') && key !== cacheName)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(event.request, { ignoreSearch: true })
      || (event.request.mode === 'navigate' && await cache.match('./index.html'))
      || Response.error();
  }));
});
