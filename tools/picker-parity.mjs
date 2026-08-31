import { readFileSync } from 'node:fs';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const W = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'lib',
  'components',
);

const pickers = {
  select: `${W}/select/select.component.ts`,
  'multi-select': `${W}/multi-select/multi-select.component.ts`,
  autocomplete: `${W}/autocomplete/autocomplete.component.ts`,
};

const members = {};
const unrendered = [];
for (const [name, file] of Object.entries(pickers)) {
  const text = readFileSync(file, 'utf8');
  // A slot is only a slot once the TEMPLATE renders it. Declaring the contentChild
  // and never reading it is how `dsChipTemplate` sat "present" on ds-autocomplete
  // for a whole release while silently discarding whatever a consumer projected —
  // and this file certified it, because it only ever read the .ts.
  const template = readFileSync(file.replace(/\.ts$/, '.html'), 'utf8');
  const declared = [...text.matchAll(/(\w+) = contentChild\((\w+)/g)].map((m) => ({
    field: m[1],
    directive: m[2],
  }));
  for (const slot of declared) {
    if (!template.includes(`${slot.field}()`)) {
      unrendered.push(`${name}: ${slot.directive} is declared as ${slot.field} and never rendered`);
    }
  }

  members[name] = {
    inputs: [...text.matchAll(/readonly (\w+) = input/g)].map((m) => m[1]),
    models: [...text.matchAll(/readonly (\w+) = model/g)].map((m) => m[1]),
    outputs: [...text.matchAll(/readonly (\w+) = output/g)].map((m) => m[1]),
    slots: declared
      .filter((slot) => template.includes(`${slot.field}()`))
      .map((slot) => slot.directive),
  };
}

const all = new Set();
for (const m of Object.values(members)) {
  for (const kind of ['inputs', 'models', 'outputs', 'slots']) {
    m[kind].forEach((x) => all.add(`${kind}:${x}`));
  }
}

const names = Object.keys(pickers);
const rows = [...all].sort().map((entry) => {
  const [kind, member] = entry.split(':');
  const has = names.map((n) => members[n][kind].includes(member));
  return { kind, member, has, count: has.filter(Boolean).length };
});

console.log(
  'MEMBER'.padEnd(24),
  names.map((n) => n.slice(0, 12).padEnd(13)).join(''),
);
console.log('-'.repeat(24 + 13 * names.length));
for (const r of rows.filter((r) => r.count < names.length)) {
  console.log(
    `${r.kind}:${r.member}`.padEnd(24),
    r.has.map((h) => (h ? 'yes' : '—').padEnd(13)).join(''),
  );
}
if (unrendered.length) {
  console.log('\nDECLARED BUT NEVER RENDERED — a slot a consumer can fill and nothing reads:');
  for (const line of unrendered) {
    console.log(`  ${line}`);
  }
}

console.log('\nshared by all three:');
console.log(
  rows
    .filter((r) => r.count === names.length)
    .map((r) => r.member)
    .join(', '),
);
