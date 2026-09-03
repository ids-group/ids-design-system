#!/usr/bin/env node
// Fails if a ds-docs chapter is compiled into the bundle and shown on no card.
//
// Twenty-seven were: every Foundations page, every Pattern, every Practice page and Link. They cost
// their bytes in the bundle and were reachable from nothing — so the colour ramps, the spacing
// scale and the do/don't, which is most of what an agent needs before it places a component, were
// published and invisible. Nothing reported it, because each half was internally consistent: the
// manifest listed every card, and every card rendered a section.
//
//   node .design-sync/tools/check-section-coverage.mjs      # after build-cards.mjs
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const syncDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...path) => JSON.parse(readFileSync(join(syncDir, ...path), 'utf8'));

const { sections } = read('elements', 'gen', 'sections.json');
const { cards } = read('elements', 'gen', 'cards.json');

const shown = new Set();
for (const path of cards) {
  const tag = readFileSync(join(syncDir, 'upload', path), 'utf8').match(/<(ds-docs-[a-z0-9-]+)>/);
  if (tag) shown.add(tag[1]);
}

const orphans = sections.filter((section) => !shown.has(section.tag));
if (orphans.length) {
  console.error(`✗ ${orphans.length} ds-docs section(s) ship in the bundle and back no card:`);
  for (const section of orphans) console.error(`    ${section.slug}`);
  process.exit(1);
}

console.log(`✓ every one of ${sections.length} ds-docs section(s) backs a card`);
