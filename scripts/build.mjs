import { cp, copyFile, mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await mkdir('docs', { recursive: true });
await cp('public', 'docs', { recursive: true });
await copyFile('index.html', 'docs/index.html');
await writeFile('docs/.nojekyll', '');
async function filesAt(dir, prefix = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) files.push(...await filesAt(`${dir}/${entry.name}`, name + '/'));
    else if (entry.name !== '.nojekyll' && name !== 'sw.js') files.push(name);
  }
  return files.sort();
}
const files = await filesAt('docs');
const hash = createHash('sha256');
for (const file of files) { hash.update(file); hash.update(await readFile(`docs/${file}`)); }
const worker = (await readFile('docs/sw.js', 'utf8'))
  .replace('__REVISION__', hash.digest('hex').slice(0, 16))
  .replace('__PRECACHE__', JSON.stringify(['./', ...files.map(file => './' + file)]));
await writeFile('docs/sw.js', worker);
console.log('Site prêt dans docs/');
