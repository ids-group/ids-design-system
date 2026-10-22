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

**One card per PUBLISHED BLOCK**, not per component. A block is one demo with its
own `<h3 class="block-title">` and description, and the card keeps exactly that
block plus the chapter's heading, tag chip and lede. **Nothing is published by
default**: a block reaches Claude Design only when ds-docs marks it
`data-claude-design`. What to mark, what not to, and how many:
[`CARDS.md`](CARDS.md).

That granularity is forced by how the pane renders: it fits a card's declared
`viewport` into a fixed tile, so **the declared height IS the zoom level**.
Table's chapter measures 18919px and rendered as an illegible smudge; its 35
blocks are a few hundred pixels each and legible at the same scale as everything
else. Because the pane labels a card by its FILENAME,
`Table-Sortable-columns.html` puts the block's name outside the card too, which
is the only way to get text out there at all.

A chapter also documents the parts that only exist inside it — Menu covers
MenuItem and MenuDivider. Those blocks carry `data-for="menu-item"` in the
ds-docs template, which is how a block is attributed to a component; unmarked
blocks belong to the chapter's own. The API table and the lede go on a
component's first PUBLISHED card only: on Table that is one table instead of a
dozen copies.

A chapter whose blocks a card cannot address publishes as one whole-chapter
card, and only when its `<docs-section>` carries `data-claude-design` — the tall
shape this design exists to avoid. `check-manual-surface` reports
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
built card in a browser and writes `viewports.json`. It needs Chrome:
`build-design-sync.sh` installs chromium, runs it between two `build-upload` passes and
checks that every card ended up with a `viewport`.

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
node tools/check.mjs manual-surface                  # watch-list + doc coverage — see MANUAL-SURFACE.md
```

`npm run check:cards` is the whole chain above in one command, and the only form
that works in a tree which has not built yet: the check reads `gen/sections.json`,
which is gitignored.

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

## Freezing the cards (runs LAST)

```sh
node .design-sync/tools/snapshot-cards.mjs   # after build-cards and measure-cards
```

A card is a whole document that downloads the 2.12 MB bundle and boots its own
Angular application, and the pane shows a grid of them. `snapshot-cards` renders
each one in headless Chrome, waits for the card's own slicer to finish, and
writes the SETTLED DOM back with every `<script>` stripped. Nothing about the
rendering changes: Angular's emulated-encapsulation styles are already `<style>`
tags by then, and no colour is baked in — the theme tokens stay in
`_ds_bundle.css`, which the frozen card still links, so the pane switching
`data-theme` still recolours it.

What is lost is BEHAVIOUR, and two kinds of card need it, so two rules decide:

- **`live-chapters.txt`** names the chapters whose demo only exists once opened —
  toast, drawer, modal, popover, bottom-sheet, tree, loading-overlay, scrollbar.
- **Any card that renders a control whose PANEL is the point** is left live too:
  `ds-select`, `ds-multi-select`, `ds-autocomplete`, `ds-date-picker`,
  `ds-time-picker`, `ds-color-picker`, `ds-menu`, `ds-popover`. A dropdown is a CDK
  overlay — closed by default and portaled to `document.body` — so a card never
  displayed one even before the freeze; verified against the pre-freeze cards,
  which held no overlay either. What freezing took away was the click that opens
  it. Measured on the live cards afterwards: Select opens 20 options, MultiSelect
  6, Autocomplete 4, the date picker 42 day cells, the colour picker its panel.

That second rule is decided **from the rendered dom**, because a live card's own
HTML holds nothing but `<ds-docs-components-select>` — every element inside it
appears when Angular renders. Per CARD, not per chapter: the chapter list would
drag 130 cards live to keep the 85 that have a panel, and Table alone is 35 for 5.
What a run kept is written to `live-cards.txt`, which is what `check-frozen`
asserts against rather than re-deriving the rule; it prints the frozen and live counts.

Angular inlines a component's styles into every document that renders it, so the
same block arrived in card after card: 185 distinct blocks against 4005 tags.
Concatenated into `_ds_cards.css`, the browser fetches 428 KB once for the whole
grid instead of parsing 27 KB inside each card. **The union is taken over every
rendered card, in `cards.json` order** — not over the frozen ones only. A block
qualifies on carrying a scope attribute anywhere in it, and some carry
document-level rules alongside; building the union from the frozen subset dropped
what only a live card contributed and moved 80 frozen cards by 4–32px. So the
scoping is mostly true and not entirely, and the order is load-bearing: measure
after changing either. The `ng-cNNNN` ids are shortened across the sheet and every card
**in one pass**: the attribute IS the scope, so a rename reaching only one of them
silently unstyles the component. The scaffolding's own `/* … */` goes with the HTML
comments — 219 KB of the same three blocks. Tree 20 MB → 9.0 MB.

- **Run it LAST.** It rewrites cards in place, and any later `build-cards` run
  replaces them with live cards again.
- **`build-cards` wipes `upload/` with `rmSync`, and Windows refuses to delete a
  directory that is a process's CWD.** A shell left sitting inside it makes every
  later build fail with EPERM; with the output redirected that failure is silent,
  and `snapshot-cards` then re-freezes already-frozen cards into nonsense.
- **The output is reproducible, and that is deliberate.** Five lanes finish out of
  order, so the results are read back in `cards.json` order — otherwise the sheet's
  block order and the id renumbering differ every run, and all 376 cards plus the
  shared sheet rewrite with no change in them. Two consecutive freezes must leave
  `git status` empty.
- **A built section is not a settled one.** Components that measure write their
  result later — Table's sticky scrollbar pins `.scroll-wrap` to a computed height —
  and a chart draws at a fallback width until its ResizeObserver reports — so the
  tidy pass and the height probe share one wait (`tools/lib/settle.mjs`):
  `document.fonts.ready`, then a DOM that has not changed for 150 ms AND for 3
  frames, 300 frames at most. Neither half alone is enough: counting frames alone
  froze Table three different ways in three runs, and a quiet window alone can pass
  before a ResizeObserver or IntersectionObserver has delivered, since both deliver
  only in a frame.
- **Real clock, one window per card.** A virtual clock ran timers far ahead of the
  frames and froze rendering when its budget ran out, and a background tab gets no
  frames at all, so whether a chart had measured itself by the read was a race
  between lanes. Each card is its own window, and the tool reads it when the page
  says it has settled.

### The gates that keep CI from thawing it

`build-design-sync.sh` installs chromium when the image has none and fails without it, then runs
`measure-cards`, `snapshot-cards` and `check-frozen`. CI builds the cards FROZEN, the same tree
this repo commits.

- **`check-frozen.mjs` asserts the split.** Every card listed in `live-cards.txt` has a
  `<script>`, every other card has none. No browser needed.
- **`_ds_cards.css` comes only from `snapshot-cards`.** `build-cards` wipes the directory, so a
  build without the freeze leaves the file deleted; `build-design-sync.sh` fails when it is missing
  or empty.
- **Whitespace is collapsed IN THE PAGE, never by a regexp over the file.**
  `white-space: pre|pre-wrap|pre-line` is live in five places here, so the tidy
  pass walks text nodes and asks `getComputedStyle` which is which. A file-level
  `\n[ \t]*` regexp ate the indentation of the SQL sample in the mono type
  specimen and cost that card a line.
- **The `@dsCard` marker is re-prepended by hand**: a DOM dump starts at `<html>`,
  so without that the card vanishes from the next manifest.
- **Proof it changed no pixel**: render every card and compare against
  `viewports.json`. Measure only after `document.fonts.ready` — Mulish is taller
  than the fallback, and measuring before it lands under-reports by ~20px, which
  once produced 66 phantom "shrinks" and had also left 22 recorded heights short.
  Last run: 409 checked, 0 blank, 0 heights moved by more than 3px.

## Publishing

Read first, then lock the plan, then write — the tool enforces that order and
rejects any path outside the finalized plan.

```
list_projects → get_project → list_files      # build the structural diff
finalize_plan { writes, deletes, localDir }   # returns planId; the user sees the path list
write_files { planId, files: [{ path, localPath }] }
delete_files { planId, paths }
```

- **Send only what changed — `npm run design-sync-plan`.** It diffs `.design-sync/upload` between
  the commit recorded in `last-upload.json` and HEAD, and writes ready-to-send `write_files` batches
  under `.claude/local/design-sync-batches/`. `--all` for the whole tree, `--remote <list_files
  json>` to fold in anything the project is missing and count its orphans, `--record` after every
  batch has succeeded. It refuses to guess: an uncommitted `upload/` or a recorded commit that is no
  longer an ancestor both stop it and name `--all`.
- **The plan prints its own cost against a full send, and says when it is not worth it.** A release
  needs 5-9% of the tree; the widest range this repo has sits at 83%, and above 75% the run says
  SAVES NOTHING and names `--all` — a full send needs no pointer to be right and cannot miss a file.
- **`--remote` also writes the owner's delete request**,
  `.claude/local/design-sync-batches/owner-delete-request.txt`: `obsolete.txt` intersected with what
  `list_files` still shows, so a path the owner has already cleared is not asked for twice, and an
  orphan nobody declared is reported as a gap in the list rather than folded into the request.
- **`--remote` also blanks those paths**, in `blank-obsolete-N.json` batches of `{ path, data: "" }`
  sent with `write_files` under the same `planId`. `--record` keeps what was sent in
  `last-upload.json` (`blanked`), so a path is blanked once, not on every upload. Without `--remote`
  nothing is blanked: the owner may have deleted a path since, and blanking it would bring it back.
- **Do NOT compare content with the project to decide what to send.** `list_files` returns paths and
  nothing else — no size, no hash, no mtime — so a content comparison means `get_file` per path,
  which is 6.2 MB of card HTML through the session against 170 KB of path JSON for sending the whole
  tree blind. Reading it back to save writing costs 36× what it saves. The comparison that IS cheap
  is git, because the upload tree is committed.
- Prefer `localPath` over inline `data`: the tool reads, encodes and uploads
  straight from disk, so file contents never enter the model context.
- Max 256 files per call — split larger bundles across several `write_files`
  calls under the same `planId`.
- **`finalize_plan` takes GLOBS, and the whole tree fits in one pattern.**
  `writes: ["**/*"]` is accepted and authorises every path (`*` inside a segment,
  `**` any depth, at most three wildcards per pattern). Verified against the live
  project. Enumerating 410 paths per plan — which is what the first four uploads
  did — costs thousands of tokens for nothing; `write_files` still needs one entry
  per file, but the PLAN does not.
- **`delete_files` is refused on a project someone else owns**, verbatim:
  `bulk delete requires project ownership when called without a turn fence; this
project is owned by another user`. Writes are fine, deletes are not, so an
  obsolete path can only be BLANKED (`data: ""` is accepted and leaves a 0-byte
  file) until the owner deletes it. There is **no move or rename method** — the
  full surface is list_projects, get_project, list_files, get_file, finalize_plan,
  write_files, delete_files, register_assets, unregister_assets, create_project,
  report_validate — so "move it to a trashcan folder" means copy plus blank, which
  leaves the original in place and doubles the file count.
- **An obsolete path is blanked, and nothing is added** (Stas). A 0-byte file
  cannot mislead the agent reading the project, and it adds no file. A
  `[TO BE DELETED]` PREFIX on the name is a second file beside the first, not a
  rename. `register_assets` is the one lever on a card's DISPLAYED name, but
  registering an orphan publishes a dead card into the pane, which is worse than
  an invisible file.
- **On a project you do not own, every write is permanent.** A helper file added to
  carry a list of what to delete becomes an item on that list. The list belongs in
  the repo, and reaches the project only inside a file the build already writes.
- **Removing a file: every route tested, 2026-09-03, all closed.** The refusal
  wording invites two theories and both are wrong.
  - A finalize_plan that DECLARES the deletes does not lift it. The 403 names a
    "turn fence", which reads like something a plan could supply; a plan whose
    `deletes` held the three exact paths and no globs got the same 403. The fence
    is server-side.
  - "**bulk** delete" does not mean the batch is the problem. `delete_files` with a
    SINGLE path got the same 403.
  - `unregister_assets` SUCCEEDS on a non-owned project (`unregistered: 3`) and
    removes nothing: `get_file` still returned the file byte-for-byte afterwards.
    It clears a card registration, not a path — and these paths had none, so the
    success is empty.
  - There is no move or rename anywhere in the surface, so "rename it out of the
    way" is a second file plus a blanked first.
  - `get_project` reports `canEdit: true` with `ownerDisplayName: Mikhail`: write
    yes, delete no. `list_projects` shows no project this account owns, and
    `create_project` — a project the USER owns — is the only way to hold delete
    rights.
  - The closest thing to deletion that works is `write_files` with `data: ""`,
    which leaves a 0-byte file.
- **The obsolete-path pipeline, so the owner never hunts for files.**
  `.design-sync/obsolete.txt` (one project-relative path per line) is the source of
  truth in the REPO, and `build-cards` PRINTS it for whoever runs the upload,
  together with the instruction the owner pastes into Claude to delete exactly
  those paths. It must not reach the project: a section in the project's README
  is one more thing the owner has to clean up afterwards, and it was removed for
  that reason. The build FAILS if a listed path is one it still produces — that is
  a live card, not an obsolete file. Add the line when a card is renamed or
  withdrawn; remove it once `list_files` no longer shows the path.
- `create_project` makes a project the USER owns, which is the only way to get
  delete rights back.
- **A big `list_files` result is persisted to a file, not inlined** — the harness
  saves it under the session's `tool-results/` and prints the path. So the
  structural diff is a SCRIPT over that file, not something to reason about in
  prose or reconstruct from git history. Two earlier orphan counts were derived
  from "the committed tree equals the remote" and were over-inclusive by design;
  the file gives the exact set for a few hundred tokens.
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
  `templates` and `startingPoints` are in the schema and empty; the pane is
  server-side (the CLI binary carries only the tool description), so what fills
  them cannot be determined from here.
- **What the pane puts OUTSIDE a card: `name`, `subtitle` and a usage note.** A
  manifest entry carries `path`, `group`, `viewport`, `name` and `subtitle`;
  the tile shows `name` as its title and `subtitle` under it, and falls back to
  the filename only when `name` is absent. `build-manifest` reads both out of the
  card's own `@dsCard` marker, so the card file stays the single source. The
  subtitle renders to about 195 characters — the API stores at least 2003, so the
  limit is the pane's, not the schema's — and `build-cards` caps at 180, cutting
  at a sentence end where there is one. A marker value may not contain `>`: any
  parser scanning to the first one ends the comment there, which silently
  truncated 13 subtitles.
- **Usage notes are a FILE, not a field**: `<card>.prompt.md` beside the card,
  same basename. The pane shows it as "Usage notes for Claude". Nothing in the
  manifest points at it — the name is the whole convention.
- Never wholesale-replace: sync one component at a time and diff against
  `list_files` first.

## The credential CI would need, and what is actually missing

Corrected 2026-09-03. The earlier answer here was "no documented service credential, therefore
impossible", and the second half does not follow from the first. `~/.claude/.credentials.json` holds
a `designOauth` entry beside `claudeAiOauth`:

    accessToken   108 chars
    refreshToken  108 chars
    expiresAt     epoch ms - the live one lasted about a day
    scopes        ["user:design:read", "user:design:write"]
    clientId      36 chars

So the transport is reachable from anywhere that can hold a secret: refresh with `clientId` +
`refreshToken`, then speak MCP over HTTP to `https://api.anthropic.com/v1/design/mcp` with the
access token as a bearer. `/design-login` is only the interactive way to MINT that pair, not the
only way to use it.

Two things stand in the way, and neither is "no credential":

- **It is a person's identity, not a service's.** The token carries `user:design:write` for a real
  account, so a pipeline holding it acts as that person on every project they can write to. There is
  no service account to scope down to one project.
- **Refresh-token rotation is unverified.** If a refresh returns a NEW refresh token, CI must write
  it back somewhere durable; a pipeline secret it cannot update means the second run fails. Test
  this before building anything on it.

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

The repo commits the sync inputs — `docs/`, `elements/`, `tools/`,
`config.json`, `viewports.json`, `live-cards.txt`, `conventions.md` — **and** the built tree at
`upload/`, so a release commit carries exactly what a publish sends and CI can
fail on a stale copy. `_ds_manifest.json` is in there too since we started writing
it ourselves. `_ds_sync.json` is the only file in the project this repo does not
hold: it is the retired skill's own sync bookkeeping.

`_ds_sync.json` is the incremental-sync bookkeeping: `styleSha`, per-component
`renderHashes` and `sourceKeys`, `sourceHashes` per uploaded file, `keyRecipe`,
`bundleSha12`. It is what lets a re-sync touch only what changed.

## Current remote state (read 2026-09-04)

In sync. `list_files` and the built tree differ by exactly the three obsolete
paths in `obsolete.txt`, which only the owner can remove; every other path
matches, cards included.

The route is settled: asked on 2026-09-02 how he updates the design system, Misha answered that he
does it through the CLI, so the generated bundle is what he consumes and the upload is the delivery
path — not a hand-assembled project built through the web interface.
