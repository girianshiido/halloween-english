import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { WORDS } from '../docs/app/game.js';
const source = await readFile(new URL('../docs/sw.js', import.meta.url), 'utf8');
const scope = 'https://example.test/halloween-english/';
async function setup() {
  const listeners = {}, stores = new Map([['another-app-cache', new Map()], ['boo-english-obsolete', new Map()]]);
  const keyOf = input => { const url = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url); url.search = ''; return url.href; };
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async key => stores.delete(key),
    open: async name => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        addAll: async requests => {
          const entries = await Promise.all(requests.map(async request => {
            const relative = new URL(request.url).pathname.replace('/halloween-english/', '') || 'index.html';
            const bytes = await readFile(new URL('../docs/' + relative, import.meta.url));
            return [keyOf(request), new Response(bytes)];
          }));
          for (const [url, response] of entries) store.set(url, response);
        },
        match: async request => store.get(keyOf(request))?.clone(),
      };
    },
  };
  vm.runInNewContext(source, {
    self: { registration: { scope }, location: { origin: 'https://example.test' }, addEventListener: (event, fn) => listeners[event] = fn, clients: { claim: async () => {} } },
    caches, URL, Request, Response, fetch: async () => { throw Error('Offline'); },
  });
  async function lifecycle(event) { let pending; listeners[event]({ waitUntil: value => pending = value }); await pending; }
  await lifecycle('install');
  await lifecycle('activate');
  async function fetchEvent(relative, mode = 'cors') {
    let response;
    listeners.fetch({ request: { url: new URL(relative, scope).href, method: 'GET', mode }, respondWith: value => response = value });
    return await response;
  }
  return { stores, fetchEvent };
}
test('Le cache contient le jeu, les 114 images, le manifeste et les icônes', async () => {
  assert.ok(!source.includes('__PRECACHE__') && !source.includes('__REVISION__'));
  const { stores } = await setup();
  assert.ok(stores.has('another-app-cache'));
  assert.ok(!stores.has('boo-english-obsolete'));
  const cache = [...stores.entries()].find(([name]) => name.startsWith('boo-english-'))[1];
  assert.equal([...cache.keys()].filter(url => /images\/\w+\.png$/.test(url)).length, WORDS.length);
  assert.equal([...cache.keys()].filter(url => /images\/color\/\w+\.png$/.test(url)).length, WORDS.length);
  assert.equal([...cache.keys()].filter(url => /images\/art\/\w+\.png$/.test(url)).length, WORDS.length);
  for (const file of ['index.html', 'style.css', 'app/main.js', 'app/game.js', 'app/speech.js', 'app/install.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png']) assert.ok(cache.has(scope + file));
});
test('Sans réseau, les pages et les images restent accessibles, même avec un paramètre URL', async () => {
  const { fetchEvent } = await setup();
  assert.match(await (await fetchEvent('./', 'navigate')).text(), /Boo! English/);
  assert.match(await (await fetchEvent('index.html?from=homescreen', 'navigate')).text(), /manifest.webmanifest/);
  assert.match(await (await fetchEvent('unknown-page', 'navigate')).text(), /Boo! English/);
  assert.ok((await (await fetchEvent('images/ghost.png')).arrayBuffer()).byteLength > 1000);
});
test('Le service worker ne prend pas en charge les autres projets ou domaines', async () => {
  const { fetchEvent } = await setup();
  assert.equal(await fetchEvent('https://example.test/fabrique-des-mots/'), undefined);
  assert.equal(await fetchEvent('https://fonts.googleapis.com/css2'), undefined);
});
test('Le manifeste décrit une application autonome avec de vraies icônes PNG', async () => {
  const manifest = JSON.parse(await readFile(new URL('../docs/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512', '512x512']);
  for (const icon of manifest.icons) {
    const bytes = await readFile(new URL('../docs/' + icon.src, import.meta.url));
    const size = Number(icon.sizes.split('x')[0]);
    assert.equal(bytes.readUInt32BE(16), size);
    assert.equal(bytes.readUInt32BE(20), size);
  }
});
