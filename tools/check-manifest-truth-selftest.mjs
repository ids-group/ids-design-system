#!/usr/bin/env node
// Can the boundary check still FIRE, and do its exemptions still HOLD? Both halves earn their
// place: the check went through five rounds before it was trustworthy — the first, textual version
// reported 77 findings and nearly every one was its own fault — so each exemption below exists
// because a real item was wrongly accused, and a regression in any of them puts the noise back.
//
// Nothing here writes to the repository. Mutating a real manifest to test the rules is the obvious
// design and the wrong one in a checkout shared with other sessions: the first attempt did that and
// died mid-run on a file lock, with the restore in a `finally` that could not write either. So the
// rules are exercised through the exported `checkItem` against synthetic surfaces, and the parts
// that depend on reading a tree are asserted by running the real check over one version, read-only.
//
//   node tools/check-manifest-truth-selftest.mjs
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkItem } from './check-manifest-truth.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const surface = ({ tokens = [], symbols = [], classes = [], elements = {} }) => ({
  tokens: new Set(tokens),
  symbols: new Set(symbols),
  classes: new Set(classes),
  elements: new Map(Object.entries(elements).map(([tag, members]) => [tag, new Set(members)])),
});

const rules = [
  {
    name: 'FIRES when old never existed and new names nothing either',
    item: { id: 'x', kind: 'token-rename', old: '--never-was', new: '--also-never' },
    before: surface({ tokens: ['--real'] }),
    after: surface({ tokens: ['--real'] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when a renamed token still resolves at its own tag',
    item: { id: 'x', kind: 'token-rename', old: '--primary', new: '--primary-strong' },
    before: surface({ tokens: ['--primary'] }),
    after: surface({ tokens: ['--primary', '--primary-strong'] }),
    expect: 'fire',
  },
  {
    name: 'FIRES when new does not exist at the tag',
    item: { id: 'x', kind: 'token-rename', old: '--primary', new: '--never-shipped' },
    before: surface({ tokens: ['--primary'] }),
    after: surface({ tokens: [] }),
    expect: 'fire',
  },
  {
    name: 'HOLDS: a phantom rename whose new name IS real',
    item: { id: 'x', kind: 'output-rename', old: 'ds-banner[dismissed]', new: 'closed' },
    before: surface({ elements: { 'ds-banner': ['closed'] } }),
    after: surface({ elements: { 'ds-banner': ['closed'] } }),
    expect: 'hold',
  },
  {
    name: 'HOLDS: a generic parameterisation is not a rename',
    item: { id: 'x', kind: 'type-rename', old: 'ToastPromiseMessages', new: 'ToastPromiseMessages<T>' },
    before: surface({ symbols: ['ToastPromiseMessages'] }),
    after: surface({ symbols: ['ToastPromiseMessages'] }),
    expect: 'hold',
  },
  {
    name: 'HOLDS: a suffix rename still has to lose the old token',
    item: { id: 'x', kind: 'token-rename', old: '--ds-toast-border', new: '--ds-toast-border-color' },
    before: surface({ tokens: ['--ds-toast-border'] }),
    after: surface({ tokens: ['--ds-toast-border-color'] }),
    expect: 'hold',
  },
  {
    name: 'HOLDS: a consumer example class is set aside, not accused',
    item: { id: 'x', kind: 'behavior', old: 'class MyTable extends TableComponent', new: null },
    before: surface({ symbols: ['TableComponent'] }),
    after: surface({ symbols: ['TableComponent'] }),
    expect: 'hold',
    unresolved: 1,
  },
];

let failed = 0;
for (const testCase of rules) {
  const verdict = checkItem(testCase.item, testCase.before, testCase.after, 'v0.0.0', 'v0.0.1');
  const got = verdict.defects.length ? 'fire' : 'hold';
  let ok = got === testCase.expect;
  if (testCase.unresolved !== undefined && verdict.unresolved.length !== testCase.unresolved) ok = false;
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} ${testCase.name} — expected ${testCase.expect}, got ${got}` +
      (testCase.unresolved !== undefined ? ` (${verdict.unresolved.length} set aside)` : ''),
  );
}

// These depend on reading a real tree, not on the rules alone: an implicit `model()` output that no
// source line declares, and the live shapes above as they actually ship.
const readOnly = [
  ['0.7.0', "a model()'s implicit Change output"],
  ['0.11.2', 'a consumer example in a detect shape'],
  ['0.11.3', 'four phantom output renames'],
  ['0.11.4', 'a generic parameterisation'],
];
for (const [version, what] of readOnly) {
  let got = 'green';
  try {
    execFileSync('node', ['tools/check-manifest-truth.mjs', version], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch {
    got = 'red';
  }
  const ok = got === 'green';
  if (!ok) failed++;
  console.log(`${ok ? 'ok   ' : 'FAIL '} ${version} as it ships — ${what}: expected green, got ${got}`);
}

const fires = rules.filter((r) => r.expect === 'fire').length;
const holds = rules.filter((r) => r.expect === 'hold').length + readOnly.length;
if (failed) {
  console.error(`\n${failed} case(s) wrong.`);
  process.exit(1);
}
console.log(`\nevery case behaved: ${fires} case(s) fire, ${holds} exemption(s) hold`);
