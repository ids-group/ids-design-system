#!/usr/bin/env node
// Runs apply-mechanical.mjs over every case in apply-mechanical.fixtures/. A case holds its
// manifest(s) (`manifest*.json`, applied in name order), a `before/` tree, the `after/` tree the
// script must leave, and an optional `expected.json` naming the occurrences it must report as left
// (`<version>#<id> <loc>`) and the items it must refuse as not an exact swap; an absent list
// means none.
//
//   node apply-mechanical.test.mjs     # exit 0 = every case matches, and a dry run writes nothing
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, 'apply-mechanical.mjs');
const fixtures = join(here, 'apply-mechanical.fixtures');

const tree = (root) => {
  const files = {};
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else
        files[relative(root, path).replace(/\\/g, '/')] = readFileSync(
          path,
          'utf8',
        );
    }
  };
  walk(root);

  return files;
};

const run = (caseDirectory, root, ...flags) => {
  const manifests = readdirSync(caseDirectory)
    .filter((name) => /^manifest.*\.json$/.test(name))
    .sort()
    .map((name) => join(caseDirectory, name));

  return JSON.parse(
    execFileSync('node', [script, root, ...manifests, ...flags], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }),
  );
};

const scratch = mkdtempSync(join(tmpdir(), 'apply-mechanical-'));
const failures = [];
const cases = readdirSync(fixtures).sort();
try {
  for (const name of cases) {
    const caseDirectory = join(fixtures, name);
    const root = join(scratch, name);
    cpSync(join(caseDirectory, 'before'), root, { recursive: true });
    const expectedPath = join(caseDirectory, 'expected.json');
    const expected = existsSync(expectedPath)
      ? JSON.parse(readFileSync(expectedPath, 'utf8'))
      : {};
    try {
      const { items } = run(caseDirectory, root);
      assert.deepEqual(
        tree(root),
        tree(join(caseDirectory, 'after')),
        'tree after the run',
      );
      assert.deepEqual(
        items
          .flatMap((item) =>
            item.left.map((left) => `${item.version}#${item.id} ${left.loc}`),
          )
          .sort(),
        (expected.left ?? []).sort(),
        'occurrences left for the agent',
      );
      assert.deepEqual(
        items
          .filter((item) => item.reason)
          .map((item) => `${item.version}#${item.id}`)
          .sort(),
        (expected.refused ?? []).sort(),
        'refused items',
      );
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
    }
  }

  const dryCase = join(fixtures, 'value-remap-multiline');
  const dryRoot = join(scratch, 'dry-run');
  cpSync(join(dryCase, 'before'), dryRoot, { recursive: true });
  const dry = run(dryCase, dryRoot, '--dry-run');
  try {
    assert.deepEqual(tree(dryRoot), tree(join(dryCase, 'before')));
    assert.ok(dry.dryRun && dry.items[0].edits.length > 0);
  } catch {
    failures.push('dry run: it wrote files, or printed no edits');
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(
    `apply-mechanical: ${failures.length} case(s) failed\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(`apply-mechanical: ${cases.length} case(s) and the dry run OK`);
