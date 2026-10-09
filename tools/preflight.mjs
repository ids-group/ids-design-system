#!/usr/bin/env node
// Emergency bypass: SKIP_PREFLIGHT=1.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { GROUPS, run as runCheck } from './check.mjs';

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
      'behind or diverged — pull — or the ref is not there at all, which a pull will not fix: ' +
      'check the remote name and that a fetch has run.',
  );
}

const changelog = readFileSync('CHANGELOG.md', 'utf8').replace(/\r\n/g, '\n');
const unreleased = changelog.match(/^## Unreleased$\n([\s\S]*?)(?=^## )/m);
if (!unreleased) fail("no '## Unreleased' section in CHANGELOG.md.");
const hasEntry = unreleased[1]
  .split('\n')
  .some((line) => line.trim().startsWith('-'));
// A stable release straight after a beta may add nothing: it moves the beta's blocks into itself.
const betaBelow = /^## \d+\.\d+\.\d+-\S+ — /.test(
  changelog.slice(unreleased.index + unreleased[0].length),
);
if (!hasEntry && !(betaBelow && process.env.DS_RELEASE_BETA !== '1'))
  fail("'## Unreleased' is empty — add release notes before releasing.");

// The checks and their order live in `tools/check.mjs` (GROUPS.release), with the reasons for
// both. What stays here is what to do when one fails.
const MANIFEST_COVERAGE =
  'a documented change names public surface the manifest never mentions — the output above ' +
  'says which entry and which token, tag or symbol. Name it: an item if a consumer must ' +
  'edit code, an `informational` line otherwise.';
const selftestHint = (lint) =>
  `the ${lint} selftest did not pass — read its output above. A rule that can no ` +
  'longer fire means the lint would pass on data it should reject; a selftest ' +
  'that could not run means nothing has been proved either way.';

const HINTS = {
  'tools-parse':
    'a script in tools/ does not parse — the file and the error are above.',
  'class-surface-entry':
    'the class-surface entry check did not pass — read its output above. If it named classes, ' +
    'the `## Unreleased` entry is behind the code; if it named none, it could not run.',
  'migration-lint:selftest': selftestHint('migration-lint'),
  'migration-lint':
    'the manifest lint did not pass — the rule it names above is the diagnosis.',
  'delete-tables':
    'a manifest `deleteList` row is not reachable from its CHANGELOG block (errors above).',
  'manifest-coverage:selftest': MANIFEST_COVERAGE,
  'manifest-coverage': MANIFEST_COVERAGE,
  'manifest-truth:selftest': MANIFEST_COVERAGE,
  'manifest-truth': MANIFEST_COVERAGE,
  'changelog-lint:selftest': selftestHint('changelog-lint'),
  'changelog-lint':
    'changelog-lint did not pass — read the rule it names above. Its fifteen rules cover ' +
    'unreachable names, internal references, section order and more, so the rule id is the ' +
    'diagnosis, not this line.',
  'focus-rings':
    'a ringed shell does not silence the base focus indicator (errors above).',
  'docs-attrs':
    'a static attribute on a ds-* element answers to no input of that component (errors above).',
  'color-families':
    'the colour-family check did not pass — read its own output above: it reports either a ' +
    'family that cannot resolve a role its accent pointers read, or that it could not run ' +
    'at all.',
  'docblock-drift':
    'a doc comment has drifted off its symbol, so the published API table documents the wrong member (errors above).',
  'lib-package':
    'src/lib/package.json is out of step with the root manifest — `npm run sync-lib-package` ' +
    'and commit the result. ng-packagr publishes the src/lib copy, so a stale one ships the ' +
    'wrong version.',
  'entry-point-imports':
    'a cross-entry-point import does not name a real entry point (errors above). Left ' +
    'unfixed it type-checks here and ships as an unresolvable external import in the FESM, ' +
    'which no consumer build can resolve.',
};

// TODO(render-evidence-ci): the pipeline image has no Chrome, so the pixel checks are skipped in CI
// until the release step installs Chromium (docs/todo.md); they stay in `npm run check:release`.
const PIXEL_CHECKS = new Set(['render-evidence', 'render-evidence:selftest']);
const inPipeline = Boolean(
  process.env.CI || process.env.BITBUCKET_BUILD_NUMBER,
);
for (const name of GROUPS.release) {
  if (inPipeline && PIXEL_CHECKS.has(name)) {
    console.warn(
      `preflight: ${name} skipped in the pipeline (no Chrome); run check:release locally before releasing.`,
    );
    continue;
  }
  if (runCheck(name) !== 0)
    fail(HINTS[name] ?? `the ${name} check did not pass (output above).`);
}

console.log('preflight: all checks passed.');
