# Charts & dataviz - the frame a chart draws around itself

A chart draws its own bordered, padded box by default, because it is read as an object — a plot with axes, a legend and an annex table — and without an edge those parts run into whatever sits beside them. Inside a card the page has already drawn, that is a second box around the first. frame="none" turns it off for one chart; DS_CONFIG.chart.frame turns it off for an app, which is where the decision usually belongs — whether charts live in cards is settled once per product, not per plot.

The --ds-chart-frame-* tokens still size the frame when it is on. Reaching for them to switch it OFF is the thing the input replaces: a rule against a component's own chrome from a global sheet.
