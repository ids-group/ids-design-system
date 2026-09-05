// Stages the deps `buildCmd` needs into .ds-sync/ (gitignored) and links them where
// the elements package's tsc can resolve them, so a fresh clone can run the sync
// build without anyone remembering what to install.
//
//   node .design-sync/tools/bootstrap.mjs
//
// Only the committed tools' own deps live here. The converter's staging
// (package-build.mjs, ts-morph, the playwright pin) is installed by the
// /design-sync skill itself — see NOTES.md for those pins.
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  readFileSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const stage = join(repo, '.ds-sync');

// react/react-dom are pinned to 18.3.1 because that is what the design host vendors
// as `_vendor/react.js` (read from the live project, 2026-09-01). Matching it keeps the
// demo page on the same React the cards run on — on 18 the wrapper can only assign
// inputs in a layout effect, after the element connects. The TYPES are 19.x on purpose:
// `inert` (accordion panel, collapsed sidenav) never landed in @types/react 18.3.x, so
// an `^18` types pin fails the declaration emit.
const PINS = [
  'esbuild',
  'sass',
  'postcss',
  'react@18.3.1',
  'react-dom@18.3.1',
  '@types/react@^19',
  '@types/react-dom@^19',
];

mkdirSync(stage, { recursive: true });
const stagePkg = join(stage, 'package.json');
if (!existsSync(stagePkg)) {
  writeFileSync(stagePkg, '{"name":"ds-sync-deps","private":true}\n');
}

console.error(`→ npm install ${PINS.join(' ')} (in .ds-sync)`);
execFileSync('npm', ['install', '--no-audit', '--no-fund', ...PINS], {
  cwd: stage,
  stdio: 'inherit',
  shell: true,
});

// The declaration emit runs tsc over `.design-sync/elements/*`; node/tsc resolution
// walks up from there, so react + its types have to be reachable at .design-sync/.
const link = join(repo, '.design-sync', 'node_modules');
if (existsSync(link)) {
  console.error('✓ .design-sync/node_modules already linked');
} else {
  symlinkSync(join(stage, 'node_modules'), link, 'junction');
  console.error('✓ linked .design-sync/node_modules → .ds-sync/node_modules');
}

const typescript = join(repo, 'node_modules', 'typescript', 'bin', 'tsc');
if (!existsSync(typescript)) {
  console.error(
    '! repo deps missing — run `bun install --frozen-lockfile` too (tsc comes from there)',
  );
  process.exit(1);
}
const { buildCmd } = JSON.parse(
  readFileSync(join(repo, '.design-sync', 'config.json'), 'utf8'),
);
console.error(`✓ ready — run: ${buildCmd}`);
