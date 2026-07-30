# Contributing

Maintainer documentation for the IDS Design System. This file stays in the
repository and is **not** published to npm.

## Development

This repo contains the library (`src/`) and a documentation app (`ds-docs/`). The
docs app is published live at https://ids-ds.proto.ids-group.co.uk/.

Develop on the `dev` branch (the default). `main` is release-only — it changes
only through the release flow below, which also refreshes the live docs.

```bash
npm run build:lib    # build the library into dist/ds
npm start            # serve the docs app
npm run build:docs   # build the docs app
```

## Releasing

Releases follow [SemVer](https://semver.org): `fix` → patch, new backwards-compatible
features → minor, breaking changes (API or visual) → major. A new Angular major
always means a new package major. See `CHANGELOG.md` for history.

Before releasing, add your notes to the `## Unreleased` section of `CHANGELOG.md`
on `dev`. Then release one of two ways.

### Option A — one-click in Bitbucket (recommended)

In the Bitbucket UI: **Pipelines → Run pipeline → branch `dev` →** pick
`release-patch`, `release-minor`, `release-major`, or `release-beta`. CI merges
`dev` → `main`, bumps the version, stamps the CHANGELOG, commits, pushes `main` +
a `vX.Y.Z` tag, and back-merges `main` → `dev` — no local tooling needed. The tag
push triggers the `Publish to npm` pipeline, which publishes and then starts the
`deploy-docs` pipeline (three runs: release, publish, deploy-docs). `## Unreleased`
must be filled first; preflight fails the pipeline early otherwise.

### Option B — locally

Merge `dev` → `main` yourself first, then from a clean, in-sync `main`:

```bash
npm run release:patch   # 0.1.0 -> 0.1.1  bugfixes
npm run release:minor   # 0.1.0 -> 0.2.0  new components/inputs/tokens
npm run release:major   # 0.x   -> 1.0.0  breaking changes
npm run release:beta    # 0.2.0 -> 0.2.1-beta.0  pre-release

git push origin main --follow-tags   # the tag push triggers CI publish
```

Each `release:*` runs preflight checks first (must be on a clean, in-sync `main`
with a non-empty `## Unreleased` CHANGELOG section), bumps the version, stamps the
CHANGELOG (`## Unreleased` → `## x.y.z — date`, opening a fresh Unreleased), and
creates a `release: x.y.z` commit plus a `vX.Y.Z` git tag locally — it does **not**
publish. The tag push to Bitbucket runs `bitbucket-pipelines.yml`, which builds
`dist/ds` and publishes it through `infrastructure/scripts/publish.sh`. That script
refuses to publish if the tag does not match the built version or if the version is
already on npm.

Bypass preflight in emergencies with `SKIP_PREFLIGHT=1 npm run release:patch`.

CI auth uses two Secured repository variables: `NPM_TOKEN` (npm granular access
token, read+write on `@ids-group-ltd`, "Bypass 2FA" enabled) for publishing, and —
for the one-click pipelines only — `RELEASE_TOKEN`, a Bitbucket Repository Access
Token with `repository:write` (push the bump commit, tag, and dev back-sync) and
`pipeline:write` (start the `deploy-docs` pipeline after publish).

Manual publish (fallback, requires an authenticated npm session):

```bash
npm run publish:manual
```

Pre-releases: `npm run release:beta` bumps to `x.y.z-beta.N`; the matching tag
publishes under the `next` dist-tag (never `latest`).
