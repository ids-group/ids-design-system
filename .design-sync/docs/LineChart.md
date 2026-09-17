---
category: Data display
---
One or more series plotted over a shared set of categories. A series can be measured against a second y axis when it is in different units, a missing reading can break the line or sit at zero, and the category labels thin out rather than crowd once the series gets long.

- `categories` (required): `string[]` — the x axis, shared by every series.
- `series` (required): `{ id, label, data, axis?, area?, slot? }[]`. `data` is `(number | null)[]`, one reading per category. `axis` is `'primary'` (default) or `'secondary'`. `area` fills the band between the line and its axis baseline. `slot` pins a palette slot, so hiding one series leaves every other series on its own colour.
- `yAxisMode`: `'rounded'` (default) | `'exact'` | `'independent'` | `'stacked'` — see below. Only matters once a series sets `axis: 'secondary'`.
- `showMarkers` (default `true`): the dot at each reading.
- `gaps`: `'break'` (default) leaves a hole in the line at a `null`; `'zero'` plants a point on the baseline. Pick `'break'` unless a missing reading genuinely means none.
- `tickCount`: a hint — ticks snap to a round step.
- `caption`: shown above the plot and reused as the data table's caption.
- `summary`: the accessible name; generated from the series when omitted.
- `valueFormat`: `(value: number) => string`, defaults to `Intl.NumberFormat`.
- `dataTable`: `'none'` (the default) | `'toggle'` (closed disclosure) | `'visible'` (open). Unset falls back to `DS_CONFIG.chart.dataTable`, then `'none'`.
- `loading` (default `false`): shows a skeleton plot.
- `emptyText` (default `"No data"`): shown in place of the plot when there is nothing to draw.

**`yAxisMode` is about two axes sharing one plot.** `'rounded'` and `'exact'` both draw ONE set of gridlines and differ in what the second axis does with them: `'rounded'` rounds its step up to a round number, so its series stops short of the top and its labels read cleanly; `'exact'` ends the second axis on its largest reading, so that series uses the full height and its labels are not round. `'independent'` scales and grids each axis on its own, which is the most readable and the least comparable. `'stacked'` gives up on sharing and draws two plots one above the other over the same category axis.

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
