# Table - clickable rows · drawer detail

[rowInteractive]="true" turns every row into a keyboard-operable control — pointer cursor, hover and pressed tints (passive tables render none), focus ring, Enter/Space — and (rowClicked) emits the row. The classic master-detail wiring: clicking a row opens a ds-drawer with the record, and [activeRowId] keeps that row highlighted (plus aria-current) while the drawer is open. Controls inside cells (checkboxes, menus) stop propagation, so they never trigger the row click — and neither does finishing a text selection, so cell values stay copyable by mouse.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
