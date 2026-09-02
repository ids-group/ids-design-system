# Runbook — building and publishing to Claude Design

What Claude Design does with this: a design-system project holds our real
library, and its agent builds screens out of it. Not "in the style of" — a
preview card is a plain HTML page that loads four classic scripts in order,

```
_vendor/react.js → _vendor/react-dom.js → _ds_bundle.js → _preview/<Name>.js
```

and renders `React.createElement(window.IdsDs.<Component>)`. So the contract is:
**expose React components on `window.IdsDs`; React arrives separately as a
global.** The elements route emits wrappers around real custom elements, and nothing
inspects what else is inside the bundle — which is why an Angular runtime can
ride along inside it.

Project: **IDS Design System**, `455f9a87-1a6e-4b1d-a0e7-cf47ed772e63`
(`PROJECT_TYPE_DESIGN_SYSTEM` — immutable at creation; a regular project can
never be turned into one).

## Prerequisites

```sh
bun install --frozen-lockfile              # repo deps
node .design-sync/tools/bootstrap.mjs      # esbuild, sass, postcss, react + react-dom 18.3.1, @types/react(-dom) 19 into .ds-sync
```

React runtime 18.3.1 with types 19 is deliberate. 18.3.1 is what the design host itself
vendors — read from the project's `_vendor/react.js` on 2026-09-01, a React 18.3.1
development build — so the demo page exercises the same React the cards will run on.
That matters: on React 18 the wrapper can only assign inputs in a layout effect, after
the element has connected. The types are 19 because `inert` never landed in
`@types/react` 18.3.x, so an `^18` types pin fails the declaration emit.

`/design-login` authorizes the `DesignSync` tool. Read methods answer without a
permission prompt once it is granted; writes prompt.

> **The hand-written React port was deleted on 2026-09-01.** It was correct against 0.7.0 and 213
> divergences behind 0.11.1, and nobody was re-porting it, so it stopped being a fallback and became
> 11 000 lines of misleading code. `git log -- .design-sync/react-bindings` recovers it if it is ever
> wanted. Its parity gate went with it — there is no second implementation left to guard.
## The build chain

```sh
node .design-sync/elements/tools/gen.mjs             # reads the AST → registrations + typed wrappers
CI=true npx ng build ds-elements                     # AOT + Ivy linker (the slow step, ~8 s)
node .design-sync/elements/tools/build-bundle.mjs    # → dist/ds-bundle.js (IIFE, window.IdsDs, react from window)
bun run check:manual-surface                         # watch-list + doc coverage — see MANUAL-SURFACE.md
```

Nothing here is hand-maintained, so there is no parity gate to run: `gen.mjs`
regenerates the whole surface from source every time. What it cannot cover is in
`MANUAL-SURFACE.md`, and `check-manual-surface.mjs` is what keeps that list from
going stale.

Proof page: serve `.design-sync/elements/demo` over http (never `file://`) and
open it in a real browser tab — a background or headless tab freezes transitions
and reports stale layout, which has faked bugs here before.

## `config.json` (switched to the elements bundle 2026-09-01)

```jsonc
"entry":    ".design-sync/elements/dist/ds-bundle.js"
"cssEntry": "dist/ds-bundle.css"
"docsDir":  "../docs"
"buildCmd": "node .design-sync/elements/tools/gen.mjs && npx ng build ds-elements && node .design-sync/elements/tools/build-bundle.mjs"
```

**How the base was settled, rather than guessed.** `entry` is cwd-relative; `cssEntry` and
`docsDir` resolve against the nearest `package.json` above it. Under the deleted port that was
`.design-sync/react-bindings/`, which is why its own `dist/ds-all.css` and `../docs` worked. So
`.design-sync/elements/` was given its own `package.json` — same depth, same shape — and both
relative paths keep their meaning: `dist/ds-bundle.css` and `../docs` resolve to the files that
exist. All three paths verified present on disk after a full build.

`cssEntry` points at `ds-bundle.css`, not at Angular's own `styles.css`, because Angular writes the
faces as `./media/*.woff2` — correct beside its output, and 404 in the project, where the same eight
files already sit at `fonts/`. `build-bundle.mjs` writes the upload copy with those URLs rewritten.

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

## Why the upload is not in the pipeline

Investigated 2026-09-02. The short answer is that CI cannot hold the approval, and the
long answer is worth having, because the obvious workarounds each fail for a different
reason.

**The transport is a first-party MCP endpoint, not a CLI.** `DesignSync` posts to
`api.anthropic.com/v1/design/mcp` with the design OAuth access token as a bearer, and
refuses any other origin ("only reachable from api.anthropic.com; the current OAuth base
URL is not on the first-party allowlist"). Two sibling resources carry the permission
state: `GET /v1/design/grants` answers whether a project is granted, `POST` creates the
grant, and `/v1/design/consent` holds the account-level consent. Tokens refresh through
`POST /v1/oauth/token` with `grant_type=refresh_token`.

**Authorization is a personal claude.ai grant, established interactively.**
`/design-login` opens a browser. The result is machine-local, scoped
`user:design:read` + `user:design:write`, and it carries a refresh token — which is why
the CLI says a headless or SDK run on the SAME machine reuses it. It is not a service
credential, and there is no documented way to mint one: Anthropic's help centre describes
only the interactive route and documents no API or CI path at all.

**So a hosted runner cannot do it**, and not for one reason but three: the container is
ephemeral, so neither the authorization nor the project grant persists; `/design-login`
"cannot run in this non-interactive session"; and without it `DesignSync` is
"not supported through Bedrock, Vertex, or other third-party providers".

**Where the human boundary actually is.** `finalize_plan` is it — the tool calls the human
"the path-review boundary", and the approval both returns the `planId` writes require and
grants prompt-free writes to those paths for 15 minutes. A project write grant, once
established, lets later writes run without a fresh plan. The guard that refuses to create
that grant unattended is in the CLI's permission layer, immediately before the
`POST /v1/design/grants` — so the boundary is enforced client-side, and whether the server
requires the interactive consent independently was NOT measured (measuring it means writing
to a shared project). Stas 2026-09-02: recorded, and deliberately not built on. The review
of the write/delete list is the point of the step, not an obstacle to route around.

**What CI does instead, and it is most of the work.** `build-design-sync.sh` generates the
bundle, the cards, the previews and the docs, and fails when they drift — everything up to
the plan. The upload stays a local step with a human approving the paths.

## What lives remotely, and what this repo commits

The repo commits **sync inputs only** — `previews/`, `docs/`,
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
`AppShell` → `AppLayout` break. A re-sync has to go out.

The route is settled: asked on 2026-09-02 how he updates the design system, Misha answered that he
does it through the CLI, so the generated bundle is what he consumes and the upload is the delivery
path — not a hand-assembled project built through the web interface.
