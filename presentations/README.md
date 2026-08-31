# Presentation decks

Standalone, single-file HTML decks (design decisions, comparisons, status pages).
Open any `*.html` directly in a browser — they link the shared `ds.css`.

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
| `tool` | not a decision at all: a test harness, a status board | `presentations/`, always |

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
grep -l 'content="implemented"' presentations/*.html            # claims it, still at root
grep -L 'content="implemented"' presentations/implemented/*.html # moved without the marker
grep -L 'ds-deck-evidence' presentations/implemented/*.html      # marked, nothing to check
grep -l 'href="ds\.css"' presentations/implemented/*.html        # path not fixed on the move
```

All four print nothing when the folder is honest.

## One deck is a test harness, not a deck

`overlay-guard-check.html` drives the docs app instead of illustrating a decision: it iframes five
component pages in turn, presses each overlay trigger, then presses the one place inside the host that
is not the trigger, and prints the pane count and `aria-expanded` before and after. Run it headless —
`chrome --headless=new --virtual-time-budget=120000 --dump-dom
http://localhost:4298/decks/overlay-guard-check.html`
— and read the `<pre id="out">` block. **It has to run in a VISIBLE frame:** a background tab clamps
timers and never finishes a leave animation, so the same probe reads false there. Keep it: it is the
regression test for the outside-pointer guard, and reverting one component to `host.contains` is how you
check the harness still detects the defect.

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
