import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const W = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'lib',
  'components',
);

const pickers = ['select', 'multi-select', 'autocomplete'];

const read = (name) => {
  const dir = join(W, name);
  return readdirSync(dir)
    .filter((f) => /\.(ts|html|scss)$/.test(f))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
};

const sources = Object.fromEntries(pickers.map((p) => [p, read(p)]));

const probes = {
  'compareWith (object values)': /compareWith/,
  'Home / End keys': /'Home'|'End'/,
  'PageUp / PageDown': /'PageUp'|'PageDown'/,
  'type-ahead (jump by typing)': /typeahead|typeAhead/i,
  'loading / busy state': /\bloading\b|aria-busy/,
  'opened / closed outputs':
    /output<[^>]*>\(\)[\s\S]{0,40}(opened|closed)|readonly (opened|closed) = output/,
  'filter text as an output':
    /readonly (filterChange|queryChange|search) = output/,
  'custom filter predicate': /filterFn|filterWith|readonly filter = input/,
  'virtual scrolling': /cdk-virtual|CdkVirtualScroll/,
  'panel header / footer slot': /dsPanelHeader|dsPanelFooter/,
  'aria-multiselectable': /aria-multiselectable/,
  'live announcement of results': /aria-live|LiveAnnouncer/,
  'clearing the value from outside': /\bclear\(\)/,
  // Matches the shared helper too, not just an inline call: the behaviour moved
  // into components/scroll-active-option.ts and this probe kept reporting —.
  'scroll the active row into view': /scrollIntoView|scrollActiveOptionIntoView/,
};

const rows = Object.entries(probes).map(([label, re]) => ({
  label,
  has: pickers.map((p) => re.test(sources[p])),
}));

console.log(
  'CAPABILITY'.padEnd(32),
  pickers.map((p) => p.slice(0, 12).padEnd(14)).join(''),
);
console.log('-'.repeat(32 + 14 * pickers.length));
for (const r of rows) {
  console.log(
    r.label.padEnd(32),
    r.has.map((h) => (h ? 'yes' : '—').padEnd(14)).join(''),
  );
}
