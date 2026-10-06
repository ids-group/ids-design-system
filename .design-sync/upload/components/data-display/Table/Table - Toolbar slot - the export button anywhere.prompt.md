# Table - toolbar slot · the export button anywhere

[toolbar]: a row above the table for search (here [filterQuery]), filter, refresh. Several controls flex-wrap, 8px gap; one element owns its layout. Hidden when empty and dsTableExport is off. Page filters go in ds-filter-bar.

Public runExport(), exportCsv() and exporting() give any button the full export flow. [dsTableExport]="false" hides only the built-in button.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
