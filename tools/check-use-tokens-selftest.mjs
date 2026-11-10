#!/usr/bin/env node
// Do the shipped `use-tokens` and `known-tokens` rules fire where a token exists, stay quiet on
// every allowed form, and name the right token? Runs `stylelint/index.mjs` through stylelint's own
// API on inline fixture CSS. Nothing is written.
//
//   node tools/check-use-tokens-selftest.mjs
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import stylelint from 'stylelint';

const plugin = new URL('../stylelint/index.mjs', import.meta.url).href;

const lint = async (code, rules, codeFilename) => {
  const { results } = await stylelint.lint({
    code,
    codeFilename,
    config: { plugins: [plugin], rules },
  });
  return results[0].warnings.map((warning) => ({
    text: warning.text.replace(/ \(ids-design-system\/[\w-]+\)$/, ''),
    severity: warning.severity,
  }));
};
const useTokens = async (code, options = true, codeFilename) =>
  (
    await lint(code, { 'ids-design-system/use-tokens': options }, codeFilename)
  ).map(({ text }) => text);
const knownTokens = async (code, options = true) =>
  (await lint(code, { 'ids-design-system/known-tokens': options })).map(
    ({ text }) => text,
  );

const failures = [];
const test = async (name, body) => {
  try {
    await body();
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
};

await test('a raw value on the scale names the exact token', async () => {
  assert.deepEqual(
    await useTokens(
      'a { padding: 8px; border-radius: 12px; font-size: 14px; line-height: 1.4; font-weight: 600; z-index: 1000; transition: opacity 120ms cubic-bezier(.2, 0, 0, 1); box-shadow: 0 4px 8px rgba(0, 0, 0, .1); }',
    ),
    [
      'space: raw "8px" in padding, use var(--space-2)',
      'radius: raw "12px" in border-radius, use var(--radius-lg)',
      'font-size: raw "14px" in font-size, use var(--font-size-s)',
      'line-height: raw "1.4" in line-height, use var(--line-height-base)',
      'font-weight: raw "600" in font-weight, use var(--font-weight-semibold)',
      'z-index: raw "1000" in z-index, use var(--layer-dropdown)',
      'motion: raw "120ms" in transition, use var(--duration-fast)',
      'motion: raw "cubic-bezier(.2, 0, 0, 1)" in transition, use var(--ease-standard)',
      'shadow: raw "0 4px 8px rgba(0, 0, 0, .1)" in box-shadow, use var(--shadow-2)',
    ],
  );
});

await test('a value off the scale names the nearest step, said as nearest', async () => {
  assert.deepEqual(await useTokens('a { gap: 15px; z-index: 1050; }'), [
    'space: raw "15px" in gap has no exact token, nearest var(--space-4) (16px)',
    'z-index: raw "1050" in z-index has no exact token, nearest var(--layer-dropdown) (1000)',
  ]);
});

await test('a colour names the token of the role its property paints', async () => {
  assert.deepEqual(
    await useTokens(
      'a { color: #6B7388; background: #F8FAFC; border: 1px solid #DCE1EA; }',
    ),
    [
      'color: raw "#6B7388" in color, use var(--text-tertiary)',
      'color: raw "#F8FAFC" in background, use var(--surface-canvas)',
      'color: raw "#DCE1EA" in border, use var(--border-default)',
    ],
  );
});

await test('every allowed form is quiet', async () => {
  assert.deepEqual(
    await useTokens(
      `a {
        margin: 0 auto; padding: inherit; gap: initial; inset: unset;
        color: currentColor; background: transparent; width: 100%; border-radius: 100%;
        padding: var(--space-2) var(--space-4); margin: calc(var(--space-2) * 2);
        gap: max(var(--space-1), var(--space-2)); padding: clamp(var(--space-2), 2vw, var(--space-4));
        border-radius: min(var(--radius-pill), 50%); box-shadow: var(--shadow-2); z-index: var(--layer-modal);
        $local: 4px; --own: 3px; padding: $local;
      }`,
    ),
    [],
  );
});

await test('an inset or blurless box-shadow is a ring, not elevation', async () => {
  assert.deepEqual(
    await useTokens(
      'a { box-shadow: 0 0 0 2px #2563EB; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .1); box-shadow: inset 0 2px 4px #000, 0 0 0 1px #000; }',
    ),
    [],
  );
});

await test('a local z-index under 100 is allowed, an exact layer is not', async () => {
  assert.deepEqual(
    await useTokens('a { z-index: 2; z-index: 50; z-index: 99; z-index: -1; }'),
    [],
  );
  assert.deepEqual(await useTokens('a { z-index: 1; }'), [
    'z-index: raw "1" in z-index, use var(--layer-raised)',
  ]);
});

await test('a negative margin is suggested as a negated token', async () => {
  assert.deepEqual(await useTokens('a { margin: -16px 0 -15px; }'), [
    'space: raw "-16px" in margin, use calc(-1 * var(--space-4))',
    'space: raw "-15px" in margin has no exact token, nearest calc(-1 * var(--space-4)) (16px)',
  ]);
});

await test('a 1px radius is never pointed at --radius-0', async () => {
  assert.deepEqual(await useTokens('a { border-radius: 1px; }'), [
    'radius: raw "1px" in border-radius has no exact token, nearest var(--radius-sm) (4px)',
  ]);
});

await test('allow, categories and ignore', async () => {
  assert.deepEqual(
    await useTokens('a { padding: 8px; }', [true, { allow: ['8px'] }]),
    [],
  );
  assert.deepEqual(
    await useTokens('a { padding: 8px; gap: 8px; }', [
      true,
      { allow: { padding: ['8px'] } },
    ]),
    ['space: raw "8px" in gap, use var(--space-2)'],
  );
  assert.deepEqual(
    await useTokens('a { padding: 8px; color: #6B7388; }', [
      true,
      { categories: { space: false } },
    ]),
    ['color: raw "#6B7388" in color, use var(--text-tertiary)'],
  );
  const severities = await lint('a { padding: 8px; color: #6B7388; }', {
    'ids-design-system/use-tokens': [
      true,
      { categories: { color: 'warning' } },
    ],
  });
  assert.deepEqual(
    severities.map(({ severity }) => severity),
    ['error', 'warning'],
  );
  assert.deepEqual(
    await useTokens(
      'a { padding: 8px; }',
      [true, { ignore: ['src/brand/**'] }],
      join(process.cwd(), 'src/brand/x.scss'),
    ),
    [],
  );
  assert.equal(
    (
      await useTokens(
        'a { padding: 8px; }',
        [true, { ignore: ['src/brand/**'] }],
        join(process.cwd(), 'src/app/x.scss'),
      )
    ).length,
    1,
  );
});

await test('an undeclared var() is reported, with the size name it misspells', async () => {
  assert.deepEqual(
    await knownTokens(
      'a { border-radius: var(--radius-s, 6px); font-size: var(--font-size-xl); }',
    ),
    [
      '"--radius-s" is declared neither by the design system nor in this project, did you mean "--radius-sm"?',
      '"--font-size-xl" is declared neither by the design system nor in this project',
    ],
  );
});

await test('a DS token, a component hook and a local or scanned declaration are known', async () => {
  assert.deepEqual(
    await knownTokens(
      'a { --own: 1px; padding: var(--space-2) var(--ds-card-padding) var(--own); color: var(--text-primary); }',
    ),
    [],
  );
  const directory = mkdtempSync(join(tmpdir(), 'use-tokens-selftest-'));
  try {
    const declared = join(directory, 'theme.scss');
    writeFileSync(declared, ':root { --app-gutter: 12px; }');
    const code = 'a { padding: var(--app-gutter); }';
    assert.equal((await knownTokens(code)).length, 1);
    assert.deepEqual(
      await knownTokens(code, [true, { declarationsFrom: [declared] }]),
      [],
    );
    assert.deepEqual(
      await knownTokens(code, [true, { ignore: ['--app-*'] }]),
      [],
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

await test('a removed token is left to no-removed-tokens', async () => {
  assert.deepEqual(
    await knownTokens('a { opacity: var(--opacity-muted); }'),
    [],
  );
});

if (failures.length) {
  console.error(
    `use-tokens selftest: ${failures.length} failure(s)\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log('use-tokens selftest: OK');
