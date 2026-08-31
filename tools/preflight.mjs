#!/usr/bin/env node
// Pre-release gate, run by the npm `preversion` hook before `npm version`.
// Emergency bypass: SKIP_PREFLIGHT=1.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

if (process.env.SKIP_PREFLIGHT === '1') {
  console.warn('preflight: SKIP_PREFLIGHT=1 — skipping all checks.');
  process.exit(0);
}

const fail = (message) => {
  console.error(`preflight: ${message}`);
  process.exit(1);
};

const git = (args) => execSync(`git ${args}`, { encoding: 'utf8' }).trim();

const branch = git('rev-parse --abbrev-ref HEAD');
if (branch !== 'main')
  fail(`must release from 'main', currently on '${branch}'.`);

if (git('status --porcelain') !== '') {
  fail('working tree is not clean — commit or stash first.');
}

git('fetch origin main --quiet');
// cut-release merges dev into main before bumping, so local main is intentionally
// AHEAD of origin/main here; require only that origin/main is reachable from HEAD
// (ahead-or-equal), which still catches a stale or diverged main.
try {
  execSync('git merge-base --is-ancestor origin/main HEAD', {
    stdio: 'ignore',
  });
} catch {
  fail("local 'main' is behind or diverged from 'origin/main' — pull first.");
}

const changelog = readFileSync('CHANGELOG.md', 'utf8').replace(/\r\n/g, '\n');
const unreleased = changelog.match(/^## Unreleased$\n([\s\S]*?)(?=^## )/m);
if (!unreleased) fail("no '## Unreleased' section in CHANGELOG.md.");
const hasEntry = unreleased[1]
  .split('\n')
  .some((line) => line.trim().startsWith('-'));
if (!hasEntry)
  fail("'## Unreleased' is empty — add release notes before releasing.");

try {
  execSync('node tools/check-class-surface-entry.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'the `## Unreleased` class-collision entry is behind the code (classes named above).',
  );
}

// A green lint means the data satisfies the rules, not that the rules can still fire: seven of
// them had stopped matching anything and went on reporting OK. The selftest mutates a manifest
// per rule and fails if the rule stays silent, so run it BEFORE trusting the lint's verdict.
try {
  execSync('node tools/migration-lint-selftest.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a migration-lint rule can no longer fire — the lint below would pass on data it should reject.',
  );
}

// The manifest is what a consumer's upgrade actually runs, and an undetectable item
// passes the whole find/apply/recheck loop in silence. Lint before the cut.
try {
  execSync('node tools/migration-lint.mjs', { stdio: 'inherit' });
  execSync('node tools/check-delete-tables.mjs', { stdio: 'inherit' });
} catch {
  fail('migrations/ failed the manifest lint (errors above).');
}

// The PR gate runs this too, but a release can be cut from a branch whose gate never ran,
// and after publishing to the public registry there is nothing to fix.
try {
  execSync('node tools/changelog-lint-selftest.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a changelog-lint rule can no longer fire — the lint below would pass on text it should reject.',
  );
}

try {
  execSync('node tools/changelog-lint.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a published artefact names something the reader cannot reach (errors above).',
  );
}

// Two releases shipped a field with two focus rings; both were found by measuring in
// a browser, not by reading the styles.
try {
  execSync('node tools/check-focus-rings.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a ringed shell does not silence the base focus indicator (errors above).',
  );
}

console.log('preflight: all checks passed.');
