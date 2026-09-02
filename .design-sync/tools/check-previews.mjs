// Type-checks every preview against the generated wrappers.
//
// This is the gate the regex one could not be. `check-doc-api.mjs` compares prop NAMES and cannot
// see a wrong TYPE or a boolean shorthand; esbuild compiles a preview without checking anything, so
// a stale prop reaches the card and renders nothing, in silence. Run against the real wrappers it
// found 45 errors in 19 of 74 previews — a whole generation of props written for the React port
// that was deleted, plus one that crashed Angular outright by handing a React function to an input
// typed `TemplateRef`.
//
//   node .design-sync/tools/check-previews.mjs      # after gen.mjs
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const repo = resolve(syncDir, '..');

if (!existsSync(join(syncDir, 'elements/gen/index.ts'))) {
  console.error('check-previews: .design-sync/elements/gen is missing — run gen.mjs first.');
  process.exit(1);
}

// The repo's tsc, not .ds-sync's: bootstrap.mjs installs esbuild and sass there, never typescript.
const tsc = createRequire(join(repo, 'package.json')).resolve('typescript/bin/tsc');

try {
  execFileSync(process.execPath, [tsc, '-p', join(syncDir, 'tsconfig.previews.json')], {
    cwd: syncDir,
    stdio: 'inherit',
  });
} catch {
  console.error('');
  console.error('check-previews: a preview uses a prop the component does not have, or the wrong');
  console.error('  type for one. A preview is COMPILED into its card and esbuild checks nothing, so');
  console.error('  the card would render blank rather than fail. Fix the preview, or the generated');
  console.error('  surface if the prop is one the wrappers should be exposing.');
  process.exit(1);
}

console.log('check-previews: every preview type-checks against the generated wrappers.');
