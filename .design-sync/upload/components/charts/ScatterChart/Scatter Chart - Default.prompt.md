# Scatter chart - default

Both scales are continuous: a point carries its own x and y, not a category index. Set xLabel and yLabel; without them the reader has two numbers and no idea which is which. Marks are semi-transparent (--ds-scatter-chart-dot-opacity, 0.72; radius --ds-scatter-chart-dot-radius) so a pile-up of forty reads darker than four, and they settle in together; a scatter has no stagger.

tickCount is a hint for both axes; ticks snap to a round step. dimOthers fades every mark but the one under the pointer, and tooltip="none" drops the panel.

Full API: `ScatterChart.d.ts`. How to use the component anywhere: `ScatterChart.prompt.md`.
