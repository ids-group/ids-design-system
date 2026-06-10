// Reads the Angular build output and produces a single self-contained
// showcase/index.html plus fresh showcase/build-stamp.js + source-stamp.js.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { computeContentHash } from './source-hash.mjs';
import { renderSourceStamp, renderBuildStamp, readGitCommit } from './version.mjs';
import { transformHtml, inlineCssUrls, mimeFor } from './html-transform.mjs';

const DIST = 'dist/ds-docs/browser';
const OUT_DIR = 'showcase';
const HASH_ROOTS = ['src/lib', 'ds-docs/src'];

async function readDistFiles() {
  const names = await readdir(DIST, { withFileTypes: true });
  const assets = new Map();
  for (const entry of names) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (ext === '.js') {
      assets.set(entry.name, { type: 'js', content: await readFile(join(DIST, entry.name), 'utf8') });
    } else if (ext === '.css') {
      assets.set(entry.name, { type: 'css', content: await readFile(join(DIST, entry.name), 'utf8') });
    }
  }
  return assets;
}

// Resolve a ref (e.g. "media/x.woff2", "favicon.ico") to base64 from the build output.
function makeBinaryResolver() {
  const cache = new Map();
  return (ref) => {
    const clean = ref.split('?')[0].split('#')[0];
    if (cache.has(clean)) return cache.get(clean);
    const path = join(DIST, clean);
    const result = existsSync(path)
      ? { mime: mimeFor(clean), base64: readFileSync(path).toString('base64') }
      : null;
    cache.set(clean, result);
    return result;
  };
}

const indexHtml = await readFile(join(DIST, 'index.html'), 'utf8');
const assets = await readDistFiles();

// Inline font/media url()s inside every CSS asset before HTML inlining.
const resolveBinary = makeBinaryResolver();
for (const asset of assets.values()) {
  if (asset.type === 'css') asset.content = inlineCssUrls(asset.content, resolveBinary);
}

const hash = await computeContentHash(HASH_ROOTS);
const built = { hash, commit: readGitCommit(), date: new Date().toISOString() };

const html = transformHtml(indexHtml, { assets, resolveBinary });

await mkdir(OUT_DIR, { recursive: true });
await writeFile(join(OUT_DIR, 'index.html'), html, 'utf8');
await writeFile(join(OUT_DIR, 'build-stamp.js'), renderBuildStamp(built), 'utf8');
await writeFile(join(OUT_DIR, 'source-stamp.js'), renderSourceStamp(built), 'utf8');
console.log(`showcase: built index.html (hash ${hash.slice(0, 8)}, ${html.length} bytes)`);
