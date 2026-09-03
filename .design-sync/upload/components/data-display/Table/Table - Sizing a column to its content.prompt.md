# Table - sizing a column to its content

width: 'content' on a column sizes it to its widest cell and stops it wrapping, leaving the slack to the columns that should absorb it. An auto-layout table spreads leftover width evenly, so a status or a figure ends up as wide as its own header while the name column that should take the space does not. A pixel width cannot express that — pin one column and the rest still spread. Below, Status and Budget are 'content'; Project and Owner share what is left. Dragging a column's edge still wins, since that is a deliberate pixel width.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
