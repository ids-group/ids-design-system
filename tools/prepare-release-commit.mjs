#!/usr/bin/env node
// The `version` npm hook: everything that has to be INSIDE the commit `npm version` is about to
// tag. It runs after `preversion` (preflight) and before the commit, which is the only window
// where a dirty tree is expected — preflight refuses to bump one.
//
// Four things belong in that window, and they were a shell chain in package.json until the name
// `changelog-release` stopped describing what the hook did:
//
//   1. stamp the CHANGELOG and promote the migration manifest  (tools/changelog-release.mjs)
//   2. copy the bumped version into the library manifest       (tools/sync-lib-package.mjs)
//   3. rebuild the committed Claude Design upload tree          (npm run build:upload)
//   4. stage both, so the release commit carries them
//
// Step 2 exists because ng-packagr reads the published manifest from src/lib, not the workspace
// root: `npm version` bumps the root alone, so without this the committed library manifest keeps
// the outgoing version and `check:lib-package` fails on the first PR after every release.
//
// Step 2 is the cheap half. The slow half — gen + ng build + build-bundle — runs in
// cut-release.sh BEFORE the bump, because everything it writes is gitignored and the tree has to
// stay clean for preflight.
import { execFileSync } from 'node:child_process';

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

run(process.execPath, ['tools/changelog-release.mjs']);
run(process.execPath, ['tools/sync-lib-package.mjs']);
run('git', ['add', 'src/lib/package.json']);
// The script, not `npm run build:upload`: npm on Windows is a batch shim, and neither a shell nor
// a direct spawn reaches it from every environment this has to run in.
run(process.execPath, ['.design-sync/tools/build-upload.mjs']);
run('git', ['add', '.design-sync/upload']);
