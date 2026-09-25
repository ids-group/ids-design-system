# Waterfall chart - holding a step

A click on a bar holds it and its tooltip in place, with a pin disc on it and an Unpin control at the top end of the chart. A second click, Esc or a press elsewhere lets go, and barClicked fires either way. Set pinOnClick="false" to keep bars unheld, or DS_CONFIG.chart.pinOnClick: false for every chart.

Full API: `WaterfallChart.d.ts`. How to use the component anywhere: `WaterfallChart.prompt.md`.
