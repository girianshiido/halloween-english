"use strict";
const sw = self;
const CACHE_PREFIX = 'boo-english-';
const CACHE = CACHE_PREFIX + '6d78a82b60e76d45';
const PRECACHE = JSON.parse('["./","./app/collection.js","./app/game.js","./app/install.js","./app/learning.js","./app/main.js","./app/progress.js","./app/speech.js","./favicon.svg","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./images/art/bat.png","./images/art/candle.png","./images/art/crow.png","./images/art/frog.png","./images/art/ghost.png","./images/art/hat.png","./images/art/mask.png","./images/art/monster.png","./images/art/moon.png","./images/art/owl.png","./images/art/pumpkin.png","./images/art/rat.png","./images/art/skeleton.png","./images/art/skull.png","./images/art/snake.png","./images/art/spider.png","./images/art/sweet.png","./images/art/vampire.png","./images/art/witch.png","./images/art/wolf.png","./images/bat.png","./images/candle.png","./images/color/bat.png","./images/color/candle.png","./images/color/crow.png","./images/color/frog.png","./images/color/ghost.png","./images/color/hat.png","./images/color/mask.png","./images/color/monster.png","./images/color/moon.png","./images/color/owl.png","./images/color/pumpkin.png","./images/color/rat.png","./images/color/skeleton.png","./images/color/skull.png","./images/color/snake.png","./images/color/spider.png","./images/color/sweet.png","./images/color/vampire.png","./images/color/witch.png","./images/color/wolf.png","./images/crow.png","./images/frog.png","./images/ghost.png","./images/hat.png","./images/mask.png","./images/monster.png","./images/moon.png","./images/owl.png","./images/pumpkin.png","./images/rat.png","./images/skeleton.png","./images/skull.png","./images/snake.png","./images/spider.png","./images/sweet.png","./images/vampire.png","./images/witch.png","./images/wolf.png","./index.html","./manifest.webmanifest","./style.css"]');
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
