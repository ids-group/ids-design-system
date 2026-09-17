---
category: Feedback & status
---
One horizontal track with one fill: a task's completion, or a measurement on a known scale. The host element IS the track; a single inner bar shows `value` against `max` (clamped). No circular variant.

- `semantics`: progress | meter | none = progress — what the bar claims, and therefore its role. `progress` is how far a task has got (`role="progressbar"`). `meter` is a measurement with no beginning and no completion — a rate, a score, a count against a ceiling (`role="meter"`). `none` draws it and hides it from assistive technology.
- **Use `semantics="none"` for a bar inside a table cell** whose figure is printed beside it. Left at the default, a table of two hundred rows announces two hundred progress bars.
- `max`: number = 100 — the scale `value` and `target` are read against; at 100 they are percentages. For a column of measurements it is usually the column's own largest value, so the longest bar fills its track. Zero or less falls back to 100.
- `variant`: default | success | warning | error — recolours the fill (track stays neutral). `color` overrides it for one bar; `--ds-bar-fill-color` colours a whole column.
- `target`: a second point on the same scale, drawn as a hairline across the track — a goal, a baseline, a threshold. The role announces one value, so name the comparison in `ariaLabel`.
- `indeterminate` switches to a looping sweep and is ignored unless `semantics` is `progress`.
- Pass `ariaLabel` whenever the bar is announced — it has no visible label of its own.
- The bar fills its box, so give the cell a width. A content-sized box is sized by what its contents contribute and a `100%`-wide child contributes nothing, so the host carries `min-inline-size: 3rem`.
- Tokens: `--ds-bar-height`, `--ds-bar-min-width`, `--ds-bar-track-color`, `--ds-bar-fill-color`, `--ds-bar-target-color`, `--ds-bar-target-width`.

```tsx
<Bar value={68} ariaLabel="Manifest upload progress" />
<Bar indeterminate ariaLabel="Syncing depots" />
<Bar semantics="none" value={7.2} max={7.2} />
```
