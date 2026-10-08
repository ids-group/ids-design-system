#!/bin/sh
# PR validation in one container: the build and the lint checks run concurrently after a single
# shared install, so container startup and `bun install` are paid once rather than per step.
#
# Everything here is a hard gate except lint, which is report-only while the repo carries
# pre-existing debt. Each gate below says what it stops.
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

# The image ships without git, and Bitbucket clones 50 commits with only the tags inside them;
# the manifest and class-surface checks read every release tag's tree.
command -v git > /dev/null || apk add --no-cache git > /dev/null
if [ -f "$(git rev-parse --git-dir)/shallow" ]; then
  git fetch --unshallow --tags origin --quiet
else
  git fetch --tags origin --quiet
fi

# Before the slow work: the manifests are what a consumer's upgrade executes, and an
# undetectable entry reaches them in silence.
echo "===== migration-lint ====="
node tools/migration-lint.mjs

echo "===== migration-lint selftest ====="
node tools/migration-lint-selftest.mjs

# A change documented in the block and named nowhere in the manifest reads to a consumer as
# "this release does not touch me". Only the block being cut is checked, so history is never
# asked for a line it does not need.
echo "===== manifest coverage ====="
node tools/check-manifest-coverage-selftest.mjs
node tools/check-manifest-coverage.mjs

# The only check that reads the tree at each published boundary: an item can satisfy every rule
# above and still name a token that never existed. Here rather than in lint:all because it reads
# 27 trees (~22s) and the manifests it checks cannot change without a commit touching them.
echo "===== manifest truth (against each release's own tag) ====="
node tools/check-manifest-truth-selftest.mjs
node tools/check-manifest-truth.mjs

# The agent catalogue is derived from components.md; editing the source without regenerating
# leaves the shipped leaves lying.
echo "===== agent catalogue ====="
node tools/split-agent-catalogue.mjs --check

# A ds-color family missing a role the accent pointers read is invalid at computed-value time,
# so the label renders as body text with nothing in the console.
echo "===== colour families ====="
node tools/check-color-families.mjs

echo "===== delete-table parity ====="
node tools/check-tools-parse.mjs
node tools/check-delete-tables.mjs
node tools/check-design-sync-log.mjs

# A component with no .design-sync/docs/<Name>.md, or one whose ds-docs section is not registered,
# used to surface as an ENOENT inside the release build — the first place a card is read. gen.mjs
# is a TypeScript AST read (~2.5s), not the Angular build, so these answer on the PR that added
# the component for the cost of seconds.
echo "===== Claude Design doc coverage ====="
node .design-sync/elements/tools/gen.mjs
node .design-sync/tools/check-manual-surface.mjs
node .design-sync/tools/check-doc-api.mjs

# CHANGELOG.md and the manifests go into the tarball on a public registry, so a client's name
# or a `tools/` path in them reaches everyone. Prose review cannot hold this line: the writing
# agent studies the previous release for voice and inherits its leaks.
echo "===== changelog-lint (published surface) ====="
node tools/changelog-lint.mjs

echo "===== changelog-lint selftest ====="
node tools/changelog-lint-selftest.mjs

# A public change merged without a line under `## Unreleased` is reconstructed from the diff at the
# cut, weeks later, by someone who did not make it. Compared with the last release tag rather than
# the PR's target: every unreleased change has to be described, and the tags are what this clone
# is guaranteed to hold.
echo "===== changelog pending ====="
node tools/check-changelog-pending-selftest.mjs
node tools/check-changelog-pending.mjs

# A draft line asserting "renders identically" or a count with nothing that measured it, and a
# default that moved with no line naming it, both reach a consumer as "nothing to do". Each reads
# only the draft against the last tag, in about a second. manifest-compile stays at the cut: its
# selftest and check type-check two trees each, about 32s together, more than manifest truth.
echo "===== manifest claims ====="
node tools/check-manifest-claims-selftest.mjs
node tools/check-manifest-claims.mjs

echo "===== token defaults ====="
node tools/check-token-defaults-selftest.mjs
node tools/check-token-defaults.mjs

# A doc comment pushed off its symbol still compiles and still lints clean, and the extractor
# prints it under whatever member now follows it.
echo "===== docblock drift ====="
node tools/check-docblock-drift.mjs

# The chart geometry has no test runner behind it, so these assertions are the only thing standing
# between a scale or stacking change and a plot that draws wrong numbers. Each probe is its own
# process, so one failure does not hide the rest.
echo "===== probes ====="
node tools/run-probes.mjs

log_dir="$(mktemp -d)"

echo "Building (lib -> docs) and linting in parallel..."
# ds-docs needs the built dist/ds, so the build is ordered inside its own subshell.
( node tools/check.mjs entry-point-imports lib-package && bun run build:lib && [ -f dist/ds/package.json ] && bun run build:docs && [ -f dist/ds-docs/browser/index.html ] ) > "$log_dir/build.log" 2>&1 &  pid_build=$!
bun run format                          > "$log_dir/format.log"    2>&1 &  pid_format=$!
bun run lint:styles                     > "$log_dir/stylelint.log" 2>&1 &  pid_styles=$!
bun run lint                            > "$log_dir/eslint.log"    2>&1 &  pid_eslint=$!

build_failed=0
wait "$pid_build" || build_failed=1

lint_failed=0
wait "$pid_format" || lint_failed=1
wait "$pid_styles" || lint_failed=1
wait "$pid_eslint" || lint_failed=1

for name in build format stylelint eslint; do
  echo "===== $name ====="
  cat "$log_dir/$name.log"
done

if [ "$lint_failed" -eq 0 ]; then
  echo "Lint passed"
else
  echo "Lint found issues (report-only — not failing the build)"
fi

if [ "$build_failed" -ne 0 ]; then
  echo "Build failed"
  exit 1
fi
echo "Build passed"
