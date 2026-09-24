# Scatter chart - thinning, and saying so

SVG degrades by the number of NODES, not by the number of readings: the same data as a line is one <path>, and as a scatter it is one node per point. Lighthouse warns at about 800 nodes and errors at about 1400, on a page that may hold four more charts. So past four times the plot's width in marks the series is decimated - and the chart says so on its face, because a quiet decimation leaves the reader counting points that were never drawn. Every reading is still in the data table.

decimator picks how. minMax, the default, keeps each bucket's highest and lowest reading by construction, so the spike a reader is looking for cannot be the point that was dropped. lttb draws a truer silhouette at the same budget and makes no such promise. none is the caller taking the node budget on themselves.

Full API: `ScatterChart.d.ts`. How to use the component anywhere: `ScatterChart.prompt.md`.
