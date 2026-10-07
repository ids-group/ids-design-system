// One entry point for the repo's checkers, so adding one means adding a file rather than a file
// and a `package.json` line.
//
// Most checkers are discovered: any `tools/check-X.mjs` is the check `X`, and
// `tools/check-X-selftest.mjs` is `X:selftest`. EXTRA lists the ones whose filename does not say
// they check anything: generators that verify instead of writing under `--check` (the check IS
// "running me changes nothing"), the `*-lint` tools, and the one outside `tools/`.
//
// GROUPS are explicit because which checkers run where is a policy with reasons, and a
// `package.json` script string cannot carry the reason a checker is out. A checker in no group
// still runs by name.
//
//   node tools/check.mjs                              # list every check and the groups
//   node tools/check.mjs void-tokens deck-lint        # run these, stopping at the first failure
//   node tools/check.mjs --group lint --keep-going    # run a set, reporting every failure at the end
//   node tools/check.mjs --group release --list       # print a set's members without running them
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXTRA = {
  'agent-catalogue': ['tools/split-agent-catalogue.mjs', '--check'],
  'chart-palette': ['tools/generate-chart-palette.mjs', '--check'],
  statuses: ['tools/extract-statuses.mjs', '--check'],
  'input-lists': ['tools/generate-input-lists.mjs', '--check'],
  'lib-package': ['tools/sync-lib-package.mjs', '--check'],
  'public-api': ['tools/generate-public-api.mjs', '--check'],
  'todo-index': ['tools/todo-index.mjs', '--check'],
  'manual-surface': ['.design-sync/tools/check-manual-surface.mjs'],
  'changelog-lint': ['tools/changelog-lint.mjs'],
  'changelog-lint:selftest': ['tools/changelog-lint-selftest.mjs'],
  'migration-lint': ['tools/migration-lint.mjs'],
  'migration-lint:selftest': ['tools/migration-lint-selftest.mjs'],
  'deck-lint': ['tools/deck-lint.mjs'],
  'deck-lint:selftest': ['tools/deck-lint-selftest.mjs'],
  // Sweeps published history and never fails: triage, not a gate.
  'manifest-coverage:audit': ['tools/check-manifest-coverage.mjs', '--audit'],
  // The prose-name and unread-value rules over published manifests, which fail only the draft.
  'manifest-truth:audit': ['tools/check-manifest-truth.mjs', '--audit'],
  'changelog-pending:audit': ['tools/check-changelog-pending.mjs', '--audit'],
  'manifest-claims:audit': ['tools/check-manifest-claims.mjs', '--audit'],
  probes: ['tools/run-probes.mjs'],
};

export const GROUPS = {
  // `lint:all` runs this, then prettier, stylelint and eslint. Out deliberately: `manifest-truth`
  // and `delete-tables` answer about a release boundary that cannot move without a commit touching
  // the manifests, and the first reads 27 release trees; `todo-index` compares
  // against `docs/todo.md`, which parallel sessions edit in a shared checkout. `changelog-pending`
  // is in: it reads one tag's tree and the working tree in about a second, and a change is cheapest
  // to describe in the session that made it. `manifest-claims` is in: it reads only the draft
  // manifest and `## Unreleased`, which every PR can change.
  lint: [
    'tools-parse',
    'entry-point-imports',
    'lib-package',
    'chart-palette',
    'statuses',
    'public-api',
    'probes',
    'focus-rings',
    'chart-interaction',
    'chart-aria',
    'chart-mark-budget',
    'chart-palette-separation',
    'color-families',
    'docblock-drift',
    'dev-guards',
    'changelog-lint',
    'changelog-pending',
    'manifest-coverage',
    'manifest-claims',
    'design-sync-log',
    'docs-attrs',
    'doc-tokens',
    'agent-catalogue',
    'void-tokens',
    'abbreviated-tokens',
    'deck-lint',
  ],
  // The `preversion` gate, run by `tools/preflight.mjs` in this order and stopping at the first
  // failure. `tools-parse` is first because every check after it is one of those files. Each
  // selftest runs before its lint: a green lint means the data satisfies the rules, not that the
  // rules can still fire. `manifest-coverage` and `manifest-truth` are here because the cut is the
  // last moment to catch them: once a block is published, a consumer has read the manifest's
  // silence as "this release does not touch me". `manifest-claims` for the same reason: a claim
  // nobody measured is read as a fact the moment it ships. The PR gate runs most of the rest too, but
  // it is manual, so a release can be cut from a branch where it never fired. `changelog-pending` is
  // here because the cut folds `## Unreleased` into the release block, and a change it never named
  // leaves with nothing describing it. Left out: deck-lint, whose subject is internal decks that
  // never reach the package.
  release: [
    'tools-parse',
    'class-surface-entry',
    'release-fold:selftest',
    'migration-lint:selftest',
    'migration-lint',
    'delete-tables',
    'manifest-coverage:selftest',
    'manifest-coverage',
    'manifest-truth:selftest',
    'manifest-truth',
    'manifest-claims:selftest',
    'manifest-claims',
    'changelog-lint:selftest',
    'changelog-lint',
    'changelog-pending:selftest',
    'changelog-pending',
    'focus-rings',
    'docs-attrs',
    'color-families',
    'docblock-drift',
    'lib-package',
    'entry-point-imports',
  ],
  // The checkers' own tests: they prove a gate still goes red, the half a green run cannot show.
  // Discovery appends every `tools/check-*-selftest.mjs` except `overrides:selftest`, which needs a
  // built dist/ds.
  selftests: [
    'changelog-lint:selftest',
    'migration-lint:selftest',
    'deck-lint:selftest',
  ],
};

const NEEDS_BUILD = new Set(['overrides:selftest']);

const discovered = new Map();
for (const file of readdirSync(join(ROOT, 'tools')).sort()) {
  const match = /^check-(.+?)(-selftest)?\.mjs$/.exec(file);
  if (!match) continue;
  const name = match[2] ? `${match[1]}:selftest` : match[1];
  discovered.set(name, [`tools/${file}`]);
  if (match[2] && !NEEDS_BUILD.has(name)) GROUPS.selftests.push(name);
}

export const checks = new Map([...discovered, ...Object.entries(EXTRA)]);

const missing = Object.entries(GROUPS).flatMap(([group, names]) =>
  names
    .filter((name) => !checks.has(name))
    .map((name) => `${group} -> ${name}`),
);
if (missing.length > 0) {
  console.error(
    `check: ${missing.length} group entr(ies) name no check - a rename left a group pointing at nothing:\n  ${missing.join('\n  ')}`,
  );
  process.exit(1);
}

/** Runs one check with inherited stdio; returns its exit status. */
export const run = (name) => {
  const command = checks.get(name);
  if (!command) {
    console.error(
      `check: no check called "${name}". Run \`node tools/check.mjs\` for the list.`,
    );

    return 1;
  }
  const [script, ...rest] = command;
  if (!existsSync(join(ROOT, script))) {
    console.error(`check: ${name} names ${script}, which is not there.`);

    return 1;
  }

  return (
    spawnSync(process.execPath, [join(ROOT, script), ...rest], {
      cwd: ROOT,
      stdio: 'inherit',
    }).status ?? 1
  );
};

const main = () => {
  const argv = process.argv.slice(2);
  const keepGoing = argv.includes('--keep-going');
  const groupIndex = argv.indexOf('--group');
  const groupName = groupIndex === -1 ? null : argv[groupIndex + 1];
  const positional = argv.filter(
    (argument, index) =>
      !argument.startsWith('--') &&
      (groupIndex === -1 || index !== groupIndex + 1),
  );

  if (positional.length === 0 && !groupName) {
    console.log(
      `check: ${checks.size} check(s)\n  ${[...checks.keys()].sort().join('\n  ')}`,
    );
    console.log(
      `\ngroups\n  ${Object.entries(GROUPS)
        .map(([name, members]) => `${name} (${members.length})`)
        .join('\n  ')}`,
    );

    return 0;
  }

  if (groupName && !GROUPS[groupName]) {
    console.error(
      `check: no group called "${groupName}". Known: ${Object.keys(GROUPS).join(', ')}.`,
    );

    return 1;
  }
  const names = groupName ? GROUPS[groupName] : positional;

  if (argv.includes('--list')) {
    console.log(names.join('\n'));

    return 0;
  }

  const failed = [];
  for (const name of names) {
    if (run(name) !== 0) {
      failed.push(name);
      if (!keepGoing) break;
    }
  }

  if (failed.length > 0) {
    console.error(`\ncheck: FAILED - ${failed.join(', ')}`);

    return 1;
  }
  console.log(`\ncheck: ${names.length} check(s) passed.`);

  return 0;
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main();
}
