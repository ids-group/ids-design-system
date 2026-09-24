#!/usr/bin/env node
// Exercises the check-overrides schematic end to end against a built dist/ds — run
// `npm run build:lib` first. Not part of `lint:all` for that reason.
//
//   node tools/check-overrides-selftest.mjs
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { HostTree } = require('@angular-devkit/schematics');
const { SchematicTestRunner } = require('@angular-devkit/schematics/testing');
const DIST = 'dist/ds';
const { findDeadClasses, findWriteOnlyTokens } = require(
  `../${DIST}/schematics/check-overrides/scan.cjs`,
);

{
  const hits = findWriteOnlyTokens(
    'a { --ds-button-bg: red; --ds-button-bg-color: red; }',
    new Set(['--ds-button-bg-color']),
  );
  assert.deepStrictEqual(hits, [{ token: '--ds-button-bg', line: 1 }]);
  console.log('ok     findWriteOnlyTokens: reports the unread token, not the read one');
}

{
  const secondary = findDeadClasses('ds-button .button:not(.secondary) {}', {
    'ds-button': ['button', 'color-secondary'],
  });
  assert.deepStrictEqual(
    secondary.map((hit) => hit.className),
    ['secondary'],
  );
  const clean = findDeadClasses('ds-button .button.color-error {}', {
    'ds-button': ['button', 'color-error'],
  });
  assert.deepStrictEqual(clean, []);
  console.log('ok     findDeadClasses: reports a class the component does not render, quiet otherwise');
}

{
  const surface = require(`../${DIST}/schematics/check-overrides/surface.json`);
  assert.ok(surface.tokens.includes('--ds-button-bg-color'), 'surface.json should read --ds-button-bg-color');
  assert.ok(!surface.tokens.includes('--ds-button-bg'), 'surface.json should not read --ds-button-bg');
  console.log('ok     surface.json: read tokens include the real hook, not the fictitious one');
}

const runner = () => new SchematicTestRunner('ids', `${DIST}/schematics/collection.json`);

const buildTree = () => {
  const tree = new HostTree();
  tree.create('angular.json', JSON.stringify({ version: 1, projects: {} }));
  tree.create(
    'src/a.scss',
    'ds-button { --ds-button-bg: red; } ds-button .button.secondary { color: red; }',
  );
  return tree;
};

{
  const messages = [];
  const test = runner();
  const subscription = test.logger.subscribe((entry) => messages.push(entry.message));
  await test.runSchematic('check-overrides', {}, buildTree());
  subscription.unsubscribe();
  assert.ok(
    messages.includes('check-overrides: 1 write-only token(s), 1 dead class(es)'),
    `expected the 1/1 summary, got:\n${messages.join('\n')}`,
  );
  console.log('ok     schematic run: finds the one write-only token and the one dead class');
}

{
  await assert.rejects(
    () => runner().runSchematic('check-overrides', { strict: true }, buildTree()),
    'strict mode should reject when anything is reported',
  );
  console.log('ok     schematic run: --strict rejects instead of only warning');
}

console.log('\ncheck-overrides-selftest: all assertions passed');
