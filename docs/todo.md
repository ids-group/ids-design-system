# DS — improvements backlog

## Open, in priority order

**Asks — a consumer or Stas asked for it**

- P2 · One entry point for the whole library means a consumer cannot keep the DS out of their initial
- P3 · `ds-table` — row-expansion parity polish vs PrimeNG (ref https://primeng.dev/table#row-expansion).
- P3 · `ds-card` cannot clip its own box, so a full-bleed child pokes past the radius (four workarounds
- P3 · A refusal reason on `ds-button` reaches a mouse only — `ds-menu-item` got `[description]`, buttons
- P3 · `ds-button` has no resting shadow hook, which is why one consumer still reaches its inner element
- P3 · `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref
- P3 · The two row-action halves left open on purpose: a per-row `label`, and a divider or

**Decisions — waiting on Stas, not on work**

- P1 · Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking
- P2 · `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in,
- P2 · Five controls compute no `controlState`, so a validation state cannot reach the control itself —
- P2 · Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the
- P2 · `.ds-interactive` — global state-interaction contract (agreed; prototype before spec —
- P2 · Theme recipe vs hand-tuned picks — alignment decision. Button/icon-button state derivation uses the
- P3 · Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on
- P3 · Shared picker internals — SURVEYED 2026-08-05, and the premise is wrong: it is THREE components, not
- P3 · Three deferred DEFAULT changes for the batch after 0.9.0, all held back by the release

**Parked — asked, and deliberately not now**

- P3 · `--icon-xs/sm/md/lg` exist (12/14/16/20) and `ds-icon` cannot be sized by them. It takes
- P3 · Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below). A
- P3 · Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog with the
- P3 · Image / lightbox. No demand stated; overlay/motion infra (`modal`/`drawer`/`overlay-motion.ts`)
- P3 · Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed). Resizable
- P3 · CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).
- P3 · Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog. Add opt-in
- P3 · MED cluster — ASKED 2026-08-05, Stas: keep in the backlog. Density beyond hit-targets
- P3 · CDK Menu adoption (option B) — parked. ONLY if/when nested submenus, a menubar, or context menus are

**Records — kept so they are not "simplified" away**

- P3 · `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing
- P3 · topbar → `role="banner"` — VALIDATED-REDUNDANT & DEFERRED (Stas 2026-07-06 "пропусти, не удаляй").


## Priority board (2026-08-24, recut after 0.10.2)

**27 open: 1 P1, 6 P2, 20 P3** (counted from the index, not by hand). Nine are *Parked* awaiting a
first consumer ask and two are Records, so the live board is **16 items — and 9 of those are
Decisions**. **`# Bugs` is empty:** nothing shipped is known to misbehave. What is left to BUILD is
**seven asks**; of them, one has a deck waiting on a
verdict, three are gated on a first consumer ask, and three arrived on 08-24 evening from mm-broker on
0.10.3 — a card that cannot clip its own box, a refusal reason with nowhere to go on a button, and a
missing resting shadow hook. **All three were found as `::ng-deep` residue rather than reported, which
is the transferable part: a deep selector a consumer still carries IS an unfiled ask.**

**The one buildable item, and it spent three days filed as "not work".** A `ds-table` row can be opened
only by clicking the row, and nothing on screen says so — six lists in mm-broker's broker portal
compensate by repeating the destination as a `View Details` entry in the overflow menu. The literature
agrees on the shape of the fix (Roselli, oidaisdes.org): put the control **in a cell**, as a real link,
so the record's name becomes the way in — visible, in the tab order, and Ctrl-clickable, which a row
click cannot offer. It sat under `# Records`, whose own header reads "Not work", and the index therefore
listed it as a record. Moved to `# Asks` today; the work is a `link` column kind, unblocked.

**Two items left the board without being worked, and that is the finding.** Both were closed and
archived on 08-21 — the docs API reference listing components nobody can import, and the missing
two-way `[(sortKey)]` demo — and neither was ever deleted here, so both read as open for three days.
The 08-21 note claimed the index "is generated from the items rather than hand-kept, so it cannot
drift again". **There is no generator** — nothing under `tools/` writes this file — and it drifted.
Rebuilt from the items today and priority-sorted inside each section; until something generates it,
closing an item means deleting the item AND its index line.

**`compact` moved to Records by its own words.** Its last sentence reads "Not a bug — a knowingly
duplicated decision over a single source of truth", and it sat under `# Bugs`. Nothing about it
changed; it is now filed where it says it belongs.

**The P1 — `Upgrade to Angular 22` — was PROBED after the promotion, and the library compiles clean on
22.1.3** (worktree `probe/angular-22`, `ngc` partial + strictTemplates, 0 errors). What the probe added is
the price: **TypeScript 6.0 is mandatory** and the 22 CLI wants **Node ≥ 24.15.0** (this machine has
24.13.0), so "move the repo" is three majors in one pass, while "widen the peer range" is now backed by a
real compile. The item carries the full findings, including two claims it had flagged as unconfirmed —
`touch` is real (an addition, not a rename) and `ngNoCva` needs nothing from us.

**It is still the only item where somebody cannot use
the library at all.** The peers declare `^21.2.0`, so an app on Angular 22 — out since 2026-06-03, and
what a new app starts on — needs `--legacy-peer-deps` to install this package. Everything else on the
board is about how well the library behaves, not whether it can be installed. It carries a real decision
too (when to move, and re-verifying the signal-forms work against a release whose breaking changes land
exactly there), but the blocking half is not a preference.

**One decision still has a deck waiting and nothing else blocking it:** packaging MBP-133
(`presentations/packaging-entry-points.html` — deferred by decision on 08-21, deck for when it is picked
up). The per-state glyph in `ds-field-message` was the other, and it is decided: Stas read the deck,
picked C, and improved it into a default where every state switches on its own.

**The three token items are ONE story and should not be taken separately.** The single-source colour
engine is the spec; "theme recipe vs hand-tuned picks" is question (b) INSIDE that spec, by its own
wording; `.ds-interactive` sits on top of whatever the engine decides. Opening any of them alone means
deciding the other two by accident.

**Where the release risk is.** 0.10.2 was cut on 2026-08-24, so the pressure is off this manifest:
`migrations/unreleased.json` carries **3 actionable items, 1 `deleteList` entry and 3 informational
lines**, covering two focus-ring fixes, a portaled-token fix and a tooling fix. The risk moved to the
three manifests behind it — mm-broker was last recorded on **0.9.1** and will swallow 0.10.0, 0.10.1 and
0.10.2 in one pass, so those three are what has to be complete, not this one.

**Two habits this session kept catching, worth reading before opening anything new.** A number measured
in ONE theme carried into the other unchecked (three times, all wrong — the latest being the claim that
excluded `tonal` from the disabled recipe). And a capability shipped that no consumer adopted, twice
traced to one missing field in a contract: when adoption is zero, read the consumer's hand-rolled version
rather than re-reading our own API.

# Bugs — something shipped misbehaves

Highest: each one is wrong in code — or in a surface — a consumer already reads.

# Asks — a consumer or Stas asked for it

Requests, not defects. Ordered by who is blocked.

## Component feature gaps

- [ ] **[P2] One entry point for the whole library means a consumer cannot keep the DS out of their initial bundle (2026-08-03, Stas — mm-broker MBP-133 review).** _(Re-counted 2026-08-05: **85** exported `*Component` classes plus 9 directives (re-counted 2026-08-10; was 83 + 8 on 08-05), by `grep -rho 'export class .*Component' src/lib | sort -u`. The item said 73; the figure does not change the argument, but it is now stated with its method so nobody re-counts.)_ `ng-package.json` declares a single `entryFile`, so the package ships as one 1.25 MB `fesm2022` module behind a single `"."` export. `sideEffects: false` is set and tree-shaking works fine — unused components are dropped — but **chunking cannot happen**: esbuild splits by module, so it can never place two DS symbols in two different chunks. Measured in mm-broker: the app's eager composition root binds `NotificationService` to a toast implementation, that one runtime import of `ToastService` pins the whole retained DS graph into a chunk statically imported by `main`, and the result is **632 kB — about 88% of a 720 kB initial bundle** — even though every feature route is lazy and the only eagerly-needed symbol is one service. The consumer has no lever: the root is the only specifier, and moving the provider to a lazy route does not help because interceptors and the `ErrorHandler` resolve from the root injector. **Ask:** secondary entry points (ng-packagr supports a nested `ng-package.json` per folder). Even a coarse split would fix it — a services/overlay entry point carrying `ToastService`, `ModalService` and `BodyScrollLockService` separately from the component layer, so an eager root can import the service and leave 70-odd components lazy. Per-component entry points would be ideal but are a bigger change; the services split is the one that unblocks consumers. **Explicit non-goal:** nothing about the public API surface needs to change — same symbols, same names, just reachable through narrower specifiers. **RE-AUDITED 2026-08-03 → read `packaging-chunking-audit.md` before actioning this item; three claims above are wrong.** The mechanism is confirmed by controlled esbuild fixtures, but: this was never filed upstream (it is the consumer's own backlog item, with a consumer-side fix); "the consumer has no lever" is false (a dynamic `import()` keeps `main` clean — it just costs tree-shaking, measured +50%); and the 07-27 "tree-shaking already works" verdict is NOT overturned — placement and tree-shaking are orthogonal and both findings stand. The audit also merges this item with the "Packaging — secondary entry points" section below, which duplicates it with the opposite verdict.
  **DEFERRED by Stas 2026-08-21, with a deck instead of a build — `presentations/packaging-entry-points.html`.**
  It draws the mechanism (one FESM is one module, so placement cannot happen), the three esbuild fixtures
  as bars scaled to their measured sizes, the grep counts that isolate the cause, and all four options
  with what each costs in placement AND tree-shaking. Recommendation on the deck is B (one services entry
  point) and only B: the sole option measured to fix placement without losing tree-shaking, and a major
  either way, so it sequences with the breaking batch. The deck also names what would overturn that — a
  consumer whose EAGER root needs a component rather than a service, which is D's case.

  **DECIDED 2026-08-05: option B from `packaging-chunking-audit.md` §7 — one services entry point, root `public-api.ts` kept as a facade.** It is the only option the fixtures measured as fixing chunk PLACEMENT without losing tree-shaking, and it is non-breaking: same symbols, same names, no cross-entry deep-import refactor across 73 folders. **Two things to get right when building it, both found while deciding:** (1) the entry point is NOT as narrow as its name — `ToastService` imports `ToastRegionComponent` and `ModalService` imports `ModalConfirmComponent`, so the entry necessarily carries those components and their own deps; that still fixes the reported problem, because the ~70 components the app touches only from lazy routes stop being pinned into `main`, but the eager cost is the toast+modal graph rather than three classes. (2) The secondary entry must OWN the source and the root must re-export FROM it — if both entries export the same source, a consumer importing from both gets two class identities and DI silently resolves two different services. **CORRECTED 2026-08-05, before anyone builds it: option B is NOT implementable as the audit describes it, and the audit is wrong on this point because it measured synthetic fixtures rather than the real import graph.** Followed the actual chain: `ToastService` → `ToastRegionComponent` → `ToastComponent` → `IconComponent` + `SpinnerComponent`; `ModalService` → `ModalConfirmComponent` → `ButtonComponent` + `ModalCardComponent` → `IconComponent`. So a services entry point must OWN button, icon, icons.data, spinner, toast and modal-card — and every other component needs those same leaves, so the ROOT would have to import them from the services entry. ng-packagr forbids cycles between entry points, so there is no arrangement where a small services entry sits beside an unchanged root. What that shape actually is: a LAYERED set of entries — `core` (icon, button, spinner, overlay primitives) ← `services` ← `components` — which is the audit's option D, described there as a separate large refactor, and it changes how every consumer imports. **So the live choice is A, C or D — not B. Described 2026-08-05 at Stas's request and DELIBERATELY LEFT OPEN: nothing here is urgent (no consumer is blocked, only sub-optimally chunked), and each option's cost lands somewhere different.**

- **A — do nothing.** Every feature route in the consumer is already lazy, so the DS chunk arrives with the first route rather than before it; what the 632 kB measurement really shows is that one eager `ToastService` import pulls the retained graph into `main` instead of into route 1. Cost: zero. What stays wrong: a cold first paint carries components the first screen does not use. Closing on A means recording that trade as accepted, since the numbers will resurface in the next consumer audit.
- **C — consumer-side dynamic `import()`.** The consumer's composition root imports the service lazily, which keeps `main` clean with no DS change at all. Measured to cost ~50% of the tree-shaking win (the dynamic specifier defeats static analysis, so more of the graph is retained). Also NOT ours to make: the fix lives in the consumer's repo, and per the scope rule this repo does not plan changes there — so choosing C means closing the DS item and letting the consumer decide.
- **D — layered entry points: `core` (icon, button, spinner, overlay primitives) ← `services` ← `components`.** The only shape that fixes chunk PLACEMENT without losing tree-shaking, and the only one that survives the real import graph: `ToastService → ToastRegionComponent → ToastComponent → IconComponent + SpinnerComponent` and `ModalService → ModalConfirmComponent → ButtonComponent + ModalCardComponent`, so a services entry must own those leaves, and every other component needs them too — which is why B (a narrow services entry beside an unchanged root) cannot exist: ng-packagr forbids entry-point cycles. Cost: ~40 files change imports inside the DS, the public specifier set grows from one to three, and every consumer's imports move (a codemod-able rename, but a breaking one needing a major). Benefit: an eager root can hold `ToastService` while ~70 components stay behind lazy routes.

**Two traps recorded while deciding, so they are not re-derived:** (1) the secondary entry must OWN its source and the root must re-export FROM it — if both export the same source a consumer importing from both gets two class identities and DI silently resolves two different services; (2) the audit's fixtures were synthetic, which is exactly how it concluded B was viable, so validate any future claim against the real import graph.

- [ ] **[P3] `ds-table` — row-expansion parity polish vs PrimeNG (ref https://primeng.dev/table#row-expansion).** Base row expansion ALREADY SHIPS — `expandableRows` + two-way `expandedIds` `model<Set<string>>` (multiple + programmatic), `rowExpandTemplate`, expander button/chevron/`expandedColspan`, docs demo (`table.section.html:574-600`). So this is **deltas only, not a build**: (a) optional **single-expand mode** (only one row open at a time — today it's always multi via the Set); (b) **expand-all / collapse-all** header toggle (the header expand-col is currently just a spacer); (c) optional dedicated `(rowExpand)`/`(rowCollapse)` outputs (the `expandedIds` model already covers change-tracking, so this is sugar). All small; do only on a consumer ask — the core feature is at parity.

- [ ] **[P3] `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber.** Today it's a raw `value: number` + `min`/`max`/`step` + spinner, no display formatting. PrimeNG InputNumber's value-add is a formatted numeric field: thousands grouping, fixed decimals, currency/percent, locale-aware, parsed back to a number on edit. Add opt-in `mode` (decimal/currency/percent) + `locale`/`currency`/`minFractionDigits`/`maxFractionDigits`/`useGrouping`; format on display/blur, parse on focus/input. Masking prior art in-house: [[reference-masked-input-dom-writeback]] (pinkmoon phone/w3w imperative `element.value` write-back). No active request — likely pulled by the financial-admin consumers (mm-broker admin, pinkmoon amounts/rates/%); gate on the first such form.

## `ds-card` cannot clip its own box, so a full-bleed child pokes past the radius (from mm-broker, 2026-08-24)

- [ ] **[P3] A card that holds a full-bleed child needs `overflow` on the card's INNER box, and no hook
  reaches it.** `ds-card` publishes `--ds-card-bg-color`, `-border`, `-focus-shadow`, `-hover-lift`,
  `-pad`, `-radius`, `-shadow` and `-shadow-hover` — everything except the one property that makes a
  rounded card hold a child whose background runs to its edge. Put a grey footer strip or an image at
  the bottom of a card and its square corners paint over the card's own radius; the host's `overflow`
  cannot help, because the rounded element is the DS's inner `.card`, not the host. **Four screens in
  mm-broker's employee portal carry the same four-line workaround**, and it is the one shape they have
  left: `:host ::ng-deep ds-card .card { overflow: hidden }` (`product-card`, `wizard-plan`,
  `wizard-product`, `review.desktop`). **Ask:** either a `--ds-card-overflow` hook, or — better, since
  a rounded box with a full-bleed child has no other correct rendering — clip by default and give the
  rare card that must overflow the opt-out. Prior art in this backlog: 0.10.0's delete-list closed the
  sibling reach (`::ng-deep .card { height: 100% }`) by making the card's box fill a stretched host;
  this is the next `.card` reach in the same consumer.

## A refusal reason on `ds-button` reaches a mouse only (from mm-broker, 2026-08-24)

- [ ] **[P3] `ds-menu-item` got `[description]` in 0.10.2 and it closed this for menus; a disabled
  BUTTON still has nowhere to say why.** The pattern is a control the server refuses — "the invitation
  has not been accepted yet", "this is the last active admin" — where the app disables it and has to
  say why. On a menu item the new input does it properly: visible without hover, and reaching assistive
  tech as `aria-describedby` rather than as part of the name. mm-broker adopted it the day 0.10.2
  landed and deleted two `[dsTooltip]`-based workarounds with their `TODO(disabled-reason)` markers.
  **The third site is a `ds-button` and could not be fixed**: `[dsTooltip]` needs hover, and a disabled
  button cannot be focused to announce itself, so the reason reaches a mouse and nothing else. That
  consumer also carries a `blocked-action` mixin whose whole comment is "`ds-button` has no caption
  slot — only `ds-menu-item` holds a second line — so the reason is a sibling". **Ask:** the same
  `description` shape on `ds-button` (and `ds-icon-button`, where the label is already invisible), with
  the same `aria-describedby` wiring. **Worth deciding rather than assuming:** a button's second line
  changes its box, so the honest alternatives are a standing caption (like the menu item), an
  `aria-describedby` that names an element the app already renders beside the button, or a documented
  "put the reason next to the control, not in it" recipe. Any of the three closes it; today there is no
  answer at all.

## `ds-button` has no resting shadow hook, which is why one consumer reaches its inner element (from mm-broker, 2026-08-24)

- [ ] **[P3] Four of the five properties a consumer needed are tokens; the fifth keeps the `::ng-deep`
  alive.** mm-broker's employee coverage-tier screen makes its option buttons the screen's primary
  surface: `background`, `color`, `font-weight` and `border` all have hooks
  (`--ds-button-bg-color`, `-label-color`, `-weight`, `-border`), so the only reason the rule is
  `::ng-deep ds-button button` at all is a resting `box-shadow` — the component publishes
  `--ds-button-focus-shadow` and `--ds-button-pressed-shadow` and nothing for the rest state. **Ask:**
  `--ds-button-shadow` (and, if the state matrix wants symmetry, `-shadow-hover`), which would let that
  block become four token lines and remove the last deep selector on `ds-button` in that app. Small,
  and it is the kind of gap that only shows up as a deep selector nobody reports.

## `TableRowAction` cannot express a per-row menu, so `rowActions` is adopted nowhere (from mm-broker, 2026-08-18)

- [ ] **[P3] The two row-action halves left open on purpose: a per-row `label`, and a divider or
  `group` (split out of the item above 2026-08-21, when `hidden` and `disabledReason` shipped).**
  `label: string | ((row) => string)` blocked 4 of the eleven menus — Deactivate/Reactivate,
  Activate/Deactivate, Add fee/Edit fee — and is expressible today as two ids each carrying its own
  `hidden`, which is why the original counted it the cheapest of the four to decline. The divider
  blocked 2, where the destructive tail is separated by a `ds-menu-divider`, and ordering the items
  destructive-last covers it without new API. **Both are P3 until a consumer says the workaround is
  the thing stopping them** — the two that actually blocked adoption have shipped, so the next word
  on these should come from a migrated screen, not from the original count.

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

# Decisions — waiting on Stas, not on work

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
  (2) **Node ≥ 24.15.0** — the 22 CLI refuses to run on this machine's 24.13.0 ("requires v22.22.3 or
  v24.15.0 or v26.0.0"), so every dev machine and CI needs the bump before `ng build` works at all.
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
  **The decision is the peer range, and it should be made BEFORE 0.9.0 is cut**, since that is what the release publishes: widen to `^21.2.0 || ^22.0.0` (cheap, but claims a compatibility nobody has tested) or move the repo to 22 (honest, costs a real upgrade pass). **Context for the call:** Angular Material has NOT shipped signal-forms support (`angular/components#32072` still open), PrimeNG deliberately waited for stable and is repairing `[formField]` typing in 22.0.1, and Spartan has shipped it — so on this axis the DS is currently ahead of both libraries its consumers compare it to, and that lead is worth keeping installable.

- [ ] **[P3] Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wiring.** `pending` — what does a field with an async validator in flight look like? `ds-input` has a spinner; nothing else does. `dirty` — the library renders "edited" nowhere today, so there is no treatment to bind to. `disabledReasons` — a tooltip on a disabled control, or ignored? Each is one input once the appearance is decided, so decide the appearance first. _(`focus()` was the fourth and SHIPPED 2026-08-10: a resolver on both control-value-accessor bases, verified on all twelve controls that lacked one.)_

## The field system — the two controls outside it, and the five with no box to paint

- [ ] **[P2] `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in, or say they are not fields (Stas asked 2026-08-20).** Audited, and they are not "fields missing a feature" — they never had the wrapper. **`ds-number-stepper`** exposes `value`, `min`, `max`, `step`, `size`, `disabled`, `ariaLabel` and nothing else; **`ds-dropzone`** exposes `accept`, `multiple`, `files`, `disabled`, `single` plus two outputs. Neither has `label`, `hint`, `error`, a `ds-field-message`, `resolveFieldMessage`, or the `field-label` mixin — verified by grep, all zero. Every other one of the fourteen fields has all of it.
  **So this is a feature addition, not a unification**, and that is why it is a decision rather than work: both would gain `label`, `hint`, `error`, `errors`, `invalid`, `touched`, `reserveMessage` (now one `extends DsFieldBase`), a message row, and the label/required/optional block.
  **The case for doing it:** in a real form both want it. A numeric stepper needs a label and a validation error like any input; a dropzone needs a hint ("up to 5 MB, PDF only") and an error ("that file was rejected"). A consumer today has to hand-roll a label and an error line beside them, which is exactly the inconsistency this board exists to remove.
  **The case against:** neither has been asked for by a consumer, and `ds-number-stepper` may be intended as a bare control composed inside something else — though its own `ariaLabel` and `size` inputs suggest standalone use.
  **Cheap now that the base exists:** `extends DsFieldBase` plus a `resolveFieldMessage` call, a `ds-field-message` in the template, and the label block — the same shape all fourteen already share.

- [ ] **[P2] Five controls compute no `controlState`, so a validation state cannot reach the control itself — only its message.** `ds-checkbox`, `ds-radio`, `ds-radio-group`, `ds-slider` and `ds-switch` are the five of fourteen that do not bind `[attr.data-field-state]`, and they do not read `controlState` at all (grep: zero occurrences in each). The other nine do, and the shared `field-state` mixin paints them.
  **P3 → P2, 2026-08-21:** raised because the session that shipped the field-state work made the gap concrete: on a checkbox the ONLY sign of an invalid state is the red line underneath, and the same holds for radio, radio-group, slider and switch. Five of fourteen controls cannot show a validation state on the control itself, which is the inconsistency this board exists to remove, and `color-not-only` says a message alone is not enough. Still a decision rather than work — the question is whether a box-less control paints its own indicator — but it is the same class of question as the glyph one and should be answered beside it.
  **Partly correct by design** — they have no bordered box for a border to appear on, which is also why they deliberately did not get `[success]`. **But they are not shapeless:** a checkbox has a square with a border, a switch has a track, a radio has a ring. Today none of those can carry error, warning or success, so on a checkbox the only sign of an invalid state is the red line underneath.
  **Decide whether the box-less controls should paint their own indicator** for error/warning (and then whether `[success]` follows). If yes, it is a `field-state`-style mixin per control shape rather than a reuse of the bordered-box one, since the target is a 16px square rather than a 39px field.

Nothing moves until a verdict; the work behind each is scoped.

## Architecture / tokens

> **Token-architecture pass (P2, interlocked).** The three items below + the semantic radius+elevation role layer (under "Missing tokens / foundations") share ONE principle — a **role layer between foundation and component**, single pointer, shades cascade. Spec them together; sequence the single-source colour model first and the rest fall out. Don't action piecemeal. _(The typography `.t-*` `--ds-t-*` hooks — the same consumer-first contract at the global utility layer — already SHIPPED 2026-07-24, see done.md.)_

- [ ] **[P2] Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24).** ROOT CAUSE (surfaced when a consumer scoped `--primary-h/s/l` on a checkbox and ONLY the focus halo moved): "primary" has TWO decoupled reps — (a) `--primary` + hand-picked ramp shades read by component FILLS; (b) `--primary-h/s/l` HSL channels feeding ONLY math-derived halos/ramp/gray-tint — with **no live link**, so a coherent scoped recolour needs BOTH the channels AND a `--primary` re-composition (the 3-/4-token footgun). **Re-verified true 2026-07-24** (`_semantic.scss:91-93` channels; `:111-112` hover/pressed already `color-mix`; halos `:209-229`; gray tint `_base-palette.scss:41`). **IDEA:** one colour token per role as the only source; shades via `color-mix()`, hue via `hsl(from var(--primary) h <S> <L>)` keeping each step's hand-tuned S/L (see [[feedback-handtuned-colors-beat-formulas]] — only the HUE is single-sourced); drop `--primary-h/s/l` as PUBLIC API. Scoped recolour becomes ONE declaration; **UNBLOCKS the `ds-color`/`--accent-*` indirection**. **OPEN for the spec:** (a) colour space (`oklch`/`oklab` perceptual vs `srgb`/`hsl` matches today) — verify each derived role visually; (b) pure-derived vs hand-pick per role; (c) relative-colour + `var()` edge cases in the 3 target engines; (d) dark-theme interplay. Prototype: `presentations/color-engine-relative.html`.

- [ ] **[P2] `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]]).** Replace per-component `--ds-*-bg-hover/-active` + scattered `color-mix()` with ONE contract: a `.ds-interactive` class + presets driven by `--state-step-*` tokens in a NEW `src/lib/styles/_interaction.scss` (**still absent — verified 2026-07-24**), with an override slot (`--interactive-*-set`). Then migrate interactive components off their local recipes. **NEXT — blocking user verdicts B1–B5** (live demo `presentations/interaction-formula.html`): (B1) tint-pressed 28% vs 34%; (B2) pressed step for neutral surfaces (menu-item/table rows); (B3) danger menu-item hover — formula vs `--error-subtitle`; (B4) shape of the `--interactive-*-set` slot; (B5) pressed step for success/warning buttons. **Rewritten 2026-07-24:** the old "retire `_forced-states` duplication" clause is now MOOT — `_forced-states.scss` no longer exists (docs state-forcing is per-section `:host ::ng-deep .pin-*` reading each component's `--_*` resolvers). What survives is the broader "should presentational/state styling live in global partials (like `_link.scss`) with components as thin sugar" question. (Housekeeping DONE — re-grepped 2026-08-10, the stale `_forced-states` refs are gone from `README.md` and `table.component.scss`; nothing outside `.claude/` mentions it.)

- [ ] **[P2] Theme recipe vs hand-tuned picks — alignment decision.** Button/icon-button state derivation uses the theme's 88%/76% mix-to-black recipe (**verified `button.component.scss:34-38`, `_semantic.scss:111-112`, 2026-07-24**). If the single-source-colour calibration replaces `--primary-hover/-pressed` with hand-tuned values, the button defaults (color-mix off the resolved bg) diverge from the theme roles — decide then: components read role tokens again, or theme keeps the formula. **This is a concrete instance of the single-source item's open question (b); resolve it inside that spec, not separately.**

## Component API / portfolio

- [ ] **[P3] Shared picker internals — SURVEYED 2026-08-05, and the premise is wrong: it is THREE components, not six, and the duplicated surface is ~25 lines each.** Measured: only `ds-select`, `ds-multi-select` and `ds-autocomplete` share the shape (an `activeIndex` signal + wrap-around arrow nav over a flat option list). `ds-date-picker` navigates a 2-D day grid, `ds-time-picker` has NO arrow handling at all (it delegates to `ds-time-columns`), and `ds-color-picker`’s arrows drive a continuous saturation/hue canvas — three different models that a shared list helper would not serve. **Type-ahead does not exist anywhere** (zero hits), so that part of the ask describes code that was never written. And the three that DO overlap differ where it matters: select carries groups + Home/End + `firstEnabledIndex()` skipping disabled, multi-select works over a filtered list with a select-all row, autocomplete counts a create/no-match slot into its modulo. **Recommendation: extract only the index cursor** — a ~30-line `createListCursor({ length, isEnabled })` returning `{ index, next, prev, first, last, reset }` — and NOT a picker base class. **Worth doing when a fourth list picker appears, not before:** 3 × 25 lines against a 30-line helper is a wash today, and the wrong shared abstraction here costs more than the duplication.
  **P2 → P3, 2026-08-21:** demoted, and it should have been on the day it was surveyed: **the item's own conclusion is not to build it** — three components share ~25 lines each, against a ~30-line helper, so extracting now is a wash and the wrong shared abstraction costs more than the duplication. It is kept open only so the survey is not repeated, which makes it a parked record, not a P2. Revisit when a FOURTH list picker appears.

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

## ds-icon does not read the icon size scale (recorded 2026-08-24, from the state-glyph work)

- [ ] **[P3] `--icon-xs/sm/md/lg` exist (12/14/16/20) and `ds-icon` cannot be sized by them.** It takes
  a NUMBER (`size`, falling back to `DS_CONFIG.icon.size`) and writes `width`/`height` attributes, while
  publishing `--ds-icon-size` OUTWARD as an inline custom property. So the scale is only usable by
  hand-written CSS on someone else's svg, and an ancestor cannot say "icons in here are 14px" the way it
  can say that about every other dimension in the library. **Found while adding the field-message state
  glyph:** the natural hook would have been a CSS token, and the only route to one was `::ng-deep` into
  `ds-icon`'s template — so that feature took a config value instead, and the glyph is a hardcoded 14px.
  **The shape of the fix:** size the svg from `var(--ds-icon-size, <attr fallback>)` in `ds-icon`'s own
  (global) styles, and set the inline `--ds-icon-size` ONLY when `size` is explicitly bound — an unbound
  icon then inherits whatever an ancestor declares, and a bound one still wins. **Not urgent and not
  free:** it changes how every icon in 90-odd components resolves its size, so it wants its own pass and
  a look at the pages that mix icon sizes in one row.

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

**23 open — 9 P2 and 14 P3 — but the count flatters the board.** **Twelve are parked**: ten P3s waiting on a first consumer ask (splitter, CascadeSelect, lightbox, CDK Menu, `ds-select` native multi, stepper formatting, row-expansion deltas, primary-CTA, MED, inspect mode) and two kept deliberately as decision records not to be "simplified" (`role="banner"`, the duplicated `compact` condition). **A P2 — shared picker internals — is open against its own recommendation**, which is not to build it until a fourth list picker appears.

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
