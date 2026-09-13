---
category: Data display
---
Vertical columns for a short series read left to right — months, stages, teams. Every column is measured against one value axis whose ticks snap to round numbers, each column prints its own value above itself, and a skeleton holds the space while the numbers are still arriving.

- `data` (required): `{ label, value, color? }[]`. `color` overrides that column (default: `--ds-chart-series-default-color`, the same colour on every column).
- `showValues` (default `true`): set `false` to drop the value printed above each column.
- `tickCount` (default `5`): a hint, not a count. Ticks snap to a round step, so an axis asked for three ends up with five and one asked for ten stops at eight.
- `caption`: shown above the plot and reused as the data table's caption.
- `summary`: the accessible name; generated from `data` when omitted.
- `valueFormat`: `(value: number) => string`, defaults to `Intl.NumberFormat`; formats the printed values and the generated `summary`.
- `dataTable`: `'toggle'` (default, closed disclosure) | `'visible'` (open) | `'none'` (omit entirely).
- `loading` (default `false`): shows a skeleton block instead of columns.
- `emptyText` (default `"No data"`): shown in place of columns when `data` is empty.
- `interactive` (default `false`): turns on the pointer cursor and puts every column in the tab order as a `role="button"` answering Enter and Space; the plot then announces itself as a `group` rather than an `img`.
- `onPointClicked`: fires with the clicked point, with or without `interactive`.

**Colour: the same rule as BarChart.** The columns are one series measured over several periods, so they share `--ds-chart-series-default-color`; set `color` on the one that carries the point — usually the latest — to `var(--ds-chart-series-accent-color)`.

Column width is a share of each cell (`--ds-column-chart-column-width`) capped by `--ds-column-chart-column-max-width`. The cap is what keeps a five-column chart reading as a chart rather than as five slabs wider than their own labels.

```tsx
<ColumnChart
  caption="New accounts by month"
  data={[
    { label: 'Jan', value: 1840 },
    { label: 'Feb', value: 2260 },
    { label: 'Mar', value: 2105 },
    { label: 'Apr', value: 2740 },
    { label: 'May', value: 3180, color: 'var(--ds-chart-series-accent-color)' },
  ]}
/>
```
