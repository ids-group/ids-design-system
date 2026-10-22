# DS — improvements backlog

Five buckets, and the bucket is the first sort key: **Bugs** is something already wrong in a
surface a consumer reads, **Asks** has a person behind it, **Decisions** is waiting on a verdict
rather than on hands, **Parked** is deliberately not now, and **Records** exists so a constraint
is not tidied away. `[Pn]` sorts inside a bucket. A `[~]` item is half-done and says what is left.

## The index

Generated — `node tools/todo-index.mjs` rewrites it from the items, and `--check` fails when it
is stale. Closing an item means deleting the item and nothing else.

<!-- todo-index:start -->

**134 open — 2 P1, 11 P2, 121 P3**, 1 of them half-done and waiting on a verdict. Counted by `node tools/todo-index.mjs` from the items themselves.

### P1 — 2

- **Faster gates (Stas, 2026-10-09: after the release)**
  - The release pipeline skips the pixel checks: its image has no Chrome
- **Asked by Stas**
  - ½ A `ds-table` column without `width` grows to its text; it needs a sensible default clip width (Stas, 2026-10-06)

### P2 — 11

- **Defects consumers work around today (swept 2026-09-23)**
  - The stock control edge and `--secondary-on` fail contrast; the second breaks on any light brand secondary (from the ids-europe-landing consumer)
- **Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)**
  - The warning status pair fails WCAG AA for normal text — MEASURED 2026-08-27 in a real browser, 4.42:1 against the 4.5:1 threshold
- **Faster gates (Stas, 2026-10-09: after the release)**
  - `tools/check.mjs` runs every check of a group one after another
- **Asked by Stas**
  - A clipped value's tooltip should line up with the text it completes (Stas, 2026-10-10)
  - Tooltips and trigger-anchored overlays should follow their trigger on scroll, not close (Stas, 2026-10-08)
  - Document how to build `ds-modal` actions (Stas, 2026-10-06)
  - Bring `ai-sdlc-prototype` up to the mm-broker frontend (Stas, 2026-10-07)
- **Open verdicts**
  - Six behaviour changes published in 0.14.7 without a choice between alternatives
- **Tooling**
  - Publishing to npm stops working in January 2027 and the replacement is not chosen
  - Nothing catches a stale `decks/ds.css`, and two gates read it as the truth
- **The field system — the two controls outside it, and the two with no box to paint**
  - `ds-slider` and `ds-switch` compute no `controlState`, so a validation state reaches only their message

### P3 — 121

- **Focus indicators — what the two-wave review left open (recorded 2026-09-04)**
  - Thirteen ds-docs forced-state pins misrepresent their component
- **Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)**
  - Prose-shaped `old` values in 0.11.x remain (hygiene, not breakage)
- **DS-docs**
  - ds-docs renders a space before punctuation after any inline `<code>` (found 2026-09-01)
- **What v0.13.3 added and the docs site never shows (measured 2026-09-22)**
  - `g[dsLineSeries]` demonstrates `stacked` and `tooltipAnchor` only on the preset
- **Faster gates (Stas, 2026-10-09: after the release)**
  - Rewrite the gates in Rust or C++ (Stas's idea, 2026-10-14, for speed)
- **Keyboard reach reported by Stas, 2026-10-09 (record only, fix after the release)**
  - The password field's show/hide toggle is not reachable by Tab
  - `ds-menu` opened from the keyboard does not take focus, and Tab walks the wrong menu
  - The focus ring of the first and last menu item ignores the panel's corner radius
- **Reported by Stas from the docs site, 2026-09-05**
  - The shimmer's viewport anchoring breaks inside a transformed ancestor
- **Asked by Stas**
  - A single select with a search box (Stas, 2026-10-14, from mm-ecm ME-530)
  - `ds-waterfall-chart` is `ds-cascade-chart` (Stas, 2026-09-23)
  - Rename `ds-bar-chart` to `ds-row-chart` (Stas, 2026-09-24)
  - Pin more than one mark at a time (Stas, 2026-09-29)
  - Cut the prose in ds-docs (Stas, 2026-09-29: too much text, and nobody reads it)
  - Measure an IDS start from `ai-sdlc-prototype` against Vanya's from-scratch run (Stas
  - Cut the tokens a consumer's agent spends finding its way in IDS (Stas, 2026-10-05)
  - Agents and skills inside the DS repo for its own tasks (Stas, 2026-10-05)
  - Split IDS into rules/design system and a UI kit? An idea to think through (Stas
  - Fix what the Claude Design run surfaced (Stas, 2026-10-05)
  - Collect concrete ideas from the live integration runs (Stas, 2026-10-05)
  - Pass attributes through to the native elements (Vanya, 2026-10-05)
  - An accessible stepper (Vanya, 2026-10-05)
  - Hooks in toasts (Vanya, 2026-10-05)
  - Styles in cascade layers (Vanya, 2026-10-05)
- **Tooling**
  - `build-cards.mjs` cannot slice a chapter that nests a `block-title` heading inside `details.edge-cases`
  - No pixel comparison was run over the 2026-09-29/30 library comment sweep (recorded 2026-09-30)
  - `--picker-maxh` is an abbreviated token name (recorded 2026-09-24)
- **Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)**
  - A2 - column filters and persisted layout out of `ds-table`
  - B1 - `DS_CONFIG.prototype: true` is BEHAVIOUR only. For bytes, use a build-time flag
  - Build-time `define` flag: a consumer CAN strip library code from `angular.json` — measured
  - Make the PORTALED overlay stylesheets opt-in — ~1.6 KB gzip, and that is the whole prize
  - The boundary guard is still `'off'` after A3, with four defects the flip must carry
  - Re-run `attw` with the tool actually installed, or drop the claim
  - A curated `prototype` entry point, now that A3 exists
  - A bundle-size gate in CI
- **Agent-facing docs — the rules an agent needs to prototype a page, and an md layout it can navigate**
  - An md ARCHITECTURE for the whole design system — cross-linked like a graph, not a pile of files (Stas, 2026-09-01, re-scoped 2026-09-02). NEXT UP, and the first step is RESEARCH, not code
- **The hex readout rolls its glyphs like a mechanical board (recorded 2026-09-02, Stas)**
  - Dragging the picker retypes the hex value instantly; each glyph should ROLL to its new
- **Focus indicators — what the two-wave review left open (recorded 2026-09-04)**
  - Transitions are missing or wrong in places, and nothing says where (Stas, 2026-09-04)
- **Claude Design upload — what the freeze left open (recorded 2026-09-04)**
  - Thirteen obsolete paths on the project can only be deleted by its owner
- **The field system — the two controls outside it, and the two with no box to paint**
  - `ds-autocomplete`'s arrow keys walk a private copy of the list cursor
- **Open verdicts**
  - Which public tokens the library never reads go?
  - Does the picker list height become a public token, or stay behind `panelClass`?
  - Should the `ds-breadcrumbs` hover colour derive from the link colour (`--ds-link-color`), like the `.link` helper?
- **Tooling**
  - `tools/todo-index.mjs --check` is not in `lint:all`, so the index can still go stale between runs
  - Publishing to Claude Design cannot run from Bitbucket, and Stas wants the CI route looked at again (recorded 2026-09-02)
  - `fix:all` reformats HTML that eslint then fights, and it is `fix:all` alone — `lint:all` is green
  - Ten manifest-format practices the audit marked *Adopt*, and nobody has ratified any of them (filed 2026-08-27 out of the migration-manifest audit)
- **The field system — the two controls outside it, and the two with no box to paint**
  - `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in, or say they are not fields (Stas asked 2026-08-20)
- **Colour, interaction and typography tokens**
  - Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24)
  - `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]])
  - Theme recipe vs hand-tuned picks — alignment decision
  - The 20 typography CLASSES still read `.t-*`, where the tokens behind them now spell it out
- **Framework & forms**
  - Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wiring
- **An indeterminate bar that survives a short track (recorded 2026-09-22, from the mm-ecm consumer)**
  - An indeterminate `ds-bar` is never empty, or 86.7% is enough - one verdict left
- **Focus indicators — what the two-wave review left open (recorded 2026-09-04)**
  - No indicator has been measured for SIZE or contrast — the 2026-09-10 sweep answered 2.4.7 only
- **Claude Design upload — what the freeze left open (recorded 2026-09-04)**
  - `.design-sync/conventions.md` is a generator INPUT, and nothing stops a reflow desyncing it
  - Which of the 8 live chapters can also be frozen
- **Component feature gaps**
  - What the glyph-clip fix leaves to measure or decide
  - `ds-select` cannot offer "create «what I typed»", and the reason is that it has no place to type (recorded 2026-09-09, Stas)
  - Keep one of the two ways `ds-info-hint` takes rich content (Stas, after consumers use them)
  - `DS_CONFIG` prototype mode — `prototype: true` (Mikhail's framing; Stas 2026-09-01: a `DS_CONFIG` flag works too, as `prototype: true`)
  - Three edges left open on `ds-table` row expansion and the resize handle, each a judgement call rather than a defect
- **The chart family read as an architecture (audited 2026-09-22)**
  - `formatTick` on the package surface has no consumer in `src/`
  - `'none'` and `'grouped'` are the same value on `ds-column-chart`
  - Two inputs decide one thing on `ds-funnel-chart`, and two vocabularies name one idea
- **Two chart interactions held back (Stas, 2026-10-12: not now)**
  - «Разница между двумя колонками» and «Отток виден на воронке»
- **Wrapping in a `ds-table` cell (recorded 2026-10-09, Stas: parked, come back later)**
  - Two wrap options for a `truncate` column
- **ds-icon does not read the icon size scale (recorded 2026-08-24, from the state-glyph work)**
  - `--icon-xs/sm/md/lg` exist (12/14/16/20) and `ds-icon` cannot be sized by them
- **The global `.icon` squeezes the `ds-icon` box (recorded 2026-10-09, from the mm-ecm consumer)**
  - In `ds-banner` and `ds-dropzone` the `ds-icon` box is 16px while its svg draws 20px
- **Missing components (from gap analysis)**
  - Image / lightbox
  - Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed)
  - CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed)
- **Missing tokens / foundations (from gap analysis)**
  - Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog
  - MED cluster — ASKED 2026-08-05, Stas: keep in the backlog
  - Default muted-text token fails WCAG AA (surfaced 2026-07-13 by the NPA-85 Branding agent's contrast audit)
- **Virtualising a long picker list (recorded 2026-08-31, §9 P5, Stas: record only)**
  - Five thousand options render five thousand rows
- **A journey canvas the mm-ecm prototype could not use (recorded 2026-09-16)**
  - Journey / flow diagram - no component draws a branching node-and-edge canvas
- **Docs nav chapters — the two limits the derivation ships with (recorded 2026-09-08)**
  - A chapter list reaches only sections whose headings are `h3.block-title`
  - The active chapter is not scrolled into the rail's own viewport
- **Focus indicators — what the two-wave review left open (recorded 2026-09-04)**
  - An icon-only control's focus ring 1px outside its 24px target, 26px on every control
  - The `ds-tag` remove button's focus ring does not show on a solid tag
  - The `ds-time-picker` clear button jumps down while pressed
  - The `ds-tabs` scroll arrows draw their chevron 1px above the box centre
  - The focus-indicator sweep only sees what is in the DOM when a page loads
  - Nothing catches a shell that rings on `:focus-within` when it means the keyboard
- **Claude Design upload — what the freeze left open (recorded 2026-09-04)**
  - The elements demo has not been opened in a real browser since the rebuilds
  - `templates` and `startingPoints` in `_ds_manifest.json` are in the schema and empty
  - `.thumbnail` — the project's cover image — has no source that regenerates it
- **Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)**
  - `ds-button` pulls `field-message` statically, and it stays cheap only while the two
- **Component feature gaps**
  - One tab stop per long table, arrow keys between its clipped values - PARKED 2026-10-09 by Stas
  - The clipped-value tab stop on a 500-row table: the reported 4x long task did not reproduce - PARKED 2026-10-09 by Stas, after the release
  - Portaled CSS as opt-in — PARKED 2026-09-04 by Stas
  - Split the design system from the UI kit as two packages (Mikhail, 2026-08-30)
  - A token named in prose is not checked against the tokens that exist, and the same fact lives in two copies
  - `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber
  - Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog (not built, not closed)
- **DS-docs**
  - Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below)
- **The field system — the two controls outside it, and the two with no box to paint**
  - CDK Menu adoption (option B) — parked
- **Tooling**
  - `templates` and `startingPoints` in the Claude Design manifest are unexplored, and so is what feeds the pane's "Usage notes for Claude" (recorded 2026-09-03)
  - Four components had no block of their own in ds-docs (recorded 2026-09-03, three fixed)
  - `schematics/tsconfig.json` still asks for `moduleResolution: "node"`, which TypeScript 6 removes (recorded 2026-08-31)
  - Re-wrap `CHANGELOG.md` to ~100 columns (Stas, 2026-08-31: record it, not now)
- **Framework & forms**
  - Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking changes lands exactly there
- **The chart family read as an architecture (audited 2026-09-22)**
  - The template state head is copied verbatim into eight chart templates
  - `ds-scatter-chart` opts out of the shared roving-tabindex module
  - Three charts hand-roll a legend and three compose their own accessible sentence
  - Six places reimplement something a shared module already does
  - Five constants carry two or three spellings each
  - A chart waiting for `deferUntilVisible` holds the whole loading skeleton (Stas: parked 2026-09-24)
  - The chassis is declared nine times and shared once - about 450 lines of it
- **Thirteen inputs the chart family declares component by component (measured 2026-09-22)**
  - Only the RESOLUTION of the shared chart inputs is shared, not their declaration
- **ds-app-layout — the one knowingly duplicated decision**
  - `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing my own `118a539`)
- **A11y — decision record (deferred, NOT a bug)**
  - topbar → `role="banner"`
- **One popover instance per trigger — the alternative that was weighed and not taken (recorded 2026-09-08)**
  - ds-table's two popovers each serve many triggers from ONE instance, and the switch depends on an event order nothing enforces
- **Focus indicators — what the two-wave review left open (recorded 2026-09-04)**
  - Zone COLOUR and `data-focus` SHAPE cannot both reach one role, and the reason is a …
- **Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)**
  - The resize handle still eats a finger swipe on a HYBRID device, which the touch fix does not reach
- **Claude Design upload — what the freeze left open (recorded 2026-09-04)**
  - Where a check mark is drawn, and which ones are the shared one
  - The upload tree tracks `src/lib`, and lags it between a library commit and the next CI
- **Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)**
  - Six things the bundle fixtures do NOT establish, recorded 2026-09-02 rather than left for …
- **Tooling**
  - The chart palette separates by hue and barely at all by lightness, and nothing measures the dark theme (recorded 2026-09-21, Stas: record only)
  - Three `ds-table` paths have never been driven by automation, and five component groups have never been clicked through

<!-- todo-index:end -->

## What is actionable today (recut 2026-09-24)

**Consumer asks are the head of the board.** Every item a consumer is waiting on is the work.
Two are open: the control-edge contrast (:212) under *Bugs* and the indeterminate
bar's stripe verdict (:1031). The 0.9.0-0.13.3 manifest walk and the eleven
reached-past styling hooks are both closed.

**Nobody is blocked from installing.** All six consumer repos declare Angular `^21` or `~21`, so the
Angular 22 upgrade is parked rather than P1; the probe and its price stay in the item.

**The three token items are ONE story and must not be taken separately.** The single-source colour
engine is the spec; "theme recipe vs hand-tuned picks" is a question INSIDE that spec, by its own
wording; `.ds-interactive` sits on top of whatever the engine decides. Opening any one alone decides
the other two by accident.

**Where the release risk is.** It is not in `unreleased.json` but in the manifests behind it:
mm-broker is on 0.10.3 and mm-ecm-platform's main checkout on 0.8.0 (measured 2026-09-23), and each
will swallow every release since in one pass, so those manifests are what has to be complete.

**Two habits that keep catching real defects, worth reading before opening anything.** A number
measured in ONE theme carried into the other unchecked - twice, both wrong: the `tonal` disabled fill
(4.32:1 light, 1.20:1 dark) and the neutral disabled label. And a capability
that shipped with zero adoption twice traced to one missing field in a contract: when adoption is
zero, read the consumer's hand-rolled version rather than re-reading our own API.

# Bugs — something shipped misbehaves

Highest: each one is wrong in code — or in a surface — a consumer already reads.

## Defects consumers work around today (swept 2026-09-23)

Defects a consumer hit - from a QA pass, or from reading a consumer tree for a rule that out-specifies a DS internal, a `::ng-deep` into a `ds-*`, or a wrapper that exists only because the library gets something wrong. Each is checked against `dev`.

- [ ] **[P2] The stock control edge and `--secondary-on` fail contrast; the second breaks on any light brand secondary (from the ids-europe-landing consumer).** `--border-default` is `var(--neutral-200)` (`_semantic.scss:49`, #DCE1EA) and is the resting edge of `ds-input` (`input.component.scss:17`) and 25 more components: 1.31:1 on white in the stock theme against the 3:1 WCAG 1.4.11 floor for a control boundary. `--secondary-on` is the constant `var(--primary-on)` = white (`:134`, `:116`) while `--secondary` recomposes from `--secondary-h/s/l`, so a gold secondary (#FBAC18) gets white text at 1.91:1 - and the stock theme already fails: white on the stock `--secondary` #FF7B2E (`hsl(22 100% 59%)`) is 2.59:1 against 4.5:1 (computed 2026-10-02). ids-europe-landing rebinds both (`_theme.scss:44-57`, `:89`). **Wanted:** a control-edge role that clears 3:1 in both themes (or `--border-default` moved to it), and `--secondary-on` derived from `--secondary`'s lightness or listed in the brand must-rebind checklist of the brand-unsafe item.

- [x] **[P1] A clipped hinted header shows its label and hint as two plain lines; the label should be a bold line of its own (asked by Stas, 2026-10-06).** `dsTooltipClippedLead` joins lead and hint with a newline and `tooltip-panel.component.scss` sets `white-space: pre-line` for every tooltip, so any tooltip text with a newline now breaks there and the label is the same weight as the hint. **Wanted:** a `lead` input on `TooltipPanelComponent` rendered as a bold line, set by the directive only while the host is clipped, and `pre-line` reverted. Work branch `ecm-fix/tooltip-arrow-anchor` (tooltip group). A started, unverified patch: mm-ecm-platform `.claude/local/from-scratchpad/2026-10-06-tooltip-lead-bold/tooltip-lead-bold.wip.patch` (local, not in git).

## Focus indicators — what the two-wave review left open (recorded 2026-09-04)

*This section also has items under **Asks**, **Decisions**, **Parked**, **Records**.*

Six defects from that review are fixed (`a5af6ba8`, `38764f81`, `29532e27`, `e88de757`). Everything
below survived wave 2's attack and is NOT fixed. Each claim was traced in emitted CSS from a linked
app build rather than from SCSS; none was verified in a browser.

Context that cannot go in a published file, kept here instead: `--focus-ring-inner` was
`var(--surface-canvas)` until `7c37a8f9` (v0.10.2) made it `transparent`, which collapsed the
two-layer ring into one solid band. That release's manifest item promises the opposite — "the 2px
gap ... shows whatever is actually behind it" and "the same pixels show through" — and a transparent
box-shadow layer paints nothing and reserves nothing, so there was no gap between v0.10.2 and the
fix. The record cannot be corrected (a published manifest is frozen, `AUTHORING.md:183`) and
`CONTRIBUTING.md:168-174` forbids describing it in a new entry, so the new item carries `supersedes`
and says nothing about the old one. Measured on three grounds.

- [ ] **[P3] Thirteen ds-docs forced-state pins misrepresent their component.** Three change pixels
  today: the dropzone pin invents a text colour from a token nothing else reads (itself a published
  no-op), the button `pin-active` omits the press scale while `pin-hover` omits the hover shadow, and
  the table `pin-hover-th` invents a header background the component never paints — while the
  component's own header hover is a no-op, both sides being `--text-secondary`. Six pin comments
  claim "no `--_*` resolvers" where resolvers exist; they were true when written and the resolvers
  landed six days later. `ds-docs/src/styles/specimens/_day.scss` is a hand-written mirror of
  calendar-day with seven or more divergences.

## Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)

*This section also has items under **Records**.*

- [ ] **[P2] The warning status pair fails WCAG AA for normal text — MEASURED 2026-08-27 in a real browser, 4.42:1 against the 4.5:1 threshold.** `src/lib/styles/_status.scss:45` pairs `bg: var(--warning-subtitle)` with `text: var(--warning-text)`. Resolved in the default theme that is `#8A7400` on `#FFFBEA`, which computes to **4.42:1** by the WCAG relative-luminance formula — under AA for text below 18.66px/700. **It is the only status pair that fails:** error measures **5.92**, success **6.42** and primary **6.16** on their own subtitle backgrounds, so this is one colour out of step, not a palette-wide problem.
  **A darker step does not exist to reach for.** The yellow ramp ends at `--yellow-700` (`#8A7400`), which is what `--warning-text` already resolves to (`themes/_semantic.scss:175`). Closing this needs either a new `--yellow-800`, or a different foreground on the warning tint.
  **Reach, before anyone assumes it is one component:** `--warning-text` is read by `ds-alert`, `ds-banner` (two places), `ds-button`, `ds-checkbox` (two), `ds-field-message`, `ds-icon-button`, `ds-modal` (two), `ds-radio-group`, `ds-sidenav-footer` and `_field-state.scss`. `ds-alert` and `ds-banner` warning use the identical default pair (`--warning-subtitle` bg, `--warning-text` text; `alert.component.scss:44-46`, `banner.component.scss:69-70,75`), so they are 4.42:1 by the same arithmetic; each other site needs its own measurement before it is called broken. `semantic-preset` is opt-in, but mm-ecm and mm-broker both call it, so their warning badges ship at 4.42:1.
  **Not the same thing as the 3:1 note already in `_field-state.scss:29`**, which is about WCAG 1.4.11 non-text contrast for a border and is satisfied. This is 1.4.3, text.

- [ ] **[P3] Prose-shaped `old` values in 0.11.x remain (hygiene, not breakage):** comma-joined
  token lists (`0.11.4#toast-border-tokens-gain-color`), a full sentence as `old`
  (`0.11.1`), a ~95-word `restore` paragraph (`0.11.3` — README wants "a literal snippet or
  `null`"). The plugin now treats a non-token `old` as a non-locator, so these degrade safely;
  tidy them when those manifests are next touched, and consider a lint rule for `restore` length.

## DS-docs

*This section also has items under **Parked**.*

- [ ] **[P3] ds-docs renders a space before punctuation after any inline `<code>` (found 2026-09-01).**
  The house lint rule `ds/template/element-content-newline` moves the content of an inline `<code>` onto
  its own line, so `</code>.` becomes a collapsed newline plus the period and the browser renders
  `--radius-pill-value .` — measured in the radius section's own lede, which predates this note, so it
  affects every section that puts punctuation after a code span. **Not a local defect:** fixing it in one
  section would fight the lint rule and make that section inconsistent with the other sixty. The fix is
  either a rule exemption for inline `<code>` or a CSS-level one; either way it is a single change for the
  whole site. Low priority — it is one space — but it is in every paragraph that names a token.

## What v0.13.3 added and the docs site never shows (measured 2026-09-22)

Every new component landed everywhere - five charts plus `g[dsSeriesAnnotation]` have a section, a
`components.md` entry and a `agent/` file. The gap is below the component line, and the site's
generated API table carries the NAMES, so this is about a reader meeting an input with no example
rather than never meeting it at all.

- [ ] **[P3] `g[dsLineSeries]` demonstrates `stacked` and `tooltipAnchor` only on the preset.**
  `chart.section.html:472-475` describes both in prose, and no `dsLineSeries` in ds-docs binds
  either; the `stack="stacked"` at `line-chart.section.html:89` is on `ds-line-chart`. The
  composable path is the one a consumer reaches for after the preset stops fitting, so its inputs
  are the ones that need an example on the mark itself.

Constraints and decisions that read as removable and are not.

## Faster gates (Stas, 2026-10-09: after the release)

- [ ] **[P1] The release pipeline skips the pixel checks: its image has no Chrome.**
  `render-evidence` and its selftest failed the first release after they were added (pipeline on
  `node:22-alpine`: «Chrome not found. Set CHROME_PATH to its executable.»), so `tools/preflight.mjs`
  skips both when `CI` or `BITBUCKET_BUILD_NUMBER` is set (TODO(render-evidence-ci)). Fix: install
  Chromium and fonts in the release step, add `/usr/bin/chromium-browser` to `headless-chrome.mjs`
  and launch with `--no-sandbox` under root, then drop the skip. Stas, 2026-10-09: skip it for now, fix it later.

- [ ] **[P2] `tools/check.mjs` runs every check of a group one after another.**
  `lint:all` walks its 36 checks serially, so every agent and every merge waits for the sum of them.
  Run independent checks in a worker pool (bounded by CPU count), keep the output grouped per check
  and the exit code the same; checks that build or share a cache stay serial or get a lock.
  Measure the group before and after.

- [ ] **[P3] Rewrite the gates in Rust or C++ (Stas's idea, 2026-10-14, for speed).** Before choosing what to port, measure where each gate spends
  its time (`tools/check.mjs` per-check timings): the slow ones build the docs, run headless Chrome
  or the Angular compiler, which a rewrite does not speed up; the candidates are the pure file-walking
  and text-matching checks. Compare against the cheaper steps above (parallel `check.mjs`, shared
  render-evidence cache, `--affected`) first.

## Keyboard reach reported by Stas, 2026-10-09 (record only, fix after the release)

- [ ] **[P3] The password field's show/hide toggle is not reachable by Tab.**
  In an auth form (the docs ident layout's ready-made sign-in), Tab goes email -> password ->
  «Remember me» -> «Sign in»; the eye toggle inside the password field never takes focus. The
  focus-ring audit (2026-10-09) found the same: `tabindex="-1"` on the toggle, so its ring could
  not be measured. Stas expects the same in other fields with an inner action and in combined
  inputs; sweep every field-suffix button (clear, toggle, stepper, picker trigger) for Tab reach
  before deciding whether an inner action is a tab stop or a shortcut.

- [ ] **[P3] `ds-menu` opened from the keyboard does not take focus, and Tab walks the wrong menu.**
  On the docs page component/menu: focus the «Account» trigger, Enter opens the menu, but focus
  stays outside it and cannot be moved in; the next Tab moves to the next menu trigger, and Tab
  inside the open showcase menu moves to the next item of a different menu. Expected: Enter/Space
  or ArrowDown moves focus to the first item, arrows walk the items of the open menu, Escape and
  Tab close it and return focus to the trigger (the menu button pattern).

- [ ] **[P3] The focus ring of the first and last menu item ignores the panel's corner radius.**
  The ring on the first and the last item of an open menu is square while the panel is rounded;
  it should follow the panel radius at those corners (top corners on the first item, bottom on
  the last, all four when the menu has one item).

## Reported by Stas from the docs site, 2026-09-05

- [ ] **[P3] The shimmer's viewport anchoring breaks inside a transformed ancestor.**
  `background-attachment: fixed` is what makes every skeleton show its slice of ONE screen-wide
  wave, and the spec makes a transformed, filtered or `will-change: transform` ancestor a
  containing block for it — inside one the background anchors to that ancestor instead, and the
  skeletons in it fall out of the shared wave into their own local one. Nothing on the docs site
  triggers it today (measured: no transformed ancestor above any skeleton), which is exactly why it
  would show up first in a consumer app with an animated drawer or a `transform`-based layout.
  No cheap fix: the alternative is the shared `:root` driver this replaced, which invalidated the
  whole document every frame. Worth a note in the skeleton's docs page before it is worth code.

## The chart family read as an architecture (audited 2026-09-22)

*This section also has items under **Decisions**, **Parked**, **Records**.*

## Claude Design upload — what the freeze left open (recorded 2026-09-04)

*This section also has items under **Asks**, **Decisions**, **Parked**, **Records**.*

The cards are static HTML now: 283 of 410 frozen, 127 left live because their panel is the
documented thing or their chapter's demo only exists once opened. Everything below is NOT fixed.

**Verification debts — each is one command away, none is a known defect.**

**Standing conditions, not tasks.**

**Decisions waiting on Stas.**

**Closed by measurement, recorded so it is not reopened.**

- **Lazy card rendering is no longer worth building.** The backlog item assumed every card in the
  grid boots its own Angular application; that is now true for 127 of 410. A frozen card costs about
  20 ms and zero bytes warm, so an `IntersectionObserver` would buy only the live ones and the two
  unknowns behind it still stand: whether the pane keeps off-screen cards in the DOM, and whether it
  screenshots them for the grid thumbnails, where a deferred card would thumbnail blank. The cheaper
  lever is the live list above.
- **All six panel-owning controls are proven to open.** Select 20 options, MultiSelect 6,
  Autocomplete 4, the date picker 42 day cells, the colour picker its panel, and `ds-menu` one pane
  with its items — that last one needed the probe pointed at the SIBLING button carrying
  `aria-haspopup`, because a trigger-opened menu's trigger is not inside the panel.
- **The two disputed comment numbers are gone rather than corrected.** The icon count was 86 against
  an actual 83, and "120 public `--ds-*` hooks" measured 128 over `_ds_bundle.css` — the /changelog
  session's 783 came from `src/lib/**/*.scss`, a different corpus, which explains the whole gap.
  Neither number was acted on by a reader, so both comments now state the constraint without one.
- **A dropdown was never visible in a card, before or after the freeze.** It is a CDK overlay:
  closed by default, portaled to `document.body`. Verified against the pre-freeze cards, which held
  no overlay either. What freezing took away was the click, which is why the panel owners are live.

# Asks — a consumer or Stas asked for it

Each has somebody behind it. Nothing here is speculative work.

## Asked by Stas

- [ ] **[P2] When a single `ds-time-picker` panel closes after a pick (ME-559, Stas 2026-10-22).** Dev closes a 12-hour panel once hour, minute and AM/PM are picked (A). Options in the deck: A as on dev, B no auto-close on a pick (closes on outside click or Escape), C a Done button in single mode. Prototype branches `ecm-feat/time-picker-close-b` and `ecm-feat/time-picker-close-c`.
- [ ] **[P3] A single select with a search box (Stas, 2026-10-14, from mm-ecm ME-530).** The ECM Audit & History «Event type» filter (69 options) got search on ECM's own `app-field-select` (button trigger, filter row in the panel, groups) instead of `ds-autocomplete`. Stas: leave an ask in the DS for such a component or feature. Options: A `searchable` on `ds-select`, B new component, C a select-only mode on `ds-autocomplete`, D nothing.
  **Today:** `ds-select` has no input (`select.component.html:24`, only `createTypeAhead`); `ds-multi-select` has the filter row, `searchable` (boolean or option-count threshold, default `DS_CONFIG.picker.searchable`), `filterWith`, `filterChange` (`multi-select.component.html:173`, `.ts:150-174`); `ds-autocomplete` types into the trigger itself (`autocomplete.component.html:83`). Same product question as the «create what I typed» item under Component feature gaps.

- [ ] **[P2] A clipped value's tooltip should line up with the text it completes (Stas, 2026-10-10).** `dsTooltipWhenClipped` opens a panel capped at `--tooltip-maxw` (240px), so the full text of a wider clipped link wraps narrower than the ellipsized text under it (mm-ecm Workspaces, program name). **Wanted (Stas):** for a clip-test tooltip the minimum width stays as it is today, and the maximum width becomes the visible width of the clipped element, so text that would grow the panel wraps at the width of the ellipsized text.
- [~] **[P1] A `ds-table` column without `width` grows to its text; it needs a sensible default clip width (Stas, 2026-10-06).** Work branch `ecm-feat/table-width-by-type`, built and waiting on Stas's sign-off.
  **Decided 2026-10-12 (Stas), under his condition that column widths never move when the data or the page changes:** widths come from the column config, never from the rows - by column kind (A); a `truncate` column in a table that scrolls anyway is exactly 240px of text (A).
  **Built on the branch:** `table-layout: fixed` with a `<colgroup>`; `TableColumn.kind` (`TableColumnKind`): `id` and `date` 130px, `number` 120px, `status` 110px, each widened to its header label; `text` columns share the rest equally, floored at the header label or `minWidth`; when the floors do not fit, the table scrolls and a `truncate` text column without `width`/`minWidth` is 240px of text (272 default, 264 compact). Header labels are measured at max-content when the column set, density or fonts change, never per row; `width: 'content'` is re-measured from the rendered rows. `measureGrowingClips`, `widestValue`, the canvas and the per-data split are gone; `minWidth`, numeric `width`, drag and the link focus fix stay. CHANGELOG `## Unreleased` and `migrations/unreleased.json#table-column-width-from-config` (supersedes `0.15.0#table-truncate-without-width-grows`); the 0.15.0 verify line no longer claims the width holds across pages.
  **Measured 2026-10-13, harness `paging-pager` / `paging-server` / `ecm-seg-records` page 1 -> page 2:** dev Email 620 -> 553 / 303 -> 553 / 264 -> 69 px; branch 285 -> 285 / 285 -> 285 / 264 -> 264, every column equal on both pages.
  **Left for the review:** rows grow where text columns now share equally (harness `auto-mixed` row 52 -> 80, `content-wide` 52 -> 94), a column of short values keeps its share, and a table whose every column is explicit and narrower than the container spreads the slack over all of them (harness `resize` step 4: email set 105, drawn 111; the same on dev) - open: A last text column takes the rest (recommended), C as is, B filler column (leaves empty space); nothing built until Stas picks.
  **Decided 2026-10-13 (Stas, the free space when every width is set):** C, text columns share equally as built; the one-time fit by the first page (A, B) rejected by Stas.
  **Decided 2026-10-09 (Stas):** table width stays 100% with the slack in the auto column (B); a cell template that ellipsizes its own text gets the tooltip from the DS clip test, which counts descendants (A, nothing to build; option B, mm-ecm putting `dsTooltipWhenClipped` on the clipped span itself, stays possible); `truncate` stays one line with an ellipsis (C; B and D parked below); a column minimum set by the consumer (A, built: `TableColumn.minWidth`).
  **Consumer workaround to remove after the release** (mm-ecm ME-493, Delta review): `delta-records-table.component.*` wraps the value in `.value { display: block; width: 0; min-width: 100% }` with `dsTooltipWhenClipped`, marked `TODO(ds-clip-default)`; `truncate: true` on those columns replaces it.

- [ ] **[P2] Tooltips and trigger-anchored overlays should follow their trigger on scroll, not close (Stas, 2026-10-08).** Today every one closes: `TooltipDirective` and the `ds-menu-item` submenu call `closeOnScroll` (`overlay-motion.ts`), as `ds-popover`, `ds-select`, `ds-multi-select`, `ds-autocomplete`, `ds-date-picker`, `ds-time-picker` and `ds-color-picker` already did; only a pinned chart tooltip repositions. The cause of the earlier detach: CDK's `close()` and `reposition()` scroll strategies hear only the window and `cdkScrollable` ancestors, not a plain `overflow: auto` container such as the ds-docs content pane - measured 2026-10-08 in the ds-docs build: before the fix a hover tip, a pinned tip and an open submenu stayed put (pane moved 0px) while their trigger moved 59.7-60.3px; a pinned chart tooltip moved 59.7px with its mark. **Wanted:** follow the trigger (the chart tooltip's `closeOnScroll` + `updatePosition()` is the shape), close only when the trigger leaves the visible part of its scroll container.

- [ ] **[P2] Document how to build `ds-modal` actions (Stas, 2026-10-06).** Work branch `ecm-fix/table-auto-column-clip`.
  `components.md` says only "`[actions]` (footer button row)". The slot is a flex row with `gap: var(--space-3)`, so each button must be a direct projected child with `actions` on it. A consumer who wrapped the buttons in `<div actions>` got one flex child, no gap, and buttons stuck together (mm-ecm ME-502, `unarchive-program-dialog.component.html`). Wanted: one sentence and one example in the `ds-modal` section (also `ds-modal-card`, `ds-drawer`) saying that `actions` goes on each button, not on a wrapper; a dev-mode warning for a wrapper is optional.

- [ ] **[P2] Bring `ai-sdlc-prototype` up to the mm-broker frontend (Stas, 2026-10-07).** The starter
  repo (`C:/Repositories/ai-sdlc-prototype`, last commit 2026-09-05) has fallen behind. Take the
  mm-broker frontend (`C:/Repositories/mm-broker-platform/src/frontend`) as the reference for code
  and project base - structure, tooling, lint and format setup, Claude config, the current design-system
  version and how it is consumed - carry its best practices into `ai-sdlc-prototype`, and finish what is
  left there. Tracked here because Stas does not open that repository; the work itself happens in it.

- [ ] **[P3] `ds-waterfall-chart` is `ds-cascade-chart` (Stas, 2026-09-23).** The English `waterfall`
  is the field's standard word - Excel, Power BI, Tableau, Highcharts and ECharts all use it, with
  `bridge` as the finance synonym - so this is a preference, not a correction, and it is his to make.
  **What moves:** the selector, `WaterfallChartComponent`, `WaterfallChartBar`, `WaterfallChartKind`
  (the three exports of `waterfall-chart/index.ts`), the entry point
  `@ids-group-ltd/ids-design-system/components/waterfall-chart`, the `g[dsWaterfallMarks]` mark, the
  `--ds-waterfall-chart-*` tokens, the internal `.waterfall-chart` class, the docs page and the
  catalogue leaf.
  **Migration:** a `selector-rename`, one `type-rename` per exported symbol, a `token-rename` for the
  prefix and a `class-rename` for the internal class - the shape `donut-chart` to `pie-chart` used in
  0.13.4 (`migrations/0.13.4.json`, `donut-chart-renamed-to-pie-chart`), which is the worked example
  to copy. No consumer uses `ds-waterfall-chart` yet, so the cost is the library's own surface. The old tag is an unknown element rather than an
  error: Angular renders nothing and logs nothing outside strict schema mode, so a missed one is a
  chart that silently vanished.

- [ ] **[P3] Rename `ds-bar-chart` to `ds-row-chart` (Stas, 2026-09-24).** Reverses the name kept by the
  `ds-bar-name-collision` decision. Migration: a
  `selector-rename`, one `type-rename` per exported symbol, a `token-rename` for the
  `--ds-bar-chart-*` prefix and a `class-rename` for the internal `.bar-chart` class - the same shape
  as the `ds-waterfall-chart` item above.

- [ ] **[P3] Pin more than one mark at a time (Stas, 2026-09-29).** Today a chart holds one pin:
  `chartActiveMark` keeps a single `index` and a `pinned` flag
  (`components/chart-tooltip/chart-active-mark.ts`), the tooltip directive keeps one overlay per
  chart (`chart-tooltip.directive.ts`), and a press on another mark moves the pin rather than adding
  one. **What moves:** the active-mark state becomes a set of pinned indices beside the hovered one;
  the directive opens one panel per pin while the hover panel keeps gliding; each pinned mark carries
  its disc; `Unpin` releases all of them, and a click on a pinned mark releases that one. The
  category cursor of `ds-chart` (`pinOnClick`) needs the same, one band per pin.
  **To decide before building:** whether a plain click adds a pin or a modifier does (a plain click
  that adds changes what every chart does today), a cap on how many, how panels that would overlap
  are placed, what a press outside the plot releases, and how the keyboard adds and removes one.

- [ ] **[P3] Cut the prose in ds-docs (Stas, 2026-09-29: too much text, and nobody reads it).**
  The pages explain too much. Readers skip the text and look at the demos. Keep what a demo cannot
  show: the input or token name, a default value, and a constraint that is easy to break. Cut the
  rest: paragraphs that restate what the demo shows, rationale, and a fact that repeats on several
  pages (for example, shared chart inputs belong on Foundations only). Size, measured 2026-09-29:
  103 `ds-docs/src/app/sections/**/*.section.html` hold 53448 words once tags are stripped. That
  count also includes demo data and code-sample text, so the prose share is smaller. The largest
  files are `table` (5080), `line-chart` (2422), `charts` (2082), `tokens-reference` (1548) and
  `chart` (1504). Start with those. Re-measure with the same command, which pipes `find`, then
  `sed 's/<[^>]*>/ /g'`, then `wc -w`.

- [ ] **[P3] Measure an IDS start from `ai-sdlc-prototype` against Vanya's from-scratch run (Stas,
  2026-10-05).** Vanya did not use the starter: he repeated Fedya's case one to one, with the whole
  setup handed to the AI from scratch, autonomously in one prompt (no fix iterations), following the
  `REPLICATE.md` protocol in his project (machine labels pc1/pc2/pc3, stacks in the order vue,
  angular, svelte, three repeats, detached long chains, a final comparison in `RESULTS.md` section
  9). His code and prompt are in `itb-frontend-frameworks-pc2.zip` (from the chat). Once the starter
  carries the fixes from Vanya's and Fedya's feedback, rerun the same protocol from
  `ai-sdlc-prototype` and compare time and tokens; the expectation is a several-fold faster and
  cheaper setup.
- [ ] **[P3] Cut the tokens a consumer's agent spends finding its way in IDS (Stas, 2026-10-05).**
  Stas is testing ways to give Claude a ready map of what lives where, what each part is for and how
  to use it, so an integrating agent stops reading the library to orient itself. Overlaps the md
  ARCHITECTURE item under "Agent-facing docs"; measure tokens per integration task before and after.
- [ ] **[P3] Agents and skills inside the DS repo for its own tasks (Stas, 2026-10-05).**
  Task-specific agents/skills shipped with the repo, so an outside agent does not explore the
  library on its own time and tokens. Inventory the recurring consumer tasks first.
- [ ] **[P3] Split IDS into rules/design system and a UI kit? An idea to think through (Stas,
  2026-10-05).** No advantage found yet. Angles to weigh: a framework-neutral rules/tokens package
  could serve the non-Angular stacks the live runs already use (vue, svelte) and Claude Design,
  which reads rules rather than components; an agent integrating IDS could load only the layer it
  needs, cutting tokens; the two could version separately (a token change without a component
  release). Against: two packages to publish and keep in step, and a consumer that wants everything
  installs two. Settle what each consumer actually reads before deciding.
- [ ] **[P3] Fix what the Claude Design run surfaced (Stas, 2026-10-05).** IDS worked well in Claude
  Design; the lessons and review generated from its misses are being fixed now and feed the next
  upload. Link the lesson list here when it lands.
- [ ] **[P3] Collect concrete ideas from the live integration runs (Stas, 2026-10-05).** Vanya's
  docs and the live runs are useful input; ask the team for specific proposals and brainstorm them
  together.
- [ ] **[P3] Pass attributes through to the native elements (Vanya, 2026-10-05).** Attributes set
  on an IDS component should reach the native element it wraps. Think through which components and which attributes first.
- [ ] **[P3] An accessible stepper (Vanya, 2026-10-05).** The stepper needs
  accessibility work. Audit `ds-stepper` (roles, current step, keyboard) before choosing the fix.
- [ ] **[P3] Hooks in toasts (Vanya, 2026-10-05).** Consumers want hooks into
  the toast (custom content or lifecycle callbacks). Find out which hook his run reached for.
- [ ] **[P3] Styles in cascade layers (Vanya, 2026-10-05).** Ship the library
  CSS inside `@layer` so a consumer's styles win without specificity fights. Weigh the effect on
  existing consumers' overrides.

## Tooling

*This section also has items under **Decisions**, **Parked**, **Records**.*

- [ ] **[P3] `build-cards.mjs` cannot slice a chapter that nests a `block-title` heading inside `details.edge-cases`.**
  Pie, line, column and funnel chart publish as one whole-chapter card each, so a block such as pie's
  "Centre value fit" cannot be its own card: block-level marks fail the build ("nests a block the cards cannot
  address"). Teach `blocksOf()` to skip the nested edge-cases heading, then mark those four chapters per block
  (pie: Default, Centre content, Centre value fit) and list the withdrawn whole-chapter cards in
  `.design-sync/obsolete.txt`. Stas asked for it.

- [ ] **[P3] No pixel comparison was run over the 2026-09-29/30 library comment sweep (recorded 2026-09-30).**
  Two passes rewrote comments in 370+ files of `src/lib`; a comment-stripped code diff against the base came out
  empty, and build, lint and every `tools/check.mjs` check are green, but `tools/compare-docs-pixels.mjs` was
  stopped before its first route finished. Run it over every route for `dda7b8bf^1` against `dda7b8bf` (the sweep
  merge alone): any differing block is a rendering change a comment pass must not make.

- [ ] **[P3] `--picker-maxh` is an abbreviated token name (recorded 2026-09-24).**
  The picker list cap is spelled `-maxh`, against the spelled-out naming convention
  (`-max-height`); check-abbreviated-tokens reads only `--ds-*` names, so it does not catch it.

## Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)

*This section also has items under **Parked**, **Records**.*

Priority set by Stas: **dead code out of the bundle first, prototype UI simplification second.** Every
number below is measured; three records carry the method — **`packaging-diagnosis.md`** (what is
actually wrong, and why the service framing was misleading), `packaging-chunking-audit.md` (the
investigation, its fixtures and the §10/§11 measurements) and `basic-advanced-split-audit.md`
(component weight). This section sequences the existing items rather than duplicating them.

**A1/A2 and A3 are not substitutes — read `packaging-diagnosis.md` before treating either as
optional.** Tree-shaking (what is RETAINED) and chunk placement (WHERE the retained code lands) are
orthogonal problems that share a name. A1/A2 reduce retention: -18.9 KB for an app using no grid
features. A3 fixes placement: -108 KB off a consumer's initial bundle. **No internal refactor can do
A3's job** — placement is decided per module, ng-packagr emits one module, and rollup inlines
internal dynamic imports, so a library cannot create a chunk boundary inside its own entry point.
Conversely A3 does not shrink the table by a byte. **Both have shipped:** A3 as one entry point per
component (0.12.0), A1 and part of A2 as the opt-in directives `dsTableExport`, `dsTableColumns` and
`dsTableResize` (0.12.1). `done.md` has no entry for either.

| Measured | Value |
| --- | --- |
| unused components cost a consumer | 18.2 KB gzip |
| `ds-table` marginal cost, all of it its own code | 31.4 KB gzip |
| ablating the grid features from `ds-table` | **-18.9 KB gzip (-61%)** |
| `DS_CONFIG` flag can remove | **0 bytes** - proved: the flags were already `false` and the bytes still shipped |
| chunk placement, on a layered fixture | eager chunk 118 011 -> 85 800 B, no tree-shaking penalty |
| **how big the placement prize is for THIS library** | **unmeasured** - the 632 kB / 88% figure is mm-broker's, never reproduced |

That last row is why the order below starts where it does. `@if` in a template removes RENDERING, not
CODE: each branch compiles to its own embedded-template function referenced from the component's
`ɵcmp`, so it ships whichever way the condition goes. A directive in a consumer's `imports` is the byte
switch; `DS_CONFIG` is the behaviour switch. They compose, they are not alternatives, and only the
first one moves bytes.

**And the part that keeps getting mis-told: it is not the services.** Measured 2026-09-01, same probe,
four different eager anchors in the app root — `provideDsTheme()` 192 392 B gzip, `provideDsConfig({})`
192 342 B, one `<ds-button>` in the shell 192 244 B, `inject(ToastService)` 194 763 B. **All four within
2.5 KB of each other**, all with 11 of 11 lazy-only heavy components in the initial bundle, against a
DS-free floor of 59 019 B. A type-only import anchors nothing (+15 B). And `provideDsTheme()` is in the
documented setup every consumer copies into `app.config.ts`, so **every** app already has the anchor —
the service was just the one somebody noticed. Full table and every tested hypothesis in
`packaging-diagnosis.md`.

- [ ] **[P3] A2 - column filters and persisted layout out of `ds-table`.** A1 is priced (a fixed
  923 B seam); resizing, reorder with the picker and `@angular/cdk/drag-drop`, and CSV
  export already moved out as `dsTableResize`, `dsTableColumns` and `dsTableExport` (0.12.1). Still on
  `ds-table`: `filterMode` / `columnFilterOptions` / `filterQuery` and `persistLayout` / `storageKey`
  (`table.component.ts:273-342`). Three questions the ablation left open: does `truncate` stay in the
  base table, and do row actions and inline cell editing come out too? Both are equally advanced and
  were left IN, which is why 18.9 KB is a floor and not a ceiling.

- [ ] **[P3] B1 - `DS_CONFIG.prototype: true` is BEHAVIOUR only. For bytes, use a build-time flag —
  measured 2026-09-01.** `DS_CONFIG` cannot remove a byte (runtime DI value, nothing to fold), so its job
  is library-wide UI simplification on the components that always ship: calmer defaults, fewer states,
  simpler affordances on fields, buttons, sidenav. `resolveWithConfig` already exists, so that part is
  small. **But the earlier claim that NO flag can remove bytes was too broad** — see the new item below.

- [ ] **[P3] Build-time `define` flag: a consumer CAN strip library code from `angular.json` — measured.**
  Stas's idea (configure earlier than DI: `angular.json` / `package.json` / tsconfig rather than
  `DS_CONFIG`) is viable. `@angular/build:application` has TWO first-class options for it: **`define`**
  («replaced ... in any JavaScript or TypeScript code **including libraries**») and **`conditions`**
  (custom `exports` resolution conditions). Fixture `.claude/local/define-probe/`: a 500-line advanced
  branch behind a flag, in an ng-packagr-published FESM — `full` 123 498 B raw / 34 957 gz with 500
  markers, `define: { dsPrototype: "true" }` **99 550 B raw / 32 969 gz with 0 markers**. The branch is
  gone from a FESM compiled before the consumer's build ran.

  **The guard MUST be inline on the branch.** First attempt used a module-level
  `const ADVANCED = typeof dsPrototype === 'undefined' || !dsPrototype` and saved NOTHING (500 markers in
  both configs) — `define` had applied (identifier 2 -> 0 occurrences) but esbuild did not propagate the
  constant through module scope into the `if`. Inline `if (typeof dsPrototype === 'undefined' ||
  !dsPrototype)` works completely. The `typeof` form is required, not stylistic: a consumer who never
  sets `define` leaves the identifier undefined and a bare `if (dsPrototype)` would throw. This is the
  `ngDevMode` idiom. **Caveats before shipping:** the public API does not change, so binding
  `resizableColumns` in prototype mode compiles and silently does nothing (needs its own dev warning);
  two configs mean two bundles from one source, so CI must build both; `define` is a textual
  substitution, so a typo silently means «not set» and the flag needs a test proving the branch really
  disappears. `conditions` (serve a different FESM per condition) is the cleaner other half and stays
  unexplored - it needs two published builds; A3, its precondition, shipped in 0.12.0. The flag is
  not built, and no use case is named for it: the table's feature directives (0.12.1) took out the
  main candidate branches.

  **Division of labour, now that the tools overlap:** a whole unused component -> entry points (A3); a
  separable feature of a component you DO use -> an opt-in directive (A1/A2, seam overhead a fixed
  923 B); a branch inside code you must ship with no seam to hang it on -> `define`. Do not do both for
  the same feature.

- [ ] **[P3] Make the PORTALED overlay stylesheets opt-in — ~1.6 KB gzip, and that is the whole prize.**
  **CORRECTED 2026-09-01: an earlier version of this item claimed ~1.8 KB could move into component SCSS.
  It cannot.** Checked what the globally-forwarded partials actually define: `link` (533 B gz),
  `page-grid` (312 B) and `layout-utils` (184 B) are **public utility classes** — part of the API, they
  stay; `scrollbar` (297 B) styles `html` and `::-webkit-scrollbar`, document level, impossible to scope;
  `skeleton-shimmer` emits nothing (the reduced-motion stop lives in `ds-skeleton`);
  `surface-motion` (192 B) is `@keyframes`, and emulated encapsulation renames keyframes, which would
  break cross-component reference. Only `icon-base` could move, and it is 92 bytes. **The real lever is
  `dropdown-overlay` (1 043 B) + `overlay-motion` (458 B) + `toast-overlay` (91 B) = ~1.6 KB gzip, made
  opt-in** (`@use 'styles/dropdown-overlay'`), which pays only a consumer with no pickers, toasts or
  modals. Also verified: no double-shipping — `press` (20 stylesheets), `text-clip` (10) and `chip-row`
  (2) are mixins components `@use` and are correctly NOT forwarded by `ds.scss`.

- [ ] **[P3] The boundary guard is still `'off'` after A3, with four defects the flip must carry —
  found by the two-wave review, 2026-09-02 (`docs/packaging-record-review-2026-09-02.md`).**
  A3 shipped in 0.12.0 without the flip: `eslint.config.mjs:141` is `'off'`, and its comment still
  says "OFF until per-component entry points land (A3)". The flip can happen now; nothing here
  changes a shipped API.
  1. **The defaults are CYCLES, not the entry-point partition** - no longer biting. `DEFAULT_CO_LOCATED`
     holds the SCCs while the rule's semantics are entry-point membership, but at `'error'` with the
     defaults it reports 0 on today's `src/lib` (measured 2026-09-23): the A3 rewrites import across
     entries by package specifier, which the rule skips (`entry-point-boundary.mjs:110`).
  2. **`publicSpecifier()` maps a GROUP to a slug, not to an entry point.** 99 of 308 messages name
     `@ids-group-ltd/ids-design-system/components-root`, a specifier that cannot exist. Worse, the
     suggestion is derived from the group, so **~204 of 277 are wrong even with the right
     configuration** — every message pointing into a merged entry names a member instead of the entry.
     The co-location sets need a name. Not destructive: `meta` declares no `fixable`, so nothing
     auto-applies — it is a misleading string during exactly the refactor it exists to guide.
  3. **`ImportExpression` is unchecked**, so a dynamic `await import('../x/y')` is invisible. Zero
     instances today. NOT for the `@defer` reason once written down here: `@defer` is template syntax
     lowered by the compiler and never appears in the `.ts` ESLint parses. The real risk is a human
     reaching for dynamic import.
  4. **The rule FAILS OPEN on any unresolvable specifier** — a typo, a `.json`, a future `.mts`, a
     path alias all report clean. A boundary guard whose failure mode is "pass" is defeatable by a
     typo. `TSImportType` and `TSImportEqualsDeclaration` are unhandled for the same reason.
  5. **An import escaping `src/lib` is silently allowed.** Once the root is a facade, a file in a
     secondary entry importing `src/public-api.ts` is exactly the cycle ng-packagr rejects, and this
     rule would not see it. None exist today.

  **Also:** none of the four `ds/` eslint rules has a `RuleTester` suite, and every defect above is a
  two-line case. `node:test` is built in; `tools/` already ships six `*-selftest.mjs` (changelog,
  manifest-coverage, manifest-truth, void-tokens, deck, migration), so only the ESLint rules are
  unguarded.

- [ ] **[P3] Re-run `attw` with the tool actually installed, or drop the claim.** `packaging-diagnosis.md`
  carried a node10 grid presented as measured; `@arethetypeswrong/cli` is not in `package.json`, is not
  installed, and no output was ever saved. **The claim is withdrawn** (2026-09-02): re-derived with
  TypeScript 5.9.3's own resolver against the `shape-probe` packages in a real `node_modules`, with a
  failing negative control, a plain multi-entry build resolves green under node10 — ng-packagr emits a
  compatibility stub per entry point. `typesVersions` is needed **only for option E's short aliases**.
  What is still untested: those stubs carry `module` + `typings` but no `main`, so a node10 `require()`
  would fail — irrelevant for an Angular ESM library, and it is the one row `attw` would have covered.
  Worth adding `attw --pack ./dist/ds` to the release gate regardless; today's package passes, so it
  starts green.

- [ ] **[P3] A curated `prototype` entry point, now that A3 exists.** One extra entry re-exporting a light,
  opinionated set answers Mikhail's original basic/advanced ask at zero cost: no second package, no
  mirror, nothing duplicated, and `ds-table` stays one component. A3 shipped in 0.12.0, so this is due
  for a proposal; nothing is built.

- [ ] **[P3] A bundle-size gate in CI.** The ladder at `.claude/local/bundle-probe/` is already the
  measurement; running it as a check stops this regressing silently, which is how the current state
  arose. Also check whether `/design-system:auto-update-package` migrations can express a symbol moving
  between entry points — nothing to do while the root stays a facade, but needed before any entry
  point becomes the only path to a symbol.

**Not doing, and why.** basic/advanced as two packages: smaller prize than A1/A2, and it buys a second
table to keep in sync forever. `ids-charts`: a real candidate the day it needs a third-party renderer,
not before - a package split is justified by an EXTERNAL runtime dependency, never by component count.
DS-vs-UI-kit packages: parked until a consumer wants the tokens WITHOUT the components; today the
`exports` map already serves them.

**Scheduling constraint.** The rest of A2 refactors `table.component.{ts,html,scss}`, so it cannot run
beside another lane changing those three files.

## Agent-facing docs — the rules an agent needs to prototype a page, and an md layout it can navigate

- [ ] **[P3] An md ARCHITECTURE for the whole design system — cross-linked like a graph, not a pile of files (Stas, 2026-09-01, re-scoped 2026-09-02). NEXT UP, and the first step is RESEARCH, not code.**
  **What already shipped, so nobody re-solves it:** `components.md` (1285 lines / 153,880 B, six `##` sections, measured 2026-09-24) is a monolith with no unit smaller than a sixth of the file to load. `tools/split-agent-catalogue.mjs` generates `agent/` from it - `INDEX.md` (15.8 KB) plus one leaf per component, grouped into 10 area folders, 112 files - and a `--check` gate fails the build when the leaves drift from the source. That closed the COST of the monolith for one file.
  **What it did not close, and this item is about:** the split is one-directional. A leaf cannot say "this is the same field as that one", no leaf links to another, and nothing links a component to the token roles it reads. `design-system.md` (461 lines / 24,539 B) is still a separate monolith with one route into the leaves (`foundations/grid.md`). An agent that lands on `ds-input` cannot walk from there to the field-message rules, the status vocabulary, or the sibling controls.
  **Ask:** design the whole md layout as a graph — a single entry point that routes, then area → component → field, with cross-links between leaves the way an Obsidian vault links notes, so an agent reaches one fact by following edges rather than by loading a file that might contain it.
  **The sequence Stas asked for, and it is not negotiable:** research the practice first (how other design systems and agent-facing docs do this, what actually works), then ask him 10-20 questions, then a written plan — and only after his explicit go-ahead does anything get implemented. He parked it on 2026-09-01 until the Claude Design work was finished; that work is finished.
  **Points to settle when it is designed:** how the split is addressed (per component, per area, or per question); what stays in the root files as the always-loaded core; how a link is expressed so it survives both a generator and a human reader; how the index and the edges stay correct as components are added; and what the package ships versus what stays in-repo.
  **Precedent already in the repo:** `tools/extract-tokens.mjs`, `tools/extract-component-api.mjs` and `tools/split-agent-catalogue.mjs` all generate documentation from source at prebuild, each with a `--check` gate. Whatever architecture is chosen should be generated the same way wherever it can be, so it cannot drift.

## The hex readout rolls its glyphs like a mechanical board (recorded 2026-09-02, Stas)

- [ ] **[P3] Dragging the picker retypes the hex value instantly; each glyph should ROLL to its new
  value instead.** The direction is specified, not a preference to re-derive: an INCREASE sends the
  old glyph DOWN and brings the new one in from ABOVE (`2` → `4` — the 2 leaves downward, the 4
  arrives on top of it), a DECREASE reverses it (`7` → `2` — the 7 leaves upward, the 2 arrives from
  below).

  **That direction is a split-flap board, not an odometer drum, and the references disagree with each
  other.** A car odometer counts up by rolling digits up from BELOW — the opposite of what was asked —
  so building this from the odometer write-ups gets the direction backwards. Take the DIRECTION from
  the flap and the MOTION from the drum: a sliding strip, because the flap implementations
  (hello-mat.com's design-engineering write-up, `jayKayEss/react-split-flap-effect`) animate a hinged
  fold with `clip-path` halves, `rotateX` and `backface-visibility: hidden`, and a fold is not what
  was asked for — a strip that slides, like an old analogue counter.

  **Hex is ONE ordered alphabet, which is why letters need no special case.** Compare the two glyphs
  by index in `0123456789ABCDEF` and "increase" is defined across the digit/letter boundary for free:
  `9` → `A` is an increase, `A` → `9` a decrease, and the digit↔letter flow asked for falls out of the
  same comparison as `2` → `4`. Each of the six positions in `#RRGGBB` decides its own direction from
  its own pair; nothing carries between positions, so `F` → `0` is simply a decrease.

  **Two glyphs per position, never a drum of sixteen** — the outgoing one and the incoming one, and
  the incoming becomes the resident once the transition settles.

  **Clipped to the box it already occupies.** `overflow: hidden` on the per-glyph slot, nothing grows
  the readout, and a glyph half outside the rectangle with its other half invisible is explicitly
  fine.

  **Two open questions, and they are what makes this bigger than it looks:**

  - **BOTH readouts can roll, and the panel's `<input>` is the interesting half — RESEARCHED
    2026-09-02, and the answer is cheaper than it looks.** Per-glyph animation cannot live inside an
    input's value: there are no element boundaries to animate. The published recipe is a mirror layer
    over a transparent input, and its known costs are caret sync, selection sync, scroll sync and a
    per-keystroke timing budget. **None of the four applies here**, because the layer only ever has to
    be visible while the input is NOT focused, and every path that changes the value from outside the
    input leaves focus outside it:
    - the SV plane and the hue rail are `tabindex="0"` and their `pointerdown` handlers do NOT call
      `preventDefault()` (`color-picker.component.ts:223`, `:275`), so pressing either moves focus to
      that surface by browser default;
    - arrow-key adjustment happens with focus already on those surfaces — all three
      `preventDefault()` calls in the component are on `keydown`, never on a pointer event;
    - a preset is a `<button>`, which takes focus itself;
    - the panel autofocuses nothing (the one `focus()` call, `:380`, returns focus to the trigger on
      close), so opening it does not put the caret in the field;
    - typing in the field is the ONLY case where focus is inside it, and there an odometer would fight
      the user's own caret — so no animation is wanted, which is the same condition.

    So: `focusin` hides the layer and shows the native input, `focusout` restores it. No caret, no
    selection, no scroll to synchronise.

  - **One component, two mount points.** The trigger's `<span class="hex">` needs no overlay at all —
    it is already a span, so it hosts the roller directly. The panel input hosts the same roller as an
    `aria-hidden` layer inside a wrapper, positioned `inset: 0`. Alignment is exact rather than
    approximate because both readouts are `var(--font-mono)` at `var(--font-size-s)` /
    `var(--line-height-flat)`: the layer copies that font plus the field's `padding: 0 var(--space-2)`
    and `border-width-default`. Monospace also removes the width-jitter problem for `A`-`F` that
    `font-variant-numeric: tabular-nums` could not have solved.

  - **The geometry is MEASURED, not assumed (2026-09-02, headless Chrome over http, the shipped
    stylesheet and its self-hosted fonts).** JetBrains Mono at `--font-size-s` advances **8.40px**,
    and `0` and `A` measure identically — so the width-jitter worry is dead outright, not merely
    mitigated. `#FFFFFF` is **58.80px** of text in a **136px** inner field, leaving **77.20px** of
    slack, and the field reports `scrollWidth === clientWidth` (152/152), i.e. it is never scrolled,
    which is what makes the no-scroll-sync claim hold rather than merely look likely. The panel is a
    fixed 240px (`--color-picker-panel-w`), and **160.80px** is the width at which seven glyphs would
    start to overflow — so only a consumer who shrinks `--ds-color-picker-panel-width` below ~161px can
    break this. Keep `overflow: hidden` on the layer so that case degrades to a clip rather than a
    spill.
  - **A drag emits values faster than any animation finishes.** Every `pointermove` produces a new
    hex, so a glyph will be mid-flight when its next value lands. That forces a `transition` on
    `translateY` rather than `@keyframes`: a transition retargets from wherever the glyph currently
    is, keyframes restart from the top.

  **Three things cheap to forget.** The slot cannot jitter as glyphs swap, and
  `font-variant-numeric: tabular-nums` fixes the digits while doing NOTHING for `A`–`F`, so each slot
  needs a fixed width of its own. `prefers-reduced-motion` degrades to today's instant swap. And two
  glyph copies in the DOM read as "24" mid-transition, so the animated glyphs go `aria-hidden` behind
  one accessible text source.

## Focus indicators — what the two-wave review left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Decisions**, **Parked**, **Records**.*

- [ ] **[P3] Transitions are missing or wrong in places, and nothing says where (Stas, 2026-09-04).**
  Asked for as a sweep: add the ones that are absent, correct the ones that are wrong. Two mechanical
  traps are already known and should shape the sweep rather than be rediscovered. First, `transition`
  is ONE property: whichever rule wins REPLACES the other's list, it never adds to it, and 50
  component stylesheets declare their own — this is why `focus.ring` uses an `animation` instead, and
  why `_press.scss` deliberately declares no transition at all. Second, a state that appears and
  disappears cannot transition unless its resting state exists in the DOM: an element rendered only
  while active has nothing to travel from and will pop in whatever is written. Verify with animations
  ON — see the reduced-motion item below for how a void run reads exactly like a working one.

## Claude Design upload — what the freeze left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Decisions**, **Parked**, **Records**.*

- [ ] **[P3] Thirteen obsolete paths on the project can only be deleted by its owner.** Listed in
  `.design-sync/obsolete.txt`, printed by every build with the instruction to paste:
  `components/actions/Button/Button - Refused, and why.html`,
  `components/forms-inputs/TimeColumns/Time Columns.html`, `_TO_BE_DELETED.md`, plus the `.html`
  and `.prompt.md` pairs of ToggleButton "Toggle - link", CalendarDay "Day states" and FieldMessage
  "Messages error, warning, hint", "Reserved message row" and "The glyph on the message line". Blanked and
  unregistered from here; `delete_files` answers 403 for a non-owner by every route tested.

## The field system — the two controls outside it, and the two with no box to paint

*This section also has items under **Decisions**, **Parked**.*

- [ ] **[P3] `ds-autocomplete`'s arrow keys walk a private copy of the list cursor.** Stas decided
  on 2026-09-02 to share the picker internals, and the scope was the index cursor alone: the panel,
  the `DsOptionItem` group shape and the five projection slots are already shared and held by
  `npm run picker-parity`. `src/lib/core/list-cursor.ts` serves select and multi-select fully and
  autocomplete for PageUp/PageDown and Home/End, but autocomplete's ArrowDown/ArrowUp (`:636`, `:647`)
  still call the wrap-around walk at `autocomplete.component.ts:544-558`, the one that counts the
  create/no-match slot. The shared helper takes it as
  `{ length: slots, isEnabled: i => !options[i] || !options[i].disabled }`; what the move owes is a
  decision on the all-disabled case, where the private copy returns -1 and the shared one returns
  `from`. `ds-menu` keeps its own single-character type-ahead (`menu.component.ts:107-122`) beside
  the shared `createTypeAhead`.

## What the 0.9.0 - 0.13.3 manifests did not tell a consumer (recorded 2026-09-22, from the mm-ecm consumer)

Found while walking a consumer from 0.8.0 to 0.13.3, nineteen versions, one commit each. Every item
cost a wrong edit that the version's own `migrations/<V>.json` could have prevented. All six closed
2026-09-22; the section stays because two of them record a decision that will be asked about again.

- [x] **[P2] `banner.announce` flips an accessibility default and no config key can restore it -
  `DS_CONFIG.banner.announce` and `alert.announce` shipped.** The input reads `boolean | null` so
  unset stays distinguishable, and `announceResolved()` is what the component's ARIA reads. The
  0.11.4 item now says the audit has to enumerate rather than grep, and names the two shapes a
  severity grep walks past: a banner in a non-first `@else if` branch, and one whose `variant` is a
  computed expression. The new item carries `supersedes`, so a consumer walking the chain is not
  told to do 43 per-element edits first.
  **The dev-mode warning on an unannounced error banner shipped too** - `warnAnnounceOversight()`
  (`src/lib/core/announce-warning.ts:23`), called from `banner.component.ts:96-97`.

- [x] **[P2] A `surface: "style"` item never names the partial that carries it.** The rule is in
  `migrations/AUTHORING.md` with its own checklist line: an item whose change ships in one of our
  partials names that partial in `appliesWhen`, and its `verify` greps the BUILT CSS rather than
  the consumer's source. 0.8.0's `focus-partial-needs-use-line` and 0.10.0's
  `universal-focus-ring-base-rule` carry it now, and `README.md` says that `@use 'styles/ds'`
  resolves against every include path in order, so a consumer file of the same name earlier on the
  path wins and reads identically at the import site.
  **Not done: retrofitting the other 139 style items.** A token rename lands in a stylesheet the
  consumer wrote, so the partial question does not arise there; only a rule WE ship can fail to
  arrive.

- [x] **[P3] Only `ds-autocomplete` forwards `--ds-dropdown-panel-radius` - fixed at the cause.**
  Neither picker needed a wider forward: `ds-autocomplete` and `ds-multi-select` declared the panel
  radius and background WITH a fallback, so they always computed to a value and were always copied
  onto the pane as an inline style, where they outranked the `.ds-overlay-pane` rule a consumer
  writes. They read `var(--ds-<picker>-panel-*, initial)` now - unset until the picker's own hook is
  set. Measured in a browser: with no hook the pane carries no inline radius or background and a
  pane-class rule decides both; with the hook set it is pinned and wins.
  **The gate learned the idiom (Stas, 2026-09-22).** `check-void-tokens` treats an `initial` or
  `unset` fallback as the void it is - the declaration drops either way - and clears it only where a
  `void-ok` comment on the same line says the drop is intended. Stripping a block comment keeps the
  line count now, so the reported line and the marker lookup land on the author's line.

- [x] **[P3] The picker panels unify at 0.11.1 and `panelClass` only arrives at 0.13.1.** 0.11.1's
  `pitfall` says a retargeted rule widens to all three pickers, its `restore` gives the only
  scoping available at that version, and its `note` points at 0.13.1 and says to mark the widened
  rule until then. The deleteList row is narrowed: only the padding and row-radius compensation is
  dead, and any brand chrome in the same rule is still load-bearing.

- [x] **[P3] `select-option-list-caps-at-picker-maxh` prescribes something that cannot be done.**
  The `action` is global-only now, `appliesWhen` says why no per-picker form exists at 0.11.2, and
  the `pitfall` names both caps and which one governs the visible rows.
  **Not built: forwarding `--picker-maxh` onto the pane.** `panelClass` already expresses a
  per-picker list height, and `--picker-maxh` resolves at `:root`, so forwarding it unconditionally
  would pin it inline on every open panel - the failure `ROLE_TOKENS` in
  `src/lib/components/overlay-motion.ts` exists to avoid.

- [x] **[P3] `deep-option-type-rule` sends a consumer to hooks that an inline forward outranks.**
  The row now says where the four hooks must be set - on the picker element, never on the
  `panelClass` - and that a value inherited into the host counts as the host's.
  **Deliberately not fixed in code.** Measured 2026-09-22: `:root { --ds-option-font-size: 11px }`
  beats `.ds-overlay-pane { --ds-option-font-size: 22px }`, because the host's computed value is
  copied onto the pane. Guarding those thirteen tokens the way `ROLE_TOKENS` is guarded would
  reverse a recorded decision - the comment above that loop says an ancestor's value is MEANT to
  reach the panel through the component's own hook - and would break a consumer who themes a
  subtree rather than the root.

**The shape all six shared.** The release notes describe what changed in the package; a consumer
needs to know what that means for code it already has - what still works, what silently stops
working, what it must preserve by hand, and what to redo when the proper API lands one or two
versions later. A migration that spans versions is worth saying out loud in BOTH manifests: at the
first "this is temporary, mark it", at the later "here is the thing you marked".

## Charts and fields the ECM prototype could not use (recorded 2026-09-15, Stas: take all five)

All closed. Seven items, every one answered by v0.13.2 or by sending the question back; the section
stays because each records what the shape was argued down to. Verified against the tag on
2026-09-21: `segments`, `target`, `max`, `maxSecondary` and `drop` all resolve at `v0.13.2`.

- [x] **[P2] One bar whose segments are the parts of a whole — shipped as `BarChartRow.segments`
  in v0.13.2.** `segments?: readonly BarChartSegment[]` widened the published row rather than
  splitting the data model, and `partOfWhole` still gates whether a share of the total is a real
  quantity. It carries the outcome distribution on the consumer's `performance-overview`.

- [x] **[P2] `ds-progress` cannot show a target beside the fill — shipped as `target` in v0.13.2.**
  `readonly target = input<number | null>(null)`, on the same scale as `value`, drawn as a hairline
  across the track. It carries the KPI cards on `performance-overview`.

- [x] **[P3] A second value per bar row — closed by asking instead of building (2026-09-15).** The
  ask wanted `12,400 → 456` in one row; two numbers with a bar encoding the ratio is a table, so the
  question went back rather than a `detail?: string` going onto `BarChartRow`. The consumer had
  tried neither shipped route, and named why: `ds-table` with a bar in the cell was dropped because
  `ds-progress` took percentages only, so the cell would have needed a share computed up front —
  the same accessibility narrowing their own §6 describes. `max` removes the reason, and
  `[value]="requests" [max]="visitors"` is the row they wanted.
  **Kept because it is the argument against the next one of these:** a chart row is not a place for
  arbitrary text, and the route out was a missing input elsewhere rather than a wider row type.

- [x] **[P3] There is no mark small enough for a table cell — closed by `ds-progress`, not a new
  component (2026-09-15).** The ask wanted a `ds-meter` taking `value` and `max`, because every
  chart is a block with caption, legend and annex table, which is far too much for a 60px cell.
  `ds-progress` was already the thing asked for — one track, one fill, no chrome — short only a
  `max`, which it now takes. A second component would have differed by `role="meter"` alone, and
  that is a semantics question, not a reason to ship a near-duplicate.

- [x] **[P3] A point on `ds-line-chart` cannot carry a fixed label — shipped as `annotations`
  (2026-09-15).** `{ categoryIndex, label, seriesId? }`, drawn above the reading and below it where
  the plot has no room, anchored to its own edge near one, and dropped with a hidden series. Haloed
  rather than boxed so it survives crossing the line, and `aria-hidden` because the annex table
  already carries every reading.

- [x] **[P2] `ds-line-chart` cannot be told its value-axis maximum — shipped as `max` in v0.13.2,
  with `maxSecondary` beside it.** `niceMax` derived a bound from the data on every render, so a
  panel opened one agent at a time drew 13 hrs on a 0–14 axis and 26 hrs on a 0–30 axis with
  nothing on screen saying the scales differed. A pinned `max` keeps one frame across renders.

- [x] **[P3] `ds-funnel-chart` states the drop as a share and never as a count — shipped as the
  `drop` input in v0.13.2.** `FunnelChartDrop` is `'relative' | 'absolute' | 'none'`. Both readings
  answer different questions: what fraction leaked here, versus how many records that is. On a
  settlement waterfall the count is the one an operator acts on.

## The eleven styling hooks one consumer reached past the surface for (recorded 2026-09-21)

Measured in mm-ecm-platform-kb, which has no inert token pin: **156 `--ds-*` referenced, 0 that
resolve to nothing.** (One chart there is still hand-rolled, a stacked share bar predating
`segments`, but it reaches into nothing of ours and does not change this count.) What it cannot
express through the public surface is styling, and it is all in one shape - a rule that doubles a
class (`.segment.segment`) purely to out-specify our compiled `.segment[_ngcontent-*]`. **25 such
rules across 2 files**, plus one `!important` and two plain reaches, and every one names a property
the component tokenises everything around but not itself.

Counted with a script over every `.scss` under `projects/`, matching `/\.([a-z][a-z0-9-]*)\.\1/` in a
selector. A first count of 72 was wrong and is not the figure: it matched the app's own `.panel`,
`.table` and `.label` too. The doubled class is the reliable marker because nobody writes one for
their own stylesheet.

**Eight shipped as hooks between 2026-09-21 and 2026-09-22**, verified against the resolver blocks
on 2026-09-22: checkbox (`--ds-checkbox-label-font-weight`, `-row-align`, `-gap`,
`-message-indent`), the option row and the empty line (`--ds-option-color`,
`--ds-dropdown-empty-color`, `-font-size`), tabs (`--ds-tabs-gap`, `--ds-tab-label-font-size`,
`--ds-tab-padding-top` / `-bottom`, `--ds-tabs-panel-padding-top`), description-item (five term
properties plus `--ds-description-item-details-font-size` / `-font-weight`), segmented
(`--ds-segmented-segment-border`, `--ds-segmented-label-font-size`, and a group radius that rounds
the ends only), table (`--ds-table-head-padding-top` / `-bottom`), badge
(`--ds-badge-letter-spacing`) and button (`align="between"`).

The consumer has not adopted them: measured 2026-09-23, 23 doubled-class rules remain (22 in
`agent-portal/src/styles.scss`, 1 in `ecm-portal/src/styles.scss`); only the `ds-menu-item` pair is
gone. That is a consumer follow-up, not a library defect.

Three stay written down, all closed: one confirmed on the consumer's build, and two answered by API
that already existed, because both are the kind of ask that comes back.

- [x] **[P3] `ds-menu-item` - every hook the ask wanted already shipped, and the consumer confirmed it.** `--ds-menu-item-padding-x` / `-padding-y` carry the padding, `--ds-menu-item-label-font-weight` the weight, and a quiet row has both an input and a hook of its own - `quiet` renders `.quiet`, coloured by `--ds-menu-item-quiet-label-color`; `error` does the same for a destructive row. At `a1ff1f49`, the commit that recorded the ask, the two token names were abbreviations (`b3e0cace` spelled them out), which is the cause the other asks had too: unguessable from the CSS property.

  The consumer's rule, `mm-ecm-platform-kb` `prototype/projects/agent-portal/src/styles.scss`, written by Mikhail Shyshla on 2026-07-31 in `35ed3969`:

  ```scss
  .ds-overlay-pane ds-menu {
    .menu-item.menu-item { padding: var(--rp-sp-11) var(--rp-sp-18); font-weight: var(--rp-fw-400); }
    ds-menu-item.is-quiet .menu-item.menu-item { color: var(--rp-mute); }
  }
  ```

  `is-quiet` is their own class, not our `quiet` input, and the colour goes on the inner element rather than through the token that exists for that row.

  **The per-item override works, measured 2026-09-22.** A page reproducing the resolver shape - `ds-menu-item { --_label: var(--ds-menu-item-label-color, …) }`, the token set on an ancestor `ds-menu` and again on `ds-menu-item.is-quiet` - resolves `navy` on an ordinary item and `darkorange` on the quiet one. A declaration on the element beats one inherited into it, so the premise that the token "cannot be set per item" does not hold.

  **Closed 2026-09-22, confirmed on their build.** They applied `--ds-menu-item-padding-x` / `-padding-y`, `--ds-menu-item-label-font-weight` and a per-item `--ds-menu-item-label-color`, and both doubled-class rules are gone. The label colour resolves on the ITEM host, so a declaration on one item beats the menu's. They keep their own `is-quiet` class rather than the `quiet` input, which the token route serves either way.

- [x] **[P3] `ds-autocomplete` cannot pad its input past an overlaid search glyph - answered by the
  prefix slot, not a padding token.** `[dsAutocompletePrefix]` projects into an in-flow
  `.addon-slot` that pushes the input itself, so the glyph never needs to be laid over the field
  and the padding never needs to be guessed. A `--ds-autocomplete-input-padding-inline-start`
  would bless the overlay and then have to track its width forever. `showChevron` and
  `--ds-autocomplete-input-font-size` shipped.

- [x] **[P3] `ds-pagination` controls with bigger hit targets - answered by `size`, not a token.**
  `size` takes `'sm' | 'md' | 'lg'` and drives the control height and the label's type scale
  together. A `--ds-pagination-button-size` beside it would be a second way to say one thing, and
  the two would drift the first time one is set without the other. The label's `letter-spacing`,
  `text-transform` and the `layout` input all shipped.

# Decisions — waiting on Stas, not on work

## Open verdicts

- [ ] **[P2] Six behaviour changes published in 0.14.7 without a choice between alternatives.** Being
  taken one by one: `provideDsTheme` keeps a preset `data-theme`,
  `dsModalConfirm`, avatar-group hides past `max`, a disabled link with `disabledReason` keeps a Tab
  stop, `provideDsIcons` calls merge, chart pin geometry (8px gap, lift over a short column). They stay
  as built until Stas picks; a pick that differs ships as a behaviour change in the next release.

- [ ] **[P3] Which public tokens the library never reads go?**
  Measured 2026-10-05 (`var(--name` over `src/lib` and `ds-docs/src`): of 746 tokens in `styles/`
  and `themes/`, 121 have no reader in the library - 51 sizes of components and patterns that do not
  exist (`--cmdk-*`, `--wizard-*`, `--matrix-*`, `--calendar-*`, `--settings-*` and others, two of
  them read only by ds-docs), and 70 scale, palette and role names. In pinkmoon, mm-ecm and mm-broker
  the 51 have 0 readers; 12 of the 70 are read. Options: none, the 51 dead sizes, or all 121.

- [ ] **[P3] Does the picker list height become a public token, or stay behind `panelClass`?**
  Two caps sit on one panel and the settable-looking one is not the
  one that governs the visible rows: `--ds-dropdown-panel-max-height` caps the box and is forwarded,
  `--picker-maxh` caps the list and is not. `panelClass` has expressed a per-picker list height
  since 0.13.1; a public token would add a second way to say it, and `--picker-maxh` resolves at
  `:root`, so forwarding it without the role guard would pin it inline on every open panel.
  **Three options, all drawn up in the plan (scratchpad plan-F, task 53):** (a) one cap - the existing
  `--ds-dropdown-panel-max-height` governs the rows too, by dropping the list's own
  `max-height: var(--picker-maxh)` so the flex column fills the panel; the panel default becomes
  `calc(var(--picker-maxh) + 40px)` (still 320px), and a select with no header rows shows up to 310px of
  options instead of 280px (measured 2026-09-24 on the docs ds-select "Region": 310.8px list, 9.71 rows against 8.75; a token of 480px moves nothing today and gives 14.71 rows under (a)); (b) `panelClass` only, the token
  stays internal; (c) a new `--ds-picker-list-max-height`. Every other portaled panel in the library
  is sized by a public host token and none by `panelClass`. Stas leans to (a), verdict later
  (2026-09-24).

- [ ] **[P3] Should the `ds-breadcrumbs` hover colour derive from the link colour (`--ds-link-color`), like the `.link` helper?**
  `--_breadcrumbs-label-color-hover` defaults to `--accent` (`breadcrumbs.component.scss`), while the
  `.link` helper (`src/lib/styles/_link.scss`) hovers from its link colour mixed 80% with black. A
  consumer whose accent is a brand colour gets breadcrumb links that hover in a different colour from
  every other link. **Wanted:** a verdict on whether the breadcrumb hover default derives from
  the link colour the way `.link` does. The default is unchanged until it is given.

None of these is blocked on effort. Each is a verdict.

## Tooling

*This section also has items under **Asks**, **Parked**, **Records**.*

- [ ] **[P2] Publishing to npm stops working in January 2027 and the replacement is not chosen.** `publish.sh` authenticates with `NPM_TOKEN`, a granular token with **Bypass 2FA** on. npm removes direct publish for such a token in January 2027, leaving it able to read private packages and to stage a publish that a maintainer then approves with 2FA. Two failure shapes mark the token itself, and both fail the tag pipeline at `npm publish` with a tarball already built: `E404` on the `PUT` is an expired or revoked token, `EOTP` is a token whose Bypass 2FA is off — npm's default for a newly generated one.
  **The fork:** staged publishing, where the tag pipeline stages and a maintainer approves each release by hand, against trusted publishing over OIDC, which needs no token at all. `bitbucket-pipelines.yml` records that Bitbucket is not an npm trusted publisher, so the OIDC route has to be re-checked before it is ruled out rather than assumed gone.
  **Whichever wins, the 90-day rotation goes away with it** — that cap is npm's on a write-enabled granular token, and it is the only reason a release can fail on a date nobody touched.
  Stas 2026-09-14: keep the token, decide the route later.

- [ ] **[P2] Nothing catches a stale `decks/ds.css`, and two gates read it as the truth.** Regenerating it on 2026-09-10 moved 47 declarations that had nothing to do with the change in hand: the focus ring's `transition` → `animation` plus the `ds-focus-ring-in` keyframes, `--focus-ring-radius`, the four check-mark motion roles with the dropdown option's mark, and the mono ligature hook. So every deck had been rendering a pre-animation focus ring for as long as those changes had been in `src/lib`.
  **Why it matters beyond the decks:** `deck-lint`'s D012 and `check-void-tokens` both resolve `var(--x)` against this file, so a stale copy makes a live token read as void — and could hide a genuinely void one. `decks/README.md` says to run `build:deck-css` after changing any token; nothing enforces it.
  **The fix has a precedent in this repo:** `build-design-sync.sh` rebuilds its tree and fails when the committed one differs. The same shape here is `npm run build:deck-css` followed by a `git diff --exit-code decks/ds.css` in `lint:all`.

- [ ] **[P3] `tools/todo-index.mjs --check` is not in `lint:all`, so the index can still go stale between runs.** The generator exists and `node tools/check.mjs todo-index` fails on a mismatch, but nothing runs it, which is the same gap that let the hand-kept index drift for months. Held back deliberately: adding a step to `lint:all` changes the PR gate for every branch, and in a shared checkout a parallel session editing `docs/todo.md` mid-run would fail it — the C013 false-positive class this repo has already met. One line in the `lint:all` chain when that trade is accepted.

- [ ] **[P3] Publishing to Claude Design cannot run from Bitbucket, and Stas wants the CI route looked at again (recorded 2026-09-02).** Everything up to the publish is already automated and gated: `build-design-sync.sh` runs the generator, the Angular build, the bundle, `check-manual-surface`, `check-doc-api` and `build:upload`, then fails the build if a font file has no `@font-face` or a card has no declaration beside it. A committed `.design-sync/upload` tree that differs from the rebuild fails only a local run; in the after-release step on `node:22-alpine` (`bitbucket-pipelines.yml:132-185`) the script commits the regenerated tree as a separate release-bot commit after the tag, and has done so on 0.12.2, 0.12.3, 0.13.1 and 0.13.2. `tools/prepare-release-commit.mjs` does not rebuild it. **Only the last step is manual**, and it is manual for two reasons, both verified rather than assumed:
  - **The transport is a first-party entitlement, not an API key.** `/design-sync` is built into the Claude Code binary (18 references in the 218 MB executable) and its body arrives by entitlement; the `DesignSync` tool posts to `api.anthropic.com/v1/design/mcp` with a `designOauth` grant that lives in `~/.claude/.credentials.json`. There is nothing to put in a Bitbucket variable — a pipeline has no claude.ai login to grant.
  - **`finalize_plan` is a human gate by design.** It shows the path list for approval and rejects any write outside the approved plan, so even with a token it would not run unattended.
  **What is worth checking next**, in the order that would settle it fastest: whether a `designOauth` refresh token can be minted with a long enough life and a narrow enough scope to sit in a CI variable; whether the design API exposes a non-interactive equivalent of `finalize_plan` (a pre-approved plan id, or a project-scoped write token); and whether an owner-level grant behaves differently, since `delete_files` already discriminates by ownership.
  **The fallback if none of that exists** is a local one-command publish — a script reading the grant from the profile's own credential store and posting the same three calls — which Stas declined for now in favour of another look at CI. Until then the publish runs from a session: the tree CI produced is byte-identical to what gets sent, so the manual step carries no judgement, only the approval click.
  **And one thing only the owner can finish:** 72 orphaned `_preview/*.js` sit in the live project from the previous showcase design. `delete_files` returns `403 permission_denied — bulk delete requires project ownership`, one path as readily as in bulk, so Misha has to remove them.

- [ ] **[P3] `fix:all` reformats HTML that eslint then fights, and it is `fix:all` alone — `lint:all` is green.** The two globs differ, which is the whole of it: `format` checks `{src,ds-docs/src,tools}/**/*.{ts,json,md}` and never looks at a template, so the gate passes; `format:fix` adds `html`, `scss` and `css` to the same glob, so the repo's own fixer rewrites ~112 templates that `ds/template/element-content-newline` and `@angular-eslint/template/attributes-order` immediately want back. Measured again 2026-09-10 from both ends: `lint:all` exits 0 on a clean tree, and one `prettier --write` over three docs section files produced 63 eslint warnings, 23 of them attribute-order on the very attributes just added.
  **So the cost is not a red gate, it is a fixer nobody can run.** `fix:all` is the documented way to normalise a branch, and running it dirties every template it touches — which is how an unrelated file lands in a diff (it happened twice in this repo).
  **The fix is one glob, and it needs a decision because it is a policy file.** Drop `html` from `format:fix` so prettier owns ts/json/md and the two `ds/template/*` rules own templates, which is the shape `lint:all` already assumes. The alternatives are to drop the two ds rules and let prettier own html (bigger diff, loses the attribute-order convention the repo chose), or to leave it and say so in the script so nobody expects `fix:all` to converge.
  **Earlier measurements, still valid as evidence:** prettier reformatted 140 files (115 html + 25 ts) and eslint pulled 77 back (2026-08-25); in the order prettier → stylelint → eslint, `eslint --fix` reverted 111 of prettier's 112, leaving 8 files of whitespace inside inline elements that Angular discards. The tree has been in eslint's shape all along.

- [ ] **[P3] Ten manifest-format practices the audit marked *Adopt*, and nobody has ratified any of them (filed 2026-08-27 out of the migration-manifest audit).** The audit's own header says it: "the verdict column is a judgement about this repo, not about the practice." So *Adopt* there is a recommendation, not a decision — and the recommendations have sat unratified since 2026-08-25, which is the shape of a verdict nobody executes. **The decision is which of the ten, if any**, not whether each is defensible; every one was sourced from a primary doc, so they are all defensible and adopting all ten is a tooling project no consumer is pulling on.
  **Three of the thirteen are already settled and are NOT part of this item:** the instruction/rationale split shipped as `action` (the prose-split pass, 2026-08-25); package reachability shipped — `package.json` already exports `"./migrations/*"`; and `schemaVersion` was **rejected** in the prose-split session along with `author`, `place`, `outcome`, `unchanged` and `source`.
  **The ten, with what each would cost, verified as absent today** (grep: none of these keys or checks exists in `tools/migration-lint.mjs` or `migrations/AUTHORING.md`):
  (1) **precondition guard** — a no-op check each runbook opens with, so an item cannot half-apply (OpenRewrite `Preconditions.check`, Nx agentic runbooks); (2) **`replaceIn` polarity** — CDK's `CssTokenUpgradeData` defaults to ALL files and narrows; no manifest or tool here has a `replaceIn` key, so this must be re-grounded on whatever key actually scopes files before it can be decided; (3) **executable verification** — Polaris ships a literal alternation `RegExp` per token group, where our `verify` is prose; (4) **runtime signal ids** — Vue/Ember collect what actually fired per app, and `devWarn` already exists here, so this is wiring rather than a mechanism; (5) **escalation marker** — Next.js codemods write a comment that breaks the build until removed (adopt the comment half only); (6) **explicit "no replacement"** — ESLint's `replacedBy` may be an empty array to SAY there is none, and the back-fill count has not been re-run against today's 36 manifests; (7) **`deprecatedIn`** — one half of ESLint `deprecatedSince` / Ember RFC 0649 `since`; the `availableUntil` half was rejected; (8) **provenance link** — CDK makes the PR link a required member; adopt it optional and lint it only on `unreleased`; (9) **`ng-update` requirements key** — the hard pre-flight the Angular CLI enforces (adopt the key, NOT a port to real schematics); (10) **dry-run hit counts** — jscodeshift prints per-file outcomes and Next.js warns that a wrong path reports 0 rather than failing; this one lands in the plugin, not the lint.
  **Why it is P3 and not higher:** the audit's damaging findings are all fixed (23 of 23), the lint gained M034–M037 and M039–M046, and the delete-table parity gate is green — so nothing here is protecting a consumer from a live defect. It is the difference between a format that is ahead of the field and one whose *enforcement posture* is too, which is the audit's own summary of the gap.
  **Cheapest honest first cut if it is picked up:** (6) and (7) are additive keys with a lint rule each and, pending a re-count over the 36 manifests, no back-fill. (1), (3) and (4) are the ones that change what the gate actually PROVES, and the board's own rule applies — a gate proves nothing until you have watched it fail.

## The field system — the two controls outside it, and the two with no box to paint

*This section also has items under **Asks**, **Parked**.*

- [ ] **[P2] `ds-slider` and `ds-switch` compute no `controlState`, so a validation state reaches only their message.** They are the two field controls that do not bind `[attr.data-field-state]`; `ds-checkbox` and `ds-radio-group` do, and paint error and warning from it. A switch has a track and a slider a rail, and today neither can carry error, warning or success, so the only sign of an invalid state is the message line underneath, which `color-not-only` says is not enough. **Decide whether each paints its own indicator** for error/warning (and then whether `[success]` follows), the way `checkbox.component.scss` does for its box.

- [ ] **[P3] `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in, or say they are not fields (Stas asked 2026-08-20).** Audited, and they are not "fields missing a feature" — they never had the wrapper. **`ds-number-stepper`** exposes `value`, `min`, `max`, `step`, `size`, `disabled`, `ariaLabel` and nothing else; **`ds-dropzone`** exposes `accept`, `multiple`, `files`, `disabled` plus two outputs, and a projected `[hint]` content slot (`dropzone.component.html:30`, used by mm-broker). Neither has a `label`, `hint` or `error` input, a `ds-field-message`, `resolveFieldMessage`, or the `field-label` mixin — verified by grep, all zero. Every other one of the fourteen fields has all of it.
  **So this is a feature addition, not a unification**, and that is why it is a decision rather than work: both would gain `label`, `hint`, `error`, `errors`, `invalid`, `touched`, `reserveMessage`, a message row, and the label/required/optional block.
  **The case for doing it:** in a real form both want it. A numeric stepper needs a label and a validation error like any input; a dropzone needs a hint ("up to 5 MB, PDF only") and an error ("that file was rejected"). A consumer today has to hand-roll a label and an error line beside them, which is exactly the inconsistency this board exists to remove.
  **The case against:** neither has been asked for by a consumer, and `ds-number-stepper` may be intended as a bare control composed inside something else — though its own `ariaLabel` and `size` inputs suggest standalone use.
  **What joining costs:** the fourteen fields extend `DsControlValueAccessor<T>` / `DsBooleanControlValueAccessor` (`control-value-accessor.ts:121,188`, both over `DsFieldBase`), so bringing these two in also makes them forms CVAs, which neither is today - plus a `resolveFieldMessage` call, a `ds-field-message` in the template, and the label block.
  **Cheaper again since 2026-08-25:** the base was split into `DsMessageBase` (the message half) and `DsFieldBase` (that plus `errors`/`invalid`/`touched`) so `ds-button` could take the message line, and `ds-button` is now the worked example of wiring the message half into a component that was never a field. Both of these hold a value, so both want the full `DsFieldBase` — but the pattern, the resolver call and the template shape are all demonstrated now rather than described.

## Colour, interaction and typography tokens

- [ ] **[P3] Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24).** ROOT CAUSE (surfaced when a consumer scoped `--primary-h/s/l` on a checkbox and ONLY the focus halo moved): "primary" has TWO decoupled reps — (a) `--primary` + hand-picked ramp shades read by component FILLS; (b) `--primary-h/s/l` HSL channels feeding ONLY math-derived halos/ramp/gray-tint — with **no live link**, so a coherent scoped recolour needs BOTH the channels AND a `--primary` re-composition (the 3-/4-token footgun). **Re-verified true 2026-09-23** (`src/lib/themes/_semantic.scss:89-91` channels; `:109-110` hover/pressed already `color-mix`; halos `:214`, `:257`; gray tint `_base-palette.scss:28`). **IDEA:** one colour token per role as the only source; shades via `color-mix()`, hue via `hsl(from var(--primary) h <S> <L>)` keeping each step's hand-tuned S/L (see [[feedback-handtuned-colors-beat-formulas]] — only the HUE is single-sourced); drop `--primary-h/s/l` as PUBLIC API. Scoped recolour becomes ONE declaration; the `ds-color`/`--accent-*` indirection this would have unblocked already shipped in `src/lib/styles/_ds-color.scss`. **OPEN for the spec:** (a) colour space (`oklch`/`oklab` perceptual vs `srgb`/`hsl` matches today) — verify each derived role visually; (b) pure-derived vs hand-pick per role; (c) relative-colour + `var()` edge cases in the 3 target engines; (d) dark-theme interplay.

- [ ] **[P3] `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]]).** Stas 2026-09-24: the formula is not built now, the override slot comes later; the two pressed verdicts are built (0.15.1). Replace per-component `--ds-*-bg-hover/-active` + scattered `color-mix()` with ONE contract: a `.ds-interactive` class + presets driven by `--state-step-*` tokens in a NEW `src/lib/styles/_interaction.scss` (**still absent — verified 2026-07-24**), with an override slot (`--interactive-*-set`). Then migrate interactive components off their local recipes. **Rewritten 2026-07-24:** the old "retire `_forced-states` duplication" clause is now MOOT — `_forced-states.scss` no longer exists (docs state-forcing is per-section `:host ::ng-deep .pin-*` reading each component's `--_*` resolvers). What survives is the broader "should presentational/state styling live in global partials (like `_link.scss`) with components as thin sugar" question. (Housekeeping DONE — re-grepped 2026-08-10, the stale `_forced-states` refs are gone from `README.md` and `table.component.scss`; nothing outside `.claude/` mentions it.)

- [ ] **[P3] Theme recipe vs hand-tuned picks — alignment decision.** Button/icon-button state derivation uses the theme's 88%/76% mix-to-black recipe (**verified `button.component.scss:57-58`, `icon-button.component.scss:113-114,172-173`, `themes/_semantic.scss:109-110`, 2026-09-23**). If the single-source-colour calibration replaces `--primary-hover/-pressed` with hand-tuned values, the button defaults (color-mix off the resolved bg) diverge from the theme roles — decide then: components read role tokens again, or theme keeps the formula. **This is a concrete instance of the single-source item's open question (b); resolve it inside that spec, not separately.**

- [ ] **[P3] The 20 typography CLASSES still read `.t-*`, where the tokens behind them now spell it out.** `.t-h1` through `.t-h5`, `.t-display`, `.t-card-title`, `.t-caption`, `.t-overline`, `.t-l` / `-l-bold`, `.t-m` / `-m-bold`, `.t-s` / `-s-bold`, `.t-xs` / `-xs-bold`, `.t-mono` / `-mono-block` / `-mono-inline`. The 96 tokens they read became `--ds-typography-*` in `4d2ddd7d`; the classes were held back deliberately, so the two halves now disagree on how the word is spelled.

  Measured 2026-09-22: at least 3121 uses in this repo alone, counted as exact class names with a quote or a space on each side (`grep -rhoE "(^|[\"' ])(t-h1|t-h2|…)([\"' ]|$)" src ds-docs`), which undercounts two adjacent classes in one attribute. Consumer markup carries more, and unlike a token a class cannot fall back - a template left on `.t-h4` loses its type entirely rather than reading a default.

  **Stas: tokens first, classes recorded here (2026-09-22).** The question when it comes up is whether a markup vocabulary wants the same spelling rule as a token surface at all - Tailwind and every utility set in the field argue brevity IS the feature there.

## Framework & forms

*This section also has items under **Parked**.*

- [ ] **[P3] Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wiring.** `pending` — what does a field with an async validator in flight look like? `ds-input` has a spinner; nothing else does. `dirty` — the library renders "edited" nowhere today, so there is no treatment to bind to. `disabledReasons` — **ANSWERED 2026-08-26, and this one is now wiring rather than a decision.** The question was "a tooltip on a disabled control, or ignored?"; the `ds-button` refusal work settled it by measurement — **not a tooltip**: a tooltip needs hover, so it does not exist for a keyboard or touch user, and a natively `disabled` control cannot take focus to announce a description at all. The reason goes INSIDE the control (or under it as a `ds-field-message`), and the control switches to `aria-disabled` so it stays focusable. `ds-button.disabledReason` is the worked example to copy, including the `aria-describedby` wiring and the swallowed click.
  **What the contract actually hands us, read from the installed Angular rather than assumed:** `disabledReasons?: InputSignal<readonly WithOptionalFieldTree<DisabledReason>[]>`, and `DisabledReason` is `{ fieldTree, message?: string }` — so it is an ARRAY, the `Field` directive binds it automatically if the input exists, and **`message` is OPTIONAL**. That last part is the only real design question left: a reason with no `message` has nothing to show, so the control must stay disabled silently rather than render an empty line, and several reasons with messages need a rule (first one, or joined). Our own `disabledReason` is a single string, so the adapter is ours to define.
  The other two are still blocked on a LOOK. Each is one input once its appearance is decided. _(`focus()` was the fourth and SHIPPED 2026-08-10: a resolver on both control-value-accessor bases, verified on all twelve controls that lacked one.)_

## An indeterminate bar that survives a short track (recorded 2026-09-22, from the mm-ecm consumer)

- [ ] **[P3] An indeterminate `ds-bar` is never empty, or 86.7% is enough - one verdict left.**
  **The cause shipped fixed.** It was the easing, not the geometry: the loop ran on
  `--ease-standard`, a curve that decelerates into the end of a transition, and a repeat has no end,
  so the chunk crawled at both extremes - which is exactly where it sits outside the track. Measured
  in a browser by stepping the animation through one 1400ms cycle, 2000 samples: at least partly on
  the track 48.3% of the cycle before, 86.7% after; fully on it 17.4% before, 46.8% after. The loop
  is `linear` now, like the other three in the library, and `design-system.md` 5 carries the rule so
  it cannot come back.
  **What is left is a taste call, not a defect.** The chunk still leaves the track entirely for
  13.3% of the cycle. That is a travelling chunk behaving as designed; it is not the consumer's bar,
  which covers 100% of the track every frame and therefore cannot read as empty at any width.
  **The consumer hit this and fixed it before we shipped anything**, which is why their bar is the
  one place they did not adopt `ds-progress`: `node-card.component.scss` in mm-ecm draws a
  full-width fill whose `repeating-linear-gradient` scrolls exactly one tile per cycle, and its
  comment records the reason - "the track is 100% covered every frame and the loop is seamless, so
  it can NEVER empty or slide off-screen (the root-cause fix for the original invisible bar). No
  transform, no narrow translated chunk."
  **What that costs us:** adopting `ds-progress` there would reinstate the defect, and the only way
  to keep their behaviour is a rule on our `> span`, so the swap would trade a hand-rolled bar for a
  hand-rolled bar PLUS a reach into the component. Every other track they had is now `ds-progress`;
  this is the single hold-out.
  **Wanted:** a verdict between three - leave it at the travelling chunk, make the scrolling stripe
  the indeterminate default, or put the stripe behind an input so a narrow track can pick it. The
  prior art is small and is in their `node-card.component.scss` under
  `.card__track.is-indeterminate .card__bar`.

## Focus indicators — what the two-wave review left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Asks**, **Parked**, **Records**.*

- [ ] **[P3] No indicator has been measured for SIZE or contrast — the 2026-09-10 sweep answered 2.4.7 only.** It established that all 1807 focusable elements draw something; it read no indicator's area and no contrast against the colours next to it, which is what WCAG 2.4.13 Focus Appearance (AAA) asks for: an area at least the size of a 2px perimeter of the component, at 3:1 against adjacent colours. One known candidate already: `ds-table`'s column-resize handle indicates focus by widening its `::after` hairline to 2px over roughly 24px of height, ~48px² against the ~184px² a 2px perimeter of its own 8×40px box would need. It passes 2.4.7 and would fail 2.4.13. Whether the library targets AAA here is a decision, not a defect — record the answer before measuring the rest.

## Claude Design upload — what the freeze left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Asks**, **Parked**, **Records**.*

- [ ] **[P3] `.design-sync/conventions.md` is a generator INPUT, and nothing stops a reflow desyncing it.**
      `config.json` names it `readmeHeader` and `build-cards.mjs` copies it VERBATIM into
      `.design-sync/upload/README.md`, which `build-design-sync.sh` byte-compares. A prettier run over
      it on 2026-09-05 reflowed the fenced `tsx` block — a semicolon after `</Card>` among it — and
      left source and committed copy 37 lines apart. The content is restored, but the exposure is
      open: the ignore entry that guarded it was an unapproved prettier-config edit and was reverted
      with it. Two ways out, both Stas's call: a gate in `tools/` that fails when the source and the
      copy differ (no config touched), or one `.prettierignore` line for this file. Do not add either
      without asking — see the memory entry on linter configs.

- [ ] **[P3] Which of the 8 live chapters can also be frozen.** `live-chapters.txt` keeps toast, drawer,
  modal, popover, bottom-sheet, tree, loading-overlay and scrollbar live because their demo only
  exists once opened. Removing a line freezes that chapter's cards on the next run — 350 ms and
  2.1 MB per card become about 35 ms and no bundle. Stas asked to look at the list himself.

## Component feature gaps

*This section also has items under **Asks**, **Parked**.*

- [ ] **[P3] What the glyph-clip fix leaves to measure or decide.** Every block-axis clip in `src/lib` goes through `styles/_text-clip.scss` or carries a `glyph-clip-guard:` reason (`node tools/check.mjs glyph-clip`), and `node tools/measure-glyph-clip.mjs` finds no clipped line on the eight component and chart pages under Mulish, Segoe Script, Mulish at line-height 1 and Javanese Text, in either theme, except three that CSS cannot reach. (a) A native `<input>` (`ds-input`, `ds-number-stepper`) and the `ds-field-group` row: with Javanese Text (ascent plus descent 2.27em) at 14px the font's box exceeds the control's padding box by up to 10px. The ink stays whole in the screenshots, because that face's ink is far shorter than its metrics, but a fixed-height control cannot hold an unbounded glyph box. **Wanted:** a verdict on whether a field's height should grow with the font (`min-block-size` from `1lh` plus padding) or stay fixed. (b) Only Chromium was measured. `text-overflow` under `overflow: clip visible` and container style queries are specified and shipped in Firefox and Safari; confirm the ellipsis and the `ds-stat` clamp there. (c) A panel that opens on demand (menu, select list, tooltip, toast) is measured only where the docs render it inline; the open state is held by the lint, not by a measurement.

- [ ] **[P3] `ds-select` cannot offer "create «what I typed»", and the reason is that it has no place to type (recorded 2026-09-09, Stas).** `[dsCreateTemplate]` and `[dsChipTemplate]` exist in the library and `ds-select` reads neither — correctly, because both decorate features it does not have. Chips show MANY values and a single select holds one; create needs typed text and `ds-select`'s template contains **no `<input>` at all**. What looks like typing there is `createTypeAhead`, a keystroke buffer that jumps to the option whose label matches, so there is no query to turn into a new value.
  **So this is a feature request, not a missing template binding, and it arrives in that order:** first a panel filter field (the thing `ds-multi-select` already has as `.search-row`), then `allowCreate` plus a `created` output and the no-match branch — `ds-autocomplete` carries all three already and is the model to copy rather than re-derive. Only then does reading `[dsCreateTemplate]` mean anything.
  **The product question to settle first:** should a single select have a filter field at all? A short list does not need one and gains a control to tab through; a long one is unusable without it. `ds-autocomplete` already exists for "type to narrow, maybe create", so the honest answer may be to send consumers there instead of growing `ds-select` toward it. Settle that before writing code, or the field lands and then has to be argued about.

- [ ] **[P3] Keep one of the two ways `ds-info-hint` takes rich content (Stas, after consumers use them).** Projected content (A) and the `[content]` template (B) both ship, marked `TODO(info-hint-content)` in `info-hint.component.ts`. Compare how consumers write them - markup in one place against content built only on open - and drop the other in a major.

- [ ] **[P3] `DS_CONFIG` prototype mode — `prototype: true` (Mikhail's framing; Stas 2026-09-01: a `DS_CONFIG` flag works too, as `prototype: true`).** One flag in the existing `DS_CONFIG` that puts the whole library in prototype mode instead of asking a consumer to pick a package. **The honest caveat, and it must be settled before this is built:** a runtime config flag CANNOT reduce the bundle — the code for the features it disables is still imported and still ships, so `prototype: true` buys behaviour, not bytes. Only the directive split above removes bytes. So decide what the flag is actually FOR: (a) turning off advanced affordances so a prototype's UI stays simple and demo-able — a real and useful thing, unrelated to size; (b) build-time dead-code elimination, which would need it to be a compile-time constant a bundler can fold, not a DI value. Do not ship (a) while implying it does (b). `DS_CONFIG` already resolves per-component defaults via `resolveWithConfig`, so (a) is a small build.

- [ ] **[P3] Three edges left open on `ds-table` row expansion and the resize handle, each a judgement call rather than a defect.** (a) On a page with no rows the expand-all chevron still renders and its label reads "Expand all rows", while clicking it does nothing — the handler early-returns. This is an exact clone of what the select-all checkbox next to it does on an empty page, so it was left for symmetry; breaking the symmetry needs a disabled state on `.expand-btn`, which the shared icon-button chrome has no styling for. (b) Under `lazy` (no `pageSize`, `total` set) `expandAllLabel` omits " on this page" because it keys on `pageSize()`, while expand-all only reaches the rows that have arrived. Inside the already-declared-unsupported `virtualScroll` + `expandableRows` combination. (c) The expander column's `<th>` had no accessible name and now takes one from the expand-all button — which FLIPS between "Expand all rows" and "Collapse all rows", so in table-navigation mode every body cell in that column inherits a changing column name. The `select-col` `<th>` sets the precedent of naming itself from its control, but with a STABLE name. Fixing it means an `aria-label` on the `<th>` naming the column, which is a pattern the component does not use anywhere else.

## The chart family read as an architecture (audited 2026-09-22)

*This section also has items under **Bugs**, **Parked**, **Records**.*

- [ ] **[P3] `formatTick` on the package surface has no consumer in `src/`.** `charts-format.ts:126`
  (27 lines) is re-exported by `components/index.ts` and referenced only from `tools/probes/`.
  `ChartScales.zeroOffset` (`chart-scales.token.ts:70`) is declared on the mark contract and read by
  no mark - only the container's own template reads it.

- [ ] **[P3] `'none'` and `'grouped'` are the same value on `ds-column-chart`.**
  `column-chart.component.ts:331-335` branches them together for `slotCount` and
  `chart.math.ts:334-338` branches them together in `stackOffsets`; the component's own doc says
  "the two differ only in spelling" (`:153-155`). Either one goes, or the doc says which is
  canonical.

- [ ] **[P3] Two inputs decide one thing on `ds-funnel-chart`, and two vocabularies name one idea.**
  `showTable` (`funnel-chart.component.ts:111`) is resolved against the family-wide `dataTable` by
  mutual exclusion at `:412` - the only chart-local switch that supersedes a `DS_CONFIG`-backed
  one. Separately, `column-series` spells its tooltip anchor `'mark' | 'cell'` (`:134`) and
  `line-series` spells the same idea `'reading' | 'pointer'` (`:161`), in one folder. And
  `line-chart.types.ts:22` declares `LineChartStack` rather than narrowing `ChartStackMode`, then
  feeds it to `stackOffsets`, which is typed on the full union (`chart.math.ts:329-331`).

# Parked — asked, and deliberately not now

Ordered by how close each is to a first consumer ask, which is the only thing that unparks any of them.

## Two chart interactions held back (Stas, 2026-10-12: not now)

- [ ] **[P3] «Разница между двумя колонками» and «Отток виден на воронке».** The first: a clicked column becomes the base and the hovered one shows a bracket with the difference («+130 (+18%)»), built on the existing pin. The second: the hovered `ds-funnel-chart` stage draws the previous stage's width behind it, outlined, with the drop («-34%»); today the drop exists only as a number (`stageDrops`, `fellAway`). Both are new gestures or new marks, so opt-in when built.

## Wrapping in a `ds-table` cell (recorded 2026-10-09, Stas: parked, come back later)

- [ ] **[P3] Two wrap options for a `truncate` column.** Today a `truncate` column is one line with an ellipsis (picked C). B: the clipped text fills the height a neighbour already gave the row (lines = row height / line height), needs a per-row measurement on every resize and does not work under virtual scroll. D: always wrap, as a column without `truncate` does.

## ds-icon does not read the icon size scale (recorded 2026-08-24, from the state-glyph work)

- [ ] **[P3] `--icon-xs/sm/md/lg` exist (12/14/16/20) and `ds-icon` cannot be sized by them.** It takes
  a NUMBER (`size`, falling back to `DS_CONFIG.icon.size`) and writes `width`/`height` attributes, while
  publishing `--ds-icon-size` OUTWARD as an inline custom property. So the scale is only usable by
  hand-written CSS on someone else's svg, and an ancestor cannot say "icons in here are 14px" the way it
  can say that about every other dimension in the library. **The natural hook would be a CSS token, and the only route to one is `::ng-deep` into
  `ds-icon`'s template** — so that feature took a config value instead, and the glyph is a hardcoded 14px.
  **Half of the fix exists:** the global `.icon` rule already sizes the svg from
  `var(--ds-icon-size, var(--icon-md))` (`_icon-base.scss:3-8`). What blocks ancestor sizing is that the
  svg always carries its own inline `--ds-icon-size` plus `width`/`height` attrs
  (`icon.component.html:8-10`), because `sizeResolved` always returns a number. **Remaining fix:** emit
  the inline property and attrs ONLY when `size` is explicitly bound — an unbound icon then inherits
  whatever an ancestor declares, and a bound one still wins. **Not urgent and not free:** it changes how
  every icon resolves its size (`<ds-icon>` appears in 42 templates across 84 component folders), so it
  wants its own pass and a look at the pages that mix icon sizes in one row.

Stas: keep it in the backlog.

## The global `.icon` squeezes the `ds-icon` box (recorded 2026-10-09, from the mm-ecm consumer)

- [ ] **[P3] In `ds-banner` and `ds-dropzone` the `ds-icon` box is 16px while its svg draws 20px.**
  `.icon` from `styles/icon-base` is the only rule setting a width on the `<ds-icon class="icon">`
  host; the 20 sits on the svg alone. Options:
  **A** `ds-icon` keeps its own size (recommended: fixes the source, consumers included; text moves
  4px), **B** rename the class in the two components (as `option-icon`; a consumer's own
  `class="icon"` stays squeezed), **C** keep 16 (glyph shrinks, text stays), **D** nothing. No code
  lands until the verdict. Stas, 2026-10-09: decide later, keep it here.

## Missing components (from gap analysis)

Most of the original gap list has SHIPPED (verified 2026-07-24: multi-select · button-group · segmented · timeline · description-list · list · data-grid · confirm-dialog · layout · color-picker · slider · otp-input · tree · loading-overlay · split-button; plus this session's `ds-app-layout` + `ds-sidenav-footer`). Remaining:

- [ ] **[P3] Image / lightbox.** No demand stated; overlay/motion infra (`modal`/`drawer`/`overlay-motion.ts`) exists to build on.

- [ ] **[P3] Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Resizable split panes (drag a divider to resize adjacent regions). **DECISION-PENDING** on need. Reference: the `dsTableResize` directive's pointer logic (`onResizeStart/Move/End` with `setPointerCapture`, `table-resize/table-resize.directive.ts`) is a ready basis for the drag mechanics (panes vs columns aside).

- [ ] **[P3] CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Hierarchical cascading dropdown (ref https://primeng.dev/cascadeselect).** Pick a leaf from nested groups via a compact overlay that expands sub-levels (Country → State → City). GAP: `ds-select`/`ds-multi-select` are FLAT dropdowns; `ds-tree` is a full inline tree VIEW (single-select via `selectedId`), not a compact selector; `ds-menu` is an actions menu, not a value control — so no cascading value-select exists. Niche (category / geo pickers), no active request. Building blocks if pulled: `ds-tree`'s `TreeNode` model + the shared overlay/popover infra + `ds-select`'s trigger. Otherwise document "use `ds-tree` for inline hierarchy, or flatten into grouped `ds-select`".

## Missing tokens / foundations (from gap analysis)

- [ ] **[P3] Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog.** Add opt-in `--primary-cta`/`-hover`/`-active`/`-on`, defaulting to the `--primary*` family; the default solid button (the `--_family-base`/`--accent` slot — **note: no `.primary` class; verified `button.component.scss:45,55`, 2026-09-23**) reads them. Narrower than it sounds: `--ds-button-bg-color` (`:55`) already lets a brand set the solid fill, though for every colour rather than primary alone. Lets a brand give the CTA a deeper AA-safe fill when it rebrands `--primary` to a light colour, without darkening the role everywhere. Default theme needs nothing (white-on-`--primary` already ~5.5:1 AA). Ported from the a11y branch (`--brand-cta`); dropped in merge because the tokens didn't exist on main and default passes AA.

- [ ] **[P3] MED cluster — ASKED 2026-08-05, Stas: keep in the backlog.** Density beyond hit-targets (fonts/icons/pad — `[data-density]` scales heights/pad/avatars today but NOT `--font-size-*`/`--icon-*`, verified 2026-07-24) · fluid typography (`clamp()` — type tokens are fixed px). **No longer speculative — there is now a MEASURED case (2026-08-10).** Controls that hold chips set a `min-height` rather than a height, so when a tier floor drops below what the text needs they stop following it: under `ultra-compact` `ds-multi-select` measures **33px** and `ds-autocomplete` **29px** where the other seven reach 24px. The floor is applied correctly (`min-height: 24px`); the content cannot shrink, because at a 14px font the line box alone is 19.6px. Proved by hand: dropping `--font-size-s` to 11px in that container pulled them to 31px and 25px. So "density does not scale type" is not a nicety — it is why the bottom tier does not level. `compact` is unaffected in practice (33 against 32). _(The third clause — motion semantic presets — MOVED 2026-07-31 into the customizable-motion item under "Motion / overlays" as its slice 3; don't re-open it here.)_ Both remaining pieces are speculative, no active request; split into their own items if ever prioritized. _(high-contrast/forced-colors + RTL/logical-properties dropped — Stas 2026-07-07.)_

- [ ] **[P3] Default muted-text token fails WCAG AA (surfaced 2026-07-13 by the NPA-85 Branding agent's contrast audit).** Only `--text-muted` fails: `var(--neutral-400)` = `#9BA3B4` (`themes/_semantic.scss:60`) is **2.42:1** on the canvas `#F8FAFC` — below the 3.0 large-text bar, let alone 4.5 for body. `--text-tertiary` (`:59`, `#6B7388`) is already **4.53:1** and passes, so the starter's pin of `--text-tertiary` to `#6b7280` is redundant against the current DS. The DS itself reads `--text-muted` only for date-picker outside-month days (`calendar-day.component.scss:21`, `date-picker.component.scss:252`). Decide whether `--text-muted` should move, or is officially "decorative only" (then document the constraint).

## Virtualising a long picker list (recorded 2026-08-31, §9 P5, Stas: record only)

- [ ] **[P3] Five thousand options render five thousand rows.** No picker uses `cdk-virtual-scroll`,
  and the CDK is already a dependency, so this is a build rather than a research question.

  **Why it is the one §9 item deliberately not built while the other eight were:** virtualisation and
  `aria-activedescendant` fight each other. The cursor points at a row id, and a virtual viewport
  destroys the row when it scrolls out — so the id the trigger references stops existing, which is
  precisely the defect the review round just fixed twice (once for disabled groups, once for the
  unrendered chip slot). Making it work means the id has to survive the row: either the viewport keeps
  the active row rendered outside the visible range, or the cursor stops being an id reference and
  becomes a focus move like `ds-menu`'s. Both are real designs, and both change the keyboard model
  every picker now shares through `core/list-cursor.ts`.

  **Measure before building.** The threshold that makes this worth it is unknown: nobody has reported a
  slow picker. A list long enough to need virtualisation is also long enough that a filter is the real
  answer, and `searchable` plus `filterWith="none"` now covers a server-side search that never sends
  five thousand rows in the first place. Worth doing when a consumer shows a list that must be long AND
  unfiltered.

## A journey canvas the mm-ecm prototype could not use (recorded 2026-09-16)

One ask left from that batch. The two column-chart gaps beside it shipped in v0.13.3:
`data` takes a `ColumnChartSeries[]` whose series carries one colour for all its marks, and
`stack` covers grouped, stacked and normalized.

- [ ] **[P3] Journey / flow diagram - no component draws a branching node-and-edge canvas.** Nodes
  carrying a kind, branching edges carrying a label and a count, and a per-node run state. Nothing
  in the library draws one: bar, column, pie, funnel, line, meter, progress all plot QUANTITIES,
  and `ds-tree` is a hierarchy view rather than a canvas. The consumer built its own and renders it
  on NINE screens - `execute/active-journeys`, `execute/dashboard`,
  `prepare/offer-journey/builder` and the `journey` tab of all six campaigns - which is not
  decoration: the campaign journey is what that product is FOR. Counted 2026-09-21 by loading all
  71 ecm-portal screens plus all 5 agent-portal screens and reading the rendered DOM.
  **It collides with a written non-goal, and that is the thing to settle.** The phase-2 chart spec
  rules the family out by name - "no map, network, 3D, radar, rose, word cloud, candlestick. Wrong
  audience, wrong renderer, or a known bad read." A branching journey is the one shape in that list
  a consumer here actually ships, so either that line takes an exception or the answer is an
  explicit no.
  **What it has to hold, read off the working implementation** (mm-ecm-platform-kb:
  `prototype/projects/ecm-portal/src/app/features/programs/components/journey-canvas/`, 6
  components across 20 files, 2 353 lines): a node kind that colours and labels its card (start, email, letter,
  wait, condition, end), an edge that carries a label and a count (`Yes · 0` / `No · 0`), a
  condition that fans to two columns and rejoins, an insert affordance sitting ON an edge, and a
  progress row per node while a run is live.
  **NOT asking for a builder.** Drag-and-drop, the node editor and the add menu are consumer
  concerns and should stay there. The ask is the CANVAS: take a node list and an edge list, lay them
  out, draw the edges with their markers and labels, and emit a click. The prior art is small and
  readable - `edge-overlay.component.ts` (`pathFor`, one `<marker>`, three edge classes) and
  `layout.ts`.
  **PARKED 2026-09-22 by Stas: wait for a second consumer.** One product shipping a shape is not
  demand for it, and the node kinds, the edge count and the per-node run state are campaign
  semantics rather than a rendering primitive. The phase-2 non-goal stands until someone else asks.

## Docs nav chapters — the two limits the derivation ships with (recorded 2026-09-08)

- [ ] **[P3] A chapter list reaches only sections whose headings are `h3.block-title`.** `docs-section` derives its chapters by walking that one selector, so a section that titles its blocks any other way contributes nothing and its nav item shows no caret — silently, because there is no error to raise for markup that simply does not match. Chapters are opt-in per section (`[chapters]="true"`, 9 sections: the charts overview, seven chart pages and `ds-table`) and dev-only (`chapterNavEnabled()` = `isDevMode()`, `feature-flags.ts:12-16`) until this and the item below close. The limit is latent rather than biting today: `table.section.html` has 38 `h3` and 38 `h3.block-title`, line-chart 23 and 23, chart 7 and 7 - every heading in the chapter-enabled sections already carries the class, so nothing is dropped. A section that adds a plain `h3` later would lose it silently, with no error to say so. **Fix by** either normalising future sections onto `h3.block-title` or widening the walk to every `h3` inside the section and letting the heading opt out with an attribute. **A check would say which**: count sections whose `h3` elements carry the class against those that have `h3` at all, and fail when the two disagree — the same shape as `check-docs-attrs`. Worth doing before anyone concludes a section "has no chapters" when it has 20.

- [ ] **[P3] The active chapter is not scrolled into the rail's own viewport.** With ~38 chapters under `ds-table`, the highlighted one can sit outside the sidebar's scroll — the reader watches the URL fragment change while the list shows no movement, which is the same "where am I" problem the chapter list was added to solve. It is one of the two limits keeping the chapter nav dev-only. Section items never had this: there are at most ~20 per group and the group collapses. **Fix by** scrolling the active chapter link into view within the nav's scroller when `activeChapter` changes — `scrollIntoView({ block: 'nearest' })` on the element, guarded so a click the reader just made does not fight their own scroll. **The trap:** the nav is itself inside the layout's rail, so a naive `scrollIntoView` scrolls the PAGE as well; it has to be constrained to the nav container the way `onItem` constrains its scroll to the layout's scroller.

## Focus indicators — what the two-wave review left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Asks**, **Decisions**, **Records**.*

- [ ] **[P3] An icon-only control's focus ring 1px outside its 24px target, 26px on every control.**
  `target.min-size` in `styles/_target.scss` draws the ring on the target's edge, 24px across on
  every icon-only control; one more pixel of `outline-offset` there gives 26px on all of them
  (measured on ten controls). Stas, 2026-10-09: 24
  for now, recheck 26 later.

- [ ] **[P3] The `ds-tag` remove button's focus ring does not show on a solid tag.** The ring is
  `--focus-ring-color`, the same accent as the solid tag's fill, so on a filled tag it reads as no
  ring at all; on a neutral tag it shows. Found on the docs Tag demos, 2026-10-09; Stas: park.

- [ ] **[P3] The `ds-time-picker` clear button jumps down while pressed.** It is centred with
  `top: 50%` and `transform: translateY(-50%)`; `press.feedback` sets `transform: scale(0.97)` on
  `:active`, which replaces the translate, so the button drops by half its height until released.
  Read from the stylesheet, 2026-10-09; Stas: park.

- [ ] **[P3] The `ds-tabs` scroll arrows draw their chevron 1px above the box centre.** Measured
  dy -1 under forced focus; the arrows are `tabindex="-1"` and `aria-hidden`, so no keyboard user
  ever sees a ring on them and only the hover surface shows it. 2026-10-09; Stas: park.

- [ ] **[P3] The focus-indicator sweep only sees what is in the DOM when a page loads.**
  `tools/focus-indicator-sweep.mjs` forces `:focus`/`:focus-visible`/`:focus-within` over CDP
  (:385-402) on each visible match of `FOCUSABLE` (:128) and never clicks, opens or scrolls. Two
  groups never reach it: every focusable inside a closed overlay (modal, drawer, popover, menu, the
  picker panels, toast, bottom-sheet), and the bodies of the nine chart sections, which render under
  `@defer (on viewport)` and show a placeholder until scrolled to. Re-check by scrolling each page to
  its end and opening each overlay demo once before `tag()`. It is run by hand, not a gate, so a
  regression stays silent until the next run. The sweep forces the pseudo-class because
  `element.focus()` spends keyboard modality on its first call and reads `:focus-visible` false
  from the second element on.

- [ ] **[P3] Nothing catches a shell that rings on `:focus-within` when it means the keyboard.**
  Shipped and caught by Stas in a screenshot, 2026-09-05: the row ring on checkbox/radio/switch used
  `:focus-within`, which matches a POINTER focus too — and a checkbox, unlike a text input, is not
  granted `:focus-visible` on click, so clicking one left the ring behind until focus moved. The fix
  is the shared mixin `focus.ring-for` (`_focus.scss:53-68`, `:has(:focus-visible)`), used by
  `_control-line.scss` (checkbox/radio/switch) and dropzone; no current component shows the defect.
  The remaining `:focus-within` users (autocomplete, date-picker, field-group, input, multi-select,
  number-stepper, search, sidenav-footer, textarea) are text-field shells, where it is CORRECT -
  clicking into an input does grant `:focus-visible`. A gate is not obvious: the rule is "does the
  focusable inside this shell take `:focus-visible` from a pointer", which is about the element
  type, not the selector. Flagging `:focus-within` next to a template `<button>` would hit 7 of those
  9 legitimate shells (their clear/stepper buttons); a checker needs a sharper signal than that.

## Claude Design upload — what the freeze left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Asks**, **Decisions**, **Records**.*

- [ ] **[P3] The elements demo has not been opened in a real browser since the rebuilds.** `COMMANDS.md`
  says to serve `.design-sync/elements/demo` over http and look at it in a real tab, because a
  background or headless one freezes transitions and reports stale layout. Every measurement this
  cycle was headless. Nothing suggests a problem — the 127 live cards render and their panels open —
  but the one check the runbook asks for has not been done.

- [ ] **[P3] `templates` and `startingPoints` in `_ds_manifest.json` are in the schema and empty.** The
  pane is server-side and the CLI binary carries only the tool description, so what fills them
  cannot be determined from here. Nothing is known to be missing because of it.

- [ ] **[P3] `.thumbnail` — the project's cover image — has no source that regenerates it.** It lives at
  `assets/thumbnail.webp` and is copied into the tree; re-rendering it from a card is still open.

## Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)

*This section also has items under **Asks**, **Records**.*

- [ ] **[P3] `ds-button` pulls `field-message` statically, and it stays cheap only while the two
  share their dependencies.** `button.component.ts:40,46` imports `DsMessageBase` and
  `FieldMessageComponent`, so every button ships the message line whether or not it binds `hint`,
  `warning` or `error`. Today that is hundreds of bytes: `field-message.component.ts:9-11` needs
  only `IconComponent` and `DS_CONFIG`, both already in the button's closure, and the opt-in
  directive seam measured 308 B gzip worse. Re-measure the button with and without the
  line when `field-message` gains an import the button does not carry, or the button stops rendering
  `ds-icon`; the directive seam is the known way out.

## Component feature gaps

*This section also has items under **Asks**, **Decisions**.*

- [ ] **[P3] One tab stop per long table, arrow keys between its clipped values - PARKED 2026-10-09 by Stas.** A clipped `dsTooltipWhenClipped` value that no keyboard path reaches is a tab stop of its own while clipped, so a 25-row `ds-table` with two clipped columns holds 50 stops (measured in the ds-docs build). The parked alternative: roving tabindex, one clipped value at `tabindex="0"` and the rest at `-1`, arrows moving between them. APG allows that only inside a composite widget, so the table becomes `role="grid"` and `ds-table` takes the grid keyboard model (arrows, Home/End, PageUp/PageDown); without the role a screen reader in browse mode keeps the arrows for itself. Unparks when a consumer reports the stop count in a long table.

- [ ] **[P3] The clipped-value tab stop on a 500-row table: the reported 4x long task did not reproduce - PARKED 2026-10-09 by Stas, after the release.** An audit reported the largest long task after injecting 500 rows into a `ds-table` with two `truncate` columns going from 160-179 ms before the tab stop to 654-719 ms with it. Measured 2026-10-09 on production ds-docs builds, one fresh page per run, the truncate demo given 500 rows (1000 clipped values, 833 stops written): before the tab stop 199, 342, 129, 225 ms; with it 262, 176, 228 ms; with every host measured before any `tabindex` is written 184, 239, 141 ms. The shared ResizeObserver callback took 7-8 ms for a 994-entry batch with reads and writes interleaved, so writing `tabindex` does not invalidate layout there. Left to find: the audit's setup (viewport, CPU throttling, a resize after render, the accessibility tree on) and whether the cost sits outside the callback, in the style recalc of 833 newly focusable cells or in the per-host `closest` and MutationObserver registration at render; a performance trace of the inject task on both builds splits it. Unparks after the release.

- [ ] **[P3] Portaled CSS as opt-in — PARKED 2026-09-04 by Stas.** 1 055 B of the 2 793 B global sheet is the only part that could move behind an opt-in: `dropdown-overlay`, `overlay-motion`, `toast-overlay`. It saves only a consumer with no picker, no toast and no modal, which is close to nobody, and the cost is one more import in everyone else's bootstrap. The measurement stands if the balance ever changes; the AG Grid route (CSS inside the component) stays rejected because Angular injects those as runtime tags and a strict CSP under SSR blocks them.

- [ ] **[P3] Split the design system from the UI kit as two packages (Mikhail, 2026-08-30).** Mikhail asked whether the two can ship as separate packages: the UI kit being the whole component library, and the design system being the rules, tokens, themes and guides. **Partly true already:** tokens and themes ship as SCSS assets under `styles/*` and `themes/*` behind their own `exports` entries, and the rules/guides live in the deployed docs site rather than in the package. So the question to study is narrow: is there a real consumer who wants the tokens WITHOUT the components (a non-Angular app, a Figma/CSS-only pipeline, another framework), and does that consumer exist today? If yes, a tokens-only package is cheap and has no mirror-maintenance problem — unlike the basic/advanced table split, nothing is duplicated. If no, the current `exports` map already covers it. **Interacts with the entry-point work above:** a layered `core ← services ← components` partition and a tokens-only package are the same question asked twice, and should be designed together rather than separately.

- [ ] **[P3] A token named in prose is not checked against the tokens that exist, and the same fact lives in two copies.** `--static-white` was removed at 0.5.1 and was still advertised in `src/lib/themes/README.md` AND in `ds-docs`' theming page months later; both are fixed. `tools/check-doc-tokens.mjs` (in `lint:all`) gates prose, but only `--ds-*` names and only in `components.md` (`DOC_FILES` at `:30`, the `/(--ds-[\w-]+)/` match at `:66`), so the next `--static-white` still passes. Two mechanisms would close it: (a) widen `check-doc-tokens` to every `--token` mentioned in prose (every `*.md`, the ds-docs section templates), failing on any that no longer resolves in `_base-palette.scss` / `_semantic.scss` / `_tokens.scss`, with an allowlist for text that is deliberately historical — `docs/done.md` and the migration manifests must keep naming what they removed; (b) pairing the two copies, since a repo doc and its ds-docs page carry the same facts and drifted independently twice in one day. Sequence (a) first: it is mechanical and catches the class, while (b) is a restructure. The manifests are already covered and are not part of (a): `check-manifest-truth` fails a `--ds-*` name in manifest prose that exists at neither boundary tag, and its `phantomTokens` plus `DELIBERATE_PHANTOMS` allowlist is the shape to copy for the `*.md` half.

- [ ] **[P3] `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber.** Today it's a raw `value: number` + `min`/`max`/`step` + spinner, no display formatting. PrimeNG InputNumber's value-add is a formatted numeric field: thousands grouping, fixed decimals, currency/percent, locale-aware, parsed back to a number on edit. Add opt-in `mode` (decimal/currency/percent) + `locale`/`currency`/`minFractionDigits`/`maxFractionDigits`/`useGrouping`; format on display/blur, parse on focus/input. Masking prior art in-house: [[reference-masked-input-dom-writeback]] (pinkmoon phone/w3w imperative `element.value` write-back). No active request — likely pulled by the financial-admin consumers (mm-broker admin, pinkmoon amounts/rates/%); gate on the first such form. **GATE HELD 2026-08-25 (Stas), asked explicitly.**

- [ ] **[P3] Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog (not built, not closed).** Native `<select multiple>` is not a cheaper spelling of the same control, it is a documented antipattern: multi-selection is reachable only through Ctrl/Cmd- or Shift-click with nothing in the control announcing it, an unmodified click **discards the entire prior selection**, non-adjacent options cannot be selected from the keyboard at all, and screen readers handle it worse than a single `<select>`. The consensus alternative is a checkbox list — which is exactly what `ds-multi-select` already is.
  **The soft version of the ask does not survive either:** the moment a hypothetical `ds-select multi` is made usable it has to open a checkbox list, i.e. it becomes `ds-multi-select`, and the only genuine difference left is chips-in-trigger vs an "N selected" summary. If a consumer ever wants the compact trigger, the honest answer is the existing `[triggerDisplay]="'count'"` input, not a second component and a fork in the docs. The one case where nativeness would really matter — a plain HTTP form POST with no JS — is solved by a hidden `<select multiple>` inside `ds-multi-select`, not by changing the UI.

## DS-docs

*This section also has items under **Bugs**.*

- [ ] **[P3] Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below).** A section-heading toggle that draws a visual "inspect" overlay on the live demos: colour-coded lines/boxes for paddings, gaps, sizes with values+units, plus WHICH token/class drives each value. Read computed styles + `getBoundingClientRect`; map values back to the `--space-*`/`--radius-*`/`--font-size-*` scales. **Rewritten 2026-07-24 → start as a scoped pilot:** spacing-only on ONE section (e.g. button), then generalize. Greenfield, docs-only, no product impact. _(Verified: nothing exists today.)_

## The field system — the two controls outside it, and the two with no box to paint

*This section also has items under **Asks**, **Decisions**.*

- [ ] **[P3] CDK Menu adoption (option B) — parked.** ONLY if/when a menubar or context menus are needed. `ds-menu` = native roving + `DsOverlayCloseRef`, and nested submenus are native too (`ds-menu-item`'s `submenu` input, `menu-item.component.ts:64-65`). Plan: `docs/superpowers/cdk-menu-adoption.md`, a local note - `docs/superpowers/` is gitignored, so it exists only in the main checkout. When we move, prefer `@angular/aria` `ngMenu` over CDK Menu; gated on a real need or `@angular/aria` going stable.

## Tooling

*This section also has items under **Asks**, **Decisions**, **Records**.*

- [ ] **[P3] `templates` and `startingPoints` in the Claude Design manifest are unexplored, and so is what feeds the pane's "Usage notes for Claude" (recorded 2026-09-03).** Both manifest fields exist in the schema and are empty; `hasThumbnailHtml` is false. The pane is server-side — the CLI binary carries only the tool's own description (one `dsCard` hit, inside that text) — so nothing local can answer what fills them.
  **They are testable, though, because the manifest is ours now:** put one entry in `templates`, upload, and look at the pane. That costs one file and one glance. Same for the usage notes: open any card, expand the disclosure, and see whether the text is the component's `.prompt.md`. Neither can be settled without somebody looking at the pane.

- [ ] **[P3] Four components had no block of their own in ds-docs (recorded 2026-09-03, three fixed).** A card is ONE block of a ds-docs chapter — its heading, its prose, its demo — because the pane fits a card's declared `viewport` into a fixed tile, which makes the declared height the zoom level. Table's chapter measures 18919px and rendered as an illegible smudge; as 35 block cards nothing exceeds 2400px and the median card is 566px. A block is attributed to a component by `data-for="<kebab>"` on its heading in the ds-docs template; unmarked blocks belong to the chapter's own component.
  **Three are fixed.** `ModalCard` was the only one that actually hurt — its card was the entire 7049px Modal chapter. `ds-modal-card` is rendered by nearly every block there, so the split is editorial: the SURFACE anatomy (eyebrow, title badge, status, dividers, variants, form) is marked for the card, the OVERLAY behaviour (sizes, persistent) stays with Modal. `PasswordRules` had no `block-title` at all and now has one. `SidenavFooter` has its own `data-for` block, "The rail footer on its own" (`app-layout.section.html:287-291`, `aea39fee`).
  **One remains, not urgent:** `TimeColumns` has no card at all - it is on `PREVIEW_EXEMPT` (`.design-sync/UPLOAD-PLAN.md:68`) and absent from `live-cards.txt` (checked 2026-10-02), documented only inside the TimePicker chapter. A card of its own needs a `data-for="time-columns"` block in ds-docs.
  **The gate now reports by measured HEIGHT, not by markup**, because height is what the pane turns into zoom: `check-manual-surface` names any card over 3000px. A build cannot invent a demo, so closing these is ds-docs authoring.
  **`TimeColumns` has no API entry either:** it is one of the 12 that `extract-component-api.mjs` reports as "left out, not exported" (with `CalendarDay`, `ChartLegend`, `ChartTooltipPanel`, `FieldMessage`, `ModalConfirm`, `TableColumnsPanel`, `TableColumnsTrigger`, `TableExportButton`, `WaterfallMarks`, `ChartTooltipDirective`, `ProjectionDropped`). Those cards fall back to the chapter's API table, which is the only one there is.

- [ ] **[P3] `schematics/tsconfig.json` still asks for `moduleResolution: "node"`, which TypeScript 6 removes (recorded 2026-08-31).** `"node"` is the alias for `node10`. TypeScript 5.9.3 — what this repo pins — accepts it, so `npm run build:lib` is green today and 0.11.1 shipped complete: `dist/ds` carries the changelog, both digests, 25 manifests and a registered `schematics/collection.json`. On TypeScript 6 the same config fails with `TS5108: Option 'moduleResolution=node10' has been removed`, and because that error stops `tools/build-schematics.mjs` at its FIRST step, the run never reaches the copy steps — the package would then publish without the changelog, the digests, the manifests or the schematics, and `ng build ds` alone reports success.
  **The fix when the bump comes:** `module` and `moduleResolution` both go to `node16`. `ng-add/index.cts` is already a `.cts` file, so node16 emits CommonJS for it regardless and the `index.cjs` check in the build script keeps passing.
  **The trap around it:** `tools/build-schematics.mjs:31-37` resolves the pinned `typescript/bin/tsc`, not `npx tsc`, so a git worktree with no `node_modules` of its own fails on module resolution, which looks like a broken build rather than a worktree without dependencies; a global TypeScript 7 rejects this tsconfig outright. Verify a build failure in the real checkout before believing it.

- [ ] **[P3] Re-wrap `CHANGELOG.md` to ~100 columns (Stas, 2026-08-31: record it, not now).** This is a RE-WRAP, not a rewrite — no prose is shortened and no entry changes meaning. Measured 2026-09-24: 45 non-table lines run past 118 characters (`awk 'length>118 && !/^\s*\|/' CHANGELOG.md`), 153 including table rows (`awk 'length>118' CHANGELOG.md`). 0.8.0 (from `:6121`) is still the worst - the longest line, 1039 characters, is `:6419`, and several entries there are a single unwrapped line each - but 0.11.1 through 0.13.4 add their own (e.g. `:252`, `:2930`, `:3506` at 637). Re-derive the per-line list at pick-up time; it moves with every release.
  Two constraints for whoever does it: table rows (`| … |`) must NOT be re-wrapped, because `check-delete-tables` matches a manifest's `find` shapes verbatim against them; and several inline code spans are currently split across a break (`` `<button\n  class="link">` ``, `` `flex: 1;\n  height: auto` ``, `` `<ng-template\n  [dsFilterItem]="180">` ``), which a re-wrap should join rather than preserve. Three more came out of the same reflow and must join too: `` `ds-select { --ds-field-label-text-transform: uppercase; }` ``, the `::ng-deep ds-table tr:hover .cell-name { … }` workaround shape, and `` `color="neutral" variant="outline"` `` — that last one is a rename map, so a line-oriented grep for it currently misses the CHANGELOG, which is the exact hazard this gate was written for. Six shipped comments are ragged too and are NOT in this item: `_ds-color.scss:4`, `auth-layout.component.ts:20`, `_tokens-charts.scss:36`, `themes/light/_palette.scss:15`, `auth-layout.component.scss:29`, and `_status.scss:10-11`. Verify by comparing the whitespace-normalised word stream before and after.

## Framework & forms

*This section also has items under **Decisions**.*

- [ ] **[P3] Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking changes lands exactly there.** This repo builds on **21.2.22** (`v21-lts` is 21.2.25) and declares `"^21.2.0"` for all six Angular peers, which resolves `>=21.2.0 <22.0.0` — so **a consumer on Angular 22 cannot install this package without `--legacy-peer-deps`**. Angular 22 has been out since **2026-06-03**; `@angular/core` and `@angular/forms` are at **22.2.1** (`latest`), with 22.3.0-next.0 on `next`, as of 2026-10-02 (`npm view @angular/core dist-tags`). No consumer under `C:\Repositories` is on 22 yet - all declare Angular 21 (checked 2026-10-02).
  **P3, parked:** a consumer on Angular 22 **cannot install the package at all** without `--legacy-peer-deps` — the peers declare `^21.2.0`, which resolves `>=21.2.0 <22.0.0`. Angular 22 has been out since 2026-06-03, and it is now the version a new app starts on. It was filed as a decision, and the decision part (when to move) is real, but the blocking part is not a preference; nothing else here stops anyone from adopting a release, and no known consumer is on Angular 22 yet, so the block is prospective.
  **Why this is not just a version bump.** (1) **Signal Forms went STABLE in 22.0.0** — it left `@experimental` two months ago, which retires the "wait for it to stabilise" reasoning that shaped the original item. (2) The 22.0.0 changelog carries a signal-forms breaking change — `min`/`max` rules no longer accept string values, numbers or `null` only — and the fix shipped today (`fc1714d5`) touches exactly `min`/`max`, so it wants re-testing on 22 rather than assuming it carries. (3) 22.0.0 also added `ngNoCva`, an opt-out from `ControlValueAccessor` interop; every DS control provides a CVA **and** satisfies `FormValueControl`, so it is worth checking which path Angular 22 actually picks for our controls and whether the two ever race. There was a real bug of this shape in the 22 line (`angular/angular#67847`, CVA `writeValue` called back after `onChange`, infinite loop — fixed).
  **RE-VERIFY ON 22, specifically:** the whole Practice → Signal Forms page against 22 · `min`/`max`/`maxLength` write-type widening · the `readonly` alias · `hidden` on both CVA bases · whether `ngNoCva` should be set anywhere · whether the `touched` mechanism changed (one third-party source reports a v21 `touchedChange` → v22 `touch` output rename; NOT confirmed against the official changelog, so confirm it before relying on either).
  **PROBED 2026-08-21 in a worktree (`C:/wt-ds-ng22`, branch `probe/angular-22`) — installed 22.1.3 and
  compiled, rather than reasoning about it. Nothing in `dev` was touched.**
  **The library compiles CLEAN on Angular 22.1.3.** `ngc -p tsconfig.lib.prod.json` in partial mode with
  `strictTemplates` on: zero errors, 240 `.d.ts` emitted. So no component code stands in the way — which
  was the open question behind the whole item.
  **Three costs the item did not have, and they change the size of the "move the repo" option:**
  (1) **TypeScript 6.0 is mandatory** — `@angular/compiler-cli@22.1.3` declares `typescript: ">=6.0 <6.1"`,
  so the upgrade drags a TS major with its own migration in behind it (we are on `~5.9.2`).
  (2) **Node ≥ 24.15.0** — the 22 CLI refuses anything older ("requires v22.22.3 or v24.15.0 or
  v26.0.0"), so every dev machine and CI needs the bump before `ng build` works at all.
  (3) Three tsconfig fixes TS 6.0 demands: an explicit `rootDir`, `sourceMap` beside `inlineSources`, and
  `ignoreDeprecations: "6.0"` for the deprecated `baseUrl`. Cheap, but they are edits, not flags.
  **`touch` is CONFIRMED, and it is an addition rather than the rename the third-party source reported.**
  22.1.3's `FormUiControl` declares `readonly touch?: OutputRef<void>`; we declare no `touch` output
  anywhere (grep: zero `output(` in `control-value-accessor.ts`), so nothing was renamed out from under us
  — adopting it would be new surface, and the current touched reporting keeps flowing through the CVA.
  **`ngNoCva` needs nothing from us.** It is a selector EXCLUSION on ANGULAR'S OWN accessors
  (`input:not([type=checkbox]):not([ngNoCva])[formControlName]`, and the two `select` ones), so it governs
  whether Angular's built-in accessor attaches to a NATIVE element. Our controls provide their own
  `NG_VALUE_ACCESSOR` on a custom element that those selectors never match. Consumer-side knob, not ours.
  **`min`/`max` mismatch is real but NOT a 22 regression — checked against 21 as a control.** 22 types the
  contract members as `NonNullable<TValue> | undefined` while ours read `number | null`, and a direct
  `const x: FormValueControl<string> = inputComponent` assertion fails on **both** 21 and 22, with
  byte-identical errors: `errors` first (our `DsFieldErrorsInput` transform is contravariant against
  Angular's `unknown`), then `min` on the stepper. So the assertion is stricter than what `[field]`
  actually requires — it is a pre-existing property of taking DS-shaped errors as an input, not something
  the upgrade breaks. **Do not read it as a blocker.**
  **NOT verified, and it needs the Node bump first:** the docs app never built on 22 (CLI gate), so the
  whole Practice → Signal Forms page is still unexercised there, and so is anything runtime — the CVA
  interop race, `readonly`, `hidden`, the touched mechanism end to end.
  **What this does to the decision.** Widening the peer range to `^21.2.0 || ^22.0.0` is now backed by a
  compile on 22 rather than by hope, which is most of the objection to it. Moving the repo is a bigger job
  than the item assumed: Angular 22 + TS 6 + Node — three majors in one pass. The cheap-and-honest middle
  is to widen the peers, keep building on 21, and say in the release notes that 22 is compiled-but-not-
  runtime-verified until the Node bump lands.
  **The decision is the peer range**, since that is what the release publishes: widen to `^21.2.0 || ^22.0.0` (cheap, but claims a compatibility nobody has tested) or move the repo to 22 (honest, costs a real upgrade pass). **Context for the call:** Angular Material has NOT shipped signal-forms support (`angular/components#32072` still open), PrimeNG deliberately waited for stable and is repairing `[formField]` typing in 22.0.1, and Spartan has shipped it — so on this axis the DS is currently ahead of both libraries its consumers compare it to, and that lead is worth keeping installable.

  **DECIDED 2026-08-25 (Stas): NOT NOW — leave the peers at `^21.2.0`.** Neither widening nor moving.
  **This item is no longer waiting on a call**; it is P3, parked, because the fact that raised it is unchanged:
  a consumer on Angular 22 installs this package only with `--legacy-peer-deps` - though no known
  consumer is on 22 yet, so the block is prospective. Everything above stays
  as the prepared answer for when it is picked up — the 22.1.3 compile, the three costs (TS 6.0, Node
  ≥24.15.0, three tsconfig edits), and the three findings that are NOT blockers (`ngNoCva`, `touch`,
  the `min`/`max` assertion). **What would overturn it:** a consumer reporting that
  `--legacy-peer-deps` is not acceptable in their install, or an app that has to start on 22.

## The chart family read as an architecture (audited 2026-09-22)

*This section also has items under **Bugs**, **Decisions**, **Records**.*

- [ ] **[P3] The template state head is copied verbatim into eight chart templates.**
  The error and empty `<p>` blocks are byte-identical in bar, column, funnel, heatmap, line, scatter,
  waterfall and `chart/chart` (pie wraps them in its `.empty-ring`). No doc generator reads templates, so the block
  moves without losing anything.

- [ ] **[P3] `ds-scatter-chart` opts out of the shared roving-tabindex module.** `charts-roving.ts`'s
  `rovingMarks()` now carries the roving state for bar, pie, funnel and `chart/column-series`.
  `scatter-chart.component.html:86` instead puts `tabindex="0"` on every mark when `interactive`,
  against the one-tab-stop policy the other four follow.

- [ ] **[P3] Three charts hand-roll a legend and three compose their own accessible sentence.**
  `ds-chart-legend` exists and has three users (column, line, scatter); `pie-chart.component.html:145-185`
  builds a 41-line legend, `funnel-chart.component.html:98-158` a swatch table and
  `heatmap-chart.component.ts:211-219` a ramp key. `describeSeries` (`charts-summary.ts:79`)
  documents "the ORDER is the contract" and has six users; heatmap, scatter and waterfall each
  phrase their own instead (`heatmap-chart.component.ts:221-228`,
  `scatter-chart.component.ts:309-324`, `waterfall-chart.component.ts:176-195`).

- [ ] **[P3] Six places reimplement something a shared module already does.**
  `chart/line-series.component.ts:232-243` repeats `alignSeriesValues` (`line-chart.math.ts:12-30`) on
  data the chart already aligned at `line-chart.component.ts:275`. `scatter-chart.component.ts:62-64,190-193` declares its own
  gutters and plot rectangle beside `chartPlot` (`chart.math.ts:56`), and
  `scatter-chart.math.ts:50-71` its own clamped scale beside `valueScale` (`chart.math.ts:137`) -
  while using `linearScale` for the tick labels, so one component runs two scales.
  `heatmap-chart.math.ts:9-25` recomputes a clamped share `linearScale` covers.
  `bar-chart.math.ts:28-38` and `line-chart.math.ts:35-48` each reimplement the max reduction inside
  `axisDomain`, which itself carries the same loop twice (`chart.math.ts:103-110` and `:263-270`,
  byte-identical, same file). `waterfall-chart.component.ts:39` writes the literal
  `'var(--ds-chart-series-default-color)'` where `chart-palette.generated.ts:16` exports it.

- [ ] **[P3] Five constants carry two or three spellings each.** Tick count `5` at
  `chart.math.ts:16`, `line-chart.math.ts:5`, `scatter-chart.math.ts:5` plus bare literals at
  `column-chart.component.ts:175` and `waterfall-chart.component.ts:89`; plot height `240` at
  `chart.math.ts:35` and `line-chart.component.ts:63`; edge gutter `12` at `chart.math.ts:40` and
  `scatter-chart.component.ts:64`; value-label gap `8` at `column-series.component.ts:64` and
  `waterfall-marks.component.ts:15`; column width ratio `0.8` in three places.

- [ ] **[P3] A chart waiting for `deferUntilVisible` holds the whole loading skeleton (Stas: parked 2026-09-24).**
  The gate placeholder is the `loading` branch - one `ds-skeleton` per row, column, stage or legend
  entry - so the ds-docs charts page mounts 584 skeletons for 145 unbuilt charts. Hiding them with
  `display: none` cut 125-233 ms of main-thread time from the first 8 s of load (two runs, CPU x1,
  measured 2026-09-24). One box of the same height would keep the layout; it changes what a fast
  scroll shows for the fraction of a second before a chart builds, which is why it is parked.

# Records — kept so they are not "simplified" away

## The chart family read as an architecture (audited 2026-09-22)

*This section also has items under **Bugs**, **Decisions**, **Parked**.*

Four questions, asked of all eight charts plus the `ds-chart` container: does each earn its own tag,
is each existing variant warranted, what repeats that is not shared yet, and where does a component
reach around a module that already does the job. Every figure below is a file:line count, not an
impression.

**Seven of the eight earn their tag and are not in question.** The test is what a chart ADDS to the
one it most resembles: line adds 18 inputs, 3 datum fields and 2 marks over column; scatter adds a
continuous x that `ChartScales.xPosition` cannot express at all, since it takes a category index
(`chart-scales.token.ts:26`); heatmap adds a second axis of readings and its own ramp; pie adds six
inputs and inverts `partOfWhole` to true; funnel adds a stage-to-stage drop no bar chart derives.
Bar and column are settled separately and stay apart.

- [ ] **[P3] The chassis is declared nine times and shared once - about 450 lines of it.**
  `resolveChartDefaults` (`charts-defaults.ts:35-64`) unifies what the ten common inputs MEAN, and
  the `input()` lines above it never moved. The full ten repeat in bar, column, line, pie and funnel;
  heatmap carries 7 (no `tooltipLingerMs`, `summary`, `dataTable`), scatter and waterfall 9 (no
  `tooltipLingerMs`), `chart/chart` 9 (no `dataTable`). With their doc paragraphs they sit at
  `bar-chart.component.ts:105-167`, `column-chart.component.ts:178-238`,
  `line-chart.component.ts:186-254`, `pie-chart.component.ts:103-164`,
  `funnel-chart.component.ts:109-166`, `heatmap-chart.component.ts:99-133`,
  `scatter-chart.component.ts:135-177`, `waterfall-chart.component.ts:99-134` and
  `chart/chart.component.ts:117-211`. The `tooltipLingerMs` and `dimOthers` paragraphs are
  byte-identical in five files each.
  **The cost of moving them is the documentation, not the code.** `extract-docs` turns each
  docblock into that chart's own input table, so a base class buys ~450 lines and makes every
  chart's API page open with a shared preamble. The template and style duplication no generator
  reads is already shared: the state frame is `figure[dsChartStates]`
  (`chart-tooltip/chart-states.component.ts`) on top of `styles/_chart-frame.scss`.

## Thirteen inputs the chart family declares component by component (measured 2026-09-22)

- [ ] **[P3] Only the RESOLUTION of the shared chart inputs is shared, not their declaration.**
  `resolveChartDefaults` unified what the values mean; the `input()` lines above it did not move.
  Counting `readonly <name> = input(…)` and `= model(…)` at class level across the nine chart
  components: `caption`, `valueFormat`, `errorText`, `emptyText`, `error`, `interactive`, `frame`
  and `loading` are declared in all nine, `summary` in eight, and `tooltip`, `dimOthers`,
  `dataTable` and `data` in seven - 108 declarations for 13 names.

  Each carries its own docblock, and `extract-docs` turns those into the per-component input
  tables in `components.md` and `agent/`. A base class or a `hostDirective` would buy roughly
  a hundred lines and cost the documentation pipeline the per-component wording, which is what
  makes a chart's API page read as that chart's rather than as a shared preamble.
  **Not obviously worth doing.** Recorded so the next reader does not re-derive the measurement,
  and so the decision is made once rather than half-made.

## ds-app-layout — the one knowingly duplicated decision

> The parent shipped 2026-07-24 (as `ds-app-shell`, renamed in 0.7.0) with `ds-sidenav-footer` and the brand row; spec at `.claude/superpowers/specs/2026-07-24-ds-app-shell-design.md`. Only the record below is left.

- [ ] **[P3] `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing my own `118a539`).** The rail's layout switch lives in `app-layout.component.scss` as `bp.down(lg)`, and `watchDesktopBreakpoint()` runs `matchMedia` over the same `--bp-lg`. The VALUE cannot drift — both read one custom property, and a missing one now errors in dev instead of falling back to a literal — but the CONDITION is decided twice, in two languages, and changing one does not force the other. The JS copy is not removable today: `compact` gates `cdkTrapFocus` and the `role="dialog"`/`aria-modal` pair, and no CSS feature (container queries, `:has`) can drive a focus trap. **Recorded so nobody "simplifies" it blindly, and to revisit if** CSS gains a way to gate focus trapping, or Angular ships a breakpoint primitive. Not a bug — a knowingly duplicated decision over a single source of truth.

## A11y — decision record (deferred, NOT a bug)

- [ ] **[P3] topbar → `role="banner"`** — VALIDATED-REDUNDANT & DEFERRED (Stas 2026-07-06: skip it, keep the item). The bare `<header>` inside the generic custom element `<ds-topbar>` already maps to the `banner` landmark implicitly (**verified `topbar.component.html:1`, 2026-07-24**); an explicit role is flagged "unnecessary" by the W3C validator and would be WRONG if `<ds-topbar>` is nested in `main`/`section`/`article`/`aside`/`nav`. Kept as a decision record; only add if we adopt a deliberate defensive-robustness policy.

## One popover instance per trigger — the alternative that was weighed and not taken (recorded 2026-09-08)

- [ ] **[P3] ds-table's two popovers each serve many triggers from ONE instance, and the switch depends on an event order nothing enforces.** The column filter (`#columnFilterPopover`, `table.component.html:457`) and the row-actions menu (`#rowMenuPopover`, `:553`) are each declared once and re-anchored per click; clipped cells use `dsTooltipWhenClipped` instead. Clicking a second trigger while the first panel is open works only because the CDK's outside-pointer listener dismisses the open overlay before the button's own click handler runs, then `toggle` re-opens on the new trigger — measured on the filters (Venue → Status). Nothing asserts that order; the comment on `PopoverComponent.toggle` (`popover.component.ts:113-117`) records the dependency, which is not a guarantee, and still lists clipped-cell text among its users.
  **The alternative, weighed against eight others when the lost-first-click defect was fixed:** declare a `ds-popover` inside each filterable header / each actionable row and reach them with `viewChildren`, so no instance is shared and the ordering stops mattering. It also removes `filterColumn` and `menuRow` as stored state — the trigger's own popover knows what it belongs to.
  **Why it was not taken then:** it is N instances instead of one, a refactor of a core component, and it would leave the table's popovers diverging from `rowMenuPopover`'s config-level gating pattern that the fix had just aligned the filter to. The shared instance is measured working, so the change buys structure rather than behaviour. **Revisit if** a third shared-instance popover appears in the table, or if the dismiss-before-click order ever breaks under a CDK upgrade — the symptom would be a second trigger closing the panel instead of moving it.

## Focus indicators — what the two-wave review left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Asks**, **Decisions**, **Parked**.*

- [ ] **[P3] Zone COLOUR and `data-focus` SHAPE cannot both reach one role, and the reason is a
  language rule.** A `var()` inside a custom property is substituted where that property is
  DECLARED, not where it is read. Every role and every alias is declared on `:root`, so its value
  is frozen with `:root`'s inputs and a `ds-color` zone deeper in the tree can never reach inside
  it. Measured three times, 2026-09-05, each attempt failing differently:
  1. Zone re-declares the roles → colour follows the zone, but the zone now out-ranks
     `data-focus` by proximity, so `edge` and `ring` silently revert to the halo inside every zone.
     The SHAPE is lost.
  2. `--focus-field` composed off `var(--accent)` → shape is safe, but the substitution happens on
     `:root` where `--accent` is still the brand, so the colour stops following the zone entirely.
  3. Role points at `--accent-focus-field` → same trap one level further out; the alias is also
     declared on `:root`.
  So the two are mutually exclusive at this indirection, and today's split is the honest one:
  color-picker, modal-confirm, multi-select and otp-input read the ALIAS and adapt to a zone;
  everything else reads the ROLE and answers the switch. Neither spelling is a bug.
  What would actually solve it: the zone re-emitting the shape recipes as well as the colour, which
  is the per-scope composite `_semantic.scss` deliberately avoided by pre-composing
  `--focus-ring-<family>` / `--focus-field-<family>`; or a `@property`-registered colour the recipes
  read, which IS substituted per element. Both are real work, not a token edit.

## Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)

*This section also has items under **Bugs**.*

- [ ] **[P3] The resize handle still eats a finger swipe on a HYBRID device, which the touch fix does not reach.** `table.component.scss` hides the handle under `@media (hover: none) and (pointer: coarse)`, which is the right test for a phone — but a touch laptop reports `hover: hover` and `pointer: fine` because its PRIMARY input is the mouse, so the query is false, the handle renders, and its `touch-action: none` still takes the horizontal swipe that scrolls the table. The 8px strip is dead there for exactly the same reason it was dead on a phone. Not a regression: before 2026-09-02 it behaved this way on every device. The options are not equivalent — `(any-pointer: coarse)` catches hybrids but would also strip the handle from a mouse user who merely HAS a touchscreen, which is worse; dropping `touch-action: none` and calling `preventDefault` only once a drag has actually started keeps the handle usable by mouse AND returns the swipe, but needs the pointer-event sequence reworked and measured on a real hybrid, not emulated. Nobody has reported it; recorded so the narrow query is a known choice rather than an oversight.

## Claude Design upload — what the freeze left open (recorded 2026-09-04)

*This section also has items under **Bugs**, **Asks**, **Decisions**, **Parked**.*

- [ ] **[P3] Where a check mark is drawn, and which ones are the shared one.** Kept here because the
      answer is not derivable from one file — the marks live in three partials and two of the ten
      sites are deliberately different.

      | Where | Draws with | Shared mark | Animated |
      | --- | --- | --- | --- |
      | `ds-checkbox` | `.check::after`, `check-box.box` | yes | yes |
      | `ds-multi-select` — option, select-all, group | `.tick` | yes | yes |
      | `ds-autocomplete` — multi | `.tick` | yes | yes |
      | `ds-autocomplete` — single | `.option-check` | yes | yes |
      | `ds-select` | `.option-check` | yes | yes |
      | `ds-table` — row selection | `.check`, `check-box.box` | yes | yes |
      | `ds-table` - columns panel | `check-box.box` | yes | yes |
      | `ds-chart-legend` | `.legend-check`, `check-box.box` | yes | yes |
      | `ds-stepper` — completed step | `ds-icon name="check"` | **no, on purpose** | no |
      | `description-item` — copied | `ds-icon name="check"` | **no, on purpose** | no |

      The last two are confirmations of an ACTION, not marks of a selection: a stepper's completed
      step and a "copied to clipboard" flash are not checkboxes, and giving them a checkbox's mark
      and overshoot would say they can be unticked. `_check-mark.scss` owns the tick and the
      indeterminate bar; `_check-box.scss` owns the box around them; the motion is four tokens,
      written up in `docs/check-mark-motion.md`.

- [ ] **[P3] The upload tree tracks `src/lib`, and lags it between a library commit and the next CI
  run.** Any change to a component's template or SCSS moves what a card renders, so each one needs
  `build-upload` → `snapshot-cards` → the height check before the tree matches the library again.
  CI does it: `build-design-sync.sh` installs chromium, measures heights, freezes cards, gates with
  `check-frozen.mjs` against `live-cards.txt` and commits the regenerated tree. Until that run, the
  committed tree is stale after every library commit.

## Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)

*This section also has items under **Asks**, **Parked**.*

- [ ] **[P3] Six things the bundle fixtures do NOT establish, recorded 2026-09-02 rather than left for
  the next reader to rediscover.** Full text in `packaging-chunking-audit.md` — "What the fixtures do
  NOT establish". None overturns a conclusion; together they bound what the numbers may be used for.
  No probe records which library build it ran against, and `src/lib` changed five times inside the
  0.11.1 window; no probe exercises the `exports` map (all resolve through tsconfig `paths`);
  "initial" is computed by grepping `main.js` only, so a chunk imported by another eager chunk is
  missed; gzip is taken over the concatenation rather than per file; recorded gzip does not reproduce
  exactly and no gzip version is recorded; and "0 bytes of CSS" is a control that cannot fail. **The
  graph numbers are no longer in this class** — `tools/entry-point-graph.mjs` computes them on demand.

## Tooling

*This section also has items under **Asks**, **Decisions**, **Parked**.*

- [ ] **[P3] The chart palette separates by hue and barely at all by lightness, and nothing measures the dark theme (recorded 2026-09-21, Stas: record only).** Three findings, each with the command that produced it.
  **1. Lightness is flat.** Seven of the eight categorical slots sit between OKLab L 0.625 and 0.673 - a spread of 0.048 - and the closest two are 0.002 apart. Only slot 8 breaks the band at 0.394. A chart screenshotted into a black-and-white document loses every series distinction, and the same flatness is why simulated colour blindness collapses six pairs: it removes hue, and there is no lightness left underneath. Fixing it means moving colours, so it is a repaint.
  **2. The gate only ever sees the light palette.** `tools/check-chart-palette-separation.mjs` reads `_tokens-charts.scss`; `src/lib/themes/dark/_theme.scss` overrides `--chart-categorical-8` alone, so the dark theme's effective palette is seven inherited slots plus one. Checked by hand on 2026-09-21 and it passes (`node tools/check-chart-palette-separation.mjs --hexes '#e75740,#11a793,#5a83e2,#a173de,#e25a9e,#2ca565,#d85ad8,#8b93a7'`), but nothing holds it there - and in the dark theme all eight slots land in L 0.625-0.673, because slot 8 flips to 0.663.
  **3. Slot order is right and unguarded.** The worst pair among the first 2 slots is 29.0, the first 3 is 18.4, the first 4 is 10.2 - so the charts that use two to four series get the widest gaps, which is the correct arrangement. No gate enforces it, so a future reorder can quietly hand the common case the narrow pairs.
  A fourth thing, not a defect: the dark theme's own comment reasons in protanopia deltas ("dE 12 from the orchid"), although colour-vision support is not a requirement of this system.

- [ ] **[P3] Three `ds-table` paths have never been driven by automation, and five component groups have never been clicked through.** The paths: dragging a column by its handle to reorder, drag-resizing a column, and CSV export — each is pointer-sequence or file-download work that every sweep so far has read statically or skipped. The groups whose demos no automated pass has ever exercised: `actions`, `navigation`, `feedback-status`, `overlays`, `page-structure`. Recorded so the coverage is a known hole rather than an assumption: the focus and accessible-name sweeps DID load all thirteen group pages, so what is missing is interaction, not rendering.

## mm-broker read as a record — what our releases did to one consumer (2026-08-07, updated 08-11)

**Consumer state update, 2026-08-11 — this section's premise has expired.** mm-broker is on **0.9.1**
now (one branch, two bumps: 0.7.1 → 0.8.0 → 0.9.1, with `main` merged in three times along the way),
and pile one is closed on their side: the button retint targets the reflected `data-variant` /
`data-color` on the host, and the `ds-menu-divider { padding: 0 }` override went with the 0.8.0 bump.
Three things worth knowing back here, because they say something about how these releases land:

- **All four 0.9.0 subclass collisions in their `ds-table` fork were members this library grew BECAUSE
  they asked** — the clipped-header tooltip, the export status line, the sort/row-range live region and
  keyboard column resize. So three of the four were resolved by DELETING their implementation, not by
  adding `override`: `statusMessage` as a computed folding loading + export + sort + range replaced a
  signal plus two effects, and `onHeaderEnter` reads the same `.th-label` their fork renders. That is
  the intended outcome of a consumer ask, and it only worked because the collision list in `0.9.0.json`
  was corrected — the first version of that manifest named no collisions at all.
- **Three of the 21 DELETE-LIST entries applied to them, and those three removed the last two places
  in their whole tree that reached into DS internals** (`--ds-badge-white-space` for the badge in a
  narrow table cell, and the card filling a stretched host, which retired
  `::ng-deep .card { height: 100% }`). Both were asks filed from here in the first place. The
  delete-list-in-the-manifest change is doing its job.
- **`sortMode` defaulting to `'client'` in 0.8.0 and to `'server'` in 0.9.0 cost them nothing**, because
  the 0.8.0 migration made all 34 of their tables declare the mode explicitly. Worth remembering as the
  argument for that migration note's insistence on being explicit rather than relying on the default.

Still open on their side, recorded so nobody here counts it as a DS gap: retiring the fork is now a
pure refactor (34 call sites, `sortValue` per money/date column, the ai-stats funnel onto
`dsHeaderFilter`, and the `hideable`/`bordered` default flips), and they deferred `[dividers]="false"`
because 40 of their files carry `<ds-modal>` and it moves spacing app-wide.

The original 08-07 reading follows, as written. Three consumer apps were then on **0.7.1**, so anything
0.8.0 fixed showed up as debt they had not bumped past: `platform-admin/_ds-overrides.scss` (232 lines),
`broker-portal/_ds-overrides.scss` (116) and `employee-portal/_ds-compat.scss` (92).
Read the way the mm-ecm audit read that consumer's sheet — as the record of what the
DS made them write. `_ds-compat.scss` is out of scope: it aliases their PREVIOUS
local vocabulary (`--s-*`, `--fs-*`, `--brand*`) onto DS names, which is their
migration debt, not a DS gap.

**Pile one — the hook already exists and they never migrated to it (no DS work).**
Both portals reach into the button's INTERNAL class to retint variants —
`ds-button .button.v-tonal { --ds-button-bg-color: … }`, plus a nine-term `:not()`
chain to isolate the primary. `button.component.ts:59-60` reflects
`[attr.data-variant]` and `[attr.data-color]` on the HOST precisely so nobody needs
that, and the comment there spells out the intended form. ~40 lines across the two
apps. Also `ds-menu-divider { padding: 0 }` — `--ds-menu-divider-spacing` exists and
already defaults to 0; their own `TODO(ds-bump)` says so.

**Pile two — genuine gaps, verified against `dev` today.** _(BOTH are now CLOSED and archived: the region padding, Option A on 08-07 and Option B — `[dividers]` — on 08-10; the status treatment on 08-12, as `status: DsStatus` with the tinted header. See the batch record above and `done.md`.)_

---

## Board history — the 08-10 actualization, kept for the release-gate reasoning

> Superseded as a BOARD by the 08-21 one above. Kept because the reasoning is still the rule: a
> release cut sequences everything breaking behind it, and every breaking change added before the cut
> makes the one migration a consumer must swallow larger.

**22 open — 8 P2 and 14 P3 — but the count flatters the board.** **Twelve are parked**: ten P3s waiting on a first consumer ask (splitter, CascadeSelect, lightbox, CDK Menu, `ds-select` native multi, stepper formatting, row-expansion deltas, primary-CTA, MED, inspect mode) and two kept deliberately as decision records not to be "simplified" (`role="banner"`, the duplicated `compact` condition). **A P2 — shared picker internals — is open against its own recommendation**, which is not to build it until a fourth list picker appears.

**So the live board is six decisions and one piece of work.** _(0.9.0 was CUT on 2026-08-10 — the P1 that everything queued behind is done, and the release chain ran clean: publish to npmjs, docs deployed.)_ The decisions: **Angular 22**, whose peer range we currently exclude and which should be settled before the next cut · **packaging A/C/D** · **the breaking batch**, decided as one story · **the four identical consumer overrides**, which are evidence about our defaults · **verdicts B1–B5** plus a colour space, for the interlocked token trio · **the LOOK** for `dirty` / `pending` / `disabledReasons`. The work: the `ds-modal` status widening (breaking, so it rides the batch) — width-based overflow shipped as an opt-in on 2026-08-11, leaving only its default flip, which is already a member of the batch. _(Composition rules closed 2026-08-10: all three rule gaps written and rendered at `Practice → Composition rules` from the same file the package ships.)_

**Cleared 2026-08-06, after the agent-portal audit + Misha's review:** all four P2 items from the audit (table head padding — which also turned up `density="compact"` defeating every padding hook — the table pager inputs, the four autocomplete search gaps, the autocomplete panel radius), plus `ds-search` on the field-height contract. Two docs-site defects Misha found are fixed as well: `/changelog` served from a one-year `immutable` cache on a stable-name file, and sidebar anchors needing a second click — `onItem` scrolled, then the `routerLink`'s path change made `ds-app-layout` reset the scroll and undo it; the links now carry `dsSamePage`. (My first diagnosis blamed a lazy-load race and was WRONG: measurement showed the sections are always mounted by then, and the live site reproduced the real cause instead — first click 0px, second 15145px.) `sortMode`/`filterMode` now default to `'server'` (Stas 2026-08-06, breaking, migration written).

**Consistency sweep the same day, unasked-for but adjacent:** one `dropdownOverlay()` replaced six byte-identical overlay configs, and six more controls joined the field-height contract — there are now no raw `--hit-cozy` heights left in the library.

**RELEASE GATE, recorded 2026-08-07 — read before adding anything breaking.** `dev` carries **8 actionable migrations** on top of 0.8.0 (three from the auth-layout rename, ds-search height, the removed --search-h, the sortMode/filterMode default, number-stepper lg, and the ds-tabs urlParam pass). On this repo policy that is **0.9.0**, and it is sitting uncut. mm-broker is still on **0.7.1** and the 08-07 audit found they had not adopted hooks from releases they already have — so every further breaking change added here makes the one migration they must swallow larger and adoption less likely. **Cut 0.9.0 with what it has; hold the next breaking batch for the release after.** That single decision sequences most of the board: the modal status widening (error: boolean -> DsStatus) and the four candidate DEFAULT changes below both want the same later major, and so does packaging option D, since it changes how every consumer imports. Additive work is not gated by any of it, and a fair amount has shipped under that reading since — the `ds-stat` value slot, the modal padding tokens, `[dividers]`, the modal title badge and subtitle, breadcrumbs `maxItems`, `maxVisibleChips`, and the `design-system.md`/`components.md` split.

**A consumer is now waiting on the cut, which is new (2026-08-10, from mm-broker).** "Start converting" cannot start on **0.7.1**: verified on their own stack, `ds-select` and `ds-date-picker` bind under `[formField]` and compile, but **`ds-input` does not** — three template type errors per input, `number | undefined` against `number | null` on `min`/`max`/`maxLength`, which is exactly what `fc1714d5` fixes. `ds-input` is in nearly all twenty of their forms, so the migration is gated on a release carrying that commit, not on anything they can do. This does not argue for cutting *early* or for a backport — only that the cut now unblocks work rather than merely tidying `dev`, which is a different weight than it had on 08-07.

_Closed 2026-08-07 from a consumer report: `ds-autocomplete` had no chip cap, so a multi-select trigger grew a line per selection. `maxVisibleChips` ported from `ds-multi-select` under the same name. Checked the rest of the library — only those two components render a chip list, so nothing else needed it; the pinkmoon prototype the reporter half-remembered is the filter-bar "+N more", which is already `ds-filter-bar`._

---
