# Should the library split into `basic` + `advanced` npm packages?

> Audit of the proposal raised by Mikhail Shyshla (split the package so prototypes pull a
> light "basic" kit and production apps add an "advanced" one, with `ds-table` swapped for a
> heavier `ds-data-grid`).
> Method: a differential ladder of real production builds of `dist/ds` **0.11.1** through a
> throwaway consumer workspace, plus a source inventory of `ds-table`'s current API.
> **Nothing was changed in the library. This is the record for the decision.**

## Verdict

**The premise does not hold.** The fear is that an app pays for components it does not use.
Measured: going from the 44 components a prototype actually uses to **all 96** costs
**18 KB gzip**. The whole library, every component retained, is **179 KB gzip**. Unused
components are already free.

The second premise — that the "advanced" features still have to be built — is also false.
Every feature named for the hypothetical `ids-data-grid` **already ships in `ds-table`**
(§3), most of it since 0.6.3. A split would not add capability; it would _move shipped features
into a second package_ and buy at most 32 KB gzip for it.

Moving them is itself free — breaking consumers is not a cost this library weighs, and a feature
sitting in the wrong place is always allowed to move. What the split costs is a **second table to
keep in sync forever** (§4), and that is what it fails to justify.

Meanwhile the packaging problem the library **does** have — chunk _placement_, documented in
`packaging-chunking-audit.md` — is untouched by a basic/advanced split. The "basic" package
would reproduce it exactly.

## 1. The measurement

Probe: a throwaway Angular 21 workspace resolving `@ids-group-ltd/ids-design-system` to
`dist/ds` by tsconfig path, inheriting the repo's `node_modules`; production build
(`optimization: true`, no hashing, no sourcemaps); component classes referenced from a live
runtime array so the compiler cannot drop them. Scenario sources are generated, not
hand-written, so the "everything" rung is exhaustive by construction.

**Units: KB here means ÷1000 throughout.** Earlier drafts mixed ÷1000 and ÷1024 inside single
comparisons (18.9 KiB against 18.2 kB, most visibly); every figure in this document is now SI.

| Rung                                    | JS raw    | JS gzip   | Δ gzip vs bare Angular |
| --------------------------------------- | --------- | --------- | ---------------------- |
| Bare Angular app, no DS                 | 92 686 B  | 30 646 B  | —                      |
| `+ ds-divider` (cheapest declarable)    | 108 243 B | 36 215 B  | **+5.6 KB**            |
| `+ ds-button`                           | 200 941 B | 62 733 B  | +32.1 KB               |
| `+ ds-table`                            | 543 124 B | 148 882 B | +118.2 KB              |
| Prototype kit — 43 components, no table | 645 558 B | 159 409 B | +128.8 KB              |
| Prototype kit **+ `ds-table`**          | 776 546 B | 191 431 B | +160.8 KB              |
| 11 heaviest components only             | 741 977 B | 191 616 B | +161.0 KB              |
| **All 96 exported declarables**         | 891 434 B | 209 603 B | **+179.0 KB**          |

Global stylesheet (`@use 'styles/ds'`, compiled compressed): **58 293 B raw / 10 282 B gzip**.
This is a fixed cost — tokens, palette, theme activation, typography, resets. No packaging
change reduces it, and it is charged to every consumer including a prototype.

Component styles do **not** add to this: every build above emitted **0 bytes of CSS**, because
Angular inlines component styles into the component definition, so they are dropped along with
the component. Style weight tree-shakes exactly as well as code weight.

### The three numbers that decide it

- **Entry cost: 5.6 KB gzip.** Importing the library and using one trivial component costs
  almost nothing. There is no fat "always-shipped runtime".
- **Cost of the 52 components a prototype does not use: 18.2 KB gzip**
  (209 603 − 191 431). This is the entire size of the problem the split is meant to solve.
- **Marginal cost of `ds-table` in an app that already uses the rest: 32.0 KB gzip**
  (191 431 − 159 409) — _not_ the 118.2 KB it measures in isolation. The isolation figure
  is 3.7× too high because it bills the table for `ds-button`, `ds-menu`, `ds-popover`,
  `ds-pagination`, `ds-skeleton`, `ds-loading-overlay` and the icon set, which the rest of the
  app was paying for anyway.

So the best case for the split — a prototype that uses no table at all — saves **32 KB gzip**.
A prototype that uses a table saves **nothing**, because the table is what the split moves.

## 2. Why tree-shaking works here

Nothing is accidental about the result; the preconditions are all met and worth stating so a
future change does not silently break them:

- `package.json` sets `"sideEffects": false` (root and `dist/ds`).
- ng-packagr emits a single ESM `fesm2022` module; the Angular compiler marks every
  `ɵɵdefineComponent` and friends `/*#__PURE__*/`, so an unreferenced class is dead code.
- The library has **no** third-party runtime dependency beyond `tslib`. `@angular/cdk` is a
  peer, and only `overlay`, `portal` and one `drag-drop` import are used.
- Nothing is on by default. (The shorthand here was "every optional table behaviour is an
  `input(false)`", which is **false** and corrected 2026-09-02: six take other forms — `bordered` and
  `stickyScrollbar` are `input<boolean | null>(null)`, `hiddenKeys` and `columnOrder` are
  `model<… | null>(null)`, `columnFilters` and `columnWidths` are `model<Map>(new Map())`. All six
  still resolve to off: `null` becomes `false` through `resolveWithConfig`, and an empty map hides,
  reorders and filters nothing. The argument does not depend on the form.)

## 3. Everything proposed for `ids-data-grid` already ships in `ds-table`

**Verified in source on 0.11.1, and the line numbers below have since drifted.** Re-checked
2026-09-02: **every symbol named here still exists**, but ten of the twenty-five `file:line`
citations no longer land, by −1 near the top of `table.component.ts`, −13 mid-file and +78…+86
below line 1300 — the signature of insertions, not of removals. Read the symbol, not the line.
The wish list, item by item:

| Asked for         | Already in `ds-table`                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| resize columns    | `resizableColumns` + `columnWidths` — `table.component.ts:283,286` (since 0.6.3)                                                             |
| column filters    | `columnFilters` `:275`, `filterQuery` `:272`, `HeaderFilterDirective`                                                                        |
| column visibility | `hiddenKeys` `:280`                                                                                                                          |
| column order      | `reorderableColumns` `:288`, `columnOrder` `:292`                                                                                            |
| exports           | `exportButton` `:306`, `exportFilename` `:308`, `exportFetcher` `:318`, `exportFailed` `:323`                                                |
| inline editing    | `TableColumn.editable` (`table.types.ts:72`), `cellEdited` output `:442`                                                                     |
| — plus            | `persistLayout` `:298` + `storageKey` `:301`, sorting (`sortKey`/`sortDir`/`sortingOrder`), pagination (`page`/`pageSize`/`pageSizeOptions`) |

And the three features requested as new:

| Asked for                                            | Already in `ds-table`                                                                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| horizontal scrollbar always visible                  | `stickyScrollbar` input `:337`, resolver `:393`, host class `.sticky-scrollbar` `:142`                                     |
| long text → ellipsis, click → full text in a popover | `TableColumn.truncate` (`table.types.ts:50`); clip width `:881`; `cellTextPopover` `:1352`, click handler `:1355`          |
| text selection must not fire the row click           | `selectionBeforeGesture = window.getSelection()` `:1830`, compared `:1839` before the `rowInteractive` click fires `:1849` |

Row-click-to-open — `rowInteractive` `:263` + `rowClicked`. Three-dot row menu — `rowActions`
`:437` + `TableRowActionEvent`. All present, all documented in `ds-docs` (the table section's
HTML references `stickyScrollbar`, `resizableColumns`, `reorderableColumns`, `hiddenKeys`,
`exportButton`, `persistLayout`, `columnFilters`, `rowInteractive`, `columnOrder`).

`ds-table` today carries **62 inputs/outputs** in 76 KB of TypeScript. It _is_ the data grid.

## 4. What a split would actually cost

- **Two tables to keep in lockstep.** Already flagged in the discussion ("риск расхождений").
  An `advanced` table cannot be a clean subclass: it needs the base table's private layout
  machinery, its SCSS, its popover/menu/pagination internals.
- **A swap at exactly the wrong moment.** "там где нужно table меняется на data grid" means the
  prototype→production step becomes a template rewrite — the one step where the design is supposed
  to survive unchanged. This is not about breaking consumers (which this library does freely); it is
  that the swap has to be _redone by hand_ every time a prototype graduates.
- **A doubled release pipeline** (cut → publish → deploy-docs), doubled version matrix, and a
  docs site that must explain two tables that look identical.
- **Return: ≤32 KB gzip**, and only for apps with no table.

**Not on this list: breaking current consumers.** In this library that is a migration note, not a
cost, and shipped features are free to move. The case against the split rests entirely on the
duplicate-maintenance burden and the size of the prize.

## 5. What the library's real packaging problem is

`packaging-chunking-audit.md` (2026-08-03, re-verified with esbuild fixtures): one entry point
means one module, and a module is the bundler's atom. The moment an _eager_ consumer graph
touches one DS symbol — e.g. a root provider binding to `ToastService` — the chunk carrying
**every** DS symbol the app uses anywhere becomes a static import of `main`. mm-broker measured
~632 KB, ~88% of a 720 kB initial bundle.

Tree-shaking and chunk placement are orthogonal, and only placement is broken. A
basic/advanced split does not fix it: `ids-basic` would be a single entry point with the same
behaviour.

Note the audit's recommended fix is **no longer live**. Its option B — one narrow services
entry point — was refuted in `todo.md` on 2026-08-05 by following the real import graph:
`ToastService` → `ToastRegionComponent` → `ToastComponent` → `IconComponent` + `SpinnerComponent`,
and `ModalService` → `ModalConfirmComponent` → `ButtonComponent` + `ModalCardComponent`. A
services entry would have to _own_ button, icon, spinner and modal-card, which every other
component also needs, so the root would import from it — and ng-packagr forbids cycles between
entry points. The remaining options are **A** (do nothing), **C** (leave the dynamic-`import()`
lever to consumers, costing them ~50% of tree-shaking), or **D** (a layered `core ← services ←
components` entry set — a large refactor that changes how every consumer imports).

**Option D got cheaper, measured 2026-09-01** (`packaging-chunking-audit.md` §10). A real
ng-packagr build of a layered three-entry library, fed through a real `@angular/build:application`
build, moved the heavy payload out of the eager chunk (118 011 B → 85 800 B) with no tree-shaking
penalty — **and the consumer kept importing from the root specifier while getting the same result,
byte for byte**. Keeping the root as a pure re-export facade removes D's headline cost ("changes how
every consumer imports"); the refactor becomes internal to the library. Whether _this_ library's
71 component folders actually partition without cycles is still untested.

The decision stays open and nothing is blocked on it. It is recorded here only to make the point
that matters for _this_ proposal: **the basic/advanced split addresses none of it.**

## 6. When a separate package _would_ be justified

Not by component count, and not by weight of first-party code — by an **external runtime
dependency**. A charting package pulling a charting library, or a grid pulling ag-grid, adds
weight that tree-shaking cannot claw back and a peer-dependency surface the design system
should not own. The library today has none, which is exactly why splitting it buys nothing.

By that criterion `ids-charts` is a real candidate the day it needs a third-party renderer
(`styles/_tokens-charts.scss` already exists); `ids-advanced` / `ids-data-grid` is not.

## 7. Not verified

- Whether splitting `ds-table`'s optional behaviours into separately-importable directives
  (`DsTableResizable`, `DsTableExport`, …) would meaningfully cut its 32 KB marginal cost.
  Plausible — the code for every opt-in feature ships whether or not the input is set — but
  unmeasured, and the ceiling on the saving is 32 KB. This is the only shape in which the
  "light table / heavy grid" idea survives the numbers: one component, one docs page, no
  mirror to keep in sync, and the heavy parts tree-shaken per feature rather than per package.
- Whether this library's 71 component folders partition into acyclic entry points. The pipeline
  itself is no longer in doubt — see `packaging-chunking-audit.md` §10.
- No consumer repo was rebuilt; all figures here are from this repo's probe.

## 8. Reproducing the probe

Scaffold lived at `.claude/local/bundle-probe/` (gitignored): `angular.json` with an
`@angular/build:application` target, `tsconfig.json` with `files: ["src/main.ts"]` and a path
mapping to `../../../dist/ds`, and `scenarios/*.ts` copied over `src/main.ts` per rung. Node
resolution walks up to the repo's `node_modules`, so no install is needed. Two traps: the
tsconfig must scope compilation to `src/main.ts` or the compiler type-checks every unused
scenario; and classes must be referenced from a runtime array, since unused entries in a
standalone `imports` array are dropped by the compiler and silently under-report the ceiling.

## 9. The directive split, measured (2026-09-01)

§7 listed "split `ds-table`'s opt-in behaviours into separately-importable directives" as the one
shape that survives the numbers, and flagged it unmeasured. It has now been measured by **ablation**:
delete the data-grid features from `ds-table` on a probe branch, rebuild the library, and re-run the
same ladder. That gives the upper bound on what any such split can save, before designing it.

Branch `probe/table-feature-directives`, worktree `C:\wt-ds-table-split`, built from `dev` at
`5783c830`. Baselines re-measured on that build, so every figure below is same-build.

| Rung (gzipped JS)          | Baseline     | Ablated       | Δ             |
| -------------------------- | ------------ | ------------- | ------------- |
| prototype kit, no table    | 159 409 B    | 159 409 B     | —             |
| prototype kit + `ds-table` | 190 837 B    | **171 534 B** | **−19 303 B** |
| `ds-table` marginal cost   | **31 428 B** | **12 125 B**  | **−61%**      |
| `ds-table` alone           | 148 304 B    | 126 161 B     | −22 143 B     |

**A directive split takes the table from 30.7 KB gzip to 11.8 KB for an app that uses none of the
data-grid features — a saving of 18.9 KB gzip.** For comparison, the entire basic/advanced package
split targets 18.2 KB (§1) and costs a second package and a permanent mirror; this saves slightly
more, inside one component, with one docs page and nothing to keep in sync.

**What was ablated** (1 063 source lines: `table.component.ts` 74 399 → 52 013 B, `.html` 21 400 →
15 403 B, `.scss` 26 762 → 23 494 B):

- column resize — `resizableColumns`, `columnWidths`, drag handles, keyboard resize
- column reorder + visibility picker — `reorderableColumns`, `columnOrder`, `hiddenKeys`, the picker
  popover, and with it the `@angular/cdk/drag-drop` import
- column filters — `columnFilters`, the header filter trigger and the filter popover
- CSV export — `exportButton`, `exportFilename`, `exportFetcher`, `exportFailed`, `runExport`,
  `exportCsv`, `downloadFile`, and the export state in the live region
- layout persistence — `persistLayout`, `storageKey`, the restore/save effect
- truncate + cell popover — `col.truncate`, `clipWidth`, `fitsContent`, `onCellClipClick`,
  `cellTextPopover`. Pulled in not by choice but because its clip-width logic is shared with resize
- `onHeaderEnter` — the title-on-clipped-label handler, which exists only because resizing clips labels

**What was kept:** sorting, selection, pagination, loading/skeleton/overlay, sticky header, sticky
scrollbar, zebra, density, row actions and the kebab menu, row expansion, inline cell editing,
`filterQuery` substring search, cell templates and cell links.

**So 18.9 KB is a floor on the prize, not a ceiling.** Row actions and inline cell editing are just as
"advanced" and were left in; extracting them too would push the saving higher.

**The one finding that argues against doing it naively.** The features are _not_ cleanly separable
today — the ablation needed 1 063 lines of edits across three files and repeatedly hit shared helpers:
`clipWidth`/`fitsContent` serve both truncate and resize, `orderedColumns` and `visibleColumns` are the
same computed chain the picker writes to, `filteredData` folds the set filters into the substring
search, and `statusMessage` folds the export state into the live region. A directive split has to give
each of those a seam — most likely a small internal layout/state service the directives write into and
the table reads — rather than moving methods out one by one. That design work is the real cost, and it
is bounded and one-off, unlike a second package's permanent mirror.

**Reproduction:** the probe app is `.claude/local/bundle-probe/` inside the worktree, pointed at that
worktree's `dist/ds`; rungs `proto` and `proto_table`.
