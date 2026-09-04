#!/usr/bin/env node
// Asserts the committed upload tree is the FROZEN one — the thing CI cannot rebuild.
//
// `snapshot-cards` turns a card into static HTML unless it needs to stay live, and records the ones
// it kept in `live-cards.txt`. A tree built but never frozen looks fine to every other gate: the
// cards render, the manifest is right, the heights match. This is what notices, and it needs no
// browser, so CI can run it.
//
// It compares against that record rather than re-deriving which cards stay live. Deriving it twice
// is how the two drift, and this gate has already spent a day passing vacuously on a rule it
// recomputed slightly wrong.
//
//   node .design-sync/tools/check-frozen.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const syncDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(syncDir, 'upload');
const RECORD = join(syncDir, 'live-cards.txt');

if (!existsSync(RECORD)) {
  console.error('✗ .design-sync/live-cards.txt is missing — run node .design-sync/tools/snapshot-cards.mjs');
  process.exit(1);
}

const shouldBeLive = new Set(readFileSync(RECORD, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#')));

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
  const isLive = readFileSync(join(OUT, path), 'utf8').includes('<script');
  if (isLive) stillLive += 1;
  if (isLive && !shouldBeLive.has(path)) thawed.push(path);
  if (!isLive && shouldBeLive.has(path)) unexpectedlyFrozen.push(path);
}

const report = (label, list, advice) => {
  console.error(`✗ ${list.length} card(s) ${label}:`);
  for (const path of list.slice(0, 10)) console.error(`    ${path}`);
  console.error(`\n  ${advice}`);
  process.exit(1);
};

if (thawed.length) {
  report('still boot Angular but are not in live-cards.txt', thawed,
    'The tree was built but never frozen. Run, LAST and on a machine with Chrome:\n'
    + '    node .design-sync/tools/snapshot-cards.mjs');
}

if (unexpectedlyFrozen.length) {
  report('are frozen although live-cards.txt records them live', unexpectedlyFrozen,
    'The record and the tree came from different runs — re-run snapshot-cards and commit both.');
}

const missing = [...shouldBeLive].filter((path) => !cards.includes(path));
if (missing.length) {
  report('are recorded live but no longer exist', missing,
    'A card was renamed or withdrawn after the record was written — re-run snapshot-cards.');
}

console.log(`${cards.length - stillLive} of ${cards.length} cards are frozen; the ${stillLive} live ones are exactly what live-cards.txt records`);
