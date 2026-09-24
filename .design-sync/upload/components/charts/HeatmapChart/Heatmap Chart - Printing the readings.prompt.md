# Heat map - printing the readings

showValues puts each reading inside its own cell. Off by default because a grid dense enough to be worth a heat map has no room for the numbers. The glyph takes the cell's own colour inverted, which is what keeps it legible at both ends of a scale running 1.14:1 to 9.07:1 against white.

Full API: `HeatmapChart.d.ts`. How to use the component anywhere: `HeatmapChart.prompt.md`.
