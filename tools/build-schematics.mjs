#!/usr/bin/env node
// Compiles the schematics collection into dist/ds/schematics and registers it in
// the published package.json. Runs as the second half of `build:lib` (after
// `ng build ds` regenerates dist/ds), so the collection ships with the package.
import { execSync } from 'node:child_process';
import {
  cpSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync,
} from 'node:fs';

const distPkgPath = 'dist/ds/package.json';
if (!existsSync(distPkgPath)) {
  console.error(
    'build-schematics: dist/ds missing — run `bun run build:lib` first.',
  );
  process.exit(1);
}

const distSchematics = 'dist/ds/schematics';

// Wipe first: the previous build emitted index.js from an index.ts, and tsc
// does not remove what it no longer produces.
rmSync(distSchematics, { recursive: true, force: true });

console.log('▶ Compiling schematics (tsc)…');
execSync('npx tsc -p schematics/tsconfig.json', { stdio: 'inherit' });

console.log('▶ Copying collection.json and schemas…');
cpSync('schematics/collection.json', `${distSchematics}/collection.json`);
// Copy every generator's schema.json (tsc only emits .js, not .json).
// Architecture generators (feature/store/data-access/page/ui) now live in the
// app starter repo; the DS package ships only `ng-add` (DS style wiring).
for (const gen of ['ng-add']) {
  cpSync(
    `schematics/${gen}/schema.json`,
    `${distSchematics}/${gen}/schema.json`,
  );
}

// The DS package is `"type": "module"` and schematics are CommonJS, so the
// compiled file must declare that itself: the source is `.cts`, tsc emits
// `.cjs`, and collection.json names `./ng-add/index.cjs`.
//
// A nested `schematics/package.json` with {"type":"commonjs"} looks like the
// tidier fix and SILENTLY does not ship: `npm pack` treats a directory holding
// a package.json as a separate package root and drops it, so the marker exists
// in dist/ and is absent from the tarball — ng add then dies with "exports is
// not defined in ES module scope". Still written for anyone consuming dist/
// directly (npm link, a file: dependency); the `.cjs` extension is what makes
// an installed consumer work.
writeFileSync(
  `${distSchematics}/package.json`,
  JSON.stringify({ type: 'commonjs' }, null, 2) + '\n',
);

if (!existsSync(`${distSchematics}/ng-add/index.cjs`)) {
  console.error(
    'build-schematics: index.cts did not emit index.cjs — ng add would fail to load for every consumer.',
  );
  process.exit(1);
}

console.log('▶ Registering schematics in dist/ds/package.json…');
const pkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
pkg.schematics = './schematics/collection.json';
writeFileSync(distPkgPath, JSON.stringify(pkg, null, 2) + '\n');

// Ship the changelog so consumers (and the auto-update tooling) can read it
// straight from node_modules — ng-packagr copies README/LICENSE but not this.
if (!existsSync('CHANGELOG.md')) {
  console.error(
    'build-schematics: CHANGELOG.md not found at repo root — cannot ship it in the package.',
  );
  process.exit(1);
}
console.log('▶ Copying CHANGELOG.md into dist/ds…');
cpSync('CHANGELOG.md', 'dist/ds/CHANGELOG.md');

// Ship the machine-readable migration manifests (migrations/<version>.json — structured
// mirrors of the changelog, consumed by the auto-update plugin) alongside the changelog.
if (existsSync('migrations')) {
  console.log('▶ Copying migrations/ into dist/ds/migrations…');
  cpSync('migrations', 'dist/ds/migrations', { recursive: true });
}

console.log(
  '✔ schematics built into dist/ds/schematics + package.json registered.',
);
