# Chart container - the tooltip and the legend of a composed chart

The container opens the one tooltip its marks describe: a mark hands it what the panel shows, so nothing is bound on the mark itself. tooltipTemplate replaces the panel's body and receives the ChartTooltipContext - the category and one entry per series, each already through the chart's valueFormat. tooltipExtraGap pushes the panel further from the mark, for a plot that prints value labels in the gap it would take.

A legend is yours to place: ds-chart-legend 's highlighted feeds the column series' highlighted, matched against its seriesKey, and the line series' highlighted, matched against its series ids. Hovering a legend entry fades the rest to --ds-chart-dim-opacity whether or not dimOthers is set. A line series sits on a band of the surface colour - outline, on by default - so it stays legible where it crosses the columns; switch it off here to compare.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
