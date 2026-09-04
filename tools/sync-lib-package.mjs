#!/usr/bin/env node
// ng-packagr reads the published manifest from the directory holding the primary
// ng-package.json, which is src/lib - not the workspace root. Rather than keep two
// hand-edited copies in step, the publishable fields are copied from the root
// package.json into src/lib/package.json. `--check` fails instead of writing, so a
// release cannot ship a version the root never bumped.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const rootPath = join(repo, 'package.json');
const libPath = join(repo, 'src', 'lib', 'package.json');

const PUBLISHED = [
  'name',
  'version',
  'description',
  'license',
  'homepage',
  'keywords',
  'publishConfig',
  'exports',
  'peerDependencies',
  'dependencies',
  'sideEffects',
];

const root = JSON.parse(readFileSync(rootPath, 'utf8'));
const wanted = {};
for (const key of PUBLISHED) {
  if (root[key] !== undefined) wanted[key] = root[key];
}
const serialised = JSON.stringify(wanted, null, 2) + '\n';

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(libPath, 'utf8');
  } catch {
    console.error(
      'sync-lib-package: src/lib/package.json is missing. Run `npm run sync-lib-package`.',
    );
    process.exit(1);
  }
  if (current !== serialised) {
    console.error(
      'sync-lib-package: src/lib/package.json is out of step with the root package.json.\n' +
        '  Run `npm run sync-lib-package` and commit the result.',
    );
    process.exit(1);
  }
  console.log(
    'sync-lib-package: OK — src/lib/package.json matches the root manifest.',
  );
} else {
  writeFileSync(libPath, serialised);
  console.log(
    `sync-lib-package: wrote src/lib/package.json (${root.name}@${root.version}).`,
  );
}
