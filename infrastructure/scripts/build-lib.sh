#!/bin/sh
# Build the ds library into dist/ds (the artifact published to npm).
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

echo "Building ds library..."
bun run build:lib

[ -f dist/ds/package.json ] || { echo "Expected artifact missing: dist/ds/package.json"; exit 1; }

# The package is one entry point per component, and the short names are added by a post-build
# step. Both can fail without failing the build, and the result installs and imports fine while
# placing every component in the initial bundle again — the exact defect the split removed. So
# assert the shape, not just that something was written.
entry_points=$(node -p "Object.keys(require('./dist/ds/package.json').exports).filter(k => k !== '.' && !k.includes('*') && k !== './package.json').length")
[ "$entry_points" -ge 100 ] || {
  echo "dist/ds declares only $entry_points subpath exports — expected the entry points plus their short names."
  exit 1
}
[ -f dist/ds/button/package.json ] || { echo "Missing the node10 stub for a short name: dist/ds/button/package.json"; exit 1; }
