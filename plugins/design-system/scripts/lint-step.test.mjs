#!/usr/bin/env node
// Runs lint-step.mjs over lint-step.fixtures/src with this repository as the consumer (its
// node_modules) and as the plugin source (its eslint/ and stylelint/), and checks the hits a range
// keeps, the hits it drops, the skip notes without any linter installed, the `--tools` fallback, and that nothing is written.
//
//   node lint-step.test.mjs     # exit 0 = every case matches
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { lintStep } from './lint-step.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repository = join(here, '..', '..', '..');
const sourceRoot = join(here, 'lint-step.fixtures', 'src');

const snapshot = (directory) =>
  readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);

      return [path, readFileSync(path, 'utf8')];
    });

const flatten = ({ hits }) =>
  Object.entries(hits)
    .flatMap(([itemId, list]) =>
      list.map((hit) => `${itemId} ${hit.loc} ${hit.match}`),
    )
    .sort();

const before = snapshot(sourceRoot);
const failures = [];
const check = async (name, test) => {
  try {
    await test();
    console.log(`ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`FAIL ${name}\n${error.message}`);
  }
};

await check('a range keeps only its releases', async () => {
  const output = await lintStep({
    consumerRoot: repository,
    sourceRoot,
    pluginDirectory: repository,
    from: '0.6.0',
    to: '0.13.4',
  });
  assert.deepEqual(output.ran, ['eslint:ts', 'eslint:html', 'stylelint']);
  assert.deepEqual(output.skipped, []);
  assert.deepEqual(output.errors, []);
  assert.deepEqual(flatten(output), [
    '0.13.0#chart-geometry-abbreviations-spelled-out styles.scss:4 --chart-axis-fs',
    '0.13.4#accordion-multi-is-multiple app/legacy.component.ts:8 multi',
    '0.7.0#app-shell-class-to-app-layout app/legacy.component.ts:1 AppShellComponent',
    '0.7.0#app-shell-selector-to-app-layout app/legacy.component.html:1 <ds-app-shell>',
  ]);
});

await check('an open range reports the releases before it too', async () => {
  const output = await lintStep({
    consumerRoot: repository,
    sourceRoot,
    pluginDirectory: repository,
    from: '0.1.0',
  });
  const found = flatten(output);
  for (const expected of [
    '0.2.0#surface-subtle-token-rename styles.scss:3 --border-subtle',
    '0.4.0#ds-button-size-legacy-tier app/legacy.component.ts:9 size="l"',
    '0.5.1#alert-dismissed-output-rename app/legacy.component.html:2 dismissed',
  ])
    assert.ok(
      found.includes(expected),
      `missing: ${expected}\n${found.join('\n')}`,
    );
});

await check('a consumer without linters is skipped with a note', async () => {
  const empty = mkdtempSync(join(tmpdir(), 'lint-step-empty-'));
  try {
    const output = await lintStep({
      consumerRoot: empty,
      sourceRoot,
      pluginDirectory: repository,
      from: '0.1.0',
    });
    assert.deepEqual(output.ran, []);
    assert.deepEqual(output.hits, {});
    assert.equal(output.skipped.length, 2);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

await check('a consumer without linters runs on --tools', async () => {
  const empty = mkdtempSync(join(tmpdir(), 'lint-step-empty-'));
  try {
    const output = await lintStep({
      consumerRoot: empty,
      sourceRoot,
      pluginDirectory: repository,
      from: '0.6.0',
      to: '0.13.4',
      toolsDirectory: join(repository, 'node_modules'),
    });
    assert.deepEqual(output.ran, ['eslint:ts', 'eslint:html', 'stylelint']);
    assert.deepEqual(output.skipped, []);
    assert.ok(Object.keys(output.toolsSource).length > 0);
    for (const [name, source] of Object.entries(output.toolsSource))
      assert.equal(source, 'tools', name);
    assert.equal(flatten(output).length, 4);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

await check('nothing under the source root is written', async () => {
  assert.deepEqual(snapshot(sourceRoot), before);
});

process.exitCode = failures.length > 0 ? 1 : 0;
