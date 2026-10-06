# Table - sortable columns

sortable: true columns plus sortMode="client": clicks cycle asc → desc → none.

[sortingOrder]="['asc', 'desc']" drops the none step. sortValue: row => row.budget sorts by raw value, not rendered text; blanks sort last both ways.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
