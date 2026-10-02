# Table - sortable columns

Mark columns sortable: true and set sortMode="client" to let the table order its own rows. A header click cycles asc → desc → none.

[sortingOrder]="['asc', 'desc']" drops the none step where unsorted is not legal. sortValue: row => row.budget sorts by the raw value instead of the rendered text; blanks sort last in both directions.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
