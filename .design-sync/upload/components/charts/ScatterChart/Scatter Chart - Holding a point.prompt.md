# Scatter chart - holding a point

A click on a point holds it and its tooltip in place, with a pin disc over it and an Unpin control at the top end of the chart. A second click, Esc or a press elsewhere lets go, and pointClicked fires either way. Enter and Space on a point fire pointClicked and do not pin. Set pinOnClick="false" to keep points unheld, or DS_CONFIG.chart.pinOnClick: false for every chart.

Full API: `ScatterChart.d.ts`. How to use the component anywhere: `ScatterChart.prompt.md`.
