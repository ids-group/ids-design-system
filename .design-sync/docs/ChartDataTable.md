---
category: Charts
---
Bare chart-data-table surface - port of `ds-chart-data-table`, the annex every chart puts under its plot: each reading in a `<details>` a reader can open, and the only route to the numbers for a reader with no pointer. Use directly only for static specimens or a custom chart; product charts render it themselves through their `dataTable` input.

- `columns`: the header row, `string[]`.
- `rows`: `{ key, cells, nested? }[]`. Cells arrive already formatted - how a value reads is the chart's decision, not the table's. `nested` draws the row indented and quieter, as a part of the row above (one bar's segment, one stage's drop).
- `caption`: the table's caption; `"Chart data"` when omitted.
- `open` (default `false`): starts the disclosure open.
- `rowHeader` (default `false`): renders each row's first cell as `<th scope="row">`, for a matrix whose rows are named rather than numbered.
- `onToggled`: fires with the disclosure's open state, so a chart with thousands of readings can build its rows only while they are on screen.

```tsx
<ChartDataTable
  caption="p95 response time"
  columns={['Day', 'p95 (ms)']}
  rows={[
    { key: 'mon', cells: ['Mon', '212'] },
    { key: 'tue', cells: ['Tue', '198'] },
  ]}
/>
```
