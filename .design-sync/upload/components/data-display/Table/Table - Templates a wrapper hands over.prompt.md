# Table - templates a wrapper hands over

A component that wraps this table cannot rely on the projected dsCellTemplate and [empty] slots: content arriving through the wrapper's own <ng-content> is invisible to the table's content query, so it never lands. Both have an input twin for exactly that case — [cellTemplateMap] takes a column key to template map and overrides a projected template of the same key, and [emptyTemplate] stands in for the slot. This table is empty on purpose, so the handed-over empty state is what shows; give it rows and the outcome column renders through the handed-over cell template.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
