# Table - expandable rows

[expandableRows]="true" adds a chevron toggling a panel from [rowExpandTemplate]; [(expandedIds)] is two-way. [expandAllToggle]="true" adds a header chevron, page-scoped like select-all.

(rowExpanded) and (rowCollapsed) fire per row, expand-all included; writing expandedIds yourself emits nothing.

Last event:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
