# Table - truncation · full-text popover

truncate: true ellipsis-clips a text column at its width (240px when unset). The full value sits in the hover tooltip, and clicking a clipped cell opens it in a popover — an unclipped cell passes the click through to the row.

Only columns that asked for it are watched, and that is the point. Clip detection runs on cells in a truncate column, not on every overflowing cell in the table: a click handler on every <td> would swallow the row click on an interactive table. Within such a column it does look deeper than the cell itself — a dsCellTemplate puts the ellipsis on a descendant, so testing only the wrapper would miss it.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
