# Table - inline editing

Columns marked editable: true (Record, Venue, Capacity here) turn into an input on double-click; Enter or blur commits, Escape cancels. The table stays data-agnostic — it emits (cellEdited)="…" with row, key, value and the consumer applies the update.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
