# Table - sortable columns

Mark columns sortable: true and add sortMode="client" to let the table order its own rows. Click a header to cycle asc → desc → none; the active column shows a coloured chevron. Pass [sortingOrder]="['asc', 'desc']" to drop the “none” step where an unsorted state isn't legal (e.g. a server-paged list).

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
