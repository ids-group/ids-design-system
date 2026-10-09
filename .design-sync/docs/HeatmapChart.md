---
category: Data display
---
A matrix of readings coloured by magnitude — depot by weekday, hour by date, queue by region. Colour is the only channel carrying the quantity on the grid, so every cell names its own reading to assistive tech and the annex table under the grid is always drawn, never an option.

- `columns` (required in practice): `string[]`, the column headings left to right. Their count decides how much of a row is drawn: a longer row loses its tail, a shorter one ends early.
- `data` (required): `{ id?, label, data }[]`, one entry per row. `data` is `(number | null)[]`, one reading per column.
- `min` / `max`: pin the floor and the ceiling of the colour scale. They only ever OPEN it further. Set both to compare two heat maps by colour — unset, each spans its own readings and the same hue means a different quantity on each.
- `showValues` (default `false`): prints each reading inside its cell. Off because a grid dense enough to be worth a heat map has no room for the numbers, which is why the annex table is always there.
- `interactive` (default `false`): makes every measured cell a button and fires `cellClicked`. An unmeasured cell stays inert — a grid of buttons with nothing behind them is a tab trap.
- `caption`: shown above the grid and reused as the annex table's caption.
- `frame`: `'auto'` (default) draws the bordered, padded box; `'none'` leaves it bare. Unset falls back to `DS_CONFIG.chart.frame`.
- `loading` (default `false`), `error` (default `false`), `emptyText` (default `"No data"`), `errorText` (default `"Could not load the data"`): the three non-plot states. `error` is separate from an empty matrix because "the request failed" and "there is nothing to show" read the same and mean opposite things. With data on screen, `loading` keeps the plot under a `ds-loading-overlay` until it clears.
- `valueFormat`: `(value: number, location) => string`. Formats the scale's two ends, every cell's accessible name and the annex table. Unset falls back to `DS_CONFIG.chart.valueFormat`.
- `cellClicked`: `{ row, rowIndex, column, columnIndex, value }`.

**A `null` reading is a hole, not a low value.** It draws as the surface rather than as the heat scale's coldest step, and it is excluded from the scale — the coldest step is a real measurement, and painting "we never measured this" with it states a figure nobody recorded.

**The scale under the grid is what says what a colour is worth.** It prints the heat scale's steps between the lowest and the highest reading; a heat map without it is a picture of relative warmth with no quantity attached.

**The heat scale spans 1.14:1 to 9.07:1 against white**, so a label placed over a cell cannot take one colour for the whole scale. `showValues` handles this by drawing the glyph in the cell's own colour inverted, which stays legible at either end.

The host is `fit-content` wide, capped at its container. To fill the container: `:root ds-heatmap-chart { inline-size: auto }` in a global stylesheet. The grid scrolls sideways below its natural width rather than crushing the cells, the same answer `Table` gives.
