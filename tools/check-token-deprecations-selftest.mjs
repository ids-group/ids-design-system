#!/usr/bin/env node
// Does the shipped stylelint rule still fire, and stay quiet where it must? Runs
// `stylelint/index.mjs` through stylelint's own API on inline fixture CSS: a rename is reported
// and autofixed, a removal is reported and left alone, a live name that merely starts with a
// listed one is not reported, and a consumer's own property is ignored. Then the generator's
// family and list pairing on synthetic trees. Nothing is written.
//
//   node tools/check-token-deprecations-selftest.mjs
import assert from 'node:assert/strict';
import stylelint from 'stylelint';
import { candidatesOf } from './generate-token-deprecations.mjs';

const config = {
  plugins: [new URL('../stylelint/index.mjs', import.meta.url).href],
  rules: { 'ids-design-system/no-removed-tokens': true },
};

const lint = async (code, fix = false, setting = true) => {
  const { results, code: fixed } = await stylelint.lint({
    code,
    config: {
      ...config,
      rules: { 'ids-design-system/no-removed-tokens': setting },
    },
    fix,
  });
  return {
    warnings: results[0].warnings.map((warning) => warning.text),
    fixed,
  };
};

const failures = [];
const test = async (name, body) => {
  try {
    await body();
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
};

await test('a renamed declaration is reported with replacement and version', async () => {
  const { warnings } = await lint('a { --ds-card-pad: 4px; }');
  assert.equal(warnings.length, 1);
  assert.match(
    warnings[0],
    /--ds-card-pad" was renamed to "--ds-card-padding" in 0\.13\.4/,
  );
});

await test('a token renamed in the version you upgrade from is left out', async () => {
  const code = 'a { --ds-card-pad: 4px; }';
  assert.deepEqual(
    (await lint(code, false, [true, { from: '0.13.4' }])).warnings,
    [],
  );
  assert.equal(
    (await lint(code, false, [true, { from: '0.13.3' }])).warnings.length,
    1,
  );
  assert.deepEqual(
    (await lint(code, false, [true, { to: '0.13.3' }])).warnings,
    [],
  );
  assert.equal(
    (await lint(code, false, [true, { from: '0.13.3', to: '0.13.4' }])).warnings
      .length,
    1,
  );
});

await test('a renamed var() use is reported and both sites are autofixed', async () => {
  const { warnings, fixed } = await lint(
    'a { --ds-card-pad: 4px; padding: var(--my-gap, var(--ds-card-pad)); }',
    true,
  );
  assert.deepEqual(warnings, []);
  assert.equal(
    fixed,
    'a { --ds-card-padding: 4px; padding: var(--my-gap, var(--ds-card-padding)); }',
  );
});

await test('a removed token is reported and not rewritten', async () => {
  const code = 'a { opacity: var(--opacity-muted); }';
  const { warnings } = await lint(code);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /--opacity-muted" was removed in 0\.10\.1/);
  assert.equal((await lint(code, true)).fixed, code);
});

await test('a live name that extends a listed one is not reported', async () => {
  const { warnings } = await lint(
    'a { --ds-card-padding: 4px; border-color: var(--ds-toast-border-color); }',
  );
  assert.deepEqual(warnings, []);
});

await test("a consumer's own property is ignored", async () => {
  const { warnings } = await lint('a { --my-x: 1px; margin: var(--my-x); }');
  assert.deepEqual(warnings, []);
});

await test('a family is expanded against the before tree and filled in', () => {
  const before = new Set(['--ds-card-bg', '--ds-tag-bg', '--ds-card-border']);
  const after = new Set(['--ds-card-bg-color']);
  assert.deepEqual(
    candidatesOf('--ds-*-bg', '--ds-*-bg-color', 'token-rename', before, after),
    [
      {
        name: '--ds-card-bg',
        replacement: '--ds-card-bg-color',
        renamed: true,
      },
      { name: '--ds-tag-bg', replacement: null, renamed: false },
    ],
  );
});

await test('a bare prefix is a family and lists pair by position', () => {
  const before = new Set(['--ds-pagehdr-title']);
  const after = new Set(['--ds-page-header-title']);
  assert.deepEqual(
    candidatesOf(
      '--ds-pagehdr-',
      '--ds-page-header-',
      'token-rename',
      before,
      after,
    ),
    [
      {
        name: '--ds-pagehdr-title',
        replacement: '--ds-page-header-title',
        renamed: true,
      },
    ],
  );
  assert.deepEqual(
    candidatesOf(
      '--a-x, --a-y',
      '--b-x, --b-y',
      'token-rename',
      before,
      after,
    ).map((candidate) => candidate.replacement),
    ['--b-x', '--b-y'],
  );
});

await test('a removed-api replacement is advice, never a rename', () => {
  assert.deepEqual(
    candidatesOf(
      '--ds-button-focus-shadow',
      '--focus-ring-color',
      'removed-api',
      new Set(),
      new Set(),
    ),
    [
      {
        name: '--ds-button-focus-shadow',
        replacement: '--focus-ring-color',
        renamed: false,
      },
    ],
  );
});

if (failures.length) {
  console.error(
    `token-deprecations:selftest: ${failures.length} failure(s)\n  ${failures.join('\n  ')}`,
  );
  process.exitCode = 1;
} else console.log('token-deprecations:selftest: OK - 8 case(s).');
