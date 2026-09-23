# DS — improvements backlog

Five buckets, and the bucket is the first sort key: **Bugs** is something already wrong in a
surface a consumer reads, **Asks** has a person behind it, **Decisions** is waiting on a verdict
rather than on hands, **Parked** is deliberately not now, and **Records** exists so a constraint
is not tidied away. `[Pn]` sorts inside a bucket. A `[~]` item is half-done and says what is left.

## The index

Generated — `node tools/todo-index.mjs` rewrites it from the items, and `--check` fails when it
is stale. It was hand-kept until 2026-09-10 and drifted every time: 44 lines against 66 items,
and two archived items reading as open for three days. Closing an item now means deleting the
item and nothing else.

<!-- todo-index:start -->

**117 open — 1 P1, 34 P2, 82 P3**. Counted by `node tools/todo-index.mjs` from the items themselves, never incremented from the last figure — three summaries in this file had drifted apart before it existed.

### P1 — 1

- **Framework & forms**
  - Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking changes lands exactly there

### P2 — 34

- **Focus indicators — what the two-wave review left open (recorded 2026-09-04)**
  - Nothing catches a shell that rings on `:focus-within` when it means the keyboard
  - Transitions are missing or wrong in places, and nothing says where (Stas, 2026-09-04)
  - `_focus.scss`'s top-level CSS is copied into 33 component style strings
  - Warning and success fields show a mismatched halo
  - Zone COLOUR and `data-focus` SHAPE cannot both reach one role, and the reason is a …
- **Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)**
  - The warning status pair fails WCAG AA for normal text — MEASURED 2026-08-27 in a real browser, 4.42:1 against the 4.5:1 threshold
- **Claude Design upload — what the freeze left open (recorded 2026-09-04)**
  - `.design-sync/conventions.md` is a generator INPUT, and nothing stops a reflow desyncing it
  - The elements demo has not been opened in a real browser since the rebuilds
  - `ds-toast-region`'s dev-warning strip is unverified
  - `ds-waterfall-chart` is `ds-cascade-chart` (Stas, 2026-09-23)
- **What actually running the 0.13.4 migration cost (recorded 2026-09-23, from the mm-ecm consumer)**
  - The mass spell-out renames old names that are PREFIXES of the new ones, and the pitfall does not mention it
  - Adopting `banner.announce` app-wide silently arms every banner written afterwards, and the variant is a usable discriminator
- **Three more things the 0.13.4 migration cost a consumer (recorded 2026-09-23, from the mm-ecm consumer)**
  - `--ds-line-chart-plot-height` changes what it does and no manifest item says so
  - The spell-out wave was keyed on suffixes, so three abbreviations survive it - and one
- **Two chart names that collide (recorded 2026-09-21, from the mm-ecm consumer)**
  - `ds-bar` is a prefix of `ds-bar-chart`, and the token surfaces overlap the same way
- **Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)**
  - Build-time `define` flag: a consumer CAN strip library code from `angular.json` — measured
  - The boundary guard cannot be flipped to `'error'` as it shipped — five defects found by …
  - DOCS for A3: `@defer` needs the deep specifier — the one exception to «no consumer
  - `ds-button`'s field-message line costs 11.0 KB gzip — 35% of the button, ABLATION DONE
- **Agent-facing docs — the rules an agent needs to prototype a page, and an md layout it can navigate**
  - An md ARCHITECTURE for the whole design system — cross-linked like a graph, not a pile of files (Stas, 2026-09-01, re-scoped 2026-09-02). NEXT UP, and the first step is RESEARCH, not code
- **The field system — the two controls outside it, and the five with no box to paint**
  - `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in, or say they are not fields (Stas asked 2026-08-20)
  - Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24)
  - `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]])
  - Theme recipe vs hand-tuned picks — alignment decision
  - Shared picker internals — DECIDED 2026-09-02 (Stas): BUILD IT
  - The 20 typography CLASSES still read `.t-*`, where the tokens behind them now spell it out
  - The button's colour-family slots are named `--c-*`, which is not an acceptable name
- **Tooling**
  - Publishing to npm stops working in January 2027 and the replacement is not chosen
  - Nothing catches a stale `presentations/ds.css`, and two gates read it as the truth
  - Publishing to Claude Design cannot run from Bitbucket, and Stas wants the CI route looked at again (recorded 2026-09-02)
  - `fix:all` reformats HTML that eslint then fights, and it is `fix:all` alone — `lint:all` is green
- **Localization — every user-visible string is a hardcoded literal (recorded 2026-08-27, from the ITB Workspace picker report)**
  - Every user-visible string in the library is a hardcoded English literal — VALIDATED 2026-08-27 against 0.11.0; Stas: defer the whole thing, no code
- **The chart family read as an architecture (audited 2026-09-22)**
  - The chassis is declared nine times and shared once - about 450 lines of it
  - The template state head and the figcaption rule are copied verbatim, nine times each

### P3 — 82

- **What v0.13.3 added and the docs site never shows (measured 2026-09-22)**
  - Fifteen new inputs have no demo and no prose on the docs site
  - Forty-nine new tokens have a row in the reference and an empty `notes`
- **Focus indicators — what the two-wave review left open (recorded 2026-09-04)**
  - A whole-page keyboard walk is not measurable with the tools here, and the failed
  - No indicator has been measured for SIZE or contrast — the 2026-09-10 sweep answered 2.4.7 only
  - `--ds-multi-select-option-bg-color-active` is documented and dead
  - `--ds-time-picker-focus-shadow` is read by the portaled panel and forwarded by nobody
  - Thirteen ds-docs forced-state pins misrepresent their component
  - `ds-tag` marked `interactive` is mouse-only
- **Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)**
  - Prose-shaped `old` values in 0.11.x remain (hygiene, not breakage)
  - The resize handle still eats a finger swipe on a HYBRID device, which the touch fix does not reach
  - A `done.md` heading's own numbers do not reconcile, and the true breakdown is not recoverable from the record
- **Reported by Stas from the docs site, 2026-09-05**
  - The shimmer's viewport anchoring breaks inside a transformed ancestor
- **Claude Design upload — what the freeze left open (recorded 2026-09-04)**
  - Where a check mark is drawn, and which ones are the shared one
  - The upload tree tracks `src/lib`, and only a machine with Chrome can bring it back into
  - Three obsolete paths on the project can only be deleted by its owner
  - Which of the 8 live chapters can also be frozen
  - `templates` and `startingPoints` in `_ds_manifest.json` are in the schema and empty
  - `.thumbnail` — the project's cover image — has no source that regenerates it
- **Three more things the 0.13.4 migration cost a consumer (recorded 2026-09-23, from the mm-ecm consumer)**
  - `donut-chart-renamed-to-pie-chart` declares `surface: ["template","typescript"]`, and …
  - The 0.13.4 CHANGELOG names the segmented tokens by a spelling that never shipped
- **Two 0.13.4 items point `old` at the name the release gives them (recorded 2026-09-23, from the mm-ecm consumer)**
  - `pie-chart-thickness-is-now-inner-radius` and `pie-chart-centre-content-needs-a-hole` scope `old` to `ds-pie-chart`, which does not exist at the boundary they describe
- **An indeterminate bar that survives a short track (recorded 2026-09-22, from the mm-ecm consumer)**
  - An indeterminate `ds-bar` is never empty, or 86.7% is enough - one verdict left
- **Two chart names that collide (recorded 2026-09-21, from the mm-ecm consumer)**
  - Extract what bar and column SHARE; their contracts stay different (Stas, 2026-09-22)
- **A journey canvas the mm-ecm prototype could not use (recorded 2026-09-16)**
  - Journey / flow diagram - no component draws a branching node-and-edge canvas
- **Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)**
  - A2 - the remaining directives, after A1 prices the seam
  - B1 - `DS_CONFIG.prototype: true` is BEHAVIOUR only. For bytes, use a build-time flag
  - Make the PORTALED overlay stylesheets opt-in — ~1.6 KB gzip, and that is the whole prize
  - Re-run `attw` with the tool actually installed, or drop the claim
  - Six things the bundle fixtures do NOT establish, recorded 2026-09-02 rather than left for …
  - A curated `prototype` entry point, once A3 exists
  - A bundle-size gate in CI
- **Component feature gaps**
  - `ds-select` cannot offer "create «what I typed»", and the reason is that it has no place to type (recorded 2026-09-09, Stas)
  - Portaled CSS as opt-in — PARKED 2026-09-04 by Stas
  - Split «design system» from «UI kit» as two packages (Mikhail, 2026-08-30)
  - `DS_CONFIG` prototype mode — `prototype: true` (Mikhail's original framing, endorsed by Stas 2026-09-01: «ds config тоже можно. как я и говорю prototype: true»)
  - A token named in prose is not checked against the tokens that exist, and the same fact lives in two copies
  - Three edges left open on `ds-table` row expansion and the resize handle, each a judgement call rather than a defect
  - `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber
  - Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog with the deck attached (not built, not closed)
- **DS-docs**
  - Fourteen focusable elements in ds-docs still have no accessible name, on two components that always could
  - ds-docs renders a space before punctuation after any inline `<code>` (found 2026-09-01)
  - Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below)
- **The hex readout rolls its glyphs like a mechanical board (recorded 2026-09-02, Stas)**
  - Dragging the picker retypes the hex value instantly; each glyph should ROLL to its new
  - Does a dev warning name an error banner no screen reader will read?
  - Does the picker list height become a public token, or stay behind `panelClass`?
- **The field system — the two controls outside it, and the five with no box to paint**
  - CDK Menu adoption (option B) — parked
- **Tooling**
  - The chart palette separates by hue and barely at all by lightness, and nothing measures the dark theme (recorded 2026-09-21, Stas: record only)
  - Three `ds-table` paths have never been driven by automation, and five component groups have never been clicked through
  - `tools/todo-index.mjs --check` is not in `lint:all`, so the index can still go stale between runs
  - `templates` and `startingPoints` in the Claude Design manifest are unexplored, and so is what feeds the pane's "Usage notes for Claude" (recorded 2026-09-03)
  - Four components had no block of their own in ds-docs (recorded 2026-09-03, two fixed)
  - `schematics/tsconfig.json` still asks for `moduleResolution: "node"`, which TypeScript 6 removes (recorded 2026-08-31)
  - Drop the brand and domain EXAMPLES from the published docs, not just their names (Stas, 2026-08-31)
  - Re-wrap `CHANGELOG.md` to ~100 columns (Stas, 2026-08-31: "запиши пока в туду … щас не будем")
  - Does a release note owe the reader a WHY, or only a what-and-what-to-do? (Stas, 2026-08-28, left open on purpose during the public-surface sweep.)
  - ds-docs still writes BEM MODIFIERS as `--suffix`, and a state should be its own class (Stas, 2026-08-26 — the `__` half is done and archived)
  - Eight manifest-format practices the audit marked *Adopt*, and nobody has ratified any of them (filed 2026-08-27 out of deck `migration-manifest-audit`)
- **Framework & forms**
  - Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wiring
- **ds-auth-layout — residue from the 0.8.0/0.9.0 audit (recorded 2026-08-11, from the ai-sdlc-prototype side)**
  - Three deferred DEFAULT changes for the batch after 0.9.0
- **ds-icon does not read the icon size scale (recorded 2026-08-24, from the state-glyph work)**
  - `--icon-xs/sm/md/lg` exist (12/14/16/20) and `ds-icon` cannot be sized by them
- **Missing components (from gap analysis)**
  - Image / lightbox
  - Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed)
  - CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed)
- **Missing tokens / foundations (from gap analysis)**
  - Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog
  - MED cluster — ASKED 2026-08-05, Stas: keep in the backlog
- **Virtualising a long picker list (recorded 2026-08-31, §9 P5, Stas: record only)**
  - Five thousand options render five thousand rows
- **The chart family read as an architecture (audited 2026-09-22)**
  - Four charts keep their own roving-tabindex state block, and the shared module owns only
  - Three charts hand-roll a legend and three compose their own accessible sentence
  - Six places reimplement something a shared module already does
  - Five constants carry two or three spellings each
  - Four exports on the package surface have no consumer in `src/`
  - `'none'` and `'grouped'` are the same value on `ds-column-chart`
  - Two inputs decide one thing on `ds-funnel-chart`, and two vocabularies name one idea
  - `tooltipAnchor="pointer"` is inert unless `tooltip="axis"`, and nothing says so
  - `ds-pie-chart` declares `staggerMs` and documents that it does nothing
- **Thirteen inputs the chart family declares component by component (measured 2026-09-22)**
  - Only the RESOLUTION of the shared chart inputs is shared, not their declaration
- **`changelog-lint` cannot tell "checked and clean" from "did not check" (recorded 2026-09-01, §9 G6, Stas: park)**
  - The gate's own floor does not catch the failure it was written for …
- **ds-app-layout — the one knowingly duplicated decision**
  - `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing my own `118a539`)
- **A11y — decision record (deferred, NOT a bug)**
  - topbar → `role="banner"`
- **One popover instance per trigger — the alternative that was weighed and not taken (recorded 2026-09-08)**
  - ds-table's three popovers each serve many triggers from ONE instance, and the switch depends on an event order nothing enforces
- **Docs nav chapters — the two limits the derivation ships with (recorded 2026-09-08)**
  - A chapter list reaches only sections whose headings are `h3.block-title`
  - The active chapter is not scrolled into the rail's own viewport

<!-- todo-index:end -->

## What is actionable today (recut 2026-09-12)

**The board is waiting on verdicts, not on hands.** Seven decks are open against it and five have a
twin here, so one answer closes two lines. Nothing in *Decisions* is blocked on effort.

**The one P1 is the only item where somebody cannot use the library at all.** The peers declare
`^21.2.0`, so an app on Angular 22 needs `--legacy-peer-deps` to install this package. It is DECIDED
as not-now and kept so the decision is not re-litigated; the probe behind it is in the item, along
with the price — TypeScript 6.0 is mandatory and the 22 CLI wants Node ≥ 24.15.0.

**No consumer Ask is open.** The last one — `TableRowAction`'s per-row label and divider — closed on
2026-09-12 when both refused halves shipped. What remains under *Asks* is our own work and Stas's
own requests, and those hang off deck verdicts.

**The three token items are ONE story and must not be taken separately.** The single-source colour
engine is the spec; "theme recipe vs hand-tuned picks" is a question INSIDE that spec, by its own
wording; `.ds-interactive` sits on top of whatever the engine decides. Opening any one alone decides
the other two by accident.

**Where the release risk is.** It is not in `unreleased.json` but in the manifests behind it:
mm-broker was last recorded on 0.9.1 and will swallow every release since in one pass, so those are
what has to be complete.

**Two habits that keep catching real defects, worth reading before opening anything.** A number
measured in ONE theme carried into the other unchecked — three times, all wrong. And a capability
that shipped with zero adoption twice traced to one missing field in a contract: when adoption is
zero, read the consumer's hand-rolled version rather than re-reading our own API.

# Bugs — something shipped misbehaves

Highest: each one is wrong in code — or in a surface — a consumer already reads.

## What v0.13.3 added and the docs site never shows (measured 2026-09-22)

Every new component landed everywhere - five charts plus `g[dsSeriesAnnotation]` have a section, a
`components.md` entry and a `docs/agent` file. The gap is below the component line, and the site's
generated API table carries the NAMES, so this is about a reader meeting an input with no example
rather than never meeting it at all.

- [ ] **[P3] Fifteen new inputs have no demo and no prose on the docs site.** Seven are not
  mentioned anywhere outside the generated table: `ds-button[align]`, `ds-chart[axisLabel]`,
  `ds-chart[cursorPin]`, `g[dsLineSeries][highlighted]`, `ds-pagination[size]`,
  `ds-pagination[layout]`, `ds-segmented[joined]`. Eight more are demonstrated on a PRESET but not
  on the mark or container that also takes them: `ds-chart[secondaryAxisLabel]`, `[maxSecondary]`,
  and `g[dsLineSeries]`'s `pinOnClick`, `dimOthers`, `patterns`, `stacked`, `curve`, `tooltipAnchor`.
  The composable path is the one a consumer reaches for after the preset stops fitting, so its
  inputs are exactly the ones that need an example.

- [ ] **[P3] Forty-nine new tokens have a row in the reference and an empty `notes`.** The whole
  `--ds-chart-heat-1..8-color` family, `--ds-chart-annotation-*` (5), `--ds-chart-positive-color` /
  `-negative-color`, `--ds-chart-legend-swatch-size`, `--ds-bar-chart-target-*` (4),
  `--ds-heatmap-chart-*` (8), `--ds-pie-chart-*` (8), `--ds-scatter-chart-*` (8),
  `--ds-waterfall-chart-*` (2), `--ds-line-chart-annotation-font-weight`,
  `--ds-option-font-weight`, `--ds-table-head-height`. `token-descriptions.json` is hand-written,
  so a name and a value reach the table and the sentence saying what to set it FOR does not.

Constraints and decisions that read as removable and are not.

## Focus indicators — what the two-wave review left open (recorded 2026-09-04)

- [ ] **[P3] A whole-page keyboard walk is not measurable with the tools here, and the failed
  attempt is worth not repeating.** Tried 2026-09-05 to assert an indicator on all 262 focusables of
  one docs page by focusing each in turn. Void: `element.focus()` inherits keyboard modality from the
  last REAL input, and the first call spends it — from the second element on, `:focus-visible` reads
  false for everything and the walk reports almost nothing indicated whether the CSS is right or
  wrong. Same shape as the reduced-motion trap.
  What would work: read the AUTHORED cascade instead of the focused state — for each focusable, find
  the `:focus-visible` rules that match it with the pseudo stripped, and ask whether any paints. That
  needs no focus at all, so no modality to lose. Until then the static gate is the coverage claim:
  88 files, three rejected failure classes, each controlled by planting a defect and watching it
  exit 1.


- [ ] **[P3] No indicator has been measured for SIZE or contrast — the 2026-09-10 sweep answered 2.4.7 only.** It established that all 1807 focusable elements draw something; it read no indicator's area and no contrast against the colours next to it, which is what WCAG 2.4.13 Focus Appearance (AAA) asks for: an area at least the size of a 2px perimeter of the component, at 3:1 against adjacent colours. One known candidate already: `ds-table`'s column-resize handle indicates focus by widening its `::after` hairline to 2px over roughly 24px of height, ~48px² against the ~184px² a 2px perimeter of its own 8×40px box would need. It passes 2.4.7 and would fail 2.4.13. Whether the library targets AAA here is a decision, not a defect — record the answer before measuring the rest.

- [ ] **[P2] Nothing catches a shell that rings on `:focus-within` when it means the keyboard.**
  Shipped and caught by Stas in a screenshot, 2026-09-05: the row ring on checkbox/radio/switch used
  `:focus-within`, which matches a POINTER focus too — and a checkbox, unlike a text input, is not
  granted `:focus-visible` on click, so clicking one left the ring behind until focus moved. Fixed
  with `:has(:focus-visible)`, but only on the four shells that were looked at.
  A gate is not obvious here, because `:focus-within` is CORRECT on a text-field shell — clicking
  into an input does grant `:focus-visible`, so the two selectors agree there. The rule a checker
  would need is "does the focusable inside this shell take `:focus-visible` from a pointer", which
  is about the element type, not the selector. Candidate: flag `:focus-within` in a component whose
  template has `type="checkbox"`, `type="radio"`, or a `button`, and leave text fields alone.


- [ ] **[P2] Transitions are missing or wrong in places, and nothing says where (Stas, 2026-09-04).**
  Asked for as a sweep: add the ones that are absent, correct the ones that are wrong. Two mechanical
  traps are already known and should shape the sweep rather than be rediscovered. First, `transition`
  is ONE property: whichever rule wins REPLACES the other's list, it never adds to it, and 46
  component stylesheets declare their own — this is why `focus.ring` uses an `animation` instead, and
  why `_press.scss` deliberately declares no transition at all. Second, a state that appears and
  disappears cannot transition unless its resting state exists in the DOM: an element rendered only
  while active has nothing to travel from and will pop in whatever is written. Verify with animations
  ON — see the reduced-motion item below for how a void run reads exactly like a working one.




- [ ] **[P2] `_focus.scss`'s top-level CSS is copied into 33 component style strings.** Measured
  2026-09-04 on `dist/ds/fesm2022/`: 33 of 75 built bundles each carry the blanket
  `:where(:focus-visible)` rule, all three `data-focus` blocks, the `@keyframes` and the
  forced-colors block — 4 to 6 copies of the blanket selector per bundle, none of which the
  component uses. 48 component stylesheets `@use` the partial for its mixins, and each is a
  separate Sass compilation, so each re-emits the module's top-level rules.
  `docs/agent/foundations/global-helper-classes.md` states the opposite in writing: "reaching for
  the mixin adds no CSS." That sentence is wrong either way and should go.
  **What is NOT measured, and must be before sizing this:** what the copies do in a running app.
  A library build ships styles UNSHIMMED (`.button{` appears with no `_ngcontent` attribute), so
  the consumer's AOT compiler is what scopes them — whether these copies end up scoped, global or
  deduped is decided there, not here. One runtime fact is now in hand, and it is not the whole
  answer: in ds-docs, which compiles the library FROM SOURCE, a component's copy comes back
  scoped — `animationName` on a focused ds-icon-button read
  `_ngcontent-ng-c838688186_ds-focus-ring-in`. So the shim does run and the copies are
  per-component rather than global. What that costs a consumer of the PUBLISHED package is still
  unmeasured. Do not quote a byte cost until it is measured in a real consumer build.
  Same shape wherever a partial mixes mixins with top-level rules — check `_press.scss`,
  `_dropdown-overlay.scss`, `_link.scss` and `_check-mark.scss` before choosing the fix. Splitting
  the partial (mixins in one file, emitted rules in another that only the global aggregate uses) is
  the likely answer.


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
and says nothing about the old one. Measured on three grounds: `presentations/focus-ring-gap.png`.


- [ ] **[P2] Warning and success fields show a mismatched halo.** `_field-state.scss` gives error a
  nested focus block and gives warning/success none, so a focused warning field is a yellow border
  with a blue halo. `--focus-field-warning` and `--focus-field-success` already exist in
  `themes/_semantic.scss` and are documented, and nothing in `src/` reads either — the tokens for the
  fix are already shipped. The mixin also takes no `$warning-focus-shadow` / `$success-focus-shadow`,
  so a component cannot pass its own.


- [ ] **[P2] Zone COLOUR and `data-focus` SHAPE cannot both reach one role, and the reason is a
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



- [ ] **[P3] `--ds-multi-select-option-bg-color-active` is documented and dead.** The alias is
  re-declared on `.dropdown-panel`, a DESCENDANT of the pane where `_dropdown-overlay.scss` has
  already substituted `--_option-bg-color-active`, so nothing reads it. The forwarding half works —
  the token is in `panelTokens`; only the declaration site is wrong, and ds-autocomplete shows the
  working shape (declare the alias on `:host`). Its description is also wrong: it says "while
  pressed", while the token drives hover and keyboard-active and pressed is hard-coded with no hook.

- [ ] **[P3] `--ds-time-picker-focus-shadow` is read by the portaled panel and forwarded by nobody.**
  `time-picker.component.scss` reads it on `.time-action` and it is absent from that component's
  `panelTokens`, so a host-scoped value never reaches the panel. The token reference states the
  opposite in writing. Same class as the six tokens fixed in `c013e08c`.



- [ ] **[P3] Thirteen ds-docs forced-state pins misrepresent their component.** Three change pixels
  today: the dropzone pin invents a text colour from a token nothing else reads (itself a published
  no-op), the button `pin-active` omits the press scale while `pin-hover` omits the hover shadow, and
  the table `pin-hover-th` invents a header background the component never paints — while the
  component's own header hover is a no-op, both sides being `--text-secondary`. Six pin comments
  claim "no `--_*` resolvers" where resolvers exist; they were true when written and the resolvers
  landed six days later. `ds-docs/src/styles/specimens/_day.scss` is a hand-written mirror of
  calendar-day with seven or more divergences.

- [ ] **[P3] `ds-tag` marked `interactive` is mouse-only.** It takes a click handler but no
  `tabindex`, no `role` and no keydown, so the affordance is unreachable by keyboard. Found while
  auditing its focus ring, which is moot until this is fixed.

## Manifest-shape defects the two-wave plugin review surfaced (2026-09-04)

- [ ] **[P3] Prose-shaped `old` values in 0.11.x remain (hygiene, not breakage):** comma-joined
  token lists (`0.11.4#toast-border-tokens-gain-color`), a full sentence as `old`
  (`0.11.1`), a ~95-word `restore` paragraph (`0.11.3` — README wants "a literal snippet or
  `null`"). The plugin now treats a non-token `old` as a non-locator, so these degrade safely;
  tidy them when those manifests are next touched, and consider a lint rule for `restore` length.

- [ ] **[P2] The warning status pair fails WCAG AA for normal text — MEASURED 2026-08-27 in a real browser, 4.42:1 against the 4.5:1 threshold.** `src/lib/styles/_status.scss:54` pairs `bg: var(--warning-subtitle)` with `text: var(--warning-text)`. Resolved in the default theme that is `#8A7400` on `#FFFBEA`, which computes to **4.42:1** by the WCAG relative-luminance formula — under AA for text below 18.66px/700. **It is the only status pair that fails:** error measures **5.92**, success **6.42** and primary **6.16** on their own subtitle backgrounds, so this is one colour out of step, not a palette-wide problem.
  **A darker step does not exist to reach for.** The yellow ramp ends at `--yellow-700` (`#8A7400`), which is what `--warning-text` already resolves to (`themes/_semantic.scss:177`). Closing this needs either a new `--yellow-800`, or a different foreground on the warning tint.
  **Reach, before anyone assumes it is one component:** `--warning-text` is read by `ds-alert`, `ds-banner` (two places), `ds-button`, `ds-checkbox` (two), `ds-field-message`, `ds-icon-button`, `ds-modal` (two), `ds-radio-group`, `ds-sidenav-footer` and `_field-state.scss`. Not every one of those puts it on `--warning-subtitle` — `_status.scss` is the pairing that was measured, and each other site needs its own measurement before it is called broken.
  **Not the same thing as the 3:1 note already in `_field-state.scss:29`**, which is about WCAG 1.4.11 non-text contrast for a border and is satisfied. This is 1.4.3, text.


- [ ] **[P3] The resize handle still eats a finger swipe on a HYBRID device, which the touch fix does not reach.** `table.component.scss` hides the handle under `@media (hover: none) and (pointer: coarse)`, which is the right test for a phone — but a touch laptop reports `hover: hover` and `pointer: fine` because its PRIMARY input is the mouse, so the query is false, the handle renders, and its `touch-action: none` still takes the horizontal swipe that scrolls the table. The 8px strip is dead there for exactly the same reason it was dead on a phone. Not a regression: before 2026-09-02 it behaved this way on every device. The options are not equivalent — `(any-pointer: coarse)` catches hybrids but would also strip the handle from a mouse user who merely HAS a touchscreen, which is worse; dropping `touch-action: none` and calling `preventDefault` only once a drag has actually started keeps the handle usable by mouse AND returns the swipe, but needs the pointer-event sequence reworked and measured on a real hybrid, not emulated. Nobody has reported it; recorded so the narrow query is a known choice rather than an oversight.

- [ ] **[P3] A `done.md` heading's own numbers do not reconcile, and the true breakdown is not recoverable from the record.** *"The review round on the picker lane — 43 findings, 42 fixed"* says 42 fixed, while its body says three were rejected as overstated: 42 + 3 is 45 against 43 found. The deck it points at has all seven sections `closed` and its §11 lists exactly three rejected findings, so there is NO deferred finding hiding in the gap — the count is what is wrong, not the work. Left uncorrected deliberately: inventing the missing breakdown to make the arithmetic close would be the same error as the claim it produced (a subtraction reported as an observation — see the session's memory on derived numbers). Whoever has the review round's source list can fix the heading; until then the numbers should not be quoted.

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



## Four files style one portaled panel at equal specificity (recorded 2026-08-31, from the branch review)


## Claude Design upload — what the freeze left open (recorded 2026-09-04)

The cards are static HTML now: 283 of 410 frozen, 127 left live because their panel is the
documented thing or their chapter's demo only exists once opened. Everything below is NOT fixed.

**Verification debts — each is one command away, none is a known defect.**

- [ ] **[P2] `.design-sync/conventions.md` is a generator INPUT, and nothing stops a reflow desyncing it.**
      `config.json` names it `readmeHeader` and `build-cards.mjs` copies it VERBATIM into
      `.design-sync/upload/README.md`, which `build-design-sync.sh` byte-compares. A prettier run over
      it on 2026-09-05 reflowed the fenced `tsx` block — a semicolon after `</Card>` among it — and
      left source and committed copy 37 lines apart. The content is restored, but the exposure is
      open: the ignore entry that guarded it was an unapproved prettier-config edit and was reverted
      with it. Two ways out, both Stas's call: a gate in `tools/` that fails when the source and the
      copy differ (no config touched), or one `.prettierignore` line for this file. Do not add either
      without asking — see the memory entry on linter configs.

- [ ] **[P3] Where a check mark is drawn, and which ones are the shared one.** Kept here because the
      answer is not derivable from one file — the marks live in three partials and two of the eight
      sites are deliberately different.

      | Where | Draws with | Shared mark | Animated |
      | --- | --- | --- | --- |
      | `ds-checkbox` | `.check::after`, `check-box.box` | yes | yes |
      | `ds-multi-select` — option, select-all, group | `.tick` | yes | yes |
      | `ds-autocomplete` — multi | `.tick` | yes | yes |
      | `ds-autocomplete` — single | `.option-check` | yes | yes |
      | `ds-select` | `.option-check` | yes | yes |
      | `ds-table` — row selection | `.check`, `check-box.box` | yes | yes |
      | `ds-stepper` — completed step | `ds-icon name="check"` | **no, on purpose** | no |
      | `description-item` — copied | `ds-icon name="check"` | **no, on purpose** | no |

      The last two are confirmations of an ACTION, not marks of a selection: a stepper's completed
      step and a "copied to clipboard" flash are not checkboxes, and giving them a checkbox's mark
      and overshoot would say they can be unticked. `_check-mark.scss` owns the tick and the
      indeterminate bar; `_check-box.scss` owns the box around them; the motion is four tokens,
      written up in `docs/check-mark-motion.md`.

- [ ] **[P2] The elements demo has not been opened in a real browser since the rebuilds.** `COMMANDS.md`
  says to serve `.design-sync/elements/demo` over http and look at it in a real tab, because a
  background or headless one freezes transitions and reports stale layout. Every measurement this
  cycle was headless. Nothing suggests a problem — the 127 live cards render and their panels open —
  but the one check the runbook asks for has not been done.
- [ ] **[P2] `ds-toast-region`'s dev-warning strip is unverified.** It was the one `devWarn` caller
  without the `ngDevMode` guard and its message shipped as live code; the guard is now there, but
  the rebuilt bundle came out byte-identical, which points at a stale `.angular/cache` rather than
  at the guard. Re-check on a clean cache. `ds-stat` and `ds-split-button` both compile to
  `constructor(){}`, so the pattern itself is known to work.

**Standing conditions, not tasks.**

- [ ] **[P3] The upload tree tracks `src/lib`, and only a machine with Chrome can bring it back into
  line.** Any change to a component's template or SCSS moves what a card renders, so each one needs
  `build-upload` → `snapshot-cards` → the height check before the tree matches the library again.
  CI cannot do it: the image has no browser, which is why `cards.lock.json` and `check-frozen.mjs`
  exist. In a shared checkout this means the tree is briefly stale after every library commit.
- [ ] **[P3] Three obsolete paths on the project can only be deleted by its owner.** Listed in
  `.design-sync/obsolete.txt`, printed by every build with the instruction to paste:
  `components/actions/Button/Button - Refused, and why.html`,
  `components/forms-inputs/TimeColumns/Time Columns.html`, `_TO_BE_DELETED.md`. Blanked and
  unregistered from here; `delete_files` answers 403 for a non-owner by every route tested.

**Decisions waiting on Stas.**

- [ ] **[P3] Which of the 8 live chapters can also be frozen.** `live-chapters.txt` keeps toast, drawer,
  modal, popover, bottom-sheet, tree, loading-overlay and scrollbar live because their demo only
  exists once opened. Removing a line freezes that chapter's cards on the next run — 350 ms and
  2.1 MB per card become about 35 ms and no bundle. Stas asked to look at the list himself.
- [ ] **[P3] `templates` and `startingPoints` in `_ds_manifest.json` are in the schema and empty.** The
  pane is server-side and the CLI binary carries only the tool description, so what fills them
  cannot be determined from here. Nothing is known to be missing because of it.
- [ ] **[P3] `.thumbnail` — the project's cover image — has no source that regenerates it.** It lives at
  `assets/thumbnail.webp` and is copied into the tree; re-rendering it from a card is still open.

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

- [ ] **[P2] `ds-waterfall-chart` is `ds-cascade-chart` (Stas, 2026-09-23).** The English `waterfall`
  is the field's standard word - Excel, Power BI, Tableau, Highcharts and ECharts all use it, with
  `bridge` as the finance synonym - so this is a preference, not a correction, and it is his to make.
  **What moves:** the selector, `WaterfallChartComponent`, `WaterfallChartBar`, `WaterfallChartDrop`
  and the rest of the exported types, the entry point
  `@ids-group-ltd/ids-design-system/components/waterfall-chart`, the `g[dsWaterfallMarks]` mark, the
  `--ds-waterfall-chart-*` tokens, the internal `.waterfall-chart` class, the docs page and the
  catalogue leaf.
  **Migration:** a `selector-rename`, one `type-rename` per exported symbol, a `token-rename` for the
  prefix and a `class-rename` for the internal class - the shape `donut-chart` to `pie-chart` used in
  0.13.3, which is the worked example to copy. The old tag is an unknown element rather than an
  error: Angular renders nothing and logs nothing outside strict schema mode, so a missed one is a
  chart that silently vanished.

Each has somebody behind it. Nothing here is speculative work.

## What actually running the 0.13.4 migration cost (recorded 2026-09-23, from the mm-ecm consumer)

The upgrade itself went clean - 115 edits, green on the first build, two independent re-checks with
no defects. These are the two places where the manifest left the consumer to work something out
that the release could have said.

- [ ] **[P2] The mass spell-out renames old names that are PREFIXES of the new ones, and the pitfall does not mention it.**
  `token-pad-spelled-out-as-padding`, `token-weight-spelled-out-as-font-weight`,
  `token-dimensions-spelled-out` and `token-btn-spelled-out-as-button` all carry the same pitfall -
  *"An unknown custom property is not an error … the element draws at the default with nothing
  reported"* - which is the MISSED-rename hazard. The one that actually bites is the opposite:
  applying the rename as a substring replace corrupts names that are already correct.
  Every one of these was live in the consumer we migrated, with the at-risk neighbour present in
  the same stylesheet:

  | rule | what it corrupts | the neighbour, in this consumer |
  |---|---|---|
  | `-pad` -> `-padding` | `--ds-popover-paddingding` | `--ds-popover-padding`, `refresh-shell.scss:191` |
  | `-weight` -> `-font-weight` | `--ds-badge-font-font-weight` | `--ds-badge-font-weight`, `waves-preview.component.scss:92` |
  | `-h` -> `-height` | `--ds-button-heighteight` | `--ds-button-height`, `--ds-search-height`, `--ds-field-height` |
  | `-w` -> `-width` | same shape | `--ds-menu-min-width`, `--ds-tab-indicator-width` |

  There is also a ROUTING collision between two items in the same release: `--ds-segmented-btn-h`
  matches `token-btn-spelled-out-as-button`, which would yield `--ds-segmented-button-h`. The
  correct destination is `--ds-segmented-segment-height`, from `segmented-parts-are-segments`. A
  consumer applying the items in the order the manifest lists them lands on the wrong name, and
  because an unknown custom property is silent, nothing says so.
  We handled it by anchoring every replacement to the end of the token name and by running the
  specific items before the generic ones - but that is a technique a consumer has to invent.
  **Wanted:** on each spell-out item, one clause in `pitfall`: the old suffix is a substring of the
  new one, so match the END of the name, never a substring; and on `token-btn-spelled-out-as-button`
  a cross-reference saying `--ds-segmented-btn-*` is claimed by `segmented-parts-are-segments` and
  must be excluded. A `map` of exact old-to-new names on these items would remove the question
  entirely - every other rename kind in the manifests already gets one.

- [ ] **[P2] Adopting `banner.announce` app-wide silently arms every banner written afterwards, and the variant is a usable discriminator.**
  `banner-alert-announce-takes-a-config-default` says it well for the first pass: set the config,
  then bind `[announce]="false"` on the page furniture. We did exactly that - config in two apps,
  29 redundant opt-ins removed, 14 furniture banners given an explicit `false`, no banner's
  behaviour changed.
  Then we merged `main`, which carried a banner written days earlier against the OLD default:
  `<ds-banner variant="info" icon="lock">This program is archived …</ds-banner>`. Its author had no
  reason to write `[announce]="false"` - under the old default, unbound meant silent. Under the new
  config it announces on every route into an archived program. We caught it only because we
  re-counted banners after the merge and the total went 43 -> 44.
  That is the standing cost of the feature, and it lands on whoever writes the NEXT banner, not on
  whoever adopted the config.
  `docs/done.md` records the decision not to build a dev-mode warning, because it *"cannot tell a
  deliberate opt-out from an oversight"*. That reasoning was about an unannounced ERROR banner, and
  it holds there. The case here is the mirror image and does not have that problem: an `info` or
  `success` banner announcing **because an app-wide default was flipped** is almost never intended,
  and the variant is exactly the discriminator the other direction lacked.
  **Wanted:** a dev-mode warning when a banner with `variant="info"` or `"success"` resolves
  `announce` to true from the CONFIG rather than from its own binding - it fires only for the
  combination that is nearly always an oversight, and never for a deliberate `[announce]="true"`.
  Failing that, one line in the item's `note`: adopting the config inverts the default for every
  banner added later, so a team taking it on should expect to mark furniture as it is written.

## Three more things the 0.13.4 migration cost a consumer (recorded 2026-09-23, from the mm-ecm consumer)

Found walking mm-ecm from 0.13.3 to 0.13.4. None of the three breaks a build, which is the point.

- [ ] **[P2] `--ds-line-chart-plot-height` changes what it does and no manifest item says so.**
  `grep -c plot-height migrations/0.13.4.json` is **0**; the string appears once in the 0.13.4
  CHANGELOG, in Changed, saying the token "has been declared since the chart shipped and reached
  only the loading skeleton … the token parsed and changed nothing", and now drives the plot.
  Verified at both tags: v0.13.3 `line-chart.component.scss:36` declares it and `:48` spends it on
  `chart-frame.message-box` alone, the comment at `:50` stating the canvas is sized by viewBox
  ratio; v0.13.4 `line-chart.component.ts:584,618` reads it to size the plot coordinate space.
  **Why only a manifest item could catch it:** the NAME is identical at both tags, so there is
  nothing to grep and no build signal. A consumer who pinned it to shape the skeleton silently
  resizes every plot. mm-ecm never pinned it and is unaffected, which is luck rather than safety.
  **Wanted:** a `behavior` item whose `verify` is the positive assertion that the plot reads it,
  since `old`/`new` cannot express a change that keeps its name.

- [ ] **[P3] `donut-chart-renamed-to-pie-chart` declares `surface: ["template","typescript"]`, and
  a consumer's stylesheet needs the rename too.** A selector written against the ELEMENT rather than
  an internal class is ordinary consumer CSS: mm-ecm had `.chart-block ds-donut-chart { … }`. It is
  not covered by `pie-chart-internal-class-renamed`, which is about `.donut-chart`, and a finder
  obeying the declared surface skips it. The rule then matches nothing and the chart quietly loses
  its sizing.
  **Wanted:** `"style"` added to that item's `surface`, and the same check on any future selector
  rename - an element name is reachable from CSS, so a selector rename is always partly a style one.

- [ ] **[P3] The 0.13.4 CHANGELOG names the segmented tokens by a spelling that never shipped.**
  The prose says "The three `--ds-segmented-button-*` are `--ds-segmented-segment-*`". At v0.13.3
  the three are `--ds-segmented-btn-border`, `--ds-segmented-btn-h` and `--ds-segmented-btn-pad-x`
  (`git grep -ho -- '--ds-segmented-btn-[a-z-]*' v0.13.3 -- src/lib`). The manifest item carries the
  right `old`, so only the prose is wrong - which makes it the more dangerous half: a reader
  searching their stylesheet for what the CHANGELOG told them finds nothing and concludes they are
  unaffected.
  **Wanted:** the prose corrected to `--ds-segmented-btn-*`.

- [ ] **[P2] The spell-out wave was keyed on suffixes, so three abbreviations survive it - and one
  of them sits beside a token the wave DID rename.** `ds-input` at v0.13.4 declares
  `--ds-input-label-font-size` and `--ds-input-label-fw` on the same element: `-fs` was spelled out,
  `-fw` was not, because the rule is `--ds-*-weight` to `--ds-*-font-weight` and a token spelled
  `-fw` never matches it. Measured across the tags - 46 names ended in an abbreviation at v0.13.3,
  three still do at v0.13.4:

  ```
  git grep -hoE -- "--ds-[a-z0-9-]+" v0.13.4 -- src/lib | sort -u \
    | grep -E -- "-(fw|lh|fs|ff|ls|maxw|maxh|minw|pad|btn|tracking|transform|w|h)$"
      --ds-input-label-fw   --ds-tag-fw   --ds-tag-lh
  ```

  **What it costs a consumer:** a stylesheet ends up carrying two conventions in adjacent lines.
  mm-ecm's `login.page.scss` now reads `--ds-input-label-font-size` on one line and
  `--ds-input-label-fw` on the next, and neither is wrong. The release's own promise - "118 `--ds-*`
  tokens take their CSS property's name" - is what makes the survivors read as an oversight rather
  than a decision.
  **Wanted:** either `-fw` to `-font-weight` and `-lh` to `-line-height` in a later release with
  their own migration items, or a line saying these three are deliberate. A gate is cheap here and
  the grep above is it: no `--ds-*` name may end in an abbreviation.

## Two 0.13.4 items point `old` at the name the release gives them (recorded 2026-09-23, from the mm-ecm consumer)

Found preparing that consumer's 0.13.4 migration. Your own truth check already flags it, which is
how it surfaced - this is the manifest half, not a tooling gap.

- [ ] **[P3] `pie-chart-thickness-is-now-inner-radius` and `pie-chart-centre-content-needs-a-hole` scope `old` to `ds-pie-chart`, which does not exist at the boundary they describe.**
  The two values are `old: "ds-pie-chart[thickness]"` and `old: "ds-pie-chart[centerValue]"`. At
  `v0.13.3` the element is `ds-donut-chart`; `ds-pie-chart` is what 0.13.4 renames it TO, in the
  same release, by the item two rows above. So a consumer sitting on 0.13.3 and searching for the
  `old` value finds nothing, while `<ds-donut-chart thickness="0.32">` is exactly what they have in
  front of them.
  `node tools/check-manifest-truth.mjs 0.13.4` reports it without prompting: *"2 name(s) no tag
  could resolve"*, and closes `65 of 67 old/new value(s) were read against their boundary and hold`
  - the tolerance for a scope element renamed in the same release does not save these two, because
  neither tag holds the pair (`ds-pie-chart` is absent at `v0.13.3`, `thickness` is absent at
  `v0.13.4`).
  The `migrations/AUTHORING.md` rule added the same day - *"`old` holds our identifiers, never a
  placeholder or a sentence"* - is satisfied by the letter here: both ARE identifiers. What the two
  items miss is the boundary half: the identifier has to be the one that exists at the tag the
  consumer is migrating FROM.
  **Wanted:** `old: "ds-donut-chart[thickness]"` and `old: "ds-donut-chart[centerValue]"`, and one
  clause in `AUTHORING.md` saying a scoped `old` names the element as it is spelled at the PREVIOUS
  tag, even when the same release renames it. The `detect` arrays on both items already carry the
  unscoped shapes (`thickness=`, `centerValue`), so the practical damage is limited to whoever reads
  `old` first - which is what a human does.


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
  **Not built: a dev-mode warning on an unannounced error banner.** It cannot tell a deliberate
  opt-out from an oversight, and the config key removes the reason for the sweep that would have
  wanted it.

- [x] **[P2] A `surface: "style"` item never names the partial that carries it.** The rule is in
  `migrations/AUTHORING.md` with its own checklist line: an item whose change ships in one of our
  partials names that partial in `appliesWhen`, and its `verify` greps the BUILT CSS rather than
  the consumer's source. 0.8.0's `focus-partial-needs-use-line` and 0.10.0's
  `universal-focus-ring-base-rule` carry it now, and `README.md` says that `@use 'styles/ds'`
  resolves against every include path in order, so a consumer file of the same name earlier on the
  path wins and reads identically at the import site.
  **Not done: retrofitting the other 127 style items.** A token rename lands in a stylesheet the
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

## Two chart names that collide (recorded 2026-09-21, from the mm-ecm consumer)

Both found while planning that consumer's move to 0.13.3. Neither blocks it; both cost a reader.

- [ ] **[P2] `ds-bar` is a prefix of `ds-bar-chart`, and the token surfaces overlap the same way.**
  0.13.3 merged `ds-progress` and `ds-meter` into `ds-bar`, and the CHANGELOG entry announcing it
  has to carry its own warning: "`ds-bar-chart` is a different component and is NOT renamed. `ds-bar`
  is a prefix of it, so a find-and-replace without a word boundary will corrupt every chart in the
  app." The tokens repeat the trap — three pairs differ only by the word `chart`:
  `--ds-bar-track-color` against `--ds-bar-chart-track-color`, `--ds-bar-target-color` against
  `--ds-bar-chart-target-color`, `--ds-bar-target-width` against `--ds-bar-chart-target-width`.
  A missed token rename reports nothing and the bar simply returns to its default look, which is the
  failure this collision makes likely rather than merely possible.
  **The word boundary that warning sends people to does not work.** `\bds-bar\b` still matches
  inside `ds-bar-chart`: a hyphen is not a `\w` character, so `\b` fires between the `r` and the `-`.
  Observed 2026-09-23 on the mm-ecm consumer, where an agent migrating to 0.13.3 reached for exactly
  that guard, believed it was scoped and it was not; the tree was unaffected only because it has no
  `<ds-bar>` yet. A guard that holds needs the longer name excluded explicitly - `ds-bar(?!-chart)`,
  or matching `<ds-bar[\s/>]`. Worth putting in the item's `pitfall` either way, since it turns
  "be careful" into a reason the careful version fails.
  **Wanted:** a name that cannot prefix a chart's, and that does not re-pin the component to
  progress or to meter - the merge dropped both words deliberately, and `semantics` is what carries
  that meaning now. Measured 2026-09-22: of 21 prefix pairs among 99 selectors this is the only one
  where the two components are unrelated; the other 20 are parent and child of one family.
  Candidates drawn in deck `11-ds-bar-name-collision`, which recommends `ds-gauge`.

- [ ] **[P3] Extract what bar and column SHARE; their contracts stay different (Stas, 2026-09-22).**
  **The two are different charts and are not merged.** Neither grows the other's data model: a bar
  row is one label and one value with an optional `segments` breakdown, a column series is N marks
  across categories with `stack` deciding how they share a band
  (`column-chart.component.ts:161`, `'none' | 'grouped' | 'stacked' | 'normalized'`). The phase-1
  spec calling them twins is what made the divergence read as an accident; it is not one.
  **What the verdict asks for is the layer underneath.** Whatever both implement is extracted into a
  shared module, reused by both, and given a way to be EXTENDED where one of them needs to differ -
  so a chart adapts rather than forks. Whatever is unique to one stays unique to that one.
  **Two divergences are visible to a consumer and are documented rather than removed:** stacking
  arrives in the datum on one side and in an input on the other, and the same flat array is one
  series in the bar, where every row takes `--ds-chart-series-default-color`, against N categories
  in the column, where each mark takes its own palette slot (`bar-chart.component.ts:368` against
  `column-chart.component.ts:314`). Both drawn in deck `bar-column-contracts`.

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

Three stay written down: one with an open action, and two answered by API that already existed,
because both are the kind of ask that comes back.

- [x] **[P3] `ds-menu-item` - every hook the ask wanted already shipped, and the consumer confirmed it.** Verified against `a1ff1f49`, the commit that recorded the ask: `--ds-menu-item-pad-x` / `-pad-y` carried the padding, `--ds-menu-item-label-weight` the weight, and a quiet row had both an input and a hook of its own - `quiet` renders `.quiet`, coloured by `--ds-menu-item-quiet-label-color`; `error` does the same for a destructive row. The two token names were the abbreviations `b3e0cace` spelled out, which is the cause the other asks had too: unguessable from the CSS property.

  The consumer's rule, `mm-ecm-platform-kb` `prototype/projects/agent-portal/src/styles.scss`, written by Mikhail Shyshla on 2026-07-31 in `35ed3969`:

  ```scss
  .ds-overlay-pane ds-menu {
    .menu-item.menu-item { padding: var(--rp-sp-11) var(--rp-sp-18); font-weight: var(--rp-fw-400); }
    ds-menu-item.is-quiet .menu-item.menu-item { color: var(--rp-mute); }
  }
  ```

  `is-quiet` is their own class, not our `quiet` input, and the colour goes on the inner element rather than through the token that exists for that row.

  **The per-item override works, measured 2026-09-22.** A page reproducing the resolver shape - `ds-menu-item { --_label: var(--ds-menu-item-label-color, …) }`, the token set on an ancestor `ds-menu` and again on `ds-menu-item.is-quiet` - resolves `navy` on an ordinary item and `darkorange` on the quiet one. A declaration on the element beats one inherited into it, so the premise that the token "cannot be set per item" does not hold.

  **Closed 2026-09-22, confirmed on their build.** They applied `--ds-menu-item-pad-x` / `-pad-y`, `--ds-menu-item-label-weight` and a per-item `--ds-menu-item-label-color`, and both doubled-class rules are gone. The label colour resolves on the ITEM host, so a declaration on one item beats the menu's. They keep their own `is-quiet` class rather than the `quiet` input, which the token route serves either way.

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

## Getting bytes out of a consumer's bundle — the sequenced plan (agreed 2026-09-01, Stas)

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
Conversely A3 does not shrink the table by a byte.

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



- [ ] **[P3] A2 - the remaining directives, after A1 prices the seam.** `DsTableResizable`,
  `DsTableReorderable` (with the picker and the `@angular/cdk/drag-drop` import),
  `DsTableColumnFilters`, `DsTablePersistLayout`. Three questions the ablation left open: does
  `truncate` stay in the base table, and do row actions and inline cell editing come out too? Both are
  equally advanced and were left IN, which is why 18.9 KB is a floor and not a ceiling.

- [ ] **[P3] B1 - `DS_CONFIG.prototype: true` is BEHAVIOUR only. For bytes, use a build-time flag —
  measured 2026-09-01.** `DS_CONFIG` cannot remove a byte (runtime DI value, nothing to fold), so its job
  is library-wide UI simplification on the components that always ship: calmer defaults, fewer states,
  simpler affordances on fields, buttons, sidenav. `resolveWithConfig` already exists, so that part is
  small. **But the earlier claim that NO flag can remove bytes was too broad** — see the new item below.

- [ ] **[P2] Build-time `define` flag: a consumer CAN strip library code from `angular.json` — measured.**
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
  unexplored — it needs two published builds and only makes sense after A3.

  **Division of labour, now that the tools overlap:** a whole unused component -> entry points (A3); a
  separable feature of a component you DO use -> an opt-in directive (A1/A2, seam overhead a fixed
  923 B); a branch inside code you must ship with no seam to hang it on -> `define`. Do not do both for
  the same feature.




- [ ] **[P3] Make the PORTALED overlay stylesheets opt-in — ~1.6 KB gzip, and that is the whole prize.**
  **CORRECTED 2026-09-01: an earlier version of this item claimed ~1.8 KB could move into component SCSS.
  It cannot.** Checked what the globally-forwarded partials actually define: `link` (533 B gz),
  `page-grid` (312 B) and `layout-utils` (184 B) are **public utility classes** — part of the API, they
  stay; `scrollbar` (297 B) styles `html` and `::-webkit-scrollbar`, document level, impossible to scope;
  `skeleton-shimmer` (207 B) is deliberately ONE `:root` animation so every skeleton stays in lock-step;
  `surface-motion` (192 B) is `@keyframes`, and emulated encapsulation renames keyframes, which would
  break cross-component reference. Only `icon-base` could move, and it is 92 bytes. **The real lever is
  `dropdown-overlay` (1 043 B) + `overlay-motion` (458 B) + `toast-overlay` (91 B) = ~1.6 KB gzip, made
  opt-in** (`@use 'styles/dropdown-overlay'`), which pays only a consumer with no pickers, toasts or
  modals. Also verified: no double-shipping — `press` (20 stylesheets), `text-clip` (10) and `chip-row`
  (2) are mixins components `@use` and are correctly NOT forwarded by `ds.scss`.


- [ ] **[P2] The boundary guard cannot be flipped to `'error'` as it shipped — five defects found by
  the two-wave review, 2026-09-02 (`docs/packaging-record-review-2026-09-02.md`). All of them belong WITH A3, not
  before it.**
  Nothing here is urgent while the rule is `'off'` (`npm run lint` reports 0 from it, verified), and
  nothing here changes a shipped API. But every one fires on the day someone follows the instruction
  above, so the flip commit has to carry them.
  1. **The defaults are CYCLES, not the entry-point partition.** `DEFAULT_CO_LOCATED` holds the SCCs;
     the rule's semantics are entry-point membership. At `'error'` with the defaults it reports **31**
     imports that live inside one planned entry point, and "fixing" one means writing a
     self-referential entry-point import. `coLocated` must be supplied — and `eslint.config.mjs` and
     the flip instruction above must say so. **No correct configuration exists anywhere today**: the
     gitignored probe config is a 2026-09-01 snapshot and is also stale after A3-pre.
  2. **`publicSpecifier()` maps a GROUP to a slug, not to an entry point.** 99 of 308 messages name
     `@ids-group-ltd/ids-design-system/components-root`, a specifier that cannot exist. Worse, the
     suggestion is derived from the group, so **~204 of 277 are wrong even with the right
     configuration** — every message pointing into a merged entry names a member instead of the entry.
     The co-location sets need a name. Not destructive: `meta` declares no `fixable`, so nothing
     auto-applies — it is a misleading string during exactly the refactor it exists to guide.
  3. **`ImportExpression` is unchecked**, so a dynamic `await import('../x/y')` is invisible. Zero
     instances today. NOT for the `@defer` reason once written down here: `@defer` is template syntax
     lowered by the compiler and never appears in the `.ts` ESLint parses. The real risk is a human
     reaching for dynamic import during A3, which is when it is most likely.
  4. **The rule FAILS OPEN on any unresolvable specifier** — a typo, a `.json`, a future `.mts`, a
     path alias all report clean. A boundary guard whose failure mode is "pass" is defeatable by a
     typo. `TSImportType` and `TSImportEqualsDeclaration` are unhandled for the same reason.
  5. **An import escaping `src/lib` is silently allowed.** Once the root is a facade, a file in a
     secondary entry importing `src/public-api.ts` is exactly the cycle ng-packagr rejects, and this
     rule would not see it. None exist today.

  **Also, and separately from A3:** none of the four `ds/` eslint rules has a `RuleTester` suite, and
  every defect above is a two-line case. `node:test` is built in; the repo already ships selftests for
  `migration-lint`, `changelog-lint` and `deck-lint`, so only the ESLint rules are unguarded.

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

- [ ] **[P3] Six things the bundle fixtures do NOT establish, recorded 2026-09-02 rather than left for
  the next reader to rediscover.** Full text in `packaging-chunking-audit.md` — "What the fixtures do
  NOT establish". None overturns a conclusion; together they bound what the numbers may be used for.
  No probe records which library build it ran against, and `src/lib` changed five times inside the
  0.11.1 window; no probe exercises the `exports` map (all resolve through tsconfig `paths`);
  "initial" is computed by grepping `main.js` only, so a chunk imported by another eager chunk is
  missed; gzip is taken over the concatenation rather than per file; recorded gzip does not reproduce
  exactly and no gzip version is recorded; and "0 bytes of CSS" is a control that cannot fail. **The
  graph numbers are no longer in this class** — `tools/entry-point-graph.mjs` computes them on demand.

- [ ] **[P3] A curated `prototype` entry point, once A3 exists.** One extra entry re-exporting a light,
  opinionated set answers Mikhail's original basic/advanced ask at zero cost: no second package, no
  mirror, nothing duplicated, and `ds-table` stays one component. Propose it when A3 lands, not before.

- [ ] **[P3] A bundle-size gate in CI.** The ladder at `.claude/local/bundle-probe/` is already the
  measurement; running it as a check stops this regressing silently, which is how the current state
  arose. Also check whether `/design-system:auto-update-package` migrations can express a symbol moving
  between entry points — nothing to do while the root stays a facade, but needed before any entry
  point becomes the only path to a symbol.

- [ ] **[P2] DOCS for A3: `@defer` needs the deep specifier — the one exception to «no consumer
  changes an import».** Measured 2026-09-01: a `@defer` block whose component is imported from the root
  facade defers **nothing** — one `main.js`, no chunks, both deferred components in the initial bundle
  (153 764 B). Imported from deep specifiers: initial **123 467 B**, four files, only the eager component
  eagerly. Known Angular issue angular/angular#52554 — a component imported from a barrel gets no lazy
  chunk because the bundler treats the barrel as one module. The facade IS free for route-level laziness
  (`loadComponent` / `await import()` in a separate file), measured four times byte-identical. **Write
  this into the consumer docs before anyone hits it.**


- [ ] **[P2] `ds-button`'s field-message line costs 11.0 KB gzip — 35% of the button, ABLATION DONE
  2026-09-01.** `ButtonComponent extends DsMessageBase` and imports `FieldMessageComponent`,
  `resolveFieldMessage` and `trimmedText` so a button can render a hint/warning/error line under itself.
  Ablated on `probe/button-field-message` (commit `2c1dbdb7`), control
  re-measured on the same build:

  | | JS gzip | over bare Angular |
  | --- | --- | --- |
  | bare Angular app | 30 646 B | — |
  | `+ ds-divider` (entry cost) | 35 997 B | +5 351 B |
  | `+ ds-button` today | **62 733 B** | **+32 087 B** |
  | `+ ds-button` without field-message | **51 438 B** | **+20 792 B** |

  **11 295 B gzip**, paid by every consumer that renders one button, whether or not they ever bind
  `hint`, `warning` or `error`. **Entry points do not fix this** — even per-component entries keep
  `button -> field-message` as a static edge, so the 11 kB arrives with any button. Two ways out: drop
  the feature from `ds-button`, or move it behind an opt-in directive — **the same seam pattern as
  the table**, so it belongs in the A1/A2 lane, not A3. Design decision, not a defect.

**Not doing, and why.** basic/advanced as two packages: smaller prize than A1/A2, and it buys a second
table to keep in sync forever. `ids-charts`: a real candidate the day it needs a third-party renderer,
not before - a package split is justified by an EXTERNAL runtime dependency, never by component count.
DS-vs-UI-kit packages: parked until a consumer wants the tokens WITHOUT the components; today the
`exports` map already serves them.

**Scheduling constraint.** A1 and A2 refactor `table.component.{ts,html,scss}` - the same three files a
parallel lane has been changing all week (row expansion, resize-handle ARIA, comment pass). Either run
A0 first, which touches none of it, or wait for that lane to land.

## Agent-facing docs — the rules an agent needs to prototype a page, and an md layout it can navigate

- [ ] **[P2] An md ARCHITECTURE for the whole design system — cross-linked like a graph, not a pile of files (Stas, 2026-09-01, re-scoped 2026-09-02). NEXT UP, and the first step is RESEARCH, not code.**
  **What already shipped, so nobody re-solves it:** `components.md` was a 591-line, 60.2 KB monolith with six `##` sections, so there was no unit smaller than a sixth of the file to load. `tools/split-agent-catalogue.mjs` now generates `docs/agent/` from it — an index plus one leaf per component, 60 files, a 9.8 KB index and a ~1.6 KB leaf — and a `--check` gate fails the build when the leaves drift from the source. That closed the COST of the monolith for one file.
  **What it did not close, and this item is about:** the split is flat and one-directional. A leaf cannot say "this is the same field as that one", an area cannot point at the components it contains, and nothing links a component to the token roles it reads. `design-system.md` (316 lines / 16.6 KB) is still a separate monolith with no route into the leaves. An agent that lands on `ds-input` cannot walk from there to the field-message rules, the status vocabulary, or the sibling controls.
  **Ask:** design the whole md layout as a graph — a single entry point that routes, then area → component → field, with cross-links between leaves the way an Obsidian vault links notes, so an agent reaches one fact by following edges rather than by loading a file that might contain it.
  **The sequence Stas asked for, and it is not negotiable:** research the practice first (how other design systems and agent-facing docs do this, what actually works), then ask him 10-20 questions, then a written plan, possibly a deck — and only after his explicit go-ahead does anything get implemented. He parked it on 2026-09-01 until the Claude Design work was finished; that work is finished.
  **Points to settle when it is designed:** how the split is addressed (per component, per area, or per question); what stays in the root files as the always-loaded core; how a link is expressed so it survives both a generator and a human reader; how the index and the edges stay correct as components are added; and what the package ships versus what stays in-repo.
  **Precedent already in the repo:** `tools/extract-tokens.mjs`, `tools/extract-component-api.mjs` and `tools/split-agent-catalogue.mjs` all generate documentation from source at prebuild, each with a `--check` gate. Whatever architecture is chosen should be generated the same way wherever it can be, so it cannot drift.


## Component feature gaps

- [ ] **[P3] `ds-select` cannot offer "create «what I typed»", and the reason is that it has no place to type (recorded 2026-09-09, Stas).** `[dsCreateTemplate]` and `[dsChipTemplate]` exist in the library and `ds-select` reads neither — correctly, because both decorate features it does not have. Chips show MANY values and a single select holds one; create needs typed text and `ds-select`'s template contains **no `<input>` at all**. What looks like typing there is `createTypeAhead`, a keystroke buffer that jumps to the option whose label matches, so there is no query to turn into a new value.
  **So this is a feature request, not a missing template binding, and it arrives in that order:** first a panel filter field (the thing `ds-multi-select` already has as `.search-row`), then `allowCreate` plus a `created` output and the no-match branch — `ds-autocomplete` carries all three already and is the model to copy rather than re-derive. Only then does reading `[dsCreateTemplate]` mean anything.
  **The product question to settle first:** should a single select have a filter field at all? A short list does not need one and gains a control to tab through; a long one is unusable without it. `ds-autocomplete` already exists for "type to narrow, maybe create", so the honest answer may be to send consumers there instead of growing `ds-select` toward it. Settle that before writing code, or the field lands and then has to be argued about.


- [ ] **[P3] Portaled CSS as opt-in — PARKED 2026-09-04 by Stas.** 1 055 B of the 2 793 B global sheet is the only part that could move behind an opt-in: `dropdown-overlay`, `overlay-motion`, `toast-overlay`. It saves only a consumer with no picker, no toast and no modal, which is close to nobody, and the cost is one more import in everyone else's bootstrap. The measurement stands if the balance ever changes; the AG Grid route (CSS inside the component) stays rejected because Angular injects those as runtime tags and a strict CSP under SSR blocks them.

- [ ] **[P3] Split «design system» from «UI kit» as two packages (Mikhail, 2026-08-30).** His words: «Можете тогда вообще ui kit и дизайн систему на разные пакеты разнести?» — the UI kit being the whole component library, and the design system being the rules, tokens, themes and guides. **Partly true already:** tokens and themes ship as SCSS assets under `styles/*` and `themes/*` behind their own `exports` entries, and the rules/guides live in the deployed docs site rather than in the package. So the question to study is narrow: is there a real consumer who wants the tokens WITHOUT the components (a non-Angular app, a Figma/CSS-only pipeline, another framework), and does that consumer exist today? If yes, a tokens-only package is cheap and has no mirror-maintenance problem — unlike the basic/advanced table split, nothing is duplicated. If no, the current `exports` map already covers it. **Interacts with the entry-point work above:** a layered `core ← services ← components` partition and a tokens-only package are the same question asked twice, and should be designed together rather than separately.

- [ ] **[P3] `DS_CONFIG` prototype mode — `prototype: true` (Mikhail's original framing, endorsed by Stas 2026-09-01: «ds config тоже можно. как я и говорю prototype: true»).** One flag in the existing `DS_CONFIG` that puts the whole library in prototype mode instead of asking a consumer to pick a package. **The honest caveat, and it must be settled before this is built:** a runtime config flag CANNOT reduce the bundle — the code for the features it disables is still imported and still ships, so `prototype: true` buys behaviour, not bytes. Only the directive split above removes bytes. So decide what the flag is actually FOR: (a) turning off advanced affordances so a prototype's UI stays simple and demo-able — a real and useful thing, unrelated to size; (b) build-time dead-code elimination, which would need it to be a compile-time constant a bundler can fold, not a DI value. Do not ship (a) while implying it does (b). `DS_CONFIG` already resolves per-component defaults via `resolveWithConfig`, so (a) is a small build.



- [ ] **[P3] A token named in prose is not checked against the tokens that exist, and the same fact lives in two copies.** `--static-white` was removed at 0.5.1 and was still advertised in `src/lib/themes/README.md` AND in `ds-docs`' theming page months later; both are fixed, but nothing stops the next one. Two mechanisms would: (a) a gate that extracts every `--token` mentioned in prose (`*.md`, the ds-docs section templates) and fails on any that no longer resolves in `_base-palette.scss` / `_semantic.scss` / `_tokens.scss`, with an allowlist for text that is deliberately historical — `docs/done.md` and the migration manifests must keep naming what they removed; (b) pairing the two copies, since a repo doc and its ds-docs page carry the same facts and drifted independently twice in one day. Sequence (a) first: it is mechanical and catches the class, while (b) is a restructure. The manifests are already covered and are not part of (a): `check-manifest-truth` fails a `--ds-*` name in manifest prose that exists at neither boundary tag, and its `phantomTokens` plus `DELIBERATE_PHANTOMS` allowlist is the shape to copy for the `*.md` half.

- [ ] **[P3] Three edges left open on `ds-table` row expansion and the resize handle, each a judgement call rather than a defect.** (a) On a page with no rows the expand-all chevron still renders and its label reads "Expand all rows", while clicking it does nothing — the handler early-returns. This is an exact clone of what the select-all checkbox next to it does on an empty page, so it was left for symmetry; breaking the symmetry needs a disabled state on `.expand-btn`, which the shared icon-button chrome has no styling for. (b) Under `lazy` (no `pageSize`, `total` set) `expandAllLabel` omits " on this page" because it keys on `pageSize()`, while expand-all only reaches the rows that have arrived. Inside the already-declared-unsupported `virtualScroll` + `expandableRows` combination. (c) The expander column's `<th>` had no accessible name and now takes one from the expand-all button — which FLIPS between "Expand all rows" and "Collapse all rows", so in table-navigation mode every body cell in that column inherits a changing column name. The `select-col` `<th>` sets the precedent of naming itself from its control, but with a STABLE name. Fixing it means an `aria-label` on the `<th>` naming the column, which is a pattern the component does not use anywhere else.

- [ ] **[P3] `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber.** Today it's a raw `value: number` + `min`/`max`/`step` + spinner, no display formatting. PrimeNG InputNumber's value-add is a formatted numeric field: thousands grouping, fixed decimals, currency/percent, locale-aware, parsed back to a number on edit. Add opt-in `mode` (decimal/currency/percent) + `locale`/`currency`/`minFractionDigits`/`maxFractionDigits`/`useGrouping`; format on display/blur, parse on focus/input. Masking prior art in-house: [[reference-masked-input-dom-writeback]] (pinkmoon phone/w3w imperative `element.value` write-back). No active request — likely pulled by the financial-admin consumers (mm-broker admin, pinkmoon amounts/rates/%); gate on the first such form. **GATE HELD 2026-08-25 (Stas), asked explicitly.**

- [ ] **[P3] Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog with the deck attached (not built, not closed).** Deck `select-native-multi` — three variants live, comparison matrix and sources; it is the prepared answer if a consumer ever pulls on this. Native `<select multiple>` is not a cheaper spelling of the same control, it is a documented antipattern: multi-selection is reachable only through Ctrl/Cmd- or Shift-click with nothing in the control announcing it, an unmodified click **discards the entire prior selection**, non-adjacent options cannot be selected from the keyboard at all, and screen readers handle it worse than a single `<select>`. The consensus alternative is a checkbox list — which is exactly what `ds-multi-select` already is.
  **The soft version of the ask does not survive either:** the moment a hypothetical `ds-select multi` is made usable it has to open a checkbox list, i.e. it becomes `ds-multi-select`, and the only genuine difference left is chips-in-trigger vs an "N selected" summary. If a consumer ever wants the compact trigger, the honest answer is an input (`[triggerDisplay]="'summary'"`) on the existing component, not a second component and a fork in the docs. The one case where nativeness would really matter — a plain HTTP form POST with no JS — is solved by a hidden `<select multiple>` inside `ds-multi-select`, not by changing the UI.

- [ ] **[P3] `dsColumnSeries` cannot choose its value axis, so in a two-axis chart the column is pinned to the primary (recorded 2026-09-23, from the mm-ecm-platform microsite-analytics port).** `LineSeriesData` carries `axis?: ChartAxis` - "Which value axis the readings are measured against. Defaults to `'primary'`" - while `ColumnSeriesPoint` is `id? / label / value / color? / fill?` and `ColumnSeriesComponent` declares `data`, `tooltip`, `tooltipAnchor`, `valueFormat`, `offsets`, `seriesColor`, `seriesFill`, `seriesLabel`, `seriesKey`, `highlighted` and nothing else. Measured 2026-09-23 against 0.13.4's `types/…-components-chart.d.ts` and against `src/lib/components/chart/column-series.component.ts` on `dev` at `5251473d`; `grep -rnE "readonly axis[A-Za-z]* = input" src/lib/components/chart/` returns only `axisGutter`, `axisColor` and `axisLabel`, all three on `ChartComponent` itself. So only the line can pick a side.
  **What it cost the consumer:** a screen that read visits on the left axis and agent requests on the right could not be reproduced. Requests are the column, so they took the primary and visits moved to the secondary, and the two sides swapped against the screen being replaced. Both axes are labelled through `axisLabel` / `secondaryAxisLabel`, so nothing is ambiguous to a reader - but a port that was meant to preserve the reading could not.
  **The shape that fits:** `axis` belongs on the DIRECTIVE, not on `ColumnSeriesPoint`. A column series is a flat list of points under one `seriesLabel`, so a per-point axis would be meaningless; `LineSeriesData` is a per-series object, which is why its own `axis` sits in the data. `<svg:g dsColumnSeries [axis]="'secondary'">` defaulting to `'primary'` mirrors what the line already offers, and leaves every existing chart unchanged.
  **The workaround, for the record:** swap the mark types, visits as columns and requests as a line. That restores the sides at the price of changing what each series looks like, so it is a different trade rather than a fix.

### Found while porting the design-sync React bindings (2026-07-28, re-verified 2026-09-01)

Three defects the port surfaced by reading every component's template + SCSS against each other. All three still reproduce on `dev` at 0.11.1; line numbers below are that tree's.

## DS-docs

- [ ] **[P3] Fourteen focusable elements in ds-docs still have no accessible name, on two components that always could.** Nine `ds-select` instances — the ones carrying a `value` and no `placeholder`, because `placeholder` is a name source there and `value` is not — and five `ds-number-stepper` instances in the size and behaviour demos. Both components have taken an `ariaLabel` since long before this; the demos simply never set one, so this is ds-docs authoring and not a library gap. Left rather than auto-filled because neither sits in a `state-cell` with a caption to borrow, so each needs a written name. Measured on `/components/autocomplete`, where the count went 31 → 14 once checkbox, radio and switch got theirs.

- [ ] **[P3] ds-docs renders a space before punctuation after any inline `<code>` (found 2026-09-01).**
  The house lint rule `ds/template/element-content-newline` moves the content of an inline `<code>` onto
  its own line, so `</code>.` becomes a collapsed newline plus the period and the browser renders
  `--radius-pill-value .` — measured in the radius section's own lede, which predates this note, so it
  affects every section that puts punctuation after a code span. **Not a local defect:** fixing it in one
  section would fight the lint rule and make that section inconsistent with the other sixty. The fix is
  either a rule exemption for inline `<code>` or a CSS-level one; either way it is a single change for the
  whole site. Low priority — it is one space — but it is in every paragraph that names a token.


- [ ] **[P3] Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below).** A section-heading toggle that draws a visual "inspect" overlay on the live demos: colour-coded lines/boxes for paddings, gaps, sizes with values+units, plus WHICH token/class drives each value. Read computed styles + `getBoundingClientRect`; map values back to the `--space-*`/`--radius-*`/`--font-size-*` scales. **Rewritten 2026-07-24 → start as a scoped pilot:** spacing-only on ONE section (e.g. button), then generalize. Greenfield, docs-only, no product impact. _(Verified: nothing exists today.)_

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
  was asked for — "как в старых аналоговых счетчиках", a thing that slides.

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
      `preventDefault()` (`color-picker.component.ts:204`, `:256`), so pressing either moves focus to
      that surface by browser default;
    - arrow-key adjustment happens with focus already on those surfaces — all three
      `preventDefault()` calls in the component are on `keydown`, never on a pointer event;
    - a preset is a `<button>`, which takes focus itself;
    - the panel autofocuses nothing (no `focus()` call anywhere in the component), so opening it does
      not put the caret in the field;
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

# Decisions — waiting on Stas, not on work

- [ ] **[P3] Does a dev warning name an error banner no screen reader will read?** Drawn in deck
  `banner-announce-warning`, three options: stay silent, warn on every unannounced `error` or
  `warning` banner, or warn only while `DS_CONFIG.banner.announce` is unset so the noise ends the
  moment an app decides. It became answerable only when `announce` gained a third state: `null` is
  untouched, `false` is a deliberate opt-out, and before that the two were indistinguishable. One
  consumer's first pass over 43 banners missed ten.

- [ ] **[P3] Does the picker list height become a public token, or stay behind `panelClass`?** Drawn
  in deck `picker-list-height`. Two caps sit on one panel and the settable-looking one is not the
  one that governs the visible rows: `--ds-dropdown-panel-max-height` caps the box and is forwarded,
  `--picker-maxh` caps the list and is not. `panelClass` has expressed a per-picker list height
  since 0.13.1; a public token would add a second way to say it, and `--picker-maxh` resolves at
  `:root`, so forwarding it without the role guard would pin it inline on every open panel.

None of these is blocked on effort. Each is a verdict, and most carry a deck that renders the options.

## Decks awaiting a verdict (re-audited 2026-09-20)

**Fourteen** decks carry `ds-deck-status: open` — counted on disk, not from this list, which has been
short before. **The rank is the filename**: an open deck is `<rank>-<slug>.html`, ranked by what
answering it unblocks, so the folder listing IS the queue. Ranks are renumbered when the queue
changes and a stale one is never kept to preserve a link; `deck-lint` fails a duplicate rank, a gap
in 1..N, and an `implemented` deck still carrying one. **`presentations/13-decision-queue.html` carries every open question** — every open
deck's question with its options in that deck's own words, the recommendation starred, a link back
for the argument, and the two questions that have no deck. It duplicates no argument, so it cannot
contradict a deck; re-check it when a deck's OPTIONS change. **Never cite a deck by number from this
file** — the number moves; cite the filename.

| # | Deck | Asks | Twin on this board |
| --- | --- | --- | --- |
| 1 | `1-color-engine-derivation` | One source token per role, derived. | the colour-engine P2 |
| 2 | `2-color-engine-relative` | The prototype half of the same question. | as above |
| 3 | `3-interaction-formula` | State interactions by formula, calibrated against the drawn ramp. | the `.ds-interactive` P2 |
| 4 | `4-migration-manifest-audit` | Which of eight format practices marked *Adopt* are worth the tooling. | the manifest-practices P3 |
| 5 | `5-select-native-multi` | Whether `ds-select` native `multi` is worth building. | already *Parked* — "keep parked" closes both |
| 6 | `6-warning-text-colour` | Which colour goes on the warning tint. Four candidates, each rendered in itself. | the warning pair under *Bugs* |
| 7 | `7-chart-sparkline-preset` | A `variant="spark"` on the line chart against a separate `ds-sparkline`. | parked 2026-09-19, so it is decided-not-built |
| 8 | `8-waterfall-mode-or-component` | The waterfall's own tag against a `stack="waterfall"` mode on the column chart. | the waterfall entry point, already shipped standalone |
| 9 | `9-bar-column-contracts` | How far to converge the bar and the column: name the difference, converge the palette, or give the bar a series model. | the stacking-contract ask under *Two chart names that collide* |
| 10 | `10-ds-bar-name-collision` | What the merged progress+meter is called, given `ds-bar` is a prefix of `ds-bar-chart`. | the `ds-bar` rename ask on the same board |
| 11 | `11-banner-announce-warning` | Whether a dev warning names an error banner no screen reader will read. | the closed `banner.announce` ask, which left this open |
| 12 | `12-picker-list-height` | Whether the picker list height becomes a public token or stays behind `panelClass`. | the closed `--picker-maxh` ask, same shape |
| 13 | `13-decision-queue` | Every open question in one page - 36 across six groups, options drawn rather than named. | every open deck plus the whole `Decisions` bucket |

**Closed on 2026-09-12 and moved to `implemented/`:** `field-group-invalid-voice` (the group carries `error`, `hint` and a message row; every segment announces the error and points at that one message), `button-destination-api` (flat modifier inputs, a `UrlTree`-capable `routerLink`, and `aria-current` that stops claiming a page it is only inside of), `opt-in-seam` (all three questions answered —
directives shipped at −54%, the button's message row built and reverted on measurement, the portaled
CSS rejected at 1 kB for a consumer who does not exist), `sidebar-states` (variant E, and the code
carries it: the item fills with `--accent-subtitle`, the group never fills) and `stat-value-overflow`
(one line plus a tip on hover, three hooks over it). `6-rejected-with-numbers` left the queue the
same day as a `tool` — it asks nothing, so a rank on it claimed a verdict was owed.

**Closed on 2026-09-19 and moved to `implemented/`:** the chart lane in one pass - `chart-composition-model` (marks project into the container, one `<svg>` per chart), `chart-phase-2-marks` (the whole Phase 2 layer built), `chart-dual-axis` (a second axis rises only when a mark contributes values to it), `chart-axis-mode-names` (`yAxisMode` renamed), `chart-area-mode-or-component` (a mode on the line chart, not its own tag), `chart-rescale-on-hide` (the domain drops a hidden series) - plus `docs-chapter-nav`.

**Closed on 2026-09-21 and moved to `implemented/`:** `chart-palette-v2` - the two greens moved apart by one token (`--chart-categorical-6`, 152deg to 148deg), and `tools/check-chart-palette-separation.mjs` went into `lint:all` holding the 6 floor under normal vision. Colour-vision deficiency is reported by that gate and not enforced: Stas confirmed the system never took that commitment on, which is why the full repaint was declined.

**Nine of the fourteen have a twin on this board, so one answer closes two lines** — which is what
makes them the cheapest thing here. Rank 5 is the cheapest of all: "keep parked" is a complete
answer, and it has already been given — the deck stays only because closing it was declined.

**Every rank but 6 is written in Russian and shares `presentations/deck.css`**; only rank 6 carries
its own inline styles. `presentations/README.md` holds the authoring contract and the fifteen lint rules.

## The field system — the two controls outside it, and the five with no box to paint

- [ ] **[P2] `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in, or say they are not fields (Stas asked 2026-08-20).** Audited, and they are not "fields missing a feature" — they never had the wrapper. **`ds-number-stepper`** exposes `value`, `min`, `max`, `step`, `size`, `disabled`, `ariaLabel` and nothing else; **`ds-dropzone`** exposes `accept`, `multiple`, `files`, `disabled`, `single` plus two outputs. Neither has `label`, `hint`, `error`, a `ds-field-message`, `resolveFieldMessage`, or the `field-label` mixin — verified by grep, all zero. Every other one of the fourteen fields has all of it.
  **So this is a feature addition, not a unification**, and that is why it is a decision rather than work: both would gain `label`, `hint`, `error`, `errors`, `invalid`, `touched`, `reserveMessage` (now one `extends DsFieldBase`), a message row, and the label/required/optional block.
  **The case for doing it:** in a real form both want it. A numeric stepper needs a label and a validation error like any input; a dropzone needs a hint ("up to 5 MB, PDF only") and an error ("that file was rejected"). A consumer today has to hand-roll a label and an error line beside them, which is exactly the inconsistency this board exists to remove.
  **The case against:** neither has been asked for by a consumer, and `ds-number-stepper` may be intended as a bare control composed inside something else — though its own `ariaLabel` and `size` inputs suggest standalone use.
  **Cheap now that the base exists:** `extends DsFieldBase` plus a `resolveFieldMessage` call, a `ds-field-message` in the template, and the label block — the same shape all fourteen already share.
  **Cheaper again since 2026-08-25:** the base was split into `DsMessageBase` (the message half) and `DsFieldBase` (that plus `errors`/`invalid`/`touched`) so `ds-button` could take the message line, and `ds-button` is now the worked example of wiring the message half into a component that was never a field. Both of these hold a value, so both want the full `DsFieldBase` — but the pattern, the resolver call and the template shape are all demonstrated now rather than described.

- [ ] **[P2] Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24).** ROOT CAUSE (surfaced when a consumer scoped `--primary-h/s/l` on a checkbox and ONLY the focus halo moved): "primary" has TWO decoupled reps — (a) `--primary` + hand-picked ramp shades read by component FILLS; (b) `--primary-h/s/l` HSL channels feeding ONLY math-derived halos/ramp/gray-tint — with **no live link**, so a coherent scoped recolour needs BOTH the channels AND a `--primary` re-composition (the 3-/4-token footgun). **Re-verified true 2026-07-24** (`_semantic.scss:91-93` channels; `:111-112` hover/pressed already `color-mix`; halos `:209-229`; gray tint `_base-palette.scss:41`). **IDEA:** one colour token per role as the only source; shades via `color-mix()`, hue via `hsl(from var(--primary) h <S> <L>)` keeping each step's hand-tuned S/L (see [[feedback-handtuned-colors-beat-formulas]] — only the HUE is single-sourced); drop `--primary-h/s/l` as PUBLIC API. Scoped recolour becomes ONE declaration; **UNBLOCKS the `ds-color`/`--accent-*` indirection**. **OPEN for the spec:** (a) colour space (`oklch`/`oklab` perceptual vs `srgb`/`hsl` matches today) — verify each derived role visually; (b) pure-derived vs hand-pick per role; (c) relative-colour + `var()` edge cases in the 3 target engines; (d) dark-theme interplay. Prototype: deck `color-engine-relative`.

- [ ] **[P2] `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]]).** Replace per-component `--ds-*-bg-hover/-active` + scattered `color-mix()` with ONE contract: a `.ds-interactive` class + presets driven by `--state-step-*` tokens in a NEW `src/lib/styles/_interaction.scss` (**still absent — verified 2026-07-24**), with an override slot (`--interactive-*-set`). Then migrate interactive components off their local recipes. **NEXT — blocking user verdicts B1–B5** (live demo in deck `interaction-formula`): (B1) tint-pressed 28% vs 34%; (B2) pressed step for neutral surfaces (menu-item/table rows); (B3) danger menu-item hover — formula vs `--error-subtitle`; (B4) shape of the `--interactive-*-set` slot; (B5) pressed step for success/warning buttons. **Rewritten 2026-07-24:** the old "retire `_forced-states` duplication" clause is now MOOT — `_forced-states.scss` no longer exists (docs state-forcing is per-section `:host ::ng-deep .pin-*` reading each component's `--_*` resolvers). What survives is the broader "should presentational/state styling live in global partials (like `_link.scss`) with components as thin sugar" question. (Housekeeping DONE — re-grepped 2026-08-10, the stale `_forced-states` refs are gone from `README.md` and `table.component.scss`; nothing outside `.claude/` mentions it.)

- [ ] **[P2] Theme recipe vs hand-tuned picks — alignment decision.** Button/icon-button state derivation uses the theme's 88%/76% mix-to-black recipe (**verified `button.component.scss:34-38`, `_semantic.scss:111-112`, 2026-07-24**). If the single-source-colour calibration replaces `--primary-hover/-pressed` with hand-tuned values, the button defaults (color-mix off the resolved bg) diverge from the theme roles — decide then: components read role tokens again, or theme keeps the formula. **This is a concrete instance of the single-source item's open question (b); resolve it inside that spec, not separately.**

- [ ] **[P2] Shared picker internals — DECIDED 2026-09-02 (Stas): BUILD IT.** The survey below recommended against, and Stas overruled it: the extraction happens without waiting for a fourth list picker. Everything measured in 2026-08-05 still holds and is the scope, not an argument against it — read it as the cost estimate. What the survey established: it is THREE components, not six, and the duplicated surface is ~25 lines each.

  **SURVEYED 2026-08-05, and the premise was wrong: it is THREE components, not six, and the duplicated surface is ~25 lines each.** Measured: only `ds-select`, `ds-multi-select` and `ds-autocomplete` share the shape (an `activeIndex` signal + wrap-around arrow nav over a flat option list). `ds-date-picker` navigates a 2-D day grid, `ds-time-picker` has NO arrow handling at all (it delegates to `ds-time-columns`), and `ds-color-picker`’s arrows drive a continuous saturation/hue canvas — three different models that a shared list helper would not serve. **Type-ahead does not exist anywhere** (zero hits), so that part of the ask describes code that was never written. And the three that DO overlap differ where it matters: select carries groups + Home/End + `firstEnabledIndex()` skipping disabled, multi-select works over a filtered list with a select-all row, autocomplete counts a create/no-match slot into its modulo. **Recommendation: extract only the index cursor** — a ~30-line `createListCursor({ length, isEnabled })` returning `{ index, next, prev, first, last, reset }` — and NOT a picker base class. **Worth doing when a fourth list picker appears, not before:** 3 × 25 lines against a 30-line helper is a wash today, and the wrong shared abstraction here costs more than the duplication. **Update (0.11.1):** the three now share one panel implementation, one group shape (`DsOptionItem`) and five projection slots, and `docs/picker-contract.md` + `npm run picker-parity` keep that honest — so the remaining duplication is the index cursor alone, exactly as recommended. Still not extracted, still waiting on a fourth picker.
  **P3 → P2, 2026-09-02:** promoted by the decision above; the demotion below is kept so the reasoning that was overruled is still readable, not deleted.

  **P2 → P3, 2026-08-21 (SUPERSEDED):** demoted, and it should have been on the day it was surveyed: **the item's own conclusion is not to build it** — three components share ~25 lines each, against a ~30-line helper, so extracting now is a wash and the wrong shared abstraction costs more than the duplication. It is kept open only so the survey is not repeated, which makes it a parked record, not a P2. Revisit when a FOURTH list picker appears.

- [ ] **[P2] The 20 typography CLASSES still read `.t-*`, where the tokens behind them now spell it out.** `.t-h1` through `.t-h5`, `.t-display`, `.t-card-title`, `.t-caption`, `.t-overline`, `.t-l` / `-l-bold`, `.t-m` / `-m-bold`, `.t-s` / `-s-bold`, `.t-xs` / `-xs-bold`, `.t-mono` / `-mono-block` / `-mono-inline`. The 96 tokens they read became `--ds-typography-*` in `4d2ddd7d`; the classes were held back deliberately, so the two halves now disagree on how the word is spelled.

  Measured 2026-09-22: at least 3121 uses in this repo alone, counted as exact class names with a quote or a space on each side (`grep -rhoE "(^|[\"' ])(t-h1|t-h2|…)([\"' ]|$)" src ds-docs`), which undercounts two adjacent classes in one attribute. Consumer markup carries more, and unlike a token a class cannot fall back - a template left on `.t-h4` loses its type entirely rather than reading a default.

  **Stas: tokens first, classes recorded here (2026-09-22).** The question when it comes up is whether a markup vocabulary wants the same spelling rule as a token surface at all - Tailwind and every utility set in the field argue brevity IS the feature there.

- [ ] **[P2] The button's colour-family slots are named `--c-*`, which is not an acceptable name.**
  Seven of them — `--c-base`, `--c-on`, `--c-strong`, `--c-subtitle`, `--c-muted`, `--c-muted-strong`,
  `--c-outline-border` — declared on `.button` in `button.component.scss` and read by `button` and
  `icon-button`. Two things are wrong with the name and each on its own is enough: `c` is a
  one-letter abbreviation where the house rule is a spelled-out word, and these are INTERNAL slots
  that carry none of the `--_` marker this library uses to say so, so they read like a public hook
  a consumer may set. The `.c-*` colour classes that override them have the same defect.
  Rename to the spelled-out internal form (`--_family-base` / `-on` / `-strong` / …) and the classes
  with them. Not a public break — `components.md` names none of them and only those two components
  read them — but `0.10.1.json` mentions `--c-on` inside an `informational` line explaining a
  disabled-icon recipe, so that sentence needs the new name too. Check `.design-sync/` and the docs
  specimens as well: both pin component internals in places `src/lib` does not reach.

- [ ] **[P3] CDK Menu adoption (option B) — parked.** ONLY if/when nested submenus, a menubar, or context menus are needed. `ds-menu` = native roving + `DsOverlayCloseRef` (verified still native, 2026-07-24 — correct for flat menus). Plan: `docs/superpowers/cdk-menu-adoption.md`. When we move, prefer `@angular/aria` `ngMenu` over CDK Menu; gated on a real need or `@angular/aria` going stable.

## Tooling

- [ ] **[P3] The chart palette separates by hue and barely at all by lightness, and nothing measures the dark theme (recorded 2026-09-21, Stas: record only).** Three findings, each with the command that produced it.
  **1. Lightness is flat.** Seven of the eight categorical slots sit between OKLab L 0.625 and 0.673 - a spread of 0.048 - and the closest two are 0.002 apart. Only slot 8 breaks the band at 0.394. A chart screenshotted into a black-and-white document loses every series distinction, and the same flatness is why simulated colour blindness collapses six pairs: it removes hue, and there is no lightness left underneath. Fixing it means moving colours, so it is a repaint and needs its own deck.
  **2. The gate only ever sees the light palette.** `tools/check-chart-palette-separation.mjs` reads `_tokens-charts.scss`; `src/lib/themes/dark/_theme.scss` overrides `--chart-categorical-8` alone, so the dark theme's effective palette is seven inherited slots plus one. Checked by hand on 2026-09-21 and it passes (`node tools/check-chart-palette-separation.mjs --hexes '#e75740,#11a793,#5a83e2,#a173de,#e25a9e,#2ca565,#d85ad8,#8b93a7'`), but nothing holds it there - and in the dark theme all eight slots land in L 0.625-0.673, because slot 8 flips to 0.663.
  **3. Slot order is right and unguarded.** The worst pair among the first 2 slots is 29.0, the first 3 is 18.4, the first 4 is 10.2 - so the charts that use two to four series get the widest gaps, which is the correct arrangement. No gate enforces it, so a future reorder can quietly hand the common case the narrow pairs.
  A fourth thing, not a defect: the dark theme's own comment reasons in protanopia deltas ("dE 12 from the orchid"), although colour-vision support is not a requirement of this system - see `presentations/implemented/chart-palette-v2.html`.

- [ ] **[P2] Publishing to npm stops working in January 2027 and the replacement is not chosen.** `publish.sh` authenticates with `NPM_TOKEN`, a granular token with **Bypass 2FA** on. npm removes direct publish for such a token in January 2027, leaving it able to read private packages and to stage a publish that a maintainer then approves with 2FA. Two failure shapes mark the token itself, and both fail the tag pipeline at `npm publish` with a tarball already built: `E404` on the `PUT` is an expired or revoked token, `EOTP` is a token whose Bypass 2FA is off — npm's default for a newly generated one.
  **The fork:** staged publishing, where the tag pipeline stages and a maintainer approves each release by hand, against trusted publishing over OIDC, which needs no token at all. `bitbucket-pipelines.yml` records that Bitbucket is not an npm trusted publisher, so the OIDC route has to be re-checked before it is ruled out rather than assumed gone.
  **Whichever wins, the 90-day rotation goes away with it** — that cap is npm's on a write-enabled granular token, and it is the only reason a release can fail on a date nobody touched.
  Stas 2026-09-14: keep the token, decide the route later.

- [ ] **[P3] Three `ds-table` paths have never been driven by automation, and five component groups have never been clicked through.** The paths: dragging a column by its handle to reorder, drag-resizing a column, and CSV export — each is pointer-sequence or file-download work that every sweep so far has read statically or skipped. The groups whose demos no automated pass has ever exercised: `actions`, `navigation`, `feedback-status`, `overlays`, `page-structure`. Recorded so the coverage is a known hole rather than an assumption: the focus and accessible-name sweeps DID load all thirteen group pages, so what is missing is interaction, not rendering.

- [ ] **[P3] `tools/todo-index.mjs --check` is not in `lint:all`, so the index can still go stale between runs.** The generator exists and `npm run todo-index:check` fails on a mismatch, but nothing runs it, which is the same gap that let the hand-kept index drift for months. Held back deliberately: adding a step to `lint:all` changes the PR gate for every branch, and in a shared checkout a parallel session editing `docs/todo.md` mid-run would fail it — the C013 false-positive class this repo has already met. One line in the `lint:all` chain when that trade is accepted.

- [ ] **[P2] Nothing catches a stale `presentations/ds.css`, and two gates read it as the truth.** Regenerating it on 2026-09-10 moved 47 declarations that had nothing to do with the change in hand: the focus ring's `transition` → `animation` plus the `ds-focus-ring-in` keyframes, `--focus-ring-radius`, the four check-mark motion roles with the dropdown option's mark, and the mono ligature hook. So every deck had been rendering a pre-animation focus ring for as long as those changes had been in `src/lib`.
  **Why it matters beyond the decks:** `deck-lint`'s D012 and `check-void-tokens` both resolve `var(--x)` against this file, so a stale copy makes a live token read as void — and could hide a genuinely void one. `presentations/README.md` says to run `build:deck-css` after changing any token; nothing enforces it.
  **The fix has a precedent in this repo:** `build-design-sync.sh` rebuilds its tree and fails when the committed one differs. The same shape here is `npm run build:deck-css` followed by a `git diff --exit-code presentations/ds.css` in `lint:all`.

- [ ] **[P3] `templates` and `startingPoints` in the Claude Design manifest are unexplored, and so is what feeds the pane's "Usage notes for Claude" (recorded 2026-09-03).** Both manifest fields exist in the schema and are empty; `hasThumbnailHtml` is false. The pane is server-side — the CLI binary carries only the tool's own description (one `dsCard` hit, inside that text) — so nothing local can answer what fills them.
  **They are testable, though, because the manifest is ours now:** put one entry in `templates`, upload, and look at the pane. That costs one file and one glance. Same for the usage notes: open any card, expand the disclosure, and see whether the text is the component's `.prompt.md`. Neither can be settled without somebody looking at the pane.

- [ ] **[P3] Four components had no block of their own in ds-docs (recorded 2026-09-03, two fixed).** A card is ONE block of a ds-docs chapter — its heading, its prose, its demo — because the pane fits a card's declared `viewport` into a fixed tile, which makes the declared height the zoom level. Table's chapter measures 18919px and rendered as an illegible smudge; as 35 block cards nothing exceeds 2400px and the median card is 566px. A block is attributed to a component by `data-for="<kebab>"` on its heading in the ds-docs template; unmarked blocks belong to the chapter's own component.
  **Two are fixed.** `ModalCard` was the only one that actually hurt — its card was the entire 7049px Modal chapter. `ds-modal-card` is rendered by nearly every block there, so the split is editorial: the SURFACE anatomy (eyebrow, title badge, status, dividers, variants, form) is marked for the card, the OVERLAY behaviour (sizes, persistent) stays with Modal. `PasswordRules` had no `block-title` at all and now has one.
  **Two remain, and neither is urgent:** `SidenavFooter` (2451px) renders the whole AppLayout chapter — its tag appears only inside AppLayout's own topbar demos — and `TimeColumns` (1552px) renders the whole TimePicker chapter, its tag appearing in **no** section at all. Both are inside the normal range for a block card (the tallest is ~2400px), so they read fine; they are simply about their parent rather than about themselves.
  **The gate now reports by measured HEIGHT, not by markup**, because height is what the pane turns into zoom: `check-manual-surface` names any card over 3000px. A build cannot invent a demo, so closing these is ds-docs authoring.
  **Three of them have no API entry either** — `CalendarDay`, `FieldMessage`, `ModalConfirm`, plus `TimeColumns`: the same four `extract-component-api.mjs` reports as "left out, not exported". Their cards fall back to the chapter's API table, which is the only one there is.

- [ ] **[P2] Publishing to Claude Design cannot run from Bitbucket, and Stas wants the CI route looked at again (recorded 2026-09-02).** Everything up to the publish is already automated and gated: `build-design-sync.sh` runs the generator, the Angular build, the bundle, `check-manual-surface`, `check-doc-api` and `build:upload`, then fails the build if the committed `.design-sync/upload` tree differs from what it just rebuilt, if a font file has no `@font-face`, or if a card has no declaration beside it. `tools/prepare-release-commit.mjs` puts the rebuilt tree inside the tagged release commit. **Only the last step is manual**, and it is manual for two reasons, both verified rather than assumed:
  - **The transport is a first-party entitlement, not an API key.** `/design-sync` is built into the Claude Code binary (18 references in the 218 MB executable) and its body arrives by entitlement; the `DesignSync` tool posts to `api.anthropic.com/v1/design/mcp` with a `designOauth` grant that lives in `~/.claude/.credentials.json`. There is nothing to put in a Bitbucket variable — a pipeline has no claude.ai login to grant.
  - **`finalize_plan` is a human gate by design.** It shows the path list for approval and rejects any write outside the approved plan, so even with a token it would not run unattended.
  **What is worth checking next**, in the order that would settle it fastest: whether a `designOauth` refresh token can be minted with a long enough life and a narrow enough scope to sit in a CI variable; whether the design API exposes a non-interactive equivalent of `finalize_plan` (a pre-approved plan id, or a project-scoped write token); and whether an owner-level grant behaves differently, since `delete_files` already discriminates by ownership.
  **The fallback if none of that exists** is a local one-command publish — a script reading the grant from the profile's own credential store and posting the same three calls — which Stas declined for now in favour of another look at CI. Until then the publish runs from a session: the tree CI produced is byte-identical to what gets sent, so the manual step carries no judgement, only the approval click.
  **Also unresolved and cheap to check while in here:** the upload build has only ever run on Windows. `build-design-sync.sh` compares the committed tree against a fresh build, so if alpine's sass or esbuild emits so much as different whitespace, the release build fails on a difference that is not a staleness. Nobody has run it on alpine yet.
  **And one thing only the owner can finish:** 72 orphaned `_preview/*.js` sit in the live project from the previous showcase design. `delete_files` returns `403 permission_denied — bulk delete requires project ownership`, one path as readily as in bulk, so Misha has to remove them.

- [ ] **[P3] `schematics/tsconfig.json` still asks for `moduleResolution: "node"`, which TypeScript 6 removes (recorded 2026-08-31).** `"node"` is the alias for `node10`. TypeScript 5.9.3 — what this repo pins — accepts it, so `npm run build:lib` is green today and 0.11.1 shipped complete: `dist/ds` carries the changelog, both digests, 25 manifests and a registered `schematics/collection.json`. On TypeScript 6 the same config fails with `TS5108: Option 'moduleResolution=node10' has been removed`, and because that error stops `tools/build-schematics.mjs` at its FIRST step, the run never reaches the copy steps — the package would then publish without the changelog, the digests, the manifests or the schematics, and `ng build ds` alone reports success.
  **The fix when the bump comes:** `module` and `moduleResolution` both go to `node16`. `ng-add/index.cts` is already a `.cts` file, so node16 emits CommonJS for it regardless and the `index.cjs` check in the build script keeps passing.
  **How this was found, and the trap in it:** running `npm run build:lib` from a git worktree that has no `node_modules` of its own. `npx` then fetches a current TypeScript instead of the pinned one, and the failure looks like a broken build rather than a worktree without dependencies. Verify a build failure in the real checkout before believing it.

- [ ] **[P3] Drop the brand and domain EXAMPLES from the published docs, not just their names (Stas, 2026-08-31).** The sweep genericised them; his instruction was to consider removing them outright. Exact locations:
  - `src/lib/themes/README.md` — three brand mentions, now `acme` / `brand-acme`: the Option C code block (`@use './app/styles/brand-acme'`), the "Brand vs theme" bullet, and the "Rules summary" bullet. The question is whether the rule ("a brand is an attribute-scoped overlay authored on a theme") needs a named brand in the example at all, or reads fine with `[data-brand="X"]` alone, which the rest of the file already uses.
  - `design-system.md` §6 — five worked examples, now on orders/catalogue/warehouse: the sentence-case pair (`Order history` / `Order History`), and the three `ds-empty-state` table rows plus the sentence under it that quotes the `none` title back. These were one consumer's domain (logistics plans, asset register, producer roles) until this sweep. The empty-state table is the most useful thing in the section, so removing the examples means finding a way to show "the title states the situation" without a situation.
  - `components.md` — the 9+3 grid line, now "a narrow picker or filter rail", previously named a consumer's two screens.

- [ ] **[P3] Re-wrap `CHANGELOG.md` to ~100 columns (Stas, 2026-08-31: "запиши пока в туду … щас не будем").** This is a RE-WRAP, not a rewrite — no prose is shortened and no entry changes meaning. 31 lines run past 118 characters; 19 of them predate the public-surface sweep and 12 came out of it. By release, with the line numbers as of 2026-08-31:
  - 0.8.0 is the bad one — 13 lines, the longest 1039 characters: 2022, 2023, 2024, 2213, 2278, 2289, 2307, 2308, 2309, 2310, 2327, 2328, 2340. Several entries there are a single unwrapped line each.
  - 0.10.0 — 6 lines, longest 199: 911, 1066, 1080, 1201, 1448, 1527.
  - 0.11.0 — 3 lines, longest 221: 118, 121, 124. 0.10.2 — 374, 500. 0.10.1 — 744, 836. 0.9.0 — 1747, 1849. 0.10.3 — 259. 0.6.2 — 2991. 0.4.0 — 3543.
  Two constraints for whoever does it: table rows (`| … |`) must NOT be re-wrapped, because `check-delete-tables` matches a manifest's `find` shapes verbatim against them; and several inline code spans are currently split across a break (`` `<button\n  class="link">` ``, `` `flex: 1;\n  height: auto` ``, `` `<ng-template\n  [dsFilterItem]="180">` ``), which a re-wrap should join rather than preserve. Three more came out of the same reflow and must join too: `` `ds-select { --ds-field-label-text-transform: uppercase; }` ``, the `::ng-deep ds-table tr:hover .cell-name { … }` workaround shape, and `` `color="neutral" variant="outline"` `` — that last one is a rename map, so a line-oriented grep for it currently misses the CHANGELOG, which is the exact hazard this gate was written for. Six shipped comments are ragged too and are NOT in this item: `_ds-color.scss:4`, `auth-layout.component.ts:20`, `_tokens-charts.scss:36`, `themes/light/_palette.scss:15`, `auth-layout.component.scss:29`, and `_status.scss:10-11`. Verify by comparing the whitespace-normalised word stream before and after.

- [ ] **[P3] Does a release note owe the reader a WHY, or only a what-and-what-to-do? (Stas, 2026-08-28, left open on purpose during the public-surface sweep.)** The case that raised it: `ds-search` lost `hint` / `error` / `warning` / `errors` / `invalid` / `touched` / `reserveMessage` / `messageIcon`. Two shapes are available and the release currently ships BOTH — the entry states the removal, and a following paragraph explains the CVA split that caused it.
  **The narrow shape** is what the manifest already does: `old`/`new`, an `action`, and the locators to find it. A consumer's agent needs nothing else to migrate — it does not care why the inputs left.
  **The wide shape** is the changelog paragraph: it answers "why did they leave, and will they come back", which a human deciding whether to upgrade may want and an agent never reads.
  **What the format itself says**, and this is the argument for keeping the why somewhere: `migrations/README.md` defines `note` as "what is LEFT: the why" — so the schema deliberately reserves a field for it, separate from `action`. That makes "explain" legitimate but bounded: the why belongs in `note` and in the changelog prose, never in `action`.
  **Held as undecided rather than settled** because the sweep already removed a lot of explanation as archaeology, and the line between "why the API is shaped this way" (useful) and "how we arrived at it" (ours) is exactly what was hard to draw all day. Revisit with the next release note in hand rather than in the abstract.


- [ ] **[P3] ds-docs still writes BEM MODIFIERS as `--suffix`, and a state should be its own class (Stas, 2026-08-26 — the `__` half is done and archived).** `is-*` IS better here and that is the recorded preference: a modifier glued to the name with `--` reads as a different ELEMENT, while our convention says a variant of one thing is a STATE carried alongside it (`.stage.is-tbl`), which is also how a state reads in the DOM and how it composes with two states at once. Counted 2026-08-26: **11** element-plus-modifier forms flattened this pass and now spelled `state-cell-stage--tbl`, `cell-tag--do`, `cell-tag--dont`, `contract-row--no`, `demo-col--end`, `demo-group-btn--start/--mid/--end`, `halo-stage-well--inverted`, `state-stage--horiz`, `state-cell-stage--overflow`, plus a separate standalone set (`demo--centered`, `applied--stacked`, `demo-btn--ghost`, `demo-menu-item--error`, `btn--start/--mid/--end`, `cell--do/--dont`, `col--end`, …).
  **Why it was split off rather than done in the same pass.** Removing `__` was a pure rename — 865 occurrences, zero semantic change, provable (589 classes used and 589 styled, identical before and after). Converting `--mod` to `is-mod` is NOT: it splits one class into two in the markup, which changes selector specificity from (0,1,0) to (0,2,0) wherever the SCSS is nested, and specificity is exactly what a docs section leans on when it pins a component's forced state. That wants its own pass with its own verification, not a rider on a mechanical one.
  **Then extend the guard.** `selector-class-pattern` currently allows `-` freely, which is what lets `--` through; once the conversion lands, tighten it to reject a doubled hyphen in a class name so the notation cannot come back — the same shape as the two rules that now block `__` (`selector-class-pattern` plus `selector-nested-pattern`, because the first one alone does not see `&__x`).

- [ ] **[P2] `fix:all` reformats HTML that eslint then fights, and it is `fix:all` alone — `lint:all` is green.** The two globs differ, which is the whole of it: `format` checks `{src,ds-docs/src,tools}/**/*.{ts,json,md}` and never looks at a template, so the gate passes; `format:fix` adds `html` to the same glob, so the repo's own fixer rewrites ~112 templates that `ds/template/element-content-newline` and `@angular-eslint/template/attributes-order` immediately want back. Measured again 2026-09-10 from both ends: `lint:all` exits 0 on a clean tree, and one `prettier --write` over three docs section files produced 63 eslint warnings, 23 of them attribute-order on the very attributes just added.
  **So the cost is not a red gate, it is a fixer nobody can run.** `fix:all` is the documented way to normalise a branch, and running it dirties every template it touches — which is how an unrelated file lands in a diff (it happened twice in this repo).
  **The fix is one glob, and it needs a decision because it is a policy file.** Drop `html` from `format:fix` so prettier owns ts/json/md and the two `ds/template/*` rules own templates, which is the shape `lint:all` already assumes. The alternatives are to drop the two ds rules and let prettier own html (bigger diff, loses the attribute-order convention the repo chose), or to leave it and say so in the script so nobody expects `fix:all` to converge.
  **Earlier measurements, still valid as evidence:** prettier reformatted 140 files (115 html + 25 ts) and eslint pulled 77 back (2026-08-25); in the order prettier → stylelint → eslint, `eslint --fix` reverted 111 of prettier's 112, leaving 8 files of whitespace inside inline elements that Angular discards. The tree has been in eslint's shape all along.

- [ ] **[P3] Eight manifest-format practices the audit marked *Adopt*, and nobody has ratified any of them (filed 2026-08-27 out of deck `migration-manifest-audit`).** The audit's own header says it: "the verdict column is a judgement about this repo, not about the practice." So *Adopt* there is a recommendation, not a decision — and the recommendations have sat only inside a deck since 2026-08-25, which is the shape of a verdict nobody executes. **The decision is which of the ten, if any**, not whether each is defensible; every one was sourced from a primary doc, so they are all defensible and adopting all ten is a tooling project no consumer is pulling on.
  **Three of the thirteen are already settled and are NOT part of this item:** the instruction/rationale split shipped as `action` (the prose-split pass, 2026-08-25); package reachability shipped — `package.json` already exports `"./migrations/*"`; and `schemaVersion` was **rejected** in the prose-split session along with `author`, `place`, `outcome`, `unchanged` and `source`.
  **The ten, with what each would cost, verified as absent today** (grep: none of these keys or checks exists in `tools/migration-lint.mjs` or `migrations/AUTHORING.md`):
  (1) **precondition guard** — a no-op check each runbook opens with, so an item cannot half-apply (OpenRewrite `Preconditions.check`, Nx agentic runbooks); (2) **`replaceIn` polarity** — CDK's `CssTokenUpgradeData` defaults to ALL files and narrows, ours is a whitelist that silently excludes, which is a wrong-by-default surface; (3) **executable verification** — Polaris ships a literal alternation `RegExp` per token group, where our `verify` is prose; (4) **runtime signal ids** — Vue/Ember collect what actually fired per app, and `devWarn` already exists here, so this is wiring rather than a mechanism; (5) **escalation marker** — Next.js codemods write a comment that breaks the build until removed (adopt the comment half only); (6) **explicit "no replacement"** — ESLint's `replacedBy` may be an empty array to SAY there is none, and 0 of 22 manifests would fail the check; (7) **`deprecatedIn`** — one half of ESLint `deprecatedSince` / Ember RFC 0649 `since`; the `availableUntil` half was rejected; (8) **provenance link** — CDK makes the PR link a required member; adopt it optional and lint it only on `unreleased`; (9) **`ng-update` requirements key** — the hard pre-flight the Angular CLI enforces (adopt the key, NOT a port to real schematics); (10) **dry-run hit counts** — jscodeshift prints per-file outcomes and Next.js warns that a wrong path reports 0 rather than failing; this one lands in the plugin, not the lint.
  **Why it is P3 and not higher:** the audit's damaging findings are all fixed (23 of 23), the lint gained M034–M037 and M039–M042, and the delete-table parity gate is green — so nothing here is protecting a consumer from a live defect. It is the difference between a format that is ahead of the field and one whose *enforcement posture* is too, which is the audit's own summary of the gap.
  **Cheapest honest first cut if it is picked up:** (6) and (7) are additive keys with a lint rule each and zero back-fill (0 of 22 would fail), and (2) is a one-line default flip with a re-read of the 22 manifests' `replaceIn` values. (1), (3) and (4) are the ones that change what the gate actually PROVES, and the board's own rule applies — a gate proves nothing until you have watched it fail.

## Framework & forms

- [ ] **[P1] Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking changes lands exactly there.** This repo builds on **21.2.17** (`v21-lts` is 21.2.19) and declares `"^21.2.0"` for all six Angular peers, which resolves `>=21.2.0 <22.0.0` — so **a consumer on Angular 22 cannot install this package without `--legacy-peer-deps`**. Angular 22 has been out since **2026-06-03**; `@angular/core` and `@angular/forms` are at **22.1.1** as of 2026-08-07 (checked against the registry, not assumed).
  **P2 → P1, 2026-08-21:** this is the only item on the board where a consumer **cannot install the package at all** — the peers declare `^21.2.0`, which resolves `>=21.2.0 <22.0.0`, so an app on Angular 22 needs `--legacy-peer-deps`. Angular 22 has been out since 2026-06-03, and it is now the version a new app starts on. It was filed as a decision, and the decision part (when to move) is real, but the blocking part is not a preference. Nothing else here stops anyone from adopting a release.
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
  **This item is no longer waiting on a call**; it stays P1 because the fact that raised it is unchanged:
  a consumer on Angular 22 installs this package only with `--legacy-peer-deps`. Everything above stays
  as the prepared answer for when it is picked up — the 22.1.3 compile, the three costs (TS 6.0, Node
  ≥24.15.0, three tsconfig edits), and the three findings that are NOT blockers (`ngNoCva`, `touch`,
  the `min`/`max` assertion). **What would overturn it:** a consumer reporting that
  `--legacy-peer-deps` is not acceptable in their install, or an app that has to start on 22.

- [ ] **[P3] Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wiring.** `pending` — what does a field with an async validator in flight look like? `ds-input` has a spinner; nothing else does. `dirty` — the library renders "edited" nowhere today, so there is no treatment to bind to. `disabledReasons` — **ANSWERED 2026-08-26, and this one is now wiring rather than a decision.** The question was "a tooltip on a disabled control, or ignored?"; the `ds-button` refusal work settled it by measurement — **not a tooltip**: a tooltip needs hover, so it does not exist for a keyboard or touch user, and a natively `disabled` control cannot take focus to announce a description at all. The reason goes INSIDE the control (or under it as a `ds-field-message`), and the control switches to `aria-disabled` so it stays focusable. `ds-button.disabledReason` is the worked example to copy, including the `aria-describedby` wiring and the swallowed click.
  **What the contract actually hands us, read from the installed Angular rather than assumed:** `disabledReasons?: InputSignal<readonly WithOptionalFieldTree<DisabledReason>[]>`, and `DisabledReason` is `{ fieldTree, message?: string }` — so it is an ARRAY, the `Field` directive binds it automatically if the input exists, and **`message` is OPTIONAL**. That last part is the only real design question left: a reason with no `message` has nothing to show, so the control must stay disabled silently rather than render an empty line, and several reasons with messages need a rule (first one, or joined). Our own `disabledReason` is a single string, so the adapter is ours to define.
  The other two are still blocked on a LOOK. Each is one input once its appearance is decided. _(`focus()` was the fourth and SHIPPED 2026-08-10: a resolver on both control-value-accessor bases, verified on all twelve controls that lacked one.)_

## ds-auth-layout — residue from the 0.8.0/0.9.0 audit (recorded 2026-08-11, from the ai-sdlc-prototype side)

> Parent work landed: the type clamps came back out of `ds-auth-layout`, the a11y and robustness
> fixes shipped, and the false comments were corrected. What follows is what was deliberately NOT
> done in that pass, each with the reason, so none of it is rediscovered from scratch.

- [ ] **[P3] Three deferred DEFAULT changes for the batch after 0.9.0**, all held back by the release
  gate rather than by doubt: (1) the auth wordmark at `--font-size-h5` and the tile at 28px, which is
  what actually makes the sidenav-parity claim true and removes the one remaining case where the
  wordmark's line box (22 x 1.25 = 27.5px) drives the brand row above the 24px tile floor on a short
  viewport; (2) `landmark` defaulting to `'main'` instead of `'none'`, so the auth card is a landmark
  without the consumer asking — held because the docs site embeds the layout inside `ds-app-layout`'s
  own `<main>` and two of them is its own violation; (3) `--ds-auth-layout-brand-max-height` defaulting
  to the tile size rather than `none`, which would silently resize logos consumers already ship. Each
  needs a `behavior` migration item worded "was X, now Y, restore via Z" — and (1) additionally needs
  two font-size tokens to EXIST first, since neither is exposed today.

# Parked — asked, and deliberately not now

Ordered by how close each is to a first consumer ask, which is the only thing that unparks any of them.

## Localization — every user-visible string is a hardcoded literal (recorded 2026-08-27, from the ITB Workspace picker report)

- [ ] **[P2] Every user-visible string in the library is a hardcoded English literal — VALIDATED 2026-08-27 against 0.11.0; Stas: defer the whole thing, no code.** Asked as proposal P4 (covering findings G4 and A1) of the ITB Workspace filter-picker gap report, written against 0.9.1, which proposed a `DS_INTL` token in the `MatPaginatorIntl` shape scoped to "all overlay text". **The scope in the ask is what makes this a project rather than a change, and is why it was deferred rather than built.** The picker literals were six places, and **0.11.1 took two of them off the list by giving them projection slots** — `No matches` is now the fallback inside `dsEmptyTemplate` (`multi-select.component.html:388`, `autocomplete.component.html:299`) and `Create «…»` the fallback inside `dsCreateTemplate` (`autocomplete.component.html:331`), so a consumer can replace both today without any of this. **Six are still unreachable, and 0.11.1 added two of them.** Located by their text rather than by line, because the numbers here drifted twice — the templates grew between each audit and the next reading, and a stale number sends the reader to the wrong row:

  | Literal | Where |
  | --- | --- |
  | `Select all` | the panel-wide select-all row in `multi-select.component.html` |
  | `+N more` | the chip overflow marker in `multi-select.component.html` and `autocomplete.component.html` |
  | `'Remove ' + label` | the chip close label in both of those |
  | `Select…` | the default `placeholder` in `autocomplete.component.ts` |
  | `All of {{ group.label }}` | the per-group select-all row, **new in 0.11.1** |
  | `countLabel="selected"` | the count badge on the compact trigger, **new in 0.11.1** | **The last two make 0.11.1 the release that both wrote §4 of `docs/picker-contract.md` and broke it**, which is the strongest argument yet that the slot-by-slot approach does not scale and the provider has to land. Outside the pickers a sweep of `src/lib/**/*.html` finds 34 more hardcoded `aria-label`s (35 across 17 files, one of which is `ds-select`s own) — alert, breadcrumbs, color-picker, date-picker (×5), drawer, dropzone, input, modal-card, number-stepper (×2), pagination (×3), search, select, sidenav-footer (×6), table (×3), time-columns (×3), time-picker, toast — plus visible text in `ds-table` and `ds-sidenav-footer`. Localizing the pickers alone ships half a mechanism to an app that needs all of it.
  **The fork, written down so the next reader does not re-derive it:** a `DS_INTL` token with `provideDsIntl`, against per-instance inputs on each component. **The library currently leans the other way** — `ds-filter-bar` localizes with `moreLabel` and `panelLabel` inputs (`filter-bar.component.ts:75-77`) — so a token has to justify itself against a shipped precedent rather than arrive as the obvious answer. If the token wins, `provideDsConfig` already exists as the app-wide configuration point and is where it belongs; `resolveWithConfig` is the pattern it would follow.
  **P2 rather than P3 because a consumer is actually blocked**, which none of the other parked items can claim: ITB Workspace runs a two-language `LanguageService` and cannot translate a picker panel at all. Parked on priority, not on doubt about the need.
  The rest of that report is live work — the seven surviving findings and their forks are in `presentations/implemented/picker-gaps-decisions.html`, whose closing section is this item.

## ds-icon does not read the icon size scale (recorded 2026-08-24, from the state-glyph work)

- [ ] **[P3] `--icon-xs/sm/md/lg` exist (12/14/16/20) and `ds-icon` cannot be sized by them.** It takes
  a NUMBER (`size`, falling back to `DS_CONFIG.icon.size`) and writes `width`/`height` attributes, while
  publishing `--ds-icon-size` OUTWARD as an inline custom property. So the scale is only usable by
  hand-written CSS on someone else's svg, and an ancestor cannot say "icons in here are 14px" the way it
  can say that about every other dimension in the library. **The natural hook would be a CSS token, and the only route to one is `::ng-deep` into
  `ds-icon`'s template** — so that feature took a config value instead, and the glyph is a hardcoded 14px.
  **The shape of the fix:** size the svg from `var(--ds-icon-size, <attr fallback>)` in `ds-icon`'s own
  (global) styles, and set the inline `--ds-icon-size` ONLY when `size` is explicitly bound — an unbound
  icon then inherits whatever an ancestor declares, and a bound one still wins. **Not urgent and not
  free:** it changes how every icon in 90-odd components resolves its size, so it wants its own pass and
  a look at the pages that mix icon sizes in one row.

Stas said keep it in the backlog. Left untouched on purpose.

## Missing components (from gap analysis)

Most of the original gap list has SHIPPED (verified 2026-07-24: multi-select · button-group · segmented · timeline · description-list · list · data-grid · confirm-dialog · layout · color-picker · slider · otp-input · tree · loading-overlay · split-button; plus this session's `ds-app-layout` + `ds-sidenav-footer`). Remaining:

- [ ] **[P3] Image / lightbox.** No demand stated; overlay/motion infra (`modal`/`drawer`/`overlay-motion.ts`) exists to build on.

- [ ] **[P3] Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Resizable split panes (drag a divider to resize adjacent regions). **DECISION-PENDING** on need. Reference: this session's `ds-table` column-resize pointer logic (`onResizeStart/Move/End`) is a ready basis for the drag mechanics (panes vs columns aside).

- [ ] **[P3] CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Hierarchical cascading dropdown (ref https://primeng.dev/cascadeselect).** Pick a leaf from nested groups via a compact overlay that expands sub-levels (Country → State → City). GAP: `ds-select`/`ds-multi-select` are FLAT dropdowns; `ds-tree` is a full inline tree VIEW (single-select via `selectedId`), not a compact selector; `ds-menu` is an actions menu, not a value control — so no cascading value-select exists. Niche (category / geo pickers), no active request. Building blocks if pulled: `ds-tree`'s `TreeNode` model + the shared overlay/popover infra + `ds-select`'s trigger. Otherwise document "use `ds-tree` for inline hierarchy, or flatten into grouped `ds-select`".

## Missing tokens / foundations (from gap analysis)

- [ ] **[P3] Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog.** Add opt-in `--primary-cta`/`-hover`/`-active`/`-on`, defaulting to the `--primary*` family; the default solid button (the `--c-base`/`--accent` slot — **note: no `.primary` class; verified `button.component.scss:23,35`, 2026-07-24**) reads them. Lets a brand give the CTA a deeper AA-safe fill when it rebrands `--primary` to a light colour, without darkening the role everywhere. Default theme needs nothing (white-on-`--primary` already ~5.5:1 AA). Ported from the a11y branch (`--brand-cta`); dropped in merge because the tokens didn't exist on main and default passes AA.

- [ ] **[P3] MED cluster — ASKED 2026-08-05, Stas: keep in the backlog.** Density beyond hit-targets (fonts/icons/pad — `[data-density]` scales heights/pad/avatars today but NOT `--font-size-*`/`--icon-*`, verified 2026-07-24) · fluid typography (`clamp()` — type tokens are fixed px). **No longer speculative — there is now a MEASURED case (2026-08-10).** Controls that hold chips set a `min-height` rather than a height, so when a tier floor drops below what the text needs they stop following it: under `ultra-compact` `ds-multi-select` measures **33px** and `ds-autocomplete` **29px** where the other seven reach 24px. The floor is applied correctly (`min-height: 24px`); the content cannot shrink, because at a 14px font the line box alone is 19.6px. Proved by hand: dropping `--font-size-s` to 11px in that container pulled them to 31px and 25px. So "density does not scale type" is not a nicety — it is why the bottom tier does not level. `compact` is unaffected in practice (33 against 32). _(The third clause — motion semantic presets — MOVED 2026-07-31 into the customizable-motion item under "Motion / overlays" as its slice 3; don't re-open it here.)_ Both remaining pieces are speculative, no active request; split into their own items if ever prioritized. _(high-contrast/forced-colors + RTL/logical-properties dropped — Stas 2026-07-07.)_

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

# Records — kept so they are not "simplified" away

## The chart family read as an architecture (audited 2026-09-22)

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

- [ ] **[P2] The chassis is declared nine times and shared once - about 450 lines of it.**
  `resolveChartDefaults` (`charts-defaults.ts:30-63`) unifies what the ten common inputs MEAN, and
  the `input()` lines above it never moved. Ten inputs plus their doc paragraphs repeat across
  `bar-chart.component.ts:105-167`, `column-chart.component.ts:178-238`,
  `line-chart.component.ts:186-254`, `pie-chart.component.ts:103-164`,
  `funnel-chart.component.ts:109-166`, `heatmap-chart.component.ts:99-133`,
  `scatter-chart.component.ts:135-177`, `waterfall-chart.component.ts:99-134` and
  `chart/chart.component.ts:160-211`. The `tooltipLingerMs` and `dimOthers` paragraphs are
  byte-identical in five files each.
  **The cost of moving them is the documentation, not the code.** `extract-docs` turns each
  docblock into that chart's own input table, so a base class buys ~450 lines and makes every
  chart's API page open with a shared preamble. The extraction that does NOT cost that is the
  template and style duplication below, which no generator reads.

- [ ] **[P2] The template state head and the figcaption rule are copied verbatim, nine times each.**
  The error and empty `<p>` blocks are byte-identical in all nine chart templates, and the pin-reset
  `<button>` in five, differing only in the release expression. The `figcaption` rule - three
  declarations - is byte-identical in nine stylesheets (`bar-chart.component.scss:32-36` and its
  eight siblings), and `styles/_chart-frame.scss:34-38` already reaches `figcaption` for
  `user-select`, so the mixin is the obvious home. Neither is read by a doc generator, so both move
  without losing anything.

- [ ] **[P3] Four charts keep their own roving-tabindex state block, and the shared module owns only
  the helpers.** `charts-roving.ts` exports `nextRovingIndex` and `focusMark`; the four-member state
  around them repeats at `bar-chart.component.ts:228-247`, `pie-chart.component.ts:220-281`,
  `funnel-chart.component.ts:242-283` and `column-series.component.ts:297-316`, differing only in the
  count source and the `.closest()` selector. `ds-scatter-chart` opts out entirely -
  `scatter-chart.component.html:76` puts `tabindex="0"` on every mark, against the one-tab-stop
  policy the other four follow.

- [ ] **[P3] Three charts hand-roll a legend and three compose their own accessible sentence.**
  `ds-chart-legend` exists and has three users (column, line, scatter); `pie-chart.component.html:143-183`
  builds a 41-line legend, `funnel-chart.component.html:96-158` a swatch table and
  `heatmap-chart.component.ts:211-219` a ramp key. `describeSeries` (`charts-summary.ts:76`)
  documents "the ORDER is the contract" and has five users; heatmap, scatter and waterfall each
  phrase their own instead (`heatmap-chart.component.ts:221-228`,
  `scatter-chart.component.ts:309-324`, `waterfall-chart.component.ts:176-195`).

- [ ] **[P3] Six places reimplement something a shared module already does.**
  `line-series.component.ts:198-209` repeats `alignSeriesValues` (`line-chart.math.ts:12-30`) on data
  the chart already aligned at `:272`. `scatter-chart.component.ts:57-59,183-188` declares its own
  gutters and plot rectangle beside `chartPlot` (`chart.math.ts:53`), and
  `scatter-chart.math.ts:50-71` its own clamped scale beside `valueScale` (`chart.math.ts:134`) -
  while using `linearScale` for the tick labels, so one component runs two scales.
  `heatmap-chart.math.ts:9-25` recomputes a clamped share `linearScale` covers.
  `bar-chart.math.ts:28-38` and `line-chart.math.ts:35-48` each reimplement the max reduction inside
  `axisDomain`, which itself carries the same loop twice (`chart.math.ts:103-110` and `:263-270`,
  byte-identical, same file). `waterfall-chart.component.ts:37` writes the literal
  `'var(--ds-chart-series-default-color)'` where `chart-palette.generated.ts:16` exports it.

- [ ] **[P3] Five constants carry two or three spellings each.** Tick count `5` at
  `chart.math.ts:16`, `line-chart.math.ts:5`, `scatter-chart.math.ts:5` plus bare literals at
  `column-chart.component.ts:176` and `waterfall-chart.component.ts:93`; plot height `240` at
  `chart.math.ts:32` and `line-chart.component.ts:63`; edge gutter `12` at `chart.math.ts:37` and
  `scatter-chart.component.ts:59`; value-label gap `8` at `column-series.component.ts:50` and
  `waterfall-marks.component.ts:15`; column width ratio `0.8` in three places.

- [ ] **[P3] Four exports on the package surface have no consumer in `src/`.** `pointScale`
  (`charts-scale.ts:120`, 32 lines), `tickStep` (`:73`), `formatTick` (`charts-format.ts:90`, 27
  lines) and `polylinePoints` (`charts-path.ts:61`) are re-exported by `components/index.ts` and
  referenced only from `tools/probes/`. `ChartScales.zeroOffset` (`chart-scales.token.ts:40`) is
  declared on the mark contract and read by no mark.

- [ ] **[P3] `'none'` and `'grouped'` are the same value on `ds-column-chart`.**
  `column-chart.component.ts:333-337` branches them together for `slotCount` and
  `chart.math.ts:334-338` branches them together in `stackOffsets`; the component's own doc says
  "the two differ only in spelling" (`:158-159`). Either one goes, or the doc says which is
  canonical.

- [ ] **[P3] Two inputs decide one thing on `ds-funnel-chart`, and two vocabularies name one idea.**
  `showTable` (`funnel-chart.component.ts:107`) is resolved against the family-wide `dataTable` by
  mutual exclusion at `:410-412` - the only chart-local switch that supersedes a `DS_CONFIG`-backed
  one. Separately, `column-series` spells its tooltip anchor `'mark' | 'cell'` (`:114`) and
  `line-series` spells the same idea `'reading' | 'pointer'` (`:146`), in one folder. And
  `line-chart.types.ts:22` declares `LineChartStack` rather than narrowing `ChartStackMode`, then
  feeds it to `stackOffsets`, which is typed on the full union (`chart.math.ts:329-331`).

- [ ] **[P3] `tooltipAnchor="pointer"` is inert unless `tooltip="axis"`, and nothing says so.**
  `line-series.component.ts:452-461`. A value on one input that does nothing depending on the value
  of a sibling is the shape a consumer reports as a bug.

- [ ] **[P3] `ds-pie-chart` declares `staggerMs` and documents that it does nothing.**
  `pie-chart.component.ts:188-191`. It exists for parity with the other charts. Either it works or
  it goes.

## Thirteen inputs the chart family declares component by component (measured 2026-09-22)

- [ ] **[P3] Only the RESOLUTION of the shared chart inputs is shared, not their declaration.**
  `resolveChartDefaults` unified what the values mean; the `input()` lines above it did not move.
  Counting `readonly <name> = input(…)` and `= model(…)` at class level across the nine chart
  components: `caption`, `valueFormat`, `errorText`, `emptyText`, `error`, `interactive`, `frame`
  and `loading` are declared in all nine, `summary` in eight, and `tooltip`, `dimOthers`,
  `dataTable` and `data` in seven - 108 declarations for 13 names.

  Each carries its own docblock, and `extract-docs` turns those into the per-component input
  tables in `components.md` and `docs/agent/`. A base class or a `hostDirective` would buy roughly
  a hundred lines and cost the documentation pipeline the per-component wording, which is what
  makes a chart's API page read as that chart's rather than as a shared preamble.
  **Not obviously worth doing.** Recorded so the next reader does not re-derive the measurement,
  and so the decision is made once rather than half-made.

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

## `changelog-lint` cannot tell "checked and clean" from "did not check" (recorded 2026-09-01, §9 G6, Stas: park)

- [ ] **[P3] The gate's own floor does not catch the failure it was written for.** Before it can
  check anything, `changelog-lint` builds the list of published artefacts from two resolvers, and
  both degrade quietly: `publishedFiles()` filters through `existsSync`, and `shippedSources()`
  reads `assets ?? []` out of `ng-package.json`. Rename a directory, or rename that key, and the
  list simply gets shorter — the gate checks what it found, prints `OK`, and never opens the rest.
  A leak in an unopened file ships.

  **Measured 2026-09-01.** The sweep is 320 files, and it is three groups, not one: **30**
  documents, **36** assets from `src/lib/styles` + `src/lib/themes`, **254** TypeScript sources
  under `src/lib`. Dropping the `assets` key costs the 36 and leaves **284** — which clears the
  floor of 100 with room to spare. **The floor is green for exactly the collapse it exists to
  catch**, because a single total cannot see one group of three go to zero.

  **Two ways out, and the smaller one may be enough.** (a) A committed census per group in
  `tools/surface-baseline.json`: fewer than last time fails and names the group, more is normal
  growth, and `tools/changelog-release.mjs` rewrites the numbers at the cut so they land in the
  release commit rather than dirtying an unrelated branch. (b) Just assert that every directory
  named in `ng-package.json` `assets` yields at least one file — three lines, catches this exact
  scenario, no numbers to maintain. **Nothing has broken yet**; this is a guard against a future
  rename, which is why it is parked rather than open.

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

## ds-app-layout — the one knowingly duplicated decision

> The parent shipped 2026-07-24 (as `ds-app-shell`, renamed in 0.7.0) with `ds-sidenav-footer` and the brand row; spec at `.claude/superpowers/specs/2026-07-24-ds-app-shell-design.md`. Only the record below is left.

- [ ] **[P3] `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing my own `118a539`).** The rail's layout switch lives in `app-layout.component.scss` as `bp.down(lg)`, and `watchDesktopBreakpoint()` runs `matchMedia` over the same `--bp-lg`. The VALUE cannot drift — both read one custom property, and a missing one now errors in dev instead of falling back to a literal — but the CONDITION is decided twice, in two languages, and changing one does not force the other. The JS copy is not removable today: `compact` gates `cdkTrapFocus` and the `role="dialog"`/`aria-modal` pair, and no CSS feature (container queries, `:has`) can drive a focus trap. **Recorded so nobody "simplifies" it blindly, and to revisit if** CSS gains a way to gate focus trapping, or Angular ships a breakpoint primitive. Not a bug — a knowingly duplicated decision over a single source of truth.

## A11y — decision record (deferred, NOT a bug)

- [ ] **[P3] topbar → `role="banner"`** — VALIDATED-REDUNDANT & DEFERRED (Stas 2026-07-06 "пропусти, не удаляй"). The bare `<header>` inside the generic custom element `<ds-topbar>` already maps to the `banner` landmark implicitly (**verified `topbar.component.html:1`, 2026-07-24**); an explicit role is flagged "unnecessary" by the W3C validator and would be WRONG if `<ds-topbar>` is nested in `main`/`section`/`article`/`aside`/`nav`. Kept as a decision record; only add if we adopt a deliberate defensive-robustness policy.

## One popover instance per trigger — the alternative that was weighed and not taken (recorded 2026-09-08)

- [ ] **[P3] ds-table's three popovers each serve many triggers from ONE instance, and the switch depends on an event order nothing enforces.** The column filter, the row-actions menu and the clipped-cell text popover are each declared once and re-anchored per click. Clicking a second trigger while the first panel is open works only because the CDK's outside-pointer listener dismisses the open overlay before the button's own click handler runs, then `toggle` re-opens on the new trigger — measured on the filters (Venue → Status) and on two clipped cells. Nothing asserts that order; `PopoverComponent.toggle` now carries a comment saying the three depend on it, which is a record, not a guarantee.
  **The alternative, weighed against eight others when the lost-first-click defect was fixed:** declare a `ds-popover` inside each filterable header / each actionable row / each clipped cell and reach them with `viewChildren`, so no instance is shared and the ordering stops mattering. It also removes `filterColumn` and `menuRow` as stored state — the trigger's own popover knows what it belongs to.
  **Why it was not taken then:** it is N instances instead of one, a refactor of a core component, and it would leave the table's three popovers diverging from `cellTextPopover`/`rowMenuPopover`'s config-level gating pattern that the fix had just aligned the filter to. The shared instance is measured working, so the change buys structure rather than behaviour. **Revisit if** a fourth shared-instance popover appears in the table, or if the dismiss-before-click order ever breaks under a CDK upgrade — the symptom would be a second trigger closing the panel instead of moving it.

## Docs nav chapters — the two limits the derivation ships with (recorded 2026-09-08)

- [ ] **[P3] A chapter list reaches only sections whose headings are `h3.block-title`.** `docs-section` derives its chapters by walking that one selector, so a section that titles its blocks any other way contributes nothing and its nav item shows no caret — silently, because there is no error to raise for markup that simply does not match. Eleven sections on the Data display page do match; nothing audits the rest. **Fix by** either normalising the remaining sections onto `h3.block-title` or widening the walk to every `h3` inside the section and letting the heading opt out with an attribute. **A check would say which**: count sections whose `h3` elements carry the class against those that have `h3` at all, and fail when the two disagree — the same shape as `check-docs-attrs`. Worth doing before anyone concludes a section "has no chapters" when it has 20.

- [ ] **[P3] The active chapter is not scrolled into the rail's own viewport.** With 35 chapters under `ds-table`, the highlighted one can sit outside the sidebar's scroll — the reader watches the URL fragment change while the list shows no movement, which is the same "where am I" problem the chapter list was added to solve. Section items never had this: there are at most ~20 per group and the group collapses. **Fix by** scrolling the active chapter link into view within the nav's scroller when `activeChapter` changes — `scrollIntoView({ block: 'nearest' })` on the element, guarded so a click the reader just made does not fight their own scroll. **The trap:** the nav is itself inside the layout's rail, so a naive `scrollIntoView` scrolls the PAGE as well; it has to be constrained to the nav container the way `onItem` constrains its scroll to the layout's scroller.
