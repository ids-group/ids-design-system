# Table - what the pager shows

Three switches, all on by default. [pageSizeOptions] is the list the picker offers — [10, 25, 50, 100] unless you say otherwise, and worth narrowing when the data has a natural page. [showPageSize]="false" drops the picker for a table whose page size is fixed, and [showLabel]="false" drops the "N of M" range line. Turn both off and the footer is arrows and a page number, which is all a short list needs.

The same table with the picker and the range label off.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
