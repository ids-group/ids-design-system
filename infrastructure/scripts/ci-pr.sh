#!/bin/sh
# PR validation in a single container: build (the hard gate) and the lint checks
# run concurrently after one shared install, so we pay container startup and
# `bun install` once instead of per parallel step.
#
# Triggered manually via the `validate` custom pipeline — not on every PR.
#
# build          -> fails the step if the library or docs don't compile
# migration-lint -> fails the step; migrations/ has no debt to carry
# changelog-lint -> fails the step; the published changelog and manifests must name
#                   nothing a reader outside this repo cannot open
# surface        -> fails the step when the @angular/elements route's hand-maintained
#                   list drifts from src/lib (see .design-sync/MANUAL-SURFACE.md)
# parity         -> REPORT-ONLY while the React port is parked: the elements route is the
#                   chosen one, so nobody is re-porting the bindings and the gate reports
#                   213 known divergences. It still runs, because the number is the
#                   measurement that justifies the choice
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

echo "===== migration-lint selftest ====="
node tools/migration-lint-selftest.mjs

echo "===== delete-table parity ====="
node tools/check-delete-tables.mjs

# Same class of gate, same argument: CHANGELOG.md and the manifests are copied into
# the tarball and published to a public registry, so a client's name or a `tools/`
# path in them reaches everyone. Prose review cannot hold this line, because the
# writing agent studies the previous release for voice and inherits its leaks.
echo "===== changelog-lint (published surface) ====="
node tools/changelog-lint.mjs

echo "===== changelog-lint selftest ====="
node tools/changelog-lint-selftest.mjs

log_dir="$(mktemp -d)"

echo "Building (lib -> docs) and linting in parallel..."
# ds-docs needs the built dist/ds, so build is ordered inside its own subshell;
# the artifact checks fail loud if a build silently produced nothing.
( bun run build:lib && [ -f dist/ds/package.json ] && bun run build:docs && [ -f dist/ds-docs/browser/index.html ] ) > "$log_dir/build.log" 2>&1 &  pid_build=$!
bun run check:design-sync               > "$log_dir/parity.log"    2>&1 &  pid_parity=$!
bun run check:manual-surface            > "$log_dir/surface.log"   2>&1 &  pid_surface=$!
bun run format                          > "$log_dir/format.log"    2>&1 &  pid_format=$!
bun run lint:styles                     > "$log_dir/stylelint.log" 2>&1 &  pid_styles=$!
bun run lint                            > "$log_dir/eslint.log"    2>&1 &  pid_eslint=$!

build_failed=0
wait "$pid_build" || build_failed=1

# Not gated — see the header. Waited on so its log is printed and its exit status is known.
parity_failed=0
wait "$pid_parity" || parity_failed=1

surface_failed=0
wait "$pid_surface" || surface_failed=1

lint_failed=0
wait "$pid_format" || lint_failed=1
wait "$pid_styles" || lint_failed=1
wait "$pid_eslint" || lint_failed=1

for name in build parity surface format stylelint eslint; do
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

if [ "$parity_failed" -ne 0 ]; then
  echo "design-sync parity reports drift in the PARKED React port (report-only, not failing the build)"
else
  echo "design-sync parity passed"
fi

if [ "$surface_failed" -ne 0 ]; then
  echo "manual-surface check failed"
  exit 1
fi
echo "manual surface passed"
