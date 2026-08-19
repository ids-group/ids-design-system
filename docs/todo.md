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
- P2 · A menu item's hover / error fill has square corners over the popover's rounded ones
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

- P2 · Four overrides came out IDENTICAL in two independently-built apps — that is evidence about our defaults,
- P2 · `ds-sidenav-item` active state — solid accent pill → quiet wash + coloured label?
- P2 · One entry point for the whole library means a consumer cannot keep the DS out of their initial bundle
- P2 · `ds-table`'s row-action column has shipped since 0.6.3 and mm-broker uses it in ZERO of its
- P3 · `ds-table` — row-expansion parity polish vs PrimeNG
- P3 · `ds-number-stepper` — optional numeric formatting
- P3 · `ds-menu-item` — a native secondary line, so an action can state a limitation without hover or focus
- P3 · `ds-list-item` cannot express a row that has its own control AND a row-level action
- P3 · Build a deck for the tinted-fill variants of `warning` and `success`, and re-decide

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

- [ ] **[P2] A menu item's hover / error fill has square corners over the popover's rounded ones (Stas 2026-08-18, mm-broker MBP-134 — reproduced live).** Measured in a running app on 0.9.1, and the same on `dev`: the panel computes `border-radius: 12px` with **`overflow: visible`**, `.panel:has(ds-menu)` sets `padding: 0`, and `menu-item`'s own `border-radius: var(--ds-menu-item-radius, 0)` defaults to **0**. Item width 274px against a 275.42px panel, so the first and last item's fill lands exactly on the panel's corners and paints through them — a destructive item at the bottom shows two square pink corners under a rounded panel. Nothing on the consumer side can fix it: the radius token is per-item, so a consumer would have to know which item is first or last. **Two candidate fixes, pick one:** (a) `ds-menu` gives its edge items the panel's corners — `ds-menu-item:first-child button { border-start-start-radius: inherit; border-start-end-radius: inherit }` and the mirror on `:last-child`; (b) keep a small padding when the popover hosts a menu, which is what `padding: 0` removed — 4px is enough to keep any fill off the corner. **NOT `overflow: hidden` on the panel:** `ds-menu-item` supports submenus that render outside the panel, so clipping would cut them.


## A disabled button does not read as disabled (from mm-broker MBP-121, 2026-08-12)

- [ ] **[P2] `:disabled` dims to `--opacity-muted` (0.6), which is not a disabled level — on a
  low-emphasis button it reads as "enabled, just quieter".**
  **MEASURED 2026-08-13, and the item names the wrong mechanism twice. Half is FIXED; the button half needs a verdict (prototype: `presentations/disabled-recipe.html`).**
  **(1) `ds-button` and `ds-icon-button` never read `--opacity-muted` at all.** Their disabled state is three `oklch(from accent …)` colours (bg / label / border). So the consumer override that retunes `--opacity-muted` on those two selectors is a **no-op** — the same class of finding as their table-head background. It should be deleted whatever we decide, because it never did anything.
  **(2) Where `--opacity-muted` IS used for disabled, the problem is the OPPOSITE of the ask.** Five places — `ds-select`, `ds-date-picker` and `ds-time-picker` triggers, `ds-menu-item`, the shared dropdown row — set `--text-disabled` AND 0.6 opacity on top. Light theme, measured: **1.68:1** against the surface; colour alone **2.53:1**; an enabled row **17.32:1**. Nobody could confuse that state with enabled — the text had almost vanished. Dropping to `--opacity-disabled` (0.5) would have made it **1.53:1**, and `--opacity-text-disabled` **1.37:1**. **FIXED by removing the second dimming** in those five; the two places where opacity is the only signal (a disabled calendar day, `ds-toggle-button`) moved to `--opacity-disabled`, which is the token named for the job.
  **(3) The real defect behind the report, with numbers.** The recipe pins a disabled label at **58% lightness**, which is about where a saturated accent already sits — so on a fill-less button the two states differ in chroma alone. Enabled ↔ disabled: `color="primary"` **1.60:1**, `color="error"` **1.50:1**, `color="neutral"` 4.03:1. So it fails exactly when the accent is coloured, and is fine on neutral.
  **THE MATRIX, built 2026-08-13 over every variant x colour x state (`presentations/disabled-recipe.html`) — and it corrected me again: FOUR of the five variants fail, not one.** I had assumed a fill meant the box carried the state. Measured `bg moved` (disabled fill against rest fill) on `primary`: solid **4.32:1** — unmistakable; tonal **1.09:1**; outline **1.07:1** — nothing. So the box only speaks on solid, and the label has to do the work everywhere else. Label against rest, `primary` / `error`: tonal **1.24 / 1.16**, outline **1.24 / 1.16**, ghost **1.60 / 1.50**, text **1.60 / 1.50**. `color="neutral"` is healthy throughout (3.13–4.30), which is why the bug only shows on a coloured button.
  **The real case, read out of the consumer:** `common/components/.../list-search.component.html` renders `<ds-button variant="ghost" size="sm" icon="x" [disabled]="!canClear()">Clear</ds-button>` — ghost with NO `color`, so the default `primary`. Their `_ds-overrides.scss` comment says the DS "dims a disabled control to `--opacity-muted` (0.6)", which is why they retuned that token; it is inert, so the button they were fixing is unchanged to this day.
  **Four candidates, gap-vs-rest on `primary`** (solid / tonal / outline / ghost / text): **A** today 4.29 / 1.24 / 1.24 / 1.60 / 1.60. **B** neutral label where there is no fill 4.29 / 1.24 / 1.24 / 2.70 / 2.70 — fixes the Clear button and leaves tonal and outline broken. **C** 70% lightness everywhere 2.68 / 2.56 / 2.56 / 2.56 / 2.56 — fixes all four, but the solid label drops from 3.38:1 to 2.11:1 on its own fill. **D** = C except solid keeps 58%: 4.29 / 2.56 / 2.56 / 2.56 / 2.56 — every broken case fixed, nothing given up. **D is the recommendation**, stated as a rule the components already imply: the lighter label is for buttons whose fill cannot carry the state.
  **THE DARK THEME KILLED THE FRONT-RUNNER (2026-08-13, after asking the UX skill).** Every number above was light-theme only. The skill's `state-clarity` / "state contrast parity" rule says a disabled state must be equally distinguishable in both themes, so I measured dark: the enabled label there is a LIGHT blue (`hsl(229 90% 72%)`) while `--text-disabled` is a dim grey, so the neutral-label candidates collapse to **1.59:1** — worse than what they fix in light. The recipe candidates are no better (1.45–1.86).
  **Opacity was what survived both themes** — and it is what the skill and Material say outright (`disabled-states`: *reduced opacity 0.38–0.5 + cursor + semantic attribute*, anti-pattern "controls that look tappable but do nothing", the report verbatim). **Stas ruled it out** (2026-08-13), so the surviving idea had to be expressed without transparency.
  **SHIPPED 2026-08-13 as candidate C, at Stas's call: ONE label recipe for every variant, `oklch(from accent 70% 0.035 h)`** — replacing the 58% base and the 52% overrides tonal and outline carried. He picked it over the scoped variants for the reason the deck could not measure: at 70% the label simply *looks* switched off, including on solid. Result across the matrix: **1.16–1.60 → 2.40–2.71:1** on `primary`/`error`, and 3.13–4.03 → 6.46 on `neutral`. Verified in the compiled CSS that one recipe reaches every variant and no 52% survives. **The trade, accepted rather than hidden:** the disabled label is fainter against its own ground (2.11–2.71:1, was 3.38–5.23) and solid gives up the most (4.29 → 2.68 gap, 3.38 → 2.11 legibility). Not verified in a browser — the Chrome extension was down all session.
  **What was rejected, and why it is worth remembering:** opacity (Material's and the skill's own answer) was the only candidate with light/dark parity, and Stas ruled it out; the neutral-label family (B/D/E) read best in light and collapsed to 1.59:1 in dark; the surface-mixed label (G) matched opacity's parity as a colour but cannot work on solid, whose enabled label is white.
  **PREVIOUS RECOMMENDATION, kept for the record: `color-mix(in srgb, var(--_button-label-color) 50%, var(--surface-default))`, on every variant EXCEPT solid.** The label walks half-way to whatever the theme's ground is, which is the one thing opacity got right — and because `--surface-default` already differs per theme, it needs no per-theme value. Measured, `primary`: light ghost/tonal **2.79:1** (today 1.60 / 1.24), dark ghost/tonal **2.39:1** (today 1.45 / 1.86, neutral-label candidates 1.59). Solid is excluded for the same reason D excludes it from C: its enabled label is WHITE, so mixing white into a white surface changes nothing (1.00:1) and the label's legibility on its own pale fill falls to 1.27:1 — and solid is the one variant whose box already carries the state (4.32:1).
  **It must REPLACE the three `oklch(from accent …)` resolvers, not stack with them** — stacking is precisely the bug fixed this week (a row wearing `--text-disabled` AND 0.6 opacity measured 1.68:1). **The cost, stated plainly:** the disabled label is fainter than today, 2.16–2.45:1 in light where the 58% recipe gave 3.38–5.23, and 1.75:1 for dark tonal. Disabled text is WCAG-exempt and "faint" is the message, but that is the trade.
  **Still open whichever wins:** disabled would rest on colour alone for a sighted user (`cursor: not-allowed` and the attribute cover pointer and screen reader). Decide whether ghost/text also lose the underline or gain a faint fill. **Needs Stas.**
  **Also measured, and it is why this is a labelling decision rather than a fill one:** raising the disabled FILL cannot rescue tonal — its rest fill is already a 94%-lightness tint and every neutral surface we own is near-white, so even `neutral-200` moves the box less than 1.3:1. `ds-icon-button` has the same three resolvers with no per-variant override at all, so it inherits the same verdict. Found on a list toolbar's ghost `Clear`:
  the head could not tell the enabled state from the disabled one at a glance, and neither could I
  from the screenshot — the label stays fully legible and only the tint moves. The token scale
  already carries the right value twice: `--opacity-disabled: .5` and `--opacity-text-disabled: .38`,
  and Material's own disabled guidance is 0.38–0.5. `--opacity-muted` is the wrong token for this
  job by name as well as by value: "muted" is a de-emphasis level (secondary text, hints), while
  disabled is a state that must be unmistakable — the two should not share one number.
  **Ask:** dim `:disabled` to `--opacity-disabled` (or `--opacity-text-disabled` for the label),
  keeping `cursor: not-allowed` and the semantic attribute as they are. Applies to every control that
  reuses the shared disabled rule, not just buttons — the ghost/text variants are simply where the
  0.6 is least survivable, because they have no fill to carry the state.
  **Consumer workaround GONE, and the token with it (2026-08-19).** The paragraph that stood here
  said the override "works because the DS reads that token at use-time" — it does not, and point (1)
  above had already measured that. The override was deleted from `platform-admin/_ds-overrides.scss`
  during the consumer's 0.10.0 upgrade, and `--opacity-muted` is now deleted from the token scale
  too (see `## Unreleased`), so the hijack is no longer expressible. What remains open here is only
  the question below.
  **ASKED AGAIN 2026-08-19, and parked here rather than shipped.** The head asked to put 0.38 on
  `--ds-button-label-color-disabled` directly. Measured on the consumer's real ground
  (`--accent-deep: #00414b` on `#fcf8f9`), ghost `Clear`: enabled 10.73:1; the 58% recipe 4.01:1 —
  the state that produced the original report; the shipped 70% recipe **2.50:1**; a 0.38 alpha
  **2.10:1**. So the defect the ask names is already closed by 0.10.0, and 0.38 buys 0.4 of ratio.
  Two things make it a real question anyway rather than a no: alpha is the ONE candidate this file
  measured as having light/dark parity, and it is what Material and the UX skill say outright.
  Against it: it was ruled out on 2026-08-13 by the same head, and expressed as a consumer pin it
  would flatten the per-colour accent the recipe derives from `--_button-accent` — a disabled error
  button would go teal. **If it is ever taken, it belongs here as one recipe for every variant
  except solid, not as a pin in `platform-admin/_ds-overrides.scss`.** Rendered comparison of the
  three states was built for the decision and is not committed anywhere.

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

- [ ] **[P2] A consumer that clears or replaces `value` cannot clear the picker's own error.**
  `typedInvalid` / `rangeInvalid` are set from the typing paths (`applyEditedText`, `onFieldBlur`,
  `applyRangeText`) and cleared only by those and `applyPreset`. The constructor's `value → text` effect
  re-renders the field but touches neither, so `value.set(null)` leaves **"Enter a valid date
  (MM/DD/YYYY)" standing over an empty field**. Read in the 0.9.1 bundle, not inferred.
  `error` outranks the message but is no help here: a consumer that has just cleared the field has no
  error of its own to bind, and binding an empty string falls straight back to the picker's.

  **The only consumer workaround is destroying the control.** mm-broker's Create Campaign modal now tears
  its whole body down on `ds-modal`'s `closed` purely to get a fresh picker on the next opening — and
  that has a hole: reopening inside the 300 ms leave animation makes the modal cancel the close, `closed`
  never fires, and the stale error survives. Their Add Employee dialog is a second call site with no
  workaround at all, so a mistyped date of birth still reads "Enter a valid date" over an empty field the
  next time it opens.

  **Ask:** clear both flags when `value` changes from outside the control (the same effect that
  re-renders the text). Two consumer workarounds come out the day it lands.


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

- [ ] **[P3] Two stale strings that outlived the code.** The `maxVisibleChips` JSDoc in BOTH pickers
  still says "A NUMBER caps at exactly that many", which `7ceed418` made false; it feeds
  `component-api.generated.ts`, so the docs site renders it too. And `ds-config.ts`'s `control.size`
  JSDoc lists `multi-select` among the honouring controls — `ds-multi-select` has no `size` input.

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

- [ ] **[P2] Four overrides came out IDENTICAL in two independently-built apps — that is evidence about our defaults, not about a missing hook (filed as an item 2026-08-10; it had been prose since 08-07).** From reading `_ds-overrides.scss` across mm-broker's portals: `ds-page-header` title bumped to `--font-size-h2` (the DS defaults to h3); `ds-table` head set to tertiary text on `--surface-secondary` with a matching row hover; `ds-stat` given a tile radius and `--space-5` padding; `ds-sidenav-item` given a wash and a coloured label with `--ds-sidenav-item-rail: transparent`.
  **RESEARCHED then DECIDED 2026-08-12, against the consumer's live stylesheets and the type/spacing scales the DS already keeps. Three of the four close with NO default change; C4 is its own item below. The summary this item opened with was wrong in four places.**
  **What I read:** `mm-broker-platform/src/frontend/projects/{broker-portal,platform-admin}/src/styles/_ds-overrides.scss` — the live files, not the worktree copies.
  **The premise does not hold: these are not two independently-built apps.** Both projects sit in ONE Angular workspace in ONE repository — two portals of one product — and both page-header comments say the same thing, "H2 to match the design". The four "convergences" trace to a single design spec, not to two teams arriving separately. That was the whole force of the item; what is left is one consumer's brand preference, which is exactly what the hooks are for.
  **C1 (page-header 28px → 36px) — CLOSED, no change.** The heading LEVEL was never wrong: the component already renders `<h1 class="title">`, so "h3" here names a type RUNG, and the "nothing larger sits above it, so it is under-sized by construction" argument dissolves. On the rung: 28px is Material 3's Headline Medium and Apple's Title 1 — the canonical app-page-title size — while 36px is M3's Display Small, the expressive rung for one-off hero moments, not for a header that repeats on every page. Shopify Polaris, the closest analogue (a dense admin), sets its page title lower still. A DS default belongs on the productive rung; `--ds-page-header-title-fs` is the lever, both apps already use it, and its token description now names the rung and the reason.
  **C2 (table head) — CLOSED, and both halves were already answered.** `--text-tertiary` on `--surface-secondary` measures **4.30:1** at **12px bold**, which is NORMAL text by WCAG (the 3.0 exemption starts at 18.66px bold), so the floor is 4.5 and a DS cannot default below it. Their second declaration, `--ds-table-head-bg-color: var(--surface-secondary)`, is a **no-op** re-declaring our default. The "matching row hover" this item claimed appears in NEITHER file — and the DS already does the thing that was asked for: the row tint is `tr.clickable:not(.active):hover`, gated by `rowInteractive`, which is off by default, so a passive table stays static and the tint honestly signals clickability.
  **C3 (ds-stat padding 24px → 20px) — CLOSED on the value, and it exposed a real gap that IS now fixed.** The padding was never `ds-stat`'s to move: it resolves from `--ds-container-pad`, which `ds-card` shares, so either both move or neither does. On the value, 24px is where the field sits (Ant Design card body 24, shadcn/ui Card `p-6` 24) and 20px is not a canonical rung anywhere — so the base stays 24 and a consumer who wants 20 sets that one token, which is what it exists for. The gap underneath: the density tiers compress field and table padding at `ultra-compact` but left surface padding at 24px, so a card kept its full frame while its own cells halved. **`ultra-compact` now drops `--ds-container-pad` to 16px** — one rung, not two, because a frame reads as padding lost long before cells do.
  **C4 (sidenav item active) is now its own item below**, at Stas's request: it needs a second conversation, and unlike the other three it is a shape the DS could plausibly adopt.
  **Also spotted while reading, and it is theirs not ours:** platform-admin still carries a `.kpi` class "for a tile whose value is not text — a badge, say — which `ds-stat` has no slot for". It does: `[dsStatValue]` shipped in 0.9.0 and they are on 0.9.1. A DELETE-LIST candidate for their next sweep, not a DS gap.
  **The rule the group leaves behind, worth more than the four verdicts:** consumer overrides are evidence about a default only when they are genuinely independent — check the repository before counting them, because four identical declarations in one workspace are one opinion written twice.

- [ ] **[P2] `ds-sidenav-item` active state — solid accent pill → quiet wash + coloured label? (split out of the four-override item above on 2026-08-12, at Stas's request: "оставь но не удаляй пункт, ещё раз надо будет обсудить потом".)** Both mm-broker portals undo our active treatment the same way, and there are FIVE declarations, not the four the parent item counted: `--ds-sidenav-item-rail: transparent` plus `--ds-sidenav-item-label-weight: var(--font-weight-bold)` on top of the wash and the label colour.
  **What they agree on is a SHAPE, not a value.** broker-portal uses its own `--nav-active-bg`/`--nav-active-fg`; platform-admin uses `--primary-subtitle` + `--primary`. So the shared conclusion is "a quiet wash, a coloured label, no rail" — the DS could adopt that by deriving the wash from the accent family it already owns, and must not adopt either app's palette.
  **Why this one survived the cull while C1–C3 closed:** the others were a brand rung, a contrast floor and a shared token. This one is a genuine question about how loud a default should be, and emphasis is cheaper to add than to take away — a solid accent pill on every rail item is a strong opinion that both portals removed. But the same correction applies: the two portals are one workspace, so this is one opinion, and it is not a mandate.
  **Visual breaking change if it moves**, so it belongs in a batch, not a drive-by. **Needs a second conversation with Stas.**

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

- [ ] **[P3] `ds-menu-item` — a native secondary line, so an action can state a limitation without hover or focus (Stas 2026-08-17, mm-broker MBP-134).** Measured in broker-portal: **7** menu items across 4 files project a `<span class="item-reason">` as a second line inside the item, and the same five-line rule — `display: block; max-width: 14rem; color: var(--text-tertiary); font-size: var(--font-size-2xs)` — is copy-pasted in **4** component stylesheets. It works only because the default `<ng-content>` sits inside the item's own label `<span>` (`menu-item.component.html`), which is also the flaw: the reason lands **inside the accessible name** rather than as a description, and each consumer picks its own width cap. **What exists today, and is NOT the gap:** `disabled`'s own doc comment says the item stays keyboard-focusable "so a `[dsTooltip]` explaining why can be reached and shown" — and that is true, `TooltipDirective` binds `focusin` and writes `aria-describedby`, so the tooltip IS reachable by keyboard. What it cannot be is *visible without hover or focus*, which is exactly what a standing "this will not be saved" notice needs; that is the whole ask. **Ask:** a `description` (or `reason`) input rendered under the label and styled once here — block, 2xs, tertiary, with the width cap as a token instead of a consumer's `14rem` — plus a decision on whether it joins the accessible name or becomes `aria-describedby`. **The workaround is fine meanwhile**, so build this only if a second consumer repeats the pattern, or if the accessible-name relationship above is judged wrong.


- [ ] **[P3] `ds-list-item` cannot express a row that has its own control AND a row-level action (Stas 2026-08-18, mm-broker Set Up Carriers).** Read from the template, not guessed: `#content` holds `[leading]`, the title/subtitle body and `[trailing]`, and BOTH branches render it — so with `clickable` every projected node lands inside `<button class="activator">`. A row that carries a checkbox plus a row-level "choose this one" action therefore has no shape here: nesting the checkbox in the button is invalid and its click also fires `activated`, while dropping `clickable` loses `cursor`, `:hover` and `:focus-visible` (all scoped to `button.activator`) and `aria-current` (only on the button — `selected` alone just sets the host class). The consumer keeps a hand-rolled `<ul>` for exactly this reason, so the component is skipped where it would otherwise fit. **Ask:** render `[leading]` (and ideally `[trailing]`) OUTSIDE the activator, so the row can be a control and still hold controls — that is the master/detail selector shape: a checkbox on the left, the row selecting what the right pane shows. A `ds-list-item` in that shape would replace the consumer's list wholesale.

## Validation on the control: warning got a border, but the FILL was never judged (2026-08-13)

- [ ] **[P3] Build a deck for the tinted-fill variants of `warning` and `success`, and re-decide.**
  Stas chose **border only** for both on 2026-08-13, from
  `presentations/field-validation-states.html` — but explicitly parked the fill: "может быть я
  передумаю про заливку потом когда посмотрю". The current ladder is error = border + fill,
  warning/success = border only.
  The variants to render, which the deck already has stubs for:
  `warning` fill `--warning-subtitle` (#FFFBEA, 1.05:1 against a white field — the open worry is
  whether it survives a phone screen in daylight) and `success` fill `--success-subtitle` (#ECFAEE).
  Judge them **beside an error field in the same form**, since the question is not "is it visible"
  but "does warning still read as weaker than error".
  Not now — return to it deliberately.

# Decisions — waiting on Stas, not on work

Nothing moves until a verdict; the work behind each is scoped.

## Priority board (2026-08-10 actualization)

**23 open — 9 P2 and 14 P3 — but the count flatters the board.** **Twelve are parked**: ten P3s waiting on a first consumer ask (splitter, CascadeSelect, lightbox, CDK Menu, `ds-select` native multi, stepper formatting, row-expansion deltas, primary-CTA, MED, inspect mode) and two kept deliberately as decision records not to be "simplified" (`role="banner"`, the duplicated `compact` condition). **A P2 — shared picker internals — is open against its own recommendation**, which is not to build it until a fourth list picker appears.

**So the live board is six decisions and one piece of work.** _(0.9.0 was CUT on 2026-08-10 — the P1 that everything queued behind is done, and the release chain ran clean: publish to npmjs, docs deployed.)_ The decisions: **Angular 22**, whose peer range we currently exclude and which should be settled before the next cut · **packaging A/C/D** · **the breaking batch**, decided as one story · **the four identical consumer overrides**, which are evidence about our defaults · **verdicts B1–B5** plus a colour space, for the interlocked token trio · **the LOOK** for `dirty` / `pending` / `disabledReasons`. The work: the `ds-modal` status widening (breaking, so it rides the batch) — width-based overflow shipped as an opt-in on 2026-08-11, leaving only its default flip, which is already a member of the batch. _(Composition rules closed 2026-08-10: all three rule gaps written and rendered at `Practice → Composition rules` from the same file the package ships.)_

**Cleared 2026-08-06, after the agent-portal audit + Misha's review:** all four P2 items from the audit (table head padding — which also turned up `density="compact"` defeating every padding hook — the table pager inputs, the four autocomplete search gaps, the autocomplete panel radius), plus `ds-search` on the field-height contract. Two docs-site defects Misha found are fixed as well: `/changelog` served from a one-year `immutable` cache on a stable-name file, and sidebar anchors needing a second click — `onItem` scrolled, then the `routerLink`'s path change made `ds-app-layout` reset the scroll and undo it; the links now carry `dsSamePage`. (My first diagnosis blamed a lazy-load race and was WRONG: measurement showed the sections are always mounted by then, and the live site reproduced the real cause instead — first click 0px, second 15145px.) `sortMode`/`filterMode` now default to `'server'` (Stas 2026-08-06, breaking, migration written).

**Consistency sweep the same day, unasked-for but adjacent:** one `dropdownOverlay()` replaced six byte-identical overlay configs, and six more controls joined the field-height contract — there are now no raw `--hit-cozy` heights left in the library.

**RELEASE GATE, recorded 2026-08-07 — read before adding anything breaking.** `dev` carries **8 actionable migrations** on top of 0.8.0 (three from the auth-layout rename, ds-search height, the removed --search-h, the sortMode/filterMode default, number-stepper lg, and the ds-tabs urlParam pass). On this repo policy that is **0.9.0**, and it is sitting uncut. mm-broker is still on **0.7.1** and the 08-07 audit found they had not adopted hooks from releases they already have — so every further breaking change added here makes the one migration they must swallow larger and adoption less likely. **Cut 0.9.0 with what it has; hold the next breaking batch for the release after.** That single decision sequences most of the board: the modal status widening (error: boolean -> DsStatus) and the four candidate DEFAULT changes below both want the same later major, and so does packaging option D, since it changes how every consumer imports. Additive work is not gated by any of it, and a fair amount has shipped under that reading since — the `ds-stat` value slot, the modal padding tokens, `[dividers]`, the modal title badge and subtitle, breadcrumbs `maxItems`, `maxVisibleChips`, and the `design-system.md`/`components.md` split.

**A consumer is now waiting on the cut, which is new (2026-08-10, from mm-broker).** "Start converting" cannot start on **0.7.1**: verified on their own stack, `ds-select` and `ds-date-picker` bind under `[formField]` and compile, but **`ds-input` does not** — three template type errors per input, `number | undefined` against `number | null` on `min`/`max`/`maxLength`, which is exactly what `fc1714d5` fixes. `ds-input` is in nearly all twenty of their forms, so the migration is gated on a release carrying that commit, not on anything they can do. This does not argue for cutting *early* or for a backport — only that the cut now unblocks work rather than merely tidying `dev`, which is a different weight than it had on 08-07.

_Closed 2026-08-07 from a consumer report: `ds-autocomplete` had no chip cap, so a multi-select trigger grew a line per selection. `maxVisibleChips` ported from `ds-multi-select` under the same name. Checked the rest of the library — only those two components render a chip list, so nothing else needed it; the pinkmoon prototype the reporter half-remembered is the filter-bar "+N more", which is already `ds-filter-bar`._

**P1 — real defects:**

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
