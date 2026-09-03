# Table - expandable rows

[expandableRows]="true" adds a leading chevron column. Clicking it toggles an inline panel below the row. Pass a template via [rowExpandTemplate] to control the panel content. Expanded ids are two-way bindable via [(expandedIds)].

[expandAllToggle]="true" puts an expand-all chevron in the column header — page-scoped when paginating, the same way select-all is. (rowExpanded) and (rowCollapsed) report each row as it opens or closes, expand-all included, which is where panel content gets lazy-loaded. Writing expandedIds yourself stays silent — you already know.

Last event:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
