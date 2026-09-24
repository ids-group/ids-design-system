#!/usr/bin/env node
// Does check-abbreviated-tokens still FIRE on a planted abbreviation, and stay QUIET on a
// spelled-out name that merely ends in the same letters? Both matter: a gate that flags every
// name ending in "r" would be as useless as one that flags nothing.
//
// Each case writes one throwaway stylesheet into a private fixture tree and asserts what the
// gate says about it. Never into `src/`: this checkout is shared, so a crash here must not be
// able to turn the real gate red on a file nobody made.
//
//   node tools/check-abbreviated-tokens-selftest.mjs
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREE = join(tmpdir(), `abbrev-tokens-selftest.${process.pid}`);
rmSync(TREE, { recursive: true, force: true });
mkdirSync(TREE, { recursive: true });

const run = () => {
  try {
    execFileSync('node', ['tools/check-abbreviated-tokens.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, DS_ABBREV_TOKEN_DIR: relative(ROOT, TREE) },
    });
    return { failed: false, output: '' };
  } catch (error) {
    return { failed: true, output: (error.stdout ?? '') + (error.stderr ?? '') };
  }
};

const write = (name, contents) => writeFileSync(join(TREE, name), contents);
const clear = () => {
  rmSync(TREE, { recursive: true, force: true });
  mkdirSync(TREE, { recursive: true });
};

// [name, files, mustFire, expectedToken]
const cases = [
  [
    'the planted defect: a token spelled as the abbreviation itself',
    { 'a.scss': ':host { --_tag-fw: var(--ds-tag-fw, var(--font-weight-bold)); }' },
    true,
    '--ds-tag-fw',
  ],
  [
    'the other surviving suffix, line-height',
    { 'b.scss': ':host { --_tag-lh: var(--ds-tag-lh, var(--line-height-base)); } ' },
    true,
    '--ds-tag-lh',
  ],
  [
    'a bare width/height abbreviation',
    { 'c.scss': ':host { --_x: var(--ds-panel-w, 320px); }' },
    true,
    '--ds-panel-w',
  ],
  [
    'the shipped survivor: a border-width abbreviated as bw',
    { 'c2.scss': ':host { --_x: var(--ds-slider-thumb-bw, 2px); }' },
    true,
    '--ds-slider-thumb-bw',
  ],
  [
    'a bare truncated dimension, max',
    { 'c3.scss': ':host { --_x: var(--ds-container-max, 1200px); }' },
    true,
    '--ds-container-max',
  ],
  [
    'a middle-segment abbreviation, r for radius',
    { 'c4.scss': ':host { --_x: var(--ds-segmented-r-inner, 4px); }' },
    true,
    '--ds-segmented-r-inner',
  ],
  [
    'a spelled-out property that ends in the same letters as an abbreviation',
    {
      'd.scss':
        ':host { --_x: var(--ds-field-label-text-transform, none); color: var(--ds-input-border-color); }',
    },
    false,
  ],
  [
    'the already-spelled-out siblings of the planted defects',
    {
      'e.scss':
        ':host { --_x: var(--ds-input-label-font-size, 12px); --_y: var(--ds-tag-font-size, 12px); }',
    },
    false,
  ],
  [
    'middle segments the rule must allow: bg-color, size words, heading levels, padding axis',
    {
      'e2.scss':
        ':host { --_a: var(--ds-tag-bg-color, red); --_b: var(--ds-badge-xs-font-size, 10px); --_c: var(--ds-typography-h3-font-size, 20px); --_d: var(--ds-tree-row-padding-y, 8px); }',
    },
    false,
  ],
  [
    'a name inside a comment is documentation, not a declared token',
    { 'f.scss': '// var(--ds-old-fw) used to live here\n.x { color: red; }' },
    false,
  ],
  [
    'radius spelled out must not read as the "-r" abbreviation',
    { 'g.scss': ':host { --_x: var(--ds-card-radius, 4px); }' },
    false,
  ],
  [
    'NEGATIVE CONTROL — only spelled-out names, must stay green',
    {
      'z.scss':
        ':host { --_a: var(--ds-button-border-color, red); --_b: var(--ds-input-padding-x, 4px); --_c: var(--ds-tag-line-height, 1); }',
    },
    false,
  ],
];

let failures = 0;
for (const [name, files, mustFire, expectedToken] of cases) {
  clear();
  for (const [file, contents] of Object.entries(files)) write(file, contents);
  const { failed, output } = run();

  if (mustFire && !failed) {
    console.error(`FAIL  ${name}: the gate stayed green.`);
    failures += 1;
    continue;
  }
  if (!mustFire && failed) {
    console.error(`FAIL  ${name}: the gate went red.\n${output}`);
    failures += 1;
    continue;
  }
  if (mustFire && !output.includes(expectedToken)) {
    console.error(`FAIL  ${name}: fired, but did not name ${expectedToken}.\n${output}`);
    failures += 1;
    continue;
  }
  console.log(`ok    ${name}`);
}

rmSync(TREE, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\ncheck-abbreviated-tokens-selftest: ${failures} case(s) failed.`);
  process.exit(1);
}
const firing = cases.filter(([, , mustFire]) => mustFire).length;
console.log(
  `\ncheck-abbreviated-tokens-selftest: OK — ${cases.length} cases, ${firing} firing shapes and ${cases.length - firing} sound ones.`,
);
