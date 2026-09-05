#!/usr/bin/env node
// Asserts the committed upload tree is the FROZEN one — the thing CI cannot rebuild.
//
// A tree built but never frozen looks fine to every other gate: the cards render, the manifest is
// right, the heights match. This needs no browser, so CI can run it.
//
// It compares against `live-cards.txt` rather than re-deriving which cards stay live - two
// implementations of that rule drift, and this gate has already passed vacuously on one.
//
//   node .design-sync/tools/check-frozen.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const syncDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(syncDir, 'upload');
const RECORD = join(syncDir, 'live-cards.txt');

if (!existsSync(RECORD)) {
  console.error(
    '✗ .design-sync/live-cards.txt is missing — run node .design-sync/tools/snapshot-cards.mjs',
  );
  process.exit(1);
}

const shouldBeLive = new Set(
  readFileSync(RECORD, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#')),
);

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
  report(
    'still boot Angular but are not in live-cards.txt',
    thawed,
    'The tree was built but never frozen. Run, LAST and on a machine with Chrome:\n' +
      '    node .design-sync/tools/snapshot-cards.mjs',
  );
}

if (unexpectedlyFrozen.length) {
  report(
    'are frozen although live-cards.txt records them live',
    unexpectedlyFrozen,
    'The record and the tree came from different runs — re-run snapshot-cards and commit both.',
  );
}

// The record comes from the same run that wrote the tree, so every comparison above is satisfied by
// a run that froze too little: it records whatever it left live and agrees with itself. A floor is
// the one thing the rest of the file cannot supply.
//
// Half is not a fine-grained rule and is not meant to be: the split has been ~283 frozen to ~127
// live for as long as the freeze has existed, and the failures this guards against are wholesale —
// live-chapters.txt matching every chapter, or the panel-owner regex matching every card. A floor
// that only caught EXACTLY zero let ten live cards out of eleven walk through.
const FROZEN_FLOOR = 0.5;
if (cards.length - stillLive < cards.length * FROZEN_FLOOR) {
  console.error(
    `✗ only ${cards.length - stillLive} of ${cards.length} cards are frozen, and live-cards.txt` +
      ' records the rest live.',
  );
  console.error(
    '\n  The two agree because one run wrote both. Either live-chapters.txt now matches every\n' +
      '  chapter, or the panel-owner rule matched every card — neither is ever right.',
  );
  process.exit(1);
}

const missing = [...shouldBeLive].filter((path) => !cards.includes(path));
if (missing.length) {
  report(
    'are recorded live but no longer exist',
    missing,
    'A card was renamed or withdrawn after the record was written — re-run snapshot-cards.',
  );
}

console.log(
  `${cards.length - stillLive} of ${cards.length} cards are frozen; the ${stillLive} live ones are exactly what live-cards.txt records`,
);
