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

// ── the bundle the design app would consume ───────────────────────────────
const bundlePath = join(elements, 'dist/ds-bundle.js');
await esbuild.build({
  entryPoints: [join(elements, 'bundle-entry.tsx')],
  bundle: true,
  format: 'iife',
  globalName: 'IdsDs',
  platform: 'browser',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
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

const styles = join(elements, 'dist/browser/styles.css');
copyFileSync(styles, join(elements, 'demo/dist/styles.css'));

console.error(
  `✓ ds-bundle.js ${kb(bundlePath)} (react external) · angular main.js ${kb(ngOutput)}`
  + ` · styles.css ${kb(styles)} · demo ${kb(demoPath)}`,
);
