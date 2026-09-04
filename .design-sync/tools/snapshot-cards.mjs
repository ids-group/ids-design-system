#!/usr/bin/env node
// Freezes every card that does not need to be live into static HTML, then minifies the result.
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
// What is lost is BEHAVIOUR, everywhere - a Select no longer opens, a Tab no longer switches. Two
// kinds of card are therefore left alone: the chapters named in `live-chapters.txt`, whose demos
// only exist once opened, and every card that renders a control whose panel IS the thing being
// documented. The second set is decided from the rendered dom, not from the list, and what a run
// kept is recorded in `live-cards.txt`.
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
const SHARED_CSS = '_ds_cards.css';
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
  const tag = html.match(/<(ds-docs-[a-z0-9-]+)[\s>]/)?.[1];
  if (!tag) return null;
  const rest = tag.replace('ds-docs-', '');
  const cut = rest.indexOf('-');

  return cut < 0 ? rest : `${rest.slice(0, cut)}/${rest.slice(cut + 1)}`;
};

// A dropdown is a CDK overlay: closed by default and portaled to `document.body`, so a card never
// SHOWED one — verified against the pre-freeze cards, which held no overlay either. What a frozen
// card loses is the click that opens it, and the panel is the whole point of these controls. So any
// card rendering one of them stays live, whatever chapter it belongs to: the chapter list would drag
// 130 cards live to keep the 85 that actually have a panel — Table alone is 35 for 5.
const PANEL_OWNERS = /<(ds-select|ds-multi-select|ds-autocomplete|ds-date-picker|ds-time-picker|ds-color-picker|ds-menu|ds-popover)[\s>]/;

const cards = JSON.parse(readFileSync(join(syncDir, 'elements', 'gen', 'cards.json'), 'utf8')).cards;

// Template indentation reaches the snapshot as real text nodes. Collapsing it with a regexp over
// the file would corrupt the places where whitespace is content - `white-space: pre` on the mono
// type specimen, `pre-wrap` on the breadcrumb separator and the token tiles, `pre-line` in the token
// reference - so it is collapsed HERE, in the page, where the computed style says which is which.
// A run collapsed to ONE space renders identically: that is what the browser does with it anyway.
const TIDY = `
<script>
  (function () {
    var t0 = Date.now();
    (function ready() {
      if (!document.documentElement.hasAttribute('data-ds-sliced') && Date.now() - t0 < 20000) {
        return setTimeout(ready, 25);
      }
      // The section is built, which is not the same as settled: components that MEASURE write their
      // result later - Table's sticky scrollbar pins '.scroll-wrap' to a computed height, and that
      // one card froze three different ways across three runs. Counting frames guessed at how many;
      // this waits for the DOM to stop changing instead, which is what "settled" actually means.
      // Fonts first, because a measure taken against the fallback face is the wrong number.
      return document.fonts.ready.then(function () {
        var quiet = null;
        var observer = new MutationObserver(function () {
          clearTimeout(quiet);
          quiet = setTimeout(done, 150);
        });
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
        quiet = setTimeout(done, 150);
        var hardStop = setTimeout(done, 5000);
        var finished = false;
        function done() {
          if (finished) return;
          finished = true;
          clearTimeout(quiet);
          clearTimeout(hardStop);
          observer.disconnect();
          tidy();
        }
      });
    })();
    function tidy() {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var pending = [];
      for (var node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!/[\n\t]|  /.test(node.nodeValue)) continue;
        var mode = getComputedStyle(node.parentElement).whiteSpace;
        if (mode !== 'normal' && mode !== 'nowrap') continue;
        pending.push(node);
      }
      for (var i = 0; i < pending.length; i++) {
        pending[i].nodeValue = pending[i].nodeValue.replace(/\s+/g, ' ');
      }
      document.documentElement.setAttribute('data-ds-tidied', String(pending.length));
    }
  })();
</script>`;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.md': 'text/plain', '.png': 'image/png' };
const server = createServer((request, response) => {
  const url = decodeURIComponent(request.url.split('?')[0]);
  const file = join(OUT, url);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    response.writeHead(404);

    return response.end('nf');
  }
  if (url.endsWith('.html')) {
    response.writeHead(200, { 'Content-Type': 'text/html' });

    return response.end(readFileSync(file, 'utf8') + TIDY);
  }
  response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });

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
const failed = [];
const snapshots = new Map();
const queue = cards.filter((path) => {
  const chapter = chapterOf(readFileSync(join(OUT, path), 'utf8'));
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
    const dom = await render(path);
    // `data-ds-tidied` is the last thing set, after the card's own script has finished slicing.
    // Without it the page was caught mid-boot and the snapshot would freeze a half-built section.
    if (!dom.includes('data-ds-tidied')) {
      failed.push(path);
      continue;
    }
    snapshots.set(path, dom);
    process.stderr.write(`  rendered ${snapshots.size + failed.length}/${queue.length}        \r`);
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
  console.error(`\n✗ ${failed.length} card(s) never finished rendering, so nothing was written:`);
  for (const path of failed.slice(0, 10)) console.error(`    ${path}`);
  process.exit(1);
}

// Angular inlines a component's styles into every document that renders it, so the same block
// arrives in card after card: 4005 style tags across the tree, 185 of them distinct, 10.3 MB inlined
// against 473 KB of union. Concatenating them into one linked sheet lets the browser fetch it once
// for the whole grid instead of parsing 27 KB inside each card. Mostly they are scoped by the
// `_ngcontent`/`_nghost` attributes, but NOT entirely - see the union below, which is why the sheet
// is built from every rendered card in `cards.json` order rather than from an arbitrary subset.
const isComponentStyle = (body) => body.includes('_nghost-') || body.includes('_ngcontent-');

// Whitespace inside a `<style>` is never rendered, so this collapses unconditionally - unlike the
// body text below, which has to ask the computed style first.
const tidyCss = (body) => body
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '\n')
  .trim();

// Five lanes finish out of order, so the Map's own order is a race. Reading it back in the order
// `cards.json` declares is what makes the sheet and the shortened ids byte-identical run to run -
// otherwise every snapshot rewrites all 376 cards and the shared sheet with no change in them, and
// the committed tree CI diffs against is noise.
const rendered = queue.map((path) => [path, snapshots.get(path)]);

// Whether a card owns a panel can only be told from the RENDERED dom: a live card's own HTML holds
// just `<ds-docs-components-select>`, and every element inside it appears when Angular renders. So
// the decision comes after the render, and a card that turns out to own one is left exactly as
// build-cards wrote it.
const ordered = [];
for (const entry of rendered) {
  if (PANEL_OWNERS.test(entry[1])) kept.push(entry[0]);
  else ordered.push(entry);
}

// Collected from EVERY rendered card, not only the frozen ones. A block qualifies on containing a
// scope attribute anywhere in it, and some carry document-level rules alongside — `:root` custom
// properties, keyframes, `::ng-deep` output. Building the union from the frozen set alone dropped
// the blocks that only a now-live card contributed, and 80 frozen cards moved by 4-32px: the rules
// they need are not all attribute-scoped, whatever the scoping suggests. A live card does not link
// the sheet, so the extra blocks cost the grid one larger fetch and nothing else.
const blocks = [];
for (const [, dom] of rendered) {
  for (const [, body] of dom.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    if (isComponentStyle(body) && !blocks.includes(body)) blocks.push(body);
  }
}

// Renamed across the sheet and every card in one pass: the attribute IS the scope, so a rename
// that reaches only one of them silently unstyles the component.
const ids = new Map();
const shorten = (text) => text.replace(/ng-c\d+/g, (id) => {
  if (!ids.has(id)) ids.set(id, `c${ids.size.toString(36)}`);

  return ids.get(id);
});

const sheet = shorten(blocks.join('\n').replace(/@charset "UTF-8";/g, ''));
writeFileSync(join(OUT, SHARED_CSS), `${sheet.trim()}\n`);

let before = 0;
let after = 0;
for (const [path, dom] of ordered) {
  const source = readFileSync(join(OUT, path), 'utf8');
  // Everything before `<!doctype`: the @dsCard marker lives there and a DOM dump starts at
  // `<html>`, so without this the card would vanish from the manifest the next build reads.
  const marker = source.slice(0, source.indexOf('<!doctype'));
  before += Buffer.byteLength(source);

  let html = dom.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  let linked = false;
  html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (_whole, body) => {
    if (!isComponentStyle(body)) return `<style>${tidyCss(body)}</style>`;
    if (linked) return '';
    linked = true;

    return `<link rel="stylesheet" href="../../../${SHARED_CSS}">`;
  });
  html = shorten(html)
    // The card's own comments explain the LIVE card to whoever reads the generator's output; a
    // frozen card is generated output that nobody edits.
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\sng-version="[^"]*"/g, '')
    .replace(/\sdata-ds-(?:tidied|sliced|kept)="[^"]*"/g, '');
  // No newline squashing over the file: a regexp cannot see that it is inside `<pre>`. One that did
  // ate the indentation of the SQL sample in the mono type specimen and cost the card a line. The
  // in-page pass above is the only whitespace touched, and it asks the computed style first.

  const written = marker + html;
  after += Buffer.byteLength(written);
  writeFileSync(join(OUT, path), written);
}

// The record of what this run left live, so `check-frozen` asserts against it instead of
// re-deriving the rule. Two implementations of "which cards stay live" is how they drift, and the
// gate went a whole day passing vacuously the last time it re-derived something.
writeFileSync(
  join(syncDir, 'live-cards.txt'),
  `# Written by snapshot-cards.mjs — the cards it left live. Do not edit; see live-chapters.txt.\n${
    [...kept].sort().join('\n')}\n`,
);

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
console.log(
  `\n✓ ${ordered.length} card(s) frozen to static HTML, ${kept.length} left live`
  + ` (${[...live].join(', ')} + every card with a panel)`
  + `\n  ${blocks.length} distinct component style block(s) → ${SHARED_CSS} (${kb(Buffer.byteLength(sheet))}, fetched once)`
  + `\n  ${ids.size} Angular component id(s) shortened`
  + `\n  cards ${kb(before)} → ${kb(after)}`,
);
