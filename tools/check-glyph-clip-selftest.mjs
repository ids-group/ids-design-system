#!/usr/bin/env node
// Does check-glyph-clip still FIRE on every way a stylesheet can clip the block axis, and stay
// QUIET on an inline-only clip, a mixin call and a waived clip? A gate that flagged every
// `overflow` would be waived into silence; one that flagged none is what let the descenders go.
//
// Each case writes throwaway files into a private fixture tree and asserts what the gate says.
// Never into `src/`: this checkout is shared, so a crash here must not turn the real gate red.
//
//   node tools/check-glyph-clip-selftest.mjs
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREE = join(tmpdir(), `glyph-clip-selftest.${process.pid}`);

const run = () => {
  try {
    const output = execFileSync('node', ['tools/check-glyph-clip.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, DS_GLYPH_CLIP_DIR: relative(ROOT, TREE) },
    });
    return { failed: false, output };
  } catch (error) {
    return {
      failed: true,
      output: (error.stdout ?? '') + (error.stderr ?? ''),
    };
  }
};

// [name, files, mustFire, expectedInOutput]
const cases = [
  [
    'overflow: hidden on a label',
    { 'a.scss': '.label { overflow: hidden; }' },
    true,
    'a.scss:1',
  ],
  [
    'overflow: clip on a label',
    { 'b.scss': '.label {\n  overflow: clip;\n}' },
    true,
    'b.scss:2',
  ],
  [
    'a shorthand whose block value clips',
    { 'c.scss': '.row { overflow: auto hidden; }' },
    true,
    'c.scss:1',
  ],
  [
    'overflow-y alone',
    { 'd.scss': '.row { overflow-y: clip; }' },
    true,
    'd.scss:1',
  ],
  [
    'a hand-written clamp',
    { 'e.scss': '.v { -webkit-line-clamp: 2; }' },
    true,
    'e.scss:1',
  ],
  [
    'inline styles in a component',
    {
      'f.component.ts':
        '@Component({ styles: [`:host { overflow: hidden; }`] })\nexport class F {}',
    },
    true,
    'f.component.ts:1',
  ],
  [
    'a style assignment in code',
    {
      'g.ts':
        "export function g(el: HTMLElement) {\n  el.style.overflowY = 'hidden';\n}",
    },
    true,
    'g.ts:2',
  ],
  [
    'a waiver with no reason',
    { 'h.scss': '// glyph-clip-guard:\n.x { overflow: hidden; }' },
    true,
    'h.scss:2',
  ],
  [
    'the inline axis only',
    { 'i.scss': '.label { overflow: clip visible; overflow-x: hidden; }' },
    false,
  ],
  [
    'through the mixin',
    { 'j.scss': '.label { @include text-clip.single-line-ellipsis; }' },
    false,
  ],
  [
    'a waived clip, comment on the line above',
    {
      'k.scss':
        '.menu {\n  // glyph-clip-guard: rounds the corners; rows pad their text\n  overflow: hidden;\n}',
    },
    false,
  ],
  [
    'a clip inside a comment',
    {
      'l.scss': '/* overflow: hidden cut the descenders */\n.x { color: red; }',
    },
    false,
  ],
  ['a spec file', { 'm.spec.ts': "el.style.overflow = 'hidden';" }, false],
  [
    'NEGATIVE CONTROL - only sound shapes, must stay green',
    {
      'z.scss':
        '.a { overflow: visible; }\n.b { overflow: auto; }\n.c { overflow: clip visible; }',
    },
    false,
  ],
];

let failures = 0;
for (const [name, files, mustFire, expected] of cases) {
  rmSync(TREE, { recursive: true, force: true });
  mkdirSync(TREE, { recursive: true });
  for (const [file, contents] of Object.entries(files))
    writeFileSync(join(TREE, file), contents);
  const { failed, output } = run();
  if (mustFire && !failed) {
    console.error(`FAIL  ${name}: the gate stayed green.`);
    failures += 1;
  } else if (!mustFire && failed) {
    console.error(`FAIL  ${name}: the gate went red.\n${output}`);
    failures += 1;
  } else if (mustFire && !output.includes(expected)) {
    console.error(
      `FAIL  ${name}: fired, but did not name ${expected}.\n${output}`,
    );
    failures += 1;
  } else {
    console.log(`ok    ${name}`);
  }
}
rmSync(TREE, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\ncheck-glyph-clip-selftest: ${failures} case(s) failed.`);
  process.exit(1);
}
const firing = cases.filter(([, , mustFire]) => mustFire).length;
console.log(
  `\ncheck-glyph-clip-selftest: OK - ${cases.length} cases, ${firing} firing shapes and ${cases.length - firing} sound ones.`,
);
