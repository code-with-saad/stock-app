self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('stock-app-v3').then(cache => {
      return cache.addAll([
        './',
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
        keys.filter(key => key !== 'stock-app-v3').map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      const resClone = res.clone();
      caches.open('stock-app-v3').then(cache => {
        cache.put(e.request, resClone);
      });
      return res;
    }).catch(() => caches.match(e.request))
  );
});

