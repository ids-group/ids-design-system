# Chart container - two value axes

A mark declares which axis it is measured against - axis: 'secondary' in a line series' data, axis="secondary" on a column series - and secondaryAxisMode decides how that axis relates to the first. 'aligned', the default, hangs it on the first axis's own gridlines at a round step, so both marks share one plot; 'split' gives up on sharing and draws two plots over the same category axis. axisColor and secondaryAxisColor paint each axis's labels in the colour of the marks read against it, which is the only thing on the canvas that says which numbers a mark answers to.

Either mark can take either side. Here the columns read the right-hand axis and the line the left, which is the arrangement to keep when the screen being replaced put them that way round.

The dressed version of the single-plot case - both marks answering the pointer, a cumulative line over the columns it sums - is on the column chart page under "Columns and a line, on two scales". It is kept there rather than moved here because a reader arrives at it while reading about columns, which is where the question is asked.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
