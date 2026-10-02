# Table - toolbar slot · the export button anywhere

The [toolbar] slot is a row above the table for controls that act on it: a search box (here bound to [filterQuery]), a status filter, a refresh. Several projected controls are laid out flex, wrapping, 8px gap; a single projected element owns its own layout.

The row disappears when the slot is empty and dsTableExport is off. Page-level filters still belong in a ds-filter-bar.

runExport(), exportCsv() and exporting() are public, so a button anywhere runs the same fetch, download, in-flight state and announcement. Keep [dsTableExport]="false" on the table to hide the built-in button but keep the export.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
