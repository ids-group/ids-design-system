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
for the one-click pipelines only — two Bitbucket Repository Access Tokens:
`RELEASE_TOKEN` (`repository:write`, to push the bump commit, tag, and dev
back-sync) and `DOCS_DEPLOY_TOKEN` (`pipeline:write`, to start the `deploy-docs`
pipeline after publish). Split so each carries only the scope it needs.

Manual publish (fallback, requires an authenticated npm session):

```bash
npm run publish:manual
```

Pre-releases: `npm run release:beta` bumps to `x.y.z-beta.N`; the matching tag
publishes under the `next` dist-tag (never `latest`).

## Never in a published artefact

`CHANGELOG.md`, `README.md`, `design-system.md`, `components.md` and `migrations/` are
copied into the tarball, and the package publishes to the public npm registry; the
changelog is also a page on the docs site. So their reader is an external developer with
no access to this repository, our tracker, our decks or our other clients — and every
consumer reads about the others.

`npm run changelog-lint` fails the PR gate on the mechanical half of this list. The
judgment half is yours.

**Never write, in an entry, a manifest field or a shipped comment:**

- **A consumer or client name.** Say "a consumer", "an app", "a consumer's fork". Never
  name a file inside their tree. Descriptive stand-ins ("the ports", "the field app")
  are the same disclosure with the name filed off.
- **An internal tracker key** — `MBP-…`, `PIN-…`, `MM-…`.
- **A person's name.** "Found by X testing on a phone" → "Found while testing on a phone".
- **A path outside the published tree.** `src/lib/…`, `tools/…`, `presentations/…`,
  `docs/todo.md`, `.claude/…`, `migrations/AUTHORING.md`. The published tree holds
  `styles/`, `themes/` and `migrations/` and nothing else.
- **One of our npm scripts.** `npm run class-surface` does not exist for the reader —
  state the result, or an instruction they can follow, instead.
- **A symbol the package root does not export.** If it is not in `src/public-api.ts`, the
  reader cannot import it. Naming one is allowed only where the text also says it is
  internal — a subclasser meets these names in their own compiler errors.
- **An internal rule id** (`M0…`), a commit hash, or `HEAD`.
- **Decision archaeology.** How we chose, what we first believed, which alternative we
  rejected, that an earlier note of ours was wrong.
- **Our own process.** Release gates, the backlog, "the deck", "dogfooding", audits of
  our consumers, counts of our open items, self-criticism.
- **Measurement that proves we did the work.** Keep a number the reader needs to act on —
  a new default, a size that changed, a contrast floor, a before/after pair that shows
  the size of the defect. Cut the ones that only show we measured.
- **A change they cannot observe.** A docs-site-only fix is not an entry.

**Comments ship too.** `src/lib/styles` and `src/lib/themes` are copied verbatim, and a
`.ts` comment survives into the bundle with its JSDoc reaching the `.d.ts`. A component's
own `.scss` is the exception — its comments are compiled away.

**Two rules for editing an existing entry:**

- **Excise the leak, never the entry.** A leak usually sits inside something useful. Cut
  the clause, keep the substance, then re-read the sentence and confirm it still tells
  the reader what to do.
- **Prefer a substitution to a deletion** where the fact is real but the reference is
  internal: our rule name becomes the public standard, our source path becomes the
  published specifier.

**A manifest is held to the same confidentiality bar but a different usefulness bar.**
Its reader is an agent upgrading someone else's repo, so anything that helps it FIND the
affected code stays — `old`, `searchHints` and `detect` are pooled as locators by
`migration-lint`. `changelog-lint` knows this: inside those fields, and inside a
`deleteList` entry's `find`, an unexported symbol is allowed, because a grep pattern does
not have to be importable. Every other rule still applies there — a client name in a
`searchHint` is the same leak it would be anywhere else. What does not belong in a
manifest is internal work with no consumer action: if we refactored and nobody has to do
anything, it is not a migration item.
