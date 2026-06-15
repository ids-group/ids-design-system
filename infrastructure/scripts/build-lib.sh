#!/bin/sh
# Build the ds library into dist/ds (the artifact published to npm).
set -e

cd "$(dirname "$0")/../.."
. infrastructure/scripts/_setup.sh

setup_bun
install_deps

echo "Building ds library..."
bun run build
