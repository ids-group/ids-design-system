# Table - sticky horizontal scrollbar

[stickyScrollbar]="true" hides the scroll container's native bar and pins a proxy scrollbar to the bottom of the viewport while the table is on screen — on a tall, wide table the horizontal bar stays reachable without scrolling to the table's end. Wide fixed column widths force the overflow here.

The bar rests on the edge the reader can see: the table measures its scroll container's bottom padding and cancels it, because a sticky offset otherwise resolves against the scrollport's content box and settles that far short. For a scrollport whose reachable edge is somewhere else, set [stickyScrollbarOffset] on the table or DS_CONFIG.table.stickyScrollbarOffset for every table at once; the --ds-table-sticky-scrollbar-offset hook still out-ranks both.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
