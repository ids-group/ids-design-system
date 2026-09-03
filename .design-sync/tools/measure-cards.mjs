#!/usr/bin/env node
// Measures every card's rendered height and rewrites `viewports.json`.
//
// The pane sizes a card from the `viewport` in its @dsCard marker and clips anything taller, so a
// missing number silently cuts the bottom off a page. These used to be measured by hand, which is
// why eight components added in one release went a whole release with no height at all.
//
// It loads the real card FILES rather than re-deriving what a card renders: a card slices itself in
// its own inline script, and a second copy of that logic here would drift from it — the hand pass
// this replaces measured whole sections while the cards had already started slicing.
//
// One browser per card, deliberately. Eight cards as iframes in one page was the first attempt and
// Chrome returned an empty DOM: each card pulls the whole 2 MB bundle and runs its own Angular
// application, and virtual time does not advance while those are in flight.
//
//   node .design-sync/tools/measure-cards.mjs
//
// Exits non-zero if any card measured nothing, so a section that fails to render cannot quietly
// leave its card unsized. Run build-cards first, then this, then build-cards again to stamp the
// numbers into the markers.
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import {
  existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const OUT = join(syncDir, 'upload');
const VIEWPORTS = join(syncDir, 'viewports.json');

const WIDTH = 1200;
// Taller than any card, so nothing scrolls and offsetHeight is the whole page.
const FRAME_HEIGHT = 24000;
const PORT = 4577;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((path) => existsSync(path));

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.md': 'text/plain',
  '.png': 'image/png',
};

// Every .html under a component directory: a component publishes one card per documented block,
// so the file name is `<Component>-<block>.html` and there is no card named after the component.
function cards() {
  const found = [];
  const groups = join(OUT, 'components');
  for (const group of readdirSync(groups)) {
    for (const component of readdirSync(join(groups, group))) {
      const dir = join(groups, group, component);
      for (const entry of readdirSync(dir)) {
        if (!entry.endsWith('.html') || !statSync(join(dir, entry)).isFile()) continue;
        found.push({
          name: entry.replace(/\.html$/, ''),
          url: `/components/${group}/${component}/${entry}`,
        });
      }
    }
  }

  return found.sort((a, b) => a.name.localeCompare(b.name));
}

// Injected into the card itself: it reports the height through the page TITLE, which --dump-dom
// always returns in full. Reading it out of the body would mean dumping a whole rendered chapter.
const REPORTER = `
<script>
  (function () {
    var t0 = Date.now();
    (function settle() {
      var page = document.querySelector('.ds-page');
      var rendered = page && page.firstElementChild && page.firstElementChild.firstElementChild;
      var slices = document.documentElement.hasAttribute('data-ds-sliced');
      var needsSlice = document.documentElement.innerHTML.indexOf('var OWNS =') >= 0;
      if ((!rendered || (needsSlice && !slices)) && Date.now() - t0 < 20000) {
        return setTimeout(settle, 50);
      }
      document.title = 'H=' + (page ? page.offsetHeight : 0);
    })();
  })();
</script>
`;

const server = createServer((request, response) => {
  const url = decodeURIComponent(request.url.split('?')[0]);
  const file = join(OUT, url);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    response.writeHead(404);

    return response.end('nf');
  }
  if (url.endsWith('.html')) {
    response.writeHead(200, { 'Content-Type': 'text/html' });

    return response.end(`${readFileSync(file, 'utf8')}${REPORTER}`);
  }
  response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });

  return response.end(readFileSync(file));
});

if (!CHROME) {
  console.error('No Chrome found — measure-cards needs a headless browser.');
  process.exit(1);
}

const all = cards();
server.listen(PORT);
const profile = mkdtempSync(join(tmpdir(), 'ds-measure-'));
const heights = {};

// A browser per card is the only shape that works (see the header), so the wall clock is entirely
// browser start-up — four hundred cards one at a time is an hour. They are independent, so run a
// few at once; more than this and the machine's own scheduling starts to dominate.
const LANES = 5;

function measure(card) {
  return new Promise((done) => {
    execFile(
      CHROME,
      [
        '--headless=new', '--disable-gpu', '--no-sandbox',
        `--user-data-dir=${join(profile, card.name)}`,
        '--virtual-time-budget=25000',
        `--window-size=${WIDTH},${FRAME_HEIGHT}`,
        '--dump-dom', `http://127.0.0.1:${PORT}${card.url}`,
      ],
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
      (error, stdout) => done(error ? 0 : Number(stdout.match(/<title>H=(\d+)<\/title>/)?.[1] ?? 0)),
    );
  });
}

let next = 0;
let finished = 0;
async function lane() {
  while (next < all.length) {
    const card = all[next++];
    heights[card.name] = await measure(card);
    finished += 1;
    process.stderr.write(`  ${finished}/${all.length} ${card.name} = ${heights[card.name]}px        \r`);
  }
}

try {
  await Promise.all(Array.from({ length: LANES }, lane));
} finally {
  server.close();
  rmSync(profile, { recursive: true, force: true });
}

const missing = Object.entries(heights).filter(([, value]) => !value).map(([name]) => name);
if (missing.length) {
  console.error(`\n✗ ${missing.length} card(s) measured nothing: ${missing.join(', ')}`);
  process.exit(1);
}

const previous = JSON.parse(readFileSync(VIEWPORTS, 'utf8'));
const sorted = Object.fromEntries(Object.entries(heights).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(
  VIEWPORTS,
  `${JSON.stringify({ note: previous.note, width: WIDTH, heights: sorted }, null, 2)}\n`,
);
console.error(
  `\n✓ ${Object.keys(sorted).length} card height(s) into viewports.json`
    + ` — tallest ${Math.max(...Object.values(sorted))}px, shortest ${Math.min(...Object.values(sorted))}px`,
);
