// Service Worker for FitExplorer PWA
const CACHE_NAME = 'fitexplorer-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/src/main.jsx',
  '/src/assets/Ronjasdrawing.png',
  '/qr-install.html',
  '/qr-redirect.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable_icon.png',
  '/icons/splash-640x1136.png',
  '/icons/splash-750x1334.png',
  '/icons/splash-1242x2208.png',
  '/icons/splash-1125x2436.png',
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old cache versions
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Control all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', event => {
  // Handle QR code install requests
  if (event.request.url.includes('/qr-install')) {
    event.respondWith(caches.match('/qr-install.html'));
    return;
  }
  
  // Handle QR redirect requests
  if (event.request.url.includes('/qr-redirect')) {
    event.respondWith(caches.match('/qr-redirect.html'));
    return;
  }
  
  // Handle icons specifically for PWA installation
  if (event.request.url.includes('/icons/')) {
    const iconUrl = new URL(event.request.url);
    const iconPath = iconUrl.pathname;
    event.respondWith(
      caches.match(iconPath)
        .then(response => response || fetch(event.request))
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request and cache new response
        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the new response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Fallback for offline pages
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Handle app installation events
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PROMPT_INSTALL') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SHOW_INSTALL_PROMPT'
        });
      });
    });
  }
}); 