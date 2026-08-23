const CACHE_NAME = 'navi-share-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept the share-target POST (root of scope)
  if (event.request.method === 'POST' && url.pathname.endsWith('/NaviTool/')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('screenshot');
        const text = formData.get('text') || '';
        const sharedUrl = formData.get('url') || '';
        const title = formData.get('title') || '';

        const cache = await caches.open(CACHE_NAME);

        if (file && file.size > 0) {
          await cache.put('shared-image', new Response(file));
        } else {
          await cache.delete('shared-image');
        }

        const combinedText = [text, sharedUrl, title].filter(Boolean).join(' ');
        if (combinedText) {
          await cache.put('shared-text', new Response(combinedText));
        } else {
          await cache.delete('shared-text');
        }

        return Response.redirect('./?shared=1', 303);
      } catch (e) {
        return Response.redirect('./?shared=error', 303);
      }
    })());
  }
});
