#!/usr/bin/env node
// ng-packagr reads the published manifest from the directory holding the primary
// ng-package.json, which is src/lib - not the workspace root. Rather than keep two
// hand-edited copies in step, the publishable fields are copied from the root
// package.json into src/lib/package.json. `--check` fails instead of writing, so a
// release cannot ship a version the root never bumped. `--dist`, run after `ng build ds`, marks a
// build with entries under `## Unreleased` as `<next>-dev.g<sha>[.dirty]` and `private` in
// dist/ds/package.json only, so npm refuses to publish it: the release stamp empties that section,
// so a release build keeps the plain version.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { unreleasedHasEntry } from './release-fold.mjs';
import { devVersion } from './release-tags.mjs';

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

if (process.argv.includes('--dist')) {
  const distPath = join(repo, 'dist', 'ds', 'package.json');
  const dist = JSON.parse(readFileSync(distPath, 'utf8'));
  if (unreleasedHasEntry(readFileSync(join(repo, 'CHANGELOG.md'), 'utf8'))) {
    const git = (...args) =>
      execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
    let sha = null;
    let dirty = false;
    try {
      sha = git('rev-parse', '--short', 'HEAD');
      dirty = Boolean(git('status', '--porcelain'));
    } catch {}
    dist.version = devVersion(root.version, sha, dirty);
    dist.private = true;
    writeFileSync(distPath, JSON.stringify(dist, null, 2) + '\n');
  }
  console.log(
    `sync-lib-package: dist/ds/package.json is ${dist.name}@${dist.version}.`,
  );
} else if (process.argv.includes('--check')) {
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
