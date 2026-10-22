// Proves the `--affected` path table both ways: a narrow change picks only its own checks, and a
// change the table cannot place falls back to the whole lint group. Feeds paths straight to
// `affectedChecks`, so no git state is read.
import { AFFECTED, GROUPS, affectedChecks, checks } from './check.mjs';

const failures = [];
const expect = (ok, message) => ok || failures.push(message);
const namesFor = (...paths) => affectedChecks(paths).names;
const same = (actual, expected) =>
  actual.length === expected.length &&
  expected.every((name) => actual.includes(name));

// 1. Every check a row names exists, so a rename cannot leave a row pointing at nothing.
for (const [pattern, names] of AFFECTED) {
  for (const name of names) {
    expect(checks.has(name), `AFFECTED ${pattern} names no check "${name}"`);
  }
}

// 2. One manifest: the manifest checks and nothing else.
{
  const names = namesFor('migrations/9.9.0.json');
  expect(
    same(names, [
      'migration-lint',
      'manifest-truth',
      'manifest-claims',
      'manifest-compile',
      'manifest-detect',
      'delete-tables',
      'manifest-coverage',
      'token-deprecations',
      'api-deprecations',
    ]),
    `a manifest chose ${names.join(', ')}`,
  );
}

// 3. CHANGELOG.md: the four that read it.
expect(
  same(namesFor('CHANGELOG.md'), [
    'changelog-lint',
    'changelog-pending',
    'manifest-coverage',
    'delete-tables',
  ]),
  'CHANGELOG.md chose the wrong set',
);

// 4. The library: lint without the checks about other files, plus the surface checks.
{
  const names = namesFor('src/lib/button/button.component.ts');
  for (const name of [
    'public-api-golden',
    'token-defaults',
    'docs-attrs',
    'doc-tokens',
  ]) {
    expect(names.includes(name), `a library file did not choose ${name}`);
  }
  for (const name of [
    'deck-lint',
    'docs-nav-order',
    'design-sync-log',
    'agent-catalogue',
  ]) {
    expect(!names.includes(name), `a library file chose ${name}`);
  }
}

// 5. A check's own script and its selftest's: that check and its selftest, selftest first, no audit.
{
  const names = namesFor('tools/check-manifest-truth.mjs');
  expect(
    names.join(' ') === 'manifest-truth:selftest manifest-truth',
    `check-manifest-truth.mjs chose ${names.join(', ')}`,
  );
  expect(
    same(namesFor('tools/migration-lint-selftest.mjs'), [
      'migration-lint',
      'migration-lint:selftest',
    ]),
    'migration-lint-selftest.mjs did not choose the lint and its selftest',
  );
}

// 6. check.mjs, a helper no check is the script of, and an unknown path: the whole lint group.
for (const path of [
  'tools/check.mjs',
  'tools/release-tags.mjs',
  'nowhere/file.txt',
]) {
  expect(
    same(namesFor(path), GROUPS.lint),
    `${path} did not fall back to the lint group`,
  );
}
expect(
  affectedChecks(['nowhere/file.txt']).reasons[0].unmapped,
  'an unknown path was not reported as unmapped',
);

// 7. Several paths: the union, each check once.
{
  const names = namesFor(
    'CHANGELOG.md',
    'migrations/9.9.0.json',
    'decks/a.html',
  );
  expect(
    names.length === new Set(names).size && names.includes('deck-lint'),
    'several paths did not give the union once each',
  );
}

if (failures.length) {
  console.error(
    `affected:selftest: ${failures.length} case(s) failed:\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  'affected:selftest: OK - rows name real checks; manifest, CHANGELOG, library, own tool, fallback, union.',
);
