#!/bin/sh
# Build the ds-docs showcase into dist/ds-docs.
#
# ds-docs imports the library via the `ds` tsconfig path -> dist/ds, so the
# library must exist first. The rebuild is skipped on a dist-ds cache hit; that
# cache is keyed on the library sources, so any lib change busts it and forces a
# fresh build.
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

if [ -f dist/ds/package.json ]; then
  echo "ds library cache hit - skipping rebuild"
else
  echo "Building ds library..."
  bun run build
fi

echo "Building ds-docs..."
bun run build:docs
