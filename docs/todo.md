# DS — improvements backlog

- [ ] **[P2] `stickyScrollbar` is a whole-app opinion that has to be repeated per table — 35 out of 35
  (Stas 2026-08-12).** Measured in mm-broker after the fork retirement: every single `ds-table` in the
  three portals binds `[stickyScrollbar]="true"`, because the fork it replaced mirrored the horizontal
  scrollbar unconditionally and nobody wants a wide table whose only scrollbar sits below the fold. A
  35/35 ratio is not a per-instance decision; it is a house default expressed 35 times, and each new
  table is one forgotten binding away from a table that scrolls invisibly. **The mechanism already
  exists and this needs no new one:** `DS_CONFIG.field.reserveMessage` and `DS_CONFIG.modal.dividers`
  are the same story — the input is typed `boolean | null` with a `null` default so "not bound" stays
  distinguishable, and a `resolve*` helper reads config when it is `null` (`field-defaults.ts`,
  `modal-defaults.ts`). Ask: `DsConfig.table.stickyScrollbar`, resolved that way, with an explicit
  binding still winning. **Measured and NOT asked for: `bordered` splits 18/17 across the same 35
  tables** (a border reads as "grid of data", its absence as "list of things"), and `persistLayout` is
  on exactly one — those two are genuinely per-table and should stay inputs only.

- [ ] **[P2] `ds-table` shows its `emptyTemplate` while the first read is still in flight, so every
  consumer writes the same guard inside its own template (found 2026-08-12).** The base's body is
  `@if (isSkeletonLoading()) { skeletons } @else if (!filteredData().length) { emptyTemplate } @else
  { rows }` — so **only `loading="skeleton"` suppresses the empty row**. With `loading="overlay"`, the
  mode a list uses once it has been loaded at least once, a zero-row load paints the empty state *under*
  the spinner: "No agents yet" plus a "Connect Agents" call to action, on a table that has not finished
  asking. Evidence, and it is worse than "every consumer writes the guard": of mm-broker's 14
  overlay-loading tables only **5** had one and the other **9** shipped the lie — broker `campaigns`
  saying "No campaigns match your filters.", admin `users` its whole `ds-empty-state` — because branching
  `listFailed()` vs empty looks complete while guarding nothing about loading. All 9 now end their chain
  with `@else if (!store.listLoading())`. (Their retired fork had the identical condition, so this is not
  a 0.9.x regression — it was wrong in both.) "No rows yet" and "no rows, ever" are different statements and only the table knows
  which one it is in. Ask: skip the empty row whenever `loading !== false`, regardless of mode — or, if
  a consumer must be able to say something during a load, pass the loading flag into the template
  context (`let-loading`) so the choice is at least expressible without reaching for the page's own
  signal. Fourteen identical guards is the library asking the app to remember something it knows itself.

- [ ] **[P3] `TableColumn` cannot say "size this column to its content", and that is the last reach a
  consumer needs into the table's markup.** mm-broker retired its `ids-data-table` fork onto `ds-table`
  on 2026-08-12 — 35 tables, and the only styling that could not come with it is two blocks of
  `:host ::ng-deep ds-table { .table th, .table td { width: 1%; white-space: nowrap } }` on their users
  and carriers lists. The need is ordinary: an auto-layout table spreads leftover width evenly, so short
  data columns end up as wide as their headers and the one column that should absorb the slack (a name)
  does not. `width` takes fixed pixels, which is a different thing — pin one column and the rest still
  spread. `width: 'content'` (or a `fit?: boolean`) would express it, and would delete the last
  `::ng-deep` those pages have. Marked in their tree as `TODO(ds-shrink-to-content)`.

Running list of design-system improvements. Add items here as they come up.
Deep gap analysis: `docs/superpowers/ds-gap-analysis.md`. Outstanding audit (a11y/API): `docs/superpowers/library-audit.md`.
Packaging / initial-bundle chunking: `packaging-chunking-audit.md` (2026-08-03 — also lists corrections this file still owes).
**Baseline: v0.9.0 is released** (2026-08-10) — everything the 08-06→08-10 sessions built shipped in it, so "since the last release" now means since 0.9.0. Its migration manifest is `migrations/0.9.0.json` (10 actionable + 53 informational, the last 21 being the DELETE-LIST). **The per-release prose guide is retired** — it duplicated the manifest in a form nothing read and went stale inside one release; the delete-list now lives in the manifest and in the CHANGELOG block.

Completed items are archived in `done.md` (last archive pass **2026-08-10**; before that 08-06/07 and 08-05. Last full re-verification of open items **2026-07-24**, by 12 parallel audit agents — several items have been corrected against the code since, each noted in place).

---

## Priority board (2026-08-10 actualization)

**23 open — 9 P2 and 14 P3 — but the count flatters the board.** **Twelve are parked**: ten P3s waiting on a first consumer ask (splitter, CascadeSelect, lightbox, CDK Menu, `ds-select` native multi, stepper formatting, row-expansion deltas, primary-CTA, MED, inspect mode) and two kept deliberately as decision records not to be "simplified" (`role="banner"`, the duplicated `compact` condition). **A P2 — shared picker internals — is open against its own recommendation**, which is not to build it until a fourth list picker appears.

**So the live board is six decisions and one piece of work.** _(0.9.0 was CUT on 2026-08-10 — the P1 that everything queued behind is done, and the release chain ran clean: publish to npmjs, docs deployed.)_ The decisions: **Angular 22**, whose peer range we currently exclude and which should be settled before the next cut · **packaging A/C/D** · **the breaking batch**, decided as one story · **the four identical consumer overrides**, which are evidence about our defaults · **verdicts B1–B5** plus a colour space, for the interlocked token trio · **the LOOK** for `dirty` / `pending` / `disabledReasons`. The work: the `ds-modal` status widening (breaking, so it rides the batch) — width-based overflow shipped as an opt-in on 2026-08-11, leaving only its default flip, which is already a member of the batch. _(Composition rules closed 2026-08-10: all three rule gaps written and rendered at `Practice → Composition rules` from the same file the package ships.)_

**Cleared 2026-08-06, after the agent-portal audit + Misha's review:** all four P2 items from the audit (table head padding — which also turned up `density="compact"` defeating every padding hook — the table pager inputs, the four autocomplete search gaps, the autocomplete panel radius), plus `ds-search` on the field-height contract. Two docs-site defects Misha found are fixed as well: `/changelog` served from a one-year `immutable` cache on a stable-name file, and sidebar anchors needing a second click — `onItem` scrolled, then the `routerLink`'s path change made `ds-app-layout` reset the scroll and undo it; the links now carry `dsSamePage`. (My first diagnosis blamed a lazy-load race and was WRONG: measurement showed the sections are always mounted by then, and the live site reproduced the real cause instead — first click 0px, second 15145px.) `sortMode`/`filterMode` now default to `'server'` (Stas 2026-08-06, breaking, migration written).

**Consistency sweep the same day, unasked-for but adjacent:** one `dropdownOverlay()` replaced six byte-identical overlay configs, and six more controls joined the field-height contract — there are now no raw `--hit-cozy` heights left in the library.

**RELEASE GATE, recorded 2026-08-07 — read before adding anything breaking.** `dev` carries **8 actionable migrations** on top of 0.8.0 (three from the auth-layout rename, ds-search height, the removed --search-h, the sortMode/filterMode default, number-stepper lg, and the ds-tabs urlParam pass). On this repo policy that is **0.9.0**, and it is sitting uncut. mm-broker is still on **0.7.1** and the 08-07 audit found they had not adopted hooks from releases they already have — so every further breaking change added here makes the one migration they must swallow larger and adoption less likely. **Cut 0.9.0 with what it has; hold the next breaking batch for the release after.** That single decision sequences most of the board: the modal status widening (error: boolean -> DsStatus) and the four candidate DEFAULT changes below both want the same later major, and so does packaging option D, since it changes how every consumer imports. Additive work is not gated by any of it, and a fair amount has shipped under that reading since — the `ds-stat` value slot, the modal padding tokens, `[dividers]`, the modal title badge and subtitle, breadcrumbs `maxItems`, `maxVisibleChips`, and the `design-system.md`/`components.md` split.

**A consumer is now waiting on the cut, which is new (2026-08-10, from mm-broker).** "Start converting" cannot start on **0.7.1**: verified on their own stack, `ds-select` and `ds-date-picker` bind under `[formField]` and compile, but **`ds-input` does not** — three template type errors per input, `number | undefined` against `number | null` on `min`/`max`/`maxLength`, which is exactly what `fc1714d5` fixes. `ds-input` is in nearly all twenty of their forms, so the migration is gated on a release carrying that commit, not on anything they can do. This does not argue for cutting *early* or for a backport — only that the cut now unblocks work rather than merely tidying `dev`, which is a different weight than it had on 08-07.

_Closed 2026-08-07 from a consumer report: `ds-autocomplete` had no chip cap, so a multi-select trigger grew a line per selection. `maxVisibleChips` ported from `ds-multi-select` under the same name. Checked the rest of the library — only those two components render a chip list, so nothing else needed it; the pinkmoon prototype the reporter half-remembered is the filter-bar "+N more", which is already `ds-filter-bar`._

**P1 — real defects:**

- [x] **[P1] `ds-autocomplete` keeps the filter text after a single-select pick, so the trigger shows the label AND the query side by side (found 2026-08-11 in mm-broker, on 0.7.1; still present in `dev`).** Type `North`, pick `Northwind Trading — census not ready`, and the trigger reads `Northwind Trading — census not ready  North` until the field is re-focused and cleared by hand. Reproduced with real clicks in a browser, not with a scripted one.
  **Cause, and it is one line.** The trigger renders `<span class="autocomplete-value">{{ displayLabel() }}</span>` next to `<input [value]="query()">`, so anything left in `query` is drawn beside the selected label. `onPick` sets the value and closes for the single-select branch but never resets `query`; `close()` does not touch it either. `onCreateNew` immediately below **does** `this.query.set('')`, which is the same reset this path is missing.
  **FIXED 2026-08-11, but one line lower than filed and for a second reason the headline does not cover.** The proposed `this.query.set('')` in `onPick`'s `else` branch would have left half the defect standing: typing over a settled value and dismissing with Escape strands the text the same way, and that path never reaches `onPick`. The clear went into `close()` under `if (this.displayLabel())` — which is `''` in multi mode, so it covers both single-select paths and leaves multi alone in one condition.
  **The headline is right for 0.7.1 and stale for `dev`, which is worth knowing before reading a repro.** The input's `collapsed` state (zero width whenever a label is on show) landed in **0.9.0**, after the version mm-broker reported from — so on 0.7.1 the query really did sit beside the label, and on 0.9.0+ it is INVISIBLE instead. The damage moved rather than healed: measured in a browser, reopening a settled picker listed **one** option of four with nothing on screen explaining why, and no way to clear it. Now: four of four.
  **Verified all three behaviours in a real browser** — pick then reopen (was 1 option, now 4), type-over-value then Escape then reopen (query now empty), and multi-select untouched (query survives a chip pick, stays visible after Escape, since its input never collapses).
  **Reach:** every single-select `ds-autocomplete` where the user types to filter. Was not app-fixable — `query` is private to the component.

- [x] **[P1] Cut 0.9.0 — DONE 2026-08-10, by Stas, while this item was being filed.** The three-pipeline chain ran clean end to end: `cut-release.sh minor` merged dev→main and tagged, the `v*` pipeline published `@ids-group-ltd/ids-design-system@0.9.0` to npmjs (69 files, 853.5 kB), and the `main` pipeline built and uploaded the docs. **One gap the logs exposed:** `npm version` promoted `migrations/unreleased.json` → `0.9.0.json` but left the prose guide folder at `unreleased/`, where the next release would have written over it — and the manifest pointed at that path. The guide has since been retired outright (it duplicated the manifest in a form nothing read); the release script now promotes a guide folder if one exists, so the same slip cannot recur.

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

## Consumer audits — all items shipped, kept for two live facts (2026-08-05 → 08-10)

Three dogfooding passes drove most of what shipped since 0.8.0 — mm-broker's `ids-data-table`
retirement, the mm-ecm agent-portal `styles.scss` read as a record of what the DS made it
write, and mm-broker's `_ds-overrides.scss`. **Every item they produced is now closed and
archived in `done.md` with its provenance.** Two facts stay here because they are still true:

- **mm-broker has not retired its fork yet**, and two of its API decisions invert ours:
  `hideable` (the fork treats every column as hideable unless opted out, the base only when
  `hideable: true`) and `bordered` (`true` → `false`). Retiring the fork means touching every
  column config and every template — migration notes for them, not asks for us.
- **The four IDENTICAL overrides in two independently-built apps** are the finding worth
  acting on, and it is the DEFAULTS item above rather than anything in these sections.

The lesson these audits keep producing is recorded once, in the composition-rules item:
eight consumer workarounds were written against hooks that already existed, because nothing
ever told them a thing had been tokenised. That is what the `DELETE-LIST:` entries in each manifest
("what you can now DELETE") exists to fix.

## Architecture / tokens

> **Token-architecture pass (P2, interlocked).** The three items below + the semantic radius+elevation role layer (under "Missing tokens / foundations") share ONE principle — a **role layer between foundation and component**, single pointer, shades cascade. Spec them together; sequence the single-source colour model first and the rest fall out. Don't action piecemeal. _(The typography `.t-*` `--ds-t-*` hooks — the same consumer-first contract at the global utility layer — already SHIPPED 2026-07-24, see done.md.)_

- [ ] **[P2] Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24).** ROOT CAUSE (surfaced when a consumer scoped `--primary-h/s/l` on a checkbox and ONLY the focus halo moved): "primary" has TWO decoupled reps — (a) `--primary` + hand-picked ramp shades read by component FILLS; (b) `--primary-h/s/l` HSL channels feeding ONLY math-derived halos/ramp/gray-tint — with **no live link**, so a coherent scoped recolour needs BOTH the channels AND a `--primary` re-composition (the 3-/4-token footgun). **Re-verified true 2026-07-24** (`_semantic.scss:91-93` channels; `:111-112` hover/pressed already `color-mix`; halos `:209-229`; gray tint `_base-palette.scss:41`). **IDEA:** one colour token per role as the only source; shades via `color-mix()`, hue via `hsl(from var(--primary) h <S> <L>)` keeping each step's hand-tuned S/L (see [[feedback-handtuned-colors-beat-formulas]] — only the HUE is single-sourced); drop `--primary-h/s/l` as PUBLIC API. Scoped recolour becomes ONE declaration; **UNBLOCKS the `ds-color`/`--accent-*` indirection**. **OPEN for the spec:** (a) colour space (`oklch`/`oklab` perceptual vs `srgb`/`hsl` matches today) — verify each derived role visually; (b) pure-derived vs hand-pick per role; (c) relative-colour + `var()` edge cases in the 3 target engines; (d) dark-theme interplay. Prototype: `presentations/color-engine-relative.html`.
- [ ] **[P2] `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]]).** Replace per-component `--ds-*-bg-hover/-active` + scattered `color-mix()` with ONE contract: a `.ds-interactive` class + presets driven by `--state-step-*` tokens in a NEW `src/lib/styles/_interaction.scss` (**still absent — verified 2026-07-24**), with an override slot (`--interactive-*-set`). Then migrate interactive components off their local recipes. **NEXT — blocking user verdicts B1–B5** (live demo `presentations/interaction-formula.html`): (B1) tint-pressed 28% vs 34%; (B2) pressed step for neutral surfaces (menu-item/table rows); (B3) danger menu-item hover — formula vs `--error-subtitle`; (B4) shape of the `--interactive-*-set` slot; (B5) pressed step for success/warning buttons. **Rewritten 2026-07-24:** the old "retire `_forced-states` duplication" clause is now MOOT — `_forced-states.scss` no longer exists (docs state-forcing is per-section `:host ::ng-deep .pin-*` reading each component's `--_*` resolvers). What survives is the broader "should presentational/state styling live in global partials (like `_link.scss`) with components as thin sugar" question. (Housekeeping DONE — re-grepped 2026-08-10, the stale `_forced-states` refs are gone from `README.md` and `table.component.scss`; nothing outside `.claude/` mentions it.)
- [ ] **[P2] Theme recipe vs hand-tuned picks — alignment decision.** Button/icon-button state derivation uses the theme's 88%/76% mix-to-black recipe (**verified `button.component.scss:34-38`, `_semantic.scss:111-112`, 2026-07-24**). If the single-source-colour calibration replaces `--primary-hover/-pressed` with hand-tuned values, the button defaults (color-mix off the resolved bg) diverge from the theme roles — decide then: components read role tokens again, or theme keeps the formula. **This is a concrete instance of the single-source item's open question (b); resolve it inside that spec, not separately.**

## Animations — motion system audit (2026-06-26), premise no longer holds

The 06-26 audit said the foundation was healthy but the problem was breadth: "many interactive state changes have NO `transition` and SNAP". **Re-measured 2026-08-10 and that is no longer true** — 45 of 81 component stylesheets declare a `transition`, and of the files that style `:hover`, only five lack one: `alert`, `banner`, `drawer`, `modal`, `sidenav-footer`, all of which are surfaces animated by keyframes rather than controls. Its one concrete slice, rounded `:active`, shipped 2026-07-02 and is archived. Reference patterns, still the ones to copy: animate-then-remove = `bottom-sheet.component.ts` / `toast-region`; state-change transition = `input.component.scss`.

## DS-docs showcase

- [ ] **[P3] Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below).** A section-heading toggle that draws a visual "inspect" overlay on the live demos: colour-coded lines/boxes for paddings, gaps, sizes with values+units, plus WHICH token/class drives each value. Read computed styles + `getBoundingClientRect`; map values back to the `--space-*`/`--radius-*`/`--font-size-*` scales. **Rewritten 2026-07-24 → start as a scoped pilot:** spacing-only on ONE section (e.g. button), then generalize. Greenfield, docs-only, no product impact. _(Verified: nothing exists today.)_

## Component feature gaps

- [ ] **[P3] Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog with the deck attached (not built, not closed).** Deck: `presentations/select-native-multi.html` — three variants live, comparison matrix and sources; it is the prepared answer if a consumer ever pulls on this. Native `<select multiple>` is not a cheaper spelling of the same control, it is a documented antipattern: multi-selection is reachable only through Ctrl/Cmd- or Shift-click with nothing in the control announcing it, an unmodified click **discards the entire prior selection**, non-adjacent options cannot be selected from the keyboard at all, and screen readers handle it worse than a single `<select>`. The consensus alternative is a checkbox list — which is exactly what `ds-multi-select` already is.
  **The soft version of the ask does not survive either:** the moment a hypothetical `ds-select multi` is made usable it has to open a checkbox list, i.e. it becomes `ds-multi-select`, and the only genuine difference left is chips-in-trigger vs an "N selected" summary. If a consumer ever wants the compact trigger, the honest answer is an input (`[triggerDisplay]="'summary'"`) on the existing component, not a second component and a fork in the docs. The one case where nativeness would really matter — a plain HTTP form POST with no JS — is solved by a hidden `<select multiple>` inside `ds-multi-select`, not by changing the UI.
- [ ] **[P3] `ds-table` — row-expansion parity polish vs PrimeNG (ref https://primeng.dev/table#row-expansion).** Base row expansion ALREADY SHIPS — `expandableRows` + two-way `expandedIds` `model<Set<string>>` (multiple + programmatic), `rowExpandTemplate`, expander button/chevron/`expandedColspan`, docs demo (`table.section.html:574-600`). So this is **deltas only, not a build**: (a) optional **single-expand mode** (only one row open at a time — today it's always multi via the Set); (b) **expand-all / collapse-all** header toggle (the header expand-col is currently just a spacer); (c) optional dedicated `(rowExpand)`/`(rowCollapse)` outputs (the `expandedIds` model already covers change-tracking, so this is sugar). All small; do only on a consumer ask — the core feature is at parity.
- [ ] **[P3] `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber.** Today it's a raw `value: number` + `min`/`max`/`step` + spinner, no display formatting. PrimeNG InputNumber's value-add is a formatted numeric field: thousands grouping, fixed decimals, currency/percent, locale-aware, parsed back to a number on edit. Add opt-in `mode` (decimal/currency/percent) + `locale`/`currency`/`minFractionDigits`/`maxFractionDigits`/`useGrouping`; format on display/blur, parse on focus/input. Masking prior art in-house: [[reference-masked-input-dom-writeback]] (pinkmoon phone/w3w imperative `element.value` write-back). No active request — likely pulled by the financial-admin consumers (mm-broker admin, pinkmoon amounts/rates/%); gate on the first such form.

- [ ] **[P2] One entry point for the whole library means a consumer cannot keep the DS out of their initial bundle (2026-08-03, Stas — mm-broker MBP-133 review).** _(Re-counted 2026-08-05: **85** exported `*Component` classes plus 9 directives (re-counted 2026-08-10; was 83 + 8 on 08-05), by `grep -rho 'export class .*Component' src/lib | sort -u`. The item said 73; the figure does not change the argument, but it is now stated with its method so nobody re-counts.)_ `ng-package.json` declares a single `entryFile`, so the package ships as one 1.25 MB `fesm2022` module behind a single `"."` export. `sideEffects: false` is set and tree-shaking works fine — unused components are dropped — but **chunking cannot happen**: esbuild splits by module, so it can never place two DS symbols in two different chunks. Measured in mm-broker: the app's eager composition root binds `NotificationService` to a toast implementation, that one runtime import of `ToastService` pins the whole retained DS graph into a chunk statically imported by `main`, and the result is **632 kB — about 88% of a 720 kB initial bundle** — even though every feature route is lazy and the only eagerly-needed symbol is one service. The consumer has no lever: the root is the only specifier, and moving the provider to a lazy route does not help because interceptors and the `ErrorHandler` resolve from the root injector. **Ask:** secondary entry points (ng-packagr supports a nested `ng-package.json` per folder). Even a coarse split would fix it — a services/overlay entry point carrying `ToastService`, `ModalService` and `BodyScrollLockService` separately from the component layer, so an eager root can import the service and leave 70-odd components lazy. Per-component entry points would be ideal but are a bigger change; the services split is the one that unblocks consumers. **Explicit non-goal:** nothing about the public API surface needs to change — same symbols, same names, just reachable through narrower specifiers. **RE-AUDITED 2026-08-03 → read `packaging-chunking-audit.md` before actioning this item; three claims above are wrong.** The mechanism is confirmed by controlled esbuild fixtures, but: this was never filed upstream (it is the consumer's own backlog item, with a consumer-side fix); "the consumer has no lever" is false (a dynamic `import()` keeps `main` clean — it just costs tree-shaking, measured +50%); and the 07-27 "tree-shaking already works" verdict is NOT overturned — placement and tree-shaking are orthogonal and both findings stand. The audit also merges this item with the "Packaging — secondary entry points" section below, which duplicates it with the opposite verdict.

  **DECIDED 2026-08-05: option B from `packaging-chunking-audit.md` §7 — one services entry point, root `public-api.ts` kept as a facade.** It is the only option the fixtures measured as fixing chunk PLACEMENT without losing tree-shaking, and it is non-breaking: same symbols, same names, no cross-entry deep-import refactor across 73 folders. **Two things to get right when building it, both found while deciding:** (1) the entry point is NOT as narrow as its name — `ToastService` imports `ToastRegionComponent` and `ModalService` imports `ModalConfirmComponent`, so the entry necessarily carries those components and their own deps; that still fixes the reported problem, because the ~70 components the app touches only from lazy routes stop being pinned into `main`, but the eager cost is the toast+modal graph rather than three classes. (2) The secondary entry must OWN the source and the root must re-export FROM it — if both entries export the same source, a consumer importing from both gets two class identities and DI silently resolves two different services. **CORRECTED 2026-08-05, before anyone builds it: option B is NOT implementable as the audit describes it, and the audit is wrong on this point because it measured synthetic fixtures rather than the real import graph.** Followed the actual chain: `ToastService` → `ToastRegionComponent` → `ToastComponent` → `IconComponent` + `SpinnerComponent`; `ModalService` → `ModalConfirmComponent` → `ButtonComponent` + `ModalCardComponent` → `IconComponent`. So a services entry point must OWN button, icon, icons.data, spinner, toast and modal-card — and every other component needs those same leaves, so the ROOT would have to import them from the services entry. ng-packagr forbids cycles between entry points, so there is no arrangement where a small services entry sits beside an unchanged root. What that shape actually is: a LAYERED set of entries — `core` (icon, button, spinner, overlay primitives) ← `services` ← `components` — which is the audit's option D, described there as a separate large refactor, and it changes how every consumer imports. **So the live choice is A, C or D — not B. Described 2026-08-05 at Stas's request and DELIBERATELY LEFT OPEN: nothing here is urgent (no consumer is blocked, only sub-optimally chunked), and each option's cost lands somewhere different.**

- **A — do nothing.** Every feature route in the consumer is already lazy, so the DS chunk arrives with the first route rather than before it; what the 632 kB measurement really shows is that one eager `ToastService` import pulls the retained graph into `main` instead of into route 1. Cost: zero. What stays wrong: a cold first paint carries components the first screen does not use. Closing on A means recording that trade as accepted, since the numbers will resurface in the next consumer audit.
- **C — consumer-side dynamic `import()`.** The consumer's composition root imports the service lazily, which keeps `main` clean with no DS change at all. Measured to cost ~50% of the tree-shaking win (the dynamic specifier defeats static analysis, so more of the graph is retained). Also NOT ours to make: the fix lives in the consumer's repo, and per the scope rule this repo does not plan changes there — so choosing C means closing the DS item and letting the consumer decide.
- **D — layered entry points: `core` (icon, button, spinner, overlay primitives) ← `services` ← `components`.** The only shape that fixes chunk PLACEMENT without losing tree-shaking, and the only one that survives the real import graph: `ToastService → ToastRegionComponent → ToastComponent → IconComponent + SpinnerComponent` and `ModalService → ModalConfirmComponent → ButtonComponent + ModalCardComponent`, so a services entry must own those leaves, and every other component needs them too — which is why B (a narrow services entry beside an unchanged root) cannot exist: ng-packagr forbids entry-point cycles. Cost: ~40 files change imports inside the DS, the public specifier set grows from one to three, and every consumer's imports move (a codemod-able rename, but a breaking one needing a major). Benefit: an eager root can hold `ToastService` while ~70 components stay behind lazy routes.

**Two traps recorded while deciding, so they are not re-derived:** (1) the secondary entry must OWN its source and the root must re-export FROM it — if both export the same source a consumer importing from both gets two class identities and DI silently resolves two different services; (2) the audit's fixtures were synthetic, which is exactly how it concluded B was viable, so validate any future claim against the real import graph.

- [x] **[P3] `.link` on a `<button>` needs a reset the DS should own — DONE 2026-08-11, with two more declarations than the ask, measured rather than assumed (2026-08-11, mm-broker MBP-143).** `ds-button` warns at runtime: *"variant=\"text\" is discouraged — prefer the global `.link` class for link-styled actions"*, so the DS actively routes consumers to `.link` for ACTIONS. An action that is not navigation has to be a `<button>` — but `_link.scss` is written for anchors by its own comment ("so consumers can apply it to inline anchors inside `<p>` text"), and it styles nothing away from the button's UA chrome. So every consumer that follows the advice writes the same four lines. mm-broker now carries them in `_ds-overrides.scss` after replacing three near-duplicate local `.link-button` classes with `.link sm standalone` across nine buttons.
  **Ask, as filed:** add one selector to `_link.scss` — `button.link { padding: 0; border: 0; font-family: inherit; background: none; }`. Nothing else; `white-space` is a consumer layout choice and must stay out. Everything visual already works on a button today (colour, underline, hover/active `color-mix`, `:focus-visible` shadow, `aria-disabled`), which is why this is a four-line completion of an existing decision rather than a feature.
  **Shipped as `&:where(button)` with EIGHT declarations, because the filed four leave five differences standing.** Measured in a page holding nothing but the compiled `_reset.scss` and `_link.scss`, an `<a class="link">` against a `<button class="link">` in the same paragraph: with the filed four applied the button was still **13.3px inside 14px text** and still `line-height: normal`, because a UA button's font SIZE does not inherit and `font-family: inherit` does not carry it. So `font-size` and `line-height` were added, plus `text-align` (UA `center` vs inherited `start`, which only shows once the button has a width) and `appearance: none`, which shows no difference in Chrome and is there for the WebKit engines. `:where()` keeps the reset at `.link`'s own specificity so a consumer rule still wins on source order — the same reason `_focus.scss` uses it.
  **`font-weight` is deliberately absent** so `.quiet` / `.standalone` keep deciding it; verified with the tokens present that base stays 500 and `.standalone` 700 on the button, matching the anchor. **`display` is deliberately absent** too: `inline-block` is what makes a standalone button lay out predictably, and normalising it would not buy an anchor's line-wrapping anyway. On the real docs site the two now differ on **nothing** measurable except that box height (20px vs 18px, which is the inline-block line box).
  **The docs page was already claiming this worked** — its lede says "apply directly to any `<a>` or `<button>`" — so the class had been under-delivering on a documented promise, not just an implied one. A specimen now shows an anchor and a button side by side in running text instead of only asserting it.
  **Not fixable in a browser I have:** Chrome runs with force-dark here, which rewrites computed colours — an `<a>` reported the same `background-color` as a bare `<button>`, so `background: none` could not be judged empirically. Kept on the spec: the UA sheet declares `button { background-color: buttonface }` and nothing in `.link` overrode it.

## Missing components (from gap analysis)

Most of the original gap list has SHIPPED (verified 2026-07-24: multi-select · button-group · segmented · timeline · description-list · list · data-grid · confirm-dialog · layout · color-picker · slider · otp-input · tree · loading-overlay · split-button; plus this session's `ds-app-layout` + `ds-sidenav-footer`). Remaining:

- [ ] **[P3] Image / lightbox.** No demand stated; overlay/motion infra (`modal`/`drawer`/`overlay-motion.ts`) exists to build on.
- [ ] **[P3] Splitter — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Resizable split panes (drag a divider to resize adjacent regions). **DECISION-PENDING** on need. Reference: this session's `ds-table` column-resize pointer logic (`onResizeStart/Move/End`) is a ready basis for the drag mechanics (panes vs columns aside).
- [ ] **[P3] CascadeSelect — ASKED 2026-08-05, Stas: keep in the backlog for now (not built, not closed).** Hierarchical cascading dropdown (ref https://primeng.dev/cascadeselect).** Pick a leaf from nested groups via a compact overlay that expands sub-levels (Country → State → City). GAP: `ds-select`/`ds-multi-select` are FLAT dropdowns; `ds-tree` is a full inline tree VIEW (single-select via `selectedId`), not a compact selector; `ds-menu` is an actions menu, not a value control — so no cascading value-select exists. Niche (category / geo pickers), no active request. Building blocks if pulled: `ds-tree`'s `TreeNode` model + the shared overlay/popover infra + `ds-select`'s trigger. Otherwise document "use `ds-tree` for inline hierarchy, or flatten into grouped `ds-select`".

## Missing tokens / foundations (from gap analysis)

- [ ] **[P3] Primary-button CTA token layer — ASKED 2026-08-05, Stas: keep in the backlog.** Add opt-in `--primary-cta`/`-hover`/`-active`/`-on`, defaulting to the `--primary*` family; the default solid button (the `--c-base`/`--accent` slot — **note: no `.primary` class; verified `button.component.scss:23,35`, 2026-07-24**) reads them. Lets a brand give the CTA a deeper AA-safe fill when it rebrands `--primary` to a light colour, without darkening the role everywhere. Default theme needs nothing (white-on-`--primary` already ~5.5:1 AA). Ported from the a11y branch (`--brand-cta`); dropped in merge because the tokens didn't exist on main and default passes AA.
- [ ] **[P3] MED cluster — ASKED 2026-08-05, Stas: keep in the backlog.** Density beyond hit-targets (fonts/icons/pad — `[data-density]` scales heights/pad/avatars today but NOT `--font-size-*`/`--icon-*`, verified 2026-07-24) · fluid typography (`clamp()` — type tokens are fixed px). **No longer speculative — there is now a MEASURED case (2026-08-10).** Controls that hold chips set a `min-height` rather than a height, so when a tier floor drops below what the text needs they stop following it: under `ultra-compact` `ds-multi-select` measures **33px** and `ds-autocomplete` **29px** where the other seven reach 24px. The floor is applied correctly (`min-height: 24px`); the content cannot shrink, because at a 14px font the line box alone is 19.6px. Proved by hand: dropping `--font-size-s` to 11px in that container pulled them to 31px and 25px. So "density does not scale type" is not a nicety — it is why the bottom tier does not level. `compact` is unaffected in practice (33 against 32). _(The third clause — motion semantic presets — MOVED 2026-07-31 into the customizable-motion item under "Motion / overlays" as its slice 3; don't re-open it here.)_ Both remaining pieces are speculative, no active request; split into their own items if ever prioritized. _(high-contrast/forced-colors + RTL/logical-properties dropped — Stas 2026-07-07.)_

- [x] **[P2] Composition rules — DONE 2026-08-10, all three gaps written and both renderings live. Originally: the layer between "here are 639 tokens" and "here is a finished pattern" does not exist, so an agent building a page picks plausible token values instead of right ones (asked by Stas 2026-08-07).** The evidence he brought: an agent reviewing a screen cited "Pressed-state visuals do not shift layout bounds", contrast 4.5:1, modal-escape and "spacing on the 4/8 scale". Those are GENERIC UX rules from a general rule set — **not** this design system's. An agent falls back to them precisely because the DS offers no composition rules of its own, and the result technically uses DS tokens while drifting from the DS.
  **What already exists, so nobody rebuilds it:** 639 tokens with a generated reference (the vocabulary); `Do / Don't` in ds-docs — but its seven topics are component-CHOICE rules (Modal vs Drawer, Button hierarchy, Table density, Badge proliferation, Empty-state copy, Status without colour, Tooltips vs banners), not spacing or type; `Token Discipline` (use tokens, not literals); and the `patterns/` sections (form-layout, page-header, filter-bar, empty-state, activity), which are worked examples rather than stated rules.
  **What is missing is the middle layer:** nothing says which space token goes BETWEEN page sections vs between cards in a row vs inside a control; which type role a page title, a section title and a caption take; what the vertical rhythm of a page is; when a gap belongs to the container and when to the child (the `gap="none"` lesson from the form-layout work is exactly this kind of rule, and it lives only in one demo's prose).
  **Colour and motion rules WRITTEN 2026-08-10, measured not invented.** §4 Colour: the ten roles with their real usage counts (`--text-tertiary` is the SECOND most used role in the library — most "grey text" here is a deliberate tertiary, not a disabled one); the four members of a status family with the property each actually lands on, and the glyph-on-tint pattern all eight `color: var(--error)` declarations turn out to follow; why on-fill text is theme-independent. §5 Motion: 109 of 139 duration uses are `--duration-fast`, so anything else needs a reason; easing follows direction and the role layer already encodes it; nothing in the library transitions `all` and only three transition a `width`; and reduced motion zeroes the DURATION, never the animation, because three surfaces tear themselves down on `animationend`. **The second rendering SHIPPED 2026-08-10: `Practice → Composition rules`**, fetched from the same `design-system.md` the package carries, so the two cannot drift — there is no hand-maintained copy to disagree. Building it exposed a pre-existing bug worth knowing: **every markdown style rule on the `/changelog` page had been dead**, because emulated encapsulation stamps `_ngcontent` on the container but not on nodes `marked()` produced, so `.changelog-body h2` matched nothing (measured: border-top 0px, margin-top 0px, `h3` white instead of `--text-secondary`). Both pages use `:host ::ng-deep` now. **Content rules WRITTEN 2026-08-10 — the item is now DONE.** §6 Content: labels are sentence case (45 of 57 multi-word labels in the docs already are; the apparent Title Case is acronyms and notation), and the exception is marked rather than the rule — five controls carry an `optional` input instead of labelling every other field. An empty state is **five** situations, not one (`none | loading | error | locked | success`), and the pattern's own examples give the shape: the title states the SITUATION, the body gives the next step or a CONCRETE cause, and a `locked` body names who can unblock you. A message says where → what is wrong → what follows → what to do, measured off the library's own 15 tagged messages. Field errors: the validator owns the words, and `errors` is gated on `touched` so a required error cannot greet an untouched form.
  **One rule was CUT during the write, which is the method working.** A draft said "the submit button never gates on validity" — a rule from another project. This library does the opposite: the Signal Forms page I built binds `[disabled]="!form().valid()"`. Not written down, because the item's own method is to measure this library rather than import advice.
  **The `design-system.md` half of this SHIPPED 2026-08-07 and the two items are now merged.** The 491-line API catalogue moved to `components.md`; `design-system.md` was rewritten as the rules file (145 lines: spacing bands with measured usage counts, page-gutter tiers, gap ownership, the `.t-*` type roles, the field-height contract, and what breaks an override). Both are copied into `dist/ds/` by `tools/build-schematics.mjs`, so a consumer's agents get them on bump. **What is left is filling it out** — colour, motion and content rules are not written yet, and none of it is rendered in ds-docs for a human.
  **Method matters more than the content here.** Derive the rules by MEASURING what the DS's own patterns and ds-docs already do, not by inventing a scale — inventing is how the catalogue drifted in the first place, and how a rule set ends up contradicting the components it describes. Express every rule in tokens, never px, or `[data-density]` silently invalidates it.
  **Deliverable is one source with two renderings, and that constraint is the whole design:** a page in ds-docs (Practice group) so a human can find it — a rule nobody can find is the same discoverability failure the 08-06 audit measured, where eight consumer workarounds were written against hooks that already existed — and a machine-readable file the agents load as a skill. Two hand-maintained copies would drift within a release; generate one from the other, or have the docs page render the md.
  **That open question is ANSWERED (Stas 2026-08-07): the agent-facing half ships in the npm package.** Done — the build copies it. What is NOT done is the second rendering: a Practice page in ds-docs generated from the same source, so a human can find the rules a consumer's agent is already reading.

## A11y — decision record (deferred, NOT a bug)

- [ ] **[P3] topbar → `role="banner"`** — VALIDATED-REDUNDANT & DEFERRED (Stas 2026-07-06 "пропусти, не удаляй"). The bare `<header>` inside the generic custom element `<ds-topbar>` already maps to the `banner` landmark implicitly (**verified `topbar.component.html:1`, 2026-07-24**); an explicit role is flagged "unnecessary" by the W3C validator and would be WRONG if `<ds-topbar>` is nested in `main`/`section`/`article`/`aside`/`nav`. Kept as a decision record; only add if we adopt a deliberate defensive-robustness policy.

## Component API / portfolio

- [ ] **[P2] Shared picker internals — SURVEYED 2026-08-05, and the premise is wrong: it is THREE components, not six, and the duplicated surface is ~25 lines each.** Measured: only `ds-select`, `ds-multi-select` and `ds-autocomplete` share the shape (an `activeIndex` signal + wrap-around arrow nav over a flat option list). `ds-date-picker` navigates a 2-D day grid, `ds-time-picker` has NO arrow handling at all (it delegates to `ds-time-columns`), and `ds-color-picker`’s arrows drive a continuous saturation/hue canvas — three different models that a shared list helper would not serve. **Type-ahead does not exist anywhere** (zero hits), so that part of the ask describes code that was never written. And the three that DO overlap differ where it matters: select carries groups + Home/End + `firstEnabledIndex()` skipping disabled, multi-select works over a filtered list with a select-all row, autocomplete counts a create/no-match slot into its modulo. **Recommendation: extract only the index cursor** — a ~30-line `createListCursor({ length, isEnabled })` returning `{ index, next, prev, first, last, reset }` — and NOT a picker base class. **Worth doing when a fourth list picker appears, not before:** 3 × 25 lines against a 30-line helper is a wash today, and the wrong shared abstraction here costs more than the duplication.
- [ ] **[P3] CDK Menu adoption (option B) — parked.** ONLY if/when nested submenus, a menubar, or context menus are needed. `ds-menu` = native roving + `DsOverlayCloseRef` (verified still native, 2026-07-24 — correct for flat menus). Plan: `docs/superpowers/cdk-menu-adoption.md`. When we move, prefer `@angular/aria` `ngMenu` over CDK Menu; gated on a real need or `@angular/aria` going stable.

## ds-app-layout (SHIPPED 2026-07-24) — post-merge polish

> **Parent DONE** — `ds-app-layout` (shipped as `ds-app-shell`, renamed in 0.7.0) + `ds-sidenav-footer` + `ds-sidenav` brand row (`logoLetter` + `[dsBrandName]` projection) all merged to main (branch `feat/app-shell`, final review clean). Spec: `.claude/superpowers/specs/2026-07-24-ds-app-shell-design.md`. Kept on the board only for the open polish children below. Consumer migrations (ai-sdlc → mm-admin → pinkmoon) are post-release follow-ups.

- [ ] **[P3] `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing my own `118a539`).** The rail's layout switch lives in `app-layout.component.scss` as `bp.down(lg)`, and `watchDesktopBreakpoint()` runs `matchMedia` over the same `--bp-lg`. The VALUE cannot drift — both read one custom property, and a missing one now errors in dev instead of falling back to a literal — but the CONDITION is decided twice, in two languages, and changing one does not force the other. The JS copy is not removable today: `compact` gates `cdkTrapFocus` and the `role="dialog"`/`aria-modal` pair, and no CSS feature (container queries, `:has`) can drive a focus trap. **Recorded so nobody "simplifies" it blindly, and to revisit if** CSS gains a way to gate focus trapping, or Angular ships a breakpoint primitive. Not a bug — a knowingly duplicated decision over a single source of truth.

- [ ] **[P3] Three signal-forms contract members are unimplemented, and all three are blocked on a LOOK, not on wiring.** `pending` — what does a field with an async validator in flight look like? `ds-input` has a spinner; nothing else does. `dirty` — the library renders "edited" nowhere today, so there is no treatment to bind to. `disabledReasons` — a tooltip on a disabled control, or ignored? Each is one input once the appearance is decided, so decide the appearance first. _(`focus()` was the fourth and SHIPPED 2026-08-10: a resolver on both control-value-accessor bases, verified on all twelve controls that lacked one.)_

- [ ] **[P2] Upgrade to Angular 22 — and re-verify the signal-forms work against it, because one of its breaking changes lands exactly there.** This repo builds on **21.2.17** (`v21-lts` is 21.2.19) and declares `"^21.2.0"` for all six Angular peers, which resolves `>=21.2.0 <22.0.0` — so **a consumer on Angular 22 cannot install this package without `--legacy-peer-deps`**. Angular 22 has been out since **2026-06-03**; `@angular/core` and `@angular/forms` are at **22.1.1** as of 2026-08-07 (checked against the registry, not assumed).
  **Why this is not just a version bump.** (1) **Signal Forms went STABLE in 22.0.0** — it left `@experimental` two months ago, which retires the "wait for it to stabilise" reasoning that shaped the original item. (2) The 22.0.0 changelog carries a signal-forms breaking change — `min`/`max` rules no longer accept string values, numbers or `null` only — and the fix shipped today (`fc1714d5`) touches exactly `min`/`max`, so it wants re-testing on 22 rather than assuming it carries. (3) 22.0.0 also added `ngNoCva`, an opt-out from `ControlValueAccessor` interop; every DS control provides a CVA **and** satisfies `FormValueControl`, so it is worth checking which path Angular 22 actually picks for our controls and whether the two ever race. There was a real bug of this shape in the 22 line (`angular/angular#67847`, CVA `writeValue` called back after `onChange`, infinite loop — fixed).
  **RE-VERIFY ON 22, specifically:** the whole Practice → Signal Forms page against 22 · `min`/`max`/`maxLength` write-type widening · the `readonly` alias · `hidden` on both CVA bases · whether `ngNoCva` should be set anywhere · whether the `touched` mechanism changed (one third-party source reports a v21 `touchedChange` → v22 `touch` output rename; NOT confirmed against the official changelog, so confirm it before relying on either).
  **The decision is the peer range, and it should be made BEFORE 0.9.0 is cut**, since that is what the release publishes: widen to `^21.2.0 || ^22.0.0` (cheap, but claims a compatibility nobody has tested) or move the repo to 22 (honest, costs a real upgrade pass). **Context for the call:** Angular Material has NOT shipped signal-forms support (`angular/components#32072` still open), PrimeNG deliberately waited for stable and is repairing `[formField]` typing in 22.0.1, and Spartan has shipped it — so on this axis the DS is currently ahead of both libraries its consumers compare it to, and that lead is worth keeping installable.

## ds-auth-layout — residue from the 0.8.0/0.9.0 audit (recorded 2026-08-11, from the ai-sdlc-prototype side)

> Parent work landed: the type clamps came back out of `ds-auth-layout`, the a11y and robustness
> fixes shipped, and the false comments were corrected. What follows is what was deliberately NOT
> done in that pass, each with the reason, so none of it is rediscovered from scratch.

- [x] **[P3] `ds-sidenav` carries the same four defects the auth layout just fixed. FIXED 2026-08-11 — all four, plus a fifth found while copying the rule across.** The `[brand]` slot constraint carried `width: auto` alongside its `max-height`; at `(0,2,0)` that out-ranks a width the consumer set on their own logo, and with the default `max-height: none` it never did anything useful — an `<img>` with no CSS width keeps its ratio under `max-height` on its own. Dropped from BOTH components rather than copied into the second. Verified: `charAt(0)` on `"🅰 Corp"` really does return the lone high surrogate `\ud83c` (measured in a browser, not reasoned), the spread returns the glyph, and ASCII is untouched. Byte-identical
  code, so they were found by diffing the two: `brand().charAt(0)` returns half a surrogate pair for a
  brand starting with an astral character (these are the only two `charAt` calls in `src`); the
  letter-mark `<span class="mark">` has no `aria-hidden`, so a screen reader announces the glyph and
  then the wordmark ("A MyAdmin"); the outer `@if (brand() || hasBrandName())` gates out a
  `logoLetter`-only lockup even though the inner gate tests it; and the projected `[brand]` slot has no
  size constraint. Fixing only one side is what made the "same letter-mark as the sidenav" claim false
  in the first place, so these should move together — or the divergence should be stated on purpose.

- [x] **[P3] `env(safe-area-inset-*)` is inert in the library's own showcase. FIXED 2026-08-11.** `ds-docs/src/index.html` now sets `viewport-fit=cover` (confirmed live in the served document), both `ds-auth-layout` and `ds-bottom-sheet` documentation states that the host app must set it and shows the tag, and `bottom-sheet.component.scss` joined the `, 0px` convention — the missing fallback was not cosmetic, since an unknown `env()` variable invalidates the whole declaration and would have taken the horizontal padding with it. The insets resolve to
  **0** unless the document sets `<meta name="viewport" content="viewport-fit=cover">` — a cutout alone
  is not enough. Repo-wide there is exactly one `viewport-fit` hit, in `presentations/`;
  `ds-docs/src/index.html` does not set it. So the notch handling `ds-auth-layout` advertises cannot be
  demonstrated on the docs site, and no page tells a consumer they must opt in. Two lines: set it in the
  docs index, and say so where the component is documented. Also `bottom-sheet.component.scss:65` still
  uses `env(safe-area-inset-bottom)` with no fallback — the auth layout's four now carry `, 0px`, so the
  repo currently has two conventions.

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

- [ ] **[P3] Two documentation surfaces still carry claims corrected elsewhere.** `docs/done.md:191`
  repeats "the same letter-mark tile" (the tile is 28px/weight 800 in the rail versus 24-32px/weight 700
  in the auth layout, with separate token hooks, so retinting the mark means setting both). And
  `components.md` — which ships inside the npm package and is what a consumer's agent reads — has **no
  `ds-auth-layout` or `ds-app-layout` entry at all**, while its `ds-sidenav*` block still names the
  pre-rename `--ds-sidenav-mark-bg` / `-fg` tokens.

## From mm-broker adopting 0.9.1 across all three apps (2026-08-11)

> Five asks out of one consumer sweep: the brand config, two `ds-stat` / `ds-filter-bar` gaps found
> while migrating onto them, `ds-search` debouncing, and `initialsFrom`'s name rule. Every one is a
> place a consumer had to write code the library nearly owns; none is a defect.

- [x] **[P2] DONE 2026-08-11 exactly as the ask framed it, accent included — meaning excluded. One brand config per app, not four bindings per screen — the consumer's own workaround
  says what the shape should be.** `ds-sidenav` and `ds-auth-layout` both take `brand` + `logoLetter`
  (+ `tagline` on the auth side) and both offer the `[dsBrandName]` projection, and an app answers
  them identically everywhere: mm-broker bound the same four values on **six** auth screens from the
  same injected object before collapsing it into their adapter (`AUTH_BRAND` → one `inject()` inside
  `app-auth-card`). That adapter is the ask, one layer down: `provideDsConfig({ brand: { name,
  logoLetter, tagline } })`, with the element inputs staying as the per-instance override. `DsConfig`
  today carries `field`, `breadcrumbs`, `timePicker`, `datePicker` — brand is the same kind of thing
  and is *more* app-global than any of them.
  **The wordmark accent is the one part that does not fit a config value.** The DS deliberately takes
  projected markup so the consumer says where the accent belongs; a config can only carry a string,
  and mm-broker's config carries `brandAccent: 'My'` plus an `indexOf` split in the adapter — exactly
  the guessing the projection was designed to avoid. So either brand-in-config covers name/letter/
  tagline only and projection stays the accent's home, or the config takes a `TemplateRef`.
  **Took the first branch: `DS_CONFIG.brand = { name, logoLetter, tagline }`, no accent.** A `TemplateRef` in a config would make the provider a view-owning thing, and the projection already answers the question better — so the config carries the plain name and `[dsBrandName]` stays where the accent lives, with a comment in `ds-config.ts` saying why for the next person who reaches for it.
  **Fields resolve INDEPENDENTLY, which is the part worth knowing.** Verified in the browser with an app-level `{ name: 'ConfigBrand', logoLetter: 'C', tagline: 'From the config' }`: a bare `<ds-sidenav>` rendered `C` + `ConfigBrand`; `brand="Explicit"` won for the wordmark while the tile still read `C` from the config; `brand=""` dropped the wordmark and STILL painted the `C`. So an element override does not have to restate the rest — but "give this screen no brand row" means clearing both. My first JSDoc claimed `""` alone did it; corrected.
  **The projection still beats both**, checked on the same run: the auth demo with `logoLetter="M"` and a projected `[dsBrandName]` rendered `M` + the two-tone `MyBroker` while its UNBOUND tagline came from the config — three different sources on one element, each resolving where it should.
  **Shape note:** the inputs are now `string | null` with a `null` default, since a signal input cannot report whether it was bound. Their names did not change and template bindings are unaffected; the resolved values are separate protected signals (`brandName`, `letterGlyph`, `taglineText`) so no public name moved.

- [x] **[P3] DONE 2026-08-11 — both hooks, and the size one needed a restructure to work at all. `ds-stat`'s value line is `white-space: nowrap`, so a tile whose value is TEXT has to go
  through `[dsStatValue]` and undo it.** mm-broker's "Enrollment Window" tile is a date range
  ("Feb 1 – Feb 28, 2026"): via the `value` input it would be clipped, so it projects a span that sets
  `white-space: normal` and drops to `--font-size-h5` — two declarations that exist only to argue with
  the component. `nowrap` is right for a number and wrong for a phrase. Either expose
  `--ds-stat-value-white-space` (and a value-size hook), or read the case the other way and let
  `caption`-shaped text tiles say so — `size="sm"` is close but still `nowrap`.
  **Shipped as `--ds-stat-value-white-space` and `--ds-stat-value-font-size`, both defaulting to today's values**, so no existing tile moves. Read the case the first way (a hook, not a new shape) because the projected slot already covers "the headline is a badge"; what was missing was retuning the ordinary value line.
  **The size hook needed the size variants rewired, or it would have worked at `md` only.** `:host(.size-sm) .stat .value { font-size: … }` out-ranks a token read on `.value`, so those two rules now move the RESOLVER instead and the `.label` half stays where it was. Measured: defaults still sm 22px / md 36px / lg 48px, and one override reaches all three.
  **Verified as a pair in the docs**, deliberately in a 240px column: hooked tile `normal` at 18px with `scrollWidth == clientWidth`, plain tile `nowrap` at 36px overflowing 348 into 191. Worth noting the symptom is not "clipped" as the ask put it — the card sets no `overflow`, so the phrase spills visibly past the tile's edge, which is uglier and easier to spot.

- [x] **[P3] DONE 2026-08-11 — documented, and the REASON for the pair dissolved the same day. `ds-filter-bar`'s trailing group cannot hold a consumer PAIR without re-creating its
  layout.** The docs say mark each control rather than wrapping them, because a projected wrapper is a
  plain block whose children stack — correct, and it collides with the one case a consumer cannot
  split: search + Clear, where Clear must be able to **cancel an armed debounce** on the search beside
  it, so they have to live in one component. mm-broker marks that component `dsFilterBarTrailing` and
  restates `display: flex; align-items: flex-end; gap: var(--space-3)` on its `:host` — the bar's own
  trailing rule, copied. `display: contents` on `.trailing > *:not(:only-child)` would not do it
  (`:host` styles win), but documenting the three declarations a wrapper owes, or exposing them as
  `--ds-filter-bar-trailing-*`, would keep the copy honest.
  **Documented, with the snippet, on the Filter bar page** — tokens were the weaker half of the ask: `--ds-filter-bar-trailing-*` would only carry the gap VALUE, and the wrapper still has to write `display`/`align-items` itself. The snippet reads the gap from the existing public `--ds-filter-bar-gap`, so the copy cannot drift.
  **The stated reason for wanting one component is gone.** It was "Clear must cancel an armed debounce on the search beside it" — `ds-search` now cancels its own pending keystroke when the HOST writes `value`, which a bar-level Clear does, so the two controls no longer need to share a component to coordinate. NOT separately measured in that arrangement: both halves were verified on the Search page (a host write reaching the input, and an empty value cancelling a pending timer), and this is those two on the same code path.

- [x] **[P3] DONE 2026-08-11 as `[debounce]`, with both exemptions the ask named and one it did not. `ds-search` has no debounce, so every list screen wraps it.** mm-broker's wrapper exists
  for exactly two behaviours: 200ms on typing, and **immediate on empty** — clearing the field is a
  deliberate act and should not wait, which is the part a naive `debounceTime` gets wrong. That plus
  the cancel-on-Clear above is the whole component. `[debounce]="200"` on `ds-search`, with the empty
  value bypassing the timer, would delete it. Worth checking against the other consumers first: if
  ai-sdlc and pinkmoon also hand-roll it, this is a third of a component three apps carry.
  **Shipped `[debounce]="200"`-style, default 0 so the existing path is byte-identical.** The delay could not simply wrap the model: `value` IS what the template bound `ngModel` to, so debouncing it would have lagged the text the user sees. The input now shows a private `text` signal and `value` is written on the timer — so typing never waits, whatever the delay.
  **Three things skip the timer, not the two in the ask.** Empty (clearing is deliberate; making the list wait 200ms reads as a hang) and the Clear button, both as filed — plus **Enter**, which flushes a keystroke still in flight so `submitted` emits what the reader can see rather than what the timer last let past. A pending keystroke is also CANCELLED when the value goes empty, so a fast type-then-clear cannot land the stale query afterwards.
  **A host write mid-typing has to win**, which needs telling the component's own echo apart from a genuine external set — hence the `pushed` field: an incoming `value` that is not what we last pushed cancels the timer and takes over.
  **Verified in a browser, six cases:** at 600ms the input showed `que` while `value` was still empty at 150ms and caught up after; emptying at 80ms wrote through immediately AND dropped the pending word; Enter flushed within 80ms; the Clear button likewise; with `debounce` temporarily set to 0 the value tracked a keystroke within 40ms, i.e. unchanged; and the one-way `value="Project Alpha"` specimen still fills the input, which is the same host→component path a reset uses.

- [x] **[P3] DONE 2026-08-11 as a parameter (Stas's call), after finding the answer to "does anyone actually need ORG initials?" — yes, and it is on record. `initialsFrom(name)` takes the FIRST TWO words, which is the org rule applied to people.**
  "Mary Jane Watson" gives MJ where a person expects MW, and a one-word name gives a single letter
  where an avatar wants two. mm-broker ended up with two functions and kept both: first+last for
  people, first+second (punctuation stripped) for organisations, because "Blue Cross Blue Shield" is
  BC and emphatically not BS. If `initialsFrom` is meant to serve both, the rule belongs in a
  parameter; if it is meant for people, the last word is the right second letter.
  **The evidence for the org mode, since I first argued against it.** Asked whether anyone needs automatic ORG initials, I checked this repo and found none — `initialsFrom` is used nowhere in the library, `ds-avatar` takes `initials` as a plain string, and the docs' two calls both pass `(first, last)` explicitly. That was true and also the wrong place to look: mm-broker's own notes (session `f28e807e`, their `todo.md` §3b) record `common/utils/identity.ts` carrying BOTH rules for a reason — person rows use first+last, and the **tenants page's organisation avatars** use first-two-words-punctuation-stripped. So the org case is live, not hypothetical, and it is exactly why they kept two functions.
  **Landed differently after Stas pushed back, and the pushback was right.** The modes shipped first and came straight back out: a library that offers `{ of: 'person' }` is claiming to know how names are read, and it is wrong in ways it cannot see — "María José García López" gives ML under a first+last rule where a Spanish reader wants MG. Reading a name is a cultural convention, not a UI decision.
  **What shipped instead:** `ds-avatar` takes a `name` and derives both the initials and the tint seed from it, with the RULE replaceable — `[initialsRule]` per table, `provideDsConfig({ avatar: { initials } })` per app, explicit `initials` still winning. The built-in stays `initialsFrom` (first two words), now documented as the Latin-script guess it is. mm-broker keeps its two helpers, which is correct: the org rule is its domain, not ours.
  **The seed had to move to the NAME**, which is the part worth remembering: initials are lossy, so hashing them gives one colour per letter-pair. Measured — Alice Brown and Adam Bell both render "AB" and now get hues 198° and 356°.

- [x] **[P3] ANSWERED YES and shipped 2026-08-11 as the opt-in `rememberLastTab`, so this question is closed — see the `urlParam` item above for the verification. Question, not an ask: should `urlParam` remember the last tab per path?** mm-broker's
  `useTabUrl` helper does one thing `urlParam` does not — with no query parameter present it restores
  the tab chosen earlier in the session (`sessionStorage`, keyed by `location.pathname`), so returning
  to a record reopens where you left it while a shared link still wins. That is why the helper has not
  been retired on the 0.9.1 bump: the swap would be a silent UX regression, not a mechanical one.
  Plausibly out of scope for a component (it is a session-memory policy), which is worth saying
  explicitly so consumers stop treating `urlParam` as a superset.

## Three more from mm-broker, after the head decided against adopting two of ours (2026-08-11)

> Each of these is a case where a consumer looked at the DS answer, measured it, and kept their own —
> so the ask is what would change that verdict, not "please add a thing".

- [x] **[P3] DONE 2026-08-11 as `triggerSize`, because the preferred answer turned out to be impossible. `ds-filter-bar` renders its own "+N filters" trigger at the default `md`, in a row it knows
  is `sm`.** Verified in mm-broker's rendered DOM: `class="button c-neutral md v-outline"` — 40px — beside
  filters that are all `size="sm"` (32px), and the row is `align-items: flex-end`, so the trigger stands
  8px taller than everything next to it on all nine of their list screens. The bar has no size input, and
  the trigger is internal, so a consumer cannot pass one. **They fixed it with three inherited tokens**
  (`--ds-button-height` / `--ds-button-font-size` / `--ds-button-pad-x` under `ds-filter-bar`, which beat
  the per-size fallback) and will delete them when this ships. Two candidate answers: size the trigger
  from the items it was given, or take a `triggerSize` alongside `moreLabel`. The first is better — the
  bar already knows every item's declared width, and a row of `sm` filters with an `md` button is not a
  configuration anyone wants.
  **The first candidate cannot be built, which is why the second shipped.** "Size the trigger from the items it was given" assumes the bar can see their size; it cannot. `dsFilterItem` carries a WIDTH and nothing else, and the filters are arbitrary projected templates whose own `size` input the bar never touches — reading their rendered heights instead would mean measuring the very thing this component refuses to measure. So `triggerSize`, defaulting to `md` so no existing bar moves. Verified both directions: unset gives `class="… md …"` at 40px beside a 40px search; `triggerSize="sm"` gives `sm` at 32px.
  **Deliberately NOT named `size`**: on a bar that would read as sizing the filters too, which it cannot do.

- [x] **[P3] DONE 2026-08-11 — (b) shipped, and (a) was already done on the OPPOSITE side, deliberately. `dividers: false` should collapse the padding on the side the divider was on — and the
  0.9.0 DELETE-LIST entry that asks consumers to swap the token for the input is a REGRESSION for a
  whole-app opinion.** mm-broker turns modal dividers off app-wide, and the reason the padding then needs
  overriding is structural: `.header` pads for a border-bottom that is now transparent, `.actions` for a
  border-top, so with dividers off the gaps stack. They currently reach into `.modal > .header|.body|
  .actions` with three `!important`s — **the only reach into DS internals left in their tree** — and
  0.9.1's new `--ds-modal-header-pad-y` / `-body-pad-y` / `-actions-pad-y` cannot replace it, because each
  is one Y value applied to both sides while the design is asymmetric (header 24/0, body 16/16, actions
  0/24). Two asks, and the first is the real one: (a) when `dividers` is false, drop the padding on the
  divider side — it exists to clear a border that is not there; (b) give `DS_CONFIG` a `modal` section, so
  `dividers: false` is one declaration rather than a binding on each of their **41** `<ds-modal>`s. Note
  the token also covers `ds-modal-card`, which a `ModalService`-opened modal renders with no `ds-modal`
  ancestor — an input on the element cannot reach that at all, which is why the DELETE-LIST swap is not
  merely more verbose but incomplete.
  **(a) already shipped with `[dividers]` in 0.9.0, and it collapses the BODY rather than the divider side — which is the better half of the choice, so I am declining the direction rather than the ask.** Measured today: with dividers off the card renders header padding-bottom 16px, body padding-top 0, header border 0. The reason not to do it the way the ask asks: `.body` is the scroll container (`overflow-y: auto`), so a gap living in ITS padding scrolls away and content meets the title; the header's own padding-bottom cannot scroll, so it separates the two at every scroll position. The ask's premise is also about the OLD workaround — `--ds-modal-divider: transparent` does leave the padding stacked, `[dividers]="false"` never did.
  **(b) shipped as `DS_CONFIG.modal.dividers`**, following the `field.reserveMessage` pattern exactly: the input became `boolean | null` with a `null` default so "not bound" stays distinguishable, and `resolveDividers()` gives input → config → `true`. `ds-modal` resolves once and passes the boolean down, so the card is told rather than resolving again — otherwise a provider sitting between them would make the two disagree.
  **The "incomplete" claim is the interesting one and it is correct — verified, not reasoned.** With `provideDsConfig({ modal: { dividers: false } })` at the docs app root, the `ModalService` confirm's card (the only one inside a `cdk-overlay-pane`, with no `ds-modal` ancestor) came out as `error md modal no-dividers`. `ModalService` builds its portal injector with `parent: inject(Injector)` from a root-provided service, so the app-level config resolves through; an attribute on an element genuinely could not have reached it.
  **Left open on purpose:** the asymmetric per-side padding their design wanted (header 24/0, body 16/16, actions 0/24) is still inexpressible — the three pad-y tokens are one value per region. It existed to work around the stacking, which is fixed, so it is probably moot; six per-side tokens on the strength of a workaround is the wrong trade.

- [x] **[P3] BOTH DONE 2026-08-11, verified end to end in a routed page. `ds-tabs` `urlParam`: two things keep a consumer on their own helper.** mm-broker kept
  `useTabUrl` (head's call) after measuring the swap. (1) **The name comes from the label unless every
  tab declares a `value`** — none of their 24 `ds-tab` elements does, so adopting as-is would turn
  `?tab=licenses` into `?tab=License%20Verification%20Status` and break every existing link; a
  slug-from-label (kebab, lowercased) default would make the input adoptable without touching 24
  templates. (2) **No session memory.** Their helper remembers the last tab per path in `sessionStorage`,
  so returning to a record reopens where you left it while a shared link still wins — `urlParam` writes no
  parameter for the first tab, so every return lands on tab one. They are not asking for that behaviour to
  become the default (it is a policy, and arguably not a component's business), but an opt-in — say
  `rememberLastTab` — would retire the helper. Worth deciding as one question with (1), since together
  they are what "superset" would actually mean.
  **(1) The label now slugs** — kebab, lowercased, diacritics decomposed and dropped. Their case is exactly the example: `?probe=license-verification-status`, measured in the browser, where it used to be the percent-encoded sentence. Checked the rule on ten labels: `Activity & Notes` → `activity-notes`, `Zusätze` → `zusatze`, `2026 Q1` → `2026-q1`, `  Spaced  Out  ` → `spaced-out`. A label with nothing sluggable in it (CJK, or bare punctuation) keeps its raw text rather than becoming an empty parameter.
  **Two things the slug is deliberately NOT.** It is not what `tabClosed` emits — that stays the raw label, because a host matches it against its own list, and the docs claimed the two were the same identifier (now corrected). And it does not make links durable: a slug is still derived from display copy, so renaming a tab still breaks saved links. `value` remains the only fix for that, and the page now says so.
  **This is a behaviour change to a one-day-old input**, so it is recorded as an actionable migration entry rather than smuggled in: anyone who adopted `urlParam` on 0.9.0 with labels and no `value` has live links whose parameter changes.
  **(2) `rememberLastTab` shipped as an opt-in**, off by default and inert without `urlParam` (which supplies the names — a remembered INDEX would repoint the moment a tab is inserted). Keyed `ds-tabs:{path}:{param}` in sessionStorage, following `ds-table`'s `persistLayout` precedent including the try/catch, since Safari private mode throws on write. Verified all three behaviours in a temporary routed strip: clicking tab two wrote both the parameter and `ds-tabs:/components/tabs:probe`; arriving with NO parameter reopened tab two and left the URL clean; and arriving with `?probe=activity-notes` while memory held `license-verification-status` opened what the LINK asked for. Tab one is remembered too, or going back to it would be forgotten and the next visit would reopen the tab before it.

- [x] **[P2] FIXED 2026-08-11, and the "needs no measurement" claim was right — but measured anyway, and the before/after is unambiguous. `ds-filter-bar` clips the focus ring of its first (and last) inline filter.** The row is
  `overflow: hidden` and each `.item` is sized to exactly the width `dsFilterItem` declared, so the row's
  box starts flush with the first control's left edge — and the DS focus ring is an OUTSET box-shadow
  (`--focus-field` is `0 0 0 3px …`, `--focus-ring` reaches 4px). Interior items are fine, because the
  12px gap gives the shadow room; the first item's left ring and, on a full row, the last one's right
  ring are cut off. Found by reading the component's own CSS against `themes/_semantic.scss` while
  mm-broker adopted the bar on thirteen screens — not measured in a browser, and it needs no
  measurement: a 3px outset shadow cannot paint outside an `overflow: hidden` ancestor whose box it sits
  flush against.
  **The one-property fix is `overflow: clip` + `overflow-clip-margin: 4px`** (or the ring's width as a
  token), which keeps the collapse arithmetic exactly as it is — `clip` still prevents scrolling, and the
  clip margin lets the shadow bleed. A consumer cannot fix this: the row is internal, and padding it
  from outside would change the measured width the split is computed from.
  **Shipped exactly that**, plus the stale comment above the rule — it still explained why `overflow: hidden` was deliberate. **Measured first:** `rowLeft === firstItemLeft` (both 408px) with `padding-left: 0`, so the outset shadow had precisely zero room. Then painted a 3px ring on the first and last item and screenshotted: before, only the side sitting in the 12px gap drew; after, the ring is complete on all four sides. `scrollWidth === clientWidth` both ways, so no scroll container appeared and the width the split reads is untouched.
  **A trap worth recording for the next person in this component:** the collapse could not be exercised through the automated browser at all — the row's `ResizeObserver` does not deliver while the tab is hidden, so dragging the width slider changed nothing. It fires only when something forces a paint, which a screenshot does. Verified `hidden` and `clip` report the identical row width in that state, which is what rules out a regression; the collapse itself was then confirmed by reloading at a narrower default frame.

- [ ] **[P2] Option ICONS and a count trigger — `ds-multi-select` and `ds-autocomplete` support neither, `ds-select` supports the first (Misha, 2026-08-12, with a screenshot).** The screenshot is a "Priority" filter: a trigger reading `Priority (1)` with a count badge, and options each carrying a coloured glyph — a flag for Critical, chevrons for High/Low, a dash for Medium. Checked all three pickers rather than guessed:
  **`ds-select` DOES support it.** `SelectOption` has `icon?: IconName`, and the component renders it twice — `.trigger-icon` beside the chosen value and `.option-icon` at 16px in each row. So for a SINGLE choice the pattern already ships.
  **`ds-multi-select` and `ds-autocomplete` do NOT.** `MultiSelectOption` is `{ label, value, disabled? }` and `AutocompleteOption` is `{ value, label }` — no icon field, and every `ds-icon` in their templates is chrome: the chevron, the panel's search glyph, the checkbox tick, and (autocomplete) the selected check mark. Nothing renders a per-option glyph.
  **A second gap in the same screenshot, easy to miss:** the trigger shows a COUNT badge, not chips. `ds-multi-select` renders chips or a placeholder; there is no count presentation, so `Priority (1)` cannot be expressed either. Two asks, not one — and the count trigger is the one that changes the trigger's whole layout contract, since chips are what `maxVisibleChips` measures.
  **Shape if we build it:** add `icon?: IconName` to both option types and render it in the option row (the `ds-select` markup is the template to copy, so the three pickers stay identical), then a separate decision on a `triggerDisplay`-style input for count-vs-chips. Icons are additive and cheap; the count trigger is not.

- [ ] **[P2] `ds-table` has nowhere to put a filter row, and that is why one consumer's fork exists.**
  The component has **no content-projection slots at all** — its only toolbar is the `.table-toolbar` div
  that renders the Export CSV button when `exportButton` is set. So a screen whose table needs a filter
  row beside that button has three options: fork the table (mm-broker did: their `ids-data-table` invented
  a `dtToolbarStart` slot, and two screens use it today), put the row outside the table and give up having
  it next to Export, or push every filter into the header funnel — which works for a per-column value set
  but has no answer for a free-text search over a **server-paged** table (`filterQuery` is client-side by
  definition, and `filterMode="server"` covers the funnels, not a search box).
  **The ask is one slot** — `[toolbar]`, or `[toolbar-start]`/`[toolbar-end]` if the Export button should
  keep its side — with the row's layout owned by the table so consumers stop reinventing it. That is
  strictly additive, and it removes one of the reasons the fork cannot retire: a slot the base does not
  have is code that must move at retirement whatever else changes.
  **Worth deciding together with the search question**: if `ds-search` grows `[debounce]` (asked above)
  and the table grows a toolbar slot, the whole "filter row for a table" pattern becomes DS-native and
  nobody has to choose between the table's toolbar and a page-level `ds-filter-bar`.

## Expose the control focus ring — the token is published, the way to apply it is not

**P3 — consumer-side papercut, reported 2026-08-12 from mm-broker-platform (platform-admin).**

`--ds-control-focus-shadow` is a public token, and every DS component applies its own ring
internally. A consumer with an element that is interactive but **not** a DS component has neither:
it has to restate the treatment by hand.

Where that happens in practice — a native `<button>` stripped to bare text used as an affordance
(a product name that opens a detail, a "View all" link, a back link). `ds-button` is not the answer
for these: they sit inline in a heading or a card and carry no button chrome, and `variant="text"`
dev-warns since 0.6.2.

So the consumer writes this, verbatim, once per stylesheet:

```scss
&:focus-visible {
  outline: none;
  border-radius: var(--radius-sm);
  box-shadow: var(--ds-control-focus-shadow);
}
```

Three copies in platform-admin before it was folded into a local mixin; the same shape appears in the
`ids-data-table` fork.

**What would remove the need:** a published Sass mixin (`@mixin control-focus`) alongside the existing
`styles/` partials, or a global helper class next to `.link` (`.focusable`, say). Either is enough —
the point is that the ring stops being a copied literal in consumer code, so a change to the DS focus
treatment reaches consumers instead of leaving them on an old shape.

Note `.link` already bakes this in; this is the same treatment for everything that is not a link.

## A disabled button does not read as disabled (from mm-broker MBP-121, 2026-08-12)

- [ ] **[P2] `:disabled` dims to `--opacity-muted` (0.6), which is not a disabled level — on a
  low-emphasis button it reads as "enabled, just quieter".** Found on a list toolbar's ghost `Clear`:
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
  **Consumer workaround in place** (`platform-admin/src/styles/_ds-overrides.scss`): retuning
  `--opacity-muted` to `--opacity-text-disabled` on `ds-button` / `ds-icon-button`. It works because
  the DS reads that token at use-time, but it is a token hijack — it would also dim anything else
  inside a button that legitimately wants "muted", so it should be deleted once the DS ships the fix.
