#!/usr/bin/env node
// Compiles the schematics collection into dist/ds/schematics and registers it in
// the published package.json. Run AFTER `ng build ds` (which regenerates dist/ds).
//
//   bun run build:lib && node tools/build-schematics.mjs
//
// Kept separate from build:lib for now so the collection only ships when this is
// run deliberately (wiring it into build:lib is the step that publishes it).
import { execSync } from 'node:child_process';
import { cpSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const distPkgPath = 'dist/ds/package.json';
if (!existsSync(distPkgPath)) {
  console.error(
    'build-schematics: dist/ds missing — run `bun run build:lib` first.',
  );
  process.exit(1);
}

const distSchematics = 'dist/ds/schematics';

console.log('▶ Compiling schematics (tsc)…');
execSync('npx tsc -p schematics/tsconfig.json', { stdio: 'inherit' });

console.log('▶ Copying collection.json, schema.json, and templates…');
cpSync('schematics/collection.json', `${distSchematics}/collection.json`);
cpSync(
  'schematics/feature/schema.json',
  `${distSchematics}/feature/schema.json`,
);
cpSync('schematics/feature/files', `${distSchematics}/feature/files`, {
  recursive: true,
});

// The DS package is `"type": "module"`, but schematics are CommonJS. Scope a
// commonjs override to the schematics subtree so the compiled .js loads.
writeFileSync(
  `${distSchematics}/package.json`,
  JSON.stringify({ type: 'commonjs' }, null, 2) + '\n',
);

console.log('▶ Registering schematics in dist/ds/package.json…');
const pkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
pkg.schematics = './schematics/collection.json';
writeFileSync(distPkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(
  '✔ schematics built into dist/ds/schematics + package.json registered.',
);
