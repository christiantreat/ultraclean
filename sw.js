const CACHE_NAME = ‘ultraclean-v1’;
const ASSETS = [
‘/’,
‘/index.html’,
‘/manifest.json’,
‘https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700&display=swap’
];

self.addEventListener(‘install’, event => {
event.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
);
self.skipWaiting();
});

self.addEventListener(‘activate’, event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

self.addEventListener(‘fetch’, event => {
event.respondWith(
caches.match(event.request).then(cached => cached || fetch(event.request))
);
});
