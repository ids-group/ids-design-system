#!/usr/bin/env bash
# CI gate: install, lint (incl. Sheriff module boundaries), and build.
# Run locally with: bash infrastructure/scripts/ci-validate.sh
set -euo pipefail

echo "▶ Installing dependencies (bun, frozen lockfile)…"
bun install --frozen-lockfile

echo "▶ Prettier (check)…"
bun run format

echo "▶ Stylelint…"
bun run lint:styles

echo "▶ ESLint + Sheriff module boundaries…"
bun run lint

echo "▶ Build (production)…"
bun run build

echo "✔ Validation passed."
