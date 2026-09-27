#!/usr/bin/env node
// Fails if a ds-docs chapter opts a block into Claude Design (`data-claude-design`) and still backs no card.
// A chapter that opts nothing in is unpublished on purpose; see .design-sync/CARDS.md.
//
//   node .design-sync/tools/check-section-coverage.mjs      # after build-cards.mjs
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const syncDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...path) =>
  JSON.parse(readFileSync(join(syncDir, ...path), 'utf8'));

const { sections } = read('elements', 'gen', 'sections.json');
const { cards, opted } = read('elements', 'gen', 'cards.json');
const optedIn = new Set(opted);

const shown = new Set();
for (const path of cards) {
  // The tag ends at whitespace, not only at `>`: a frozen card carries Angular's scope attribute on
  // the host, and anchoring on `>` reported 82 of 90 sections as backing no card.
  const tag = readFileSync(join(syncDir, 'upload', path), 'utf8').match(
    /<(ds-docs-[a-z0-9-]+)[\s>]/,
  );
  if (tag) shown.add(tag[1]);
}

const orphans = sections.filter(
  (section) => optedIn.has(section.tag) && !shown.has(section.tag),
);
if (orphans.length) {
  console.error(
    `✗ ${orphans.length} ds-docs section(s) opt into Claude Design and back no card:`,
  );
  for (const section of orphans) console.error(`    ${section.slug}`);
  process.exit(1);
}

console.log(
  `✓ every one of ${optedIn.size} opted-in ds-docs section(s) backs a card; ${sections.length - optedIn.size} unpublished`,
);
