# Table - pagination · sticky column

[pageSize] turns on client-side pagination (select-all then scopes to the current page); [stickyFirstColumn] pins the first column on horizontal scroll; sortMode says who sorts — "server" (the default) emits (sortChange) and leaves ordering to you, "client" has the table reorder its own rows and is what a table holding EVERY row wants, and "none" drops the affordance so a sortable column cannot draw a header that does nothing. 12 rows across three pages; [animateHeight] tweens the body height between pages (page 3 has only two rows) instead of snapping. For server-side paging, bind [total] to the full row count and hand the table one page at a time — it then drives the pager off total and skips its own slicing. Add [scrollToTopOnPageChange] to scroll the table back into view on a page change — handy when the pager sits below a long table.

Selected:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
