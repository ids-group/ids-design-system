---
category: Data display
---
Horizontal bar chart: each row in `data` prints a `label`, a formatted `value` and (unless suppressed) a percentage, with a track filled to `value` relative to `max`. The populated state renders inside a `role="img"` block carrying an auto-generated accessible name; a `<details>` data table underneath repeats every row as plain text.

- `data` (required): `{ label, value, percent?, color? }[]`. `percent` is derived from `value / max` when omitted; `color` overrides that row's bar (default: `--ds-chart-series-default-color`, the same colour on every row).
- `max`: track length is relative to this; unset/`null` (default) uses the largest `value` in `data`.
- `caption`: shown above the rows and reused as the data table's own caption (falls back to "Chart data" there when unset).
- `summary`: the accessible name; generated from `data` when omitted (e.g. "3 points, from 12 at Leeds to 40 at Bristol…").
- `showPercent` (default `true`): set `false` to hide the trailing percentage column.
- `valueFormat`: `(value: number) => string`, defaults to `Intl.NumberFormat`; formats both the row value and the values inside the generated `summary`.
- `dataTable`: `'toggle'` (default, closed disclosure) | `'visible'` (open) | `'none'` (omit entirely).
- `loading` (default `false`): shows a skeleton block instead of rows.
- `emptyText` (default `"No data"`): shown in place of rows when `data` is empty.
- `interactive` (default `false`): turns on the pointer cursor and puts every row in the tab order as a `role="button"` answering Enter and Space; the block then announces itself as a `group` rather than an `img`.
- `onRowClicked`: fires with the clicked row, with or without `interactive`.
- `value` may be a `[low, high]` pair instead of a number: the bar then spans between its own ends rather than from zero, which is what compares a duration and its PLACEMENT at once. The ends may be written either way round.
- `target`: draws a tick across the bar at one reading - a goal, a budget, last period.
- `ranges`: qualitative bands behind the bar, as their upper bounds in ascending order (`[60, 80, 100]` is three bands). With `target` this is the bullet chart, which is a bar with two extras rather than a chart type. The bands take one neutral hue at rising opacity, never the series palette: a band is a backdrop and the bar is the reading.

**Colour: one colour for every row, and an accent on one of them.** The rows are ONE series measured several times, not several categories, so they share `--ds-chart-series-default-color`. Set `color` on the single row the reader should land on, to `var(--ds-chart-series-accent-color)`. Do not paint the rows from `--ds-chart-series-1-color` … `-8-color` — that palette separates series from one another, and here it says five categories where there is one.

```tsx
<BarChart
  caption="Deliveries by depot"
  data={[
    { label: 'Leeds', value: 128 },
    { label: 'Bristol', value: 94 },
    { label: 'Derby', value: 40, color: 'var(--ds-chart-series-accent-color)' },
  ]}
/>
```
