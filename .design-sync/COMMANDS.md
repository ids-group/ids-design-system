# Runbook — building and publishing to Claude Design

What Claude Design does with this: a design-system project holds our real
library, and its agent builds screens out of it. Not "in the style of" — the
agent's code renders `React.createElement(window.IdsDs.<Component>)`, with
React arriving separately as a global. So the contract is: **expose React
components on `window.IdsDs`; React arrives separately as a global.** The
elements route emits wrappers around real custom elements, and nothing inspects
what else is inside the bundle — which is why an Angular runtime can ride along
inside it.

A **card** is the other half, and it holds no React at all. It is a plain HTML
page with one element in it:

```
<script>window.__dsSectionsOnly = true</script>
<script src="_ds_bundle.js"></script>
…
<div class="ds-page"><ds-docs-components-button></ds-docs-components-button></div>
```

That element is the ds-docs section documenting the component — the same page
the design system's own site serves. So the showcase has ONE source, and it is
the one people look at every day. The flag is load-bearing: a section renders DS
components as ANGULAR components, and registering those same tags as custom
elements upgrades every host a second time.

**One card per BLOCK**, not per component. A block is one demo with its own
`<h3 class="block-title">` and description, and the card keeps exactly that block
plus the chapter's heading, tag chip and lede. 85 components, 314 cards.

That granularity is forced by how the pane renders: it fits a card's declared
`viewport` into a fixed tile, so **the declared height IS the zoom level**.
Table's chapter measures 18919px and rendered as an illegible smudge; its 35
blocks are a few hundred pixels each and legible at the same scale as everything
else. Nothing is cut from ds-docs — every title, description and demo survives,
distributed across cards — and because the pane labels a card by its FILENAME,
`Table-Sortable-columns.html` puts the block's name outside the card too, which
is the only way to get text out there at all.

A chapter also documents the parts that only exist inside it — Menu covers
MenuItem and MenuDivider. Those blocks carry `data-for="menu-item"` in the
ds-docs template, which is how a block is attributed to a component; unmarked
blocks belong to the chapter's own. The API table goes on a component's FIRST
card only: on Table that is one table instead of thirty-five copies.

A component whose chapter marks no block for it falls back to one whole-chapter
card — the tall shape this design exists to avoid. `check-manual-surface` reports
by measured HEIGHT rather than by markup, because height is the actual risk: any
card over 3000px is named on every run.

Cards are listed in the manifest in the READING order of the docs site — groups
as GROUP_PAGES lists them, chapters within a group, blocks within a chapter.
`build-cards` writes that order to `elements/gen/cards.json` and `build-manifest`
follows it; walking the built tree instead yields alphabetical, which put the
Buttons chapter's opening block in the middle of its own group.

The card's **group** is the ds-docs group page that renders its section, not a
`category` in the doc's front matter. Those were two hand-kept opinions and they
disagreed — Container, Inline, Stack and Divider were filed under `layout` /
`data-display` while ds-docs puts all four under Foundations.

Heights are generated: `node .design-sync/tools/measure-cards.mjs` loads every
built card in a browser and writes `viewports.json`. It needs Chrome, so it runs
locally and is not in `build-upload`; CI checks that every card ended up with a
`viewport`.

Everything the project holds now has a source here. `.thumbnail` — the project's
cover image — was the last file that did not: a WebP that arrived with the
hand-made upload, so a wipe-and-reupload would have blanked the tile with nothing
to restore it from. It lives at `assets/thumbnail.webp` and is copied into the
tree like the pasted images. Re-rendering it from a card is still open (todo).

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

## Composing with the wrappers: pass state as an initial prop

**Never toggle a gate after mount.** A slot behind an `@if` works — nested DS components
included — as long as the gate is true when the element connects; Angular Elements applies
initial inputs in the same microtask, so nothing is detached. Toggle it later and the projected
wrapper survives while the custom elements inside it are destroyed
([angular/angular#38962](https://github.com/angular/angular/issues/38962), ~10 ms). Concretely:

- an overlay sets `staticPreview` (or `open`) at creation, not on a click;
- a `ds-table` that shows `[bulk-actions]` passes `selectedIds` at creation.

This is a constraint on the AGENT's compositions, not on the cards: a card is an Angular section,
where the ordinary change-detection rules apply and none of this bites.

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
  from each card's first-line `<!-- @dsCard group="…" -->` comment, compiled
  into `_ds_manifest.json`. Only hand-authored projects without those markers
  need explicit registration.
- **We write `_ds_manifest.json` ourselves** (`build-manifest.mjs`). The app
  compiles one from the markers on its own self-check, but the copy on the
  project had been written by the retired `/design-sync` CLI
  (`"source": "design-sync-cli"`) and nothing regenerated it: it still listed 79
  components including `AppShell`, renamed three releases earlier, and none of the
  cards added since. The pane indexes from the manifest and reads a card only for
  its content — so a stale index shows a stale project no matter what else is
  uploaded, which is why refreshed cards kept rendering the old preview grid.
  A card entry holds only `path`, `group` and `viewport`: there is no field for a
  name, a subtitle or any prose, and the pane labels a card by its FILENAME.
  `templates` and `startingPoints` are in the schema and empty; the pane is
  server-side (the CLI binary carries only the tool description), so what fills
  them cannot be determined from here.
- Never wholesale-replace: sync one component at a time and diff against
  `list_files` first.

## What lives remotely, and what this repo commits

The repo commits the sync inputs — `docs/`, `elements/`, `tools/`,
`config.json`, `viewports.json`, `conventions.md` — **and** the built tree at
`upload/`, so a release commit carries exactly what a publish sends and CI can
fail on a stale copy. `_ds_manifest.json` and `_ds_sync.json` are the only files
in the project this repo does not hold: the app compiles the first from the
`@dsCard` markers, and the second is the skill's own sync bookkeeping.

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
