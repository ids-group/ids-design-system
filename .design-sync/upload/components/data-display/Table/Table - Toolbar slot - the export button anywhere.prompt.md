# Table - toolbar slot · the export button anywhere

A row above the table, filled through one [toolbar] slot, for controls that act on THIS table: a search box, a status filter, a refresh. Project a handful of controls and the row lays them out — flex, wrap, 8px gap — so the ordinary case needs no CSS of yours. Project one element of your own instead and the layout is entirely yours; the row's flex then has a single child and stays out of the way. It disappears when nothing filled it and dsTableExport is off, so a table that uses neither is unchanged. Filters that belong to the PAGE still belong in a ds-filter-bar above it — the slot is for the ones that would otherwise read as page furniture one card away from the rows they narrow.

One slot rather than a start/end pair, and that was a correction. The fork this replaces had exactly one, its right-hand side being the component's own buttons — and all four screens that used it projected a container of their own anyway, each writing the same four declarations. A second slot would have been API nobody had asked for, and the layout it promised to own is one the consumer writes regardless when their case differs.

The export button does not have to live there either. runExport() is public and so are exporting() and exportStatus(), so a button in a page header or a filter bar runs the same path — the exportFetcher call, the download, the in-flight state and the live-region announcement. Leave dsTableExport off and drive it yourself.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
