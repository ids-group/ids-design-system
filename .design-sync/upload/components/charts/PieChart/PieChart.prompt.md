# PieChart

A ring that splits one total into its parts. Each slice carries its share as a whole percentage, and the percentages always add up to exactly 100, so a legend never visibly loses a point. The middle of the ring is free for the total or for a headline figure of your own.

- `data` (required): `{ id, label, value, slot? }[]`. `slot` is a 1-based palette slot — pinning a slice keeps every other slice's colour where it is when one is filtered out of `data`; left off, the colour follows the index and the whole ring repaints.
- `centerValue` / `centerLabel`: the headline figure in the middle of the ring, and the word under it. Drawn only while there is a hole.
- `legend`: `'end'` (default, beside the ring) | `'bottom'` | `'none'`.
- `maxSlices` / `otherLabel`: cap the legend's length. Past the cap the smallest slices are summed into one slice named by `otherLabel` (default `"Other"`) taking the neutral eighth palette colour. Off by default; the kept slices keep the order you gave them and the total does not change.
- `innerRadius` (default `0.68`): the hole as a share of the radius, from `0` up to but not including `1`. `innerRadius={0}` closes the hole into a solid pie, and `centerValue` / `centerLabel` then draw nothing, because no single text colour is readable against three different hues. A value outside that range falls back to the default.
- `caption`: shown above the ring and reused as the data table's caption.
- `summary`: the accessible name; generated from `data` when omitted.
- `valueFormat`: `(value: number) => string`, defaults to `Intl.NumberFormat`.
- `dataTable`: `'toggle'` (default, closed disclosure) | `'visible'` (open) | `'none'` (omit entirely).
- `loading` (default `false`): with empty `data`, a skeleton ring and legend rows; with data on screen, the plot stays under a `ds-loading-overlay` until it clears.
- `skeletonCount` (default `5`): how many slices and legend rows the skeleton draws until the data's own count is known.
- `emptyText` (default `"No data"`): shown in place of the ring when `data` is empty.
- `interactive` (default `false`): turns on the pointer cursor and puts every legend row in the tab order as a `role="button"` answering Enter and Space.
- `onSliceClicked`: fires with the clicked slice, with or without `interactive`.

**Colour: this is the chart the categorical palette exists for.** Slices ARE different things, so they take `--ds-chart-series-1-color` … `--ds-chart-series-8-color` by position, or by `slot` when you need a slice to keep its colour as the data filters. Slots 7 and 8 are the "rest" / "other" buckets, and slot 8 is a neutral on purpose.

Percentages use largest-remainder rounding rather than rounding each slice on its own, so the legend adds up and a real non-zero slice never prints `0%`.

```tsx
<PieChart
  caption="Accounts by plan"
  centerValue="11,860"
  centerLabel="accounts"
  data={[
    { id: 'enterprise', label: 'Enterprise', value: 4820 },
    { id: 'business', label: 'Business', value: 3610 },
    { id: 'team', label: 'Team', value: 2140 },
    { id: 'starter', label: 'Starter', value: 1290 },
  ]}
/>
```
