# Filter bar - wired to a table

The same bar driving a live ds-table — the search box feeds the table's built-in client filter ([filterQuery], case-insensitive substring over the filterable columns, or every column when none is marked), the status facet narrows the data app-side, applied tags mirror the active filters and clear individually. When nothing matches, the table shows its [empty] slot; project a filter-specific message there. Against a real backend, skip [filterQuery] and flip [loading]="'overlay'" while the query runs instead.
