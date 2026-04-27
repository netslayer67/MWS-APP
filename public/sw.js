// Legacy service worker cleanup.
// New builds use /mws-sw.js from vite-plugin-pwa; this worker only removes
// old caches from previous /sw.js registrations and then unregisters itself.
const LEGACY_CACHE_PREFIXES = [
    'mws-integralearn-',
    'mws-static-',
    'mws-dynamic-'
];

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((cacheName) => LEGACY_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix)))
                .map((cacheName) => caches.delete(cacheName))
        );

        await self.clients.claim();
        await self.registration.unregister();

        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => {
            client.postMessage({ type: 'LEGACY_SW_UNREGISTERED' });
        });
    })());
});
