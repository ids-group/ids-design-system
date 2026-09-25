# Heat map - holding a cell

A click on a measured cell holds it and its tooltip in place, with a pin disc on it and an Unpin control at the top end of the chart. A second click, Esc or a press elsewhere lets go, and on an interactive heat map cellClicked fires either way. Enter and Space on a cell only click it; they do not pin. Set pinOnClick="false" to keep cells unheld, or DS_CONFIG.chart.pinOnClick: false for every chart.

Full API: `HeatmapChart.d.ts`. How to use the component anywhere: `HeatmapChart.prompt.md`.
