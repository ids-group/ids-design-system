#!/usr/bin/env node
// Asserts the committed upload tree is the FROZEN one — the thing CI cannot rebuild.
//
// `snapshot-cards` turns every card into static HTML except the chapters named in
// `live-chapters.txt`, where a demo opens on a click. A tree built but never frozen looks fine to
// every other gate: the cards render, the manifest is right, the heights match. This is what
// notices, and it needs no browser, so CI can run it.
//
//   node .design-sync/tools/check-frozen.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const syncDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(syncDir, 'upload');

const live = new Set(readFileSync(join(syncDir, 'live-chapters.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#')));

/** The section a card renders, from its host tag: `ds-docs-components-toast` is `components/toast`.
 *  The tag ends at whitespace, not only at `>`: a FROZEN card carries Angular's scope attribute on
 *  the host (`<ds-docs-components-button _nghost-c0="">`), and a pattern anchored on `>` silently
 *  returned null for all 376 of them. */
const chapterOf = (html) => {
  const tag = html.match(/<(ds-docs-[a-z0-9-]+)[\s>]/)?.[1];
  if (!tag) return null;
  const rest = tag.replace('ds-docs-', '');
  const cut = rest.indexOf('-');

  return cut < 0 ? rest : `${rest.slice(0, cut)}/${rest.slice(cut + 1)}`;
};

const cards = [];
const walk = (dir, rel) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const next = `${rel}/${entry.name}`;
    if (entry.isDirectory()) walk(join(dir, entry.name), next);
    else if (entry.name.endsWith('.html')) cards.push(next);
  }
};
for (const top of ['components', 'guides']) walk(join(OUT, top), top);

const thawed = [];
const unexpectedlyFrozen = [];
let stillLive = 0;
for (const path of cards) {
  const html = readFileSync(join(OUT, path), 'utf8');
  const shouldBeLive = live.has(chapterOf(html));
  const isLive = html.includes('<script');
  if (isLive) stillLive += 1;
  if (isLive && !shouldBeLive) thawed.push(path);
  if (!isLive && shouldBeLive) unexpectedlyFrozen.push(path);
}

if (thawed.length) {
  console.error(`✗ ${thawed.length} of ${cards.length} card(s) still boot Angular but are not in live-chapters.txt:`);
  for (const path of thawed.slice(0, 10)) console.error(`    ${path}`);
  console.error('\n  The tree was built but never frozen. Run, LAST and on a machine with Chrome:');
  console.error('    node .design-sync/tools/snapshot-cards.mjs');
  process.exit(1);
}

if (unexpectedlyFrozen.length) {
  console.error(`✗ ${unexpectedlyFrozen.length} card(s) are frozen although their chapter is listed live:`);
  for (const path of unexpectedlyFrozen.slice(0, 10)) console.error(`    ${path}`);
  console.error('\n  Either the chapter left live-chapters.txt, or the freeze ran on a stale tree.');
  process.exit(1);
}

console.log(`${cards.length - stillLive} of ${cards.length} cards are frozen; the ${stillLive} live ones are all in live-chapters.txt`);
