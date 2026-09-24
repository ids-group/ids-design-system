# Heat map - what has to be there

Colour is the only channel carrying the quantity on the grid, so two things are not optional here the way they are on the other charts. The scale under the grid says what a colour is worth - without it the picture is relative warmth with no quantity attached. The annex table is always drawn, never a dataTable choice, because WCAG 1.4.1 is not satisfied by a grid of coloured squares. Every cell also names its own reading to assistive tech as row, column: value.

Full API: `HeatmapChart.d.ts`. How to use the component anywhere: `HeatmapChart.prompt.md`.
