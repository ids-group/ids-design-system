# CI/CD scripts

Build and lint logic for the pipeline lives here as POSIX `sh` scripts so it can
be read, reviewed, and run locally — `bitbucket-pipelines.yml` only wires images,
caches, and triggers. This mirrors the proven setup in pinkmoon-platform,
adapted to a design-system repo (library `ds` + showcase `ds-docs`).

## Scripts

| Script                     | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_setup.sh`                | **Sourced** helper: `setup_bun` (bootstrap + cache bun) and `install_deps` (`bun install --frozen-lockfile`).                                                                                                                                                                                                                                                                                                                                                                                              |
| `build-lib.sh`             | Build the `ds` library → `dist/ds` (the npm artifact).                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `build-docs.sh`            | Ensure `dist/ds` exists (cache hit or build), then build `ds-docs` → `dist/ds-docs`.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `lint.sh`                  | Run prettier, then stylelint, then eslint, one at a time. `lint.sh report-only` prints results but never fails. Standalone — handy locally.                                                                                                                                                                                                                                                                                                                                                                           |
| `ci-pr.sh`                 | PR validation in one container: build (hard gate) ∥ lint (report-only), plus the manifest/changelog/catalogue checks up front. Used by the `validate` pipeline. Carries no design-sync gate: `check-manual-surface` reads the gitignored `elements/gen/`, which nothing here builds — it runs in `build-design-sync.sh`, and locally as `npm run check:cards`.                                                                                                                                              |
| `publish.sh`               | The single npm publisher. Guards: tag↔version match (`BITBUCKET_TAG`), refuse double-publish, prereleases → `next` dist-tag, and a stable release moves an older `next` up to itself, a re-run of its tag pipeline included. Called by the tag (`v*`) pipeline after `build-lib.sh`, for both one-click and local releases.                                                                                                                                                                                                                                                                                |
| `cut-release.sh`           | One-click release `<patch\|minor\|major\|beta>`: merge `dev`->`main` + bump + stamp CHANGELOG + commit + tag + push `main` + tag, then back-merge `main`->`dev`. Does **not** publish — the pushed tag triggers the `v*` pipeline. Run by the `release-*` custom pipelines. Needs `RELEASE_TOKEN`. Installs, because the preflight compiles the Sass; builds nothing.                                                                                                                                                                                       |
| `build-design-sync.sh`     | Build the Claude Design bundle and the tree uploaded with it, then gate both. **In the pipeline it commits `.design-sync/upload` to main** as the release bot; run by hand it fails on a stale tree instead of pushing. The tree goes stale on every release because the release commit carries no rebuilt tree; this step rebuilds it for the new version. Needs `RELEASE_TOKEN`, and installs git — the image has none, which is why the staleness check silently passed for its whole life. |
| `sync-dev.sh`              | Step of `after-release`: merge main into dev, once, after every step that writes to main.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `mirror-github.sh`         | The `mirror-github` pipeline: gitleaks over the history of every Bitbucket branch and tag, then push them all to `github.com/ids-group/ids-design-system` with `--prune`, so the public mirror is an exact copy. A finding stops the push; a false positive goes into `.gitleaksignore` by fingerprint. Needs `RELEASE_TOKEN` and `GITHUB_MIRROR_TOKEN` (fine-grained, `contents:write` on that repo only).                                                                                                  |
| `trigger-pipeline.sh`      | `trigger-pipeline.sh <pattern> <branch>`: start a custom pipeline via the Bitbucket REST API. Needs `DOCS_DEPLOY_TOKEN` (a dedicated token scoped to `pipeline:write`).                                                                                                                                                                                                                                                                                                                                    |
| `trigger-after-release.sh` | Final step of the `v*` pipeline: after `publish.sh`, start the `after-release` custom pipeline through `trigger-pipeline.sh`. Skips prereleases.                                                                                                                                                                                                                                                                                                                                                         |

Invoke as `sh infrastructure/scripts/<name>.sh` (no executable bit needed, which
Windows checkouts cannot set reliably).

## Why bun, not `npm ci`

`npm ci` fails under alpine/musl on the `@emnapi/*` optional peer-deps of
`@napi-rs/wasm-runtime` ("Missing from lock file"). bun resolves optional peers
tolerantly and installs faster. The bun binary is cached in `~/.bun/bin`, so the
one-time `npm i -g bun` bootstrap only runs on a cold cache.

Installs use the committed **`bun.lock`** with `--frozen-lockfile` for
reproducible builds (it pins cross-platform, incl. the linux/musl optionals).
Regenerate it with `bun install` whenever dependencies change, and the five cache
keys are keyed on that file because it is the one `--frozen-lockfile` reads.

`package-lock.json` is kept only for a developer who installs with npm: it is not
in the published tarball, and Dependabot does not read it here — that is a GitHub
service and this repo has no `.github`. Regenerate it in the same commit
(`npm install --package-lock-only`, which leaves bun's `node_modules` alone), or
the two locks drift. They cannot be made identical: the `@emnapi` optional-peer
family npm and bun resolve differently is the same family that breaks `npm ci`
under musl.

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
  then start the after-release work (`trigger-after-release.sh`, which POSTs to the
  Bitbucket API to run the `after-release` pipeline). Fires whenever a `vX.Y.Z` tag
  is pushed.
- **Custom `release-{patch,minor,major,beta}`**: one-click release from the UI, run
  from `dev`. `cut-release.sh` merges `dev`->`main`, bumps, stamps the CHANGELOG,
  commits, tags, pushes `main` + tag, then back-merges `main`->`dev`. It does **not**
  publish — the pushed tag triggers the `v*` pipeline. Needs Secured `RELEASE_TOKEN`
  (`repository:write`); the `v*` step also needs `DOCS_DEPLOY_TOKEN` (`pipeline:write`)
  for the after-release trigger. Local `npm run release:*` is the fallback (merge
  `dev`->`main` yourself first).
- **Custom `after-release`**: everything regenerated from source once a release is out. Builds the
  ds-docs showcase, then runs the CDN deploy and the Claude Design bundle **in parallel**, then
  `sync-dev.sh` merges `main` into `dev`, and the last step starts `mirror-github`. The bundle is paired with the deploy rather than with the
  docs build because a parallel group must finish before the next step: pairing it with the build
  would let a bundle failure block the deploy. Started by the `v*` pipeline, also runnable by hand.
- **Custom `mirror-github`**: `mirror-github.sh` in the gitleaks image - scan every branch and tag
  for secrets, then copy them to the public GitHub mirror. Started by `after-release`, also
  runnable by hand to sync without a release.
  Regeneration lives here rather than in `cut-release.sh` on purpose: that script pushes `main`
  halfway through, so it must stay a git-and-node step that cannot fail on an install or a build.

## Caches

`bun-bin` / `bun-cache` (installs), `angular` (`.angular/cache`, speeds up
`ng build`), and `dist-ds` (`dist/ds` keyed on library sources, lets a docs-only
change reuse the built library).
