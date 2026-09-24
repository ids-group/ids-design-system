# design-sync changelog

What changed in the Claude Design upload — the cards, their metadata, the generators that build
them, and the routes for getting a file out of the shared project.

**This is not the package changelog and must never be merged into it.** Nothing under
`.design-sync/` reaches the npm tarball: `src/lib/ng-package.json` copies only `src/lib/styles` and
`src/lib/themes` as assets, and `package.json` declares no `files` field that would pull anything
else in. A consumer installing the package cannot observe any of it. The published `CHANGELOG.md`
is also linted against naming a path outside the published tree, so an entry about this directory
could not live there even if it were wanted.

Sections mirror the package's versions, because the upload tree is rebuilt once per release —
by the after-release `build-design-sync.sh`, which commits it to main straight after the tag. One
timeline, two audiences. The `npm version` hook stamps `## Unreleased` with the new version when it
holds an entry; what the release bot commits afterwards needs none.

## Unreleased

### Upload

- **The project holds the 0.14.0 tree: 1211 files, 458 cards.** The 588 files that changed since
  the previous upload went up in three batches under one plan; a read-back of `list_files` shows
  nothing local missing from the project. `delete_files` is refused for a non-owner, so the
  **twenty** paths the build no longer produces are still there, each listed in `obsolete.txt` for
  the owner to clear. The retired `Progress` card set and the `[multi]` Accordion card carry a
  `[TO BE DELETED]` notice naming what replaced them, and no card registration.

## 0.14.0 — 2026-09-24

### Build

- **A chart card holds every chart of its block.** The docs build a chart only once it scrolls into
  view, and a headless page reports nothing as intersecting, so a card would freeze the empty
  placeholders. A card sets `__dsSectionsOnly`, and under it every chart is built at once. The slice
  waits until the section has a filled child, and a card still empty after its 8s budget reports
  nothing kept, so `measure-cards` names it instead of passing it.

- **A chart gets cards from its own chapter.** `build-cards.mjs` counted a chapter as a
  component's own only under `components/`, so `Chart`, `HeatmapChart`, `ScatterChart` and
  `WaterfallChart`, whose chapters live under `charts/`, got no card at all and the upload check
  stopped. A chapter named after the component is its own in any group now, and `ChartDataTable`'s
  block in `charts/chart` is marked and keyed so its card carries its own API table.

- **A library type named like a wrapper is imported under an alias.** `ChartDataTable` is both the
  `dataTable` input's union and the `ds-chart-data-table` wrapper, and `wrappers.tsx` declared the
  name twice (TS2395), so `build:elements` failed. `gen.mjs` imports it as `ChartDataTableType` and
  writes the props against the alias.

- **The upload tree is no longer rebuilt inside the release commit.** `prepare-release-commit.mjs`
  ran `build-upload.mjs` in the `version` hook, and `cut-release.sh` ran a full
  `build:elements` before the bump to feed it. Neither survived contact with what
  `build-design-sync.sh` does afterwards: that step has a browser, so it measures the card
  heights and freezes the cards, then commits the corrected tree to main. The release-commit copy
  was live, unmeasured and stamped with the outgoing version, and the tree is not in the npm
  tarball, so the tag never needed one. Two builds out of three are gone, and a build failure can
  no longer land inside `npm version` — which `cut-release.sh` runs a few lines before it
  pushes main.

- **`check-manual-surface` and `check-doc-api` run on the PR.** They need `gen/sections.json`,
  which is gitignored, so `ci-pr.sh` runs `gen.mjs` first — a TypeScript AST read of about
  2.5 seconds, not the Angular build. An undocumented component and an unregistered section are
  both caught where the component is added.

- **`npm run check:cards` runs the card gates outside CI.** `check-manual-surface.mjs` reads
  `elements/gen/sections.json`, which is gitignored, so the check on its own works only in a tree
  that has already built; `check:cards` bootstraps, builds the elements surface, then runs it and
  `check-doc-api.mjs`. `ci-pr.sh` carries neither, because nothing there builds `gen/`. CI runs both
  in `build-design-sync.sh`, beside the build that feeds them — an `after-release` step, so a gap
  they catch holds back the upload tree and leaves the published package and the deployed docs
  alone.

- **The shared stylesheet is the union over every rendered card, not the frozen ones.** A block
  qualifies for it on carrying a scope attribute anywhere in it, and some carry document-level rules
  alongside — `:root` custom properties, keyframes, `::ng-deep` output. Taking the union from the
  frozen subset dropped what only a live card contributed and moved 80 frozen cards by 4–32px, so
  the blocks are not as position-independent as they look. Measure the heights after touching either
  the union or its order.

### Cards

- **A card whose control owns a dropdown stays live, so the dropdown still opens.** What freezing
  takes away is behaviour, and for Select, MultiSelect, Autocomplete, the date and time pickers, the
  colour picker and Menu the panel IS the documented thing. It was never VISIBLE in a card — a CDK
  overlay is closed by default and portaled to `document.body` — but it was one click away, and a
  frozen card has no click. The rule is per card and read from the rendered dom rather than from a
  list of chapters, which would drag 130 cards live to keep the 85 that have a panel. The other
  chapters that need behaviour are named in `live-chapters.txt`: toast, drawer, modal, popover,
  bottom-sheet, tree, loading-overlay, scrollbar.

### Docs

- **`docs/Meter.md` was added, documenting the new `ds-meter`.** A component with no doc is an
  `ENOENT` in `build-cards`, and `build-cards` first runs during the release — so the missing
  file stopped a release rather than a PR. The gate that catches it is now on the PR (see Build).


- **Seven component docs promised an `open` prop that does not exist.** Autocomplete, ColorPicker,
  DatePicker, MultiSelect, Select, SplitButton and TimePicker each documented it, so an agent
  writing against the doc got a dropdown that never opened. Behind the custom elements the trigger
  owns its own open state and the panel is a CDK overlay portaled to `document.body`; `Select`'s
  `staticPreview` is the one way to render a panel in flow. `check-doc-api.mjs` now reads the prose
  for a backticked `on…Change` the component does not have, not only the tsx examples — that shape
  alone, because every backticked identifier reports 46 findings on this tree and almost none are
  defects, while this reports none.
- **`docs/BarChart.md` was added, documenting the newly-registered `ds-bar-chart`.**
- **The five charts and the chart-tooltip panel have cards for the first time.** `sectionFor()`
  defaults a component to `components/<kebab name>`, and the chart sections live under a `charts`
  group, so every one of them resolved to a slug `GROUP_PAGES` does not register — `build-cards.mjs`
  threw on the first of them and the release step it runs under never got past it. The six names are
  in `config.json`'s `sections` map now, `BarChart` pointing at `charts` because it has no
  sub-folder of its own. Thirteen files followed: a card and a prompt note per chart, plus the
  foundations guide card for the app-wide chart defaults.

- **`docs/ChartLegend.md` was added and `ChartLegend` points at `charts/line-chart`.** The legend is
  `@internal` and registers as no element, but LineChart renders it, so it reaches a card the way
  `CalendarDay` and `FieldMessage` do — which is the pair `check-manual-surface.mjs` demands: a doc
  the design agent can read, and a section whose chapter the card is cut from.

- **`HeatmapChart`, `ScatterChart` and `WaterfallChart` have docs and routes.** Each got a
  `docs/<Name>.md` and a `sections` entry in `config.json` pointing at `charts/<kebab name>`, so
  `build-cards` finds a chapter for them. `BarChart.md` documents the `[low, high]` value, `target`
  and `ranges`; `LineChart.md` documents `curve` and `stack`; `Chart.md` documents `curve` on
  `dsLineSeries`; and both `LineChart.md` and `Chart.md` spell the axis modes `'aligned'`,
  `'exact'`, `'dual-grid'` and `'split'`.

- **`DonutChart` is `PieChart`.** `docs/DonutChart.md` is `docs/PieChart.md`, documenting
  `<PieChart>` and `innerRadius` in place of `thickness`, and the `sections` entry in `config.json`
  is `PieChart` pointing at `charts/pie-chart`, the chapter the docs site now serves.
  `ChartTooltipPanel.md` and `MANUAL-SURFACE.md` name the pie as well.

- **`docs/ChartDataTable.md` was added and `ChartDataTable` points at `charts/chart`.** Every chart
  renders `ds-chart-data-table` under its plot, and the `charts/chart` chapter is where it is shown,
  so the card is cut from there.

- **`docs/Accordion.md` documents `multiple` in place of `multi`**, the input's name.

## 0.12.0 — 2026-09-04

### Cards

- **Every card is titled after its own subject and names its own tag.** A card used to open with
  the chapter's header, so a pane full of cards from one chapter read as the same thing repeated.
  Each now opens with its own subject and names the Angular tag it documents, with the React tag
  beside it.
- **Every card carries a one-sentence subtitle and a usage note.** The pane truncates a subtitle
  at about 195 characters — measured, not guessed — so the generator writes one sentence and puts
  anything longer in the note.
- **The last five cards lose the eyebrow**, and a part no longer republishes the chapter it
  belongs to.
- **376 of 409 cards ship as static HTML instead of an Angular application.** A card is a whole
  document, and every one of them downloaded the 2.12 MB bundle and booted its own application, in
  every tile of the grid at once. `snapshot-cards.mjs` renders each card and writes back the settled
  DOM with the scripts stripped, so a frozen card fetches no bundle at all. Nothing renders
  differently — the theme tokens stay in `_ds_bundle.css`, so the pane switching `data-theme` still
  recolours a frozen card, and all 409 declared heights are unchanged.
- **The 185 distinct component stylesheets are one linked file.** Angular inlines a component's
  styles into every document that renders it, so the same block arrived in card after card. They
  concatenate into `_ds_cards.css`, fetched once for the whole grid instead of parsed inside each
  card. With the scaffolding comments and the Angular component ids trimmed too, the tree is
  20 MB → 9.0 MB.

### Removing a file from the shared project

- **An obsolete path now reaches the owner as one pasted instruction.** A write to a project the
  uploader does not own cannot be taken back by the uploader: `delete_files` refuses without
  project ownership. What works is a single instruction the owner executes, including the unregister
  step that a rename or a delete alone leaves behind.

### Build

- **The upload tree is rebuilt against each release** inside the release commit, so the tag and
  the shipped cards agree.
- **A release build can no longer thaw the committed cards.** Freezing needs a browser the CI image
  does not have, so a CI build produces live cards while this repo commits frozen ones — and the
  byte comparison that followed said "stale" every time, which on the release branch means the bot
  COMMITS rather than fails. `build-cards` now writes `.design-sync/cards.lock.json`, a fingerprint
  per generated file that a browserless build reproduces exactly, and CI compares that instead: it
  moves when a card's source moves and stays put when only the freeze is missing. The frozen copies
  and `_ds_cards.css` are then restored from git, and `check-frozen.mjs` asserts that every card
  outside `live-chapters.txt` really is static.
- **The freeze is reproducible.** Five render lanes finish out of order, so the results are read
  back in `cards.json` order; without that the shared stylesheet's block order and the shortened
  component ids differed every run, rewriting all 376 cards and the stylesheet with no change in
  them. The tidy pass also waits for the DOM to stop changing rather than counting frames — the
  sticky-scrollbar card had frozen three different ways in three runs.
