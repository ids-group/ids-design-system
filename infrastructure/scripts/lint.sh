#!/bin/sh
# Run prettier, then stylelint, then eslint — STRICTLY in that order, one at a
# time (never in parallel). All three run even if an earlier one fails, so a
# single pass reports every issue; the script then fails if any check failed.
#
# Usage: lint.sh [report-only]
#   (default)     fail the build if any check fails
#   report-only   print results but always exit 0 — used by the PR gate while the
#                 repo still carries pre-existing lint debt. Flip to blocking once
#                 the codebase is clean.
set -eu

mode="${1:-blocking}"

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

failed=0

# Run one check to completion, print its result, record failure. Wrapped in `if`
# so a non-zero exit is captured (not killed by `set -e`) and the next check
# still runs in turn.
run_check() {
  label="$1"
  script="$2"
  echo "===== $label ====="
  if bun run "$script"; then
    echo "✔ $label passed"
  else
    echo "✘ $label failed"
    failed=1
  fi
  echo ""
}

# Strict sequence — each finishes before the next starts:
run_check prettier  format
run_check stylelint lint:styles
run_check eslint    lint

if [ "$failed" -ne 0 ]; then
  if [ "$mode" = "report-only" ]; then
    echo "Lint found issues (report-only — not failing the build)"
    exit 0
  fi
  echo "Lint failed"
  exit 1
fi
echo "Lint passed"
