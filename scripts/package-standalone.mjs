import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(root, process.argv[2] ?? 'dist');
const output = path.join(dist, 'release');
const packageMetadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = packageMetadata.releaseVersion ?? packageMetadata.version;
const html = await readFile(path.join(dist, 'index.html'), 'utf8');

const jsPath = html.match(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*><\/script>/i)?.[1];
const cssPath = html.match(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/i)?.[1];
if (!jsPath || !cssPath) throw new Error('Vite output is missing its JavaScript or CSS bundle.');

const js = (await readFile(path.resolve(dist, jsPath), 'utf8')).replace(/<\/script/gi, match => match[0] + String.fromCharCode(92) + match.slice(1));
const css = (await readFile(path.resolve(dist, cssPath), 'utf8')).replace(/<\/style/gi, match => match[0] + String.fromCharCode(92) + match.slice(1));
const mimeTypes = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.json': 'application/json', '.webm': 'video/webm',
};

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (absolute !== path.join(dist, 'index.html') && absolute !== path.resolve(dist, jsPath) && absolute !== path.resolve(dist, cssPath)) files.push(absolute);
  }
  return files;
}

const embeddedAssets = {};
for (const absolute of await walk(dist)) {
  const relative = path.relative(dist, absolute).split(path.sep).join('/');
  const mime = mimeTypes[path.extname(relative).toLowerCase()];
  if (!mime) continue;
  embeddedAssets[`/${relative}`] = {
    type: mime,
    data: (await readFile(absolute)).toString('base64'),
  };
}

const bootstrap = `
const __ckpAssets = ${JSON.stringify(embeddedAssets)};
const __ckpAssetKey = value => {
  const raw = String(value ?? '');
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  try {
    const pathname = new URL(raw, window.location.href).pathname;
    if (__ckpAssets[pathname]) return pathname;
    const normalized = pathname.replace(/^\\/+/, '');
    if (__ckpAssets['/' + normalized]) return '/' + normalized;
  } catch {}
  return raw;
};
const __ckpDataUrl = value => {
  const asset = __ckpAssets[__ckpAssetKey(value)];
  return asset ? 'data:' + asset.type + ';base64,' + asset.data : value;
};
const __ckpFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const key = __ckpAssetKey(typeof input === 'string' ? input : input.url);
  const asset = __ckpAssets[key];
  if (!asset) return __ckpFetch(input, init);
  const binary = atob(asset.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return Promise.resolve(new Response(bytes, { status: 200, headers: { 'Content-Type': asset.type } }));
};
const __ckpImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
Object.defineProperty(HTMLImageElement.prototype, 'src', {
  configurable: true,
  enumerable: __ckpImageSrc.enumerable,
  get() { return __ckpImageSrc.get.call(this); },
  set(value) { __ckpImageSrc.set.call(this, __ckpDataUrl(value)); },
});
const __ckpSetAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function(name, value) {
  if (this instanceof HTMLImageElement && String(name).toLowerCase() === 'src') value = __ckpDataUrl(value);
  return __ckpSetAttribute.call(this, name, value);
};
`;

let standalone = html
  .replace(/<script\b[^>]*\bsrc="[^"]+\.js"[^>]*><\/script>/i, () => `<script type="module">${bootstrap}\n${js}\n</script>`)
  .replace(/<link\b[^>]*\bhref="[^"]+\.css"[^>]*>/i, () => `<style>${css}</style>`);
standalone = standalone.replace(/<title>[^<]*<\/title>/i, `<title>Core Keeper Planner v${version}</title>`);

await mkdir(output, { recursive: true });
const standalonePath = path.join(output, `core-keeper-planner-${version}.html`);
await writeFile(standalonePath, standalone, 'utf8');
await writeFile(path.join(output, 'index.html'), standalone, 'utf8');
console.log(`Created ${path.relative(root, standalonePath)} (${Object.keys(embeddedAssets).length} embedded assets).`);
