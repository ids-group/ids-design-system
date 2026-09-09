#!/usr/bin/env node
// Does check-void-tokens still FIRE, and does it still stay QUIET on the four shapes that are
// sound? Both halves matter equally here: the gate's whole value is that it reports the one real
// void among 26 look-alikes, so a version that flagged everything would be as useless as one that
// flagged nothing — and the first version of this gate did exactly that, reporting
// `var(--warning-subtitle, var(--surface-subtitle))` because it walked into a nested fallback whose
// primary had already resolved.
//
// Each case writes ONE throwaway stylesheet into a private fixture tree and asserts what the gate
// says about it. Never into `src/` or `ds-docs/src/`: this checkout is shared, so a crash here must
// not be able to turn the real gate red on a file nobody made.
//
//   node tools/check-void-tokens-selftest.mjs
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREE = join(tmpdir(), `void-tokens-selftest.${process.pid}`);
rmSync(TREE, { recursive: true, force: true });
mkdirSync(TREE, { recursive: true });

const run = () => {
  try {
    execFileSync('node', ['tools/check-void-tokens.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, DS_VOID_TOKEN_DIRS: relative(ROOT, TREE) },
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
    'a bare var() with no fallback',
    { 'a.scss': '.x { color: var(--never-declared-anywhere); }' },
    true,
    '--never-declared-anywhere',
  ],
  [
    'the shape that shipped: one void inside a shorthand',
    { 'b.scss': '.chapter { padding: 5px 10px 5px var(--space-7); }' },
    true,
    '--space-7',
  ],
  [
    'a fallback chain where BOTH names are void',
    { 'c.scss': '.x { color: var(--void-primary, var(--void-fallback)); }' },
    true,
    '--void-fallback',
  ],
  [
    'a void nested two fallbacks deep',
    {
      'd.scss':
        '.x { color: var(--void-1, var(--void-2, var(--void-3))); }',
    },
    true,
    '--void-3',
  ],
  [
    'rule 1 — a name inside a // comment is documentation',
    { 'e.scss': '// var(--only-in-a-comment) is the idiom\n.x { color: red; }' },
    false,
  ],
  [
    'rule 1 — a name inside a /* */ comment too',
    { 'f.scss': '/* var(--only-in-a-block-comment) */\n.x { color: red; }' },
    false,
  ],
  [
    'rule 2 — written from a template binding',
    {
      'g.scss': '.row { height: var(--_from-the-template); }',
      'g.component.html': '<div [style.--_from-the-template]="rowHeight()"></div>',
    },
    false,
  ],
  [
    'rule 2 — written from script',
    {
      'h.scss': '.row { height: var(--_from-script); }',
      'h.component.ts': "el.style.setProperty('--_from-script', '40px');",
    },
    false,
  ],
  [
    'rule 3 — a token emitted by a Sass loop, so no literal declaration exists',
    { 'i.scss': '.x { max-width: var(--bp-sm); }' },
    false,
  ],
  [
    'rule 4 — a dead fallback behind a primary that resolves',
    {
      'j.scss':
        '.x { background: var(--warning-subtitle, var(--surface-subtitle)); }',
    },
    false,
  ],
  [
    'a token declared in the same file',
    { 'k.scss': ':host { --_local: 4px; }\n.x { padding: var(--_local); }' },
    false,
  ],
  [
    'NEGATIVE CONTROL — only real tokens, must stay green',
    {
      'z.scss':
        '.x { padding: var(--space-4) var(--space-2-5); color: var(--text-secondary); border-radius: var(--radius-md); background: var(--surface-secondary); }',
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
    console.error(
      `FAIL  ${name}: fired, but did not name ${expectedToken}.\n${output}`,
    );
    failures += 1;
    continue;
  }
  console.log(`ok    ${name}`);
}

rmSync(TREE, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\ncheck-void-tokens-selftest: ${failures} case(s) failed.`);
  process.exit(1);
}
console.log(
  `\ncheck-void-tokens-selftest: OK — ${cases.length} cases, 4 firing shapes and 7 sound ones, and a valid stylesheet stayed green.`,
);
