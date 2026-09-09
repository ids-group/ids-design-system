# Table - row identity for data with no key

Selection, expansion and the active-row highlight all need to name a row, and by default the table reads row.id. Display-only data often has none — an audit line, a log row, a joined projection. Pass [rowId] an accessor instead of minting synthetic ids into the data just to satisfy the table. These deliveries have no id at all: two share a channel and two share a timestamp, so identity is the pair, and [rowId]="row => row.channel + '-' + row.sentAt" is what makes the checkboxes track the right rows.

Selected: —

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
