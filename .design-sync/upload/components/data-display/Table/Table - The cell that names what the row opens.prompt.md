# Table - the cell that names what the row opens

On a [rowInteractive] table the whole row is the control, so the tint says clickable and nothing says WHICH text is the target. Mark that column interactive: true and its cell takes a link colour and an underline while the row is hovered — colour plus a decoration, never hue alone. Retune with --ds-table-cell-link-color and --ds-table-cell-link-decoration. Off unless a column asks for it, and inert on a passive table for the same reason the tint is: nothing should promise a click that does not happen.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
