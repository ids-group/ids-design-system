---
category: Charts
---
Bare chart-legend surface — port of `ds-chart-legend`, the key LineChart renders beside its plot. Use directly only for static specimens (style guides, previews) where you place it yourself; product code sets `legendFilters` on the chart and lets it build the rows.

- `items` is required: `{ id, label, color }[]`. `id` matches the series or slice id the chart hides by, so both sides agree on what a row switches off.
- `toggleable` makes each row a real `<input type="checkbox">`. Off leaves the legend a plain key with no controls.
- `hidden` carries the ids switched off, two-way, so a page can drive it from a URL parameter.
- `highlighted` carries the id under the pointer or holding focus, also two-way — it is what the chart dims the other series from.
- Ordinary DOM, never inside the `<svg>`: the checkbox is what makes a row keyboard-operable and correctly announced without inventing a role.

```tsx
<ChartLegend
  toggleable
  items={[
    { id: 'sessions', label: 'Sessions', color: 'var(--ds-chart-series-1-color)' },
    { id: 'signups', label: 'Signups', color: 'var(--ds-chart-series-2-color)' },
  ]}
/>
```
