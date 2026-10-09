---
category: Charts
---
The loading placeholder a chart draws in place of its plot - `ds-chart-skeleton`, rendered by `ds-chart`, `ds-column-chart`, `ds-line-chart` and `ds-waterfall-chart` while `loading` is set. It has no component of its own to place: render the chart with `loading`, and the skeleton appears.

- It shows only while the chart is loading; a loaded chart draws its marks instead.
- Do not use it directly.
