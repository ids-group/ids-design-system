# Chart container - what a line series does on its own

These are the mark's inputs, not the preset's - reach for them once ds-line-chart stops fitting. highlighted names the one series to single out and fades the rest whatever dimOthers says - dimOthers governs only the fade a pointer over a marker starts. The singled-out line thickens as well as keeping its colour, so the comparison survives a monochrome print. patterns gives each series a dash of its own, curve takes 'linear' / 'step' / 'smooth', stacked separates a piled band from the one under it, pinOnClick holds a reading on a plot without the category cursor (under the cursor the container's cursorPin holds the whole category instead), and tooltipAnchor decides whether an 'axis' panel hangs over the highest reading or follows the pointer.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
