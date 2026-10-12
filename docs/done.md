# DS - completed work

One line per closed item. Open work lives in `todo.md`; the detail behind an entry is in git history.

## Calendar week and clock from the locale (2026-10-12)
- `ds-date-picker` starts the week on its locale's first day (`localeFirstDayOfWeek`, Monday without week data); `ds-time-picker` shows the locale's 12h or 24h clock (`localeTimeFormat`); inputs and `DS_CONFIG` still win
- Decided: everything from the locale (Stas, deck `implemented/locale-week-and-hour`)

## Chart motion: sync and response (2026-10-11)
- Line, markers, area, value labels, pins, gridlines, tick labels and waterfall connectors move on the column timing; the category band glides with the tooltip panel and a held band pin follows the data (`chart-motion.moves`, `measureBandPinY`)
- `ds-pie-chart` tweens slice angles through `tweenMarks` (`charts-motion.ts`); heatmap rows and cells, scatter points, pie slices and waterfall connectors and labels leave with a fade
- Hovered column, bar, waterfall step and heatmap cell brighten (`chart-interactive.$highlight`); a hovered pie slice slides out 3 units; pins pop in; tooltip rows fade in on a new category
- Decided: sync and response, no counting numbers (Stas, deck `chart-motion`)

## Chart and picker loading (2026-10-09)
- Eight charts keep the plot under `ds-loading-overlay` on a reload, bound to the plot with an 8px reach and the caption uncovered (`ChartStatesComponent`, `reloading`)
- The skeleton takes each chart's shape at the drawn size: axes and columns, a line, a sliced ring, narrowing stages, floating steps, a cell grid, the scatter grid with no dots (`chart-skeleton.component.ts`, `charts-skeleton.ts`)
- `skeletonCount` on `ds-chart`, `ds-column-chart`, `ds-pie-chart`, `ds-funnel-chart`, `ds-waterfall-chart`, default 5; `--ds-waterfall-chart-skeleton-height` removed
- `ds-heatmap-chart` hugs its grid (`inline-size: fit-content`)
- `ds-select`, `ds-multi-select`, `ds-autocomplete`: placeholder option rows while empty, the list under an overlay on a reload; the multi-select filter and select all stay live
- Decided: ds-chart, column, line, heatmap A; pie, funnel, waterfall B; scatter A without dots; heatmap card hugs the grid; multi-select A (Stas, deck `implemented/loading-states`, asked by mm-ecm)
- Accepted: every block of the before and after (Stas, deck `implemented/loading-skeletons`)

## Bar chart rows and loading (2026-10-08)
- `ds-bar-chart` takes `labelPosition: 'top' | 'start'` and `BarChartRow.children`, `hint`, `emphasis`, `showPercent`, `detached` (`bar-chart.math.ts`: `placeRows`, `shownRows`, `partSpans`)
- New tokens `--ds-bar-chart-label-column-max-width`, `--ds-bar-chart-child-fill-opacity`, `--ds-bar-chart-divider-color`, and `DsIntl.chart.rowsUnder` (`ds-bar-chart`)
- Loading follows `ds-table`: skeleton rows while `data` is empty, `ds-loading-overlay` over the rows on a reload, no `loadingStyle` input (`showsSkeleton`)
- The reload overlay covers the card to its rounded corners (`--ds-loading-overlay-radius`); a bordered `ds-table` rounds the overlay's bottom corners
- Decided: skeleton plus overlay, every drawn variant accepted (Stas, deck `implemented/bar-chart`, asked by mm-ecm)

## Pie chart centre value fitting (2026-10-05)
- `ds-pie-chart` keeps the centre value on one line, shrinking to `--ds-pie-chart-center-value-min-font-size` then using the `'tick'` form (`pie-chart.component.ts`, `fitCenterValue`)
- `[centerCompact]="false"` keeps the full sum at the floor and `centerPlacement="below"` prints value and caption under the ring (`ds-pie-chart`)
- Decided: option K, refit only on ring width, text, hole or font-load change (Stas, deck `pie-chart-center-value`)

## Unslotted overlay content (2026-10-05)
- `ds-modal`, `ds-modal-card` and `ds-drawer` render slotless content in the body; `ds-drawer` also takes `[body]` and `[actions]` (Stas picked the all-together option, deck `unslotted-content`)
- Dev mode warns once per message on unslotted content and on unknown slot names (`core/unslotted-content-warning.ts`, `warnUnslottedContent`)

## ds-docs audit findings (2026-10-02)
- `ds-bar-chart` draws a negative `value` as an empty track, showing the real value in label, tooltip and name (`bar-chart.math.ts`)
- `--ds-topbar-crumb-*` and `--ds-page-header-crumb-text-color(-hover)` now reach the projected `ds-breadcrumbs` (`ds-topbar`, `ds-page-header`)
- `ds-modal` `confirmed` fires from a `dsModalConfirm` action, so a disabled or loading button never confirms (`modal-confirm-action.directive.ts`)
- `provideDsTheme({ followSystem: true })` keeps `data-theme` on `<html>` at startup, init and OS changes (`provideDsTheme`)
- ds-docs chapter headings take page-unique `<anchor>-<slug>` ids; `#chapter` deep links hold under the topbar and open folded `<details>` (ds-docs)
- `ds-avatar-group` hides avatars past `max` and counts them when `total` is unset (`ds-avatar-group`)
- A disabled link-button with `disabledReason` keeps a Tab stop (`tabindex="0"`, `role="link"`)
- `provideDsIcons` calls merge across injectors, a later call winning a shared name (`provideDsIcons`)
- Closed unbuilt: focus-ring gate change (`tools/check-focus-rings.mjs` already in `lint` and `release`)
- Closed unbuilt: ds-docs charts on skeleton inside folded `<details>` (not a defect)

## Tightened template context classified as actionable (2026-09-30)
- `migrations/AUTHORING.md` classes a static `ngTemplateContextGuard` or `unknown`-defaulted generic as a `behavior` item on `surface: template` with the build error in `detect` (`migrations/AUTHORING.md`)
- `tools/check-class-surface-entry.mjs` in the `release` group fails on an added static `ngTemplateContextGuard` not named by a `surface: template` item (`migrations/unreleased.json`)

## Toast announcement stays off screen (2026-09-29)
- `styles/toast-overlay` declares `.cdk-visually-hidden` with the DS `visually-hidden` recipe, so the first toast's announcement never renders as page text (`styles/toast-overlay`)

## One locale and DS_INTL strings (2026-09-24)
- `DsConfig.locale` (default `LOCALE_ID`) drives chart values and percentages, `ds-date-picker` and `ds-dropzone` file sizes (Stas: one global key)
- `DS_INTL` with `provideDsIntl(object | signal factory)` carries all 197 rendered strings in 33 sections, English defaults unchanged (Stas: no bundled `DS_INTL_RU`)
- Per-instance text inputs default to `null` with `...Resolved` readbacks; `chart.emptyText` and `errorText` moved from `DS_CONFIG` to `DS_INTL.chart`
- The ds-docs theming page carries a de-DE demo (ds-docs)

## ds-docs modifier classes and Acme examples (2026-09-24)
- Every ds-docs `<base>--<mod>` class is `<base>.is-<mod>`, and a stylelint override rejects `--` in ds-docs class names (Stas: docs only)
- Brand and domain examples across ds-docs, the Tweaks preview partial and `migrations/0.10.0.json` use fictional names under one brand, Acme (Stas)

## Column series axis and bar-chart highlight (2026-09-24)
- `g[dsColumnSeries]` takes `axis: 'primary' | 'secondary'` (default `'primary'`), so a two-axis chart can draw columns on either side
- `ds-bar-chart` takes `highlighted` (segment id or null), fading every other part to `--ds-chart-dim-opacity` via `chart-interactive.dims`; `--ds-chart-dimmed-opacity` removed

## Release-note rules, check-overrides, auth-layout defaults (2026-09-24)
- A CHANGELOG entry carries what changed and what the reader does, with a reason only when non-obvious (Stas, `CONTRIBUTING.md`, `migrations/AUTHORING.md`, `migration-lint` M013)
- `ng g @ids-group-ltd/ids-design-system:check-overrides` reports unread `--ds-*` properties and stale `ds-*` selectors; `--strict` fails; auto-update plugin 1.9.0 runs it (`tools/build-override-surface.mjs`)
- `ds-auth-layout` defaults: 18px wordmark (`--ds-auth-layout-brand-name-font-size`), 28px letter-mark tile, `landmark` `'main'`, projected `[brand]` logo capped at tile height

## Pressed state on neutral rows and small buttons (2026-09-24)
- Neutral rows and small buttons step to `--surface-muted` on `:active` (sidenav, date/time pickers, toast action, copy button, multi-select select-all, tab close button)
- An interactive `ds-tag` takes the shared `press.feedback` dip instead (Stas, deck `interaction-formula`)

## Button colour-family slots spelled out (2026-09-24)
- `ds-button` and `ds-icon-button` private slots `--c-*` are `--_family-*`, and inner classes `.c-<color>` and `.v-<variant>` are `.color-<color>` and `.variant-<variant>` (three `class-rename` items)

## Waterfall deck closed and interaction deck narrowed (2026-09-24)
- Decided: `ds-waterfall-chart` keeps its own tag, deck `waterfall-mode-or-component` moved to `implemented/` (Stas)
- Decided: override slot recorded for later and formula deferred (Stas); success/warning pressed was found already in the code (deck `interaction-formula`)

## Chart tooltip, focus and hatching fixes (2026-09-24)
- The category tooltip panel hangs over the highest reading at the active category via mark `axisOrigin`
- A composed `ds-chart` `cursor` takes `'auto'` (new default: `'category'` with two or more tooltip marks, else `'none'`); `ds-column-chart` binds `cursor="none"` (Stas)
- Series groups no longer take focus on click; mark focus is heard from the document via `listenForMarkFocus`, roving tabindex unchanged
- A held tooltip opens above its mark in every chart (`dsChartTooltipPreferBelow` removed)
- Hatch stripes slant the other way and draw the full `--chart-hatch-width` (default 3px to 1.5px); the tooltip swatch matches
- ds-docs container page stacked cards regain their gap (ds-docs)

## Chart legend hover, pie badge, funnel tail, line markers (2026-09-24)
- Every chart legend entry has hover and focus via `chart-interactive.legend-entry()`: `--ds-chart-legend-hover-bg-color`, `--ds-chart-legend-hover-text-color` (Stas)
- A pie legend entry fades the other slices without `dimOthers` (`ds-pie-chart`)
- The pie pin badge is an HTML span placed at the slice centre instead of a scaled `foreignObject` (`ds-pie-chart`)
- A thin funnel `shape="area"` stage keeps half a gap of depth instead of collapsing to a line (`ds-funnel-chart`)
- Line markers enter with their line and area through a CSS entrance (`g[dsLineSeries]`)

## ds-modal-card re-measures actions on label change (2026-09-24)
- A `MutationObserver` on the actions row re-runs the frame-deferred measurement, so a grown button label stacks the row (`ds-modal-card`)

## 0.14.0 cell-template context manifest item (2026-09-24)
- `migrations/0.14.0.json` carries `cell-template-context-typed-unknown` (behavior, surface template, build errors in `detect`) in place of an informational line

## Ten consumer styling hooks (2026-09-24)
- Field family tokens `--ds-field-border-color` (`-hover`, `-focus`), `-text-color`, `-placeholder-color`, `-font-size` sit under each field's own token via `field-box-tokens` (`_field-box.scss`)
- `ds-select` gains focus border, hover, placeholder and size tokens; `ds-autocomplete` text, placeholder and hover border; `ds-textarea` reads `--ds-input-font-size`; `ds-search` hover border defaults to rest border
- `ds-button` and `ds-icon-button` take hover and active border tokens falling back rest, hover, active
- `ds-empty-state` title face and weight, `ds-badge` font size, `ds-page-header` subtitle size, `ds-banner` title size tokens
- `ds-accordion-item` tokenises header padding, gap, type, hover colour and body padding; `ds-accordion` takes `chevron: 'right' | 'down'`
- `ds-table` takes utility-column width (default `--space-10` to `--space-6`) and padding, plus footer block padding (`-y`, `-top`, `-bottom`)

## Announce oversight dev warning (2026-09-24)
- `ds-banner` and `ds-alert` warn in dev mode when `announce` is undecided under an assertive variant, or polite but announcing only via config `true` (`core/announce-warning.ts`, `warnAnnounceOversight`)
- ds-docs sets `banner.announce` and `alert.announce` to `false` at the root (ds-docs)
- Decided: the assertive warning fires while `announce` is unset and stops once the key is set to either value (Stas, deck `banner-announce-warning`)

## Closing overlays are click-through (2026-09-24)
- `.modal-backdrop.closing`, `.drawer-root.closing` and `.sheet-overlay.closing` carry `pointer-events: none` for the whole leave (`ds-modal`, `ds-drawer`, `ds-bottom-sheet`)

## ds-date-picker keeps content width in narrow containers (2026-09-24)
- The host takes `min-width: min-content`, so the whole field overflows a narrow container with the button inside the border (`ds-date-picker`)

## Four control APIs (2026-09-24)
- `ds-switch` takes `controlled` with `(checkedRequested)` (Stas picked the name)
- `ds-textarea` mirrors `selectionStart`, `selectionEnd`, `setSelectionRange`, `select`
- Every field control and `ds-search` has `blur()`, via shared `blurOwnControl`
- `[dsCellTemplateOf]` plus static `ngTemplateContextGuard` types `let-row` under strict templates (`dsCellTemplate`)

## Abbreviation gate and informational verify (2026-09-24)
- `check-abbreviated-tokens` flags short last segments and listed abbreviations in any segment; `--ds-slider-thumb-bw` and `--slider-thumb-bw` are `-border-width`, with token-rename items
- An `informational` object requires a non-empty `verify` (M046); `0.12.2`'s expanded-row line carries one (`migrations/AUTHORING.md`)

## ds-table footer pager loading state (2026-09-24)
- `PaginationComponent` takes `loading`: buttons and size select disabled, range label becomes a `ds-skeleton`, `nav` carries `aria-busy`, active page keeps its accent fill
- `ds-table` forwards `[loading]="isSkeletonLoading()"`; `loading="overlay"` keeps the pager live

## ds-table pager size and layout (2026-09-23)
- `ds-table` takes `paginationSize: DsSize | null` and `paginationLayout: PaginationLayout | null`, forwarded to the footer `ds-pagination` (`table.component.ts`)
- New `DS_CONFIG.pagination` section: size resolves input, `pagination.size`, `control.size`, `'sm'`; layout resolves input, `pagination.layout`, `'grouped'`
- `PaginationLayout` lives in `core/pagination.types.ts`; `PaginationComponent` gains public `sizeResolved` and `layoutResolved`; manifest items filed in `migrations/unreleased.json`

## ds-modal stacks actions when they outgrow the card (2026-09-23)
- `ModalCardComponent` measures the `.actions` row after render and one frame after header resizes, stacking full-width when over budget (`stackOverflowingActions`)
- `--ds-modal-actions-stacked-direction` defaults to `column` (DOM order); `column-reverse` puts the confirming action on top (Stas, 2026-09-24)
- `migrations/unreleased.json` carries the `informational` line and the `modal-actions-flex-wrap` delete row

## informational entries can carry a verify (2026-09-23)
- `informational` accepts a string or `{ "text", "verify" }`, documented in `migrations/README.md` and `migrations/AUTHORING.md`; `tools/migration-lint.mjs` adds M046
- M034 and `tools/check-manifest-truth.mjs` read `entry.text` for object entries
- The auto-update plugin routes a `verify` entry into the "applied - human should eyeball" bucket; plugin 1.8.2 (`ds-migration-planner.md`)

## Three missed abbreviations spelled out (2026-09-23)
- `--ds-input-label-fw`, `--ds-tag-fw`, `--ds-tag-lh` are `--ds-input-label-font-weight`, `--ds-tag-font-weight`, `--ds-tag-line-height`, with three `token-rename` items
- `tools/check-abbreviated-tokens.mjs` is in `lint:all` and checks the last segment against the abbreviation list, with a selftest

## 0.13.4 pie manifest items name the 0.13.3 element (2026-09-23)
- `pie-chart-thickness-is-now-inner-radius` and `pie-chart-centre-content-needs-a-hole` use `old: "ds-donut-chart[...]"` and `new: "ds-pie-chart[innerRadius]"` (`migrations/0.13.4.json`)

## Six consumer asks on 0.13.3 and 0.13.4 records (2026-09-23)
- `ds-bar` reads `--ds-bar-radius` on track and fill (default `var(--radius-pill)`); the 0.13.3 manifest records `--ds-meter-radius` removed; the `ds-bar` name stays (Stas)
- 0.13.3 pitfalls give `ds-bar(?![-\w])` and `<ds-bar[\s/>]` as guards instead of a word boundary
- The four 0.13.4 generic spell-out items are 97 exact `token-rename` pairs generated from the tag diff, each `detect` anchored `(?![A-Za-z0-9_-])`
- `donut-chart-renamed-to-pie-chart` and six older selector renames list `style`; `M045` fails a `selector-rename` without it
- `--ds-line-chart-plot-height` sizes the plot and `--ds-line-chart-placeholder-height` the skeleton, empty and error boxes; a 0.13.4 `behavior` item records it
- Decided: deck `ds-bar-name-collision` archived with the name kept (Stas)

## Expanded table row spans its row (2026-09-23)
- `check-manifest-truth` lists every unread old/new value, reads selectors, token families, functions and `@use` paths, and scans prose fields for phantom `--ds-*` names
- 48 chart, option and table tokens with empty `notes` carry one each
- `ds-toast-region`'s dev warning is stripped from the shipped bundle (`core/dev-warning.ts`)
- `changelog-lint` fails when a source group resolves nothing or `ng-package.json` declares no assets (`changelog-lint.mjs`)

## Manifest and plugin asks from a consumer re-audit (2026-09-23)
- The auto-update plugin 1.8.1 reads each tag from its own `git archive` tree; `ds-recheck` proves removals with Read/Grep (`plugins/design-system`)
- Prose naming a non-existent token goes in `DELIBERATE_PHANTOMS`, keyed by tag, id and token; `migrations/AUTHORING.md` states `old` holds our identifiers, never placeholders
- Three never-shipped `--ds-chart-*` hooks removed from the 0.13.0 manifest and CHANGELOG; 0.13.0 gains the `--chart-tick-size` item and a categorical rename to `--ds-chart-series-N-color`
- Fourteen subclass items carry DS classes in `old`; eighteen `old`/`new` values hold identifiers with sentences moved to `appliesWhen`; `time-columns-onkey-signature` is informational
- `field-state-icon-hand-rolled` finds `name="error"`, `name="warn"` and `.field-message`; every picker's `panelTokens` comment names `DROPDOWN_PANEL_TOKENS`
- The auto-update plugin 1.8.1 reads each tag from its own `git archive` tree and `ds-recheck` proves removals with Read/Grep (`plugins/design-system`)

## Chart family dedup and line chart on ds-chart (2026-09-22)
- `ds-line-chart` renders `<ds-chart>` with `g[dsLineSeries]` and `g[dsSeriesAnnotation]`, measures the plot in CSS pixels, and `--ds-line-chart-plot-height` now drives the plot
- The category cursor reuses `chartActiveMark`, gaining Escape and tap latch; legend dimming, per-series roving tab stops and marker-narrowed axis tooltips are mark inputs
- `ds-chart-data-table` is the shared annex table for eight charts (`ds-chart-data-table`)
- `resolveChartDefaults` replaces the repeated `resolveWithConfig` calls in nine charts
- Dead exports of `line-chart.math.ts` deleted

## Token spell-out wave and input lists (2026-09-22)
- 132 tokens spell their names out, and 171 private names are mirrored onto their public token for devtools
- `tools/generate-input-lists.mjs` writes an "All inputs" line per component into `components.md` from source
- `check-manifest-truth` reads `--ds-` names in `action` and `appliesWhen` and fails on one existing at neither boundary; two items naming never-shipped `--ds-segmented-button-*` corrected to `--ds-segmented-btn-*`

## Void var(--token) gate (2026-09-09)
- `tools/check-void-tokens` fails on an unresolvable `var(--x)` in `.scss`/`.css` under `src` and `ds-docs/src`, in `lint:all` with a `void-tokens:selftest`
- The gate ignores comments, resolves `[style.--x]` and `setProperty()` writes and compiled `presentations/ds.css`, and follows a fallback only when the primary is undeclared
- Sidebar `.chapter` uses `--space-6` and `--space-8` instead of the undeclared `--space-7` (ds-docs)
- `activity.section.scss` empty-state avatar no longer uses the non-existent `--surface-subtitle`

## Toast class-surface release gate green (2026-09-02)
- `check-class-surface-entry` passes: all eight moved classes are named in `## Unreleased` and carried by a `detect`, the toast ones by `toast-table-subclass-members-moved`

## Toast announcing, pausing, sliding and capping (2026-09-02)
- Toasts announce through the CDK `LiveAnnouncer` (region built at service construction), with a burst coalesced into one region change (`ToastService`)
- The toast stack slides on insert via FLIP transform (`ds-toast-region`)
- `maxVisible` defaults to 5; a configured `0` is forwarded to mean no cap
- `ToastService.promise()` no longer removes its settled result behind the cap; an `action` toast never auto-dismisses

## Toast stays above a later scrim (2026-09-02)
- The toast host is re-shown (`hidePopover()` then `showPopover()`) when a scrimmed overlay appears, watched by a MutationObserver on `.cdk-overlay-backdrop` (`ds-toast-region`)
- Only scrimmed overlays trigger the raise; tooltips and dropdowns do not

## Status ds-color zones regain accent colour (2026-09-01)
- `--accent-strong` resolves in `ds-color="error|success|warning"` via `var(--<f>-strong, var(--<f>-text, var(--<f>)))`, adding no `--<status>-strong` token (`_ds-color.scss`)
- `tools/check-color-families.mjs` compiles `_ds-color.scss` and fails when any family and role does not resolve in either theme; every `family-vars` pointer ends in a fallback
- `accordion-item.component.scss` disabled chevron uses `--text-disabled` instead of the undefined `--icon-disabled`

## Banner and toast icon centred on message block (2026-09-01)
- The icon is `align-self: center` in `ds-banner` and `ds-toast`, centred on the message block; `layout-row` and `compact` icon overrides removed (Stas picked B, deck `banner-toast-icon-alignment`)
- `--banner-ic-mt` removed from `_tokens.scss`

## Table swipe no longer eaten by resize handles (2026-09-02)
- The column-resize handle stands down under `(hover: none) and (pointer: coarse)`; width moves into the column panel as - / + / Fit in a `ds-bottom-sheet` (`ds-table`)

## Resize handle ceiling enforced (2026-09-01)
- Both resize paths clamp through `clampColumnWidth()` to the scroll viewport width, the same `columnWidthCeiling()` announced as `aria-valuemax` (`ds-table`)

## Overlay scrim stops keyboard as well as mouse (2026-09-01)
- `ds-table` `loading="overlay"` marks content `inert` through a `display: contents` wrapper, on by default with `inertContent="false"` for a partial scrim; the table marks `<tbody>` only
- `ds-empty-state` `[actions]` under a full scrim is inert too
- Closed unbuilt: `skeleton-mode` rule (unified away, its hover and cursor rules no longer apply)

## ds-table dead branches resolved (2026-09-01)
- `windowData` removed in favour of `rowSlots`, which normalises lazy gaps to `null`
- The `skeleton-mode` class removed with a migration note
- The resize handle sets `aria-valuenow`, `aria-valuemin` and `aria-valuemax` in pixels while focused (`ds-table`)

## Docblock drift gate (2026-09-01)
- `tools/check-docblock-drift.mjs` fails on a doc comment directly above another doc comment; it runs in `ci-pr.sh`, `lint:all` and `node tools/check.mjs docblock-drift`
- `@fileoverview` or `@module` exempts a block; stranded docs for `MARKER_RESERVE_EM` and `OVERLAY_MOTION_TOKENS` moved back (`chip-overflow.ts`)
- `ds-table` comment sweep: 14 cut, 5 rewritten, 1 moved

## ds-table row expansion edges (2026-09-01)
- `expandMode="single"` collapses the open row on another click, enforced on click and not on the `expandedIds` model (`ds-table`)
- `expandAllToggle` puts a chevron in the expander header, page-scoped, suppressed under single mode with a dev warning
- `(rowExpanded)` and `(rowCollapsed)` name the row, expand-all included; the live region says "N rows expanded"; single mode emits collapse before expand

## Published surface sweep and changelog gate (2026-09-01)
- `CONTRIBUTING.md` "Never in a published artefact": no client names, tracker keys, tree paths, people or decision accounts; applied to changelog, 22 manifests, `design-system.md`, `components.md` and shipped comments
- `tools/changelog-lint.mjs` has twelve rules, runs in `lint:all` and `tools/preflight.mjs`, with `changelog-lint-selftest.mjs`
- Decided: manifests may keep locators naming non-importable things (M1)

## Picker lane closed (2026-09-01)
- `chipFit` measures the parent's available content width instead of the trigger's own, and `ds-autocomplete` shares the correction through one helper
- `check-class-surface-entry` fails on a class missing from the prose and on one missing from every `detect`, skipping classes new in the range
- `migrations/AUTHORING.md`: `detect` names every class from the class-surface report, `action` names none
- Both picker decks moved to `presentations/implemented/`
- Fixed `super()` called twice in `SelectComponent` and the `clear()` doc drifted onto `clearValue()`

## Picker deck proposals (2026-08-31)
- Shared helpers: `core/list-cursor.ts`, `components/scroll-active-option.ts`, `components/picker-announcer.ts`, `components/type-ahead.ts`
- `filterWith: predicate | 'none'` is one input covering custom matching and no filtering (pickers)
- Decided: no type-ahead for `ds-autocomplete`, no `compareWith` for string-keyed pickers
- `ds-multi-select` declares no panel rule of its own; the select-all row reads the shared option-row gap token
- Not built, kept open in `todo.md`: list virtualisation, which fights `aria-activedescendant` (picker deck section 9)
- Decided: no `aria-multiselectable` on `ds-select` (ARIA permits it only on multi-value listboxes, `docs/picker-contract.md`)

## Picker lane review round (2026-08-31)
- Five adversarial review passes found 43 defects in the picker branch; 42 are fixed (picker lane, deck `picker-review-findings`)
- With the filter row hidden, `Enter` on the trigger now selects an option, so keyboard selection works without `searchable` (picker trigger)
- An option inside a `disabled` group keeps object identity, so `flatIndexOf`, option ids and `aria-activedescendant` are correct (picker flattening helper)
- `dsChipTemplate` is rendered on `ds-autocomplete`, and `selectAll="group"` no longer draws the panel-wide row (`ds-autocomplete`, select-all)
- Fifteen prose errors checked against code are corrected, including release notes that told consumers to write a renamed value (CHANGELOG, docs)
- `picker-parity` reads the template instead of grepping `contentChild(`, and the check was proved by deliberately breaking a render (`npm run picker-parity`)

## Dropdown panel single owner (2026-08-31)
- The shared dropdown partial owns the panel geometry behind `--ds-dropdown-panel-bg-color` beside `-radius`/`-maxh`/`-minw`/`-maxw` (dropdown partial)
- Each picker declares its public `--ds-*-panel-*` name as an alias of the shared token on its host, forwarded onto the pane; component selector qualifiers are gone (`ds-select`, `ds-multi-select`, `ds-autocomplete`)
- The panel list carries `min-height: 0` so it cannot push the panel past its own `max-height` (dropdown panel)
- Closed unbuilt: `@layer` for portaled panel precedence (layer order is fixed by first appearance, so a library cannot guarantee it from its own stylesheet)

## Picker family decisions (2026-08-31)
- Not built here, kept open in `todo.md` as a separate project: library-wide localization ask from the ITB Workspace gap report (G4/A1)
- Multi-value pickers take `triggerDisplay="count" | "labels"`; a projected `dsPickerTrigger` wins and `triggerDisplay` is then not read (`ds-multi-select`, `ds-autocomplete`)
- `width="content"` takes the trigger width as the panel floor, bounded by `--ds-dropdown-panel-minw/-maxw`; `ds-select` now forwards the panel tokens to the portaled pane (picker panel)
- Five projection slots exist: `dsOptionTemplate`, `dsChipTemplate`, `dsPickerTrigger`, `dsEmptyTemplate`, `dsCreateTemplate` (pickers)
- `searchable: boolean | number` with `DS_CONFIG.picker.searchable` as the app-wide threshold; the trigger runs the keyboard model when the filter row is hidden (pickers)
- One group shape, `DsOptionGroup` / `DsOptionItem`; `ds-multi-select` gained groups and `ds-autocomplete` lost the second `optionGroups` input (pickers)
- A settled single value ellipsises by default and `valueOverflow="wrap"` restores wrapping; seven clip sites use the `single-line-ellipsis` mixin (pickers)
- The autocomplete panel rejoined the shared partial, restoring padding, rounded rows and `--ds-option-*` hooks; multi-select duplicate panel rules removed (`ds-autocomplete`, `ds-multi-select`)
- Picker rules are written down and enforced by `npm run picker-parity` and `npm run picker-capabilities` (`docs/picker-contract.md`)
- Decided: `name`, `readOnly` and `clearable` stay `ds-select`-only for now, the parity audit keeps printing them (`docs/picker-contract.md` section 2)

## Closed entries moved out of the todo (2026-08-26)
- The `ds-banner` title centring came from a consumer `auth-card` `::ng-deep .title` rule, now qualified to `h1.title, h2.title` (consumer `auth-card.component.scss`)
- `ds-banner` declares `text-align: start` on its own box, so a centred ancestor no longer aligns it (`ds-banner`)
- The sidenav footer account menu uses `ds-menu-divider`, so `--ds-menu-divider-color` and `--ds-menu-divider-spacing` reach it (`ds-sidenav-footer`)
- `ds-menu-divider` cancels the menu row gap, so it sits flush with 0px above and below; a divider outside `ds-menu` is untouched (`ds-menu-divider`, `--ds-menu-gap`)
- Docs now say setting `--ds-menu-divider-spacing` desyncs the divider from the row rhythm and point at `--ds-menu-gap` for an airier menu (`--ds-menu-divider-spacing`)
- The 08-24 mm-broker batch is closed: card overflow hook, resting button shadow hook, and a refusal reason on buttons (`ds-card`, `ds-button`)
- `check-delete-tables`-style rule M034 requires any delete-shaped prose sentence to cite its `deleteList` row (`migration-lint`, M034)
- `TableColumn.link` renders a column value as a real link; the consumer marks its seven sites with `TODO(ds-table-link)` (`ds-table`, unreleased)
- `compact` is filed under Records as a knowingly duplicated decision (`todo.md`)
- Three row-menu icon button resolvers exist: `--ds-table-icon-btn-color`, `--ds-table-icon-btn-color-hover`, `--ds-table-icon-btn-focus-color`, also covering the column picker (`ds-table`)
- `ds-checkbox` paints the field error state as a border colour only, and `ds-radio-group` colours its label (`ds-checkbox`, `ds-radio-group`)
- Closed unbuilt: error state on `ds-radio` alone, `ds-switch` and `ds-slider` (a lone radio belongs to its group, a switch applies on flip, a slider enforces its bounds)

## Architecture and tokens (2026-08-26)
- `ds-table` footer pads `12px 16px 12px` from the public `--ds-table-cell-pad-x` hook, so the pager aligns with the cells (`ds-table`)
- `ds-banner` body owns the title gap, so `compact` banners with title and body show 4px between them; `--ds-banner-body-font-size` is new (`ds-banner`)
- ds-docs is out of BEM: 865 occurrences across 92 files were flattened, guarded by stylelint `selector-class-pattern` and `selector-nested-pattern` (ds-docs, stylelint)
- `ds-w3w` renders `///daring.lion.race` flush, via an `inline-flex` mark row so template whitespace no longer matters (`ds-w3w`)
- `ds-button` state cascade runs hover, active, disabled, then `:focus-visible` at one class depth, so the focus ring survives hover and disabled buttons do not lift (`ds-button`)
- Lint is at zero for `lint` and `lint:styles` after prettier, stylelint, eslint over the project (repo-wide)
- `ds-button` takes `disabledReason`, which switches to `aria-disabled` so the button stays focusable and the reason is its description (`ds-button`)
- `ds-button` takes `hint` / `warning` / `error` / `messageIcon` / `reserveMessage`, rendered as `ds-field-message` under the button (`ds-button`)
- `ds-button` and `ds-icon-button` take `ariaDescribedBy`; the icon button gets nothing else (`ds-button`, `ds-icon-button`)
- The message inputs moved from `DsFieldBase` into a new `DsMessageBase` that `DsFieldBase` extends (`DsMessageBase`, `DsFieldBase`)
- Decided: standing refusals go inside the button via `disabledReason`, transient refusals use the field message under it, tooltips are out of both (Stas, deck `button-refusal-reason`)
- Decided: no length cap on `disabledReason`, the text wraps and the button grows (Stas, `ds-button`)
- Closed unbuilt: reason as a sibling element with the button left natively disabled (focus never lands, so it is never announced)
- Docs: `/components/button` has a "Refused with reason" section, `components.md` is updated, and a `deleteList` entry retires the `[dsTooltip]`-on-a-disabled-button workaround (`ds-button`)
- Deck CSS is built by `tools/build-deck-css.mjs`, which copies the woff2 fonts beside `ds.css` and exits non-zero on any unresolved `url()` (`presentations/ds.css`, `decks/fonts`)
- `TableColumn.link: (row) => string | readonly unknown[] | null` renders a cell as `<a [routerLink]>`, `null` gives plain text, a click does not fire the row handler (`ds-table`)
- Table link cells paint `--ds-table-cell-link-color` plus underline without hover, and `RouterLink` is instantiated only in the link branch (`ds-table`)
- `--ds-card-overflow` is new and defaults to `visible`; docs recommend `clip` paired with `data-focus="inset"` (`ds-card`)
- Decided: opt-in card clipping rather than clip-by-default, since clipping eats focus rings (`ds-card`)
- `--ds-button-shadow` and `--ds-button-shadow-hover` are new, default `none`; the hover value falls back to the resting one (`ds-button`)

## Manifest detectability and delete-list gates (2026-08-26)
- `check-delete-tables` reads only the first column and requires a shape no sibling entry shares; four rows were written and three rewritten, 80 entries pass (`check-delete-tables`)
- All published manifests carry `surface`, `verify`, `restore` and structured `deleteList` arrays with a greppable `find`; 167 items across 19 releases (`migrations/*.json`)
- Reversed default flips are linked by `supersedes` on the later item (`reserveMessage` 0.7.0/0.7.1, `sortMode` 0.8.0/0.9.0) (`migrations`)
- CHANGELOG delete tables are generated from the `deleteList` arrays so the two copies cannot drift (CHANGELOG, `migrations`)
- `node tools/check.mjs migration-lint` has 34 rules and no warning tier, run by release preflight and as a hard gate in `ci-pr.sh` (`migration-lint`)

## Docs, field messages and focus (2026-08-24)
- `DS_CONFIG.field.stateIcons` defaults a per-state glyph; each of `error` / `warning` / `success` / `hint` can be replaced or `false`, and `false` restores the old look (`DS_CONFIG`)
- `messageIcon` on all fifteen field components overrides `stateIcons`; the glyph is 14px = `--icon-sm` (field components)
- `--ds-field-message-icon-gap` and `--ds-field-message-icon-offset` are new; the glyph centres on the first message line (`ds-field-message`)
- Decided: per-state glyph is the default and configurable per state (Stas, deck `field-message-glyph`, option C)
- Documented trap: two `provideDsConfig` calls in one `providers` array do not merge (`provideDsConfig`)
- Option labels use `overflow: clip` with a `var(--space-1)` clip margin, so descenders show and row heights stay (`ds-select`, `ds-multi-select`, `ds-table`, `ds-breadcrumbs`, `ds-topbar`, `ds-page-header`)
- `valueControlBridge()` holds the `ControlValueAccessor` plumbing; `DsControlValueAccessor` delegates to it and `ds-search` takes the bridge alone (`ds-search`, `DsControlValueAccessor`)
- `ds-search` no longer exposes `hint`, `error`, `warning`, `errors`, `invalid`, `touched`, `reserveMessage`, `messageIcon`; it re-declares `hidden` for signal forms (`ds-search`)
- Migration-lint rule M034 requires a `(delete list: <id>)` citation for prose delete instructions, M033 is deleted, and 13 `deleteList` rows were back-filled (`migration-lint`, `migrations`)
- `focus.owns-the-focus-ring($control)` names the one control a shell speaks for, fixing the doubled ring on `ds-input` and `ds-textarea` and the missing ring on `.search-clear` (`styles/_focus.scss`)
- `tools/check-focus-rings.mjs` fails the build when a component paints a `:focus-within` ring without silencing the base rule; it is the seventh release preflight gate (`tools/check-focus-rings.mjs`)
- `single-line-ellipsis` and `owns-the-focus-ring` are documented public mixins, and `components.md` states per partial whether it emits CSS (`styles/text-clip`, `styles/focus`, `components.md`)
- The next release is a minor, since the two mixins are now public surface (CHANGELOG `Added`)
- A published manifest cannot reference a later release: M028 errors on `supersededBy` and M029 on forward prose, and both chains were relinked (`migration-lint`, `migrations`)

## Assigned batch of eight, release batch decisions and consumer asks (2026-08-21)
- `resolveFieldMessage` bows out when `NgControl` has no `events` stream, so signal-forms fields stop throwing and no longer show a stale first error (`resolveFieldMessage`, `/practice/*`)
- The API extractor reads `public-api.ts` and its barrels, so internal components are excluded and 84 entries became 80 (`tools/extract-component-api.mjs`)
- The `ds-table` docs have a second server-sort demo with `[(sortKey)]` / `[(sortDir)]` and no handler, noting it costs the third click (`/components/table`)
- `TableRowAction` takes `hidden?: (row) => boolean` and `disabledReason?: string | ((row) => string)`; a row with every item hidden renders no kebab (`ds-table`)
- Not built here, kept open as their own P3: `label`-as-a-function and a divider on `TableRowAction` (`ds-table`)
- `ds-modal` takes `status: DsStatus` instead of `error: boolean`, driving badge tint, title colour, default icon and `alertdialog` role; `ds-modal-card` takes it too (`ds-modal`, `ds-modal-card`)
- Decided: modal status is a tinted surface rather than an accent stripe, matching `ds-alert` (Stas, deck `breaking-batch`)
- Chip overflow defaults to `"fit"` (`maxVisibleChips` resolves `null` to `"fit"`); `null` shows all chips and a number caps them (`ds-autocomplete`, `ds-multi-select`)
- Decided: packaging leaves the breaking batch, since no consumer import breaks (breaking batch)
- `ds-breadcrumbs` takes count-based `maxItems`; tabs, `ds-button-group` and `ds-segmented` keep their current behaviour (`ds-breadcrumbs`)
- Chip fit measurement is gated on the mode and reads the trigger rather than the chip row, with a fixed `5em` "+N more" reserve (`chip-overflow.ts`)
- Closed unbuilt: shared picker internals (about 25 lines each against a 30-line helper; revisit at a fourth list picker)
- `node tools/check.mjs docs-links` runs inside `extract-docs` and fails the build on a `routerLink` that matches no NAV entry or loses its fragment (`docs-links`, `extract-docs`)
- `TableColumn.interactive` gives the marked cell `--ds-table-cell-link-color` plus `--ds-table-cell-link-decoration` on row hover, only on `.clickable` tables (`ds-table`)
- `ds-stat` `value` accepts `string | number | null`, so the `number`, `currency`, `percent` and `date` pipes bind; a demo is the strict-templates test (`ds-stat`, `/components/stat`)
- `components.md` has `ds-app-layout` and `ds-auth-layout` entries, and the sidenav token line names `--accent-subtitle` / `--accent-strong` and the active-hover token (`components.md`)
- Stale prose fixed: duplicate `withDot` docblocks merged, search debounce lists three skips, `--ds-stat-value-white-space` says an unwrapped phrase escapes the tile (`ds-badge`, `ds-search`, `ds-stat`)
- The outside-click guard tests the trigger, not the host, on `ds-select`, `ds-multi-select`, `ds-autocomplete`, `ds-time-picker`, `ds-color-picker` (`tools/overlay-guard-harness.html`)
- `variant="tonal"` disabled mixes the label 40% toward `--surface-default`, lifting the dark state gap from 1.11:1 to 2.90:1 (`ds-button`)
- Every `DS_CONFIG`-resolved readback is public (`sizeResolved` on fourteen controls, `elevationResolved`, `paddingResolved`, `reserveMessageResolved` and more); four derivable ones stay `protected`
- `data-focus="inset"` is the fifth focus switch, with `--focus-ring-inset` and `--focus-ring-inset-error`, set on the clipping element (`src/lib/styles/_focus.scss`)
- `--focus-ring-inner` is `transparent`, with manifest entry `focus-ring-inner-transparent` (`src/lib/styles/_focus.scss`)
- The 0.10.0 entry and manifest cover the outline-only `:focus-visible` consumer rule, with a way to find it (`migrations/0.10.0.json`, `universal-focus-ring-base-rule`)
- `ds-search.clear()` is public; it cancels the debounce timer and returns focus to the input (`ds-search`)
- `--ds-dropdown-panel-radius` reaches `ds-multi-select` (`ds-multi-select`)
- `components.md` header no longer warns about a pre-`color`x`variant` `ds-button` API (`components.md`)

## Field states, the disabled recipe and assigned items (2026-08-19/20)
- `ds-sidenav-item` active state is a quiet wash (`--accent-subtitle`) with an `--accent-strong` label instead of a solid pill, shipped on the research Stas asked for (`ds-sidenav-item`)
- The active rail stays on and is `--accent-strong`; `[rail]` input on `ds-sidenav` and `ds-sidenav-item` (`null` follows parent); `--ds-sidenav-item-rail: var(--secondary)` restores orange (`ds-sidenav`)
- Active sidenav hover deepens to `--accent-muted` instead of lightening (`ds-sidenav-item`)
- `maxVisibleChips` accepts `number | 'fit' | 'all' | null`; `null` now means unset, breaking for `"show all"` callers (Stas; `ds-autocomplete`, `ds-multi-select`)
- Disabled `ghost`, `text` and `outline` labels mix 40% label into `--surface-default`; same on `ds-icon-button` `standard` (`ds-button`, `ds-icon-button`)
- `--opacity-muted` is removed from the token scale (tokens)
- Disabled rows in select, date-picker, time-picker triggers, menu-item and dropdown row no longer dim twice; calendar day and `ds-toggle-button` use `--opacity-disabled`
- Closed unbuilt: border or fill on disabled ghost/text and a 0.38 alpha label (Stas rejected a border; alpha ruled out, the shipped recipe already fixes the report)
- `ds-menu` clips rows to the popover's inner radius via `--ds-menu-clip-radius` published by the popover (`ds-menu`, `ds-popover`)
- `ds-date-picker` clears `typedInvalid` and `rangeInvalid` when `value` changes from outside, so no stale "Enter a valid date" over an empty field (`ds-date-picker`)
- `ds-table` row key guard (`event.target !== event.currentTarget`) is in `v0.10.0`; no further DS work (`ds-table`)
- `maxVisibleChips` JSDoc says a number is a ceiling in both pickers (`ds-autocomplete`, `ds-multi-select`)
- Decided: `ds-table` head, `ds-stat` padding (shared `--ds-container-pad`) and `ds-page-header` 28px title stay as defaults; overrides go through tokens (Stas, deck `consumer-default-overrides`)
- `ultra-compact` density drops `--ds-container-pad` to 16px (density tiers)
- `ds-modal` has six tokens `--ds-modal-<header|body|actions>-pad-top` / `-pad-bottom`, each defaulting to the region's `pad-y` (`ds-modal`)
- `AUTHORING.md` requires a `behavior` manifest entry for widened exported types, and `tools/class-surface-diff.mjs` diffs member types (`migrations/AUTHORING.md`)
- `ds-menu-item` has a `description` input rendered under the label, `aria-describedby`, width cap `--ds-menu-item-description-max-width` (`ds-menu-item`)
- `ds-list-item` renders `[leading]` and `[trailing]` outside the button; `selected` puts `aria-current` on the host; migration entry written (`ds-list-item`)
- Decided: border only (Stas, 2026-08-13); the fill he parked closed on six-system evidence with no field fill and the error/warning/success ladder kept (deck `field-validation-states`)
- `ds-segmented` is a form control with `NG_VALUE_ACCESSOR`, `resolveFieldMessage` and an inner `.track` (`ds-segmented`)
- `ds-search` has a form accessor, a `disabled` input, `markTouched()` on blur and a disabled style (`ds-search`)
- Decided: standalone `ds-radio` stays `[(checked)]`-only and the docs say so on `checked`; the group is the form control (`ds-radio`)

## Consumer sweep and the breaking batch (2026-08-11/12)
- `ds-autocomplete` `close()` clears stranded filter text after dismissing over a settled value (`ds-autocomplete`)
- `.link` on a `<button>` inherits font size; eight declarations scoped with `:where()` (link styles)
- `ds-stat` has `--ds-stat-value-white-space` and `--ds-stat-value-font-size`, the latter working at every `size` (`ds-stat`)
- `ds-search` `[debounce]` skips the timer on empty, Clear and Enter (`ds-search`)
- `ds-filter-bar` edge filter focus rings are no longer clipped; `triggerSize` input added (`ds-filter-bar`)
- `DS_CONFIG.modal.dividers` and `DS_CONFIG.brand` are app-level defaults (`DS_CONFIG`)
- `ds-tabs` `urlParam` slugs the label and `rememberLastTab` reopens the last tab per path (`ds-tabs`)
- `ds-avatar` `name` derives initials and the tint hash; the naming rule is replaceable (`ds-avatar`)
- Closed unbuilt: count trigger for pickers (Stas 2026-08-13, nobody asked for a counter)
- Option icons work on all three pickers through the exported `DsOption<T>`; only `ds-select` repeats the glyph in its trigger (`ds-select`, `ds-autocomplete`, `ds-multi-select`)
- `ds-modal` `error: boolean` became `status: DsStatus`, driving badge tint, title colour, default icon and ARIA role (`ds-modal`)
- Chips cap by width by default (`maxVisibleChips: "fit"`); `null` restores growth (`ds-multi-select`, `ds-autocomplete`)
- Decided: page-header 28px title, table head colours and stat 24px padding stay; four identical overrides in one workspace count as one opinion (researched and decided 2026-08-12, C1-C3)
- `ultra-compact` compresses `--ds-container-pad` to 16px so cards match the compressed cells (density tiers)
- Disabled picker options dim once; `ds-button` and `ds-icon-button` never read `--opacity-muted` (deck `disabled-recipe`)
- `ds-table` `[loading]="true"` shows a skeleton while no rows are visible and an overlay once there are (`ds-table`)
- `ds-table` `sortKey` and `sortDir` are `input` + `output` pairs over a `linkedSignal`, so the sort direction no longer vanishes (`ds-table`)
- `ds-table` has one `[toolbar]` slot; several controls are laid out by the row, a single element gets the full width, and the row hides when empty (`ds-table`)
- `ds-table` withholds the empty row while `loading !== false` (`ds-table`)
- `ds-table` `runExport()`, `exporting()` and `exportStatus()` are public; the `exportCsv()` doc is corrected (`ds-table`)
- `ds-modal` and `ds-bottom-sheet` dismiss only when press and release both land on the backdrop (`core/backdrop-dismiss.ts`)
- `provideDsConfig` gained seven keys, input then config then built-in: `control.size`, `card.elevation`, `card.padding`, `table.stickyScrollbar`, `table.bordered`, `icon.size`, `badge.withDot`
- `resolveWithConfig(input, pick, fallback)` is the one config resolver (`core/config-defaults.ts`)
- Decided: configurability only, no new defaults from one consumer's templates (Stas)
- `/comments` review command exists globally (tooling)
- Migration manifests exist for 0.6.1, 0.6.2 and 0.9.1; `--ds-dropdown-panel-radius` is the real lever (migrations, dropdown panel)

## Signal Forms, exit motion and the radius role layer (2026-08-10)
- Decided: DS form controls already bind to Angular Signal Forms via `[formField]`; no DS API change needed (Practice, Signal Forms page)
- `ds-input`, `ds-textarea` and `ds-number-stepper` accept `undefined` for `min`, `max` and `maxLength` (write type widened only)
- `readonly` aliases `readOnly` on `ds-input`, `ds-textarea` and `ds-select`
- `ds-input` and `ds-textarea` expose `pattern` and `minLength` as native attributes; several patterns are ANDed with lookaheads
- `hidden` is declared once on each control-value-accessor base, so thirteen controls honour `hidden()` rules (`DsControlValueAccessor` bases)
- `focus()` reaches the real value element through one resolver on each CVA base (all twelve verified)
- `optionalBound` and `boundOr` hold the bound write-type explanation once (`core/field-bounds.ts`)
- A 32px toolbar is `density="compact"` on the container; documented on the Density page (docs)
- `ds-table` first-resize width recording and truncate-only clip detection are documented where readers meet them (docs)
- Theming page has a "square brand" example; zeroing the three radius roles squares everything (docs)
- `--ds-radius-inner` is read by all 33 former `--radius-sm` reads; five focus-ring radii stay on the raw scale (component stylesheets)
- The shared dropdown panel reads `--ds-radius-panel` (`styles/_dropdown-overlay.scss`)
- Leave keyframes are swappable: teardown checks the animated element's own `animationend`; four global exit presets mirror the entrances (`ds-modal`, `ds-drawer`, `ds-bottom-sheet`)

## Modal header and the template lint rules (2026-08-07/10)
- `ds-modal` has `--ds-modal-pad-x` plus `--ds-modal-header-pad-y`, `-body-pad-y` and `-actions-pad-y` (`ds-modal`)
- `ds-modal` `[dividers]` (default `true`) drops both rules and the body vertical padding when `false` (`ds-modal`; Stas)
- `ds-modal` and `ds-modal-card` have a `[title-badge]` slot and a `subtitle` input, with `title` still naming the dialog (`ds-modal`, `ds-modal-card`)
- `devWarn(() => string | null)` fires once per distinct message and replaces seven hand-written warnings (`src/lib/core/dev-warning.ts`)
- Migration guide has a "What you can now DELETE" table of consumer workarounds (`migrations/unreleased/README.md`)
- `ds-autocomplete` has `maxVisibleChips` ported from `ds-multi-select` (`ds-autocomplete`)
- `ds-tabs` dev-warns when two strips share one `urlParam` (`ds-tabs`)
- Template lint rules handle CRLF through `detectEol`, and `<pre>` and `<textarea>` content is no longer reindented (`eslint-rules/eol.mjs`)

## Agent-portal audit and consumer overrides (2026-08-06/07)
- `ds-stat` takes a projected `[dsStatValue]`; `value` is optional and a dev warning fires when `unit` is set without it (`ds-stat`)
- `ds-badge` has `--ds-badge-white-space` (default `nowrap`) (`ds-badge`)
- `ds-card` inner box has `height: 100%` so grid rows paint equal heights (`ds-card`)
- `ds-search` defaults to 40px, sizes off the field scale and falls through `--ds-field-height`; migration written (`ds-search`)
- `ds-table` has `--ds-table-head-pad-top` and `-bottom`; compact density retunes tokens instead of pinning cell padding (`ds-table`)
- `ds-table` forwards `showPageSize` and `showLabel` to its pager (`ds-table`)
- `ds-autocomplete` has `dsAutocompletePrefix` and `dsAutocompleteSuffix` slots, `[showChevron]`, a public `clear()` and `--ds-autocomplete-panel-maxh` (`ds-autocomplete`)
- `ds-autocomplete` panel reads `--ds-radius-panel` through a resolver on `.autocomplete-list` (`ds-autocomplete`)
- Date and time picker triggers resolve `--ds-date-picker-trigger-pad-x` and `--ds-time-picker-trigger-pad-x` from `--field-pad-x` (`ds-date-picker`, `ds-time-picker`)
- `ds-description-item` term takes the five eyebrow properties and the details side three (`ds-description-item`)
- 21 token hooks replace shorthand-swallowed values in `ds-segmented`, `ds-tabs`, `ds-menu` and `ds-checkbox`, defaults unchanged
- `ds-menu-item` has a `[quiet]` input beside `[error]`; `error` wins when both are set (`ds-menu-item`)
- `--ds-option-selected-bg-color`, `-label-color`, `-check-color` and one more `--ds-option-*` hook style the selected option (`_dropdown-overlay.scss`)
- `tools/extract-tokens.mjs` reads `--ds-*` hooks declared in shared partials (`tools/extract-tokens.mjs`)
- Radius and elevation roles reach portaled panes only when the host overrides them (`forwardOverlayTokens`)
- `ds-table` `[lazy]` with `(lazyLoad)` emitting `{first, rows}`, a sparse `data` array of `total` length and skeleton rows in the gaps (`ds-table`)
- Decided: `design-system.md` holds rules only; the catalogue moved to `components.md`; both ship in the npm package (Stas)
- `ds-field-group` composes `select`, `input`, `search`, `autocomplete`, `date-picker` and `button` with one border and one focus ring via `DS_FIELD_GROUP` (`ds-field-group`)
- Decided: `ds-field-group` excludes `ds-number-stepper` and `ds-multi-select` and has no group-level label or hint (`ds-field-group`)

## ds-table retirement spec for mm-broker (2026-08-06)
- `ds-table` has `filterMode: 'client' | 'server' | 'none'` and `columnFilterOptions`, with a dev warning for `filter: 'set'` plus `total` and no mode (`ds-table`)
- `dsHeaderFilter` projects a custom header filter, takes `active` and its context carries `close` (`ds-table`)
- `ds-table` has one `role="status"` region announcing sort and row range; `sortAnnouncement` and `rangeAnnouncement` own the wording (`ds-table`)
- Clip detection walks descendants in `truncate` columns, and a clipped resized header gets a `title` on pointer-enter (`ds-table`)
- Column resize handle is a focusable `role="separator"`; Arrow 16px, PageUp/PageDown 64px, Home returns to auto (`ds-table`)
- The first resize freezes every visible column width once; headers carry `data-col-key` (`ds-table`)
- `exportFetcher` may resolve rows, a `Blob` or a URL, and `exportFailed` emits the rejection (`ds-table`)
- `--ds-table-min-width` and `--ds-table-hscroll-bottom` exist, defaults 0 (`ds-table`)
- `sortValue` strings compare with `sensitivity: 'base'` and `numeric: true` (`ds-table`)
- `ds-date-picker` trigger shows an `open` class styled like focus; the glyph shares the field handler (`ds-date-picker`)
- Decided: a pointer open does not move focus into the grid, the keyboard does (Stas, `ds-date-picker`)
- Dropdown option rows have a pressed state, including a selected variant (`styles/_dropdown-overlay.scss`)
- `ds-icon` dev-warns with the offending value when a name resolves to empty (`ds-icon`)
- `ds-tabs` `urlParam` input reads names from its `ds-tab` values, writes nothing for the first tab, uses `replaceUrl`, router injected optionally (`ds-tabs`; Stas)
- `ds-autocomplete` single mode collapses the empty input beside a settled value; docs state the list decides between it and `ds-select` (`ds-autocomplete`)
- `LayoutNavigationService` is exported and `ds-app-layout` has `scrollReset: 'path' | 'never' | 'always'`, default `'path'` (`ds-app-layout`)

## New components, docs and decisions (2026-08-05)
- `design-system.md` states the read-with-fallback token contract once (`design-system.md`)
- Form layout docs have a live `gap="md"` versus `gap="none"` demo and a mixed-stack case (`patterns/form-layout`)
- Decided: the DS ships five hand-built, dependency-free charts, reversing the skip (Stas, ME-358; `ds-bar-chart`, `ds-column-chart`, `ds-donut-chart`, `ds-funnel-chart`, `ds-line-chart`)
- Decided: no standalone calendar; re-open on the first real request (Stas)
- ds-docs has a `core/` tier holding `nav.config.ts`, removing the shared/layout cycle (`sheriff.config.ts`)
- Overlays fade out about 120ms on dismiss and close instantly on select; `disposeWithLeave(ref, cause)` defaults to `'select'`; Tab stays instant (overlay helper)
- Decided: keep both autocomplete `multiple` and `ds-multi-select`; the list decides; the word "combobox" is out; tokens are `--picker-*` (Stas)
- `ds-time-picker` range segments announce `required` through `aria-required`; docs have a labelled required range demo (`ds-time-picker`)
- ds-docs moves focus to `<main>` after client-side navigation; the shell makes `main` focusable (`SectionGroupPage`)
- `ng add` works: the schematic is `index.cts` emitting `index.cjs`, named in `collection.json`, build fails if the emit is missing (schematics)
- `ds-checkbox`, `ds-switch` and `ds-radio` render projected captions, collapsed with `:empty` when none (`ds-checkbox`, `ds-switch`, `ds-radio`)
- Caption hooks `--ds-checkbox-label-color`, `-label-font-size`, the same pair on `ds-switch`, and `--ds-radio-label-font-size` exist (`ds-checkbox`, `ds-switch`, `ds-radio`)
- `ds-table` `[virtualScroll]` with `virtualRowSize` keeps about 25 rows in the DOM using spacer rows, not the CDK viewport, with fixed row height and three dev warnings (`ds-table`)
- `ds-table` zebra uses absolute index in virtual mode; the `stickyHeader` x `stickyFirstColumn` z-index bug is fixed (`ds-table`)
- `ds-filter-bar` is a Priority+ row with `<ng-template [dsFilterItem]="180">`, slot widths enforced, trigger reserved only when needed, and marked trailing controls (`ds-filter-bar`)
- `ProjectionDroppedDirective` has a `reason` input (`ProjectionDroppedDirective`)
- `ds-auth-layout` (renamed from `ds-auth-shell`) scaffolds pre-login screens with a masthead, `ds-card` and `[dsAuthSupport]` slot; auto margins and safe-area insets (`ds-auth-layout`; Stas)
- `ds-password-rules` shows a live checklist with `passwordRulesMet`, `showUnmet`, `listId`, `role="list"` and per-row state words (`ds-password-rules`)

## Consumer-report re-audit, focus switch and scroll restoration (2026-08-04)
- Global focus-style switch: `<html data-focus="ring|field|edge|outline">` retargets the field and control focus shadow roles; no attribute keeps today's split (`styles/focus`)
- `outline` focus style emits a zero-specificity `:where(:focus-visible)` outline rule while the shadow roles go to `none` (`styles/focus`)
- Focus indicators survive forced-colors mode via a `@media (forced-colors: active)` rule using `CanvasText` (`styles/focus`)
- `ds-button` exposes six type and box hooks re-resolved per size class, and reflects `data-variant`/`data-color` on the host (`ds-button`)
- Dead `layout/header.component.ts` and its barrel line deleted (`ds-docs`)
- `ds-table` persists the column models via `persistLayout` + `storageKey` and has an opt-in export button via `exportButton`, `exportFilename`, `exportFetcher` (`ds-table`)
- Browser verification of the responsive rail, `dsTooltip` focus fix, shell demos, docs shell migration and field-message ladder is done; it found the three shell bugs fixed below (`ds-app-layout`, `ds-docs`)
- Role layer for radius, elevation and motion: 32 radius, 8 shadow and 7 motion files resolve through `--ds-radius-*`, four elevation roles and five motion roles with unchanged defaults (`_tokens.scss`)
- Old `--shadow-<surface>` aliases resolve through the elevation roles, so both names work (`_tokens.scss`)
- Opt-in `restoreScroll` on `ds-app-layout` restores the scroll offset per path from `sessionStorage` after history traversal, `state: { dsRestoreScroll: true }` or reload (`ds-app-layout`)
- `ds-app-layout` offers `contentReady()` and `consumePendingOffset()` for virtualizers; `restoreScroll` is a no-op on routes that scroll themselves (`ds-app-layout`)
- `ds-table` persists the three column models via `persistLayout` + `storageKey` and has an opt-in export button (`exportButton`, `exportFilename`, `exportFetcher`) (`ds-table`)
- Field height routes through `--field-h-sm`/`-md` plus public `--ds-field-height`, which beats the size class (field family)
- Token extractor is wired by hand for the two new partials because it sweeps only `*.component.scss` (`tools/extract-tokens.mjs`)
- Role layer for radius, elevation and motion: 32 radius, 8 shadow and 7 motion files resolve through roles with unchanged defaults (`_tokens.scss`)
- `ds-field` unresolved-message warning text corrected to say the hint renders in the error state (`ds-field`)
- Nested `ds-app-layout` instances no longer share rail state; state lives on `.rail.open` (`ds-app-layout`)
- Embedded `ds-app-layout` rail overlay is `position: absolute` inside a `position: relative` host, so it stays inside its box (`ds-app-layout`)
- Docs scroll-spy path rewrites carry `state: { dsSamePage: true }`, so the layout no longer scrolls to top on section boundaries (`ds-app-layout`, `ds-docs`)
- Rail focus restore belongs to dismissal only; navigation and breakpoint changes clear `railOpen` without refocusing the burger (`ds-app-layout`)
- Four mojibake dashes repaired byte-exactly in one source file (`ds-docs`)
- An unresolvable group page in `ds-docs` redirects home instead of rendering blank (`ds-docs` routes)
- `ds-docs` runs on `ds-app-layout`: hand-rolled grid, second `matchMedia`, `ds-drawer` and second sidebar dropped (`ds-docs`)
- `ds-app-layout` drops the `mode="drawer"` input; its effects read the new `railOverlay()` (`ds-app-layout`)
- `LayoutScrollService` gained a public `scroller` signal and an absolute `scrollTo(top)` that assigns `scrollTop` (`LayoutScrollService`)
- `ds-button` and `ds-icon-button` forward `ariaExpanded`/`ariaControls` to their inner `<button>` (`ds-button`, `ds-icon-button`)
- `ds-table` `clientSort` replaced by `sortMode` (`client|server|none`) with client sorting as default; one dev warning stays for bound `total` + sortable columns + undeclared mode (`ds-table`; breaking)
- Decided: `sortMode` over reading `OutputEmitterRef.listeners` or warning on the bare combination, unblocked by Stas allowing breaking changes (`ds-table`)
- `dsRailTrigger` directive toggles `railOpen` and sets `aria-expanded`/`aria-controls` only while `railOverlay()` is true; `railId` and `railOverlay` are public (`ds-app-layout`)
- Field family has `error` and `warning` beside `hint` on all 14 fields, shown as one ladder: error, then warning, then hint (field family)
- Field errors input conforms to Angular 21 `FormUiControl` and declares its own `DsFieldError` type instead of importing the experimental one (field family)
- Decided: error texts live in the consumer at the validator, with `DS_CONFIG.field.errorMessages` as one shared fallback map and no English defaults (Stas)
- Reactive forms are read via `NgControl` `control.events` and submission via `NgForm`/`FormGroupDirective`; an invalid field with no text still renders `hint` in the error state (field family)
- `ds-date-picker` keeps its own "enter a valid date" message at the error rung below an explicit `error` (`ds-date-picker`)
- `dsTooltip` tracks `describedElement` and `focusedTarget` separately, so hover-then-focus no longer strands `aria-describedby` on the host (`dsTooltip`)
- `ProjectionDroppedDirective` gives `ds-checkbox`, `ds-switch` and `ds-radio` one shared silent-projection warning (`ProjectionDroppedDirective`)
- Decided: drop the hard-coded `1024px` fallback for `--bp-lg`; a missing value leaves desktop mode and logs a dev error (Stas, `ds-app-layout`)
- `TableColumn.sortValue` sorts by the domain value; blanks sort last in both directions and text collates with `{ numeric: true }` (`ds-table`)
- `ds-pagination`'s inner `ds-select` is pinned to `reserveMessage: false` (`ds-pagination`)
- `ds-stat` card fills a stretched host via `height: 100%` on `.stat` (`ds-stat`)
- Closed: the A11y P0/P1 track, delivered through the `a11y` branch and follow-ups (`library-audit.md`)
- Decided: `reserveMessage` default flipped to `false`, with group opt-in via `dsReserveMessages`; `gap="none"` on `ds-stack` pairs with the opted-in case (Stas, field family)
- Responsive rail on `ds-app-layout`: below `lg` it slides over a scrim via two-way `railOpen`, `railLabel` names it, and closes on scrim, Escape and path change (`ds-app-layout`)
- Rail dialog semantics are gated on a `compact` signal; the breakpoint is read from `--bp-lg`; body scroll lock skipped (`ds-app-layout`)
- `LayoutNavigationService` defines "path changed" once for the scroll reset and the rail (`LayoutNavigationService`)
- Rail tokens `--ds-app-layout-rail-bg-color`, `-rail-shadow` and `--ds-app-layout-scrim-color` added (`ds-app-layout`)
- Picker value typography tokenised via `--ds-date-picker-value-*` and `--ds-time-picker-value-*` (font-family, font-size, weight); clock glyph moved to the trailing edge at 16px (`ds-date-picker`, `ds-time-picker`)
- `ds-time-picker` gained `label`/`required`/`optional`; aria wiring covers the single-mode trigger only (`ds-time-picker`)
- Section-marker comments stripped from every ds-docs template: 266 deletions, 0 insertions (Stas, `ds-docs`)
- `ReserveMessagesDirective` lives in its own folder with an `index.ts` and a `export *` barrel line, which keeps the barrel tree-shakeable (`public-api.ts`)
- `LayoutNavigationService` is `providedIn: 'root'`, so the exported `LayoutScrollService` stays providable (`LayoutNavigationService`)
- Closed unbuilt: collapsed `ds-sidenav` rail tooltip orphaned by click focus (did not reproduce on 0.7.0)
- `ds-app-layout` and `tokens-reference` have nav entries, so `/components/app-layout` and `/reference/tokens-reference` render (`nav.config.ts`)
- Closed: raw-specimen tidy-up; only `.day-specimen` stays raw by design (`ds-docs` specimens)
- `LayoutScrollService` resets the scroller only on a path change, not on query or fragment changes; `scrollToTop()` stays public (`LayoutScrollService`)
- `cellTemplateMap` doc comment uses a generic example (`ds-table`)

## mm-ecm agent-portal migration items (2026-07-31)
- Closed: all 11 items from the mm-ecm agent-portal dogfooding, shipped across this chunk and the 2026-07-31 and 2026-08-04 sections (ds-table, ds-modal, ds-button, field family)

## mm-ecm dogfooding batch and width hooks (2026-07-31)
- Selected dropdown option keeps its tint on hover and keyboard-active via a `:not(.is-selected)` neutral branch and a `--primary-muted` selected step (`_dropdown-overlay.scss`)
- `ds-modal-card` and `ds-modal` accept an `[eyebrow]` slot with `--ds-modal-eyebrow-*` tokens, expose `--ds-modal-title-font-size`, and hide an empty actions strip (`ds-modal`)
- `ds-table` has asymmetric padding via `--ds-table-cell-pad-{top,right,bottom,left}` plus `--ds-table-head-border-color`, `-head-weight`, `-head-tracking` (`ds-table`)
- `ds-table` takes a `[rowId]` accessor and a public `rowKey(row)`; the row type relaxes to `object` (`ds-table`)
- `ds-pagination` gained `showPageSize` and `--ds-pagination-label-font-size`/`-weight`/`-color` (`ds-pagination`)
- `provideDsConfig({ field: { reserveMessage } })` sets the default for all 14 message-bearing fields; per-field input still wins (`components/field-defaults.ts`)
- `--ds-checkbox-radius` and `--ds-date-picker-panel-radius` added; the latter is forwarded to the portaled pane (`ds-checkbox`, `ds-date-picker`)
- `ds-table` sort "off" click no longer desyncs the header; the key is kept and `sortDir === null` alone means unsorted (`ds-table`)
- `ds-search`, `ds-input` and `ds-textarea` have a public `focus(options?)` (`ds-search`, `ds-input`, `ds-textarea`)
- Decided: no `aria-disabled` mode on `ds-button` for the Clear-button focus case (`ds-button`)
- `ds-date-picker` and `ds-time-picker` take an opt-in `fullWidth` host class (`ds-date-picker`, `ds-time-picker`)
- Width hooks added: `--ds-popover-min-width`, `--ds-menu-min-width`/`-max-width`, `--ds-toast-min-width`/`-max-width`; the menu pair is forwarded onto the portaled pane (`ds-popover`, `ds-menu`, `ds-toast`)

## Customizable surface motion (2026-07-31)
- Picker value typography tokenised via `--ds-date-picker-value-*` and `--ds-time-picker-value-*`; clock glyph moved to the trailing edge at 16px (`ds-date-picker`, `ds-time-picker`)
- Four global presets `ds-slide-in`, `ds-scale-in`, `ds-fade-in`, `ds-slide-edge-in`; consumer keyframes must also be global (`styles/_surface-motion.scss`)
- Overlay panels enter from the trigger edge via `data-ds-placement` stamped by `prepareOverlayEnter()`; `overlayPlacementOf` moved to `overlay-motion.ts` (`overlay-motion.ts`)
- Reduced motion wins over a consumer entrance because duration and easing stay library-owned longhands (`_surface-motion.scss`)
- `ModalService.confirm()` no longer sets the dead `panelClass: 'ds-overlay-pane'` (`ModalService`)
- Token extractor scans `_overlay-motion.scss` as an "Overlay panels" group; 44 token descriptions added; ds-docs `foundations/motion` has an "Entrance presets" block (`tools/extract-tokens.mjs`, `ds-docs`)
- `ds-docs/src/styles.scss` imports `styles/overlay-motion` and `styles/surface-motion` (`ds-docs`)

## Dogfooding fixes and feature gaps (2026-07-29)
- `reserveMessage` reserves the message-row height on `ds-input` and the other message-carrying fields; default later reversed to off (Stas) (field family; breaking)
- `ds-select` clear-x is a real nested `<button>` inside `<div role="combobox" tabindex="0">`, so it is keyboard-accessible (`ds-select`)
- `ds-search` has a `size` input (`sm` 32px, `md` 36px, `lg`) and its scss size modifiers now bind (`ds-search`)
- `ds-table` takes a `total` input for server-side paging and skips its own row slice when supplied (`ds-table`)
- `dsTooltip` closes on `click`/`pointerdown` and disposes an existing `ref` before showing, so no orphaned panels remain (`dsTooltip`)
- `ds-table` `sortingOrder` input lets a consumer drop the unsorted state, e.g. `['asc','desc']` (`ds-table`)
- `TableColumn.srLabel` gives label-less columns a visually-hidden accessible name (`ds-table`)
- Collapsed `ds-sidenav` no longer shows a 1px horizontal overflow: item width 100% plus `overflow-x: clip` (`ds-sidenav`)
- `ds-badge` `countLabel` input sets the noun in the count's `aria-label` (`ds-badge`)
- Three date-picker template lint warnings are closed with scoped `eslint-disable`s (`ds-date-picker`)
- `ds-table` `animateHeight` input (opt-in) tweens height on row-set change with a `ResizeObserver` (`ds-table`)
- `avatarTint(seed)` gives a deterministic palette-safe tint, with an `initialsFrom` helper (`ds-avatar`)
- ds-docs `patterns/form-layout` gained "Validation & messages" guidance (`ds-docs`)
- `--ds-sidenav-item-label-weight` and `--ds-modal-title-weight` exposed; `--ds-avatar-size` wins at every size class (`ds-sidenav-item`, `ds-modal`, `ds-avatar`)
- `ds-table` clamps an out-of-range `page` after a filter and has an opt-in `scrollToTopOnPageChange` (`ds-table`)
- Dead `mask-attachment: fixed` lines removed from the skeleton shimmer (`ds-skeleton`)
- `--ds-t-*` typography hooks (~95) appear in the ds-docs token reference under "Typography utilities" (`tools/extract-tokens.mjs`)
- `BodyScrollLockService` ref-counts body scroll lock across `ds-modal`, `ds-drawer` and `ds-bottom-sheet` (`BodyScrollLockService`)
- `ds-pagination` drops the manual `(pageChange)`/`(pageSizeChange)` outputs; use two-way `[(currentPage)]`/`[(pageSize)]` (`ds-pagination`; breaking)
- `ds-input` `withAddon`/`withAddonRight` removed; the flush-addon layout derives from a projected boxed `.addon` via `:has()` (`ds-input`; breaking)
- `ds-sidenav-item` has an `(activate)` output that emits the click `MouseEvent` (`ds-sidenav-item`)
- `dsTooltip` listens to `focusin`/`focusout`, so wrapper components open it on keyboard focus (`dsTooltip`)
- A disabled `ds-menu-item` is keyboard-focusable via `aria-disabled="true"` and shows its `dsTooltip` on focus (`ds-menu-item`)
- ds-docs shell demos use independent `collapsed` signals, shared wordmark scss in `section-demo.scss`, and token descriptions and JSDoc for the app-shell and sidenav-footer (`ds-docs`)
- Stale `_forced-states.scss` references, the orphaned `_dropzone.scss` specimen and `DocsAwaitComponent` removed (`ds-docs`)

## Backlog review verified as done (2026-07-24)
- Non-modal overlay pattern covers select, autocomplete, multi-select, time-picker, color-picker and popover via shared `overlay-motion.ts` helpers (`overlay-motion.ts`)
- Date-picker calendar is `role="grid"` with row, columnheader and gridcell roles, `aria-selected` day cells, and a `role="dialog"` popup with `cdkTrapFocus` (`ds-date-picker`)
- `ds-autocomplete` has a `width` input (`fill|content`), `--ds-autocomplete-maxw` and a 80px minimum typing area (`ds-autocomplete`)
- `.t-*` utilities read each type property as a longhand through `--ds-t-<name>-<prop>` tokens; default rendering unchanged (`_typography.scss`)
- Decided: per-axis longhand tokens rather than one shorthand token, border split out (Stas, `_typography.scss`)
- Focus-ring follow-ups closed: `ds-search` inner input is `.search-input` and autocomplete focus uses `--focus-field` (`ds-search`, `ds-autocomplete`)

## Bottom-sheet Escape scoping (2026-07-17)
- Bottom-sheet Escape is bound with `(keydown.escape)` on `.sheet-overlay` instead of the document, matching modal and drawer (`ds-bottom-sheet`)

## Sidenav brand slot (2026-07-17)
- `ds-sidenav` accepts a projected `[brand]` slot for a custom logo; `.brand:empty` collapses it, so an unbranded rail is unchanged (`ds-sidenav`)

## Component-vs-class audit (2026-07-09)
- Decided: keep all 8 candidates as components (checkbox, radio, switch, divider, status-dot, badge, skeleton, spinner); no demotions

## Picker portfolio rename and merge (2026-07-07)
- `ds-combobox` renamed `ds-autocomplete` across selector, types, `--ds-autocomplete-*` tokens, classes, docs and CHANGELOG; ARIA `role="combobox"` kept (`ds-autocomplete`; breaking)
- `ds-dropdown` merged into `ds-select`, which absorbed `readOnly`; Dropdown docs section and `_field.scss` specimen sheet retired (`ds-select`; breaking)

## A11y component wave (2026-07-06)
- Bottom-sheet has `role="dialog"`, `aria-modal`, `aria-labelledby` and `cdkTrapFocus` (`ds-bottom-sheet`)
- Number-stepper buttons have static "Decrease"/"Increase" labels and a new `ariaLabel` input names the number input (`ds-number-stepper`)
- Avatar-group `+N` overflow span carries `aria-label` "N more" (`ds-avatar-group`)
- Select option buttons have `tabindex="-1"` (`ds-select`)
- Autocomplete empty state is `role="status"` rather than a selectable option (`ds-autocomplete`)
- `ds-field-message` mounts its error variant as a fresh `role="alert"` node so it announces reliably (`ds-field-message`)
- `ds-sidenav-item` sets link `aria-label` only while the sidenav is collapsed (`ds-sidenav-item`)
- Closed unbuilt: tooltip `aria-describedby` and overlay `backdropClick` findings (verified not bugs)
- Closed unbuilt: accordion dangling `aria-controls` (region renders unconditionally, not a bug)

## Field-override review (2026-07-06)
- `ds-search` max-width defaults to `none` with `--ds-search-maxw` opt-in; dead `--search-maxw` token removed (Stas, `ds-search`)
- Closed: tabs pills overflow is covered by the `[scrollable]` input (`ds-tabs`)

## Time-picker and feature-gap lanes (2026-07-03)
- New `ds-time-picker`: column-wheel overlay, 24h/12h via `DsConfig.timePicker.format`, `minuteStep`, `"HH:MM"` value, `min`/`max`/`disabledTime`, single and range, CVA (`ds-time-picker`)
- Decided: date-picker datetime footer rejected visually and reverted (Stas, `ds-date-picker`)
- `ds-checkbox`, `ds-radio` and `ds-switch` have `size` (`sm|md|lg`) and `required`; radio also has `invalid` and `hint` (`CheckboxSize`, `RadioSize`, `SwitchSize`)
- `ds-input` and `ds-textarea` have `[maxLength]` with an `aria-live` char counter; textarea has `[readOnly]` (`ds-input`, `ds-textarea`)
- `ds-date-picker` has `minDate`/`maxDate`, `disabledDate` and `presets` (`DatePickerPreset`)
- `ds-select` has `clearable` and per-option `icon`; dropdown and combobox have `optionGroups`; combobox has `allowCreate` and `(create)` (`ds-select`, `ds-autocomplete`)
- `ds-table` has `[expandableRows]`, `[(expandedIds)]` and `[rowExpandTemplate]` (`ds-table`)
- `ds-modal` has `[closeOnBackdrop]`, `[persistent]` and `xl`/`fullscreen` sizes; `ds-drawer` has `[placement]` and `sm`; `ds-bottom-sheet` has `[snapPoints]` (`DrawerPlacement`)
- `ds-toast` has a `'loading'` variant, `ToastService.promise()` and `DsToastConfig.maxVisible`; `ds-menu-divider` and submenus via `[submenu]` added; `ds-popover` has `[arrow]` and `[placement]` (`PopoverPlacement`)
- `ds-tabs` has `[lazy]`, `[scrollable]`, `[closable]` with `(tabClose)` and `[orientation]`; tab has `value` (`TabsOrientation`)
- `ds-accordion` has `[multi]` and item `[disabled]`; `ds-stepper` has `[clickable]`, `(stepClick)`, `[errorSteps]` and `[orientation]` (`accordion.token.ts`, `StepperOrientation`)
- `ds-sidenav-item` shows a collapsed tooltip; `ds-badge` has `[count]` and `[max]`; `ds-avatar` has `[status]` and `[fallbackIcon]` (`sidenav.token.ts`, `AvatarStatus`)

## Board reconciliation of already-shipped items (2026-07-06)
- ds-docs sidebar nav is sorted A to Z with a `ds-search` filter (`nav.config.ts`)
- Truncation rules sit in a shared `<docs-truncation [rules]>` info popover adopted across ~35 sections (`docs-truncation.component.ts`)
- `ds-banner [compact]` tightens padding (`ds-banner`)
- `--ds-input-label-color`/`-fs`/`-fw` resolvers exist (`ds-input`)
- Table sortable header is a native `<button>` with `aria-sort` (`ds-table`)
- Combobox chevron toggles the panel closed (`ds-autocomplete`)

## Dark theme, ds-color, button axes and components (2026-06-30)
- `ds-button` split into `color` (primary, secondary, tertiary, neutral, error, success, warning) and `variant` (solid, tonal, ghost, outline, text); `ds-icon-button` gained `color` (`ds-button`; breaking)
- `ds-color` scoped accent: `--accent-*` layer plus `[ds-color="secondary|tertiary|error|success|warning"]` and the `ds.color()` mixin; components read `--accent*` (`styles/_ds-color.scss`)
- Smooth-motion rollout: interactive state changes ease on `--duration-*`/`--ease-*` and floating panels fade and slide via the shared overlay-motion helper (all components)
- Accordion open and close animate with grid rows `0fr` to `1fr` (`ds-accordion`)
- Closed: overlay theme-token scoping (not a bug, a Chrome-automation artifact)
- Dark theme under `themes/dark/`: opt in via `<html data-theme="dark">`, `provideDsTheme({ followSystem: true })` for OS follow, `themes/default` renamed `themes/light` (`themes/`)
- `--static-white` and `--static-ink` theme-independent on-fill anchors added (`_tokens.scss`)
- Dark chart tokens added: sequential and divergent ramps plus hover and tooltip surfaces (`themes/dark`)
- `--space-stack` and `--space-inline` semantic spacing aliases added (`_tokens.scss`)
- Component gap list shipped: `ds-multi-select`, `ds-slider`, `ds-otp-input`, `ds-color-picker`, `ds-tree`, `ds-segmented`, `ds-list`, `ds-timeline`, `ds-description-list`, `ds-loading-overlay`
- Button and layout primitives shipped: `ds-button-group`, `ds-split-button`, `ds-toggle-button`, `ds-stack`, `ds-inline`, `ds-container`
- Internal data-grid folded into `ds-table`, and confirm-dialog folded into `ModalService.confirm()` (`ds-table`, `ModalService`)
- `ds-alert` shipped as the compact inline status with 5 variants, `title`, `[dismissible]`, `[actions]`, `icon`, `(dismissed)` (`ds-alert`)
- Boolean CVA base `DsBooleanControlValueAccessor` for checkbox and switch; combobox and date-picker gained `disabled` and CVA; new `ds-radio-group` with roving focus (`ds-radio-group`)
- `hint`/`invalid` rolled out via shared internal `ds-field-message`; `--ds-input-hint-*` renamed `--ds-field-message-*`; `--field-label-gap` added (field family; breaking)
- Checkbox, radio and switch have an inline `[label]` (`ds-checkbox`, `ds-radio`, `ds-switch`)
- `ds-input` has a `[loading]` spinner and a `[floating]` label (`ds-input`)
- Date-picker calendar header uses month and year grid pickers (12 years per page) with `[minYear]`/`[maxYear]`; `ds-calendar-day` extracted as internal (`ds-date-picker`)
- Date-picker Sunday column no longer overflows, via `repeat(7, minmax(0,1fr))` (`ds-date-picker`)
- ds-docs Menu section has an interactive trigger-opened demo (`ds-docs`)
- Switch has `role="switch"`, `aria-checked`, `label`/`ariaLabel` (`ds-switch`)
- Checkbox has `label`/`for`, `aria-invalid`/`required`, describedby and `booleanAttribute` (`ds-checkbox`)
- Radio and `ds-radio-group` have `role="radiogroup"`, roving tabindex and group label (`ds-radio-group`)

## Architecture and tokens (2026-06-25)
- Button and icon-button read public `--ds-*` tokens through private `--_button-*` resolvers; hover and pressed derive via `color-mix` from the bg token (`ds-button`, `ds-icon-button`)
- `_tokens.scss` is pure tokens; `ds.scss` forwards `fonts` and `link`, and `ds-docs/src/styles.scss` composes them explicitly (`styles/ds`)
- Token names spelled out: `--fw`, `--fs`, `--lh`, `--ls`, `--s`, `--r`, `--bw`, `--dur` became `--font-weight`, `--font-size`, `--line-height`, `--letter-spacing`, `--space`, `--radius`, `--border-width`, `--duration`; no aliases (Stas; breaking)
- Elevation primitives `--z100..z400` renamed `--shadow-1..4`; `--layer-*` kept as the z-index scale (`_tokens.scss`; breaking)
- Decided: `subtitle` is the canonical tint role name (`--*-subtitle`); swatch labels in `color.section.ts` aligned (Stas)
- `ButtonSize` is `sm|md|lg` (32/40/48), default `md`; legacy `s/m/l` dropped (Stas, `ds-button`; breaking)
- All 22 declaring components use private `--_*` resolvers for public tokens; `ds-table-header-*` renamed `--ds-table-head-*` (all components)
- 11 components with no token API gained `--ds-<comp>-*` tokens: spinner, skeleton, progress, divider, w3w, tooltip, page-footer, accordion, drawer, popover, menu
- Overlay trio and others deepened: drawer, popover and tooltip gained radius, shadow, size and padding tokens; divider, w3w, page-footer, accordion gained extra colour tokens
- Decided: per-instance token override on portaled popover and tooltip not built; theme-level scope is correct (Stas)
- `menu-item`, global `_link.scss` and `_icon-base.scss` converted to the resolver style; link hover and active derive from the resolved colour (`_link.scss`)
- Forced-link hook drift fixed by deleting `forced/_link.scss` (`ds-docs`)
- Badge, tag, toast and empty-state normalised to the same resolver style (`ds-badge`, `ds-tag`, `ds-toast`, `ds-empty-state`)
- Loading-spinner colour reads `--_button-fg` (`ds-button`)
- Tokens-reference has an Icon-button group with 8 rows (`ds-docs`)
- Closed: `_forced-states.scss` button size tier (moot after states went live)

## Animations (2026-06-25)
- Bottom-sheet close animates via a `rendered`/`closing` pair with `ds-sheet-down` and `ds-sheet-fade-out`, torn down on `animationend` (`ds-bottom-sheet`)

## ds-docs showcase (2026-06-15)
- Tokens reference has a `--text-on-media-shadow` row in the SHADOWS array (`scales.data.ts`)
- Showcase renders live components instead of raw markup copies across button, tabs, pagination, link, sidenav, input, select, dropzone, table, selection, banner, modal and badge sections (`ds-docs`)
- `forced/` partials renamed `specimens/`; each remaining file marks an API gap (`ds-docs/src/styles/specimens`)
- `DsStaticPreview` host directive shared by dropdown, select, modal and popover renders the open state inline from one template (`DsStaticPreview`)
- `ds-sidenav-item` has `[disabled]`; `ds-input` has `[readOnly]`, `[success]`, `[withAddon]`, `[withAddonRight]` (`ds-sidenav-item`, `ds-input`)
- `ds-dropzone` has `[disabled]` and `[single]`; `ds-stat` has a `[delta]` content slot (`ds-dropzone`, `ds-stat`)
- `ds-button` has `icon` and `trailingIcon` inputs (`ds-button`)
- `ds-tab` count chip is styled in `tabs.component.scss` instead of only in the docs mirror (`ds-tabs`)
- Final raw-copy audit left zero `.badge`, `.spinner`, `.card` or `.skeleton` copies in the docs (`ds-docs`)
- `[loading]` buttons keep their variant background instead of the disabled grey; the spinner reads `--_button-fg` (Stas, `ds-button`)
- `_forced-states.scss` split into 13 partials under `ds-docs/src/styles/forced/` with the same entry (`ds-docs`)

## Breakpoint tokens and reduced-motion loops (2026-06-25)
- Breakpoints come from one `$breakpoints` map that emits `--bp-*`, `$bp-*` aliases and `up()`/`down()` mixins (`src/lib/styles/_breakpoints.scss`, deck bp-aliases)
- `_page-grid.scss` uses `bp.up(sm)`/`up(lg)`/`up(xl)`; the old +1 values snap to 640/1024 (`_page-grid.scss`)
- Decided: off-scale content-fit `@media` literals (720, 1100, 820px) stay raw; `down()` has no consumer yet (Stas; `page-header.component.scss`, `_layout-utils.scss`)
- Fixed: `prefers-reduced-motion` no longer freezes spinners and indeterminate progress; only `transition-duration:0` is forced and loop tokens are slowed (`_tokens.scss`)

## Combobox size input (2026-06-18)
- `ds-combobox` takes `size: 'sm' | 'md' | 'lg'` (default `md`), mirroring `ds-select`, with a new exported `ComboboxSize` type (`combobox/index.ts`)

## Stepper visible labels (2026-06-23)
- `ds-stepper` renders step labels visibly via `labelPosition: 'bottom' | 'inline'` (default `bottom`) with an exported `StepperLabelPosition` type (`stepper`)
- Stepper label styling is public through `--ds-stepper-label-color`, `-color-current` and `-font-size` (`stepper`)

## Lint debt (2026-07-08)
- sr-only blocks use `clip-path: inset(50%)` instead of `clip: rect(...)` (`dropzone`, `stepper`, `table`, `_typography`)
- `mask-attachment` stays behind a documented `stylelint-disable` as viewport-anchor intent (shimmer-sync solution tracked under Animations)
- stylelint `selector-type-no-unknown` uses an `ignoreTypes` regex mirroring the eslint component-selector prefixes (stylelint config)
- `font:` shorthand slashes are spaced repo-wide and `scss/comment-no-empty` is disabled (stylelint config)
- `select` `moveActive` carries a justified inline disable of `@typescript-eslint/prefer-for-of` (`select`)
- Template whitespace, ordering and `attributes-order` issues are auto-fixed in alert, empty-state, otp-input, radio-group and slider
- `card` with `elevation="interactive"` gets role=button, tabindex and Enter/Space; `tabs` close supports Delete-to-close; false-positive a11y warnings carry justified disables (`card`, `tabs`)

## Frontend architecture starter (2026-06-22)
- `starter/` Phase 1 runs end to end: zoneless shell, mock auth, items CRUD, dev panel, Sheriff module boundaries, CI gate, lefthook and 16 ADRs (`starter/`)
- Decided: `common` is source-only rather than an ng-packagr lib, and the DS is consumed by copying `dist/ds` into node_modules, never a junction (`starter/`)
- `ds-table` absorbed the advanced data-grid features: `pageSize`, `page`, `clientSort`, `stickyFirstColumn` (`ds-table`)
- Form controls implement `ControlValueAccessor` via the `DsControlValueAccessor<T>` base: input, textarea, select, checkbox, switch, combobox, date-picker, new `ds-radio-group` (`control-value-accessor.ts`)
- `ModalService.confirm()` ships as the programmatic confirm dialog (`ModalService`)

## Motion system audit (2026-08-10)
- Closed unbuilt: blanket transitions for snapping state changes (45 of 81 stylesheets already declare one; the five without are keyframe surfaces)

## mm-broker 0.9.1 adoption asks (2026-08-11)
- `DS_CONFIG.brand = { name, logoLetter, tagline }` feeds `ds-sidenav` and `ds-auth-layout`; fields resolve independently and the projected `[dsBrandName]` still wins (`ds-config.ts`)
- Decided: brand config carries no wordmark accent, since a `TemplateRef` would make the provider view-owning (`ds-config.ts`)
- `ds-stat` exposes `--ds-stat-value-white-space` and `--ds-stat-value-font-size`, defaults unchanged, size variants move the resolver (`ds-stat`)
- `ds-filter-bar` docs show the three declarations a trailing-slot wrapper owes, reading the gap from `--ds-filter-bar-gap` (Filter bar page)
- `ds-search` takes `[debounce]` (default 0); empty value, Clear and Enter skip the timer and a host write cancels a pending one (`ds-search`)
- `ds-avatar` takes `name` for initials and tint seed; the rule is replaceable via `[initialsRule]` or `provideDsConfig({ avatar: { initials } })`, explicit `initials` wins (`ds-avatar`)
- Decided: no person/org modes on `initialsFrom`, since reading a name is a cultural convention; it stays first-two-words (Stas, `initialsFrom`)
- `ds-tabs` takes opt-in `rememberLastTab`, restoring the last tab per path when no query parameter is present (`ds-tabs`)

## mm-broker follow-ups (2026-08-11)
- `ds-filter-bar` takes `triggerSize` (default `md`) for its "+N filters" trigger; sizing from items is impossible because `dsFilterItem` carries only width (`ds-filter-bar`)
- `DS_CONFIG.modal.dividers` sets the default via input, then config, then `true`, and reaches `ModalService` cards (`ds-modal`, `modal-defaults.ts`)
- Decided: `dividers=false` collapses the body padding, not the divider side, because `.body` is the scroll container (`ds-modal`)
- `ds-tabs` `urlParam` slugs the tab label (kebab, lowercased, diacritics dropped) when no `value` is declared; migration entry added (`ds-tabs`)
- `ds-filter-bar` row uses `overflow: clip` with `overflow-clip-margin: 4px` so first and last focus rings are no longer cut off (`ds-filter-bar`)
- `DsOption<T>` adds per-option `icon` to `ds-select`, `ds-multi-select` and `ds-autocomplete`; only `ds-select` repeats the glyph in its trigger (`DsOption`)
- Closed unbuilt: count trigger on multi-value pickers (Stas, nobody asked; the screenshot most likely showed another project's input)
- `ds-table` has one `[toolbar]` slot whose row wraps its controls, gives a single child full width and removes itself when empty (`ds-table`)

## Control focus ring (2026-08-13)
- A zero-specificity base `:where(:focus-visible)` indicator using `--ds-control-focus-shadow` covers every focusable element, including alert, banner and drawer close buttons (`styles/_focus.scss`)

## Non-DS focus ring papercut (2026-08-12)
- Closed: non-DS interactive elements get the DS focus treatment from the base indicator, so no mixin or helper class is needed (`styles/_focus.scss`)

## Table sort indicator on server defaults (2026-08-13)
- `ds-table` `sortKey`/`sortDir` are `input` + `output` pairs feeding a `linkedSignal`, so a server default sort restores the header mark; `table.sortKey.set()` is gone (`ds-table`, server demo in ds-docs)

## Table loading mode (2026-08-13)
- `ds-table` `[loading]="true"` picks skeleton rows for an empty table and overlay once rows exist; `false`, `'skeleton'` and `'overlay'` are unchanged (`ds-table`)

## Contrast corrections and finished backlog items (2026-08-17)
- Corrected contrast figures: enabled text 17.32:1, disabled ceiling 2.71:1, old disabled range 3.38-5.23:1 (`todo.md`, `done.md`, CHANGELOG, `migrations/unreleased.json`)
- `DS_CONFIG` gains `control.size`, `card.elevation`, `card.padding`, `table.stickyScrollbar`, `table.bordered`, `icon.size`, `badge.withDot` through `resolveWithConfig()`; no default moved (`ds-config.ts`)
- Decided: configurability only, no new house `size` default, since `ds-input` is 4 `sm` of 87 (Stas, `DS_CONFIG`)
- Closed unbuilt: config keys for button `variant`, modal `size`, popover `align` and icon `[size]="16"` (per-screen choices or dead bindings)
- `ds-table` exposes public `runExport()` plus readonly `exporting` and `exportStatus` signals for an external Export button (`ds-table`)
- `ds-table` skips its empty row whenever `loading !== false`; documented as empty-state variant (e) (`ds-table`, ds-docs)
- `TableColumn` accepts `width: 'content'`, carried by a `fit-content` class (`width: 1%; white-space: nowrap`) (`ds-table`)
- `ds-autocomplete` clears its filter text in `close()` while a single-select label is shown (`ds-autocomplete`)
- 0.9.0 is released to npm and the release script promotes a guide folder if one exists (`cut-release.sh`)
- `.link` on a `<button>` is reset by `&:where(button)` with eight declarations; `font-weight` and `display` left out (`_link.scss`)
- Composition rules ship in `design-system.md` (spacing, gutters, gap ownership, type, field height, colour, motion, content) and render at `Practice → Composition rules` (`design-system.md`, ds-docs)
- `/changelog` page markdown styles work through `:host ::ng-deep` (ds-docs)
- `ds-sidenav` and `ds-auth-layout` share the fixes: surrogate-safe letter mark, `aria-hidden` mark, `logoLetter`-only lockup, no `width: auto` on the brand slot
- ds-docs sets `viewport-fit=cover`, both docs pages say hosts must set it, and `bottom-sheet.component.scss` gets the `, 0px` env fallback (`ds-docs/src/index.html`)
- Closed: `ds-autocomplete` disabled option already has a treatment from the shared `_dropdown-overlay.scss`, not a defect
- `ds-field-group` `[invalid]` border uses new public `--ds-field-group-border-color-error` (default `--error`) (`field-group.component.scss`)
- A bordered field in `ds-field-group` no longer repaints its fill; state rules carry `:not(.in-group)` (`field-state`)
- `ds-field-group` segment offsets are 5/9/13px at sm/md/lg, recorded in the CHANGELOG (`ds-field-group`)

## Focus, packaging and a11y closures (2026-09-10)
- Wrong-element focus sweep fixed four more shells (`ds-sidenav-footer` search, table column filter and cell editor, `ds-dropzone` input), with two planted-defect gates (`tools/check-focus-rings.mjs`)
- Focus ring animates with `animation` instead of `transition`, so component transitions survive focus (`focus.ring`)
- Selection controls ring `.control-line` through `focus.ring-for($control)` so focus differs from selected (`styles/_control-line.scss`, deck selection-focus-ring)
- Focus ring is an `outline` with `outline-offset` instead of a box-shadow, a major change to the `--ds-*-focus-shadow` tokens (`styles/_focus.scss`)
- forced-colors handled by an `own-indicator` mixin inside `@media not (forced-colors: active)`; the floor-rule `!important` is gone, gate added (`tools/check-focus-rings.mjs`)
- `field-state` no longer paints on disabled fields; read-only keeps the paint because it is still submitted (`styles/_field-state.scss`)
- Double focus indicators are closed: accordion-item, stepper, table and dropzone moved onto `focus.ring`
- Clipped focus rings are fixed with negative `--focus-ring-offset` on the clipping box, and `data-focus="inset"` does it globally
- `data-focus="outline"` and `data-focus="field"` modes are removed (`data-focus`)
- Four unexecutable manifest shapes are fixed and lint rules M043 and M044 added, M034 gap closed (`migrations/`, `AUTHORING.md`)
- `class-surface-diff` handles function-typed fields, deleted files and string-literal whitespace; template-literal defaults stay blanked (`class-surface-diff`)
- Angular set moved to 21.2.22 and the exact `@angular/elements` pin removed, now `^21.2.0` (`package.json`)
- `package-lock.json` is regenerated and agrees with `bun.lock` except five optional-peer packages (`package-lock.json`)
- `ds-split-button` hover defaults to `--accent-hover` instead of `--accent-strong` (`split-button.component.scss`)
- `ds-table` export live-region line yields once the events line has news; `exportStatusState` has one setter (`ds-table`)
- `ds-table` loading scrim measures its header per loading episode; `--ds-table-head-h` still overrides (`ds-table`)
- Decided: zebra tint stays under skeleton rows, not to be refiled as a defect (`ds-table`)
- Chunking audit measured placement: one eager `inject(ToastService)` pulls 135.7 KB gzip into the initial bundle (`packaging-chunking-audit.md` §11)
- `devWarn` call sites use `ngDevMode &&` so 13 dev warnings fold out of production, -1.6 KB gzip (v0.11.2, `devWarn`)
- `ds-config.ts` and `card.types` moved to `core`, breaking the card/config/core/icons cycle; `card` is a leaf (A3-pre)
- Lint rule `ds/entry-point-boundary` is built and shipped `'off'` until the A3 rewrites flip it to `'error'` (`eslint-rules/rules/entry-point-boundary.mjs`)
- Decided: build the table directive seam (A1); it costs a fixed 923 B gzip and keeps about 87-95% of the saving
- Closed: directive-split ceiling stays bounded at 18.9-31.0 KB, not measured further
- Closed: 77-way facade name collisions and Angular 22 packaging risks checked and dismissed
- Closed unbuilt: splitting the icon map (whole set is 2.5 KB gzip, per-icon exports would break `IconName`)
- Decided: A3 stands; an eager-shell consumer saves about 72 KB gzip with per-component entries (`packaging-chunking-audit.md`)
- Decided: no basic/advanced split if the measurement favours the table's opt-in directives, and the work moved to directives A1/A2 (Stas, deck 5)
- Closed unbuilt: `DsButtonMessage` directive for `ds-button` (built and reverted, probe bundle 308 B worse)
- `ds-stat` `variant="error"` recolours the value by moving the `--_stat-value-color` resolver (`ds-stat`)
- `ds-sidenav-footer` collapse button and icon-only `ds-breadcrumbs` crumbs get accessible names; `BreadcrumbItem` can name an icon-only crumb (`BreadcrumbItem`)
- Focus-indicator audit of 1807 focusable elements found none without one, using CDP `CSS.forcePseudoState` and a planted-button control (ds-docs)
- `ds-checkbox`, `ds-radio` and `ds-switch` take an `ariaLabel` input used only when `label` is empty
