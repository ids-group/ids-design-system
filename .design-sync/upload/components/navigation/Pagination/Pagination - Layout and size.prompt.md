# Pagination - layout and size

layout: 'grouped' (default) keeps label and buttons together at natural width; 'spread' goes full width with the label at one end, for a pager under a table. Unset, size falls back to DS_CONFIG.pagination.size, then DS_CONFIG.control.size, then 'sm'. Unset, layout falls back to DS_CONFIG.pagination.layout, then 'grouped'. Both also reach the pager inside ds-table.

Full API: `Pagination.d.ts`. How to use the component anywhere: `Pagination.prompt.md`.
