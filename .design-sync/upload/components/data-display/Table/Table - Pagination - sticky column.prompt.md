# Table - pagination · sticky column

[pageSize] turns on client paging (select-all then covers the current page). [stickyFirstColumn] pins the first column on horizontal scroll. [animateHeight] tweens the body between pages.

For server paging bind [total] and pass one page at a time. [scrollToTopOnPageChange] scrolls the table back into view.

sortMode: server (default) only emits (sortChange), client sorts the rows in hand, none removes the affordance.

Selected:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
