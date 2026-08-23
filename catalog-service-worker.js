// Creative Works 3D — Catálogo de Atacado — Service Worker
// Permite instalar o catálogo como app. Não deixa o products.json em cache
// (ele já tem seu próprio cache-busting no index.html), só o "esqueleto" visual.

const CACHE_NAME = 'cw3d-catalog-v1';
const APP_SHELL = [
  './',
  './index.html',
  './catalog-manifest.json',
  './catalog-icon-192.png',
  './catalog-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (new URL(req.url).origin !== self.location.origin) return;

  // nunca guarda o products.json em cache — ele precisa sempre vir fresco
  if (req.url.includes('products.json')) return;

  // cache:'no-store' garante que sempre busca a versão mais nova de verdade
  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
  );
});
