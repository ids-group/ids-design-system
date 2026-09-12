---
category: Data display
---
Horizontal bar chart: each row in `data` prints a `label`, a formatted `value` and (unless suppressed) a percentage, with a track filled to `value` relative to `max`. The populated state renders inside a `role="img"` block carrying an auto-generated accessible name; a `<details>` data table underneath repeats every row as plain text.

- `data` (required): `{ label, value, percent?, color? }[]`. `percent` is derived from `value / max` when omitted; `color` overrides that row's bar (default: the categorical series palette, `--ds-chart-series-1-color` … `-8-color`, cycling by row index).
- `max`: track length is relative to this; unset/`null` (default) uses the largest `value` in `data`.
- `caption`: shown above the rows and reused as the data table's own caption (falls back to "Chart data" there when unset).
- `summary`: the accessible name; generated from `data` when omitted (e.g. "3 points, from 12 at Leeds to 40 at Bristol…").
- `showPercent` (default `true`): set `false` to hide the trailing percentage column.
- `valueFormat`: `(value: number) => string`, defaults to `Intl.NumberFormat`; formats both the row value and the values inside the generated `summary`.
- `dataTable`: `'toggle'` (default, closed disclosure) | `'visible'` (open) | `'none'` (omit entirely).
- `loading` (default `false`): shows a skeleton block instead of rows.
- `emptyText` (default `"No data"`): shown in place of rows when `data` is empty.
- `onRowClick`: fires with the clicked row.

```tsx
<BarChart
  caption="Deliveries by depot"
  data={[
    { label: 'Leeds', value: 128 },
    { label: 'Bristol', value: 94 },
    { label: 'Derby', value: 40, color: 'var(--ds-chart-series-3-color)' },
  ]}
/>
```
