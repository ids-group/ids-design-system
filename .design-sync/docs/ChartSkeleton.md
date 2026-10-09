---
category: Charts
---
The loading placeholder a chart draws in place of its plot - `ds-chart-skeleton`, rendered by `ds-chart`, `ds-column-chart`, `ds-line-chart` and `ds-waterfall-chart` while `loading` is set. It has no component of its own to place: render the chart with `loading`, and the skeleton appears.

- It shows only while loading with no data. A chart reloading with data on screen keeps its plot under a `ds-loading-overlay`.
- Do not use it directly.
