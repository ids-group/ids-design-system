#!/usr/bin/env node
// Compiles the schematics collection into a temp dir and runs every `schematics/**/*.spec.mjs`
// against it with SchematicTestRunner. Fails on a failing test, and on a schematic named in
// collection.json that no passing test ran.
//
// A spec exports `tests`: `[{ name, run(context) }]`, where `context.runSchematic(name, options,
// tree)` runs one of this collection's schematics and records that it was exercised.
//
//   node tools/run-schematic-tests.mjs
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { HostTree } = require('@angular-devkit/schematics');
const { SchematicTestRunner } = require('@angular-devkit/schematics/testing');

// Inside node_modules, not the OS temp dir: the compiled schematics `require('@angular-devkit/...')`,
// which resolves only from a directory under the repo's node_modules.
const cacheDir = join(ROOT, 'node_modules/.cache');
mkdirSync(cacheDir, { recursive: true });
const buildDir = mkdtempSync(join(cacheDir, 'schematic-tests-'));

const specFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.spec.mjs')) specFiles.push(path);
  }
};

let failures = 0;
try {
  execFileSync(
    process.execPath,
    ['tools/build-schematics.mjs', '--compile-only', buildDir],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
  );
  const collectionPath = join(buildDir, 'collection.json');
  const schematicNames = Object.keys(
    JSON.parse(readFileSync(collectionPath, 'utf8')).schematics,
  );

  walk(join(ROOT, 'schematics'));
  const exercised = new Set();
  for (const specFile of specFiles.sort()) {
    const { tests } = await import(pathToFileURL(specFile).href);
    for (const test of tests) {
      const ranHere = new Set();
      const runner = new SchematicTestRunner('ids', collectionPath);
      const context = {
        runner,
        HostTree,
        collectionDir: buildDir,
        runSchematic: (name, options, tree) => {
          ranHere.add(name);
          return runner.runSchematic(name, options, tree);
        },
      };
      const label = `${relative(ROOT, specFile).replaceAll('\\', '/')}: ${test.name}`;
      try {
        await test.run(context);
        ranHere.forEach((name) => exercised.add(name));
        console.log(`ok     ${label}`);
      } catch (error) {
        failures++;
        console.error(`FAIL   ${label}\n${error.stack ?? error}`);
      }
    }
  }

  for (const name of schematicNames.filter((name) => !exercised.has(name))) {
    failures++;
    console.error(
      `FAIL   collection.json names "${name}", which no passing test runs`,
    );
  }
} finally {
  rmSync(buildDir, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`\nrun-schematic-tests: ${failures} failure(s)`);
  process.exit(1);
}
console.log('\nrun-schematic-tests: all passed');
