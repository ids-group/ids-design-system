#!/usr/bin/env node
// `.design-sync/` cannot be described in the published CHANGELOG.md — nothing there reaches the
// tarball, and changelog-lint fails an entry naming a path outside the published tree. So its work
// goes in `.design-sync/CHANGELOG.md`, and this is what stops that file rotting: a cycle that
// touched the directory and wrote nothing about it fails here rather than being noticed a year on.
//
//   node tools/check-design-sync-log.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOG = join(ROOT, '.design-sync', 'CHANGELOG.md');

const git = (args) =>
  execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  }).trim();

let base;
try {
  base = git(['describe', '--tags', '--abbrev=0']);
} catch {
  console.log(
    'check-design-sync-log: no tags yet, nothing to compare a cycle against.',
  );
  process.exit(0);
}

// What the after-release pipeline regenerates and commits as the release bot (GENERATED in
// infrastructure/scripts/build-design-sync.sh). Nobody wrote it, so nobody owes an entry for it.
const BOT_GENERATED = [
  '.design-sync/upload/',
  '.design-sync/viewports.json',
  '.design-sync/live-cards.txt',
];
const touched = git([
  'diff',
  '--name-only',
  `${base}..HEAD`,
  '--',
  '.design-sync',
])
  .split('\n')
  .filter(Boolean)
  .filter((file) => !BOT_GENERATED.some((path) => file.startsWith(path)));

if (!touched.length) {
  console.log(
    `check-design-sync-log: nothing under .design-sync/ changed since ${base}.`,
  );
  process.exit(0);
}

if (!existsSync(LOG)) {
  console.error(
    `check-design-sync-log: ${touched.length} file(s) under .design-sync/ changed since ${base}, ` +
      'and .design-sync/CHANGELOG.md does not exist.',
  );
  process.exit(1);
}

const text = readFileSync(LOG, 'utf8');
const start = text.search(/^## Unreleased\s*$/m);
if (start === -1) {
  console.error(
    'check-design-sync-log: .design-sync/CHANGELOG.md has no `## Unreleased` heading.',
  );
  process.exit(1);
}
// No next heading on the first cycle, before any version block exists.
const rest = text.slice(start + '## Unreleased'.length);
const nextHeading = rest.search(/^## /m);
const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);

// A `###` subsection with no bullet under it is the shape this catches: the headings get written
// while the entries are meant to follow, and then do not.
const bullets = section
  .split('\n')
  .filter((line) => /^\s*-\s+\S/.test(line)).length;

if (!bullets) {
  console.error(
    `check-design-sync-log: ${touched.length} file(s) under .design-sync/ changed since ${base}, ` +
      'and `## Unreleased` in .design-sync/CHANGELOG.md carries no entry. Describe the cycle there ' +
      '— it cannot go in the published CHANGELOG.md.',
  );
  process.exit(1);
}

console.log(
  `check-design-sync-log: ${bullets} entr(ies) under \`## Unreleased\` for ` +
    `${touched.length} changed file(s) since ${base}.`,
);
