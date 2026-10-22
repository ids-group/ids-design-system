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
// application.
//
//   node .design-sync/tools/measure-cards.mjs
//
// Exits non-zero if any card measured nothing, so a section that fails to render cannot quietly
// leave its card unsized. Run build-cards first, then this, then build-cards again to stamp the
// numbers into the markers.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './lib/browser.mjs';
import { WHEN_SETTLED, readWhen } from './lib/settle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const OUT = join(syncDir, 'upload');
const VIEWPORTS = join(syncDir, 'viewports.json');

const WIDTH = 1200;
// Taller than any card, so nothing scrolls and offsetHeight is the whole page.
const FRAME_HEIGHT = 24000;
const PORT = 4577;

const CHROME = [
  process.env.CHROME_BIN,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]
  .filter(Boolean)
  .find((path) => existsSync(path));

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.md': 'text/plain',
  '.png': 'image/png',
};

// The list build-cards wrote, not a walk of the tree: cards live under `components/` and `guides/`
// and are named after the block they show, so any shape assumed here would be a second opinion
// about the layout — and the walk that assumed `<Component>/<Component>.html` did exactly that and
// found nothing once the names changed.
function cards() {
  const listed = JSON.parse(
    readFileSync(join(syncDir, 'elements', 'gen', 'cards.json'), 'utf8'),
  ).cards;

  return listed
    .map((path) => ({
      name: path
        .split('/')
        .pop()
        .replace(/\.html$/, ''),
      // Card names carry spaces, so the request line needs escaping; the server decodes it back.
      url: `/${path.split('/').map(encodeURIComponent).join('/')}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
      var kept = document.documentElement.getAttribute('data-ds-kept');
      // Web fonts land AFTER the section renders, and Mulish is taller than the fallback: measuring
      // on sight came out 20px short on twenty-two cards, which then declared a viewport the pane
      // had to scroll.
      whenSettled(function () {
        document.title = 'H=' + (page ? page.offsetHeight : 0) + ';K=' + (kept === null ? '-' : kept);
      });
    })();
    ${WHEN_SETTLED}
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
  response.writeHead(200, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
  });

  return response.end(readFileSync(file));
});

if (!CHROME) {
  console.error('No Chrome found — measure-cards needs a headless browser.');
  process.exit(1);
}

const all = cards();
server.listen(PORT);
const browser = await launchBrowser({
  chrome: CHROME,
  width: WIDTH,
  height: FRAME_HEIGHT,
});
const heights = {};

// Concurrent TABS in one browser. Cards are independent, so several run at once; more than this
// and the machine's own scheduling starts to dominate.
const LANES = Number(process.env.SNAPSHOT_LANES) || 5;

// The probe writes its numbers into the title, which is one small string to read back rather than
// a whole DOM.
const READ = readWhen("document.title.indexOf('H=') === 0", 'document.title');

async function measure(card) {
  const title = await browser.render(
    `http://127.0.0.1:${PORT}${card.url}`,
    READ,
  );
  const reported = title.match(/^H=(\d+);K=(\d+|-)$/);

  return {
    height: Number(reported?.[1] ?? 0),
    kept: reported?.[2] === '-' ? null : Number(reported?.[2] ?? 0),
  };
}

const blank = [];

let next = 0;
let finished = 0;
async function lane() {
  while (next < all.length) {
    const card = all[next++];
    const { height, kept } = await measure(card);
    heights[card.name] = height;
    if (kept === 0) blank.push(card.name);
    finished += 1;
    // A lone carriage return never flushes into a pipe: redirected, this printed all 410 cards as
    // one 60 KB line, which is what a CI log would have shown instead of progress.
    if (process.stderr.isTTY) {
      process.stderr.write(
        `  ${finished}/${all.length} ${card.name} = ${height}px        \r`,
      );
    } else if (finished % 20 === 0 || finished === all.length) {
      console.error(`  measured ${finished}/${all.length}`);
    }
  }
}

try {
  await Promise.all(Array.from({ length: LANES }, lane));
} finally {
  server.close();
  await browser.close();
}

// A card that renders nothing still has a height, so a run where the bundle was half-built came in
// at 144px for all 418 cards and passed on none of them being zero. The floor sits between that and
// the smallest card that does render its block, which is 281px now that the chapter's lede no
// longer rides every card.
const EMPTY_CARD = 200;

// A card that sliced its own content away still renders a heading and a lede, so it is 371px, not
// 144px, and no height threshold separates it from a small real card. The card counts what survived
// its slice; zero means it published a title over an empty page. Four Menu cards did.
if (blank.length) {
  console.error(
    `\n✗ ${blank.length} card(s) sliced away everything they were meant to show:`,
  );
  for (const name of blank) console.error(`    ${name}`);
  process.exit(1);
}

const missing = Object.entries(heights).filter(
  ([, value]) => value < EMPTY_CARD,
);
if (missing.length) {
  console.error(
    `\n✗ ${missing.length} card(s) rendered no block (under ${EMPTY_CARD}px):`,
  );
  for (const [name, value] of missing.slice(0, 12))
    console.error(`    ${value}px  ${name}`);
  if (missing.length > 12)
    console.error(`    … and ${missing.length - 12} more`);
  console.error(
    '\nA whole run at one small height means the bundle is stale: rebuild it with' +
      ' `bun run build:elements` before measuring.',
  );
  process.exit(1);
}

const previous = JSON.parse(readFileSync(VIEWPORTS, 'utf8'));
const sorted = Object.fromEntries(
  Object.entries(heights).sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(
  VIEWPORTS,
  `${JSON.stringify({ note: previous.note, width: WIDTH, heights: sorted }, null, 2)}\n`,
);
console.error(
  `\n✓ ${Object.keys(sorted).length} card height(s) into viewports.json` +
    ` — tallest ${Math.max(...Object.values(sorted))}px, shortest ${Math.min(...Object.values(sorted))}px`,
);
