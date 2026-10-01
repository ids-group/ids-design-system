---
category: Charts
---
The Unpin pill a chart shows on its caption line while a mark or a category is held - `ds-chart-unpin`, drawn by every chart itself. It has no component of its own to place: render the chart, and the pill appears when a click pins a mark.

- It shows only while a pin is held; a chart with nothing pinned draws no pill.
- Pressing it releases the pin, as Escape or a press outside the plot does.
- The label is `chart.unpin` from the DS dictionary, `Unpin` by default.
