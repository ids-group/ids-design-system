#!/usr/bin/env node
// Does the moved-default rule still FIRE, and do its cosmetic exemptions still HOLD? A missed
// fire is the 0.13.3 meter -> bar fill shipping as "renders identically"; a missed hold is a gate
// that demands a line for every fallback rewritten through a private variable.
//
// The rules run through the exported functions against synthetic stylesheets. What depends on a
// real tree is asserted by running the check over one published boundary against a per-process
// COPY of migrations/, so no tracked manifest is written.
//
//   node tools/check-token-defaults-selftest.mjs
import { execFileSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hooksDefaultingTo, verdicts } from './check-token-defaults.mjs';
import { defaultsOf, diffDefaults } from './token-diff.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const tree = (files) =>
  defaultsOf(
    Object.entries(files).map(([path, text]) => ({
      path: `src/lib/${path}`,
      text,
    })),
  );
const ROOTS = (body) => `:root {\n${body}\n}\n`;

const cases = [
  {
    name: 'FIRES when a hook fallback moves and the manifest names nothing',
    before: {
      'components/bar/bar.component.scss':
        ':host { --_fill: var(--ds-bar-fill-color, var(--chart-1)); }',
    },
    after: {
      'components/bar/bar.component.scss':
        ':host { --_fill: var(--ds-bar-fill-color, var(--accent)); }',
    },
    manifest: '{ "items": [] }',
    expect: { '--ds-bar-fill-color': false },
  },
  {
    name: 'HOLDS when the manifest names the moved hook',
    before: {
      'components/bar/bar.component.scss':
        ':host { --_fill: var(--ds-bar-fill-color, var(--chart-1)); }',
    },
    after: {
      'components/bar/bar.component.scss':
        ':host { --_fill: var(--ds-bar-fill-color, var(--accent)); }',
    },
    manifest:
      '{ "informational": ["`--ds-bar-fill-color` now defaults to `--accent`."] }',
    expect: { '--ds-bar-fill-color': true },
  },
  {
    name: 'FIRES on a renamed component whose hook default moved (meter -> bar)',
    before: {
      'components/meter/meter.component.scss':
        '.fill { background: var(--ds-meter-fill-color, var(--ds-chart-series-1-color)); }',
    },
    after: {
      'components/bar/bar.component.scss':
        '.fill { background: var(--ds-bar-fill-color, var(--accent)); }',
    },
    manifest: '{ "items": [{ "old": "ds-meter", "new": "ds-bar" }] }',
    // The series hook read inside the old fallback is gone too, and is owed a line of its own.
    expect: {
      '--ds-bar-fill-color': false,
      '--ds-chart-series-1-color': false,
    },
  },
  {
    name: 'HOLDS: a prefix family names the old hooks of a renamed component',
    before: {
      'components/meter/meter.component.scss':
        '.fill { background: var(--ds-meter-fill-color, var(--chart-1)); }',
    },
    after: {
      'components/bar/bar.component.scss':
        '.fill { background: var(--ds-bar-fill-color, var(--accent)); }',
    },
    manifest:
      '{ "items": [{ "action": "Rename `--ds-meter-` hooks to `--ds-bar-`." }] }',
    expect: { '--ds-bar-fill-color': true },
  },
  {
    name: 'FIRES on a deleted hook that only the bare namespace `--ds-` mentions',
    before: {
      'components/meter/meter.component.scss':
        '.track { border-radius: var(--ds-meter-radius, 4px); }',
    },
    after: {
      'components/meter/meter.component.scss': '.track { border-radius: 4px; }',
    },
    manifest: '{ "note": "not a `--ds-` hook, and not `--ds-*` either" }',
    expect: { '--ds-meter-radius': false },
  },
  {
    name: 'HOLDS: a fallback rewritten through a private variable of the same value is cosmetic',
    before: {
      'components/bar/bar.component.scss':
        ':host { --_h: var(--ds-bar-height, 6px); }',
    },
    after: {
      'components/bar/bar.component.scss':
        ':host { --_base: 6px; --_h: var(--ds-bar-height, var(--_base)); }',
    },
    manifest: '{ "items": [] }',
    expect: { '--ds-bar-height': null },
  },
  {
    name: 'HOLDS: a fallback routed through a partial resolver whose hook is unset is cosmetic',
    before: {
      'components/select/select.component.scss':
        ':host { --_b: var(--ds-select-border-color, var(--border-default)); }',
    },
    after: {
      'styles/_field-box.scss':
        '@mixin box { --_field-border-color: var(--ds-field-border-color, var(--border-default)); }',
      'components/select/select.component.scss':
        ':host { --_b: var(--ds-select-border-color, var(--_field-border-color)); }',
    },
    manifest: '{ "items": [] }',
    expect: { '--ds-select-border-color': null },
  },
  {
    name: 'HOLDS: legacy colour notation rewritten as modern notation is cosmetic',
    before: {
      'styles/_tokens.scss': ROOTS(
        '  --chart-cat-1: hsla(229, 100%, 59%, .5);\n  --white-ish: #FFFFFF;',
      ),
    },
    after: {
      'styles/_tokens.scss': ROOTS(
        '  --chart-cat-1: hsl(229deg 100% 59% / 50%);\n  --white-ish: #fff;',
      ),
    },
    manifest: '{ "items": [] }',
    expect: { '--chart-cat-1': null, '--white-ish': null },
  },
  {
    name: 'FIRES at level 1 when the token a hook defaults to moves, and naming that token answers',
    before: {
      'themes/_semantic.scss':
        '@mixin roles {\n  --accent: var(--blue-600);\n}',
      'components/tabs/tabs.component.scss':
        '.ink { color: var(--ds-tab-indicator-color, var(--accent)); }',
    },
    after: {
      'themes/_semantic.scss':
        '@mixin roles {\n  --accent: var(--orange-600);\n}',
      'components/tabs/tabs.component.scss':
        '.ink { color: var(--ds-tab-indicator-color, var(--accent)); }',
    },
    manifest: '{ "informational": ["--accent now follows the orange ramp."] }',
    expect: { '--accent': true, '--ds-tab-indicator-color': true },
  },
  {
    name: 'FIRES on a dark-theme value and ignores a component rule declaring the same name',
    before: {
      'themes/dark/_theme.scss':
        '@mixin theme {\n  --surface-default: #111;\n}',
      'styles/_page-grid.scss': '.page-grid { --surface-default: red; }',
    },
    after: {
      'themes/dark/_theme.scss':
        '@mixin theme {\n  --surface-default: #222;\n}',
      'styles/_page-grid.scss': '.page-grid { --surface-default: blue; }',
    },
    manifest: '{ "items": [] }',
    expect: { '--surface-default': false },
  },
  {
    name: 'FIRES when only a context of a surviving token comes or goes',
    before: {
      'styles/_tokens.scss':
        ':root {\n  --hit-md: 32px;\n  --gap: 8px;\n}\n@media (min-width: 600px) {\n  :root { --gap: 12px; }\n}',
      'themes/dark/_theme.scss':
        '@mixin theme {\n  --surface-default: #111;\n}',
      'themes/light/_theme.scss':
        '@mixin theme {\n  --surface-default: #fff;\n}',
    },
    after: {
      'styles/_tokens.scss':
        ':root {\n  --hit-md: 32px;\n  --gap: 8px;\n}\n[data-density="compact"] {\n  --hit-md: 24px;\n}\n@media (min-width: 720px) {\n  :root { --gap: 12px; }\n}',
      'themes/light/_theme.scss':
        '@mixin theme {\n  --surface-default: #fff;\n}',
    },
    manifest: '{ "items": [] }',
    expect: {
      '--hit-md': false,
      '--gap': false,
      '--surface-default': false,
    },
  },
  {
    name: 'HOLDS when the manifest names the token whose context changed',
    before: {
      'styles/_tokens.scss': ROOTS('  --hit-md: 32px;'),
    },
    after: {
      'styles/_tokens.scss':
        ':root {\n  --hit-md: 32px;\n}\n[data-density="compact"] {\n  --hit-md: 24px;\n}',
    },
    manifest:
      '{ "informational": ["`--hit-md` is 24px under compact density."] }',
    expect: { '--hit-md': true },
  },
  {
    name: 'HOLDS: `--x-h/s/l` names each channel it spells',
    before: {
      'styles/_tokens.scss': ROOTS('  --tone-s: 100%;\n  --tone-l: 59%;'),
    },
    after: {
      'styles/_tokens.scss': ROOTS('  --tone-s: 70%;\n  --tone-l: 56%;'),
    },
    manifest:
      '{ "informational": ["`--tone-h/s/l` follow the violet ramp now."] }',
    expect: { '--tone-s': true, '--tone-l': true },
  },
  {
    name: 'FIRES: `--x-h` alone does not name `--x-s`',
    before: { 'styles/_tokens.scss': ROOTS('  --tone-s: 100%;') },
    after: { 'styles/_tokens.scss': ROOTS('  --tone-s: 70%;') },
    manifest: '{ "informational": ["`--tone-h` moved."] }',
    expect: { '--tone-s': false },
  },
  {
    name: 'HOLDS: `--x(-suffix)` names the name with the suffix',
    before: {
      'components/pick/pick.component.scss':
        ':host { --_r: var(--ds-pick-ring, none); --_e: var(--ds-pick-ring-error, none); }',
    },
    after: { 'components/pick/pick.component.scss': ':host { color: red; }' },
    manifest:
      '{ "items": [{ "action": "Rename `--ds-pick-ring(-error)` to `--ds-choose-ring(-error)`." }] }',
    expect: { '--ds-pick-ring': true, '--ds-pick-ring-error': true },
  },
  {
    name: 'FIRES: `--x` alone does not name `--x-error`',
    before: {
      'components/pick/pick.component.scss':
        ':host { --_r: var(--ds-pick-ring, none); --_e: var(--ds-pick-ring-error, none); }',
    },
    after: { 'components/pick/pick.component.scss': ':host { color: red; }' },
    manifest:
      '{ "items": [{ "action": "Rename `--ds-pick-ring` to `--ds-choose-ring`." }] }',
    expect: { '--ds-pick-ring': true, '--ds-pick-ring-error': false },
  },
  {
    name: 'HOLDS: a moved global is named through the root hook declared as exactly its var()',
    before: {
      'styles/_tokens.scss': ROOTS(
        '  --tip-text: var(--neutral-0);\n  --ds-tip-text-color: var(--tip-text);',
      ),
    },
    after: {
      'styles/_tokens.scss': ROOTS(
        '  --tip-text: var(--neutral-900);\n  --ds-tip-text-color: var(--tip-text);',
      ),
    },
    manifest:
      '{ "items": [{ "restore": ":root { --ds-tip-text-color: var(--neutral-0); }" }] }',
    expect: { '--tip-text': true, '--ds-tip-text-color': true },
  },
  {
    name: 'FIRES: a component fallback that reads the global does not name it',
    before: {
      'styles/_tokens.scss': ROOTS('  --tip-text: var(--neutral-0);'),
      'components/tip/tip.component.scss':
        '.x { color: var(--ds-tip-label-color, var(--tip-text)); }',
    },
    after: {
      'styles/_tokens.scss': ROOTS('  --tip-text: var(--neutral-900);'),
      'components/tip/tip.component.scss':
        '.x { color: var(--ds-tip-label-color, var(--tip-text)); }',
    },
    manifest:
      '{ "informational": ["`--ds-tip-label-color` follows the tooltip text."] }',
    expect: { '--tip-text': false, '--ds-tip-label-color': true },
  },
  {
    name: 'HOLDS: equal two levels of var() down is cosmetic',
    before: {
      'styles/_tokens.scss': ROOTS(
        '  --gray-0: #fff;\n  --neutral-0: var(--gray-0);\n  --static-white: #fff;\n  --on-primary: var(--neutral-0);',
      ),
    },
    after: {
      'styles/_tokens.scss': ROOTS(
        '  --gray-0: #fff;\n  --neutral-0: var(--gray-0);\n  --static-white: #fff;\n  --on-primary: var(--static-white);',
      ),
    },
    manifest: '{ "items": [] }',
    expect: { '--on-primary': null },
  },
  {
    name: 'FIRES: equal two levels down at the root, through a token another context redeclares',
    before: {
      'styles/_tokens.scss':
        ROOTS(
          '  --gray-0: #fff;\n  --neutral-0: var(--gray-0);\n  --static-white: #fff;\n  --on-primary: var(--neutral-0);',
        ) + ":root[data-neutrals='brand'] {\n  --neutral-0: #f4f4f0;\n}",
    },
    after: {
      'styles/_tokens.scss':
        ROOTS(
          '  --gray-0: #fff;\n  --neutral-0: var(--gray-0);\n  --static-white: #fff;\n  --on-primary: var(--static-white);',
        ) + ":root[data-neutrals='brand'] {\n  --neutral-0: #f4f4f0;\n}",
    },
    manifest: '{ "items": [] }',
    expect: { '--on-primary': false },
  },
];

let ran = 0;
let failed = 0;
const report = (ok, name, detail = '') => {
  ran++;
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} ${name}${ok ? '' : `\n      ${detail}`}`,
  );
};

for (const testCase of cases) {
  const before = tree(testCase.before);
  const after = tree(testCase.after);
  const results = verdicts(
    diffDefaults(before, after),
    testCase.manifest,
    hooksDefaultingTo(before, after),
  );
  const got = Object.fromEntries(
    results.map(({ change, named }) => [change.name, named]),
  );
  const wrong = Object.entries(testCase.expect).filter(
    ([name, named]) => got[name] !== named,
  );
  // Exactly the expected set: a stray change is as wrong as a missing one.
  const stray = Object.keys(got).filter((name) => !(name in testCase.expect));
  report(
    !wrong.length && !stray.length,
    testCase.name,
    `expected ${JSON.stringify(testCase.expect)}, got ${JSON.stringify(got)}`,
  );
}

// The real tree, read-only: 0.14.0 names each of its moved defaults, and a copy of it stripped of
// every item must fail on them.
{
  const migrations = join(
    tmpdir(),
    `check-token-defaults-selftest.${process.pid}`,
  );
  rmSync(migrations, { recursive: true, force: true });
  cpSync(join(ROOT, 'migrations'), migrations, { recursive: true });
  const run = () => {
    try {
      return {
        status: 0,
        out: execFileSync(
          process.execPath,
          ['tools/check-token-defaults.mjs', '0.14.0'],
          {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: 'pipe',
            env: { ...process.env, DS_MIGRATIONS_DIR: migrations },
          },
        ),
      };
    } catch (error) {
      return {
        status: error.status,
        out: `${error.stdout ?? ''}${error.stderr ?? ''}`,
      };
    }
  };
  try {
    const intact = run();
    report(
      intact.status === 0,
      'HOLDS: published 0.14.0 names every default it moved',
      intact.out,
    );
    const file = join(migrations, '0.14.0.json');
    const manifest = JSON.parse(readFileSync(file, 'utf8'));
    writeFileSync(
      file,
      JSON.stringify({
        version: manifest.version,
        items: [],
        deleteList: [],
        informational: [],
      }),
    );
    const stripped = run();
    report(
      stripped.status === 1 &&
        stripped.out.includes('NOT NAMED] --ds-tag-fw -> --ds-tag-font-weight'),
      'FIRES: the same boundary with an empty manifest names the renamed hook',
      stripped.out,
    );
  } finally {
    rmSync(migrations, { recursive: true, force: true });
  }
}

if (failed) {
  console.error(`\n${failed} of ${ran} case(s) wrong.`);
  process.exit(1);
}
console.log(`\nevery case behaved: ${ran} check(s) ran.`);
