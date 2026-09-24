# Pagination - layout and size

layout decides how the pager fills its row. 'grouped', the default, keeps the label and the buttons together at their natural width; 'spread' goes full width and pushes the label to one end, which is what a pager under a table wants so the controls land under the same edge as the table's own. size takes the control scale - unset it falls back to DS_CONFIG.pagination.size, then DS_CONFIG.control.size, then 'sm'. Unset, layout falls back to DS_CONFIG.pagination.layout, then 'grouped'. Both reach the pager inside ds-table as well, so one config line sets every pager in the app.

Full API: `Pagination.d.ts`. How to use the component anywhere: `Pagination.prompt.md`.
