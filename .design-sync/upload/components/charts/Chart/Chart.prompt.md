# Chart

The container `ColumnChart` is built inside - port of `ds-chart`. It owns the plot, the axes, the gridlines, the ticks, the shared value domain and the loading, empty and error states, and it draws no marks of its own: the columns, lines, reference lines and labels are separate children projected into it. The other four charts each still draw their own canvas.

**Reach for a preset, not for this.** The five charts are the whole API from here. The marks are Angular components with ATTRIBUTE selectors on an `<svg:g>` (`g[dsColumnSeries]`, `g[dsLineSeries]`, `g[dsReferenceLine]`, `g[dsReferenceLabel]`), so `@angular/elements` has no tag to register for any of them and nothing you project from React can draw inside the canvas. `referenceLine` and `referenceLabel` appear on the props below because the generator emits a prop per slot; both are inert here, because the wrapper that claims a slot is an HTML `<span>` and an HTML element inside an `<svg>` renders nothing. A `Chart` with no Angular marks in it renders a framed, captioned, empty plot.

- `categories` (required in practice): `string[]` - the x axis. Its length is what decides how many bands the plot has; empty draws `emptyText`.
- `tickCount` (default `5`): a hint, not a count. Ticks snap to a round step.
- `min` / `max`: pin the floor and the ceiling of the value axis. They only ever OPEN the axis further, so a floor above the data cannot push a reading off the plot.
- `plotHeight` (default `240`), `axisGutter` (default `46`), `valueSpace` (default `20`): the plot's geometry in real CSS pixels. The `viewBox` is sized from a measurement of the element, so one user unit is one pixel and a length written into a mark is the length it says it is at every card width. `axisGutter` is a FLOOR: the container measures the rendered tick labels and widens past it rather than clipping them.
- `caption`: printed above the plot as the visible title.
- `summary`: the accessible name. The container holds no readings, so a chart that needs its numbers described supplies the sentence here; the presets generate it from their own data.
- `interactive` (default `false`): only decides the plot's role, `group` against `img`. The marks carry their own interactivity.
- `frame`: `'auto'` (default) draws the bordered, padded box; `'none'` leaves it bare for a chart inside a card the page has already drawn. Unset falls back to `DS_CONFIG.chart.frame`.
- `loading` (default `false`): with empty `categories`, a skeleton at the plot's own height; with data on screen, the plot stays under a `ds-loading-overlay` until it clears.
- `skeletonCount` (default `5`): how many columns the skeleton draws until the data's own count is known.
- `emptyText` (default `"No data"`), `error` (default `false`), `errorText` (default `"Could not load the data"`): the three non-plot states. `error` is separate from `loading` and from an empty `categories` because "the request failed" and "there is nothing to show" read the same and mean opposite things.
- `valueFormat`: `(value: number, location) => string` for the tick labels. Unset falls back to `DS_CONFIG.chart.valueFormat`.
- `secondaryAxisMode` (default `'aligned'`): `'aligned'` | `'exact'` | `'dual-grid'` | `'split'` - how a second value axis relates to the first, once a mark has reported against it. Every name says what is done to the gridlines. The same four words `LineChart` takes as `yAxisMode`.
- `axisColor` / `secondaryAxisColor`: paint each axis's tick labels in the colour of the marks measured against it. Nothing else on a two-scale plot says which of two marks is read against which numbers, and only the author knows, because several marks can share one axis.
- `curve` on `dsLineSeries`: `'linear'` (default) | `'step'` | `'smooth'`. The same three words `LineChart` takes, and `'smooth'` is the same monotone cubic, so a composed plot and a preset draw one series the same way.

**The three slots are layers, not an ordering preference.** `dsReferenceLine` paints under the marks whatever order it was written in, the default slot takes the marks, and `dsReferenceLabel` paints over them: an annotation's stroke is furniture and belongs below the readings, its name has to survive a column drawn through it. Inside the default slot the marks paint in the order they are written.

In Angular, the composition the presets cannot express looks like this - a column series and a line series on a second axis, sharing one plot:

```html
<ds-chart
  caption="Orders against average order value"
  [categories]="months"
  [axisColor]="columnColor"
  [secondaryAxisColor]="lineColor"
  [summary]="summary">
  <svg:g dsColumnSeries [data]="orders" [showValues]="false" />
  <svg:g dsLineSeries [data]="basket" />
</ds-chart>
```

From here, use the preset that matches the picture:

```tsx
<ColumnChart
  caption="New accounts by month"
  data={[
    { label: 'Jan', value: 1840 },
    { label: 'Feb', value: 2260 },
    { label: 'Mar', value: 2105 },
  ]}
/>
```
