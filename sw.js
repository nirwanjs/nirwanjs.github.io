
var CACHE_STATIC_NAME = 'static-v1';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  // self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/manifest.json',
          '/index.html',
          '/js/index.js',
          '/js/worker.js',
          '/css/index.css',
          '/offline/offline.html',
          'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
          'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',
          'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',
        ]);
      })
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  self.skipWaiting();
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }else{
            console.log("CACHE VERSION : ");
            console.log(CACHE_STATIC_NAME);
            console.log(CACHE_DYNAMIC_NAME);
          }
        }));
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function(err) {
              return caches.open(CACHE_STATIC_NAME)
                .then(function(cache) {
                  console.log("RETURN OFFLINE HTML");
                  return cache.match('/offline/offline.html');
                });
            });
        }
      })
  );
});