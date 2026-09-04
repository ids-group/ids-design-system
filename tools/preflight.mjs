#!/usr/bin/env node
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
  fail(
    "could not establish that 'origin/main' is reachable from HEAD. Either local 'main' is " +
      "behind or diverged — pull — or the ref is not there at all, which a pull will not fix: " +
      'check the remote name and that a fetch has run.',
  );
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
  // First, because every check below is one of these files: a gate that does not parse
  // cannot report anything.
  execSync('node tools/check-tools-parse.mjs', { stdio: 'inherit' });
} catch {
  fail('a script in tools/ does not parse — the file and the error are above.');
}

try {
  execSync('node tools/check-class-surface-entry.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'the class-surface entry check did not pass — read its output above. If it named classes, ' +
      'the `## Unreleased` entry is behind the code; if it named none, it could not run.',
  );
}

// A green lint means the data satisfies the rules, not that the rules can still fire, so run
// the selftest BEFORE trusting the lint's verdict.
try {
  execSync('node tools/migration-lint-selftest.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'the migration-lint selftest did not pass — read its output above. A rule that can no ' +
      'longer fire means the lint below would pass on data it should reject; a selftest ' +
      'that could not run means nothing has been proved either way.',
  );
}

try {
  execSync('node tools/migration-lint.mjs', { stdio: 'inherit' });
  execSync('node tools/check-delete-tables.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'the manifest lint or the delete-table parity check did not pass — the output above says ' +
      'which. They are two different checks and only one of them ran second.',
  );
}

// The cut is the only moment this can be caught: once the block is published, a consumer has
// already read the manifest's silence as "this release does not touch me".
try {
  execSync('node tools/check-manifest-coverage-selftest.mjs', { stdio: 'inherit' });
  execSync('node tools/check-manifest-coverage.mjs', { stdio: 'inherit' });
  // The only check that reads the TREE at each published boundary. Everything above validates the
  // JSON and the prose, so an item can satisfy all of it and still name a token that never
  // existed. ~22s over the whole history, which is why it is here and in the PR gate but not in
  // `lint:all`, where the published manifests it reads cannot have changed.
  execSync('node tools/check-manifest-truth-selftest.mjs', { stdio: 'inherit' });
  execSync('node tools/check-manifest-truth.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a documented change names public surface the manifest never mentions — the output above ' +
      'says which entry and which token, tag or symbol. Name it: an item if a consumer must ' +
      'edit code, an `informational` line otherwise.',
  );
}

// The PR gate runs this too, but a release can be cut from a branch whose gate never ran,
// and after publishing to the public registry there is nothing to fix.
try {
  execSync('node tools/changelog-lint-selftest.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'the changelog-lint selftest did not pass — read its output above. A rule that can no ' +
      'longer fire means the lint below would pass on text it should reject; a selftest ' +
      'that could not run means nothing has been proved either way.',
  );
}

try {
  execSync('node tools/changelog-lint.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'changelog-lint did not pass — read the rule it names above. Its fifteen rules cover ' +
      'unreachable names, internal references, section order and more, so the rule id is the ' +
      'diagnosis, not this line.',
  );
}

// A double ring is invisible in the styles — the shells and the controls each paint their
// own — so this measures instead of reading.
try {
  execSync('node tools/check-focus-rings.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a ringed shell does not silence the base focus indicator (errors above).',
  );
}

// Two more the PR gate calls hard and this one did not run, which is the same hole the changelog
// checks above were added to close: the PR gate is manual, so a release can be cut from a branch
// where neither ever fired. Left out deliberately: deck-lint, whose subject is internal decks that
// never reach the package.
try {
  execSync('node tools/check-color-families.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'the colour-family check did not pass — read its own output above: it reports either a ' +
      'family that cannot resolve a role its accent pointers read, or that it could not run ' +
      'at all.',
  );
}

try {
  execSync('node tools/check-docblock-drift.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a doc comment has drifted off its symbol, so the published API table documents the wrong member (errors above).',
  );
}

// The published manifest lives in src/lib, so a bump that never reached it would publish the
// outgoing version. The version hook copies it; this is what notices when that stops happening.
try {
  execSync('node tools/sync-lib-package.mjs --check', { stdio: 'inherit' });
} catch {
  fail(
    'src/lib/package.json is out of step with the root manifest — `npm run sync-lib-package` ' +
      'and commit the result. ng-packagr publishes the src/lib copy, so a stale one ships the ' +
      'wrong version.',
  );
}

try {
  execSync('node tools/check-entry-point-imports.mjs', { stdio: 'inherit' });
} catch {
  fail(
    'a cross-entry-point import does not name a real entry point (errors above). Left ' +
      'unfixed it type-checks here and ships as an unresolvable external import in the FESM, ' +
      'which no consumer build can resolve.',
  );
}

console.log('preflight: all checks passed.');
