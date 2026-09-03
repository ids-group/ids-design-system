#!/bin/sh
# prettier, then stylelint, then eslint — one at a time, never in parallel, and all three run
# even when an earlier one fails so a single pass reports everything.
#
# Usage: lint.sh [report-only] — report-only always exits 0, for the PR gate while the repo
# carries pre-existing debt. Flip it to blocking once the codebase is clean.
set -eu

mode="${1:-blocking}"

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

failed=0

# Wrapped in `if` so a non-zero exit is captured rather than killed by `set -e`, and the next
# check still runs.
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
