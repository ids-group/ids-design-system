# Presentation decks

Standalone, single-file HTML decks (design decisions, comparisons, status pages).
Open any `*.html` directly in a browser — they link the shared `ds.css`.

## The filename carries the rank, so the folder listing IS the queue

An `open` deck is named `<rank>-<slug>.html`, ranked 1..N by what answering it unblocks — so `ls`,
the file explorer and the editor's tree all show the queue in priority order without opening
anything. Ranked 2026-09-01, and renumbered whenever a deck closes:

| # | Deck | Answering it unblocks |
| --- | --- | --- |
| 1 | `1-decision-queue` | every consumer ask and every open question in one page - 3 asks a consumer waits on, then 47 decisions across eight groups (the last two: chart, table and focus choices agents made without a deck, and parked answers Stas never closed), every option drawn in its own card; answered questions sit under «Уже решено» - decided but not built first, built ones folded into accordions - each with its status, evidence and review history |
| 2 | `2-color-engine-derivation` | the head of the biggest lane: three P2 decisions and one measured WCAG AA failure sit downstream of the colour-space choice |
| 3 | `3-color-engine-relative` | the same decision, prototype half — ranked next so the pair is read together |
| 4 | `4-interaction-formula` | two pressed-state verdicts, both rendered and measured: the tonal button's pressed recipe and the danger menu item whose pressed equals its hover. The other three are answered and the `.ds-interactive` formula is deferred |
| 5 | `5-migration-manifest-audit` | ten format practices to ratify — tooling, no consumer pulling on it |
| 6 | `6-select-native-multi` | the cheapest to close: "keep parked" is a complete answer, and it is the answer already given — it stays only because closing it was declined |
| 7 | `7-warning-text-colour` | one colour on one tint, each candidate rendered in itself. It ends "name a number: 1, 2, 3 or 4", and `docs/todo.md` still carries the measured 4.42:1 failure |
| 8 | `8-picker-list-height` | which knob caps a picker's list: the public `--ds-dropdown-panel-max-height` lowers the list but cannot raise it past the internal 280px `--picker-maxh`; all three options rendered and measured, one cap recommended |
| 9 | `9-docs-reasoning-blocks` | what ds-docs does with its ~27 reasoning blocks (fix proofs, edge-case guards, internals): keep, fold to the chapter end, move to a proof page, or delete - drawn on the real Table chapter |
| 10 | `10-deerns-atlas-feedback` | the Deerns Atlas prototype feedback and its flicker-on-mount report, every claim checked against the uploaded bundle: nine drawn decisions (missing required input, Badge tone, Stat frame, Timeline spine, narrow Topbar, clipped SidenavItem label, Input in a narrow grid, Alert entrance on screen mount) and a build-extend-recipe-consumer call for each requested component; twenty one-answer fixes listed |
| 11 | `11-unread-tokens` | which of the 121 public tokens the library never reads to remove: none, the 51 sizes of components and patterns that do not exist (0 reads in three consumers), or all 121 (12 of them read by a consumer) |
| 12 | `12-unasked-decisions` | six behaviour changes already in Unreleased that shipped without a choice between alternatives - theme attribute ownership, modal confirm, avatar-group max, disabled link reason, icon registry merge, chart pin geometry - each with its options drawn |
| 13 | `13-column-chart-filter` | how `ds-column-chart` gets a caption under each column and a persistent selection - point fields, chart inputs with a template, or nothing - each written as the same consumer task with its rendering |
| 14 | `14-table-column-hint` | what a `ds-table` header with `hint` shows when its label does not fit the column: only the hint as today, the full label over the hint, or a header that wraps instead - before/after screenshots of the docs demo at `8eb6ab9e` and `e0ff159f`, the three options drawn |
| 15 | `15-table-header-clip` | the `ds-table` header label that clips with an ellipsis inside its column and the tooltip of a clipped hinted header (label, then hint) - before/after screenshots of the docs demo on dev and on `fix/table-header-clip`: narrow headers, focus ring, plain and hinted tooltip, with the measurements |
| 16 | `16-interaction-states` | general rules for the states of interactive elements (rest, hover, pressed, focus, on, on + hover, on + pressed, disabled) as levels on three channels (fill, underline, icon ink) with live sliders for the step numbers, one neutral hover surface, a check that catches empty cells, and whether to merge the pilot; the four open questions on top, rules and measurements folded below |
| 17 | `17-text-snap-scale` | how a scaling animation ends without the text snapping a pixel: the press (left as today for now, every variant still open), the card hover lift or growth, the rule for scaling text, and the funnel stage's residual step - every variant live and measured in Chrome at 150% |
| 18 | `18-tooltip-mechanism` | three open questions on the tooltip, each with a measurement or sizes and what other libraries do: the six listeners every table cell carries (measured on 1000 rows, a directive only on clipped cells against one app-wide delegated listener), loading the panel at idle after start, and one app-wide delegated listener for every directive with events; the finished and answered proposals folded below |
| 19 | `19-icon-box-size` | parked: how `ds-banner` and `ds-dropzone` size their icon while `styles/icon-base`'s `.icon` shrinks the `ds-icon` box to 16px under a 20px glyph - four options drawn as clickable cards, one recommended, before and after in two columns; the verdict comes later and the item waits in `docs/todo.md` |
| 20 | `20-docs-table-look` | which look `table.tbl` has across ds-docs: the shared bordered table (Scrollbar, Density) against the plain local override (Charts, Z-index) - bordered everywhere, plain everywhere, or as today; all four pages' real tables rebuilt in each look, one recommended |
| 21 | `21-density-scope` | where `data-density` works: only on `<html>` (today; on a container the fields, button and search stay 40px while the icon button follows) or on any container, nesting included, by re-declaring the four `:root` tokens derived from `--hit-cozy`/`--hit-min` inside `[data-density]` - both drawn at four tiers and one nested container, heights measured in the page |
| 22 | `22-table-truncate-result` | sign-off of the `ds-table` `truncate` column without `width` that grows to its text: before/after screenshots of the harness tables, the width rule drawn as bars over real renders, four decisions recorded with `minWidth` built, and two decided 2026-10-12 under the condition that column widths never move when the data or the page changes - widths from the column config by column kind, and a `truncate` column in a scrolling table exactly 240px of text - with an audit of what 0.15.0 shipped and how other table libraries size columns |
| 23 | `23-table-wrap-parked` | parked: two wrap options for a `truncate` column - fill the height a neighbour gave the row, or always wrap - each rendered; the verdict comes later and the item waits in `docs/todo.md` |
| 24 | `24-link-colour` | what colour a text link takes under a non-blue brand: the brand colour as on dev, or always blue with the tints still following the brand - both drawn on one fragment (inline, visited, table and «Подробнее» links) for a blue and a green brand in light and dark, contrast measured in the page |
| 25 | `25-brand-dark-theme` | how a brand colour set once reaches the dark theme, where the DS dark block redeclares `--primary` and wins: the brand repeats it under `[data-theme='dark'][data-brand]` as today, the dark block stops declaring `--primary` and its channels so the brand's value reaches both themes, or a new `--ds-brand` input with the dark `--primary` lifted to the default's OKLCH lightness; each drawn on the real `ds.css` for the default blue, a green and a navy brand in light and dark, contrast measured in the page |
| 26 | `26-six-behaviour-changes` | the six behaviour changes published in 0.14.7 without a choice, one section each: the theme an app set before startup, the modal confirm event, avatars past `max`, a disabled link with a reason in the Tab order, `provideDsIcons` calls adding up, the pin disc on a column - each with a before and after render and two or three drawn options to pick |
| 27 | `27-duplicate-label-match` | how a chart recognises a column between data updates when two categories share a label: by label with a repeat counter as on dev, by array position, by label only, by an explicit point `id`, or by label with a dev console warning - each library's approach drawn as the same live animated column scene (remove the first of two «Jan»), with replay, ×5 slow-down and the libraries that do it |
| 28 | `28-table-width-by-type` | two open picks first - how text columns fill the table without empty space and without moving on paging (one-time fit by first page, kind widths plus a one-time proportional share, or equal share), each prototyped on page 1 and page 2 with widths and empty px, and where the free space goes when every column has a set width and they sum to less than the table (filler column, last text column, or as is, each rendered) - then sign-off of the built `ds-table` column width by kind: dev against the branch on the harness tables, page 1 and page 2 for server paging, client paging and a scrolling all-`truncate` table with the widths in px, the 110-130px kind columns, the 240px `truncate` column in a scrolling table, and the taller rows where a text column now wraps |
| 29 | `29-link-colour-layer` | where the link colour lives in the token layers: `--text-link` and `--link-visited` back as roles, blue in both themes, read by `.link` and the table cell link; as shipped in 0.15.1, `.link` reading the palette with `--ds-link-color` as the brand knob; or the roles back but derived from the brand - each drawn as palette, role and component wiring with `.link` and a table cell link for the default and the green brand in light and dark, colours computed and checked in the page, and what a consumer's roles file writes |

**Rank 1 is the way in: the decision queue, every open question on one page. Ranks 2-4 are the two
biggest lanes** — the colour engine, then the interaction formula that reads its ramp. Every rank is
written in Russian; `deck.css`, which sits beside `ds.css` and carries the shell, is shared by ranks
1, 4, 5, 8-16 and 18-29 - ranks 2, 3, 6, 7 and 17 render fully inline instead.

**`implemented/` is where the answers live, and it is worth reading.** A closed deck keeps every word
of the argument — the next person to ask the same question reads it to find out what was already
weighed — but it stops LOOKING like a question: the verdict sits in a `.decided` banner at the top
with its evidence line, and the argument folds into a `<details class="folded">` accordion under it.
Decks whose decision shipped in 0.15.0 or earlier are not in the folder; their verdicts are in
`docs/done.md` and `CHANGELOG.md`, and `git log --diff-filter=D -- presentations/implemented/` finds
the files.

**A `tool` here takes no number.** `rejected-with-numbers.html` is read whenever rather than at a
moment, so it stays unnumbered and sorts below the queue.

**`1-decision-queue` carries every open question but the one in `9-docs-reasoning-blocks`** — first every ask a consumer is
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

**Two branches that add a deck under the same rank: whoever merges into `dev` last takes the last
number.** The deck already in `dev` keeps its rank; the later branch renames its deck to the next free
rank at merge time and fixes its rows in the table above and in the `docs/todo.md` deck table. Check
before merging: `ls presentations | grep -E '^[0-9]+-' | sort -n | tail -3`. `deck-lint` D007 is what
fails when this is skipped.

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
moment the evidence is known for certain. Commit `63aa3954` is the shape to copy: deck and
implementation landed together.

## A deck names the chat its answer goes back to

A deck is answered later, opened from a listing, and the pick has to reach the chat that holds the
work, its branch and its measurements. So every `open` deck says, in visible text, which chat to bring
the answer to: one line under the `<h1>`, and the same name in the fixed bar beside the answer line.

```html
<p class="chat">Ответ нести в чат: «Acc2 · pp-review: ревью тикетов по очереди»</p>
```

The name is the chat title exactly as its tab shows it when the deck is written. The chat that writes
the deck writes the line; a deck handed to another chat gets that chat's name. Decks written before
this rule carry no line and are not back-filled.

## Moving a deck - validate, never trust the marker

The marker is a claim, not proof. Before moving anything into `implemented/`, confirm it in this
order, and stop at the first source that answers:

1. **The code.** Does the chosen API, token or value actually exist? The only source that cannot go
   stale.
2. **`docs/done.md` and `CHANGELOG.md`.** Which variant was picked, and when.
3. **`docs/todo.md`.** If the item is still there the deck is `open`, whatever the code shows: a
   half-built decision is not an implemented one.
4. **The commit that introduced the deck** - `git log --follow -- presentations/<deck>.html`. A deck
   committed alongside its implementation is a decision already taken.

**Never classify from the deck's own prose.** A deck is a snapshot of a question and has no way to
update itself when the answer arrives.

**Three outcomes, not two.** *Decided and built* moves. *Decided and NOT built* stays `open`, and the
work belongs in `docs/todo.md` rather than only in the deck - a verdict that lives nowhere but a deck
is a verdict nobody will execute. *Moot* - the question dissolved instead of being answered - counts
as `implemented`, and the evidence line says which of the two it was.

### Fix the stylesheet path on the way down

A deck in `implemented/` sits one directory deeper, so `href="ds.css"` has to become
`href="../ds.css"`. Thirteen decks needed exactly this on 2026-08-27. A deck that renders in the
`sans-serif` fallback right after a move is this and nothing else.

### Find the drift

```bash
node tools/check.mjs deck-lint            # every rule below, over both folders
node tools/check.mjs deck-lint:selftest   # and does each rule still fire? see the note under D012
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
| D016 | an open deck whose pick a second click cannot clear, so a stray click reads as a decision |

**D012 is the one with real blood on it.** On 2026-09-01 ten decks referenced four tokens the DS does
not define — `--space-7`, `--border-subtle` (missed by the `subtle`→`subtitle` rename), `--shadow-md`
and `--shadow-lg`. None had a usable fallback, so each voided its whole shorthand: five `h2` margins,
two borders and a shadow were never applied, and three status pills in one deck rendered
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
