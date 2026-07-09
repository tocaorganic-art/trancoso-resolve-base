const CACHE_NAME = 'trancoso-resolve-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silent fail if assets don't exist yet (development)
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and internal requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache API responses or dynamic content
        if (
          event.request.url.includes('/api/') ||
          event.request.url.includes('/functions/') ||
          !response || response.status !== 200 || 
          response.type === 'error'
        ) {
          return response;
        }

        // Cache successful static responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Return cached response if network fails
        return caches.match(event.request);
      })
  );
});

// Handle push notifications (future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    self.registration.showNotification(data.title || 'Trancoso Resolve', {
      body: data.body || '',
      icon: 'https://media.base44.com/images/public/68eb21726a9614db4a82ba99/866729f3e_trancoso_resolve_logo_principal.png'
    });
  }
});
