#!/bin/sh
# PR validation in a single container: build (the hard gate) and the lint checks
# run concurrently after one shared install, so we pay container startup and
# `bun install` once instead of per parallel step.
#
# Triggered manually via the `validate` custom pipeline — not on every PR.
#
# build          -> fails the step if the library or docs don't compile
# migration-lint -> fails the step; migrations/ has no debt to carry
# lint           -> report-only (prettier/stylelint/eslint), never fails the step
#                   while the repo carries pre-existing lint debt
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

# A hard gate, and it runs before the slow work: the manifests are what a
# consumer's upgrade actually executes, the check needs no build, and an
# undetectable entry is the one defect that reaches them in silence (two did,
# in 0.7.1).
echo "===== migration-lint ====="
node tools/migration-lint.mjs

log_dir="$(mktemp -d)"

echo "Building (lib -> docs) and linting in parallel..."
# ds-docs needs the built dist/ds, so build is ordered inside its own subshell;
# the artifact checks fail loud if a build silently produced nothing.
( bun run build:lib && [ -f dist/ds/package.json ] && bun run build:docs && [ -f dist/ds-docs/browser/index.html ] ) > "$log_dir/build.log" 2>&1 &  pid_build=$!
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
