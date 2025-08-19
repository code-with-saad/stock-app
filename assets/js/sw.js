self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('stock-app-v2').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './raw.html',
        './assets/js/script.js',
        './assets/js/raw.js',
        './manifest.json',
        './icon-192.png',
        './icon-512.png'
      ]);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== 'stock-app-v2').map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
