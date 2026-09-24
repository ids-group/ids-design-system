# Table - what the pager shows

Three switches, all on by default. [pageSizeOptions] is the list the picker offers — [10, 25, 50, 100] unless you say otherwise, and worth narrowing when the data has a natural page. [showPageSize]="false" drops the picker for a table whose page size is fixed, and [showLabel]="false" drops the "N of M" range line. Turn both off and the footer is arrows and a page number, which is all a short list needs.

The same table with the picker and the range label off.

paginationSize and paginationLayout reach the pager's own size and layout: md gives the buttons the md control height, and spread puts the range label under the table's start edge and the controls under its end edge. Unset, both fall back to DS_CONFIG.pagination, which is where an app whose every pager sits under a table says it once.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
