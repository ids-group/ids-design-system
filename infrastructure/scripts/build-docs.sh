#!/bin/sh
# Build the ds-docs showcase into dist/ds-docs.
#
# ds-docs imports the library through the `ds` tsconfig path, so dist/ds must exist first. The
# dist-ds cache is keyed on the library sources, so any lib change busts it.
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

if [ -f dist/ds/package.json ]; then
  echo "ds library cache hit - skipping rebuild"
else
  echo "Building ds library..."
  bun run build:lib
fi

echo "Building ds-docs..."
bun run build:docs

[ -f dist/ds-docs/browser/index.html ] || { echo "Expected artifact missing: dist/ds-docs/browser/index.html"; exit 1; }
