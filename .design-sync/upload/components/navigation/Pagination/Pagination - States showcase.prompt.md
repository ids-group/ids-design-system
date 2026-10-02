# Pagination - states showcase

loading disables every control, masks the range label with a skeleton and sets aria-busy on the nav. With total 0 the label reads "Showing 0 of 0" (DS_INTL.pagination.range(0, 0, 0), so your own range handles that call), every button is disabled and none is current.

Full API: `Pagination.d.ts`. How to use the component anywhere: `Pagination.prompt.md`.
