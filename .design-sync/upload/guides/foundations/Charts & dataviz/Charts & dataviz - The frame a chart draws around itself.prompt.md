# Charts & dataviz - the frame a chart draws around itself

A chart draws its own bordered, padded box by default so its plot, legend and annex table do not run into neighbours. Inside a card, turn it off with frame="none" per chart or DS_CONFIG.chart.frame per app.

The --ds-chart-frame-* tokens still size the frame when it is on. Reaching for them to switch it OFF is the thing the input replaces: a rule against a component's own chrome from a global sheet.
