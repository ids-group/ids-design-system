#!/usr/bin/env node
// Does check-target-size still FIRE on an icon-only control with no target, and stay QUIET on one
// that has the mixin, a mixin that includes it, a stated size, or text? Does it fire on two targets
// side by side whose gap they overlap, and stay quiet once the gap holds them? Each case writes one
// throwaway component into a private fixture tree, never into `src/`.
//
//   node tools/check-target-size-selftest.mjs
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREE = join(tmpdir(), `target-size-selftest.${process.pid}`);

const run = (files) => {
  rmSync(TREE, { recursive: true, force: true });
  for (const [name, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(TREE, name)), { recursive: true });
    writeFileSync(join(TREE, name), contents);
  }
  try {
    execFileSync('node', ['tools/check-target-size.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: {
        ...process.env,
        DS_TARGET_SIZE_COMPONENTS: join(TREE, 'components'),
        DS_TARGET_SIZE_STYLES: join(TREE, 'styles'),
      },
    });
    return false;
  } catch {
    return true;
  }
};

const icon =
  '<button type="button" class="close"><ds-icon name="x" [size]="14" /></button>';
const pair = `<span class="move">\n  ${icon}\n  ${icon}\n</span>`;
const tokens =
  ':root {\n  --space-1: 4px;\n  --space-2-5: 10px;\n  --hit-xs: 24px;\n}\n';
const scss = (body) =>
  `@use '../../styles/target' as target;\n@use '../../styles/kit' as kit;\n${body}\n`;

// [name, files, mustFire]
const cases = [
  [
    'an icon-only button with no target',
    {
      'components/a/a.component.html': icon,
      'components/a/a.component.scss': scss('.close { padding: 0; }'),
    },
    true,
  ],
  [
    'the mixin in its own rule',
    {
      'components/a/a.component.html': icon,
      'components/a/a.component.scss': scss(
        '.close { @include target.min-size; }',
      ),
    },
    false,
  ],
  [
    'the mixin through a styles mixin',
    {
      'components/a/a.component.html': icon,
      'components/a/a.component.scss': scss('.close { @include kit.button; }'),
      'styles/_kit.scss':
        "@use 'target' as target;\n@mixin button { @include target.min-size; }\n",
    },
    false,
  ],
  [
    'a styles mixin that does not include it',
    {
      'components/a/a.component.html': icon,
      'components/a/a.component.scss': scss('.close { @include kit.button; }'),
      'styles/_kit.scss': '@mixin button { padding: 0; }\n',
    },
    true,
  ],
  [
    'a stated size above the rule',
    {
      'components/a/a.component.html': icon,
      'components/a/a.component.scss': scss(
        '// target-size-guard: --hit-xs, 24px\n.close { width: 24px; }',
      ),
    },
    false,
  ],
  [
    'a stated size in an unrelated rule',
    {
      'components/a/a.component.html': icon,
      'components/a/a.component.scss': scss(
        '// target-size-guard: 24px\n.other { width: 24px; }\n.close { padding: 0; }',
      ),
    },
    true,
  ],
  [
    'a class-less icon-only button',
    {
      'components/a/a.component.html':
        '<button type="button"><ds-icon name="x" /></button>',
      'components/a/a.component.scss': '',
    },
    true,
  ],
  [
    'a class-less button with a stated size',
    {
      'components/a/a.component.html':
        '<!-- target-size-guard: 32px -->\n<button type="button"><ds-icon name="x" /></button>\n<p>Text</p>\n' +
        icon,
      'components/a/a.component.scss': scss(
        '.close { @include target.min-size; }',
      ),
    },
    false,
  ],
  [
    'an inline template',
    {
      'components/a/a.component.ts': `@Component({ template: \`${icon}\` }) class A {}`,
      'components/a/a.component.scss': scss('.close { padding: 0; }'),
    },
    true,
  ],
  [
    'two targets side by side, a gap narrower than they grow',
    {
      'components/a/a.component.html': pair,
      'components/a/a.component.scss': scss(
        '.move { display: inline-flex; gap: var(--space-1); }\n.close { padding: 0; @include target.min-size; }',
      ),
      'styles/_tokens.scss': tokens,
    },
    true,
  ],
  [
    'two targets side by side, a gap that holds them',
    {
      'components/a/a.component.html': pair,
      'components/a/a.component.scss': scss(
        '.move { display: inline-flex; gap: var(--space-2-5); }\n.close { padding: 0; @include target.min-size; }',
      ),
      'styles/_tokens.scss': tokens,
    },
    false,
  ],
  [
    'two targets side by side, a gap it cannot read',
    {
      'components/a/a.component.html': pair,
      'components/a/a.component.scss': scss(
        '.move { display: inline-flex; gap: var(--unknown); }\n.close { padding: 0; @include target.min-size; }',
      ),
      'styles/_tokens.scss': tokens,
    },
    true,
  ],
  [
    'a target positioned over its neighbour',
    {
      'components/a/a.component.html': pair,
      'components/a/a.component.scss': scss(
        '.move { display: inline-flex; }\n.close { position: absolute; @include target.min-size($position: null); }',
      ),
      'styles/_tokens.scss': tokens,
    },
    false,
  ],
  // Negative control: a button with a label is not icon-only. The passing `b` keeps the scan from
  // reporting that it saw no control at all.
  [
    'a button with text',
    {
      'components/a/a.component.html':
        '<button class="close"><ds-icon name="x" /> Close</button>',
      'components/a/a.component.scss': '.close { padding: 0; }',
      'components/b/b.component.html': icon,
      'components/b/b.component.scss': scss(
        '.close { @include target.min-size; }',
      ),
    },
    false,
  ],
];

let failed = 0;
for (const [name, files, mustFire] of cases) {
  const fired = run(files);
  const ok = fired === mustFire;
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${fired ? 'fired' : 'quiet'}`);
}
rmSync(TREE, { recursive: true, force: true });
if (failed > 0) {
  console.error(`check-target-size-selftest: ${failed} case(s) wrong`);
  process.exit(1);
}
console.log('check-target-size-selftest: OK');
