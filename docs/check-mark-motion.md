# The check mark's motion

One tick, three components, four tokens. This file records what the mark does now, what it did
before, and the exact line that puts the old behaviour back.

## Where the mark lives

`src/lib/styles/_check-mark.scss` is the single source. It exports two mixins:

| Mixin | Applied to | What it sets |
| --- | --- | --- |
| `mark` | the resting element | size, the SVG tick, `scale(0.6)`, `opacity: 0`, and the **exit** transition |
| `shown` | the same element in its checked state | `scale(1)`, `opacity: 1`, and the **enter** transition |

Three components include it, and there is no fourth copy:

| Component | Element | Checked selector |
| --- | --- | --- |
| `ds-checkbox` | `.checkbox::after` | `:checked` and `:indeterminate` |
| `ds-multi-select` | `.checkbox .tick` | `.checkbox.checked` and `.checkbox.indeterminate` |
| `ds-autocomplete` | `.checkbox .tick` | `.checkbox.checked` |

The element is **always rendered** — it is not created on check. An element that does not exist has
no resting state to transition from, so a checked-only mark pops in instead of scaling.

## Why the transition is declared twice

A CSS transition belongs to the state being moved TO. Declaring it once on the resting rule makes
both directions run the same curve; declaring it on both rules lets the mark arrive on one curve and
leave on another. That is the whole reason `shown` carries a `transition` of its own — the mark
leaves faster than it arrives, which is what makes an overshoot read as weight rather than as lag.

## The token chain

Three layers, so a consumer can override at whichever level matches their intent:

```
--ease-spring / --duration-base        raw scale        _tokens.scss
  └─ --ds-motion-check-enter-easing    motion ROLE      _tokens.scss
       └─ --ds-check-mark-enter-easing component hook   consumer sets this
            └─ --_check-mark-enter-easing               private, read by the mixin
```

| Role token | Default | Meaning |
| --- | --- | --- |
| `--ds-motion-check-enter-duration` | `var(--duration-base)` — 180ms | how long the mark takes to land |
| `--ds-motion-check-enter-easing` | `var(--ease-spring)` — `cubic-bezier(.5, 1.5, .5, 1)` | overshoots ~15% and settles |
| `--ds-motion-check-exit-duration` | `var(--duration-fast)` — 120ms | how long it takes to leave |
| `--ds-motion-check-exit-easing` | `var(--ease-accelerate)` — `cubic-bezier(.3, 0, 1, 1)` | leaves without overshooting |

Setting the ROLE moves every mark in the app at once. Setting the component hook
(`--ds-check-mark-enter-easing` and its three siblings) moves only the marks under that scope, so a
single dense option list can stay calm while the forms overshoot.

## What it was before 2026-09-04

A single transition on the resting rule, the same curve in both directions, and no way to change it
without editing the partial:

```scss
transition: transform var(--duration-fast) var(--ease-standard),
            opacity var(--duration-fast) var(--ease-standard);
```

That is **120ms on `cubic-bezier(.2, 0, 0, 1)`** — a flat decelerating ease with no overshoot, in and
out alike.

### Putting it back

Nothing needs to be edited in the library. One block anywhere in an app's global stylesheet restores
the old motion exactly:

```css
:root {
  --ds-motion-check-enter-duration: var(--duration-fast);
  --ds-motion-check-enter-easing: var(--ease-standard);
  --ds-motion-check-exit-duration: var(--duration-fast);
  --ds-motion-check-exit-easing: var(--ease-standard);
}
```

Scope it to a selector instead of `:root` to restore it in one place only.

## Why `--ease-spring` and not the curve from pinkmoon

The reference was pinkmoon's admin login checkbox, which animates on
`cubic-bezier(0.34, 1.56, 0.64, 1)` at 200ms in / 150ms out. The design system already carries a
back-out curve — `--ease-spring`, `cubic-bezier(.5, 1.5, .5, 1)`, documented in `_tokens.scss` as
"overshoot for small celebratory feedback; sparingly". The two overshoot by a comparable amount, and
a second near-identical curve is one more value to drift. The durations moved onto the DS scale for
the same reason: 180/120 rather than an off-scale 200/150.

## Reduced motion needs nothing extra

`_tokens.scss` zeroes the whole `--duration-*` scale under `prefers-reduced-motion: reduce`. Both
role durations resolve through that scale, so the mark becomes instant on its own. A consumer who
overrides the hooks with **literal** milliseconds opts out of that and has to handle the media query
themselves — which is a reason to override the easing and leave the durations pointing at the scale.

## Two facts that are easy to get wrong

- **The mark's stroke is not `ds-icon`'s.** `ds-icon name="check"` is a 24-viewBox path at
  `stroke-width: 1.75`; scaled into a 13px glyph that paints a 0.95px line, against this mark's 2px
  at the same size. Multi-select and autocomplete used the icon until 2026-09-04, so the same box
  carried a hairline tick in an option row and a solid one in `ds-checkbox`.
- **The indeterminate dash is the same element as the tick**, restyled — not a second one beside it.
  A second span would sit next to the tick in the centred box rather than replacing it, and the two
  could not cross-fade.
