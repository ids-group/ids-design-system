# Pagination - states showcase

loading disables every control, masks the range label with a skeleton and sets aria-busy on the nav. At total 0 the label reads "Showing 0 of 0" via DS_INTL.pagination.range(0, 0, 0) (a custom range must handle it); every button is disabled, none current.

Full API: `Pagination.d.ts`. How to use the component anywhere: `Pagination.prompt.md`.
