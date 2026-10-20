#!/usr/bin/env node
// Runs as the second half of `build:lib` (after `ng build ds` regenerates
// dist/ds), so the schematics collection ships with the package.
import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';

// `--compile-only <dir>` stops after the compiled collection and its schemas, which need no built
// library: tools/run-schematic-tests.mjs builds into a temp dir that way.
const compileOnlyIndex = process.argv.indexOf('--compile-only');
const compileOnlyDir =
  compileOnlyIndex === -1 ? null : process.argv[compileOnlyIndex + 1];

const distPkgPath = 'dist/ds/package.json';
if (!compileOnlyDir && !existsSync(distPkgPath)) {
  console.error(
    'build-schematics: dist/ds missing — run `bun run build:lib` first.',
  );
  process.exit(1);
}

const distSchematics = compileOnlyDir ?? 'dist/ds/schematics';

// Wipe first: the previous build emitted index.js from an index.ts, and tsc
// does not remove what it no longer produces.
rmSync(distSchematics, { recursive: true, force: true });

console.log('▶ Compiling schematics (tsc)…');
// Resolved, not `npx tsc`: bun writes only `tsc.exe`/`tsc.bunx` into
// node_modules/.bin on Windows, so npx finds no local shim and falls through to
// a globally installed TypeScript — 7.0.2 here, which rejects this tsconfig's
// `moduleResolution: "node"`. The lockfile pins the package; only resolving the
// binary from it pins what actually runs.
const tscBin = createRequire(import.meta.url).resolve('typescript/bin/tsc');
execSync(
  `node "${tscBin}" -p schematics/tsconfig.json --outDir "${distSchematics}"`,
  { stdio: 'inherit' },
);

console.log('▶ Copying collection.json and schemas…');
cpSync('schematics/collection.json', `${distSchematics}/collection.json`);
// tsc only emits .js, so every schema collection.json names is copied.
// Architecture generators (feature/store/data-access/page/ui) live in the app
// starter repo.
const { schematics } = JSON.parse(
  readFileSync('schematics/collection.json', 'utf8'),
);
for (const { schema } of Object.values(schematics)) {
  cpSync(`schematics/${schema}`, `${distSchematics}/${schema}`);
}
if (compileOnlyDir) process.exit(0);

console.log('▶ Building the override surface…');
execSync('node tools/build-override-surface.mjs', { stdio: 'inherit' });

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
if (!existsSync(`${distSchematics}/check-overrides/index.cjs`)) {
  console.error(
    'build-schematics: check-overrides/index.cts did not emit index.cjs — the schematic would fail to load.',
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

// Ship the rules and the catalogue so a consumer's agents can read them straight from
// node_modules.
for (const doc of ['design-system.md', 'components.md']) {
  if (!existsSync(doc)) {
    console.error(
      `build-schematics: ${doc} not found at repo root — cannot ship it in the package.`,
    );
    process.exit(1);
  }
  console.log(`▶ Copying ${doc} into dist/ds…`);
  cpSync(doc, `dist/ds/${doc}`);
}

// The agent-facing catalogue: an index plus one leaf per component, generated from
// components.md. A consumer's agent reads the index and one leaf instead of the whole
// 58 KB catalogue, which is the entire point of the split.
if (existsSync('agent')) {
  console.log('▶ Copying agent/ into dist/ds/agent…');
  mkdirSync('dist/ds/docs', { recursive: true });
  cpSync('agent', 'dist/ds/agent', { recursive: true });
} else {
  console.error(
    'build-schematics: agent/ missing — run `npm run agent-catalogue` first.',
  );
  process.exit(1);
}

// Ship the machine-readable migration manifests (migrations/<version>.json — structured
// mirrors of the changelog, consumed by the auto-update plugin) alongside the changelog.
if (existsSync('migrations')) {
  console.log('▶ Copying migrations/ into dist/ds/migrations…');
  // Published manifests and the format note only. `unreleased.json` describes changes that are
  // NOT in this tarball, and an upgrade tool reading it would apply a version the consumer does
  // not have; AUTHORING.md is written for whoever edits these files, not for whoever runs them,
  // and `fixtures/` is the evidence tools/check-manifest-compile.mjs compiles, read by nobody else.
  mkdirSync('dist/ds/migrations', { recursive: true });
  for (const entry of readdirSync('migrations')) {
    if (
      entry === 'unreleased.json' ||
      entry === 'AUTHORING.md' ||
      entry === 'fixtures'
    )
      continue;
    cpSync(`migrations/${entry}`, `dist/ds/migrations/${entry}`, {
      recursive: true,
    });
  }
}

// The consumer stylelint plugin and the token list it reads, exported as
// `@ids-group-ltd/ids-design-system/stylelint`.
console.log('▶ Copying stylelint/ into dist/ds/stylelint…');
cpSync('stylelint', 'dist/ds/stylelint', { recursive: true });

// The consumer ESLint plugin and the API list it reads, exported as
// `@ids-group-ltd/ids-design-system/eslint`. It reads the token list from `../stylelint/`.
console.log('▶ Copying eslint/ into dist/ds/eslint…');
cpSync('eslint', 'dist/ds/eslint', { recursive: true });

console.log(
  '✔ schematics built into dist/ds/schematics + package.json registered.',
);
