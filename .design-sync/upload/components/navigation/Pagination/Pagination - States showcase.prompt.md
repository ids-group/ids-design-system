# Pagination - states showcase

Page-button states side-by-side. Live ds-pagination — pin classes target non-active buttons via ::ng-deep (see styles below). loading disables every control, masks the range label and sets aria-busy on the nav. With a total of 0 the label reads Showing 0 of 0, every button is disabled and none is marked current. The label comes from DS_INTL.pagination.range(0, 0, 0), so a range of your own handles that call.

Full API: `Pagination.d.ts`. How to use the component anywhere: `Pagination.prompt.md`.
