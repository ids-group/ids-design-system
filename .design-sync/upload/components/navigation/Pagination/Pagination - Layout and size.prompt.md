# Pagination - layout and size

layout: 'grouped' (default) keeps label and buttons together at natural width; 'spread' goes full width, label at one end, for under a table. Fallbacks: size → DS_CONFIG.pagination.size → DS_CONFIG.control.size → 'sm'; layout → DS_CONFIG.pagination.layout → 'grouped'. Both also apply to the pager inside ds-table.

Full API: `Pagination.d.ts`. How to use the component anywhere: `Pagination.prompt.md`.
