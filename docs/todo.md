# DS — improvements backlog

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

  - **The panel's readout is an `<input>`** — `color-picker.component.html:91` binds
    `[value]="displayHex()"`, and per-glyph animation cannot live inside an input's value, because
    there are no element boundaries to animate. The trigger's `<span class="hex">` (line 19) can carry
    it. So either the effect is trigger-only, or the input needs an animated layer over it that hides
    while focused. Both surfaces read the same `displayHex()`; pick one before building.
  - **A drag emits values faster than any animation finishes.** Every `pointermove` produces a new
    hex, so a glyph will be mid-flight when its next value lands. That forces a `transition` on
    `translateY` rather than `@keyframes`: a transition retargets from wherever the glyph currently
    is, keyframes restart from the top.

  **Three things cheap to forget.** The slot cannot jitter as glyphs swap, and
  `font-variant-numeric: tabular-nums` fixes the digits while doing NOTHING for `A`–`F`, so each slot
  needs a fixed width of its own. `prefers-reduced-motion` degrades to today's instant swap. And two
  glyph copies in the DOM read as "24" mid-transition, so the animated glyphs go `aria-hidden` behind
  one accessible text source.

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

## Decks awaiting a verdict (re-audited 2026-09-01)

**Ten** decks carry `ds-deck-status: open` — counted on disk, not from this list, which had missed
`basic-advanced-split` and then `banner-toast-icon-alignment`. The two picker decks closed: every
question in them is answered and they moved to `presentations/implemented/`.

**The rank is now the filename.** An open deck is `<rank>-<slug>.html`, ranked by what answering it
unblocks, so the folder listing is the queue — see `presentations/README.md`. Ranks are renumbered
when the queue changes; a stale one is never kept to preserve a link.

**Four have a backlog twin waiting on the same answer, so answering one closes two lines.** That is
what makes these the cheapest thing on the board.

| # | Deck | Asks | Twin |
| --- | --- | --- | --- |
| 1 | `1-color-engine-derivation` | One source token per role, derived. Two decks, one question. | the P2 colour-engine decision |
| 2 | `2-color-engine-relative` | The prototype half of the same question. | as above |
| 3 | `3-interaction-formula` | State interactions by formula, calibrated against the drawn ramp. | the `.ds-interactive` P2 |
| 4 | `4-packaging-entry-points` | MBP-133 — one entry point, and the four ways out. Recommendation: D, per-component, root as a facade. **Rewritten in Russian 2026-09-02.** | the P2 ask about keeping the DS out of a consumer's initial bundle |
| 5 | `5-basic-advanced-split` | Whether the package splits into `basic` + `advanced`, priced against the alternatives. Recommendation: reject. | the P2 ask about splitting the package |
| 6 | `6-entry-point-shape` | Which entry-point layout A3 builds — four real ng-packagr builds, not a fixture. Recommendation: E. | the P2 ask about keeping the DS out of a consumer's initial bundle |
| 7 | `7-opt-in-seam` | ~31 KB behind an opt-in seam, three choices, no blockers found. | the P2 ask about splitting the package |
| 8 | `8-rejected-with-numbers` | Every idea this backlog has rejected, with the measurement that rejected it and what would reopen it. | the Parked and Records sections |
| 9 | `9-migration-manifest-audit` | All 23 findings are fixed; what is open is the tail — ten format practices marked *Adopt* and never ratified. Three of the thirteen shipped on their own (`action`, `appliesWhen`, `exports["./migrations/*"]`). | the P3 line below |
| 10 | `10-select-native-multi` | Whether `ds-select` native `multi` is worth building. | already Parked — likely answerable with "keep parked" and closed |

**Ranks 4-8 are the packaging lane and are kept contiguous** — they are one argument and were
scattered across 4, 5, 8, 9, 10 until 2026-09-02. Those five are written in Russian and share
`presentations/deck.css`.

---

---

## Open, in priority order

**Bugs — something shipped misbehaves**

- P3 · **A gate run against a shared working tree can fail on a half-written line** — C013 was accused of a false positive on 2026-09-02 and was right: the same sentence PASSES with its next line present and FAILS without it, and a parallel session was mid-write. Re-run a gate before believing its failure here
- P2 · **The table's bulk-actions bar paints its buttons the colour of the bar** — the rule styled a `.button` CLASS and stopped reaching anything when the button became a component; fixed on `feat/design-sync-last-mile`, unmerged
- P3 · **A chip row measures a parent that hugs its content** — the guard against it was dead code, and measurement cannot tell that parent from a `fill` trigger; closing it needs a signal other than the two boxes
- P3 · **`class-surface-diff` cannot see a field declared without `readonly`** — a subclass colliding with one gets no warning, and the gate that guards the release cannot warn either
- P2 · `ds-split-button` hovers with a TEXT colour — inside a status zone the label lands at 1.87:1 in dark; measured 2026-09-02, fix chosen and deferred
- P2 · The warning status pair fails WCAG AA for normal text — MEASURED 2026-08-27, 4.42:1 against 4.5
- P3 · `changelog-lint` prints OK for a sweep that silently lost a third of its files — its floor
  of 100 cannot see one group of three collapse
- P3 · Zebra striping tints skeleton rows, because `:nth-child` selects on position and the shimmer rows are tbody children

**Asks — a consumer or Stas asked for it**

- P2 · **An md ARCHITECTURE for the whole design system, cross-linked like a graph** — entry point → area → component → field, so an agent reads one leaf instead of a monolith. RESEARCH FIRST, then a plan, then Stas's go-ahead — NEXT UP
- P2 · **One entry point for the whole library** — a consumer cannot keep the DS out of their initial bundle; secondary entry points would fix it (MBP-133, deck attached)
- P2 · **No page-level design approach for an agent** — radii, composition and page patterns are unwritten; `design-system.md` answers "what value", not "where does it go"
- P3 · Drop the brand and domain EXAMPLES from the published docs, not just their names — Stas 2026-08-31
- P3 · A token named in prose is never checked against the tokens that exist — a removed one survived in two docs for months
- P3 · `todo.md`'s index no longer accounts for its body — 44 lines against 66 items, and the gap needs a per-section reconciliation
- P3 · Three edges left open on `ds-table` row expansion — an inert expand-all on an empty page, the lazy label, and a column header whose name flips
- P3 · **`ds-number-stepper` — optional numeric formatting** (locale / currency / decimals / grouping); today it is a raw `value: number` with no display formatting
- P3 · **The two row-action halves left open on purpose** — a per-row `label`, and a divider between action groups
- P3 · **The colour picker's hex readout should ROLL each glyph** to its new value, split-flap direction — Stas 2026-09-02; researched, and the panel's readout being an `<input>` is the open question

**Decisions — waiting on Stas, not on work**

Ordered by what each unblocks. The top four each hold a deck or a whole lane hostage.

- P2 · **Ten decks have no verdict**; four have a backlog twin, so one answer closes two lines — see *Decks awaiting a verdict* above
- P2 · **Single-source colour engine** — one token per role, derived. Two decks argue it; the warning-contrast bug is downstream of the same palette question
- P2 · **prettier vs eslint on HTML** — they want opposite things, so `lint:all` can never be green. Every branch pays this until a config wins
- P2 · **`.ds-interactive`** — global state-interaction contract, agreed in principle, prototype before spec
- P2 · **Theme recipe vs hand-tuned picks** — does state derivation follow the theme's mix-to-black recipe, or the drawn ramp? Blocks the two above
- P2 · **`ds-number-stepper` and `ds-dropzone` are outside the field-message system** — bring them in, or say they are not fields
- P3 · **Eight manifest-format practices** the audit marked *Adopt* and nobody ratified — re-counted 2026-09-02, five of the original thirteen have since shipped, two of them with the auto-update plugin
- P3 · **Three deferred DEFAULT changes** held back by the release policy
- P3 · **Does a release note owe a WHY**, or only a what-and-what-to-do
- P3 · **ds-docs still writes BEM modifiers as `--suffix`** — a state should be its own `is-*` class
- P3 · **Three signal-forms contract members** are unimplemented, all blocked on a LOOK rather than wiring
- P3 · **Shared picker internals** — surveyed, and the recommendation is NOT to build until a fourth list picker appears
- P3 · **Virtualising a long picker list** — fights `aria-activedescendant`; measure before building
- P3 · **`schematics/tsconfig.json` asks for `moduleResolution: "node"`**, which TypeScript 6 removes — fix is `node16`, cheap, do it before the bump
- P3 · **Re-wrap `CHANGELOG.md` to ~100 columns** — mechanical, no prose changes; Stas 2026-08-31: "щас не будем"
- P1 · **Angular 22** — DECIDED 2026-08-25: not now, peers stay `^21.2.0`. Kept so the decision is not re-litigated

**Parked — asked, and deliberately not now**

Ordered by how close each is to a first consumer ask, which is the only thing that unparks any of them.

- P2 · **Every user-visible string is a hardcoded English literal** — a consumer IS blocked (ITB Workspace runs two languages); parked on scope, not on doubt
- P3 · **`ds-select` native `multi`** — researched, deck attached; answerable with "keep parked" and closed
- P3 · **`--icon-xs/sm/md/lg` exist and `ds-icon` cannot be sized by them** — the smallest of these, and the gap is visible in the docs
- P3 · **Primary-button CTA token layer** — opt-in, no demand stated yet
- P3 · **Inspect mode** — asked, Stas: not now; pilot scope recorded
- P3 · **Splitter** — asked, keep in the backlog
- P3 · **CascadeSelect** — asked, keep in the backlog
- P3 · **MED cluster** — density beyond hit-targets
- P3 · **The Claude Design upload has a scriptable route, and we chose not to take it** — the boundary is a client-side guard, not a server one; measured and written up in `.design-sync/COMMANDS.md`
- P3 · **Image / lightbox** — no demand stated; the overlay and motion infrastructure exists to build on
- P3 · **CDK Menu adoption** — only if nested submenus, a menubar or context menus are actually wanted

**Records — kept so they are not "simplified" away**

- P3 · `compact` re-evaluates in TS a condition the stylesheet already owns (recorded 2026-08-04, reviewing
- P3 · topbar → `role="banner"` — VALIDATED-REDUNDANT & DEFERRED (Stas 2026-07-06 "пропусти, не удаляй").


## `triggerDisplay="labels"` measured a box its own output resized — FIXED 2026-08-31

- [ ] **[P2] The `labels` trigger collapses to one label regardless of free space, because the measurement reads a `fit-content` box that the cut itself narrows.** `:host(.compact-trigger)` sets `width: fit-content` (`multi-select.component.scss:36`), and `labels` renders a `#chipRow` of `data-chip` spans (`multi-select.component.html:61-83`), so `chipFit` measures `trigger.clientWidth` of a box whose width is decided by the chips it is about to cut. **This is the exact case `chip-overflow.ts:13` names as its INVARIANT** — "nothing here may measure something the cut itself changes". The `lastWidth`/`lastCount` guard stops it hanging, so the symptom is a wrong converged value rather than a frozen page: pass 1 measures the full width, cuts to N, the trigger shrinks, pass 2 cuts again, and it settles at one label plus "+N".

  `width="fill"` does not avoid it: `:host(.content-width)` (`:29`) and `:host(.compact-trigger)` (`:36`) are an exact specificity tie and the compact rule is declared later, so the host is `fit-content` in every `labels` and `count` configuration.

  **Three ways out, and the choice is a design call, not a cleanup:** (a) `labels` stops taking `compact-trigger`, which fixes the measurement and gives up the fixed footprint that is the mode's whole point; (b) `chipFit` measures the trigger's PARENT instead, which keeps the footprint but changes a primitive two components share; (c) `labels` is not a compact mode at all and gets its own host class. Shipped as-is in 0.11.1 with the defect: it under-shows labels, it does not misbehave otherwise.

  Same class as the two self-referential loops recorded in `done.md` from the original chip work — the rule that came out of that one is the rule this broke.

  **FIXED 2026-08-31, and by none of the three options above.** The measurement now reads the width
  available — the trigger's PARENT content box — instead of the width occupied. The parent does not
  move when chips do, so the feedback is gone by construction rather than worked around, the compact
  footprint is kept, and `ds-autocomplete` gets the same correction for free since both go through
  `chipFit`. For a `width="fill"` trigger the two numbers are identical, so nothing moves there.

  **Measured rather than reasoned**, in a controlled repro of the geometry: dropping one chip at a
  time, the old budget read 272 → 200 → 137 → 87 px — each cut shrinking its own input, which is what
  settled the split at one label. The new budget read 700 px at every step.

## Four files style one portaled panel at equal specificity (recorded 2026-08-31, from the branch review)

- [ ] **[P2] The dropdown panel is styled by `styles/_dropdown-overlay.scss` AND by three component stylesheets, and nothing decides which wins except the order the stylesheets happen to load.** The panel is portaled to `document.body`, so Angular's emulated encapsulation does not apply to it: all four rule sets land in one global cascade. `.ds-dropdown-panel .dropdown-panel` (0,2,0) from the partial and `.dropdown-panel[_ngcontent-…]` (0,2,0) from a component are an exact tie. Today the component wins because Angular appends component `<style>` after the global `<link>`; SSR critical-CSS inlining, or a consumer that `@use`s the partial from a stylesheet loaded later, flips it — and that same tie is the only thing keeping `--ds-autocomplete-panel-bg-color`, `-radius` and `-maxh` alive, which the release notes promise still work.

  **The cause is duplication, not specificity.** `ds-select` declares nothing for the panel and is already correct. `ds-multi-select` and `ds-autocomplete` re-declare geometry the partial already sets — `background`, `border-radius`, `max-height`, `overflow`, `display: flex` — which is exactly what §3 of `docs/picker-contract.md` forbids, in the same release that wrote §3.

  **The three ways out, in the order they were considered:**

  1. **Qualify the component selectors** so they outrank the partial by specificity rather than by order — `.ds-dropdown-panel .dropdown-panel, .dropdown-panel { … }`. Shipped in 0.11.1 as the stop-gap. It is deterministic, and it is a patch: it makes the tie moot per selector instead of removing it, and the next panel rule someone writes will not have it.
  2. **Geometry lives only in the partial; components forward alias tokens.** Each component declares `--ds-dropdown-panel-bg-color: var(--ds-multi-select-panel-bg-color, …)` on its host and forwards the SHARED token through `forwardOverlayTokens`, which already exists for this. The component stylesheet then keeps only what is genuinely its own markup — the filter row, the select-all rows, `.check-box`, `.option.multi` — and the tie disappears rather than being out-ranked. This is the shape `ds-select` is already in.
  3. **`@layer` — MEASURED 2026-08-31, and it does NOT hold the way the idea assumes.** The two mechanical halves work: Angular lists `@layer` in `scopedAtRuleIdentifiers` (`@angular/compiler/fesm2022/compiler.mjs:6881`) so it descends into a layer block and scopes the selectors inside exactly as it does for `@media`, and esbuild's CSS minifier — the one this build uses, 0.27.3 — emits `@layer` unchanged.

     **The failure is the order statement, and it is a real one.** Layer order is fixed by FIRST APPEARANCE, so a statement that arrives after a layer already exists cannot reorder it — it appends the names it does not yet know. Measured in Chrome with three sheets:

     | Case | Setup | Result |
     | --- | --- | --- |
     | A | component sheet creates `ds.component`, order statement arrives later | **the partial wins** — `ds.panel` is appended AFTER `ds.component`, the opposite of what the statement reads |
     | B | order statement first, then both sheets | the component wins — the intended, deterministic result |
     | C | no layers (today) | whichever sheet loads later wins |

     So `@layer` only buys determinism if `@layer ds.panel, ds.component;` is parsed before ANY component style. **This repo's own docs build breaks that:** `dist/ds-docs/browser/index.html` carries `data-beasties-container` and defers the real stylesheet with `media="print" onload="this.media='all'"`, so the global sheet — where such a statement would live — arrives after the inlined critical block. A library cannot guarantee the ordering from inside its own stylesheet; it would have to ask every consumer to put an inline `<style>@layer …;</style>` in `index.html` before anything else, which is an integration step, not a fix.

     **Verdict: not worth it for the panel problem, which option 2 already solved by deleting the duplication.** Worth revisiting only if the library ever needs a stated precedence across MANY portaled nodes at once (`ds-modal`, `ds-drawer`, `ds-toast`, the date/time/colour pickers) — and then the consumer-side ordering requirement has to be part of the proposal, not a footnote.

  **Where it landed:** 2 was done — the partial owns the geometry, the components only alias its tokens, and the qualifier from 1 was removed because there is no competing rule left to out-rank. 3 was measured and rejected for this problem, for the reason above. Nothing here is outstanding; the entry stays as the record of why the panel is shaped the way it is.

## Priority board (recut 2026-09-01, after the picker lane closed end to end)

**44 open: 1 P1, 15 P2, 28 P3** — counted from the index by script, not incremented from the last
figure, which is how three summaries in this file had drifted apart by 2026-09-01, and drifted again
by 2026-09-02. Ten are *Parked* awaiting a first consumer ask and two are Records, and the one P1 is
a settled decision kept so it is not re-litigated, so the live board is **32 items — 7 Bugs, 9 Asks
and 16 Decisions**.

**Every block is ordered P2 before P3**, with one deliberate exception: the Angular 22 line sits last
in *Decisions* under a P1 tag because it is DECIDED, not pending — the tag keeps it out of both
counts, and the position keeps it out of the way.

**Four items had lived in the body with no index line**, so the board never counted them and nobody
scanning the top of the file could see them. They are on it now: the schematics tsconfig, the sidebar
reflow, the brand examples in the published docs, and the CHANGELOG re-wrap.

**`# Bugs` holds seven** (counted 2026-09-02, twice). The cheapest real win is still the warning
status pair at 4.42:1 where AA asks 4.5: it reaches nine components plus `_status.scss` and
`_field-state.scss` — eleven files counted — so one token step fixes all of them. Four of the
others arrived on 2026-09-01 and were filed under *Asks* first, which was wrong: nobody asked for
them, they are wrong in code a consumer already reads. After the token step what is left is the
split-button hover at 1.87:1, the table's bulk-actions bar at 1.00:1, and the two cosmetic ones.
Five are already closed: the resize handle's unenforced `aria-valuemax` the same day it was filed,
the loading scrim's top edge, which now measures the header instead of assuming 40px, the export
status, which no longer holds the live region once anything else has something to say, the two
lockfiles, now level on every package either tool resolves freely, and the Angular set, moved off
21.2.17 and out of the range of two high advisories.

**The board is not waiting on hands, it is waiting on verdicts.** Sixteen of the thirty-two live
items are Decisions, and ten decks are open against them. Nothing below is blocked on effort.

**What came off this round:** the whole picker lane. Seven decisions, four follow-up changes, sixteen
proposals (fifteen built), 43 review findings and five blockers — all closed, both decks moved to
`presentations/implemented/`. The three picker defects and the `labels` measurement left `# Bugs`
with them.

**The tooling items came out of running the tools rather than reading them, and both were invisible to a
code read.** The formatter conflict surfaced when the three formatters were actually run end to end;
the delete-table gate's blind spot surfaced when a control that was supposed to fail did not. The
transferable rule is the same one the focus-ring checker was born from: **a gate proves nothing until
you have watched it fail.**

**What is actually buildable, checked rather than assumed.** All four remaining asks are gated: three
gate themselves on a first consumer request and Stas held all three when asked directly (2026-08-25),
and the fourth has a deck waiting on a verdict. The P1 is decided as not-now, with the peers left at
`^21.2.0` — a consumer on Angular 22 still needs `--legacy-peer-deps`, and that is accepted, not
forgotten. **So no ask is buildable without either a consumer report or a decision.** What IS
actionable today is the Decisions column, and one of those is new and unusually cheap: the
prettier-vs-eslint config conflict, which is a taste call with a recommendation attached and roughly a
one-file change behind it.

**Two items left the board without being worked, and that is the finding.** Both were closed and
archived on 08-21 — the docs API reference listing components nobody can import, and the missing
two-way `[(sortKey)]` demo — and neither was ever deleted here, so both read as open for three days.
The 08-21 note claimed the index "is generated from the items rather than hand-kept, so it cannot
drift again". **There is no generator** — nothing under `tools/` writes this file — and it drifted.
Rebuilt from the items today and priority-sorted inside each section; until something generates it,
closing an item means deleting the item AND its index line.

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
(`presentations/4-packaging-entry-points.html` — deferred by decision on 08-21, deck for when it is picked
up). The per-state glyph in `ds-field-message` was the other, and it is decided: Stas read the deck,
picked C, and improved it into a default where every state switches on its own.

**The three token items are ONE story and should not be taken separately.** The single-source colour
engine is the spec; "theme recipe vs hand-tuned picks" is question (b) INSIDE that spec, by its own
wording; `.ds-interactive` sits on top of whatever the engine decides. Opening any of them alone means
deciding the other two by accident.

**Where the release risk is.** 0.11.0 was cut on 2026-08-26 and its manifest absorbed what
`unreleased.json` had been carrying, so there is no uncut manifest today. The risk sits in the
five manifests behind it — mm-broker was last recorded on **0.9.1** and will swallow 0.10.0, 0.10.1,
0.10.2, 0.10.3 and 0.11.0 in one pass, so those five are what has to be complete, not this one.

**Two habits this session kept catching, worth reading before opening anything new.** A number measured
in ONE theme carried into the other unchecked (three times, all wrong — the latest being the claim that
excluded `tonal` from the disabled recipe). And a capability shipped that no consumer adopted, twice
traced to one missing field in a contract: when adoption is zero, read the consumer's hand-rolled version
rather than re-reading our own API.

# Bugs — something shipped misbehaves

Highest: each one is wrong in code — or in a surface — a consumer already reads.

- [ ] **[P2] The warning status pair fails WCAG AA for normal text — MEASURED 2026-08-27 in a real browser, 4.42:1 against the 4.5:1 threshold.** `src/lib/styles/_status.scss:54` pairs `bg: var(--warning-subtitle)` with `text: var(--warning-text)`. Resolved in the default theme that is `#8A7400` on `#FFFBEA`, which computes to **4.42:1** by the WCAG relative-luminance formula — under AA for text below 18.66px/700. **It is the only status pair that fails:** error measures **5.92**, success **6.42** and primary **6.16** on their own subtitle backgrounds, so this is one colour out of step, not a palette-wide problem.
  **A darker step does not exist to reach for.** The yellow ramp ends at `--yellow-700` (`#8A7400`), which is what `--warning-text` already resolves to (`themes/_semantic.scss:177`). Closing this needs either a new `--yellow-800`, or a different foreground on the warning tint.
  **Reach, before anyone assumes it is one component:** `--warning-text` is read by `ds-alert`, `ds-banner` (two places), `ds-button`, `ds-checkbox` (two), `ds-field-message`, `ds-icon-button`, `ds-modal` (two), `ds-radio-group`, `ds-sidenav-footer` and `_field-state.scss`. Not every one of those puts it on `--warning-subtitle` — `_status.scss` is the pairing that was measured, and each other site needs its own measurement before it is called broken.
  **Not the same thing as the 3:1 note already in `_field-state.scss:29`**, which is about WCAG 1.4.11 non-text contrast for a border and is satisfied. This is 1.4.3, text.
- [x] **[P2] The Angular set sat at 21.2.17, inside the range of two high advisories.** Moved to 21.2.22 on 2026-09-02, which is past the 21.2.19 fix for *Angular i18n: XSS via event-handler attributes* and *Cache-Key Ambiguity in HttpTransferCache*. MEASURED after: `npm audit` names no `@angular` advisory at all, and the top-level count fell from 30 to 18 (high 25 to 13).
  **The fix was to DELETE a pin, not to add one.** `@angular/elements` was the only Angular dep with an exact version, and its own peer demands an exact `@angular/core` match — so the pin in `package.json` was redundant with the mechanism that already enforces lockstep, and all it did was block the set. It now reads `^21.2.0` like its twelve siblings.
  **The declared ranges did not move.** `bun update` rewrites them to the new floor as a side effect; they were put back to `^21.2.0`, because `@angular/cdk` cannot satisfy `^21.2.22` (its 21.2 line ends at 21.2.14) and a lockfile is where actual versions belong.
  **What is left is the build toolchain, and one critical.** 18 vulnerabilities across tar, undici, hono, vite, esbuild, postcss and the rest; the critical is *node-tar: Decompression/parse DoS via unlimited input*. None of them ships — the package declares `tslib` as its only runtime dependency.

- [x] **[P2] `package-lock.json` had drifted from `bun.lock`, and `npm ci` no longer resolved.** Regenerated 2026-09-02 with `npm install --package-lock-only` on a deleted lock, which leaves bun's `node_modules` untouched — 101 packages disagreed, 13 of them `@angular`; 5 disagree now and none is `@angular`.
  **The prediction in this item was wrong, and the reason matters.** It said regeneration would land on "whatever is latest that day and diverge from `bun.lock`". It converged instead, because `@angular/elements@21.2.17` peers on `@angular/core@21.2.17` EXACTLY: npm has no freedom inside `^21.2.0` and is forced onto the version bun already had. The pin filed here as merely "not currently harmful" is what makes both locks agree.
  **What is left is not drift.** The five are `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime` and `@tybys/wasm-util` — the optional-peer family `_setup.sh` names as the reason `npm ci` breaks under musl, so npm and bun resolve them differently by design.

- [ ] **[P2] `ds-split-button` paints its hover with a TEXT colour, and inside a status zone the label goes unreadable — MEASURED 2026-09-02.** `split-button.component.scss:7` defaults `--_split-button-bg-hover-color` to `var(--accent-strong)` while `:6` keeps the label on `var(--accent-on)`. `--accent-strong` is the family's readable ON-TINT colour — its own token description says "text on light surfaces" — and this is the **only** place in the library that uses it as a background; every other component hovers with `-hover`. In dark, `ds-color="success"` resolves it to `hsl(132deg 55% 62%)` and the white label lands at **1.87:1**; error is **2.46**, and in light warning is **3.78**. Reachable with the component's own default, `variant="primary"`.
  **This is a regression, not an inherited defect.** Before `--accent-strong` resolved for status families, that background was invalid-at-computed-value-time and computed to `transparent`, so the label sat on the page: illegible in light (1.00) and legible in dark (18.6). Making the pointer resolve fixed the three light cells and broke the three dark ones. Six cells, three each way.
  **The fix that was measured and not applied:** default the hover to `var(--accent-hover)`, which is the family base mixed 88% toward black in light and white in dark — so the hover follows the rest state instead of jumping to another colour. Contrast then tracks rest almost exactly: error 5.94 light / 4.22 dark, success 4.17 / 2.85, warning 9.11 / 12.31, against rest values of 4.83, 3.30 and 11.81. Deferred by Stas 2026-09-02: recorded rather than shipped.
  **It does not close the whole problem, and must not be sold as if it does.** `--accent-on` on the family's solid `--accent` already fails at REST for two families — success **3.30**, secondary **3.31** — in both themes, on every solid button, not only this one. That is a palette question of the same family as the warning-pair item above, and it predates all of this.

- [x] **[P2] One export silenced `ds-table`'s live region for the rest of the page's life.**
      Of the three shapes filed, the winner is the export line YIELDING once the events line
      has something new to say. A timeout guesses how long a message takes to read and can
      truncate it; making the export line lowest-priority buries "Export ready" under a stale
      sort line, so it might never be heard. Implemented by snapshotting the events line at
      announce time and comparing, not by clearing a signal — `statusMessage` is a computed
      and a computed cannot write. That also settles the board's condition that "Export
      failed" survive long enough to read: it stands until the reader does something that
      speaks. `exportStatusState` now has exactly ONE setter, which a probe asserts, because
      a second one added later would reintroduce the defect silently.


- [x] **[P2] The loading scrim's top edge assumed a 40px header.** MEASURED against the 
      compiled styles: the header cell is 42.89px at the default density and 26.89px at 
      `[data-density="ultra-compact"]`, so the scrim cut 2.89px into the header normally and 
      started 13.11px too low under that density, leaving the first body row uncovered.
      `--ds-table-head-h`, the name the template read, was declared nowhere, so it could only
      resolve to its fallback; it still overrides the measurement, which is the default under
      it now. A calc() is rejected by the same measurement — summing the parts is a
      constant 1.09px short, because `vertical-align: middle` on the inline-flex label 
      extends the line box by a font-metric amount CSS cannot express. The header is 
      measured per loading episode instead.


- [ ] **[P3] Zebra striping tints skeleton rows.** `&.zebra:not(.virtual) tbody tr:nth-child(odd) td` selects on position, and the skeleton row's `<tr>` reaches `<tbody>` through an `<ng-container>`, which renders no element of its own — so with `zebra` on, every other shimmer row sits on the stripe tint and the placeholder block reads unevenly. Derived from the template, NOT measured in a browser: it needs `zebra` and `loading="skeleton"` on the same table, which no docs demo currently combines. Cosmetic, and it is a design call rather than a defect — the alternative is one more rule excluding the skeleton rows, which is the kind of thing `.skeleton-mode` used to exist for before it was found to be dead.


# Asks — a consumer or Stas asked for it

Requests, not defects. Ordered by who is blocked.

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

- [x] **[P2] A0 - DONE 2026-09-01. Measured chunk placement against the real library and tested the
  graph. Both answers are in `packaging-chunking-audit.md` §11.** One `inject(ToastService)` moves
  **576 239 B raw / 135 744 B gzip** out of the lazy chunk into the initial bundle and collapses the
  lazy chunk to 189 bytes - the initial grows **4.2x**, and all eleven heavy components land in a chunk
  `main` statically imports. This reproduces the consumer's report independently (577 kB of a 755 kB
  initial, 76%, against their claimed 88%), so §2's "not reproducible" line is superseded. The
  services closure builds at 86 775 B gzip. **CORRECTED 2026-09-02: that figure was subtracted from the
  59 019 B floor, which belongs to a DIFFERENT app shape** - `placement_after_a3.ts` has no lazy route,
  so its matched control is `baseline.ts` at 30 646 B. Against its own control the closure is 56 129 B,
  so the fix takes the DS's share of the initial bundle from **135.7 KB gzip to ~50-56 KB, about -59%**,
  and the post-A3 figure is a MODEL - the like-for-like control cannot be built until entry points
  exist. Full derivation in `packaging-chunking-audit.md` §11(a). And the graph
  partitions. **CORRECTED 2026-09-01: there are THREE cycles, not two.** This item's original count
  excluded type-only edges, and a later test proved ng-packagr treats an erased `import type` across an
  entry-point boundary as a dependency exactly like a runtime one. With them included the SCCs are
  `radio` <-> `radio-group`, `time-columns` <-> `time-picker`, and a third of size four:
  **`components/card`, `config`, `core`, `icons`** — caused entirely by type imports OUT of
  `ds-config.ts` (`CardElevation`/`CardPadding`, `DsSize`, `IconName`) reaching back into modules that
  depend on it. See `packaging-diagnosis.md` « Thirteen open questions » item 3 for the full edge list
  and the fix. A computed `core` seed of 12 groups closes over exactly itself; the services close over
  11; **64** component groups form the top layer. **CORRECTED 2026-09-01: this said 55.** The
  complement was computed from the runtime edge map, which omits the eleven groups with no runtime edge
  either way (`divider`, `layout`, `list`, `page-footer`, `page-header`, `progress`, `status-dot`,
  `topbar`, `avatar-group`, `button-group`, `theme`) — 77 on disk minus a 13-group core is 64. The
  core seed is 13, not 12: the four-way SCC was accepted rather than broken, so `components/card` was in
  it. **SUPERSEDED 2026-09-02 by A3-pre** (`bff7efbc`): the cycle is broken, `config` is gone as a group
  (77 -> 76), and `card` is now an ordinary leaf. See the A3-pre item below. `theme` appearing in that no-edge list independently confirms it can be its own free entry point.
  **A3 is unblocked and is worth ~4.2x the table work** (5.7x here until 2026-09-02; see the correction above). Original scope, for the record: Gates A3, touches no component, so it cannot collide with in-flight table work. Two
  halves. (a) A probe app with an eager `ToastService` import and a lazy route holding heavy
  components, built against the real `dist/ds` - the existing ladder plus one lazy route. Gives the
  placement prize for OUR library instead of a synthetic fixture's ratio. (b) The import graph of
  `src/lib`: does it split into acyclic layers (`core <- services <- components`, or finer)?
  ng-packagr forbids cycles between entry points, which is exactly what killed option B. Favourable at
  the top level - nothing in `core/`, `icons/`, `overlay/`, `theme/` imports a component at runtime,
  and the one edge (`config/ds-config.ts`) is an erased `import type` - but 95 folders have never been
  checked. **If (b) says no, A3 dies and the whole budget goes to the table.**

- [ ] **[P2] A1 - build the seam and ONE directive, and measure what the seam itself costs.** The
  ablation gives a **floor of 12.1 KB**, but the seam is not free: template slots, the empty
  composition, the service. Real landing is somewhere between 12.1 and 31.4 KB, and A1 says where -
  before we commit to five directives. Start with `DsTableExport`: no markup in the header, no shared
  width logic, just a status contribution and a public method. **Fresh branch from `dev`**, not a
  continuation of `probe/table-feature-directives`: that ablation was deliberately crude (it simplified
  `filteredData`, deleted shared helpers) and those simplifications must not be inherited. Keep it as
  the reference for what has to move, and as the size target.

  **The seam, designed 2026-09-01.** All four collisions the ablation hit are one pattern: *the table
  owns a derived value and an optional feature wants to contribute an input to that derivation.*
  `clipWidth`/`fitsContent` serve truncate AND resize; `orderedColumns`/`visibleColumns` are the
  computed chain the picker writes to; `filteredData` folds set filters into the substring search;
  `statusMessage` folds export state into the live region. So the seam is a **contribution registry**,
  not a method move - a per-instance internal service the table provides and the directives inject:

  ```ts
  @Injectable() // providers: [DsTableLayout] on the table itself
  export class DsTableLayout<T> {
    readonly columnTransforms = signal<readonly ColumnTransform<T>[]>([]); // order, visibility, width
    readonly rowFilters = signal<readonly RowFilter<T>[]>([]);
    readonly statusParts = signal<readonly Signal<string | null>[]>([]);
    readonly headerAdornments = signal<readonly HeaderAdornment[]>([]);
  }
  ```

  `visibleColumns` becomes `columns()` piped through `columnTransforms()` - empty means identity, which
  is exactly the ablated behaviour that already compiles and measures at 12.1 KB. `filteredData`
  composes `rowFilters()`; `statusMessage` joins `statusParts()`. Width resolution moves into the seam
  as one `resolvedWidth(col)` the table always calls, so neither resize nor truncate owns it. **The
  table never names a feature** - no `if (resizable)` anywhere. **Two genuinely hard bits:** (1) a
  directive cannot inject markup, and the filter button, resize handle and picker popover ARE markup -
  the table keeps tiny `@if (headerAdornments().length)` slots rendering an `ng-template` the directive
  supplies, and the residual slot cost has to be MEASURED, not assumed; (2) `clipWidth`/`fitsContent`
  are only untangled by the width move above.

- [ ] **[P3] A2 - the remaining directives, after A1 prices the seam.** `DsTableResizable`,
  `DsTableReorderable` (with the picker and the `@angular/cdk/drag-drop` import),
  `DsTableColumnFilters`, `DsTablePersistLayout`. Three questions the ablation left open: does
  `truncate` stay in the base table, and do row actions and inline cell editing come out too? Both are
  equally advanced and were left IN, which is why 18.9 KB is a floor and not a ceiling.

- [ ] **[P2] A3 - layered entry points. GATE PASSED (A0), and it is now the biggest item on this board: ≈108 KB gzip off a consumer's initial bundle.** Option D from
  `packaging-chunking-audit.md` §7, whose headline cost is now known to be false: §10 measured
  `facade` and `deep` consumer variants as byte-identical down to the chunk hash, so the root stays a
  pure re-export facade and **no consumer changes an import**. The refactor is internal. **The partition, computed in A0:** `core` (**13** groups - `config`, `core`, `icons`, `overlay`, `theme`, the loose `components/*.ts` directives, `button`, `field-message`, `field-group`, `spinner`, `menu`, `popover`, and `card` since the four-way SCC was accepted) <- `services` (`toast`, `modal`) <- `components` (**64** groups). Co-location constraints: the two sibling cycles plus that accepted SCC. **Answered by A3+: the top layer must be per-component, not one entry.**

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

- [x] **[P2] SHIPPED 2026-09-01 in `d8eb81c0` (v0.11.2). FREE 1.6 KB gzip: dev warnings shipped to
  production and no longer do.** `devWarn` guarded itself with `isDevMode()`, a **function call**
  esbuild cannot fold, so all **13** call sites (button 1, stat 1, table 11 — the 14 first recorded
  here counted the definition) and their message closures reached production bundles. Measured on `probe/devwarn`, control on the same build: prototype
  kit + table **191 988 -> 190 398 B gzip (-1 590 B)**; one `<ds-button>` **62 733 -> 61 906 B (-827 B)**.
  **No consumer configuration needed** — the installed builder already adds `'ngDevMode': 'false'` to
  esbuild's `define` whenever script optimization is on
  (`@angular/build/src/tools/esbuild/application-code-bundle.js:465`). Rewrite each site as
  `ngDevMode && devWarn(() => ...)` and the whole statement folds away, closure included. Fourteen
  one-token edits; removes dead weight, not capability. Needs `declare const ngDevMode` visible to the
  lib tsconfig.

- [ ] **[P2] A3+ — the top layer MUST be per-component, measured 2026-09-01, not a preference.**
  A single `components` entry helps only a consumer whose eager root touches nothing outside `core` and
  `services`. An eager **app shell** does touch the component layer — that is what `ds-app-layout`,
  `ds-sidenav` and `ds-topbar` are FOR — and one `components` entry then pulls the whole retained
  component layer back into the initial bundle. Fixture at `.claude/local/granularity-probe/`, same
  payload both shapes, consumed through the root facade, eager `alpha` + lazy routes using `beta` and
  `gamma`:

  | Library shape | Initial | beta (lazy) | gamma (lazy) | Lazy chunks |
  | --- | --- | --- | --- | --- |
  | one `components` entry | 178 538 B | **500 markers** | **500** | 101 B, 101 B — stubs |
  | one entry per component | **125 651 B** | **0** | **0** | 26 819 B, 26 318 B — real |

  **-52 887 B, -30%** on a fixture where the eager component is a third of the payload; a real shell is
  a handful of components out of 55, so the ratio is far more lopsided. Angular Material publishes one
  entry point per component for exactly this reason, and the APF rule is «entrypoints for the smallest
  sets of logically connected code possible»; `@angular/cdk` does the same and we already consume it
  that way (`overlay`, `portal`, `drag-drop` are three specifiers).

  **SIZED 2026-09-01, and per-component is NOT the expensive option.** ng-packagr requires a
  cross-entry import to go through the public specifier, and `src/lib` holds **318 cross-group import
  statements** today (250 runtime + 70 type-only; `node tools/entry-point-graph.mjs` reports 320
  counting the two `export … from` crossings, and 319/76 groups after A3-pre). Rewrites needed: **per-component 318, six semantic
  clusters 265, three layers 257** — only **19%** apart, because most cross-group imports point at
  core-ish modules (`icons`, `core`, `field-message`) that cross a boundary under any partition. Coarse
  clustering therefore saves almost nothing on the refactor and gives up the whole eager/lazy win.

  **And semantic clustering is structurally worse.** A six-cluster attempt has a real cycle
  `data -> fields -> display -> data`: `pagination -> select`, `autocomplete -> tag`,
  `multi-select -> tag`/`badge`, `empty-state -> loading-overlay`. Every edge is a legitimate
  composition — components do not respect semantic categories — and ng-packagr forbids cycles
  between entry points, so any clustering must be de-cycled first. Per-component has only the two
  trivial sibling cycles. **Verdict: go per-component.**

  **Re-validated 2026-09-02 after a challenge, and the rejection got stronger.** The first argument was
  weak — it rested on ONE attempted clustering having a cycle, which proves nothing about clustering in
  general. So the question was asked properly: make that clustering acyclic and see what it becomes. A
  cluster graph is made acyclic by merging its strongly-connected components, and `data`, `fields`,
  `display` and `shell` all merge:

  | cluster after merging | groups |
  | --- | --- |
  | `data+display+fields+shell` | **60** |
  | `core` | 15 |
  | `services` | 2 |

  **Six semantic clusters collapse to three, and one of them holds 60 of the 77 groups.** That is the
  three-layer partition again, which is already measured as delivering roughly nothing for an
  eager-shell consumer. A lazy route using `ds-table` would drag **59 sibling groups** with it.

  The cause is that the cycle is made of real edges — `pagination -> select`, `autocomplete -> tag`,
  `multi-select -> badge`, `empty-state -> loading-overlay`. Components compose across semantic
  categories, so the categories do not match the dependency structure. It is not that this particular
  clustering was badly chosen; it is that clustering by meaning does not survive contact with the graph.

  **A missed rewrite fails the build with a useless message, tested:** swapping one public specifier for
  a relative path across a boundary gives `Cannot destructure property 'pos' of
  'file.referencedFiles[index]' as it is undefined`, with nothing naming the cause. The good news is it
  FAILS rather than silently bundling the same source into two FESMs, which would give two class
  identities and DI resolving two different services. Restoring the specifier builds again — causal
  link confirmed by control.

  **Cost checklist:** ~75 nested `ng-package.json` (2 lines each) + a `public-api.ts` per folder; 318
  import rewrites; root `public-api.ts` becomes a pure facade (measured twice as costing consumers
  nothing); `ds-docs` needs a tsconfig path mapping per entry point since it compiles from source; check
  `extract-component-api.mjs`, `extract-tokens.mjs`, `class-surface-diff.mjs` and `changelog-lint.mjs`
  against the new layout; co-locate the two sibling cycles. Secondary entry points are NOT deprecated
  (ng-packagr `docs/secondary-entrypoints.md` on `main`; the "Feb 2026 guide" once cited alongside it
  is withdrawn — never named, never linked). Full analysis:
  `packaging-diagnosis.md` « Do we have to split? ».

- [x] **[P2] A3-pre — DONE 2026-09-02 in `bff7efbc`. Reversed from DECLINED, and the cost was wrong
  twice.** The decline rested on an inflated 40. The reversal then published **14**, which is the
  cost of moving `ds-config.ts` ALONE — a move that leaves `components/card` inside a three-way SCC
  and does not achieve the goal. Recomputed 2026-09-02 by re-running Tarjan under each candidate cut:

  | cut | statements | non-trivial SCCs left |
  | --- | --- | --- |
  | **the plan as executed** — `ds-config` AND `card.types` → `core` | **17** (+1 in `public-api.ts`) | `core+icons` |
  | `card.types` → `core` alone | **4** | `config+core+icons` |
  | `ds-config` → `core` alone | 14 | **`card+core+icons` — card still trapped** |

  The 4-statement cut achieves both stated goals (kills the layering inversion, makes `card` a leaf);
  the other 13 buy only the disappearance of the `config` group, 77 → 76. The full plan was chosen.
  Verified: `npm run build:lib` and `npm run lint` clean, public type surface identical at 126
  declarations. Original derivation:

  | move | import statements to rewrite |
  | --- | --- |
  | `config/ds-config.ts` -> `core` | 11 |
  | `components/card/card.types.ts` -> `core` | 3 |
  | **total** | **14** |

  The 40 came from assuming `icons.data.ts` (28 importers) had to move too. **It does not.** After the
  two moves above the four-way cycle is gone and what remains is `core <-> icons`, a two-group cycle
  that costs nothing: `icons` has in-degree 38 and was always going to live in the `core` entry.

  **Why do it, now that it is cheap.** Bytes were never the case — accepting the cycle costs 593 B gzip
  (core seed 84 430 B, seed + `CardComponent` 85 023 B). The case is architectural and I failed to weigh
  it the first time: `ds-config.ts` type-imports `CardElevation`/`CardPadding` from a COMPONENT, which is
  a layering inversion — the config knows about a thing that depends on it. Fixing that also makes
  `card` an ordinary leaf component with its own entry point instead of a permanent resident of the
  bottom layer. Fourteen rewrites is a twentieth of the 307 the entry-point work needs anyway.

  Do it as the FIRST commit of the entry-point work, on its own, so the layering fix is reviewable
  separately from the 307 mechanical rewrites.

  **Still worth having, and independent of the cycle:** `theme` as its own entry point.
  `provide-ds-theme.ts` imports only `@angular/core` and `@angular/common`, so it is a true leaf, and
  `provideDsTheme()` — the anchor in every consumer's documented setup — becomes nearly zero-cost.
  Fold that into A3 rather than a separate item.

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

- [x] **[P2] Entry-point boundary guard — BUILT 2026-09-01, shipped OFF until A3 flips it.**
  `eslint-rules/rules/entry-point-boundary.mjs` + `ds/entry-point-boundary` in the plugin, wired in
  `eslint.config.mjs` scoped to `src/lib/**/*.ts` at **`'off'`**. It flags a relative import whose
  target lies in a different entry-point group, names the public specifier to use instead, and covers
  `import type` too — an erased import is still an entry-point dependency and fails the same way.
  Co-location allowances are the three accepted SCCs (`radio`/`radio-group`,
  `time-columns`/`time-picker`, and `card`/`config`/`core`/`icons`).

  **Watched it go red, which was the point: 307 violations** under the rule's shipped defaults (the
  three accepted SCCs). Close to the 318 static count — the difference is exactly the imports inside
  those SCCs. **CORRECTED 2026-09-02: the breakdown below is from a DIFFERENT run** — the probe config
  that co-locates the whole 13-group core, which reports 277, not 307. Both runs were reproduced; the
  81% holds under either (224/277 = 80.9%, 248/307 = 80.5%), but the four counts belong to the 277 run:
  **81% of them point at just four targets:** `components-root` 92, `core` 60, `icons` 57,
  `components/field-message` 15 — and under the 307 run those are 99 / 68 / 64 / 17. So A3's rewrite
  is four bulk replacements plus roughly fifty individual reviews, not 318 separate decisions. Heaviest
  importers: `multi-select` 27, `autocomplete` 25, `select` 24, `modal` 13, `input` 11, `table` 12.

  **Why OFF and not warn:** 307 warnings would drown the existing lint output. `npm run lint` is
  unchanged (verified exit 0). **Flip it to `'error'` in the same commit that finishes A3's rewrites** —
  after that it is the thing that stops a missed one from surfacing as an unrelated-looking ng-packagr
  crash. Probe config for running it at error before then: `.claude/local/eslint.entrypoint-probe.mjs`
  (gitignored).

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

- [x] **[P2] A1's open question answered: the seam costs a FIXED 923 B gzip.** Fixture
  `.claude/local/seam-probe2/`. Feature 1.6 KB gz: bare 32 965 / mono 34 592 / seam-off **33 888**.
  Feature scaled 4x to 5.9 KB gz: bare 32 965 / mono 38 901 / seam-off **33 888** — byte-identical, so
  the overhead is fixed (the service, its `providers` entry, the composition point, the module boundary)
  while recovery scales 1:1 with the feature. For the real table, 18.9 KB of features against one
  registry (~1-2.5 KB) means **the seam keeps ~87-95% of the prize**. Honest trade: a consumer who DOES
  use the feature pays ~1 KB more than today. **A1 is worth building.**

- [x] **[P3] Ceiling on the directive split: bounded, not measured.** Extending the ablation to row
  actions and inline editing was abandoned as not worth the effort — the first ablation took the table
  from 31.4 to 12.1 KB, and both features live inside that remaining 12.1 KB, so **18.9 KB is the floor
  and 31.0 KB the hard ceiling**. Sorting, selection, pagination, loading, sticky header and cell
  rendering all stay. Precision changes no decision; do not re-open.

- [x] **[P3] Two risks checked and dismissed 2026-09-01.** (a) **Name collisions in a 77-way facade:**
  none — 131 exported declarations, the only repeat is `DsConfig` (interface + token in one file), and
  the current root already `export *`s everything and compiles. (b) **Angular 22:** the `probe/angular-22`
  branch (`7de133dc`) touches `bun.lock`, `package.json`, three tsconfigs and one signal-forms probe —
  nothing about packaging, entry points or the FESM layout.

- [x] **[P3] Splitting the icon map — DECLINED 2026-09-01 (measured, not judged).** `ICONS` is one
  const map of 86 icons (115 was a typo), so any icon retains all of them. Cut to 9 icons on `probe/icons-map` and
  re-measured: `ds-button` 62 733 -> **60 211 B gzip**. **The whole icon set is 2 522 B gzip** — SVG
  path strings compress to almost nothing. Per-icon exports would break `IconName = keyof typeof ICONS`
  and `provideDsIcons` for at most ~2.3 kB. Do not re-open without a new measurement.

- [x] **[P2] The eager-component case DOES NOT overturn A3 — checked 2026-09-01.**
  `packaging-chunking-audit.md` §7 named «a consumer whose EAGER root needs a component rather than a
  service» as D's trigger. Measured: an eager shell (`app-layout` + `sidenav` + `topbar` +
  `page-header`) costs **201 283 B gzip** today and closes over only **9 of 77 groups** (+`tooltip`),
  which builds standalone at **101 108 B gzip**. **CORRECTED 2026-09-02: the ~98 kB first recorded here
  subtracted the 59 019 B lazy-route floor from `shell_closure.ts`, which has no lazy route.** Against
  its own control the closure is 101 108 - 30 646 = 70 462 B, so the modelled post-A3 initial is
  ~129 kB and an eager-shell consumer saves **~72 kB gzip, about -50%**, against an eager-service
  consumer's ~80 kB — but ONLY with per-component entries, per A3+ above.
  Shell and services together close over 16 of 77 groups.

- [ ] **[P2] `ds-button`'s field-message line costs 11.0 KB gzip — 35% of the button, ABLATION DONE
  2026-09-01.** `ButtonComponent extends DsMessageBase` and imports `FieldMessageComponent`,
  `resolveFieldMessage` and `trimmedText` so a button can render a hint/warning/error line under itself.
  Ablated on `probe/button-field-message` (worktree `C:\wt-ds-table-split`, commit `2c1dbdb7`), control
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

- [ ] **[P2] There is no page-level design approach an agent can follow — only per-token and per-component rules (Stas, 2026-09-01).** `design-system.md` covers spacing, type, size, colour, motion, content and overrides, and it answers "what value do I use" well. It does not answer **"where does this go on the page"**, which is the whole question when an agent is prototyping a screen rather than styling one control. Concretely missing:
  - **Corner radii have no rule at all.** The only mention in `design-system.md` is line 304, in passing, about radius travelling as a ROLE when a host overrides it. Nothing says which radius belongs to which surface class, or how radii nest (an inner element inside a rounded container).
  - **No composition guidance.** Where the page heading sits, where primary vs secondary actions go, when content belongs in a card and when it does not, where filters live relative to the data they filter, where supporting information goes.
  - **No pattern catalogue.** Which page patterns the DS actually supports (list + filters, detail, form, dashboard, empty/error), what each is made of, and how to tell which one a given screen is.
  - **No method for measuring a pattern** — how to check a composition against the grid and the spacing scale instead of eyeballing it.
  The deliverable is a file an agent reads before it lays out a screen, in the same voice as `design-system.md`: rules with reasons, not a style tour. It ships in the package (`tools/build-schematics.mjs` copies the root `.md` files into `dist/ds`), so it reaches consumers' agents too.
  **One item in the dictated list needs confirming before it is written up:** "где должен быть фильм" is almost certainly a speech-to-text slip for **фильтр** (filter) — that reading fits the surrounding list of buttons/cards/information/heading. Confirm before treating it as a real requirement.

## DS-docs

- [ ] **[P3] ds-docs renders a space before punctuation after any inline `<code>` (found 2026-09-01).**
  The house lint rule `ds/template/element-content-newline` moves the content of an inline `<code>` onto
  its own line, so `</code>.` becomes a collapsed newline plus the period and the browser renders
  `--radius-pill-value .` — measured in the radius section's own lede, which predates this note, so it
  affects every section that puts punctuation after a code span. **Not a local defect:** fixing it in one
  section would fight the lint rule and make that section inconsistent with the other sixty. The fix is
  either a rule exemption for inline `<code>` or a CSS-level one; either way it is a single change for the
  whole site. Low priority — it is one space — but it is in every paragraph that names a token.

## Component feature gaps


- [ ] **[P2] One entry point for the whole library means a consumer cannot keep the DS out of their initial bundle (2026-08-03, Stas — mm-broker MBP-133 review).** _(Re-counted 2026-08-05: **85** exported `*Component` classes plus 9 directives (re-counted 2026-08-10; was 83 + 8 on 08-05), by `grep -rho 'export class .*Component' src/lib | sort -u`. The item said 73; the figure does not change the argument, but it is now stated with its method so nobody re-counts.)_ `ng-package.json` declares a single `entryFile`, so the package ships as one 1.25 MB `fesm2022` module behind a single `"."` export. `sideEffects: false` is set and tree-shaking works fine — unused components are dropped — but **chunking cannot happen**: esbuild splits by module, so it can never place two DS symbols in two different chunks. Measured in mm-broker: the app's eager composition root binds `NotificationService` to a toast implementation, that one runtime import of `ToastService` pins the whole retained DS graph into a chunk statically imported by `main`, and the result is **632 kB — about 88% of a 720 kB initial bundle** — even though every feature route is lazy and the only eagerly-needed symbol is one service. The consumer has no lever: the root is the only specifier, and moving the provider to a lazy route does not help because interceptors and the `ErrorHandler` resolve from the root injector. **Ask:** secondary entry points (ng-packagr supports a nested `ng-package.json` per folder). Even a coarse split would fix it — a services/overlay entry point carrying `ToastService`, `ModalService` and `BodyScrollLockService` separately from the component layer, so an eager root can import the service and leave 70-odd components lazy. Per-component entry points would be ideal but are a bigger change; the services split is the one that unblocks consumers. **Explicit non-goal:** nothing about the public API surface needs to change — same symbols, same names, just reachable through narrower specifiers. **RE-AUDITED 2026-08-03 → read `packaging-chunking-audit.md` before actioning this item; three claims above are wrong.** The mechanism is confirmed by controlled esbuild fixtures, but: this was never filed upstream (it is the consumer's own backlog item, with a consumer-side fix); "the consumer has no lever" is false (a dynamic `import()` keeps `main` clean — it just costs tree-shaking, measured +50%); and the 07-27 "tree-shaking already works" verdict is NOT overturned — placement and tree-shaking are orthogonal and both findings stand. The audit also merges this item with the "Packaging — secondary entry points" section below, which duplicates it with the opposite verdict.
  **DEFERRED by Stas 2026-08-21, with a deck instead of a build — `presentations/4-packaging-entry-points.html`.**
  It draws the mechanism (one FESM is one module, so placement cannot happen), the three esbuild fixtures
  as bars scaled to their measured sizes, the grep counts that isolate the cause, and all four options
  with what each costs in placement AND tree-shaking. **The deck's recommendation was rewritten
  2026-09-01 to match the correction recorded below**: it used to say B and only B, which is the one
  option that turned out not to be buildable, so the page now marks B dead and recommends D — layered,
  not per-component, at the three-layer cut A0 measured. Read the rest of the page for the mechanism and
  the numbers, which still hold.

  **DECIDED 2026-08-05: option B from `packaging-chunking-audit.md` §7 — one services entry point, root `public-api.ts` kept as a facade.** It is the only option the fixtures measured as fixing chunk PLACEMENT without losing tree-shaking, and it is non-breaking: same symbols, same names, no cross-entry deep-import refactor across 71 folders. **Two things to get right when building it, both found while deciding:** (1) the entry point is NOT as narrow as its name — `ToastService` imports `ToastRegionComponent` and `ModalService` imports `ModalConfirmComponent`, so the entry necessarily carries those components and their own deps; that still fixes the reported problem, because the ~70 components the app touches only from lazy routes stop being pinned into `main`, but the eager cost is the toast+modal graph rather than three classes. (2) The secondary entry must OWN the source and the root must re-export FROM it — if both entries export the same source, a consumer importing from both gets two class identities and DI silently resolves two different services. **CORRECTED 2026-08-05, before anyone builds it: option B is NOT implementable as the audit describes it, and the audit is wrong on this point because it measured synthetic fixtures rather than the real import graph.** Followed the actual chain: `ToastService` → `ToastRegionComponent` → `ToastComponent` → `IconComponent` + `SpinnerComponent`; `ModalService` → `ModalConfirmComponent` → `ButtonComponent` + `ModalCardComponent` → `IconComponent`. So a services entry point must OWN button, icon, icons.data, spinner, toast and modal-card — and every other component needs those same leaves, so the ROOT would have to import them from the services entry. ng-packagr forbids cycles between entry points, so there is no arrangement where a small services entry sits beside an unchanged root. What that shape actually is: a LAYERED set of entries — `core` (icon, button, spinner, overlay primitives) ← `services` ← `components` — which is the audit's option D, described there as a separate large refactor, and it changes how every consumer imports. **So the live choice is A, C or D — not B. Described 2026-08-05 at Stas's request and DELIBERATELY LEFT OPEN: nothing here is urgent (no consumer is blocked, only sub-optimally chunked), and each option's cost lands somewhere different.**

- **A — do nothing.** Every feature route in the consumer is already lazy, so the DS chunk arrives with the first route rather than before it; what the 632 kB measurement really shows is that one eager `ToastService` import pulls the retained graph into `main` instead of into route 1. Cost: zero. What stays wrong: a cold first paint carries components the first screen does not use. Closing on A means recording that trade as accepted, since the numbers will resurface in the next consumer audit.
- **C — consumer-side dynamic `import()`.** The consumer's composition root imports the service lazily, which keeps `main` clean with no DS change at all. Measured to cost ~50% of the tree-shaking win (the dynamic specifier defeats static analysis, so more of the graph is retained). Also NOT ours to make: the fix lives in the consumer's repo, and per the scope rule this repo does not plan changes there — so choosing C means closing the DS item and letting the consumer decide.
- **D — layered entry points: `core` (icon, button, spinner, overlay primitives) ← `services` ← `components`.** The only shape that fixes chunk PLACEMENT without losing tree-shaking, and the only one that survives the real import graph: `ToastService → ToastRegionComponent → ToastComponent → IconComponent + SpinnerComponent` and `ModalService → ModalConfirmComponent → ButtonComponent + ModalCardComponent`, so a services entry must own those leaves, and every other component needs them too — which is why B (a narrow services entry beside an unchanged root) cannot exist: ng-packagr forbids entry-point cycles. Cost: ~40 files change imports inside the DS, the public specifier set grows from one to three, and every consumer's imports move (a codemod-able rename, but a breaking one needing a major). Benefit: an eager root can hold `ToastService` while ~70 components stay behind lazy routes.

**Two traps recorded while deciding, so they are not re-derived:** (1) the secondary entry must OWN its source and the root must re-export FROM it — if both export the same source a consumer importing from both gets two class identities and DI silently resolves two different services; (2) the audit's fixtures were synthetic, which is exactly how it concluded B was viable, so validate any future claim against the real import graph.

**MEASURED 2026-09-01 — option D is cheaper than it was written down as; read `packaging-chunking-audit.md` §10.** The open question from the audit's §8 (does ng-packagr's secondary-entry-point output survive the Angular application builder?) is answered: yes. A real three-entry library (`core` leaf, `services` and `heavy` importing it by public specifier, root a pure re-export facade) built by ng-packagr and consumed by `@angular/build:application` moved the heavy payload out of the eager chunk — **118 011 B → 85 800 B statically imported by `main`**, heavy payload into its own 32 121 B on-demand chunk — with a **38-byte** total-size difference, i.e. no tree-shaking penalty (nothing like C's +50%). The control (single entry point, today's shape) reproduced the failure exactly: 600 payload markers in the eager chunk, lazy chunk collapsed to 100 B. **The finding that changes the cost model: `facade` and `deep` consumer variants are byte-identical down to the chunk hash** — a consumer keeps importing from the ROOT specifier and still gets correct placement, so D's headline cost («changes how every consumer imports») is not real when the root stays a pure facade. The refactor becomes internal. **Still untested:** whether the real 71 component folders partition without cycles — favourable at the top level (nothing in `core/`, `icons/`, `overlay/`, `theme/` imports a component at runtime; the one edge, `config/ds-config.ts:4`, is an erased `import type`; `toast/` and `modal/` need only button, spinner, icon), but a full partition has not been attempted. Fixture: `.claude/local/entrypoint-probe/` (gitignored).

- [ ] **[P2] Split the package into `basic` + `advanced` (Mikhail, carried over from an earlier ask; re-raised 2026-08-30).** The proposal: prototypes install a light kit, production apps add a heavy one, `ds-table` swapped for an `ids-data-grid`. **AUDITED 2026-09-01 → read `basic-advanced-split-audit.md` before actioning. Both premises are measurably false.** (1) Bundle: on 0.11.1, going from the 44 components a prototype uses to all 96 costs **18 KB gzip**; the whole library is 179 KB gzip; entry cost is 5.6 KB; `ds-table`'s MARGINAL cost beside the rest of the kit is **32 KB gzip**, not the 118 KB it measures alone. (2) Capability: every feature named for `ids-data-grid` — column resize, filters, visibility, order, CSV export, inline edit, sticky h-scrollbar, truncate+popover, selection-safe row click — **already ships in `ds-table`**, most since 0.6.3. So a split would move shipped features into a second package and double the release pipeline to save ≤32 KB. (Breaking consumers is NOT part of the case against it — see the memory rule; shipped features are free to move.) **The one shape that survives the numbers** is intra-component, not intra-package: move the table's opt-in behaviours into separately-importable directives (`DsTableResizable`, `DsTableExport`, …) so the heavy parts tree-shake per feature — one component, one docs page, no mirror to keep in sync. Unmeasured; ceiling on the saving is 32 KB. **A separate package is justified by an external runtime dependency, never by component count** — which makes `ids-charts` a real candidate the day it needs a third-party renderer, and `ids-advanced` not one. Decision is Stas's; nothing is blocked.

- [ ] **[P2] Measure the table's opt-in behaviours as separately-importable directives (Stas, 2026-09-01: «затести и померяй»).** The one shape from the basic/advanced proposal that survives the numbers (`basic-advanced-split-audit.md` §7). Today every opt-in feature's code ships whether or not its `input(false)` is set, so `ds-table`'s **32 KB gzip marginal cost** is paid in full by a prototype that uses none of them. Candidates to extract: `DsTableResizable` (`resizableColumns`+`columnWidths`), `DsTableReorderable` (`reorderableColumns`+`columnOrder`+`hiddenKeys`), `DsTableExport` (`exportButton`/`exportFilename`/`exportFetcher`), `DsTableColumnFilters` (`columnFilters`+`HeaderFilterDirective`), `DsTablePersistLayout` (`persistLayout`+`storageKey`). **ABLATION DONE 2026-09-01 — the prize is real: 18.9 KB gzip.** Branch `probe/table-feature-directives`, worktree `C:\wt-ds-table-split`, built from `dev` at `5783c830`; full record in `basic-advanced-split-audit.md` §9. Deleting resize + reorder/picker + column filters + CSV export + layout persistence + truncate-popover (1 063 source lines across .ts/.html/.scss) took `ds-table`'s marginal cost from **31 428 B → 12 125 B gzip, −61%**. That is MORE than the whole basic/advanced package split targets (18.2 KB), inside one component, with nothing to mirror. And it is a FLOOR, not a ceiling — row actions and inline cell editing are equally advanced and were left in. **The catch the ablation exposed, and the actual design work:** the features are not cleanly separable today — `clipWidth`/`fitsContent` serve both truncate and resize, `orderedColumns`/`visibleColumns` are the same computed chain the picker writes to, `filteredData` folds set filters into the substring search, `statusMessage` folds export state into the live region. So the split needs a seam — most likely a small internal layout/state service the directives write into and the table reads — not a method-by-method move. Next: design that seam, then build `DsTableResizable` / `DsTableReorderable` / `DsTableExport` / `DsTableColumnFilters` / `DsTablePersistLayout` against it.

- [ ] **[P3] Split «design system» from «UI kit» as two packages (Mikhail, 2026-08-30).** His words: «Можете тогда вообще ui kit и дизайн систему на разные пакеты разнести?» — the UI kit being the whole component library, and the design system being the rules, tokens, themes and guides. **Partly true already:** tokens and themes ship as SCSS assets under `styles/*` and `themes/*` behind their own `exports` entries, and the rules/guides live in the deployed docs site rather than in the package. So the question to study is narrow: is there a real consumer who wants the tokens WITHOUT the components (a non-Angular app, a Figma/CSS-only pipeline, another framework), and does that consumer exist today? If yes, a tokens-only package is cheap and has no mirror-maintenance problem — unlike the basic/advanced table split, nothing is duplicated. If no, the current `exports` map already covers it. **Interacts with the entry-point work above:** a layered `core ← services ← components` partition and a tokens-only package are the same question asked twice, and should be designed together rather than separately.

- [ ] **[P3] `DS_CONFIG` prototype mode — `prototype: true` (Mikhail's original framing, endorsed by Stas 2026-09-01: «ds config тоже можно. как я и говорю prototype: true»).** One flag in the existing `DS_CONFIG` that puts the whole library in prototype mode instead of asking a consumer to pick a package. **The honest caveat, and it must be settled before this is built:** a runtime config flag CANNOT reduce the bundle — the code for the features it disables is still imported and still ships, so `prototype: true` buys behaviour, not bytes. Only the directive split above removes bytes. So decide what the flag is actually FOR: (a) turning off advanced affordances so a prototype's UI stays simple and demo-able — a real and useful thing, unrelated to size; (b) build-time dead-code elimination, which would need it to be a compile-time constant a bundler can fold, not a DI value. Do not ship (a) while implying it does (b). `DS_CONFIG` already resolves per-component defaults via `resolveWithConfig`, so (a) is a small build.


- [ ] **[P3] `todo.md`'s one-line index no longer accounts for its body, and the gap cannot be attributed by eye.** Measured 2026-09-02: 44 index lines against 66 open body items. Some of that is legitimate — the Decisions, Parked and Records blocks summarise rather than mirror — so the raw difference is NOT the orphan count, and a quick substring matcher written to find them flagged all 55, which is proof the naive approach does not work rather than a finding. What is needed is a per-section reconciliation: decide which sections mirror 1:1 and which summarise, then check only the mirroring ones, and ideally leave behind a script so the next drift is mechanical to spot. Two sessions were editing this file within the same hour when the gap was measured, so do it when the file is quiet.

- [ ] **[P3] A token named in prose is not checked against the tokens that exist, and the same fact lives in two copies.** `--static-white` was removed at 0.5.1 and was still advertised in `src/lib/themes/README.md` AND in `ds-docs`' theming page months later; both are fixed, but nothing stops the next one. Two mechanisms would: (a) a gate that extracts every `--token` mentioned in prose (`*.md`, the ds-docs section templates) and fails on any that no longer resolves in `_base-palette.scss` / `_semantic.scss` / `_tokens.scss`, with an allowlist for text that is deliberately historical — `docs/done.md` and the migration manifests must keep naming what they removed; (b) pairing the two copies, since a repo doc and its ds-docs page carry the same facts and drifted independently twice in one day. Sequence (a) first: it is mechanical and catches the class, while (b) is a restructure.

- [ ] **[P3] Three edges left open on `ds-table` row expansion and the resize handle, each a judgement call rather than a defect.** (a) On a page with no rows the expand-all chevron still renders and its label reads "Expand all rows", while clicking it does nothing — the handler early-returns. This is an exact clone of what the select-all checkbox next to it does on an empty page, so it was left for symmetry; breaking the symmetry needs a disabled state on `.expand-btn`, which the shared icon-button chrome has no styling for. (b) Under `lazy` (no `pageSize`, `total` set) `expandAllLabel` omits " on this page" because it keys on `pageSize()`, while expand-all only reaches the rows that have arrived. Inside the already-declared-unsupported `virtualScroll` + `expandableRows` combination. (c) The expander column's `<th>` had no accessible name and now takes one from the expand-all button — which FLIPS between "Expand all rows" and "Collapse all rows", so in table-navigation mode every body cell in that column inherits a changing column name. The `select-col` `<th>` sets the precedent of naming itself from its control, but with a STABLE name. Fixing it means an `aria-label` on the `<th>` naming the column, which is a pattern the component does not use anywhere else.

- [ ] **[P3] `ds-number-stepper` — optional numeric formatting (locale / currency / decimals / grouping), ref https://primeng.dev/inputnumber.** Today it's a raw `value: number` + `min`/`max`/`step` + spinner, no display formatting. PrimeNG InputNumber's value-add is a formatted numeric field: thousands grouping, fixed decimals, currency/percent, locale-aware, parsed back to a number on edit. Add opt-in `mode` (decimal/currency/percent) + `locale`/`currency`/`minFractionDigits`/`maxFractionDigits`/`useGrouping`; format on display/blur, parse on focus/input. Masking prior art in-house: [[reference-masked-input-dom-writeback]] (pinkmoon phone/w3w imperative `element.value` write-back). No active request — likely pulled by the financial-admin consumers (mm-broker admin, pinkmoon amounts/rates/%); gate on the first such form. **GATE HELD 2026-08-25 (Stas), asked explicitly.**


## `TableRowAction` cannot express a per-row menu, so `rowActions` is adopted nowhere (from mm-broker, 2026-08-18)

- [ ] **[P3] The two row-action halves left open on purpose: a per-row `label`, and a divider or
  `group` (split out of the item above 2026-08-21, when `hidden` and `disabledReason` shipped).**
  `label: string | ((row) => string)` blocked 4 of the eleven menus — Deactivate/Reactivate,
  Activate/Deactivate, Add fee/Edit fee — and is expressible today as two ids each carrying its own
  `hidden`, which is why the original counted it the cheapest of the four to decline. The divider
  blocked 2, where the destructive tail is separated by a `ds-menu-divider`, and ordering the items
  destructive-last covers it without new API. **Both are P3 until a consumer says the workaround is
  the thing stopping them** — the two that actually blocked adoption have shipped, so the next word
  on these should come from a migrated screen, not from the original count. **GATE HELD 2026-08-25
  (Stas), asked explicitly.** _(The done kebab-token sub-item moved to `done.md` 2026-08-26.)_

# Decisions — waiting on Stas, not on work

## Tooling

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
  Two constraints for whoever does it: table rows (`| … |`) must NOT be re-wrapped, because `check-delete-tables` matches a manifest's `find` shapes verbatim against them; and several inline code spans are currently split across a break (`` `<button\n  class="link">` ``, `` `flex: 1;\n  height: auto` ``, `` `<ng-template\n  [dsFilterItem]="180">` ``), which a re-wrap should join rather than preserve. Three more came out of the same reflow and must join too: `` `ds-select { --ds-field-label-transform: uppercase; }` ``, the `::ng-deep ds-table tr:hover .cell-name { … }` workaround shape, and `` `color="neutral" variant="outline"` `` — that last one is a rename map, so a line-oriented grep for it currently misses the CHANGELOG, which is the exact hazard this gate was written for. Six shipped comments are ragged too and are NOT in this item: `_ds-color.scss:4`, `auth-layout.component.ts:20`, `_tokens-charts.scss:36`, `themes/light/_palette.scss:15`, `auth-layout.component.scss:29`, and `_status.scss:10-11`. Verify by comparing the whitespace-normalised word stream before and after.

- [ ] **[P3] Does a release note owe the reader a WHY, or only a what-and-what-to-do? (Stas, 2026-08-28, left open on purpose during the public-surface sweep.)** The case that raised it: `ds-search` lost `hint` / `error` / `warning` / `errors` / `invalid` / `touched` / `reserveMessage` / `messageIcon`. Two shapes are available and the release currently ships BOTH — the entry states the removal, and a following paragraph explains the CVA split that caused it.
  **The narrow shape** is what the manifest already does: `old`/`new`, an `action`, and the locators to find it. A consumer's agent needs nothing else to migrate — it does not care why the inputs left.
  **The wide shape** is the changelog paragraph: it answers "why did they leave, and will they come back", which a human deciding whether to upgrade may want and an agent never reads.
  **What the format itself says**, and this is the argument for keeping the why somewhere: `migrations/README.md` defines `note` as "what is LEFT: the why" — so the schema deliberately reserves a field for it, separate from `action`. That makes "explain" legitimate but bounded: the why belongs in `note` and in the changelog prose, never in `action`.
  **Held as undecided rather than settled** because the sweep already removed a lot of explanation as archaeology, and the line between "why the API is shaped this way" (useful) and "how we arrived at it" (ours) is exactly what was hard to draw all day. Revisit with the next release note in hand rather than in the abstract.


- [ ] **[P3] ds-docs still writes BEM MODIFIERS as `--suffix`, and a state should be its own class (Stas, 2026-08-26 — the `__` half is done and archived).** `is-*` IS better here and that is the recorded preference: a modifier glued to the name with `--` reads as a different ELEMENT, while our convention says a variant of one thing is a STATE carried alongside it (`.stage.is-tbl`), which is also how a state reads in the DOM and how it composes with two states at once. Counted 2026-08-26: **11** element-plus-modifier forms flattened this pass and now spelled `state-cell-stage--tbl`, `cell-tag--do`, `cell-tag--dont`, `contract-row--no`, `demo-col--end`, `demo-group-btn--start/--mid/--end`, `halo-stage-well--inverted`, `state-stage--horiz`, `state-cell-stage--overflow`, plus a separate standalone set (`demo--centered`, `applied--stacked`, `demo-btn--ghost`, `demo-menu-item--error`, `btn--start/--mid/--end`, `cell--do/--dont`, `col--end`, …).
  **Why it was split off rather than done in the same pass.** Removing `__` was a pure rename — 865 occurrences, zero semantic change, provable (589 classes used and 589 styled, identical before and after). Converting `--mod` to `is-mod` is NOT: it splits one class into two in the markup, which changes selector specificity from (0,1,0) to (0,2,0) wherever the SCSS is nested, and specificity is exactly what a docs section leans on when it pins a component's forced state. That wants its own pass with its own verification, not a rider on a mechanical one.
  **Then extend the guard.** `selector-class-pattern` currently allows `-` freely, which is what lets `--` through; once the conversion lands, tighten it to reject a doubled hyphen in a class name so the notation cannot come back — the same shape as the two rules that now block `__` (`selector-class-pattern` plus `selector-nested-pattern`, because the first one alone does not see `&__x`).

- [ ] **[P2] prettier and eslint want opposite things about HTML, so `lint:all` can never be green (measured 2026-08-25).** Ran the three formatters over the whole project on Stas's instruction — prettier, then stylelint, then eslint. Prettier reformatted **140 files** (115 html + 25 ts) and needed a second pass on three before reaching a fixed point. Eslint then pulled **77 of them back**, leaving 63 actually changed. Afterwards prettier reports **~112 html files as unformatted, permanently**: its line-breaking fights `ds/template/element-content-newline` and `@angular-eslint/template/attributes-order`, and each tool undoes the other on the same files every time either runs. **This is not formatting debt — it is a config conflict, and no number of `fix:all` runs converges.** It is why the `format` step of `lint:all` has been red for so long that the PR gate was set to report-only, which then hid every real lint finding behind a known-red step.
  **Three ways out, and it is a taste call, not a technical one:** (a) **stop prettier at the html door** — add `*.html` to `.prettierignore` and let the two `ds/template/*` rules own template formatting alone (smallest diff, and eslint already wins today in practice); (b) **drop the two ds rules** and let prettier own html (bigger one-off diff, loses the attribute-order convention the repo chose deliberately); (c) keep both and accept a permanently red step (status quo — but then say so in the script, so nobody re-runs `fix:all` hoping it converges). **Recommendation: (a).** Eslint is already the de-facto winner, prettier still owns ts/json/md where nothing contests it, and it makes `lint:all` green so the PR gate can stop being report-only.
  **Re-measured 2026-08-31**, running the three in the order prettier → stylelint → eslint with eslint last: prettier rewrote 112 files in its own scope, stylelint had nothing to say, and `eslint --fix` reverted 111 of the 112. Net change was 8 files of whitespace inside inline elements, which Angular discards — so the tree has been in eslint's shape all along and `npm run format` is red at 111 either way.
  **Not urgent, not cosmetic:** nothing ships wrong today, but a permanently red gate is how a real finding gets missed — which is the same failure mode as the report-only PR lint.

- [ ] **[P3] Eight manifest-format practices the audit marked *Adopt*, and nobody has ratified any of them (filed 2026-08-27 out of `presentations/9-migration-manifest-audit.html`).** The audit's own header says it: "the verdict column is a judgement about this repo, not about the practice." So *Adopt* there is a recommendation, not a decision — and the recommendations have sat only inside a deck since 2026-08-25, which is the shape of a verdict nobody executes. **The decision is which of the ten, if any**, not whether each is defensible; every one was sourced from a primary doc, so they are all defensible and adopting all ten is a tooling project no consumer is pulling on.
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

## The field system — the two controls outside it, and the five with no box to paint

- [ ] **[P2] `ds-number-stepper` and `ds-dropzone` are outside the field-message system entirely — bring them in, or say they are not fields (Stas asked 2026-08-20).** Audited, and they are not "fields missing a feature" — they never had the wrapper. **`ds-number-stepper`** exposes `value`, `min`, `max`, `step`, `size`, `disabled`, `ariaLabel` and nothing else; **`ds-dropzone`** exposes `accept`, `multiple`, `files`, `disabled`, `single` plus two outputs. Neither has `label`, `hint`, `error`, a `ds-field-message`, `resolveFieldMessage`, or the `field-label` mixin — verified by grep, all zero. Every other one of the fourteen fields has all of it.
  **So this is a feature addition, not a unification**, and that is why it is a decision rather than work: both would gain `label`, `hint`, `error`, `errors`, `invalid`, `touched`, `reserveMessage` (now one `extends DsFieldBase`), a message row, and the label/required/optional block.
  **The case for doing it:** in a real form both want it. A numeric stepper needs a label and a validation error like any input; a dropzone needs a hint ("up to 5 MB, PDF only") and an error ("that file was rejected"). A consumer today has to hand-roll a label and an error line beside them, which is exactly the inconsistency this board exists to remove.
  **The case against:** neither has been asked for by a consumer, and `ds-number-stepper` may be intended as a bare control composed inside something else — though its own `ariaLabel` and `size` inputs suggest standalone use.
  **Cheap now that the base exists:** `extends DsFieldBase` plus a `resolveFieldMessage` call, a `ds-field-message` in the template, and the label block — the same shape all fourteen already share.
  **Cheaper again since 2026-08-25:** the base was split into `DsMessageBase` (the message half) and `DsFieldBase` (that plus `errors`/`invalid`/`touched`) so `ds-button` could take the message line, and `ds-button` is now the worked example of wiring the message half into a component that was never a field. Both of these hold a value, so both want the full `DsFieldBase` — but the pattern, the resolver call and the template shape are all demonstrated now rather than described.

- [ ] **[P2] Single-source colour engine — collapse `--primary` + `--primary-h/s/l` into ONE token, derive the rest with `color-mix()` + relative-colour (idea 2026-06-24).** ROOT CAUSE (surfaced when a consumer scoped `--primary-h/s/l` on a checkbox and ONLY the focus halo moved): "primary" has TWO decoupled reps — (a) `--primary` + hand-picked ramp shades read by component FILLS; (b) `--primary-h/s/l` HSL channels feeding ONLY math-derived halos/ramp/gray-tint — with **no live link**, so a coherent scoped recolour needs BOTH the channels AND a `--primary` re-composition (the 3-/4-token footgun). **Re-verified true 2026-07-24** (`_semantic.scss:91-93` channels; `:111-112` hover/pressed already `color-mix`; halos `:209-229`; gray tint `_base-palette.scss:41`). **IDEA:** one colour token per role as the only source; shades via `color-mix()`, hue via `hsl(from var(--primary) h <S> <L>)` keeping each step's hand-tuned S/L (see [[feedback-handtuned-colors-beat-formulas]] — only the HUE is single-sourced); drop `--primary-h/s/l` as PUBLIC API. Scoped recolour becomes ONE declaration; **UNBLOCKS the `ds-color`/`--accent-*` indirection**. **OPEN for the spec:** (a) colour space (`oklch`/`oklab` perceptual vs `srgb`/`hsl` matches today) — verify each derived role visually; (b) pure-derived vs hand-pick per role; (c) relative-colour + `var()` edge cases in the 3 target engines; (d) dark-theme interplay. Prototype: `presentations/2-color-engine-relative.html`.

- [ ] **[P2] `.ds-interactive` — global state-interaction contract (agreed; prototype before spec — [[project-interaction-contract-design]]).** Replace per-component `--ds-*-bg-hover/-active` + scattered `color-mix()` with ONE contract: a `.ds-interactive` class + presets driven by `--state-step-*` tokens in a NEW `src/lib/styles/_interaction.scss` (**still absent — verified 2026-07-24**), with an override slot (`--interactive-*-set`). Then migrate interactive components off their local recipes. **NEXT — blocking user verdicts B1–B5** (live demo `presentations/3-interaction-formula.html`): (B1) tint-pressed 28% vs 34%; (B2) pressed step for neutral surfaces (menu-item/table rows); (B3) danger menu-item hover — formula vs `--error-subtitle`; (B4) shape of the `--interactive-*-set` slot; (B5) pressed step for success/warning buttons. **Rewritten 2026-07-24:** the old "retire `_forced-states` duplication" clause is now MOOT — `_forced-states.scss` no longer exists (docs state-forcing is per-section `:host ::ng-deep .pin-*` reading each component's `--_*` resolvers). What survives is the broader "should presentational/state styling live in global partials (like `_link.scss`) with components as thin sugar" question. (Housekeeping DONE — re-grepped 2026-08-10, the stale `_forced-states` refs are gone from `README.md` and `table.component.scss`; nothing outside `.claude/` mentions it.)

- [ ] **[P2] Theme recipe vs hand-tuned picks — alignment decision.** Button/icon-button state derivation uses the theme's 88%/76% mix-to-black recipe (**verified `button.component.scss:34-38`, `_semantic.scss:111-112`, 2026-07-24**). If the single-source-colour calibration replaces `--primary-hover/-pressed` with hand-tuned values, the button defaults (color-mix off the resolved bg) diverge from the theme roles — decide then: components read role tokens again, or theme keeps the formula. **This is a concrete instance of the single-source item's open question (b); resolve it inside that spec, not separately.**

## Component API / portfolio

- [ ] **[P3] Shared picker internals — SURVEYED 2026-08-05, and the premise is wrong: it is THREE components, not six, and the duplicated surface is ~25 lines each.** Measured: only `ds-select`, `ds-multi-select` and `ds-autocomplete` share the shape (an `activeIndex` signal + wrap-around arrow nav over a flat option list). `ds-date-picker` navigates a 2-D day grid, `ds-time-picker` has NO arrow handling at all (it delegates to `ds-time-columns`), and `ds-color-picker`’s arrows drive a continuous saturation/hue canvas — three different models that a shared list helper would not serve. **Type-ahead does not exist anywhere** (zero hits), so that part of the ask describes code that was never written. And the three that DO overlap differ where it matters: select carries groups + Home/End + `firstEnabledIndex()` skipping disabled, multi-select works over a filtered list with a select-all row, autocomplete counts a create/no-match slot into its modulo. **Recommendation: extract only the index cursor** — a ~30-line `createListCursor({ length, isEnabled })` returning `{ index, next, prev, first, last, reset }` — and NOT a picker base class. **Worth doing when a fourth list picker appears, not before:** 3 × 25 lines against a 30-line helper is a wash today, and the wrong shared abstraction here costs more than the duplication. **Update (0.11.1):** the three now share one panel implementation, one group shape (`DsOptionItem`) and five projection slots, and `docs/picker-contract.md` + `npm run picker-parity` keep that honest — so the remaining duplication is the index cursor alone, exactly as recommended. Still not extracted, still waiting on a fourth picker.
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
  can say that about every other dimension in the library. **The natural hook would be a CSS token, and the only route to one is `::ng-deep` into
  `ds-icon`'s template** — so that feature took a config value instead, and the glyph is a hardcoded 14px.
  **The shape of the fix:** size the svg from `var(--ds-icon-size, <attr fallback>)` in `ds-icon`'s own
  (global) styles, and set the inline `--ds-icon-size` ONLY when `size` is explicitly bound — an unbound
  icon then inherits whatever an ancestor declares, and a bound one still wins. **Not urgent and not
  free:** it changes how every icon in 90-odd components resolves its size, so it wants its own pass and
  a look at the pages that mix icon sizes in one row.

Stas said keep it in the backlog. Left untouched on purpose.

## DS-docs showcase

- [ ] **[P3] Sidebar nav labels reflow while the rail animates, the way the brand text used to (recorded 2026-08-12, from the collapse-animation work).** The brand block was fixed by pinning its layout — `white-space: nowrap` plus `overflow: clip` on `.brand` — so it is clipped rather than re-wrapped on every frame of the width transition; measured 31px tall at every width afterwards, against 31px at 280 and 60px at anything under 240 before. The nav links were left alone and still wrap: at a mid-transition width of 150px, `Buttons · group & segmented` breaks onto three lines and unwraps again when the rail settles. Same defect class, same one-line fix — `nowrap` on `.link` and a clip on the scrolling container. **ANSWERED 2026-09-01 (Stas): clipped, not wrapped.** Applied — the row, its label span and the group headers all pin, so the caption is cut with an ellipsis instead of re-wrapping. The original note read: the collapsed rail shows icons only, so nothing is lost.

- [ ] **[P3] Inspect mode — ASKED 2026-08-05, Stas: NOT NOW (stays open with the pilot scope below).** A section-heading toggle that draws a visual "inspect" overlay on the live demos: colour-coded lines/boxes for paddings, gaps, sizes with values+units, plus WHICH token/class drives each value. Read computed styles + `getBoundingClientRect`; map values back to the `--space-*`/`--radius-*`/`--font-size-*` scales. **Rewritten 2026-07-24 → start as a scoped pilot:** spacing-only on ONE section (e.g. button), then generalize. Greenfield, docs-only, no product impact. _(Verified: nothing exists today.)_

## Component feature gaps

- [ ] **[P3] Forms — `ds-select` native `multi` — RESEARCHED 2026-08-06; Stas: keep it in the backlog with the deck attached (not built, not closed).** Deck: `presentations/10-select-native-multi.html` — three variants live, comparison matrix and sources; it is the prepared answer if a consumer ever pulls on this. Native `<select multiple>` is not a cheaper spelling of the same control, it is a documented antipattern: multi-selection is reachable only through Ctrl/Cmd- or Shift-click with nothing in the control announcing it, an unmodified click **discards the entire prior selection**, non-adjacent options cannot be selected from the keyboard at all, and screen readers handle it worse than a single `<select>`. The consensus alternative is a checkbox list — which is exactly what `ds-multi-select` already is.
  **The soft version of the ask does not survive either:** the moment a hypothetical `ds-select multi` is made usable it has to open a checkbox list, i.e. it becomes `ds-multi-select`, and the only genuine difference left is chips-in-trigger vs an "N selected" summary. If a consumer ever wants the compact trigger, the honest answer is an input (`[triggerDisplay]="'summary'"`) on the existing component, not a second component and a fork in the docs. The one case where nativeness would really matter — a plain HTTP form POST with no JS — is solved by a hidden `<select multiple>` inside `ds-multi-select`, not by changing the UI.

### Found while porting the design-sync React bindings (2026-07-28, re-verified 2026-09-01)

Three defects the port surfaced by reading every component's template + SCSS against each other. All three still reproduce on `dev` at 0.11.1; line numbers below are that tree's.

- [ ] **[P2] `ds-stat` `variant="error"` never recolours the value.** `stat.component.scss:24` is `:host(.error) .value { color: var(--error-text) }`; the later `.stat { .value { color: var(--_stat-value-color) } }` (line 61) compiles to `.stat .value` at the same specificity and wins on source order. Angular's emulated encapsulation adds one attribute selector to each, so the tie survives compilation. Fix by scoping the error rule through `.stat` (`:host(.error) .stat .value`) or by overriding `--_stat-value-color` in the `:host(.error)` block instead of the colour property — the token route matches how the rest of the file is written.
- [ ] **[P2] `ds-banner` dismiss button has no accessible name.** `banner.component.html:28-40` renders `<button class="close">` containing only `<ds-icon name="x">` — no `aria-label`, no text, and the icon is decorative, so screen readers announce an unlabelled button. Add `aria-label="Dismiss"` (the React binding already does). Worth sweeping the other icon-only close buttons in the same pass.
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
