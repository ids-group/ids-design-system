# Filter bar - wired to a table

Search feeds the ds-table client filter ([filterQuery]: case-insensitive substring over filterable columns, or all if none is marked). The status facet filters app-side; tags mirror active filters and clear one by one. No match shows the table's [empty] slot; project a filter-specific message. With a real backend, skip [filterQuery] and set [loading]="'overlay'" while the query runs.
