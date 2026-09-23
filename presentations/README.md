# Presentation decks

Standalone, single-file HTML decks (design decisions, comparisons, status pages).
Open any `*.html` directly in a browser — they link the shared `ds.css`.

## The filename carries the rank, so the folder listing IS the queue

An `open` deck is named `<rank>-<slug>.html`, ranked 1..N by what answering it unblocks — so `ls`,
the file explorer and the editor's tree all show the queue in priority order without opening
anything. Ranked 2026-09-01, and renumbered whenever a deck closes:

| # | Deck | Answering it unblocks |
| --- | --- | --- |
| 1 | `1-color-engine-derivation` | the head of the biggest lane: three P2 decisions and one measured WCAG AA failure sit downstream of the colour-space choice |
| 2 | `2-color-engine-relative` | the same decision, prototype half — ranked next so the pair is read together |
| 3 | `3-interaction-formula` | `.ds-interactive`, five verdicts B1-B5; agreed in principle, and `_interaction.scss` still does not exist |
| 4 | `4-migration-manifest-audit` | eight format practices to ratify — tooling, no consumer pulling on it |
| 5 | `5-select-native-multi` | the cheapest to close: "keep parked" is a complete answer, and it is the answer already given — it stays only because closing it was declined |
| 6 | `6-warning-text-colour` | one colour on one tint, each candidate rendered in itself. It ends "name a number: 1, 2, 3 or 4", and `docs/todo.md` still carries the measured 4.42:1 failure |
| 7 | `7-chart-sparkline-preset` | `variant="spark"` or a separate `ds-sparkline` — parked on 2026-09-19, so it is decided-not-built rather than unasked |
| 8 | `8-waterfall-mode-or-component` | the waterfall's own tag against a `stack="waterfall"` mode on the column chart |
| 9 | `9-bar-column-contracts` | how far the bar and the column converge - the consumer ask that found them diverging in palette and in where composition is declared |
| 10 | `10-banner-announce-warning` | whether a dev warning names an error banner no screen reader will read, now that the input's three states tell an opt-out from an oversight |
| 11 | `11-picker-list-height` | whether the picker list's height stays an internal token: the cap that governs the visible rows is not the one that looks settable |
| 12 | `12-decision-queue` | every consumer ask and every open question in one page - 27 asks a consumer waits on, each drawn as today against after, then 33 decisions across six groups; the live indeterminate tracks are the case a text list could not put |

**Rank 1 is the way in, and ranks 2-4 are the two biggest lanes** — the colour engine, then the interaction formula that reads
its ramp. Ranks 1-5 are written in Russian and share `deck.css`, which sits beside `ds.css` and
carries the shell; the chart decks share it too.

**`implemented/` is where the answers live, and it is worth reading.** A closed deck keeps every word
of the argument — the next person to ask the same question reads it to find out what was already
weighed — but it stops LOOKING like a question: the verdict sits in a `.decided` banner at the top
with its evidence line, and the argument folds into a `<details class="folded">` accordion under it.
Eight closed on 2026-09-19 with the charts phase-2 work: the composition model, the area mode, the
four axis modes and their names, the rescale-on-hide default, the phase-2 marks, the docs chapter
nav, and the scatter's phase — which went to phase 2 with its decimation layer rather than to 3.

**A `tool` here takes no number.** `backlog-board.html` and `rejected-with-numbers.html` — both are
read whenever rather than at a moment, so they stay unnumbered and sort below the queue.

**`12-decision-queue` sorts last and carries EVERY open question** — first every ask a consumer is
waiting on, from any bucket of `docs/todo.md`, most urgent first in three groups (urgent P2, P3,
parked) with priority, consumer and kind beside each; then each open deck
plus the whole `Decisions` bucket, grouped by area. Every one has its options rendered rather
than named: live tracks for the indeterminate bar, two palettes side by side for bar-and-column,
sparklines in a card and a table cell, rendered ramps for the colour questions, pipelines for the
release ones, and before-and-after code where the decision is a name. A deck link sits beside each
question for the argument and the measurements. Picks persist per browser and the bar at the foot
hands them back as one line. It duplicates no argument, so it cannot contradict a deck; it goes
stale when a deck's OPTIONS change or when a question is answered, which is what to re-check then.
`rejected-with-numbers` held rank 5 until 2026-09-12 while asking nothing: it is the register of what
this backlog has turned down and the measurement that turned it down, so a rank on it made the queue
claim a verdict was owed where none was. A tool that is RUN rather than read does not belong in this
folder at all: `tools/overlay-guard-harness.html` moved out on 2026-09-02 for exactly that reason.

**Ranks are renumbered when the queue changes** — a closed deck moves to `implemented/` and DROPS its
number on the way (D009: a rank is a queue position and it has left the queue), and the rest close the
gap. The number is the rank and nothing else: it is not an id,
so never keep a stale one to preserve a link. There is deliberately no `ds-deck-rank` meta — one more
marker is one more thing to drift, and the filename cannot drift from itself.

## A deck declares its own status, and that is what moves it

A settled decision must not sit here looking like an open question. Every deck carries its status in
its `<head>`, immediately after the `<title>`, and the folder follows from it:

```html
<meta name="ds-deck-status" content="implemented">
<meta name="ds-deck-decided" content="2026-08-13">
<meta name="ds-deck-evidence" content="src/lib/components/button/button.component.scss:91 - docs/done.md">
```

| `ds-deck-status` | Means | Lives in |
| --- | --- | --- |
| `open` | a verdict is still needed, or is given and not built | `presentations/` |
| `implemented` | decided AND in the shipped code - or the question dissolved | `presentations/implemented/` |
| `tool` | not a decision at all — a status board that is read rather than answered | `presentations/`, always |

`ds-deck-evidence` is REQUIRED on `implemented`, and it is the whole point of the marker: a `file:line`
or the `done.md` / `CHANGELOG.md` entry a reader can open in one click. **An `implemented` marker with
no evidence is treated as `open`** - otherwise the marker is just a second opinion, and the folder
stops meaning anything.

**Whoever ships the decision writes the marker, in the same commit as the code.** That is the only
moment the evidence is known for certain. `avatar-tints.html` is the shape to copy: deck and
implementation landed together in `63aa3954`.

## Moving a deck - validate, never trust the marker

The marker is a claim, not proof. Before moving anything into `implemented/`, confirm it in this
order, and stop at the first source that answers:

1. **The code.** Does the chosen API, token or value actually exist? The only source that cannot go
   stale. (`menu-item-radius.html` reads as "8px today, three options"; the code ships radius 0 -
   variant C - so the deck's own framing was two decisions behind.)
2. **`docs/done.md` and `CHANGELOG.md`.** Which variant was picked, and when.
3. **`docs/todo.md`.** If the item is still there the deck is `open`, whatever the code shows: a
   half-built decision is not an implemented one.
4. **The commit that introduced the deck** - `git log --follow -- presentations/<deck>.html`. A deck
   committed alongside its implementation is a decision already taken.

**Never classify from the deck's own prose.** A deck is a snapshot of a question and has no way to
update itself when the answer arrives - `consumer-default-overrides.html` still ends "which is why
none of it has been touched" about four items, three of which were closed and the fourth shipped.

**Three outcomes, not two.** *Decided and built* moves. *Decided and NOT built* stays `open`, and the
work belongs in `docs/todo.md` rather than only in the deck - a verdict that lives nowhere but a deck
is a verdict nobody will execute. *Moot* - the question dissolved instead of being answered - counts
as `implemented`, and the evidence line says which of the two it was (`combobox-single-display.html`).

### Fix the stylesheet path on the way down

A deck in `implemented/` sits one directory deeper, so `href="ds.css"` has to become
`href="../ds.css"`. Thirteen decks needed exactly this on 2026-08-27. A deck that renders in the
`sans-serif` fallback right after a move is this and nothing else.

### Find the drift

```bash
npm run deck-lint              # every rule below, over both folders
npm run deck-lint:selftest     # and does each rule still fire? see the note under D012
```

`deck-lint` replaces the hand-run greps that used to live here, because a check nobody runs is not a
check. It is in `lint:all`, and every rule is a defect that actually shipped:

| | Fires when |
| --- | --- |
| D001/D002 | no `ds-deck-status`, or a value outside `open`/`implemented`/`tool` |
| D003/D004 | `implemented` sitting at root, or a non-`implemented` deck inside `implemented/` |
| D005 | `implemented` with no `ds-deck-evidence` — which this README already treats as `open` |
| D006/D009 | an `open` deck with no rank prefix, or an archived deck still carrying one |
| D007/D008 | two decks claiming one rank, or ranks that are not a contiguous 1..N |
| D010/D011 | `ds.css` linked at the wrong depth — the sans-serif-fallback bug |
| D012 | `var(--token)` that resolves to nothing: no fallback, undeclared here, absent from `ds.css` |
| D013 | `ds-deck-evidence` citing a path that does not exist |
| D015 | no `<title>`, so the tab and every listing show a filename |

**D012 is the one with real blood on it.** On 2026-09-01 ten decks referenced four tokens the DS does
not define — `--space-7`, `--border-subtle` (missed by the `subtle`→`subtitle` rename), `--shadow-md`
and `--shadow-lg`. None had a usable fallback, so each voided its whole shorthand: five `h2` margins,
two borders and a shadow were never applied, and three status pills in `new-components.html` rendered
transparent. Nothing looked broken enough to notice.

The selftest exists because a rule that cannot match is invisible — the lint stays green either way.
It writes one throwaway deck per rule (never mutating a real one; this checkout is shared), asserts
the code fires, and ends with a **negative control**: a valid deck that must stay green, so a linter
that reported everything broken could not pass the suite.

## What is NOT here

`tools/overlay-guard-harness.html` used to sit in this folder. It is a regression TEST — it drives the
docs app in an iframe rather than illustrating a decision, and it is run, not read. It moved to
`tools/` on 2026-09-02; its instructions moved with it, into the page itself.

## ds.css is generated from the design system

`ds.css` is **not hand-written** — it is a direct compile of the library's token
stylesheet, so the decks render with the exact same tokens as the app:

```bash
npm run build:deck-css     # sass src/lib/styles/ds.scss → presentations/ds.css
```

Run it after changing any design-system token (palette, theme, geometry, type,
motion). The decks are **honest consumers of the DS** — they reference real token
names (`--space-*`, `--radius-*`, `--font-size-*`, `--font-weight-*`,
`--border-width-*`, `--letter-spacing-*`, `--shadow-*`, semantic colours, …). There
is no alias/compat layer.

## The fonts come with it

`ds.css` carries the library's eight `@font-face` rules with source-relative
`url('./fonts/*.woff2')`, so `build:deck-css` copies `src/lib/styles/fonts/` next to
the CSS and fails if any `url()` in the output has no file beside it. Both the CSS and
the fonts are committed, so a deck is honest straight out of a clone.

It was not always: until 2026-08-24 the step copied the CSS alone, all eight faces
reported `status: "error"`, and every deck rendered in the `sans-serif` fallback. If a
deck of yours needs to prove which face it is rendering, two traps:

- `document.fonts.check('14px Mulish')` returns **false if any face for that family
  errored**, even when the one you need is loaded. Compare a rendered width with and
  without Mulish in the stack instead.
- Glyph metrics do not scale perfectly: Mulish measures 1.253em probed at 100px and
  1.257em at 14px. Probe at the size you are arguing about.

## Trade-off (by design)

Because there is no compat shim, a **token rename in the DS** (e.g. the past
`--*-subtle → --*-subtitle` and `--z100 → --shadow-card`) requires a find/replace
across the decks, then a regenerate — instead of editing one alias line. For
one-off decks that are rarely re-rendered, this is cheap and keeps `ds.css` pure.

Rename workflow:

```bash
# 1. update the deck references (example)
perl -pi -e 's/--old-token\b/--new-token/g' presentations/*.html
# 2. regenerate ds.css from the (renamed) source
npm run build:deck-css
```

## Verify every token resolves

After edits, confirm no deck references a token that is missing from `ds.css` and
not defined locally:

```bash
for f in presentations/*.html; do
  grep -ohE 'var\(--[a-z0-9-]+' "$f" | sed -E 's/var\(//' | sort -u | while read t; do
    grep -q -- "$t:" presentations/ds.css || grep -q -- "$t:" "$f" || echo "$(basename $f): $t"
  done
done
```

Expected output: empty. Known intentional exceptions are illustrative example
tokens (e.g. `--old-name` in a migration deck) and deck-local slots (e.g.
`--c-subtle`, `--ds-*` component overrides) that are defined inside the deck.
