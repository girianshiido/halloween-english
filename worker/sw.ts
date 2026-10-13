const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_PREFIX = 'boo-english-';
const CACHE = CACHE_PREFIX + '__REVISION__';
const PRECACHE: string[] = JSON.parse('__PRECACHE__');
sw.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    PRECACHE.map(path => new Request(new URL(path, sw.registration.scope), { cache: 'reload' })),
  )));
});
sw.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(CACHE_PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await sw.clients.claim();
  })());
});
sw.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== sw.location.origin || !url.href.startsWith(sw.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try { return await fetch(request); }
    catch {
      if (request.mode === 'navigate') {
        const shell = await cache.match(new URL('./index.html', sw.registration.scope));
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
