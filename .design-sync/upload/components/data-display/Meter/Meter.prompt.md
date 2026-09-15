# Meter

One track and one fill, for a measurement inside a table cell. The host element IS the track; a single inner bar shows `value` against `max`. No caption, no legend, no annex table — a chart is a block with all three, and in a 60px cell that chrome is the whole cell.

- `value`: number — the measurement, in units of `max`. Clamped to the track: past `max` it fills, below zero it draws nothing.
- `max`: number = 100 — the ceiling `value` is read against, usually the column's own largest value, so the longest bar fills its track and the rest are its share. Zero or less falls back to 100.
- `color`: string — overrides the fill for this one mark. Colour a whole column through `--ds-meter-fill-color` instead; use the input where the colour carries meaning (a threshold, a status).
- `ariaLabel`: string — names the measurement AND decides whether it is announced. Unset, the mark is `aria-hidden`, which is right where the cell prints the figure beside it. Set it where the bar is the only place the number appears.
- Not `Progress`: that reports how far a task has got and says so with `role="progressbar"`, which a table of two hundred measurements would announce two hundred times. A rate or a score against a ceiling has no beginning and no completion.
- The bar is as wide as the box it sits in, so give the cell a width. A box sized to its content contributes nothing from a `100%`-wide child, so the host carries a `min-inline-size` of `3rem` (`--ds-meter-min-width`) and cannot vanish.
- Tokens: `--ds-meter-height`, `--ds-meter-min-width`, `--ds-meter-track-color`, `--ds-meter-radius`, `--ds-meter-fill-color`.

```tsx
<Meter value={7.2} max={7.2} />
<Meter value={1.2} max={7.2} ariaLabel="Request rate, 1.2 of 7.2 percent" />
```
