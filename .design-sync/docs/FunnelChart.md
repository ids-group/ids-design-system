---
category: Data display
---
The stages of a journey, drawn top to bottom in the order you give them — they are never sorted, because the order is the meaning. Under the funnel an aligned table repeats each stage's value, its share of the first stage, and how much fell away since the stage above it.

- `data` (required): `{ id, label, value }[]`, in journey order.
- `shape`: `'area'` (default) | `'width'` | `'taper'` — see below.
- `showTable` (default `true`): the aligned stage table under the funnel.
- `caption`: shown above the funnel and reused as the data table's caption.
- `summary`: the accessible name; generated from `data` when omitted.
- `valueFormat`: `(value: number) => string`, defaults to `Intl.NumberFormat`.
- `dataTable`: `'toggle'` (default) | `'visible'` | `'none'`. Suppressed entirely while `showTable` is on — with both, the same numbers print twice.
- `loading` (default `false`): with empty `data`, a skeleton funnel over the stage table; with data on screen, the plot stays under a `ds-loading-overlay` until it clears.
- `skeletonCount` (default `5`): how many stages the skeleton draws until the data's own count is known.
- `emptyText` (default `"No data"`): shown in place of the funnel when `data` is empty.
- `interactive` (default `false`): turns on the pointer cursor and the keyboard route.
- `onStageClicked`: fires with the clicked stage, with or without `interactive`.

**`shape` decides what the geometry claims.** `'area'`, the default, keeps a fixed silhouette and moves the stage boundaries so each band's AREA is proportional to its value — both honest and still leaving a tail wide enough to label. `'width'` reads every boundary straight off the values, which is honest until the funnel is steep: a stage at 1% of the first is drawn 1% wide, far too narrow to label. `'taper'` encodes NOTHING — every stage is the same depth, the outline is decoration and the table carries the numbers; editing the values moves the table and never the shape.

**Colour: a ramp, not a palette.** The stages are one quantity draining, not N categories, so they take `--ds-chart-ramp-1-color` … `--ds-chart-ramp-8-color` — one hue light to deep — spread across however many stages there are. The last stage leaves the ramp for `--ds-chart-series-accent-color`: it is the outcome the funnel is read for.

```tsx
<FunnelChart
  caption="Checkout funnel"
  data={[
    { id: 'visited', label: 'Visited the site', value: 12400 },
    { id: 'viewed', label: 'Viewed a product', value: 7850 },
    { id: 'basket', label: 'Added to basket', value: 3120 },
    { id: 'checkout', label: 'Started checkout', value: 1480 },
    { id: 'purchased', label: 'Purchased', value: 910 },
  ]}
/>
```
