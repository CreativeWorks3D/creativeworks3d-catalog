// Creative Works 3D — Editor de Catálogo — Service Worker
// Permite instalar o editor como app e abrir mesmo sem internet.
// Atenção: o botão "Baixar products.json" e qualquer sincronização com o
// catálogo público continuam precisando de internet normalmente.

const CACHE_NAME = 'cw3d-editor-v2';
const APP_SHELL = [
  './catalog-editor.html',
  './editor-manifest.json',
  './editor-icon-192.png',
  './editor-icon-512.png'
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

  // cache:'no-store' garante que sempre busca a versão mais nova de verdade,
  // sem o navegador entregar uma cópia antiga guardada no cache HTTP normal.
  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('./catalog-editor.html')))
  );
});
