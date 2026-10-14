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
// The release group runs once before a release, never on a branch.
//   node tools/check.mjs --group release --list       # print a set's members without running them
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { acquireHeavyLock } from './heavy-lock.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXTRA = {
  'agent-catalogue': ['tools/split-agent-catalogue.mjs', '--check'],
  'chart-palette': ['tools/generate-chart-palette.mjs', '--check'],
  statuses: ['tools/extract-statuses.mjs', '--check'],
  'input-lists': ['tools/generate-input-lists.mjs', '--check'],
  'lib-package': ['tools/sync-lib-package.mjs', '--check'],
  'public-api': ['tools/generate-public-api.mjs', '--check'],
  'todo-index': ['tools/todo-index.mjs', '--check'],
  'token-deprecations': ['tools/generate-token-deprecations.mjs', '--check'],
  'api-deprecations': ['tools/generate-api-deprecations.mjs', '--check'],
  'manual-surface': ['.design-sync/tools/check-manual-surface.mjs'],
  'changelog-lint': ['tools/changelog-lint.mjs'],
  'changelog-lint:selftest': ['tools/changelog-lint-selftest.mjs'],
  'migration-lint': ['tools/migration-lint.mjs'],
  'migration-lint:selftest': ['tools/migration-lint-selftest.mjs'],
  'deck-lint': ['tools/deck-lint.mjs'],
  'deck-lint:selftest': ['tools/deck-lint-selftest.mjs'],
  // The upgrade plugin's mechanical-apply script, run over its fixture cases.
  'plugin-apply': ['plugins/design-system/scripts/apply-mechanical.test.mjs'],
  // The upgrade plugin's lint step, run over its fixture with this repo's linters and plugins.
  'plugin-lint-step': ['plugins/design-system/scripts/lint-step.test.mjs'],
  'upgrade-canary': ['tools/run-upgrade-canary.mjs'],
  'upgrade-canary:selftest': ['tools/run-upgrade-canary-selftest.mjs'],
  // Sweeps published history and never fails: triage, not a gate.
  'manifest-coverage:audit': ['tools/check-manifest-coverage.mjs', '--audit'],
  // The prose-name and unread-value rules over published manifests, which fail only the draft.
  'manifest-truth:audit': ['tools/check-manifest-truth.mjs', '--audit'],
  'changelog-pending:audit': ['tools/check-changelog-pending.mjs', '--audit'],
  'manifest-claims:audit': ['tools/check-manifest-claims.mjs', '--audit'],
  'manifest-compile:audit': ['tools/check-manifest-compile.mjs', '--audit'],
  'manifest-detect:audit': ['tools/check-manifest-detect.mjs', '--audit'],
  'token-defaults:audit': ['tools/check-token-defaults.mjs', '--audit'],
  'heavy-lock:selftest': ['tools/heavy-lock-selftest.mjs'],
  probes: ['tools/run-probes.mjs'],
  schematics: ['tools/run-schematic-tests.mjs'],
};

// Checks that take one machine-wide slot (tools/heavy-lock.mjs), so parallel worktrees queue for
// them instead of running them side by side. Peak memory, measured 2026-10-08: manifest-compile up to
// 1085 MB in its own process plus the Angular compiler; upgrade-canary and render-evidence build the
// library and an app or the docs twice. Every other check stayed under 350 MB.
const HEAVY = new Set([
  'manifest-compile',
  'manifest-compile:audit',
  'manifest-compile:selftest',
  'upgrade-canary',
  'render-evidence',
  'render-evidence:selftest',
  'schematics',
]);

export const GROUPS = {
  // `lint:all` runs this, then prettier, stylelint and eslint. Out deliberately: `manifest-truth`
  // and `delete-tables` answer about a release boundary that cannot move without a commit touching
  // the manifests, and the first reads 27 release trees; `manifest-compile` type-checks every
  // fixture at two extracted release trees (3 min for 73 fixtures, 2026-10-08); `todo-index`
  // compares against `docs/todo.md`, which parallel sessions edit in a shared checkout.
  // `token-deprecations` reads every release tree (42 s, 2026-10-08) and moves only with a
  // manifest; its selftest is in, because the rule it tests ships to consumers and runs in under
  // 3 s.
  // `api-deprecations` and its selftest are in: the generator reads the manifests and the working
  // tree alone (1.0 s and 1.7 s, 2026-10-08), and a PR that brings a listed input or symbol back
  // has to take it off the shipped ESLint list in the same commit.
  // `changelog-pending` is in: it reads one tag's tree and the working tree in about a second, and
  // a change is cheapest to describe in the session that made it. `manifest-claims` is in: it reads
  // only the draft manifest and `## Unreleased`, which every PR can change. `token-defaults` is in:
  // any stylesheet edit can move a default, and it reads one tag and the working tree.
  // `public-api-golden` is in: it parses the working tree alone in under 3 s, and the golden has to
  // move in the commit that moves the surface.
  // `manifest-detect` is in: it greps a few fixture files with no tree to extract, and the draft
  // item it asks a fixture for is cheapest to give one in the session that wrote the item.
  // `plugin-apply` is in: its fixtures run in about 3 s (2026-10-08), and a consumer's upgrade runs
  // the script before any agent, so a broken rewrite reaches their code unless the PR that made it
  // fails.
  // `plugin-lint-step` is in for the same reason: about 4 s (2026-10-09), and a consumer's upgrade
  // takes its hits as located usages.
  lint: [
    'tools-parse',
    'entry-point-imports',
    'lib-package',
    'chart-palette',
    'statuses',
    'public-api',
    'probes',
    'focus-rings',
    'target-size:selftest',
    'target-size',
    'component-owned-styles',
    'glyph-clip:selftest',
    'glyph-clip',
    'chart-interaction',
    'chart-aria',
    'chart-mark-budget',
    'chart-palette-separation',
    'color-families',
    'docblock-drift',
    'dev-guards',
    'changelog-lint',
    'changelog-pending',
    'public-api-golden',
    'manifest-coverage',
    'manifest-claims',
    'manifest-detect',
    'token-defaults',
    'design-sync-log',
    'docs-attrs',
    'doc-tokens',
    'agent-catalogue',
    'void-tokens',
    'abbreviated-tokens',
    'deck-lint',
    'plugin-apply',
    'plugin-lint-step',
    'token-deprecations:selftest',
    'api-deprecations:selftest',
    'api-deprecations',
  ],
  // The `preversion` gate, run by `tools/preflight.mjs` in this order and stopping at the first
  // failure. `tools-parse` is first because every check after it is one of those files. Each
  // selftest runs before its lint: a green lint means the data satisfies the rules, not that the
  // rules can still fire. `manifest-coverage`, `manifest-truth` and `manifest-compile` are here
  // because the cut is the last moment to catch them: once a block is published, a consumer has
  // read the manifest's silence as "this release does not touch me". `manifest-claims` and
  // `token-defaults` for the same reason: an unmeasured claim and a default that moved unnamed both
  // read as facts the moment they ship. `manifest-detect` too: a locator that finds nothing is
  // recorded "not applicable" by the consumer's upgrade, and a clean re-check agrees.
  // `template-context-guard` because a context guard turns a template's `any` into a checked
  // type, and the draft is complete only at the cut. The PR gate runs most of the rest too, but it
  // is manual, so a release can be cut from a branch where it never fired. `token-deprecations` is here because the stylelint list ships in the package, and a
  // manifest edited without regenerating it would publish a list that misses the release's own
  // renames; `api-deprecations` for the same reason, with the ESLint list. `changelog-pending` is here because the cut folds `## Unreleased` into the release block,
  // and a change it never named leaves with nothing describing it. `public-api-golden` because the
  // golden at a tag is what the next release's surface diff starts from. `schematics` runs the shipped
  // `ng add` and `check-overrides` on in-memory workspaces; it is out of `lint` because the compile
  // alone takes most of 4.7-5.1 s (three runs, 2026-10-08). Left out: deck-lint, whose subject is
  // internal decks that never reach the package.
  // `upgrade-canary` is last because it is the slow one, two library builds and two app builds
  // (167 to 388 s over four runs, 2026-10-08). It is the only gate that applies the draft to an app and
  // builds it, so a break no item names, or an item that migrates into a broken build, surfaces at the
  // cut and not at a consumer's.
  // `render-evidence` sees a rendering change no token or member diff carries; it builds the docs twice
  // and screenshots every block, minutes rather than seconds, so it is here and not in `lint`.
  release: [
    'tools-parse',
    'template-context-guard',
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
    'manifest-compile:selftest',
    'manifest-compile',
    'manifest-detect:selftest',
    'manifest-detect',
    'token-defaults:selftest',
    'token-defaults',
    'token-deprecations:selftest',
    'token-deprecations',
    'api-deprecations:selftest',
    'api-deprecations',
    'changelog-lint:selftest',
    'changelog-lint',
    'changelog-pending:selftest',
    'changelog-pending',
    'public-api-golden:selftest',
    'public-api-golden',
    'focus-rings',
    'docs-attrs',
    'color-families',
    'docblock-drift',
    'lib-package',
    'entry-point-imports',
    'schematics',
    'upgrade-canary:selftest',
    'upgrade-canary',
    'render-evidence:selftest',
    'render-evidence',
  ],
  // The checkers' own tests: they prove a gate still goes red, the half a green run cannot show.
  // Discovery appends every `tools/check-*-selftest.mjs` except `overrides:selftest`, which needs a
  // built dist/ds.
  selftests: [
    'heavy-lock:selftest',
    'changelog-lint:selftest',
    'migration-lint:selftest',
    'deck-lint:selftest',
    'upgrade-canary:selftest',
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

  const release = HEAVY.has(name)
    ? acquireHeavyLock(`check ${name}`)
    : () => {};
  try {
    return (
      spawnSync(process.execPath, [join(ROOT, script), ...rest], {
        cwd: ROOT,
        stdio: 'inherit',
      }).status ?? 1
    );
  } finally {
    release();
  }
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
