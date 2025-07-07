// Configuration
const CACHE_CONFIG = {
  name: 'arabic-flashcards-v1',
  staticAssets: [
    '/',
    '/offline',
    '/favicon.ico',
  ],
  // Patterns for assets to cache on fetch
  cacheablePatterns: [
    /_next\/static/,
    /\.js$/,
    /\.css$/,
    /\.woff2?$/,
    /\.(png|jpg|jpeg|svg|gif)$/,
  ],
  // Patterns to never cache
  skipPatterns: [
    /\/api\//,
    /supabase/,
    /_next\/data/,
  ],
};

// Helper functions
const shouldCache = (url) => {
  return CACHE_CONFIG.cacheablePatterns.some(pattern => pattern.test(url));
};

const shouldSkip = (url) => {
  return CACHE_CONFIG.skipPatterns.some(pattern => pattern.test(url));
};

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_CONFIG.name)
      .then((cache) => {
        console.log('[Service Worker] Cache opened');
        return cache.addAll(CACHE_CONFIG.staticAssets);
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests and excluded patterns
  if (request.method !== 'GET' || shouldSkip(url)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version and update in background
          if (navigator.onLine && shouldCache(url)) {
            fetch(request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(CACHE_CONFIG.name)
                    .then((cache) => cache.put(request, responseToCache))
                    .catch((error) => console.error('[Service Worker] Cache update failed:', error));
                }
              })
              .catch(() => {}); // Silent fail for background update
          }
          return cachedResponse;
        }

        // No cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache if it matches our patterns
            if (shouldCache(url)) {
              const responseToCache = response.clone();
              caches.open(CACHE_CONFIG.name)
                .then((cache) => cache.put(request, responseToCache))
                .catch((error) => console.error('[Service Worker] Failed to cache:', error));
            }

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline');
            }
            throw error;
          });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_CONFIG.name) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[Service Worker] Activation failed:', error);
      })
  );
});

// Message event for skip waiting and cache control
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      caches.delete(CACHE_CONFIG.name)
        .then(() => {
          console.log('[Service Worker] Cache cleared');
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          console.error('[Service Worker] Failed to clear cache:', error);
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
  }
});