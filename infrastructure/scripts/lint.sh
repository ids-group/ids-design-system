#!/bin/sh
# Run the three independent checks (prettier, stylelint, eslint) in parallel.
# Each job writes to its own log, printed grouped after all finish, so parallel
# output stays readable. The jobs are backgrounded directly (not through a pipe),
# so `wait <pid>` returns each job's real exit status instead of a pipe tail's.
#
# Usage: lint.sh [report-only]
#   (default)     fail the build if any check fails
#   report-only   print results but always exit 0 — used by the PR gate while the
#                 repo still carries pre-existing lint debt. Flip to blocking once
#                 the codebase is clean.
set -e

mode="${1:-blocking}"

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

log_dir="$(mktemp -d)"

echo "Running format / stylelint / eslint in parallel..."
bun run format      > "$log_dir/format.log"    2>&1 &  pid_format=$!
bun run lint:styles > "$log_dir/stylelint.log" 2>&1 &  pid_styles=$!
bun run lint        > "$log_dir/eslint.log"    2>&1 &  pid_eslint=$!

failed=0
wait "$pid_format" || failed=1
wait "$pid_styles" || failed=1
wait "$pid_eslint" || failed=1

for name in format stylelint eslint; do
  echo "===== $name ====="
  cat "$log_dir/$name.log"
done

if [ "$failed" -ne 0 ]; then
  if [ "$mode" = "report-only" ]; then
    echo "Lint found issues (report-only — not failing the build)"
    exit 0
  fi
  echo "Lint failed"
  exit 1
fi
echo "Lint passed"
