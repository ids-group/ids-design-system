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
| 6 | `6-warning-text-colour` | one colour on one tint, each candidate rendered in itself. It ends "name a number: 1, 2, 3 or 4" |
| 7 | `7-docs-chapter-nav` | where the chapter list lives and what makes a sub-item a sub-item. Seven variants rejected, four left, and they are mutually exclusive: 11, 12, 13 and 14 each answer "where do 38 rows live" differently |
| 8 | `8-field-group-invalid-voice` | the error border is fixed; what is open is how a group SAYS it is invalid — it has no text channel at all and sets no `aria-invalid`, so colour is the only signal |
| 9 | `9-button-destination-api` | one question: how a consumer modifies a destination, with the same CTA written all three ways. The `aria-current` half is a bug with one correct fix and the token rename is a call already made — both stated for a veto, not put to a vote |

**Ranks 1-3 are the two biggest lanes** — the colour engine, then the interaction formula that reads
its ramp. Three closed on 2026-09-12: `opt-in-seam` (the table's features became directives and the
other two questions were answered with a measurement — the button's message row was built and
reverted, the portaled CSS rejected at 1 kB), `sidebar-states` (variant E, in the code as the item's
`--accent-subtitle` fill with no fill on the group) and `stat-value-overflow` (one line and a tip on
hover, with three hooks over it). `focus-ring-radius` closed on 2026-09-10: 4px everywhere, and the
measuring found four of its seven hosts already had a shape their ring follows, so only three needed
the token. `selection-focus-ring` closed on 2026-09-04 and moved on 2026-09-10 — the ring is on the
row in `_control-line.scss`, which is what the deck asked for. The three that closed on 2026-09-04
are in `implemented/` (`packaging-entry-points`, `basic-advanced-split`, `entry-point-shape`); read
them in that order for the mechanism, the split question and the layout. Ranks 1-4 are written in
Russian and share `deck.css`, which sits beside `ds.css` and carries the shell they use; the rest
keep their own inline styles.

**A `tool` here takes no number.** `backlog-board.html` and `rejected-with-numbers.html` — both are
read whenever rather than at a moment, so they stay unnumbered and sort below the queue.
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
