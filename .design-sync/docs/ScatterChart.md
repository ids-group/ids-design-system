---
category: Data display
---
Two continuous quantities against each other — weight against carriage cost, distance against time, volume against conversion. None of the other charts draws this: they all put categories on one axis. It is also the only one whose mark count the CALLER decides, so it is the only one that thins its own data before drawing.

- `data` (required): `{ id, label, data, color? }[]`. `data` is `{ x, y }[]` — both scales are continuous, so a point carries its own position on each rather than an index into a list of categories.
- `xLabel` / `yLabel`: name the two quantities. Not decoration — without them the reader has two numbers and no idea which is which, and on a scatter that is the whole reading.
- `decimator`: `'minMax'` (default) | `'lttb'` | `'none'` — see below.
- `tickCount` (default `5`): a hint, not a count, and it applies to both axes.
- `caption`, `summary`, `interactive`, `frame`, `dataTable`, `loading`, `error`, `emptyText`, `errorText`, `valueFormat`: as on the other charts. With data on screen, `loading` keeps the plot under a `ds-loading-overlay` until it clears.
- `pointClicked`: `{ series, point }`.

**It thins its own data, and it says so.** SVG degrades by the number of NODES, not by the number of readings: the same data as a line is one `<path>` and as a scatter it is one node per point. Lighthouse warns at about 800 nodes and errors at about 1400, on a page that may hold four more charts. Past FOUR times the plot's width in marks — not two, where the saving is invisible and the loss of detail is not — the series is decimated, a line under the plot says how many readings were thinned, and the annex table still lists every one.

**`minMax` is the default because it is the only one that promises anything.** Each bucket's highest and lowest reading are in the output by construction, so the spike a reader is looking for cannot be the point that was dropped. It also parallelises and stays stable while the reader pans, since a bucket's answer does not depend on its neighbours. `lttb` draws a truer silhouette at the same budget and makes no such promise — reach for it where the outline is the reading and an individual point is not. `'none'` is the caller taking the node budget on themselves.

**The annex table is built when it is opened.** `<details>` keeps its children in the DOM while it is shut, so a scatter of 12 000 readings parked 48 000 nodes on the page - three times what decimating the plot had just saved. Closed it is 615 nodes; opened it is every reading, one click away.

**Marks are semi-transparent** (`--ds-scatter-chart-dot-opacity`, default `0.72`), because the interesting thing on a scatter is where they pile up: at full opacity a cluster of forty and a cluster of four are the same solid disc.

The budget is a gate rather than a paragraph: the decimator is fed 100 000 readings and its output asserted to fit the plot, with a control that the same data undecimated does not — so a decimator that quietly stopped decimating cannot pass.

Tokens: `--ds-scatter-chart-grid-line-color`, `--ds-scatter-chart-axis-line-color`, `--ds-scatter-chart-axis-label-color`, `--ds-scatter-chart-axis-font-size`, `--ds-scatter-chart-dot-radius`, `--ds-scatter-chart-dot-opacity`, `--ds-scatter-chart-focus-color`, `--ds-scatter-chart-focus-width`.
