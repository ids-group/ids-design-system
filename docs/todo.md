# DS — improvements backlog

- [ ] **[P3] A table row publishes only its background on hover, so a cell that must react in TEXT reaches
  past the API (mm-broker, 2026-08-19).** `--ds-table-row-hover-bg-color` and its `-active`/`-pressed`/
  `-selected`/`-stripe` siblings are the whole hover surface: there is no hook for a cell's own colour, so
  four list screens whose row opens a record write `:host ::ng-deep ds-table tr:hover .cell-name { color:
  var(--accent); text-decoration: underline }`. The pattern is not decorative — with `rowInteractive` the
  whole row is the control, and the name is what tells the reader *what* will open; leaving it inert makes
  the row look unclickable, and a `cursor: pointer` alone does not say which text is the target. Four
  screens do it identically (brokers, campaigns, carriers, employer-groups), which is the usual sign it
  belongs upstream. **Ask:** either `--ds-table-row-hover-text-color` applied to the row (the cheap half),
  or — better, since only one cell is the target — let `TableColumn` carry the intent, e.g. `interactive?:
  boolean`, and give that cell `--ds-table-cell-link-color` / `-decoration` on row hover. Their
  `::ng-deep` is the last table reach that no token can replace; the other two are already filed
  (`width: 'content'`, the toolbar slot) and shipped.

## Open, in priority order

**Bugs — something shipped misbehaves**

- P1 · The resolved-size signals are `protected`, so the documented migration path does not
- P2 · `:disabled` dims to `--opacity-muted`
- P2 · `--ds-dropdown-panel-radius` does not reach `ds-multi-select`
- P2 · `components.md`'s header contradicts its own body, and the file ships
- P2 · A consumer that clears or replaces `value` cannot clear the picker's own error
- P3 · `compact` re-evaluates in TS a condition the stylesheet already owns
- P3 · Two documentation surfaces still carry claims corrected elsewhere
- P3 · Two stale strings that outlived the code
- P3 · Cosmetic, in passing
- P3 · `ds-stat`'s `value` cannot take Angular's own `number` pipe

**Asks — a consumer or Stas asked for it**

- P2 · `ds-sidenav-item` active state — solid accent pill → quiet wash + coloured label?
- P2 · One entry point for the whole library means a consumer cannot keep the DS out of their initial bundle
- P2 · `ds-table`'s row-action column has shipped since 0.6.3 and mm-broker uses it in ZERO of its
- P3 · `ds-table` — row-expansion parity polish vs PrimeNG
- P3 · `ds-number-stepper` — optional numeric formatting
- P3 · `ds-menu-item` — a native secondary line, so an action can state a limitation without hover or focus
- P3 · `ds-list-item` cannot express a row that has its own control AND a row-level action
- P2 · `ds-field-message` claims `state` picks an icon, and it never does — two false doc comments over a real gap
- P2 · `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely
- P2 · `variant="tonal"` has NO disabled signal in the dark theme — label 1.11:1, fill 1.20:1, both dead
- P2 · `variant="tonal"` disabled rests on desaturation alone in dark — label 1.11:1, fill 1.20:1
- P3 · `ds-search` and `ds-segmented` hold a value but cannot join a form
- P3 · `ds-radio` standalone cannot bind to a form, by design — recorded, not a defect
- P3 · Two components a consumer cannot import appear in the docs API reference
- P3 · `ds-table`'s two-way `[(sortKey)]` / `[(sortDir)]` form is available but never demonstrated
- P3 · Four box-less controls compute no `controlState`, so a state reaches the message but not the control

**Decisions — waiting on Stas, not on work**

- P2 · The breaking batch after 0.9.0 — decide it as ONE story, because it is four surprises otherwise
- P2 · Width-based overflow as the DEFAULT for anything that lists items in a row
- P2 · Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest w
- P2 · `.ds-interactive` — global state-interaction contract
- P2 · Theme recipe vs hand-tuned picks — alignment decision
- P2 · Shared picker internals — SURVEYED 2026-08-05, and the premise is wrong: it is THREE components, not six
- P2 · Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking chan
- P3 · Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wirin
- P3 · Three deferred DEFAULT changes for the batch after 0.9.0

**Parked — asked, and deliberately not now**

- P3 · Inspect mode — ASKED 2026-08-05, Stas: NOT NOW
- P3 · Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog with the deck a
- P3 · Image / lightbox
- P3 · Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now
- P3 · CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now
- P3 · Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog
- P3 · MED cluster — ASKED 2026-08-05, Stas: keep in the backlog
- P3 · CDK Menu adoption

**Records — kept so they are not "simplified" away**

- P3 · topbar → `role="banner"`

---

# Bugs — something shipped misbehaves

Highest: each one is wrong in code a consumer already has.

## Found by the 0.9.1..HEAD changelog re-review (2026-08-15)

Eight defects the prose review turned up in the code itself. The CHANGELOG and
`migrations/unreleased.json` were corrected to describe what the code actually does, so nothing
below is a documentation gap any more — each is a real thing to fix.

- [ ] **[P1] The resolved-size signals are `protected`, so the documented migration path does not
  compile.** `size()` now returns `null` when unbound, and the replacement a host is told to read —
  `sizeResolved()` — is `protected` on 13 of the 14 controls (public only on `FieldGroupComponent`),
  as are `elevationResolved` / `paddingResolved` (card), `sizeResolved` (icon), `withDotResolved`
  (badge), `borderedResolved` / `stickyScrollbarResolved` (table), `dividersResolved` (both modals)
  and `brandName` / `letterGlyph` / `taglineText` (sidenav, auth-layout). Reading any of them from a
  host, a test or a `viewChild` is TS2445. Either make them public — which is what the release notes
  wanted to say — or keep them closed and accept that the readback has no answer. The CHANGELOG now
  states the second, honestly; the first is the better product.


## Component API / portfolio

## A disabled button does not read as disabled (from mm-broker MBP-121, 2026-08-12)

- [ ] **[P2] `--ds-dropdown-panel-radius` does not reach `ds-multi-select`.** Its panel element is
  `class="panel"`, not `.dropdown-panel`, and `multi-select.component.scss:108` hardcodes
  `border-radius: var(--radius-md)`. So that panel is the one place neither the new token nor
  `--ds-radius-panel` has ever reached, and it stays at 8px while the other two move.

- [ ] **[P2] `components.md`'s header contradicts its own body, and the file ships.** Line 123 still
  warns that the `ds-button` section documents the pre-`color`×`variant` API and the pre-rename
  token names — which is exactly what `b69a83d2` rewrote — and still names the dead `-fg`. The
  "Re-verified 2026-08-05" stamp was not moved either. `tools/build-schematics.mjs` copies this file
  into `dist/ds/`, so consumers' agents read it.


## `ds-date-picker` keeps its own "Enter a valid date" through an external `value` change (from mm-broker MBP-219, 2026-08-18)

## `TableComponent.onRowKey` opens the row from a key pressed on a control inside it (from mm-broker MBP-146, 2026-08-20)

## ds-app-layout (SHIPPED 2026-07-24) — post-merge polish

> **Parent DONE** — `ds-app-layout` (shipped as `ds-app-shell`, renamed in 0.7.0) + `ds-sidenav-footer` + `ds-sidenav` brand row (`logoLetter` + `[dsBrandName]` projection) all merged to main (branch `feat/app-shell`, final review clean). Spec: `.claude/superpowers/specs/2026-07-24-ds-app-shell-design.md`. Kept on the board only for the open polish children below. Consumer migrations (ai-sdlc → mm-admin → pinkmoon) are post-release follow-ups.

- [ ] **[P3] `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing my own `118a539`).** The rail's layout switch lives in `app-layout.component.scss` as `bp.down(lg)`, and `watchDesktopBreakpoint()` runs `matchMedia` over the same `--bp-lg`. The VALUE cannot drift — both read one custom property, and a missing one now errors in dev instead of falling back to a literal — but the CONDITION is decided twice, in two languages, and changing one does not force the other. The JS copy is not removable today: `compact` gates `cdkTrapFocus` and the `role="dialog"`/`aria-modal` pair, and no CSS feature (container queries, `:has`) can drive a focus trap. **Recorded so nobody "simplifies" it blindly, and to revisit if** CSS gains a way to gate focus trapping, or Angular ships a breakpoint primitive. Not a bug — a knowingly duplicated decision over a single source of truth.


## ds-auth-layout — residue from the 0.8.0/0.9.0 audit (recorded 2026-08-11, from the ai-sdlc-prototype side)

> Parent work landed: the type clamps came back out of `ds-auth-layout`, the a11y and robustness
> fixes shipped, and the false comments were corrected. What follows is what was deliberately NOT
> done in that pass, each with the reason, so none of it is rediscovered from scratch.

- [ ] **[P3] Two documentation surfaces still carry claims corrected elsewhere.** `docs/done.md:191`
  repeats "the same letter-mark tile" (the tile is 28px/weight 800 in the rail versus 24-32px/weight 700
  in the auth layout, with separate token hooks, so retinting the mark means setting both). And
  `components.md` — which ships inside the npm package and is what a consumer's agent reads — has **no
  `ds-auth-layout` or `ds-app-layout` entry at all**, while its `ds-sidenav*` block still names the
  pre-rename `--ds-sidenav-mark-bg` / `-fg` tokens.

- [ ] **[P3] Cosmetic, in passing.** `badge.component.ts:25-26` carries two consecutive JSDoc blocks
  on `withDot`, the first being the pre-change text, and it feeds the generated API table. The
  ds-docs search section says "Two things skip the timer" where code and changelog say three, and
  the generated stat token description says an unwrapped phrase value is "clipped" when `.stat` sets
  no `overflow` and it actually escapes the tile.

- [ ] **[P3] `ds-stat`'s `value` cannot take Angular's own `number` pipe.** `StatComponent.value` is
  `InputSignal<string | number>`, while `DecimalPipe.transform` returns `string | null`, so
  `[value]="count | number"` fails typecheck under `strictTemplates` with
  `TS2322: Type 'string | null' is not assignable to type 'string | number'`. Consumers fall back to
  `count.toLocaleString('en-US')` inside the template, which hardcodes the locale instead of reading
  `LOCALE_ID` and re-evaluates on every change-detection pass where a pure pipe would be cached.
  Widening the input to `string | number | null` (an absent value rendering as nothing, which is what
  an empty string already does) would let the idiomatic form work. Found in mm-broker-platform's
  platform-admin, where both idioms now sit on the same KPI row for exactly this reason.

# Asks — a consumer or Stas asked for it

Requests, not defects. Ordered by who is blocked.

## From mm-broker's `_ds-overrides.scss`, read as a record (2026-08-07)

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


## `ds-modal`'s padding is one `pad-y` per region, and a real layout needs per-side (from mm-broker, 2026-08-19)

---


## `maxVisibleChips: null` means a decision where the rest of 0.10.0 made `null` mean "unset" (from mm-broker, 2026-08-20)

---


## The universal focus ring has no answer for a clipping ancestor (from mm-broker, 2026-08-19)

Three findings from adopting 0.10.0's `:where(:focus-visible) { outline: none; box-shadow:
var(--ds-control-focus-shadow) }` across three apps and deleting the twenty rings the consumer drew
itself. All three were found by RENDERING the built bundle; none of them fails a build or a grep.

- [ ] **[P1] A `overflow: hidden` ancestor clips the ring away completely, and the element is then
  focusable with NO indicator at all.** The ring is a box-shadow outside the border box, so any
  clipping ancestor eats it — and clipping a card is the normal way to keep a full-bleed child inside a
  rounded corner, which `ds-card` itself invites (`ds-card` + `padding: none` + a child that fills it).
  Measured in four places in one consumer: three rows filling a `ds-card .card { overflow: hidden }`,
  and a gradient CTA pill (`overflow: hidden` for its own animation) wrapping a full-width `ds-button`
  — that last one is a DS component losing its own ring, not a consumer's hand-rolled control.
  The workaround is to re-declare the token with `inset` shadows per scope, which every consumer will
  have to rediscover:
  `--ds-control-focus-shadow: inset 0 0 0 2px transparent, inset 0 0 0 4px <ring colour>`.
  **Ask:** ship it as a family on the existing switch — `data-focus="inset"` beside `ring` / `field` /
  `edge` / `outline` — so a subtree can opt in with one attribute, and/or publish an `--ds-*-focus-shadow-inset`
  role that resolves the same colours. Either way the trap belongs in the docs page for the switch.

- [ ] **[P2] `--focus-ring-inner: var(--surface-canvas)` assumes the focused element sits ON the
  canvas.** The 2px gap is there to separate the ring from the element, so it has to match what is
  BEHIND the element, and `--surface-canvas` is only that when nothing else intervenes. In a dark app
  with white cards the gap paints the dark canvas colour as a rim around a white card, which reads as a
  rendering artifact rather than a focus state — measured on a dark portal, and the fix that made it
  correct everywhere was `--focus-ring-inner: transparent`, which takes whatever is actually behind.
  **Ask:** default the inner ring to `transparent`. Nothing is lost on a canvas-coloured ground (the
  gap resolves to the same pixels) and every other ground stops being wrong. If the current default is
  deliberate — e.g. a guard against a busy photo background — say so where the token is documented.

- [ ] **[P2] The 0.10.0 entry names two consumer cases and misses the common one.** It covers "you
  relied on the element having NO indicator" and "you relied on the BROWSER's outline", but not the
  case that actually bites: **an app rule that styles `:focus-visible` with an `outline` only**. That
  rule keeps winning on `outline`, the base rule still supplies `box-shadow`, and the element renders
  BOTH — a second ring in the app's colour around the DS ring. Fourteen sites in one consumer, all
  invisible to the build and to grep.
  **Ask:** add it to the entry with the one-line fix (`box-shadow: none` in that rule, or delete the
  rule and retint the DS ring instead), since "delete your own ring" is the outcome the release wants.

---


## `ds-search`'s debounce cannot be cancelled by a host-owned Clear (from mm-broker, 2026-08-19)

- [ ] **[P2] `[debounce]` cancels an armed keystroke only when the host writes a DIFFERENT value, so
  a Clear button outside the control cannot always drop one.** The cancel path is
  `effect(() => { if (this.value() !== this.pushed) { this.cancel(); … } })`. That covers the case the
  0.10.0 note describes — "a host resetting the field mid-typing has to win" — but only when the reset
  changes the bound value. A list screen whose search term is not committed yet holds `''`: the user
  types `abc` (timer armed, `value` still `''`), presses the page's own Clear, the host writes `''`
  again, the signal does not change, no effect runs, and the keystroke lands ~300ms later on a screen
  that was just cleared. Consumer-side there is nothing left to try: `''` is the only empty value, two
  synchronous writes collapse, and a one-shot "swallow the next emit" flag mis-fires on the next real
  search.
  **Ask:** make the existing `clear()` public — it already does exactly the right three things
  (`text.set('')`, `cancel()`, `push('')`) — or add a public `cancel()`. `focus()` was made public for
  this same host-owned Clear button, and its docstring names the case: "a Clear button that disables
  itself on activation". The same button needs to be able to drop the timer it is clearing.
  mm-broker carries `TODO(ds-search-clear-cancel)` in `list-search.component.ts` until this lands.

---


## A widened type is a breaking change the manifest does not carry (from mm-broker, 2026-08-19)

---


## Component feature gaps

- [ ] **[P2] One entry point for the whole library means a consumer cannot keep the DS out of their initial bundle (2026-08-03, Stas — mm-broker MBP-133 review).** _(Re-counted 2026-08-05: **85** exported `*Component` classes plus 9 directives (re-counted 2026-08-10; was 83 + 8 on 08-05), by `grep -rho 'export class .*Component' src/lib | sort -u`. The item said 73; the figure does not change the argument, but it is now stated with its method so nobody re-counts.)_ `ng-package.json` declares a single `entryFile`, so the package ships as one 1.25 MB `fesm2022` module behind a single `"."` export. `sideEffects: false` is set and tree-shaking works fine — unused components are dropped — but **chunking cannot happen**: esbuild splits by module, so it can never place two DS symbols in two different chunks. Measured in mm-broker: the app's eager composition root binds `NotificationService` to a toast implementation, that one runtime import of `ToastService` pins the whole retained DS graph into a chunk statically imported by `main`, and the result is **632 kB — about 88% of a 720 kB initial bundle** — even though every feature route is lazy and the only eagerly-needed symbol is one service. The consumer has no lever: the root is the only specifier, and moving the provider to a lazy route does not help because interceptors and the `ErrorHandler` resolve from the root injector. **Ask:** secondary entry points (ng-packagr supports a nested `ng-package.json` per folder). Even a coarse split would fix it — a services/overlay entry point carrying `ToastService`, `ModalService` and `BodyScrollLockService` separately from the component layer, so an eager root can import the service and leave 70-odd components lazy. Per-component entry points would be ideal but are a bigger change; the services split is the one that unblocks consumers. **Explicit non-goal:** nothing about the public API surface needs to change — same symbols, same names, just reachable through narrower specifiers. **RE-AUDITED 2026-08-03 → read `packaging-chunking-audit.md` before actioning this item; three claims above are wrong.** The mechanism is confirmed by controlled esbuild fixtures, but: this was never filed upstream (it is the consumer's own backlog item, with a consumer-side fix); "the consumer has no lever" is false (a dynamic `import()` keeps `main` clean — it just costs tree-shaking, measured +50%); and the 07-27 "tree-shaking already works" verdict is NOT overturned — placement and tree-shaking are orthogonal and both findings stand. The audit also merges this item with the "Packaging — secondary entry points" section below, which duplicates it with the opposite verdict.

  **DECIDED 2026-08-05: option B from `packaging-chunking-audit.md` §7 — one services entry point, root `public-api.ts` kept as a facade.** It is the only option the fixtures measured as fixing chunk PLACEMENT without losing tree-shaking, and it is non-breaking: same symbols, same names, no cross-entry deep-import refactor across 73 folders. **Two things to get right when building it, both found while deciding:** (1) the entry point is NOT as narrow as its name — `ToastService` imports `ToastRegionComponent` and `ModalService` imports `ModalConfirmComponent`, so the entry necessarily carries those components and their own deps; that still fixes the reported problem, because the ~70 components the app touches only from lazy routes stop being pinned into `main`, but the eager cost is the toast+modal graph rather than three classes. (2) The secondary entry must OWN the source and the root must re-export FROM it — if both entries export the same source, a consumer importing from both gets two class identities and DI silently resolves two different services. **CORRECTED 2026-08-05, before anyone builds it: option B is NOT implementable as the audit describes it, and the audit is wrong on this point because it measured synthetic fixtures rather than the real import graph.** Followed the actual chain: `ToastService` → `ToastRegionComponent` → `ToastComponent` → `IconComponent` + `SpinnerComponent`; `ModalService` → `ModalConfirmComponent` → `ButtonComponent` + `ModalCardComponent` → `IconComponent`. So a services entry point must OWN button, icon, icons.data, spinner, toast and modal-card — and every other component needs those same leaves, so the ROOT would have to import them from the services entry. ng-packagr forbids cycles between entry points, so there is no arrangement where a small services entry sits beside an unchanged root. What that shape actually is: a LAYERED set of entries — `core` (icon, button, spinner, overlay primitives) ← `services` ← `components` — which is the audit's option D, described there as a separate large refactor, and it changes how every consumer imports. **So the live choice is A, C or D — not B. Described 2026-08-05 at Stas's request and DELIBERATELY LEFT OPEN: nothing here is urgent (no consumer is blocked, only sub-optimally chunked), and each option's cost lands somewhere different.**

- **A — do nothing.** Every feature route in the consumer is already lazy, so the DS chunk arrives with the first route rather than before it; what the 632 kB measurement really shows is that one eager `ToastService` import pulls the retained graph into `main` instead of into route 1. Cost: zero. What stays wrong: a cold first paint carries components the first screen does not use. Closing on A means recording that trade as accepted, since the numbers will resurface in the next consumer audit.
- **C — consumer-side dynamic `import()`.** The consumer's composition root imports the service lazily, which keeps `main` clean with no DS change at all. Measured to cost ~50% of the tree-shaking win (the dynamic specifier defeats static analysis, so more of the graph is retained). Also NOT ours to make: the fix lives in the consumer's repo, and per the scope rule this repo does not plan changes there — so choosing C means closing the DS item and letting the consumer decide.
- **D — layered entry points: `core` (icon, button, spinner, overlay primitives) ← `services` ← `components`.** The only shape that fixes chunk PLACEMENT without losing tree-shaking, and the only one that survives the real import graph: `ToastService → ToastRegionComponent → ToastComponent → IconComponent + SpinnerComponent` and `ModalService → ModalConfirmComponent → ButtonComponent + ModalCardComponent`, so a services entry must own those leaves, and every other component needs them too — which is why B (a narrow services entry beside an unchanged root) cannot exist: ng-packagr forbids entry-point cycles. Cost: ~40 files change imports inside the DS, the public specifier set grows from one to three, and every consumer's imports move (a codemod-able rename, but a breaking one needing a major). Benefit: an eager root can hold `ToastService` while ~70 components stay behind lazy routes.

**Two traps recorded while deciding, so they are not re-derived:** (1) the secondary entry must OWN its source and the root must re-export FROM it — if both export the same source a consumer importing from both gets two class identities and DI silently resolves two different services; (2) the audit's fixtures were synthetic, which is exactly how it concluded B was viable, so validate any future claim against the real import graph.


## `TableRowAction` cannot express a per-row menu, so `rowActions` is adopted nowhere (from mm-broker, 2026-08-18)

- [ ] **[P2] `ds-table`'s row-action column has shipped since 0.6.3 and mm-broker uses it in ZERO of its
  eleven row menus.** Not from ignorance — every one of those menus varies its ITEMS by row, and the item
  contract is `{ id, label, icon?, error?, disabled?(row) }`, which can only grey an item that is always
  there. Counted against the eleven menus, four things are missing and two of them are blocking:
  - **`hidden?: (row) => boolean` — blocks 8.** Items are swapped, not greyed: a draft campaign offers
    Edit + Launch, a live one offers Revert + Delete; a partner offers Deactivate **or** Reactivate,
    never both. Expressed with `disabled` alone, every screen grows a permanently grey half — which is
    the dead control their ARCHITECTURE §7 forbids outright, so this is not a style preference. Two
    screens additionally render no trigger at all for a row with no applicable actions, so "every item
    hidden" has to collapse the kebab rather than open an empty menu.
  - **`disabledReason?: string | (row) => string` — blocks 4.** Where an item IS greyed they say why
    (`viewBlockedReason`, `resendBlockedReason`, `deactivateBlockedReason`, "this licence is
    registry-verified"). Today each screen renders that sentence itself inside its own menu. A greyed
    item with no reason is the same §7 failure as a dead button, so shipping `hidden` without this just
    moves the problem.
  - **`label: string | (row) => string` — blocks 4.** One action, two wordings: Deactivate/Reactivate,
    Activate/Deactivate, Add fee/Edit fee. Workable as two ids each with its own `hidden`, so this is
    the cheapest of the four to decline.
  - **a divider or `group` — blocks 2.** Two menus separate the destructive tail with `ds-menu-divider`.
    Droppable by ordering if the DS would rather not take it.

  - [x] **DONE 2026-08-18 — a token on the kebab itself.** Three resolvers, covering the column
    picker too since it shares the rule: `--ds-table-icon-btn-color`,
    `--ds-table-icon-btn-color-hover`, `--ds-table-icon-btn-focus-color`, each defaulting to what
    was hardcoded. mm-broker's teal row menu is now expressible without repainting
    `--icon-default` app-wide. ORIGINAL NOTE: a token on the kebab itself — `.row-actions-btn`
    hardcodes `color: var(--icon-default)`, hover `var(--icon-strong)` and an `--accent` focus outline,
    with no `--ds-table-row-action-*` to override, and it is not a `ds-icon-button` so the icon-button
    properties do not reach it. mm-broker's design asks for a teal row menu and four of their screens
    already do that to their own trigger; on migrating, those four would silently turn grey with no
    supported way back short of repainting `--icon-default` globally. Either expose the property or
    tell consumers the kebab is not themeable, so they can settle the question before migrating —
    right now "adopt rowActions" and "keep the design's teal" are simply incompatible.

  **What it buys, and why it is worth a P2 rather than a papercut:** eleven hand-rolled
  `button` + `ds-popover` + `ds-menu` blocks disappear, and with them seven bespoke triggers that
  re-implement `ds-icon-button` under three different class names (`action-button`, `action-btn`,
  `row-actions`) plus their per-page CSS. The feature already exists; only the item contract keeps every
  consumer writing the menu by hand. Until `hidden` and `disabledReason` land, migrating any screen is a
  visible regression rather than a refactor, so none will move.

- [ ] **[P3] `ds-table` — row-expansion parity polish vs PrimeNG (ref https://primeng.dev/table#row-expansion).** Base row expansion ALREADY SHIPS — `expandableRows` + two-way `expandedIds` `model<Set<string>>` (multiple + programmatic), `rowExpandTemplate`, expander button/chevron/`expandedColspan`, docs demo (`table.section.html:574-600`). So this is **deltas only, not a build**: (a) optional **single-expand mode** (only one row open at a time — today it's always multi via the Set); (b) **expand-all / collapse-all** header toggle (the header expand-col is currently just a spacer); (c) optional dedicated `(rowExpand)`/`(rowCollapse)` outputs (the `expandedIds` model already covers change-tracking, so this is sugar). All small; do only on a consumer ask — the core feature is at parity.

- [ ] **[P3] `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber.** Today it's a raw `value: number` + `min`/`max`/`step` + spinner, no display formatting. PrimeNG InputNumber's value-add is a formatted numeric field: thousands grouping, fixed decimals, currency/percent, locale-aware, parsed back to a number on edit. Add opt-in `mode` (decimal/currency/percent) + `locale`/`currency`/`minFractionDigits`/`maxFractionDigits`/`useGrouping`; format on display/blur, parse on focus/input. Masking prior art in-house: [[reference-masked-input-dom-writeback]] (pinkmoon phone/w3w imperative `element.value` write-back). No active request — likely pulled by the financial-admin consumers (mm-broker admin, pinkmoon amounts/rates/%); gate on the first such form.


## Component API / portfolio

## Validation on the control: warning got a border, but the FILL was never judged (2026-08-13)

- [ ] **[P2] Should `state` DEFAULT a per-state glyph? (narrowed 2026-08-20 — the false docblocks are fixed, the design question is not.)** The two lies are gone: `state` now says it decides the colour, and `icon` says there is no per-state default. What remains is the call the original item wrapped around them. **The case for defaulting a glyph:** four of the six systems audited for the fill question carry a per-state icon in the field — Spectrum, Bootstrap, Carbon and Ant — NN/g requires it as its own guideline, WCAG 1.4.1 forbids resting a state on colour, and the ui-ux-pro-max base says it twice (`color-not-only`, `color-not-decorative-only`). It is also what would give `warning` and `success` real distinctness without the fill we declined to add. **The cost:** breaking by appearance on every field at once, and a glyph choice per state. ORIGINAL: [P2] `ds-field-message` claims `state` picks an icon, and it never does — two false doc
  comments over a real gap.** `state`'s docblock says "Decides colour and icon" and `icon`'s says
  "Overrides the glyph the `state` would pick" (`field-message.component.ts:26,31`). Neither is true:
  the template renders `@if (icon())` against an input defaulting to `null`, and there is no computed
  anywhere in the component, so **`state` decides colour only** and a glyph has to be passed by hand
  on every field. Found while closing the fill question above.
  **Why it matters beyond the wrong comment:** a per-state icon is what four of the six systems use to
  separate the states — Spectrum, Bootstrap, Carbon and Ant all carry one in the field. NN/g requires
  it as its own guideline, WCAG 1.4.1 (Use of Color) forbids resting a state on colour, and the
  ui-ux-pro-max base says it twice: `color-not-only` ("Don't convey info by color alone (add
  icon/text)") and `color-not-decorative-only` ("Functional color (error red, success green) must
  include icon/text"). It is also the treatment that would give `warning` and `success` real
  distinctness without any fill, which is exactly what the decision above declines to add.
  **Decide two things:** whether `state` should default a glyph per state (breaking — every field
  gains an icon it does not have today), and if so which glyphs. Fix the two comments either way,
  since they are wrong right now.

# Decisions — waiting on Stas, not on work

Nothing moves until a verdict; the work behind each is scoped.

## Priority board (2026-08-20 actualization — supersedes the 08-10 one below)

**41 open: 2 P1, 18 P2, 21 P3 — and the shape matters more than the count.** Fifteen sit under
*Decisions*, which means no work is blocked on me; eight are *Parked* awaiting a first consumer ask.
So the live queue is **eight bugs and eleven asks**, and of those asks only ONE is still a consumer
waiting on us.

**Consumer asks: one open.** `MBP-133` — a single entry point means a consumer cannot keep the DS out
of its initial bundle. It needs the packaging decision, not code. Everything else mm-broker raised is
closed: `MBP-134` twice (the menu corner clip, the menu-item description), `MBP-146` (`onRowKey` —
already shipped in `v0.10.0`, they need the upgrade), the table kebab tokens, `ds-list-item`, the
date-picker's sticky own-error, and the four identical overrides.

**Both P1s are accessibility or contract failures, and the focus-ring one is the worse of the two.**
An `overflow: hidden` ancestor clips the universal ring away entirely, leaving an element focusable
with NO indicator — measured in four places in one consumer, one of them a `ds-button` losing its own
ring inside a wrapper. Clipping a card to keep a full-bleed child inside a rounded corner is normal,
and `ds-card` + `padding: none` invites exactly that, so this reproduces on our own component. The
second P1 is a migration path that does not compile: the resolved-size signals are `protected`, so
the guidance we published cannot be followed.

**Where the risk actually is — five breaking changes are queued unreleased**: the borderless disabled
label recipe, `success` as a string, `invalid` no longer recolouring the hint, `DsFieldBase` for
subclassers, and the reserved `warning` kind. Plus the sidenav active state and `maxVisibleChips`.
mm-broker is on **0.9.1**, two releases behind, so every addition here makes the single migration
they must swallow larger. **The release cut is the highest-leverage decision on this board**, ahead of
any individual item.

**Two themes recur across what was closed this week, worth reading before opening anything new.**
A number measured in ONE theme was carried into the other unchecked — three times, all wrong. And a
comment or docblock outlived the code it described — four times, every one caught by screening rather
than reading.

## Priority board (2026-08-10 actualization)

**23 open — 9 P2 and 14 P3 — but the count flatters the board.** **Twelve are parked**: ten P3s waiting on a first consumer ask (splitter, CascadeSelect, lightbox, CDK Menu, `ds-select` native multi, stepper formatting, row-expansion deltas, primary-CTA, MED, inspect mode) and two kept deliberately as decision records not to be "simplified" (`role="banner"`, the duplicated `compact` condition). **A P2 — shared picker internals — is open against its own recommendation**, which is not to build it until a fourth list picker appears.

**So the live board is six decisions and one piece of work.** _(0.9.0 was CUT on 2026-08-10 — the P1 that everything queued behind is done, and the release chain ran clean: publish to npmjs, docs deployed.)_ The decisions: **Angular 22**, whose peer range we currently exclude and which should be settled before the next cut · **packaging A/C/D** · **the breaking batch**, decided as one story · **the four identical consumer overrides**, which are evidence about our defaults · **verdicts B1–B5** plus a colour space, for the interlocked token trio · **the LOOK** for `dirty` / `pending` / `disabledReasons`. The work: the `ds-modal` status widening (breaking, so it rides the batch) — width-based overflow shipped as an opt-in on 2026-08-11, leaving only its default flip, which is already a member of the batch. _(Composition rules closed 2026-08-10: all three rule gaps written and rendered at `Practice → Composition rules` from the same file the package ships.)_

**Cleared 2026-08-06, after the agent-portal audit + Misha's review:** all four P2 items from the audit (table head padding — which also turned up `density="compact"` defeating every padding hook — the table pager inputs, the four autocomplete search gaps, the autocomplete panel radius), plus `ds-search` on the field-height contract. Two docs-site defects Misha found are fixed as well: `/changelog` served from a one-year `immutable` cache on a stable-name file, and sidebar anchors needing a second click — `onItem` scrolled, then the `routerLink`'s path change made `ds-app-layout` reset the scroll and undo it; the links now carry `dsSamePage`. (My first diagnosis blamed a lazy-load race and was WRONG: measurement showed the sections are always mounted by then, and the live site reproduced the real cause instead — first click 0px, second 15145px.) `sortMode`/`filterMode` now default to `'server'` (Stas 2026-08-06, breaking, migration written).

**Consistency sweep the same day, unasked-for but adjacent:** one `dropdownOverlay()` replaced six byte-identical overlay configs, and six more controls joined the field-height contract — there are now no raw `--hit-cozy` heights left in the library.

**RELEASE GATE, recorded 2026-08-07 — read before adding anything breaking.** `dev` carries **8 actionable migrations** on top of 0.8.0 (three from the auth-layout rename, ds-search height, the removed --search-h, the sortMode/filterMode default, number-stepper lg, and the ds-tabs urlParam pass). On this repo policy that is **0.9.0**, and it is sitting uncut. mm-broker is still on **0.7.1** and the 08-07 audit found they had not adopted hooks from releases they already have — so every further breaking change added here makes the one migration they must swallow larger and adoption less likely. **Cut 0.9.0 with what it has; hold the next breaking batch for the release after.** That single decision sequences most of the board: the modal status widening (error: boolean -> DsStatus) and the four candidate DEFAULT changes below both want the same later major, and so does packaging option D, since it changes how every consumer imports. Additive work is not gated by any of it, and a fair amount has shipped under that reading since — the `ds-stat` value slot, the modal padding tokens, `[dividers]`, the modal title badge and subtitle, breadcrumbs `maxItems`, `maxVisibleChips`, and the `design-system.md`/`components.md` split.

**A consumer is now waiting on the cut, which is new (2026-08-10, from mm-broker).** "Start converting" cannot start on **0.7.1**: verified on their own stack, `ds-select` and `ds-date-picker` bind under `[formField]` and compile, but **`ds-input` does not** — three template type errors per input, `number | undefined` against `number | null` on `min`/`max`/`maxLength`, which is exactly what `fc1714d5` fixes. `ds-input` is in nearly all twenty of their forms, so the migration is gated on a release carrying that commit, not on anything they can do. This does not argue for cutting *early* or for a backport — only that the cut now unblocks work rather than merely tidying `dev`, which is a different weight than it had on 08-07.

_Closed 2026-08-07 from a consumer report: `ds-autocomplete` had no chip cap, so a multi-select trigger grew a line per selection. `maxVisibleChips` ported from `ds-multi-select` under the same name. Checked the rest of the library — only those two components render a chip list, so nothing else needed it; the pinkmoon prototype the reporter half-remembered is the filter-bar "+N more", which is already `ds-filter-bar`._

**P1 — real defects:**

- [ ] **[P2] `variant="tonal"` has NO disabled signal in the dark theme — measured in the browser 2026-08-20, and it invalidates the reason tonal was excluded from the surface-mix fix.** Live on `/components/button` with `<html data-theme="dark">`: label enabled `#778FF8` → disabled `#979EB5`, gap **1.11:1**; fill enabled `#28325D` → disabled `#21273D`, gap **1.20:1**. Both axes are dead, so a disabled tonal button in dark is indistinguishable from an enabled one — the exact defect just fixed for ghost/text/outline.
  **The excluded-because rationale was wrong, and it was mine.** Tonal was kept on the shared fixed-lightness recipe on the grounds that "its disabled fill already carries the state on its own". That figure (4.32:1 fill movement) was measured in the LIGHT theme and carried into dark without re-measuring. In dark the fill moves 1.20:1, which is nothing. Recorded in the CHANGELOG entry too, which needs correcting when this is decided.
  **`solid` is NOT affected:** its disabled fill measures `#2E54FF` → `#DBE5F9`, a 4.33:1 move, because the recipe's L 92% is a near-white regardless of theme. Worth its own look though — a disabled solid button is a bright pale-blue pill on a dark page, identical in both themes.
  **The fix is the one already shipped elsewhere:** `color-mix(in srgb, var(--_button-label-color) 40%, var(--surface-default))` on `.v-tonal`. Needs Stas, because excluding tonal was his decision taken on my wrong claim.
- [ ] **[P2] `variant="tonal"` disabled rests on DESATURATION alone in the dark theme — no luminance change on either axis (browser-measured 2026-08-20).** Live on `/components/button` with `<html data-theme="dark">`: label enabled `#778FF8` → disabled `#979EB5`, gap **1.11:1**; fill enabled `#28325D` → disabled `#21273D`, gap **1.20:1**.
  **Checked against the screen before writing this, and the first draft said "no signal at all" — that was too strong.** Side-by-side with the Disabled toggle off, the state DOES read: the enabled labels are vivid (blue / orange / violet) and the disabled ones wash out to grey. The difference is almost entirely chroma, which the eye picks up at equal luminance. So this is not invisible — it is the "colour alone" case, weaker than the ghost/outline treatment now beside it.
  **What IS wrong is the reason tonal was excluded, and that was mine.** Tonal stayed on the shared fixed-lightness recipe because "its disabled fill already carries the state on its own" — a claim resting on a 4.32:1 fill movement measured in the LIGHT theme and carried into dark unchecked. In dark the fill moves 1.20:1. The CHANGELOG entry repeats that claim and needs correcting whichever way this goes.
  **`solid` is NOT affected:** its disabled fill measures `#2E54FF` → `#DBE5F9`, a 4.33:1 move, because the recipe's L 92% is near-white in any theme. Its own oddity, worth a separate look: a disabled solid is a bright pale-blue pill on a dark page, identical in both themes.
  **If it should change, the fix is the one already shipped elsewhere:** `color-mix(in srgb, var(--_button-label-color) 40%, var(--surface-default))` on `.v-tonal`. Needs Stas — he chose the grey-vs-mix question once already, on the light theme, and preferred the tinted mix.

- [ ] **[P3] Two components a consumer cannot import appear in the docs API reference (found by the 2026-08-20 docs audit).** `ds-modal-confirm` (ModalConfirmComponent) and `ds-time-columns` (TimeColumnsComponent) are listed in `component-api.generated.ts` with a full input table, so the reference presents them as usable API. Verified against the published types: both appear as internal `declare` blocks but neither is in the package export list, so `import { ModalConfirmComponent }` does not resolve. `tools/extract-component-api.mjs` collects every `@Component` under `src/lib/components` without consulting the export surface.
  **Two fixes, pick one:** (a) teach the extractor to skip a class absent from the public export list — accurate, but it must follow the component barrels or it will drop legitimately-exported components; (b) add an `internal` value to `ComponentStatus` (today `'stable' | 'new' | 'deprecated'`) and mark these two in `component-api-descriptions.json`, which also gives a home for the next internal. Neither is urgent: nothing is wrong, the reference is just wider than the API.

- [ ] **[P3] `ds-table`'s two-way `[(sortKey)]` / `[(sortDir)]` form is available but never demonstrated (same audit).** `sortKey`/`sortDir` are inputs and `sortKeyChange`/`sortDirChange` are hand-declared outputs, so Angular's banana-in-a-box works — which is the natural shape for server-side sorting where the host owns the state, exactly what the 0.10.0 server-sort demo is about. The demo binds `[sortKey]` one-way and observes `(sortChange)` instead, so the two-way form is invisible. One line of prose or switching that demo would cover it.

- [ ] **[P2] `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in, or say they are not fields (Stas asked 2026-08-20).** Audited, and they are not "fields missing a feature" — they never had the wrapper. **`ds-number-stepper`** exposes `value`, `min`, `max`, `step`, `size`, `disabled`, `ariaLabel` and nothing else; **`ds-dropzone`** exposes `accept`, `multiple`, `files`, `disabled`, `single` plus two outputs. Neither has `label`, `hint`, `error`, a `ds-field-message`, `resolveFieldMessage`, or the `field-label` mixin — verified by grep, all zero. Every other one of the fourteen fields has all of it.
  **So this is a feature addition, not a unification**, and that is why it is a decision rather than work: both would gain `label`, `hint`, `error`, `errors`, `invalid`, `touched`, `reserveMessage` (now one `extends DsFieldBase`), a message row, and the label/required/optional block.
  **The case for doing it:** in a real form both want it. A numeric stepper needs a label and a validation error like any input; a dropzone needs a hint ("up to 5 MB, PDF only") and an error ("that file was rejected"). A consumer today has to hand-roll a label and an error line beside them, which is exactly the inconsistency this board exists to remove.
  **The case against:** neither has been asked for by a consumer, and `ds-number-stepper` may be intended as a bare control composed inside something else — though its own `ariaLabel` and `size` inputs suggest standalone use.
  **Cheap now that the base exists:** `extends DsFieldBase` plus a `resolveFieldMessage` call, a `ds-field-message` in the template, and the label block — the same shape all fourteen already share.

- [ ] **[P3] Four controls compute no `controlState`, so a validation state cannot reach the control itself — only its message.** `ds-checkbox`, `ds-radio`, `ds-radio-group`, `ds-slider` and `ds-switch` are the five of fourteen that do not bind `[attr.data-field-state]`, and they do not read `controlState` at all (grep: zero occurrences in each). The other nine do, and the shared `field-state` mixin paints them.
  **Partly correct by design** — they have no bordered box for a border to appear on, which is also why they deliberately did not get `[success]`. **But they are not shapeless:** a checkbox has a square with a border, a switch has a track, a radio has a ring. Today none of those can carry error, warning or success, so on a checkbox the only sign of an invalid state is the red line underneath.
  **Decide whether the box-less controls should paint their own indicator** for error/warning (and then whether `[success]` follows). If yes, it is a `field-state`-style mixin per control shape rather than a reuse of the bordered-box one, since the target is a 16px square rather than a 39px field.

- [ ] **[P2] The breaking batch after 0.9.0 — decide it as ONE story, because it is four surprises otherwise (filed as an item 2026-08-10; it was prose in three places).** Each member is recorded in its own item; what is missing is the decision to ship them together. **Members:** (a) `ds-modal` `error: boolean` → `status: DsStatus`, so a warning or info dialog becomes expressible at all; (b) the width-based overflow DEFAULT flip for chip rows; (c) the four DEFAULT changes below that two consumers reached for independently; (d) packaging option D, if that is the packaging answer, since it moves every consumer's imports.
  **DECIDED 2026-08-12 in a deck (`presentations/breaking-batch.html`, built against real tokens): the batch is THREE members, and two of them are settled.**
  **(d) packaging leaves the batch entirely.** The member was conditional — "option D, IF that is the packaging answer" — and it is not: option **B** was decided 2026-08-05 (one services entry point, root `public-api.ts` as a facade), and B is ADDITIVE. Nothing a consumer imports today stops working, so it is not a breaking change and does not belong here.
  **(a) `ds-modal` — SHIPPED 2026-08-12. `error: boolean` → `status: DsStatus`, and the treatment came out richer than the deck proposed.** Stas picked the tint over an accent stripe for the reason the deck put beside it: the DS has no stripe idiom anywhere, while `ds-alert` already expresses status as a tinted surface, so a status dialog and a status alert on one screen paint from the same family and cannot disagree. Both boolean forms have an exact replacement — `[error]="true"` → `status="error"`, `[error]="isDangerous"` → `[status]="isDangerous ? 'error' : null"` — and unset stays neutral, so a screen that never used `error` sees nothing. `ds-modal-card` takes the same input, since a `ModalService` confirm renders one directly.
  **(b) chip overflow — SHIPPED 2026-08-12, the default is now `"fit"`.** All three modes stay: `null` shows every chip uncut, a NUMBER caps at exactly that many, `"fit"` measures. Only the default moves, and the escape is one word.
  **What (a) actually shipped, because the UX research moved it.** The deck offered "a tinted header"; the skill's own rule — do not convey information by colour alone, severity High — plus `ds-alert`'s JSDoc ("severity drives colour, the DEFAULT ICON and the ARIA role") said a tint alone is half a treatment. So `status` drives four things, matching the alert: icon-badge tint, title colour, a default icon (`error`/`warn`/`success`/`info`, overridable by `icon`), and the ARIA role — `error`/`warning` make the dialog an `alertdialog`, an explicit `dialogRole` still winning. The deck was also wrong about the starting point: the DS already tinted the icon BADGE for `error`, not merely "one word of colour" — that pair is now generalised to all four statuses from the same families the alert reads. Caught one self-inflicted regression on the way: dropping the confirm dialog's explicit `dialogRole="alertdialog"` would have demoted a non-error confirm to a plain `dialog`, and every confirm is an interruption.
  **(c) the four defaults — NOT DECIDED, and deliberately so (Stas 2026-08-12): "изучи ещё раз все проекты которые использовали ds, подумай над архитектурными и дизайн правилами — можем ли мы сделать то или иное действие, будет ли это правильно для дизайн-системы".** The evidence so far is "two teams did the same thing", which is a signal but not an argument: it says our default lost twice, not that the proposed value is right for a LIBRARY. The research owed before this can be answered is in its own item below.
  **Why together:** (a), (b) and (c) are all "what does a component do out of the box", and a consumer who takes them one release at a time is surprised three times by the same class of change. One migration guide can carry the lot with one decision rule per member.

- [ ] **[P2] Width-based overflow as the DEFAULT for anything that lists items in a row (Stas 2026-08-07).** `maxVisibleChips` (shipped 08-07 on autocomplete, older on multi-select) is a guess about width expressed as a count: pick 3 and it still overflows on a narrow column, or wastes room on a wide one. The proposal is to cap by MEASURED width instead, on by default, with an explicit input to opt back into unbounded growth.
  **THE OPT-IN SHIPPED 2026-08-11 as `maxVisibleChips="fit"`** on both chip pickers, so only Fork 2 — the default — is still open, and it stays in the breaking batch. Shared primitive: `src/lib/components/chip-overflow.ts`.
  **Fork 1 RESOLVED — the flash was a property of the ROW, not of the timing.** Filter-bar reads each item's DECLARED width off `dsFilterItem` and its comment says measuring rendered items would make anything that did not fit FLASH first. That is true while the row WRAPS, because a wrapped row changes height; a `nowrap` row with `overflow: hidden` CLIPS instead, and clipping moves nothing, so the chips can simply be rendered and measured. None of the three options considered (render hidden, accept a frame, measure a text metric) was needed.
  **What actually cost the time, and the rule that came out of it — a measurement must not read anything the cut itself changes.** Two self-referential loops, both found by a real browser rather than by reading: (a) sizing "available" from the chip row's own width, which is content-sized, so every dropped chip shrank the budget and dropped the next one, down to one chip — the space is now taken from the TRIGGER minus its other children, where a child that can grow owes only its floor; (b) measuring the rendered "+N more", whose text IS the count, so "+2 more" and "+3 more" alternated forever — a fixed `5em` reserve replaced it. The second froze a page hard enough to kill the renderer.
  **Cost is gated on the mode.** Measuring forces layout, and an ungated version ran **214 times on one docs page load** across seven pickers that were all on the wrapping default. `enabled` plus a same-geometry guard took that to **1**. A picker that does not ask for `"fit"` does no work.
  **Fork 2 — the default, which is the actual decision and is unchanged by the above.** On-by-default is a visual change for every consumer relying on today's growth, so by the opt-in rule and the RELEASE GATE it belongs in the breaking batch queued after 0.9.0. It should be decided alongside the modal status widening and the four candidate default changes — all of them are "what does a component do out of the box", and they should ship as one story rather than three surprises.
  **Not verified here: the resize path in a visible window.** The `ResizeObserver` could not be exercised through the automated browser — its window stayed `visibilityState: "hidden"`, where Chrome runs no rendering steps and a plain hand-attached observer did not fire either, so this is environmental rather than a defect. The selection-change path (which goes through Angular's scheduler) was verified end to end, as was the arithmetic against real measured chip widths. Drag the handle on either docs demo to confirm.
  **Scope, measured 2026-08-07 rather than assumed.** Chips: `ds-autocomplete` and `ds-multi-select` (both wrap and grow today). **Values, not chips: `ds-breadcrumbs` — COUNT-BASED COLLAPSING SHIPPED 2026-08-07 as `maxItems`** (opt-in; the width-based mode still waits on Fork 1, and the docs had been FAKING this collapse with a hardcoded `{ label: "…" }` item, now deleted). It was the real gap: `flex-wrap: nowrap` with `overflow: hidden` and no collapsing at all, so a long trail was simply clipped where the conventional answer is `Home / … / Current` — and having an established idiom is why it could ship first and on its own. NOT in scope: `ds-tabs` already scrolls (`overflow-x: auto`), which is the right answer for a tab strip, and `ds-button-group` / `ds-segmented` hold small fixed sets by design.

**P2 — build work, nothing left to decide:** _(none — the last one here, shared picker internals, was surveyed 08-05 and its own conclusion is NOT to build it yet; it is listed under "parked" below and kept open only so the survey is not repeated.)_

_Archived to `done.md` on 08-06: the whole mm-broker `ids-data-table` section (nine criteria + the date-picker defect) and five closures from other sections — the ai-sdlc starter's two asks, autocomplete single-select, the rounded `:active` review and the `ds-tabs`↔URL input._

_**P2 — from the mm-ecm agent-portal audit (08-06): ALL FOUR SHIPPED that same day and are archived** — table head padding per-side, `showPageSize`/`showLabel` forwarded through the table's pager, the four `ds-autocomplete` search gaps (prefix/suffix slots, `[showChevron]`, `clear()`, panel max-height), and the autocomplete panel joining the radius role layer. The `fullWidth` one turned out to be MOSTLY FALSE — it already existed on both pickers; the real defect underneath was hard-coded trigger padding that drifted 8px under `[data-density]`, and that is fixed too. (This block listed them as open until 2026-08-10.)_

_mm-broker's whole-consumer sweep (08-06) is CLEARED: `--ds-badge-white-space`, `ds-card`'s box filling a stretched host, and `ds-search` on the field-height contract all shipped the same day. Their last two reaches into DS internals are gone._

**P3 — from the agent-portal audit (08-06):** FOUR of the five SHIPPED 2026-08-06 — eyebrow tokens on `ds-description-item`, the shorthand sweep across `segmented`/`tabs`/`menu`/`checkbox` (21 hooks), the radius **and elevation** roles now reaching portaled panes, and `[quiet]` on `ds-menu-item`. The fifth — selected-option hooks instead of theme-role hijacking — is deliberately left, sequenced after the colour engine since it is the same principle one layer down.

**P2 — genuinely waiting on Stas:**

- **Packaging / secondary entry points** — options A / C / D described in the item 08-05; option B was proven unbuildable.
- _(`design-system.md` RESOLVED 2026-08-07 — split into `components.md` (catalogue) + `design-system.md` (rules), both shipped in the package. What remains is filling the rules out: see the composition-rules item.)_

**P2 — token architecture (interlocked, spec together):**

- Single-source colour engine · `.ds-interactive` contract · theme-recipe-vs-hand-tuned. (**Rounded `:active`** no longer belongs here — 11 of 13 controls shipped it on 2026-07-02; the two pickers left are a P3.) The radius, elevation and `--ds-motion-*` role layers shipped 08-04 and are the pattern the rest should follow.

**P3 — parked, each with its scope written down:**

- **Asked and answered 2026-08-05, keep in the backlog:** inspect-mode pilot · splitter · CascadeSelect · primary-CTA token · MED cluster.
- **Build on the first consumer ask:** `ds-select` native `multi` · `ds-table` row-expansion deltas · `ds-number-stepper` numeric formatting · image/lightbox · CDK Menu.
- **Decision records, deliberately kept and NOT to be "simplified":** topbar `role="banner"` · `compact` re-evaluated in TS.
- **Surveyed and deliberately not built:** shared picker internals — three components share ~25 lines each, against a ~30-line helper. Revisit when a fourth list picker appears.

---


## Architecture / tokens

> **Token-architecture pass (P2, interlocked).** The three items below + the semantic radius+elevation role layer (under "Missing tokens / foundations") share ONE principle — a **role layer between foundation and component**, single pointer, shades cascade. Spec them together; sequence the single-source colour model first and the rest fall out. Don't action piecemeal. _(The typography `.t-*` `--ds-t-*` hooks — the same consumer-first contract at the global utility layer — already SHIPPED 2026-07-24, see done.md.)_

- [ ] **[P2] Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24).** ROOT CAUSE (surfaced when a consumer scoped `--primary-h/s/l` on a checkbox and ONLY the focus halo moved): "primary" has TWO decoupled reps — (a) `--primary` + hand-picked ramp shades read by component FILLS; (b) `--primary-h/s/l` HSL channels feeding ONLY math-derived halos/ramp/gray-tint — with **no live link**, so a coherent scoped recolour needs BOTH the channels AND a `--primary` re-composition (the 3-/4-token footgun). **Re-verified true 2026-07-24** (`_semantic.scss:91-93` channels; `:111-112` hover/pressed already `color-mix`; halos `:209-229`; gray tint `_base-palette.scss:41`). **IDEA:** one colour token per role as the only source; shades via `color-mix()`, hue via `hsl(from var(--primary) h <S> <L>)` keeping each step's hand-tuned S/L (see [[feedback-handtuned-colors-beat-formulas]] — only the HUE is single-sourced); drop `--primary-h/s/l` as PUBLIC API. Scoped recolour becomes ONE declaration; **UNBLOCKS the `ds-color`/`--accent-*` indirection**. **OPEN for the spec:** (a) colour space (`oklch`/`oklab` perceptual vs `srgb`/`hsl` matches today) — verify each derived role visually; (b) pure-derived vs hand-pick per role; (c) relative-colour + `var()` edge cases in the 3 target engines; (d) dark-theme interplay. Prototype: `presentations/color-engine-relative.html`.

- [ ] **[P2] `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]]).** Replace per-component `--ds-*-bg-hover/-active` + scattered `color-mix()` with ONE contract: a `.ds-interactive` class + presets driven by `--state-step-*` tokens in a NEW `src/lib/styles/_interaction.scss` (**still absent — verified 2026-07-24**), with an override slot (`--interactive-*-set`). Then migrate interactive components off their local recipes. **NEXT — blocking user verdicts B1–B5** (live demo `presentations/interaction-formula.html`): (B1) tint-pressed 28% vs 34%; (B2) pressed step for neutral surfaces (menu-item/table rows); (B3) danger menu-item hover — formula vs `--error-subtitle`; (B4) shape of the `--interactive-*-set` slot; (B5) pressed step for success/warning buttons. **Rewritten 2026-07-24:** the old "retire `_forced-states` duplication" clause is now MOOT — `_forced-states.scss` no longer exists (docs state-forcing is per-section `:host ::ng-deep .pin-*` reading each component's `--_*` resolvers). What survives is the broader "should presentational/state styling live in global partials (like `_link.scss`) with components as thin sugar" question. (Housekeeping DONE — re-grepped 2026-08-10, the stale `_forced-states` refs are gone from `README.md` and `table.component.scss`; nothing outside `.claude/` mentions it.)

- [ ] **[P2] Theme recipe vs hand-tuned picks — alignment decision.** Button/icon-button state derivation uses the theme's 88%/76% mix-to-black recipe (**verified `button.component.scss:34-38`, `_semantic.scss:111-112`, 2026-07-24**). If the single-source-colour calibration replaces `--primary-hover/-pressed` with hand-tuned values, the button defaults (color-mix off the resolved bg) diverge from the theme roles — decide then: components read role tokens again, or theme keeps the formula. **This is a concrete instance of the single-source item's open question (b); resolve it inside that spec, not separately.**


## Component API / portfolio

- [ ] **[P2] Shared picker internals — SURVEYED 2026-08-05, and the premise is wrong: it is THREE components, not six, and the duplicated surface is ~25 lines each.** Measured: only `ds-select`, `ds-multi-select` and `ds-autocomplete` share the shape (an `activeIndex` signal + wrap-around arrow nav over a flat option list). `ds-date-picker` navigates a 2-D day grid, `ds-time-picker` has NO arrow handling at all (it delegates to `ds-time-columns`), and `ds-color-picker`’s arrows drive a continuous saturation/hue canvas — three different models that a shared list helper would not serve. **Type-ahead does not exist anywhere** (zero hits), so that part of the ask describes code that was never written. And the three that DO overlap differ where it matters: select carries groups + Home/End + `firstEnabledIndex()` skipping disabled, multi-select works over a filtered list with a select-all row, autocomplete counts a create/no-match slot into its modulo. **Recommendation: extract only the index cursor** — a ~30-line `createListCursor({ length, isEnabled })` returning `{ index, next, prev, first, last, reset }` — and NOT a picker base class. **Worth doing when a fourth list picker appears, not before:** 3 × 25 lines against a 30-line helper is a wash today, and the wrong shared abstraction here costs more than the duplication.


## ds-app-layout (SHIPPED 2026-07-24) — post-merge polish

> **Parent DONE** — `ds-app-layout` (shipped as `ds-app-shell`, renamed in 0.7.0) + `ds-sidenav-footer` + `ds-sidenav` brand row (`logoLetter` + `[dsBrandName]` projection) all merged to main (branch `feat/app-shell`, final review clean). Spec: `.claude/superpowers/specs/2026-07-24-ds-app-shell-design.md`. Kept on the board only for the open polish children below. Consumer migrations (ai-sdlc → mm-admin → pinkmoon) are post-release follow-ups.

- [ ] **[P2] Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking changes lands exactly there.** This repo builds on **21.2.17** (`v21-lts` is 21.2.19) and declares `"^21.2.0"` for all six Angular peers, which resolves `>=21.2.0 <22.0.0` — so **a consumer on Angular 22 cannot install this package without `--legacy-peer-deps`**. Angular 22 has been out since **2026-06-03**; `@angular/core` and `@angular/forms` are at **22.1.1** as of 2026-08-07 (checked against the registry, not assumed).
  **Why this is not just a version bump.** (1) **Signal Forms went STABLE in 22.0.0** — it left `@experimental` two months ago, which retires the "wait for it to stabilise" reasoning that shaped the original item. (2) The 22.0.0 changelog carries a signal-forms breaking change — `min`/`max` rules no longer accept string values, numbers or `null` only — and the fix shipped today (`fc1714d5`) touches exactly `min`/`max`, so it wants re-testing on 22 rather than assuming it carries. (3) 22.0.0 also added `ngNoCva`, an opt-out from `ControlValueAccessor` interop; every DS control provides a CVA **and** satisfies `FormValueControl`, so it is worth checking which path Angular 22 actually picks for our controls and whether the two ever race. There was a real bug of this shape in the 22 line (`angular/angular#67847`, CVA `writeValue` called back after `onChange`, infinite loop — fixed).
  **RE-VERIFY ON 22, specifically:** the whole Practice → Signal Forms page against 22 · `min`/`max`/`maxLength` write-type widening · the `readonly` alias · `hidden` on both CVA bases · whether `ngNoCva` should be set anywhere · whether the `touched` mechanism changed (one third-party source reports a v21 `touchedChange` → v22 `touch` output rename; NOT confirmed against the official changelog, so confirm it before relying on either).
  **The decision is the peer range, and it should be made BEFORE 0.9.0 is cut**, since that is what the release publishes: widen to `^21.2.0 || ^22.0.0` (cheap, but claims a compatibility nobody has tested) or move the repo to 22 (honest, costs a real upgrade pass). **Context for the call:** Angular Material has NOT shipped signal-forms support (`angular/components#32072` still open), PrimeNG deliberately waited for stable and is repairing `[formField]` typing in 22.0.1, and Spartan has shipped it — so on this axis the DS is currently ahead of both libraries its consumers compare it to, and that lead is worth keeping installable.

- [ ] **[P3] Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wiring.** `pending` — what does a field with an async validator in flight look like? `ds-input` has a spinner; nothing else does. `dirty` — the library renders "edited" nowhere today, so there is no treatment to bind to. `disabledReasons` — a tooltip on a disabled control, or ignored? Each is one input once the appearance is decided, so decide the appearance first. _(`focus()` was the fourth and SHIPPED 2026-08-10: a resolver on both control-value-accessor bases, verified on all twelve controls that lacked one.)_


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

Stas said keep it in the backlog. Left untouched on purpose.

## DS-docs showcase

- [ ] **[P3] Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below).** A section-heading toggle that draws a visual "inspect" overlay on the live demos: colour-coded lines/boxes for paddings, gaps, sizes with values+units, plus WHICH token/class drives each value. Read computed styles + `getBoundingClientRect`; map values back to the `--space-*`/`--radius-*`/`--font-size-*` scales. **Rewritten 2026-07-24 → start as a scoped pilot:** spacing-only on ONE section (e.g. button), then generalize. Greenfield, docs-only, no product impact. _(Verified: nothing exists today.)_


## Component feature gaps

- [ ] **[P3] Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog with the deck attached (not built, not closed).** Deck: `presentations/select-native-multi.html` — three variants live, comparison matrix and sources; it is the prepared answer if a consumer ever pulls on this. Native `<select multiple>` is not a cheaper spelling of the same control, it is a documented antipattern: multi-selection is reachable only through Ctrl/Cmd- or Shift-click with nothing in the control announcing it, an unmodified click **discards the entire prior selection**, non-adjacent options cannot be selected from the keyboard at all, and screen readers handle it worse than a single `<select>`. The consensus alternative is a checkbox list — which is exactly what `ds-multi-select` already is.
  **The soft version of the ask does not survive either:** the moment a hypothetical `ds-select multi` is made usable it has to open a checkbox list, i.e. it becomes `ds-multi-select`, and the only genuine difference left is chips-in-trigger vs an "N selected" summary. If a consumer ever wants the compact trigger, the honest answer is an input (`[triggerDisplay]="'summary'"`) on the existing component, not a second component and a fork in the docs. The one case where nativeness would really matter — a plain HTTP form POST with no JS — is solved by a hidden `<select multiple>` inside `ds-multi-select`, not by changing the UI.


## Missing components (from gap analysis)

Most of the original gap list has SHIPPED (verified 2026-07-24: multi-select · button-group · segmented · timeline · description-list · list · data-grid · confirm-dialog · layout · color-picker · slider · otp-input · tree · loading-overlay · split-button; plus this session's `ds-app-layout` + `ds-sidenav-footer`). Remaining:

- [ ] **[P3] Image / lightbox.** No demand stated; overlay/motion infra (`modal`/`drawer`/`overlay-motion.ts`) exists to build on.

- [ ] **[P3] Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Resizable split panes (drag a divider to resize adjacent regions). **DECISION-PENDING** on need. Reference: this session's `ds-table` column-resize pointer logic (`onResizeStart/Move/End`) is a ready basis for the drag mechanics (panes vs columns aside).

- [ ] **[P3] CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Hierarchical cascading dropdown (ref https://primeng.dev/cascadeselect).** Pick a leaf from nested groups via a compact overlay that expands sub-levels (Country → State → City). GAP: `ds-select`/`ds-multi-select` are FLAT dropdowns; `ds-tree` is a full inline tree VIEW (single-select via `selectedId`), not a compact selector; `ds-menu` is an actions menu, not a value control — so no cascading value-select exists. Niche (category / geo pickers), no active request. Building blocks if pulled: `ds-tree`'s `TreeNode` model + the shared overlay/popover infra + `ds-select`'s trigger. Otherwise document "use `ds-tree` for inline hierarchy, or flatten into grouped `ds-select`".


## Missing tokens / foundations (from gap analysis)

- [ ] **[P3] Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog.** Add opt-in `--primary-cta`/`-hover`/`-active`/`-on`, defaulting to the `--primary*` family; the default solid button (the `--c-base`/`--accent` slot — **note: no `.primary` class; verified `button.component.scss:23,35`, 2026-07-24**) reads them. Lets a brand give the CTA a deeper AA-safe fill when it rebrands `--primary` to a light colour, without darkening the role everywhere. Default theme needs nothing (white-on-`--primary` already ~5.5:1 AA). Ported from the a11y branch (`--brand-cta`); dropped in merge because the tokens didn't exist on main and default passes AA.

- [ ] **[P3] MED cluster — ASKED 2026-08-05, Stas: keep in the backlog.** Density beyond hit-targets (fonts/icons/pad — `[data-density]` scales heights/pad/avatars today but NOT `--font-size-*`/`--icon-*`, verified 2026-07-24) · fluid typography (`clamp()` — type tokens are fixed px). **No longer speculative — there is now a MEASURED case (2026-08-10).** Controls that hold chips set a `min-height` rather than a height, so when a tier floor drops below what the text needs they stop following it: under `ultra-compact` `ds-multi-select` measures **33px** and `ds-autocomplete` **29px** where the other seven reach 24px. The floor is applied correctly (`min-height: 24px`); the content cannot shrink, because at a 14px font the line box alone is 19.6px. Proved by hand: dropping `--font-size-s` to 11px in that container pulled them to 31px and 25px. So "density does not scale type" is not a nicety — it is why the bottom tier does not level. `compact` is unaffected in practice (33 against 32). _(The third clause — motion semantic presets — MOVED 2026-07-31 into the customizable-motion item under "Motion / overlays" as its slice 3; don't re-open it here.)_ Both remaining pieces are speculative, no active request; split into their own items if ever prioritized. _(high-contrast/forced-colors + RTL/logical-properties dropped — Stas 2026-07-07.)_


## Component API / portfolio

- [ ] **[P3] CDK Menu adoption (option B) — parked.** ONLY if/when nested submenus, a menubar, or context menus are needed. `ds-menu` = native roving + `DsOverlayCloseRef` (verified still native, 2026-07-24 — correct for flat menus). Plan: `docs/superpowers/cdk-menu-adoption.md`. When we move, prefer `@angular/aria` `ngMenu` over CDK Menu; gated on a real need or `@angular/aria` going stable.

# Records — kept so they are not "simplified" away

Not work. Deleting one invites the mistake back.

## A11y — decision record (deferred, NOT a bug)

- [ ] **[P3] topbar → `role="banner"`** — VALIDATED-REDUNDANT & DEFERRED (Stas 2026-07-06 "пропусти, не удаляй"). The bare `<header>` inside the generic custom element `<ds-topbar>` already maps to the `banner` landmark implicitly (**verified `topbar.component.html:1`, 2026-07-24**); an explicit role is flagged "unnecessary" by the W3C validator and would be WRONG if `<ds-topbar>` is nested in `main`/`section`/`article`/`aside`/`nav`. Kept as a decision record; only add if we adopt a deliberate defensive-robustness policy.
