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

# CHANGELOG.md and the manifests go into the tarball on a public registry, so a client's name
# or a `tools/` path in them reaches everyone. Prose review cannot hold this line: the writing
# agent studies the previous release for voice and inherits its leaks.
echo "===== changelog-lint (published surface) ====="
node tools/changelog-lint.mjs

echo "===== changelog-lint selftest ====="
node tools/changelog-lint-selftest.mjs

# A doc comment pushed off its symbol still compiles and still lints clean, and the extractor
# prints it under whatever member now follows it.
echo "===== docblock drift ====="
node tools/check-docblock-drift.mjs

log_dir="$(mktemp -d)"

echo "Building (lib -> docs) and linting in parallel..."
# ds-docs needs the built dist/ds, so the build is ordered inside its own subshell.
( bun run build:lib && [ -f dist/ds/package.json ] && bun run build:docs && [ -f dist/ds-docs/browser/index.html ] ) > "$log_dir/build.log" 2>&1 &  pid_build=$!
bun run check:manual-surface            > "$log_dir/surface.log"   2>&1 &  pid_surface=$!
bun run format                          > "$log_dir/format.log"    2>&1 &  pid_format=$!
bun run lint:styles                     > "$log_dir/stylelint.log" 2>&1 &  pid_styles=$!
bun run lint                            > "$log_dir/eslint.log"    2>&1 &  pid_eslint=$!

build_failed=0
wait "$pid_build" || build_failed=1

surface_failed=0
wait "$pid_surface" || surface_failed=1

lint_failed=0
wait "$pid_format" || lint_failed=1
wait "$pid_styles" || lint_failed=1
wait "$pid_eslint" || lint_failed=1

for name in build surface format stylelint eslint; do
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


if [ "$surface_failed" -ne 0 ]; then
  echo "manual-surface check failed"
  exit 1
fi
echo "manual surface passed"
