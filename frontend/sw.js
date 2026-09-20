/* Patta service worker.
   The shell is cached on install so the app opens with no network at
   all — the farmer still gets the camera, their saved scans and the
   sample cases. Diagnosis itself needs the network and says so. */

const SHELL = 'patta-shell-v1';
const FILES = [
  './', './index.html',
  './css/app.css',
  './js/app.js', './js/api.js', './js/config.js', './js/data.js',
  './js/i18n.js', './js/prompt.js',
  './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;                 // diagnosis posts go straight to the network
  if (new URL(request.url).pathname.startsWith('/api/')) return;

  e.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(res => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
