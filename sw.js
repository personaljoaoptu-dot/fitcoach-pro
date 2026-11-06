const CACHE_NAME = 'fitcoach-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle by default, fallback to cache if available
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
