// Stage 2 of the elements build: wrap the Angular output + generated React
// wrappers into the design-sync bundle shape, and a self-contained copy for the
// local demo page.
//
//   node .design-sync/elements/tools/build-bundle.mjs
//
// Stage 1 is `ng build ds-elements` — the Angular CLI is what runs AOT template
// compilation and the partial-Ivy linker, which plain esbuild cannot do.
import { createRequire } from 'node:module';
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const elements = resolve(here, '..');
const repo = resolve(elements, '..', '..');
const esbuild = createRequire(join(repo, '.ds-sync', 'package.json'))('esbuild');

const ngOutput = join(elements, 'dist/browser/main.js');
if (!existsSync(ngOutput)) {
  console.error(`✗ ${ngOutput} missing — run \`ng build ds-elements\` first`);
  process.exit(1);
}

const kb = (path) => `${(statSync(path).size / 1024).toFixed(0)} KB`;

// The host loads `_vendor/react.js` as a classic script, so React is a GLOBAL there —
// there is no module loader and no `require`. Marking react `external` in an IIFE makes
// esbuild emit its dynamic-require shim instead, which throws "Dynamic require of
// "react" is not supported" before `window.IdsDs` is ever assigned. Measured against a
// local copy of the host's four-script chain on 2026-09-01: the bundle did not load at
// all. So resolve the react specifiers to the globals the host actually provides.
const reactGlobals = {
  name: 'react-globals',
  setup(build) {
    build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => ({
      path: args.path,
      namespace: 'react-global',
    }));
    build.onLoad({ filter: /.*/, namespace: 'react-global' }, (args) => ({
      contents: `module.exports = window.${args.path.startsWith('react-dom') ? 'ReactDOM' : 'React'};`,
      loader: 'js',
    }));
  },
};

// ── the bundle the design app would consume ───────────────────────────────
const bundlePath = join(elements, 'dist/ds-bundle.js');
await esbuild.build({
  entryPoints: [join(elements, 'bundle-entry.tsx')],
  bundle: true,
  format: 'iife',
  globalName: 'IdsDs',
  platform: 'browser',
  jsx: 'automatic',
  plugins: [reactGlobals],
  minify: true,
  outfile: bundlePath,
  logLevel: 'warning',
});

// ── the same thing with React inlined, for the demo page ──────────────────
mkdirSync(join(elements, 'demo/dist'), { recursive: true });
const demoPath = join(elements, 'demo/dist/demo.js');
await esbuild.build({
  entryPoints: [join(elements, 'demo/demo.tsx')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  minify: true,
  outfile: demoPath,
  nodePaths: [join(repo, '.ds-sync/node_modules')],
  logLevel: 'warning',
});

// Declarations are the contract the design agent reads — the live project carries a
// .d.ts per component and the port emitted them via tsc. This route emitted none until
// 2026-09-01, so every prop reached the agent untyped. Resolved from the lockfile, not
// via npx, for the reason recorded in tools/build-schematics.mjs.
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tsc, '-p', join(elements, 'tsconfig.types.json')], {
  cwd: repo,
  stdio: 'inherit',
});

const styles = join(elements, 'dist/browser/styles.css');
copyFileSync(styles, join(elements, 'demo/dist/styles.css'));

console.error(
  `✓ ds-bundle.js ${kb(bundlePath)} (react from window) · angular main.js ${kb(ngOutput)}`
  + ` · styles.css ${kb(styles)} · demo ${kb(demoPath)} · d.ts emitted`,
);
