# Heat map - default

Rows down the side, columns across the top, one reading per cell. Magnitude is read from the STEP between two colours, which is why the heat scale spans the full lightness range rather than a band of near-neighbours. It is a separate scale from the funnel's ramp, which stays in the middle of the range for the opposite reason. Cells are sized by --ds-heatmap-chart-cell-size (34px), --ds-heatmap-chart-cell-gap (2px) and --ds-heatmap-chart-cell-radius; labels by --ds-heatmap-chart-label-color and --ds-heatmap-chart-label-font-size.

Full API: `HeatmapChart.d.ts`. How to use the component anywhere: `HeatmapChart.prompt.md`.
