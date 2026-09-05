# Table - column picker · reorder

The header Columns button opens a panel that toggles visibility for hideable: true columns (two-way [(hiddenKeys)]; hidden: true is the initial state, the last visible column is locked). With dsTableColumns [reorderableColumns]="true" each row gains a drag handle and up/down buttons — order is two-way bindable via [(columnOrder)], and Reset to default clears both.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
