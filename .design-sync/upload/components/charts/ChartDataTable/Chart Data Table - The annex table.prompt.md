# Chart Data Table - the annex table

ds-chart-data-table is the annex every chart puts under its plot: each reading in a details a reader can open. Cells arrive already formatted, because how a value reads is the chart's decision and not the table's. rowHeader renders each row's first cell as a th scope="row", for a matrix whose rows are named rather than numbered, and toggled fires when the disclosure changes - which is how the scatter chart builds twelve thousand rows only once they are asked for.

Full API: `ChartDataTable.d.ts`. How to use the component anywhere: `ChartDataTable.prompt.md`.
