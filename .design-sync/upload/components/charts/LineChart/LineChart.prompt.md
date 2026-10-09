# LineChart

One or more series plotted over a shared set of categories. A series can be measured against a second y axis when it is in different units, a missing reading can break the line or sit at zero, and the category labels thin out rather than crowd once the series gets long.

- `categories` (required): `string[]` — the x axis, shared by every series.
- `series` (required): `{ id, label, data, axis?, area?, slot? }[]`. `data` is `(number | null)[]`, one reading per category. `axis` is `'primary'` (default) or `'secondary'`. `area` fills the band between the line and its axis baseline. `slot` pins a palette slot, so hiding one series leaves every other series on its own colour.
- `yAxisMode`: `'aligned'` (default) | `'exact'` | `'dual-grid'` | `'split'` — see below. Only matters once a series sets `axis: 'secondary'`.
- `showMarkers` (default `true`): the dot at each reading.
- `gaps`: `'break'` (default) leaves a hole in the line at a `null`; `'zero'` plants a point on the baseline. Pick `'break'` unless a missing reading genuinely means none.
- `curve`: `'linear'` (default) joins the readings with straight segments and asserts nothing the data does not say. `'step'` holds each reading until the next, which is right for a quantity that CHANGES at a moment rather than drifting between two - a price, a headcount, a rate. `'smooth'` is a monotone cubic, so it never draws a peak or a trough the readings do not contain; a Catmull-Rom would. A filled series follows the same curve, so the fill and its line share one edge.
- `stack`: `'none'` (default) | `'stacked'` | `'normalized'`. `'stacked'` starts each series where the one below it ended, so a filled series reads as a share of a total; `'normalized'` divides by the category's own total, so every category is full and the axis reads in shares. Only a series with `area: true` fills; the lines sit on the running total either way. Stacking runs per AXIS, so a secondary-axis series never piles onto a primary one. Unrelated to `yAxisMode: 'split'`, which puts two PLOTS one above the other.
- `tickCount`: a hint — ticks snap to a round step.
- `caption`: shown above the plot and reused as the data table's caption.
- `summary`: the accessible name; generated from the series when omitted.
- `valueFormat`: `(value: number) => string`, defaults to `Intl.NumberFormat`.
- `dataTable`: `'none'` (the default) | `'toggle'` (closed disclosure) | `'visible'` (open). Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`.
- `loading` (default `false`): with no data, a skeleton line on the axes; with data on screen, the plot stays under a `ds-loading-overlay` until it clears.
- `emptyText` (default `"No data"`): shown in place of the plot when there is nothing to draw.

**`yAxisMode` is about two axes sharing one plot, and every name says what is done to the GRIDLINES.** `'aligned'` and `'exact'` both draw ONE set and differ in what the second axis does with them: `'aligned'` rounds its step up to a round number, so its series stops short of the top and its labels read cleanly; `'exact'` ends the second axis on its largest reading, so that series uses the full height and its labels are not round. `'dual-grid'` scales and grids each axis on its own, which is the most readable and the least comparable. `'split'` gives up on sharing and draws two plots one above the other over the same category axis.

**Colour: the categorical palette.** Series ARE different things, so they take `--ds-chart-series-1-color` onward by position, or by `slot` when a series must keep its colour as others are hidden.

```tsx
<LineChart
  caption="Sessions and signups by month"
  categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
  series={[
    { id: 'sessions', label: 'Sessions', data: [3200, 3850, 4400, 4120, 4760, 5000], area: true },
    { id: 'signups', label: 'Signups', data: [820, 960, 1180, 1040, 1320, 1450] },
  ]}
/>
```
