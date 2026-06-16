# Changelog

All notable changes to `@ids-group-ltd/ids-design-system` are documented here.

Versioning follows [SemVer](https://semver.org). Mapping from commit types:
`fix` → patch, `feat` → minor, breaking change (API or visual) → major.
While the package is on `0.x`, minor releases may contain breaking changes.

## Unreleased

- Added a `homepage` field linking the live docs/showcase, so the npm package page
  points to it.
- Release flow: the `v*` tag pipeline is now the single npm publisher. The one-click
  `release-*` pipelines (script renamed `ci-release.sh` → `cut-release.sh`) only bump,
  stamp the CHANGELOG, tag, and push `main`; the pushed tag triggers the publish.
  No library code changed since 0.2.0.

## 0.2.0 — 2026-06-16

- Relicensed from proprietary (UNLICENSED) to MIT.
- Release tooling: preflight checks, automatic CHANGELOG stamping, and CI publish
  guards (tag↔version, double-publish protection); added a `beta` pre-release channel.
- One-click release pipelines (`release-patch|minor|major|beta`) that bump, tag,
  push, and publish from Bitbucket CI; local `npm run release:*` kept as a fallback.

## 0.1.0 — 2026-06-12

Initial public release.

- 45+ standalone Angular components: buttons, forms, overlays, navigation, data display
- Three-tier token architecture: palette → semantic theme → geometry/typography/motion tokens
- Default theme and palette, swappable by consumers
- Bundled Mulish and JetBrains Mono fonts
- SCSS sources shipped in the package (`styles/`, `themes/`)
