# CI/CD scripts

Build and lint logic for the pipeline lives here as POSIX `sh` scripts so it can
be read, reviewed, and run locally — `bitbucket-pipelines.yml` only wires images,
caches, and triggers. This mirrors the proven setup in pinkmoon-platform,
adapted to a design-system repo (library `ds` + showcase `ds-docs`).

## Scripts

| Script         | Purpose                                                                 |
|----------------|-------------------------------------------------------------------------|
| `_setup.sh`    | **Sourced** helper: `setup_bun` (bootstrap + cache bun) and `install_deps` (`bun install --frozen-lockfile`). |
| `build-lib.sh` | Build the `ds` library → `dist/ds` (the npm artifact).                  |
| `build-docs.sh`| Ensure `dist/ds` exists (cache hit or build), then build `ds-docs` → `dist/ds-docs`. |
| `lint.sh`      | Run prettier + stylelint + eslint in parallel. `lint.sh report-only` prints results but never fails. Standalone — handy locally. |
| `ci-pr.sh`     | PR validation in one container: build ∥ design-sync parity (`check:design-sync` — see `.design-sync/NOTES.md`), both hard gates, ∥ lint (report-only), after a single install. Used by the `validate` pipeline. |
| `publish.sh`   | The single npm publisher. Guards: tag↔version match (`BITBUCKET_TAG`), refuse double-publish, prereleases → `next` dist-tag. Called by the tag (`v*`) pipeline after `build-lib.sh`, for both one-click and local releases. |
| `cut-release.sh`| One-click release `<patch\|minor\|major\|beta>`: merge `dev`->`main` + bump + stamp CHANGELOG + commit + tag + push `main` + tag, then back-merge `main`->`dev`. Does **not** publish — the pushed tag triggers the `v*` pipeline. Run by the `release-*` custom pipelines. Needs `RELEASE_TOKEN`. No install/build. |
| `trigger-docs-deploy.sh`| Final step of the `v*` pipeline: after `publish.sh`, start the `deploy-docs` custom pipeline via the Bitbucket REST API. Skips prereleases. Needs `RELEASE_TOKEN` with `pipeline:write`. |

Invoke as `sh infrastructure/scripts/<name>.sh` (no executable bit needed, which
Windows checkouts cannot set reliably).

## Why bun, not `npm ci`

`npm ci` fails under alpine/musl on the `@emnapi/*` optional peer-deps of
`@napi-rs/wasm-runtime` ("Missing from lock file"). bun resolves optional peers
tolerantly and installs faster. The bun binary is cached in `~/.bun/bin`, so the
one-time `npm i -g bun` bootstrap only runs on a cold cache.

Installs use the committed **`bun.lock`** with `--frozen-lockfile` for
reproducible builds (it pins cross-platform, incl. the linux/musl optionals).
Regenerate it with `bun install` whenever dependencies change. `package-lock.json`
is kept for npm/Dependabot consumers — bun prefers `bun.lock`.

`_setup.sh` is **sourced**, not executed: a child process cannot export `bun`
onto the calling shell's `PATH`.

## Build order is a dependency chain

`ds-docs` imports the library through the `ds` tsconfig path, which resolves to
the built `dist/ds` — not the source. So the library is always built before the
docs; they cannot build in parallel. The parallelism we do have is build ∥ the
lint checks, all inside one container (`ci-pr.sh`).

## Pipeline overview (`bitbucket-pipelines.yml`)

All pipelines are **manual** (`custom`) or tag-triggered — nothing runs on every
PR, since each step spins up a fresh container and the runner minutes aren't
worth auto-firing on our cadence.

- **Custom `validate`**: PR validation, run on demand. One container builds
  (hard gate) and lints (**report-only**) in parallel. Lint is report-only
  because the repo still carries pre-existing lint debt (prettier/stylelint/eslint
  were added recently and not yet applied repo-wide); make it blocking once the
  codebase is clean. To run it automatically on PRs again, add a top-level
  `pull-requests:` section pointing at `ci-pr.sh`.
- **Tags** (`v*`): build the library (`build-lib.sh`), publish it (`publish.sh`),
  then start the docs deploy (`trigger-docs-deploy.sh`, which POSTs to the Bitbucket
  API to run the `deploy-docs` pipeline). Fires whenever a `vX.Y.Z` tag is pushed.
- **Custom `release-{patch,minor,major,beta}`**: one-click release from the UI, run
  from `dev`. `cut-release.sh` merges `dev`->`main`, bumps, stamps the CHANGELOG,
  commits, tags, pushes `main` + tag, then back-merges `main`->`dev`. It does **not**
  publish — the pushed tag triggers the `v*` pipeline. Needs Secured `RELEASE_TOKEN`
  (`repository:write` + `pipeline:write`). Local `npm run release:*` is the fallback
  (merge `dev`->`main` yourself first).
- **Custom `deploy-docs`**: build and deploy the showcase to the IDS prototypes
  CDN.

## Caches

`bun-bin` / `bun-cache` (installs), `angular` (`.angular/cache`, speeds up
`ng build`), and `dist-ds` (`dist/ds` keyed on library sources, lets a docs-only
change reuse the built library).
