---
category: Charts
---
Bare chart-tooltip surface — port of `ds-chart-tooltip-panel`, the panel every chart portals when a mark is hovered, tapped or focused. Use directly only for static specimens (style guides, previews) where you place it yourself; product code sets `tooltip` on the chart and lets it position the panel.

- `context` is required: `{ category: string; entries: { label, value, formatted, color }[] }`. `formatted` is the value already through the chart's `valueFormat`, because the panel never formats.
- `category` may be empty — a bar, column, donut or funnel mark IS its category, so its entry label already says it. A line chart fills it with the category under the pointer.
- `template` is Angular-only and unusable from React. To replace the contents, render your own element instead.
- The host carries `aria-hidden`: every interactive mark already puts the same label and value in its own accessible name, so exposing the panel makes a screen reader read each reading twice.

```tsx
<ChartTooltipPanel
  context={{
    category: 'Mar',
    entries: [
      { label: 'Sessions', value: 4400, formatted: '4,400', color: 'var(--ds-chart-series-1-color)' },
    ],
  }}
/>
```
