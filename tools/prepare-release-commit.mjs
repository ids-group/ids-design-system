#!/usr/bin/env node
// The `version` npm hook: everything that has to be INSIDE the commit `npm version` is about to
// tag. It runs after `preversion` (preflight) and before the commit, which is the only window
// where a dirty tree is expected — preflight refuses to bump one.
//
// Four things belong in that window:
//
//   1. stamp the CHANGELOG and promote the migration manifest  (tools/changelog-release.mjs)
//   2. copy the bumped version into the library manifest       (tools/sync-lib-package.mjs)
//   3. regenerate the stylelint token list and the ESLint API list from the promoted manifest
//                          (tools/generate-token-deprecations.mjs, tools/generate-api-deprecations.mjs)
//   4. stage them, so the release commit carries them
//
// Step 2 exists because ng-packagr reads the published manifest from src/lib, not the workspace
// root: `npm version` bumps the root alone, so without this the committed library manifest keeps
// the outgoing version and the `lib-package` check fails on the first PR after every release.
//
// The Claude Design upload tree is NOT rebuilt here. Only the after-release step has a browser,
// so a build in this window leaves the cards live rather than frozen and their heights
// unmeasured, and build-design-sync.sh rebuilds and commits the corrected tree straight after the
// tag regardless. Keeping it here also put a build failure inside `npm version`, which
// cut-release.sh runs a few lines before it pushes main — the same reason the bundle build lives
// after the release rather than in it. The tree is not in the npm tarball, so the tag needs none.
import { execFileSync } from 'node:child_process';

const run = (command, args) =>
  execFileSync(command, args, { stdio: 'inherit' });

run(process.execPath, ['tools/changelog-release.mjs']);
run(process.execPath, ['tools/sync-lib-package.mjs']);
run(process.execPath, ['tools/generate-token-deprecations.mjs']);
run(process.execPath, ['tools/generate-api-deprecations.mjs']);
run('git', [
  'add',
  'src/lib/package.json',
  'stylelint/deprecated-tokens.json',
  'eslint/deprecated-api.json',
]);
