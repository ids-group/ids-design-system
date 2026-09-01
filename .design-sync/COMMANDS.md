# Runbook — building and publishing to Claude Design

What Claude Design does with this: a design-system project holds our real
library, and its agent builds screens out of it. Not "in the style of" — a
preview card is a plain HTML page that loads four classic scripts in order,

```
_vendor/react.js → _vendor/react-dom.js → _ds_bundle.js → _preview/<Name>.js
```

and renders `React.createElement(window.IdsDs.<Component>)`. So the contract is:
**expose React components on `window.IdsDs`; React arrives separately as a
global.** Both routes in this repo satisfy it — the hand-port emits those
components directly, the elements route emits wrappers around real custom
elements. Nothing inspects what else is inside the bundle.

Project: **IDS Design System**, `455f9a87-1a6e-4b1d-a0e7-cf47ed772e63`
(`PROJECT_TYPE_DESIGN_SYSTEM` — immutable at creation; a regular project can
never be turned into one).

## Prerequisites

```sh
bun install --frozen-lockfile              # repo deps
node .design-sync/tools/bootstrap.mjs      # esbuild, sass, react 18.3.1 + @types/react 19 into .ds-sync
```

React runtime 18.3.1 with types 19 is deliberate: 18.3.1 is what the custom-element
event wiring is written against, but `inert` never landed in `@types/react` 18.3.x,
so an `^18` types pin fails the declaration emit.

`/design-login` authorizes the `DesignSync` tool. Read methods answer without a
permission prompt once it is granted; writes prompt.

> **Route B is the chosen one since 2026-09-01.** Route A (the hand-written port) is parked:
> intact, correct against 0.7.0, 213 divergences against 0.11.1, and its gate is report-only.
> It stays the fallback if the elements bundle is ever rejected by the design host.

## Route A — the hand-written React port

```sh
node .design-sync/tools/build-css.mjs        # ds.scss + every component sheet, re-scoped onto ds-* tags
node .design-sync/tools/build-bindings.mjs   # esbuild bundle + tsc declarations
bun run check:design-sync                    # parity gate — MUST be green before publishing
```

`build-css.mjs` and `build-bindings.mjs` both succeed over a stale binding layer,
so a green build here proves nothing about correctness. `check-parity.mjs` is the
only thing that does. After a deliberate re-port, `--bless` to re-record the
hashes; blessing without reading the diff defeats the mechanism.

## Route B — the `@angular/elements` bundle

```sh
node .design-sync/elements/tools/gen.mjs             # reads the AST → registrations + typed wrappers
CI=true npx ng build ds-elements                     # AOT + Ivy linker (the slow step, ~8 s)
node .design-sync/elements/tools/build-bundle.mjs    # → dist/ds-bundle.js (IIFE, window.IdsDs, react external)
bun run check:manual-surface                         # watch-list + doc coverage — see MANUAL-SURFACE.md
```

Nothing here is hand-maintained, so there is no parity gate to run: `gen.mjs`
regenerates the whole surface from source every time. What it cannot cover is in
`MANUAL-SURFACE.md`, and `check-manual-surface.mjs` is what keeps that list from
going stale.

Proof page: serve `.design-sync/elements/demo` over http (never `file://`) and
open it in a real browser tab — a background or headless tab freezes transitions
and reports stale layout, which has faked bugs here before.

## `config.json` points at route B (switched 2026-09-01)

```jsonc
"entry":    ".design-sync/elements/dist/ds-bundle.js"
"cssEntry": "dist/browser/styles.css"
"docsDir":  "../docs"
"buildCmd": "node .design-sync/elements/tools/gen.mjs && npx ng build ds-elements && node .design-sync/elements/tools/build-bundle.mjs"
```

**How the base was settled, rather than guessed.** `entry` is cwd-relative; `cssEntry` and
`docsDir` resolve against the nearest `package.json` above it. Under route A that was
`.design-sync/react-bindings/`, which is why `dist/ds-all.css` and `../docs` worked. So
`.design-sync/elements/` was given its own `package.json` — same depth, same shape — and both
relative paths keep their meaning: `dist/browser/styles.css` and `../docs` resolve to the files
that exist. All three paths verified present on disk after a full build.

`check-manual-surface.mjs` fails if that `package.json` goes missing or its version drifts from
the root — it is load-bearing for path resolution and nothing else would notice.

## Writing a preview: pass state as an initial prop

**Never toggle a gate after mount.** A slot behind an `@if` works — nested DS components
included — as long as the gate is true when the element connects; Angular Elements applies
initial inputs in the same microtask, so nothing is detached. Toggle it later and the projected
wrapper survives while the custom elements inside it are destroyed
([angular/angular#38962](https://github.com/angular/angular/issues/38962), ~10 ms). Concretely:

- an overlay preview sets `staticPreview` (or `open`) at creation, not on a click;
- a `ds-table` preview that shows `[bulk-actions]` passes `selectedIds` at creation;
- previews render with their props set, so this is satisfied by construction — it only bites an
  interactive composition.
## Publishing

Read first, then lock the plan, then write — the tool enforces that order and
rejects any path outside the finalized plan.

```
list_projects → get_project → list_files      # build the structural diff
finalize_plan { writes, deletes, localDir }   # returns planId; the user sees the path list
write_files { planId, files: [{ path, localPath }] }
delete_files { planId, paths }
```

- Prefer `localPath` over inline `data`: the tool reads, encodes and uploads
  straight from disk, so file contents never enter the model context.
- Max 256 files per call — split larger bundles across several `write_files`
  calls under the same `planId`.
- `register_assets` is **legacy**. The Design System pane builds its card index
  from each preview HTML's first-line `<!-- @dsCard group="…" -->` comment,
  compiled into `_ds_manifest.json`. Only hand-authored projects without those
  markers need explicit registration.
- Never wholesale-replace: sync one component at a time and diff against
  `list_files` first.

## What lives remotely, and what this repo commits

The repo commits **sync inputs only** — `react-bindings/`, `previews/`, `docs/`,
`elements/`, `tools/`, `config.json`, `conventions.md`. Everything with a `_`
prefix in the project is an **output the publish step generates**:
`_ds_bundle.js`, `_ds_bundle.css`, `_ds_manifest.json`, `_ds_sync.json`,
`_preview/*.js`, `_vendor/react*.js`. Their absence from this directory is by
design and is not evidence that anything drifted.

`_ds_sync.json` is the incremental-sync bookkeeping: `styleSha`, per-component
`renderHashes` and `sourceKeys`, `sourceHashes` per uploaded file, `keyRecipe`,
`bundleSha12`. It is what lets a re-sync touch only what changed.

## Current remote state (read 2026-09-01)

Last updated 2026-07-31, so it is one month behind: **79 components against 85**,
`AppShell` under its pre-rename name, `sourceKeys` from before the
`AppShell` → `AppLayout` break. A re-sync has to go out with whichever route wins.
