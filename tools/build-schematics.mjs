#!/usr/bin/env node
// Compiles the schematics collection into dist/ds/schematics and registers it in
// the published package.json. Runs as the second half of `build:lib` (after
// `ng build ds` regenerates dist/ds), so the collection ships with the package.
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

console.log('▶ Copying collection.json, schemas, and templates…');
cpSync('schematics/collection.json', `${distSchematics}/collection.json`);
// Copy every generator's schema.json (tsc only emits .js, not .json).
for (const gen of ['ng-add', 'feature', 'store', 'data-access', 'page', 'ui']) {
  cpSync(`schematics/${gen}/schema.json`, `${distSchematics}/${gen}/schema.json`);
}
// Copy file-based templates (feature generator).
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
