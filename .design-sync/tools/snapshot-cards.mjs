#!/usr/bin/env node
// Freezes every card that does not need to be live into static HTML.
//
// A card is a whole document that downloads a 2.12 MB bundle and boots its own Angular application,
// and the pane shows a grid of them. Measured on this tree: 89 of the 90 custom-element definitions
// cost 0.3 ms between them - the expense is parsing the bundle in each document and constructing
// the one section whose tag is on the page. A snapshot removes both.
//
// The snapshot is the SETTLED DOM with every script stripped. It is identical to the live card, not
// similar: Angular's emulated-encapsulation styles are already `<style>` tags in the head by then,
// and no colour is baked into an inline style - theme tokens stay in `_ds_bundle.css`, which the
// static card still links, so the pane switching `data-theme` still recolours it.
//
// What is lost is BEHAVIOUR, everywhere - a Select no longer opens, a Tab no longer switches. The
// chapters that need it are listed in `live-chapters.txt` and are left alone.
//
//   node .design-sync/tools/snapshot-cards.mjs      # after build-cards has stamped the heights
//
// Run it LAST. It rewrites card files in place, and any later build-cards run replaces them with
// live cards again.
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import {
  existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const OUT = join(syncDir, 'upload');
const PORT = 4579;
const WIDTH = 1200;
const FRAME_HEIGHT = 24000;
const LANES = 5;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((path) => existsSync(path));

if (!CHROME) {
  console.error('No Chrome found — snapshot-cards needs a headless browser.');
  process.exit(1);
}

const live = new Set(readFileSync(join(syncDir, 'live-chapters.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#')));

/** The section a card renders, from its host tag: `ds-docs-components-toast` is `components/toast`.
 *  Read from the file rather than guessed from the path, because a card's directory is its
 *  COMPONENT and a chapter can publish cards under several of them. */
const chapterOf = (html) => {
  const tag = html.match(/<(ds-docs-[a-z0-9-]+)>/)?.[1];
  if (!tag) return null;
  const rest = tag.replace('ds-docs-', '');
  const cut = rest.indexOf('-');

  return cut < 0 ? rest : `${rest.slice(0, cut)}/${rest.slice(cut + 1)}`;
};

const cards = JSON.parse(readFileSync(join(syncDir, 'elements', 'gen', 'cards.json'), 'utf8')).cards;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.md': 'text/plain', '.png': 'image/png' };
const server = createServer((request, response) => {
  const url = decodeURIComponent(request.url.split('?')[0]);
  const file = join(OUT, url);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    response.writeHead(404);

    return response.end('nf');
  }
  response.writeHead(200, { 'Content-Type': url.endsWith('.html') ? 'text/html' : (TYPES[extname(file)] ?? 'application/octet-stream') });

  return response.end(readFileSync(file));
});

const render = (path) => new Promise((done) => {
  execFile(
    CHROME,
    [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      `--user-data-dir=${join(profile, Math.random().toString(36).slice(2))}`,
      '--virtual-time-budget=25000',
      `--window-size=${WIDTH},${FRAME_HEIGHT}`,
      '--dump-dom', `http://127.0.0.1:${PORT}/${path.split('/').map(encodeURIComponent).join('/')}`,
    ],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
    (error, stdout) => done(error ? '' : stdout),
  );
});

server.listen(PORT);
const profile = mkdtempSync(join(tmpdir(), 'ds-snapshot-'));

const kept = [];
const frozen = [];
const failed = [];
const queue = cards.filter((path) => {
  const html = readFileSync(join(OUT, path), 'utf8');
  const chapter = chapterOf(html);
  if (chapter && live.has(chapter)) {
    kept.push(path);

    return false;
  }

  return true;
});

let next = 0;
async function lane() {
  while (next < queue.length) {
    const path = queue[next++];
    const source = readFileSync(join(OUT, path), 'utf8');
    // Everything before `<!doctype`: the @dsCard marker lives there and a DOM dump starts at
    // `<html>`, so without this the card would vanish from the manifest the next build reads.
    const marker = source.slice(0, source.indexOf('<!doctype'));
    const dom = await render(path);
    // `data-ds-sliced` is set by the card's own script when it finishes. Without it the page was
    // caught mid-boot and the snapshot would freeze a half-built section.
    if (!dom.includes('data-ds-sliced')) {
      failed.push(path);
      continue;
    }
    writeFileSync(
      join(OUT, path),
      marker + dom.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/\n{3,}/g, '\n\n'),
    );
    frozen.push(path);
    process.stderr.write(`  ${frozen.length + failed.length}/${queue.length} ${path.split('/').pop()}        \r`);
  }
}

try {
  await Promise.all(Array.from({ length: LANES }, lane));
} finally {
  server.close();
  rmSync(profile, { recursive: true, force: true });
}

process.stderr.write('\r'.padEnd(90));
if (failed.length) {
  console.error(`\n✗ ${failed.length} card(s) never finished rendering, so they were left live:`);
  for (const path of failed.slice(0, 10)) console.error(`    ${path}`);
  process.exit(1);
}

console.log(
  `\n✓ ${frozen.length} card(s) frozen to static HTML, ${kept.length} left live`
  + ` (${[...live].join(', ')})`,
);
