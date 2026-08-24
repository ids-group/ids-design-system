# Presentation decks

Standalone, single-file HTML decks (design decisions, comparisons, status pages).
Open any `*.html` directly in a browser — they link the shared `ds.css`.

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

## …except the fonts, which do NOT load

That "exact same" holds for tokens and **fails for type.** `ds.css` carries the
library's eight `@font-face` rules with their source-relative
`url('./fonts/*.woff2')`, but `build:deck-css` copies the CSS alone and there is no
`presentations/fonts/`. Measured 2026-08-24: all eight faces report
`status: "error"`, `/decks/fonts/mulish-latin-400-normal.woff2` answers 404, and
every deck renders in the `sans-serif` fallback.

For a deck about colour or spacing this changes nothing. For a deck that judges
**type** it makes the deck lie, so `ellipsis-glyph-clip.html` re-declares the
three faces it needs and shows a banner if they fail to load. Two traps if you
copy that:

- `document.fonts.check('14px Mulish')` returns **false even when your own face
  loaded**, because one errored face for the family is enough to fail the check.
  Compare a rendered width with and without Mulish in the stack instead.
- Glyph metrics do not scale perfectly: Mulish measures 1.253em probed at 100px and
  1.257em at 14px. Probe at the size you are arguing about.

Filed in `docs/todo.md` (P3) — the fix belongs in `build:deck-css`, not per deck.

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
