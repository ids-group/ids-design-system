# WaterfallChart

A running total, bar by bar: what a figure started at, what moved it, and what it ended at. The one variant in the chart family that genuinely cannot be a mode on another — it needs an accumulating level, bars pinned to zero for the totals, and its own three-colour semantic, all at once.

- `data` (required): `{ id?, label, value, kind? }[]`, in the order the steps happened. A waterfall is never sorted, because the sequence is the meaning.
- `kind`: `'delta'` (default) hangs the bar from the level the one before it left off at; `'total'` and `'subtotal'` stand it on zero at the running sum. Every row adds its `value` to the sum wherever it sits, so a closing total usually carries `value: 0` — it prints the sum reached, not a change of its own. A subtotal differs from a total only in that the chain carries on past it.
- `showValues` (default `true`): prints each bar's own reading above it, with its sign. A delta prints its change (`+130`, `-320`), a total prints the sum (`800`).
- `showConnectors` (default `true`): the dashed rule chaining one bar to the next at the level they share. Without it the bars read as separate columns rather than as one running total.
- `caption`: shown above the plot and reused as the data table's caption.
- `summary`: the accessible name; generated from `data` when omitted.
- `tickCount` (default `5`): a hint, not a count. Ticks snap to a round step.
- `interactive` (default `false`): turns on the affordance and the keyboard route, and fires `barClicked`.
- `frame`: `'auto'` (default) | `'none'`. `dataTable`: `'none'` (default) | `'toggle'` | `'visible'`.
- `loading` (default `false`), `error` (default `false`), `emptyText` (default `"No data"`), `errorText` (default `"Could not load the data"`). With data on screen, `loading` keeps the plot under a `ds-loading-overlay` until it clears.
- `skeletonCount` (default `5`): how many steps the skeleton draws until the data's own count is known.
- `valueFormat`: `(value: number, location) => string`.
- `barClicked`: the `WaterfallChartDatum` that was clicked.

**Colour never carries the meaning alone.** Every bar prints its own sign, and every bar's accessible name says "increase", "decrease" or "total" in words, so the chart survives forced colours, a monochrome print and a reader who cannot tell the two hues apart.

**The pair is `--ds-chart-positive-color` and `--ds-chart-negative-color`, not `--success` and `--error`.** A waterfall's up and down are not success and failure — a cost rising is a rise and a bad one — so they point at the palette's own two lead hues. A total takes `--ds-chart-series-default-color`, because it is not a change at all.

Built on `Chart` with a column series and a waterfall-specific mark projected into it, so the axis, the gridlines, the frame and the annex table are the family's own. Token: `--ds-waterfall-chart-connector-color`.
