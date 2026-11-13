// DebtOS v6.1 · service worker: permite instalar la app y abrirla rápido.
// Los datos (Supabase) NUNCA se guardan en caché: siempre se piden en vivo.
const CACHE = 'debtos-v6-3';
const SHELL = ['./', './index.html', './public.html', './gastos.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Supabase, CDNs: directo a la red
  // Red primero (siempre la versión más nueva); si no hay internet, la copia guardada.
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
