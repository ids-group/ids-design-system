#!/usr/bin/env node
// Freezes every card that does not need to be live into static HTML, then minifies the result.
//
// A card is a whole document that boots its own Angular application over the 2.12 MB bundle, and
// the pane shows a grid of them. The snapshot renders identically because no colour is baked in:
// the theme tokens stay in `_ds_bundle.css`, which the static card still links.
//
// What is lost is BEHAVIOUR. Two kinds of card keep it: the chapters in `live-chapters.txt` and
// every card owning a panel (see PANEL_OWNERS). What a run kept is recorded in `live-cards.txt`.
//
//   node .design-sync/tools/snapshot-cards.mjs      # after build-cards has stamped the heights
//
// Run it LAST. It rewrites card files in place, and any later build-cards run replaces them with
// live cards again.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './lib/browser.mjs';
import { WHEN_SETTLED, readWhen } from './lib/settle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const OUT = join(syncDir, 'upload');
const SHARED_CSS = '_ds_cards.css';
const PORT = 4579;
const WIDTH = 1200;
const FRAME_HEIGHT = 24000;
// Concurrent TABS in one browser, not processes: a tab costs a fraction of a chromium, so this is
// about how much the render queue may hold at once rather than about the container's RAM.
const LANES = Number(process.env.SNAPSHOT_LANES) || 5;

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

if (!CHROME) {
  console.error('No Chrome found — snapshot-cards needs a headless browser.');
  process.exit(1);
}

const live = new Set(
  readFileSync(join(syncDir, 'live-chapters.txt'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#')),
);

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

// Controls whose panel IS the documented thing. The panel was never VISIBLE in a card - a CDK
// overlay is closed by default - but a frozen card has no click to open it either. Matched per
// CARD: by chapter this keeps 130 cards live to cover the 85 that own a panel, Table 35 for 5.
const PANEL_OWNERS =
  /<(ds-select|ds-multi-select|ds-autocomplete|ds-date-picker|ds-time-picker|ds-color-picker|ds-menu|ds-popover)[\s>]/;

// The surfaces no element name covers: Table builds its own column-filter panel instead of
// composing `ds-popover`, and a tooltip is a directive with no element. Matched as an ATTRIBUTE -
// `aria-haspopup` appears as prose in the API tables too, and the bare word made a Button card
// look interactive.
const OPENS_ON_DEMAND = /\saria-haspopup="|\sdstooltip/i;

const cards = JSON.parse(
  readFileSync(join(syncDir, 'elements', 'gen', 'cards.json'), 'utf8'),
).cards;

// Template indentation reaches the snapshot as real text nodes. Collapsing it with a regexp over
// the file would corrupt the places where whitespace is content - `white-space: pre` on the mono
// type specimen, `pre-wrap` on the breadcrumb separator and the token tiles, `pre-line` in the token
// reference - so it is collapsed HERE, in the page, where the computed style says which is which.
// A run collapsed to ONE space renders identically: that is what the browser does with it anyway.
// `String.raw`, or `\n` and `\s` in the regexps below reach the page as a newline and an `s`, and
// the whole script is a SyntaxError.
const TIDY = String.raw`
<script>
  (function () {
    var t0 = Date.now();
    (function ready() {
      if (!document.documentElement.hasAttribute('data-ds-sliced') && Date.now() - t0 < 20000) {
        return setTimeout(ready, 25);
      }
      whenSettled(tidy);
    })();
    ${WHEN_SETTLED}
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

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.md': 'text/plain',
  '.png': 'image/png',
};
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
  response.writeHead(200, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
  });

  return response.end(readFileSync(file));
});

// Waits for the tidied attribute; a dump without it did not settle, and the caller treats that as
// a failure. The doctype is prepended HERE rather than in the page: `--dump-dom` printed one and
// `outerHTML` does not, and building the string in the page needs an escaped newline that the
// template literal around it silently turns into a real one — an unterminated string literal,
// which is a page-side SyntaxError that returns an empty card for every single one of them.
const DUMP = readWhen(
  "document.documentElement.hasAttribute('data-ds-tidied')",
  'document.documentElement.outerHTML',
);

const render = async (path) => {
  const html = await browser.render(
    `http://127.0.0.1:${PORT}/${path.split('/').map(encodeURIComponent).join('/')}`,
    DUMP,
  );

  // The trailing newline matters as much as the doctype: `--dump-dom` printed one, every frozen
  // card in git ends with it, and dropping it rewrites all 280 of them on the next release for a
  // single byte each.
  return html
    ? `<!DOCTYPE html>
${html}
`
    : '';
};

server.listen(PORT);
const browser = await launchBrowser({
  chrome: CHROME,
  width: WIDTH,
  height: FRAME_HEIGHT,
});

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

// Running this twice without a build-cards between corrupts the tree: the second pass renders a
// card that is already static, re-prepends the marker and dumps the result, and some cards came
// back with their section in twice - 6 buttons and two h2 where there had been 3 and one, which
// only the height check caught, on 268 cards.
const alreadyFrozen = queue.filter(
  (path) => !readFileSync(join(OUT, path), 'utf8').includes('<script'),
);
if (alreadyFrozen.length) {
  server.close();
  await browser.close();
  console.error(
    `✗ ${alreadyFrozen.length} of ${queue.length} card(s) are already frozen — this has run once` +
      ' already. Re-run `node .design-sync/tools/build-upload.mjs` first; freezing a frozen card' +
      ' duplicates its content.',
  );
  process.exit(1);
}

// A lone carriage return never flushes into a pipe, so a CI log and a captured run both showed
// NOTHING for the whole render — twice mistaken here for a hang. Off a TTY it prints lines instead.
const report = (count) => {
  if (process.stderr.isTTY) {
    process.stderr.write(`  rendered ${count}/${queue.length}        \r`);

    return;
  }
  if (count % 20 === 0 || count === queue.length)
    console.error(`  rendered ${count}/${queue.length}`);
};

let next = 0;
async function lane() {
  while (next < queue.length) {
    const path = queue[next++];
    const dom = await render(path);
    // `data-ds-tidied` is the last thing set, after the card's own script has finished slicing.
    // Without it the page was caught mid-boot and the snapshot would freeze a half-built section.
    // Matched on the root element: the injected script's own source names the attribute too.
    if (!/^<!DOCTYPE html>\s*<html[^>]*\sdata-ds-tidied="/.test(dom)) {
      failed.push(path);
      continue;
    }
    snapshots.set(path, dom);
    report(snapshots.size + failed.length);
  }
}

try {
  await Promise.all(Array.from({ length: LANES }, lane));
} finally {
  server.close();
  await browser.close();
}

process.stderr.write('\r'.padEnd(90));
if (failed.length) {
  console.error(
    `\n✗ ${failed.length} card(s) never finished rendering, so nothing was written:`,
  );
  for (const path of failed.slice(0, 10)) console.error(`    ${path}`);
  process.exit(1);
}

// Angular inlines a component's styles into every document that renders it. Mostly the blocks are
// scoped by the `_ngcontent`/`_nghost` attributes - but NOT entirely, see the union below.
const isComponentStyle = (body) =>
  body.includes('_nghost-') || body.includes('_ngcontent-');

// Whitespace inside a `<style>` is never rendered, so this collapses unconditionally - unlike the
// body text below, which has to ask the computed style first.
const tidyCss = (body) =>
  body
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, '\n')
    .trim();

// Five lanes finish out of order, so the Map's order is a race. `cards.json` order is what makes
// the sheet and the shortened ids byte-identical run to run.
const rendered = queue.map((path) => [path, snapshots.get(path)]);

// Only the RENDERED dom can tell: a live card's own HTML holds just `<ds-docs-components-select>`,
// and everything inside it appears when Angular renders. A card that owns a panel is left exactly
// as build-cards wrote it.
const ordered = [];
for (const entry of rendered) {
  if (PANEL_OWNERS.test(entry[1]) || OPENS_ON_DEMAND.test(entry[1]))
    kept.push(entry[0]);
  else ordered.push(entry);
}

// EVERY rendered card, not only the frozen ones: a block qualifies on carrying a scope attribute
// anywhere in it, and some carry document-level rules alongside. Narrowing this to the frozen set
// moved 80 frozen cards by 4-32px.
const blocks = [];
for (const [, dom] of rendered) {
  for (const [, body] of dom.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    if (isComponentStyle(body) && !blocks.includes(body)) blocks.push(body);
  }
}

// Renamed across the sheet and every card in one pass: the attribute IS the scope, so a rename
// that reaches only one of them silently unstyles the component.
const ids = new Map();
const shorten = (text) =>
  text.replace(/ng-c\d+/g, (id) => {
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

// What `check-frozen` asserts against, so the rule has one implementation rather than two.
writeFileSync(
  join(syncDir, 'live-cards.txt'),
  `# Written by snapshot-cards.mjs — the cards it left live. Do not edit; see live-chapters.txt.\n${[
    ...kept,
  ]
    .sort()
    .join('\n')}\n`,
);

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
console.log(
  `\n✓ ${ordered.length} card(s) frozen to static HTML, ${kept.length} left live` +
    ` (${[...live].join(', ')} + every card with a panel)` +
    `\n  ${blocks.length} distinct component style block(s) → ${SHARED_CSS} (${kb(Buffer.byteLength(sheet))}, fetched once)` +
    `\n  ${ids.size} Angular component id(s) shortened` +
    `\n  cards ${kb(before)} → ${kb(after)}`,
);
