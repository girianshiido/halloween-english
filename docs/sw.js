"use strict";
const sw = self;
const CACHE_PREFIX = 'boo-english-';
const CACHE = CACHE_PREFIX + '6c3fcec4c6abb381';
const PRECACHE = JSON.parse('["./","./app/game.js","./app/install.js","./app/main.js","./app/speech.js","./favicon.svg","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./images/bat.png","./images/frog.png","./images/ghost.png","./images/monster.png","./images/pumpkin.png","./images/rat.png","./images/skeleton.png","./images/spider.png","./images/vampire.png","./images/witch.png","./index.html","./manifest.webmanifest","./style.css"]');
sw.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE.map(path => new Request(new URL(path, sw.registration.scope), { cache: 'reload' })))));
});
sw.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith(CACHE_PREFIX) && name !== CACHE)
                await caches.delete(name);
        }
        await sw.clients.claim();
    })());
});
sw.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== sw.location.origin || !url.href.startsWith(sw.registration.scope))
        return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached)
            return cached;
        try {
            return await fetch(request);
        }
        catch {
            if (request.mode === 'navigate') {
                const shell = await cache.match(new URL('./index.html', sw.registration.scope));
                if (shell)
                    return shell;
            }
            return Response.error();
        }
    })());
});
