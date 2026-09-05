#!/usr/bin/env node
// Entry points are named after their source directory, so a component reachable at
// `@ids-group-ltd/ids-design-system/components/button` would force consumers to spell a
// path that only means something inside this repo. This adds a second name for every
// nested entry point - `.../button` - resolving to the identical files, so the folder
// layout stays free to change without breaking an import.
//
// Both names are needed by both resolution styles: `exports` covers bundler/node16, and
// the directory stub covers node10, which ignores `exports` entirely.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(repo, 'dist', 'ds');
const manifestPath = join(dist, 'package.json');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const exportsMap = manifest.exports;
if (!exportsMap) {
  console.error(
    'add-entry-aliases: dist/ds/package.json has no exports map — run the library build first.',
  );
  process.exit(1);
}

const taken = new Set(Object.keys(exportsMap));
const collisions = [];
const added = [];

for (const [key, value] of Object.entries({ ...exportsMap })) {
  const segments = key.split('/').slice(1);
  if (segments.length < 2 || segments.some((s) => s === '*')) continue;
  const alias = './' + segments[segments.length - 1];
  if (taken.has(alias)) {
    collisions.push(`${alias} (wanted by ${key})`);
    continue;
  }
  exportsMap[alias] = value;
  taken.add(alias);
  added.push([alias, key, segments.length]);
}

if (collisions.length) {
  console.error(
    'add-entry-aliases: two entry points want the same short name:\n  ' +
      collisions.join('\n  '),
  );
  process.exit(1);
}

// node10 looks for a real folder with a package.json; `exports` means nothing to it
const oneLevelUp = (path) => path.replace(/^(?:\.\.\/)+/, '../');
for (const [alias, key] of added) {
  const aliasDir = join(dist, alias.slice(2));
  const stub = JSON.parse(
    readFileSync(join(dist, key.slice(2), 'package.json'), 'utf8'),
  );
  if (!existsSync(aliasDir)) mkdirSync(aliasDir, { recursive: true });
  writeFileSync(
    join(aliasDir, 'package.json'),
    JSON.stringify(
      { module: oneLevelUp(stub.module), typings: oneLevelUp(stub.typings) },
      null,
      2,
    ) + '\n',
  );
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `add-entry-aliases: ${added.length} short names added (e.g. ${added[0]?.[0]} -> ${added[0]?.[1]}).`,
);
