#!/usr/bin/env node
// An ARIA-structure snapshot per chart: every role, every aria-* binding, in template order.
//
// The reason this is a SNAPSHOT and not an axe run: in a 2026 audit of ten charting libraries all
// ten returned zero axe-core violations, including six that expose no accessible structure at all.
// A clean axe run on a chart means nothing on its own, because axe checks what is there and a chart
// fails by having nothing there. What can be asserted is the structure itself, so a role that goes
// missing shows up as a diff rather than as silence.
//
//   node tools/check-chart-aria.mjs            check against the baseline
//   node tools/check-chart-aria.mjs --update   rewrite the baseline after an intended change
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { chartComponents, templateOf } from './chart-components.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'tools', 'chart-aria-snapshot.json');
const update = process.argv.includes('--update');

// Whitespace inside a binding is formatter noise: prettier rewraps a long expression and the
// snapshot would churn on a change that alters no structure at all.
const squash = (value) => value.replace(/\s+/g, ' ').trim();

function ariaOf(template) {
  const found = [];
  for (const [, tag, attributes] of template.matchAll(
    /<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/g,
  )) {
    const bindings = [
      ...attributes.matchAll(
        /(\[?attr\.)?(role|aria-[\w-]+)\]?\s*=\s*"([^"]*)"/g,
      ),
    ].map(
      ([, bound, name, value]) =>
        `${name}=${bound ? `{${squash(value)}}` : squash(value)}`,
    );
    if (bindings.length) {
      found.push(`${tag}: ${bindings.join(', ')}`);
    }
  }

  return found;
}

// A chart on `figure[dsChartStates]` renders the shared frame's error and empty states, so their
// roles belong to that chart's snapshot.
const statesFrame = ariaOf(
  templateOf(
    join(
      ROOT,
      'src',
      'lib',
      'components',
      'chart-tooltip',
      'chart-states.component',
    ),
  ),
);

const snapshot = {};
for (const { name, base } of chartComponents()) {
  const template = templateOf(base);
  snapshot[name] = [
    ...(template.includes('dsChartStates') ? statesFrame : []),
    ...ariaOf(template),
  ];
}

if (update) {
  writeFileSync(
    BASELINE,
    await format(JSON.stringify(snapshot), {
      ...(await resolveConfig(BASELINE)),
      filepath: BASELINE,
    }),
    'utf8',
  );
  console.log(
    `check-chart-aria: baseline rewritten for ${Object.keys(snapshot).length} chart(s).`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error(
    'check-chart-aria: ERROR  no baseline — run `node tools/check-chart-aria.mjs --update`',
  );
  process.exit(1);
}

const expected = JSON.parse(readFileSync(BASELINE, 'utf8'));
const problems = [];
for (const chart of new Set([
  ...Object.keys(expected),
  ...Object.keys(snapshot),
])) {
  const before = expected[chart] ?? [];
  const after = snapshot[chart] ?? [];
  for (const line of before) {
    if (!after.includes(line)) problems.push(`${chart}: gone    ${line}`);
  }
  for (const line of after) {
    if (!before.includes(line)) problems.push(`${chart}: new     ${line}`);
  }
}

for (const line of problems) console.error(`check-chart-aria: ERROR  ${line}`);

if (problems.length) {
  console.error(
    `check-chart-aria: FAILED — ${problems.length} change(s). If they are intended, rerun with --update.`,
  );
  process.exit(1);
}

const total = Object.values(snapshot).reduce(
  (sum, lines) => sum + lines.length,
  0,
);
console.log(
  `check-chart-aria: ${Object.keys(snapshot).length} chart(s), ${total} role/aria binding(s) unchanged.`,
);
