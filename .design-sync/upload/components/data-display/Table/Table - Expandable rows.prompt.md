# Table - expandable rows

[expandableRows]="true" adds a leading chevron that toggles a panel below the row, rendered from [rowExpandTemplate]. [(expandedIds)] is two-way.

[expandAllToggle]="true" adds an expand-all chevron to the header, page-scoped like select-all. (rowExpanded) and (rowCollapsed) report each row, expand-all included; writing expandedIds yourself emits nothing.

Last event:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
