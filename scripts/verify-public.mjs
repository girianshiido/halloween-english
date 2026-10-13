import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'https://girianshiido.github.io/halloween-english/';
async function filesAt(dir, prefix = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) files.push(...await filesAt(`${dir}/${entry.name}`, name + '/'));
    else if (!entry.name.startsWith('.')) files.push(name);
  }
  return files;
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const files = await filesAt('docs');
for (let offset = 0; offset < files.length; offset += 4) {
  await Promise.all(files.slice(offset, offset + 4).map(async path => {
    const local = await readFile('docs/' + path);
    const url = new URL(path, base);
    url.searchParams.set('verify', hash(local).slice(0, 12));
    const response = await fetch(url);
    if (!response.ok) throw Error(`${path}: HTTP ${response.status}`);
    const remote = Buffer.from(await response.arrayBuffer());
    if (hash(remote) !== hash(local)) throw Error(`${path}: contenu public différent`);
    console.log(`OK ${path}`);
  }));
}
console.log(`${files.length} fichiers publics identiques à la version locale.`);
