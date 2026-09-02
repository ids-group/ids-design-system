# Table

Data table with the full DS structure: horizontal scroll-wrap, sticky header (on by default), sortable headers with direction icons, selection checkboxes + bulk bar, expandable rows, skeleton/overlay loading, zebra/compact/bordered variants. Generic over the row type — rows MUST have a string `id`.

- `data` + `columns` are required. `TableColumn`: `{ key, label, sortable?, width?, align?, truncate?, cell?, editable?, hideable?, hidden?, filterable?, filter? }`. `cell: (row) => string` derives text values; `align: 'right'` gets the numeric style.
- Custom cell content: `cellTemplates={{ status: (row) => <Badge tone="success">{row.status}</Badge> }}` — keyed by column key (React stand-in for Angular's `dsCellTemplate`).
- Sorting: `sortKey` + `sortDir` (`'asc' | 'desc' | null`) render the sorted indicator; controlled with `onSortChange`, else internal state seeded from them. Add `clientSort` to have the table sort `data` itself.
- Selection: `selectable` + `selectedIds` (`Set<string>`) / `onSelectedIdsChange`. The bulk bar (with `bulkActions` content) shows while some — not all — displayed rows are selected.
- Expandable rows: `expandableRows` + `expandedIds` / `onExpandedIdsChange` + `renderRowExpand={(row) => <Panel/>}` — panel spans the full colspan under its row.
- Loading: `loading="skeleton"` (shimmer rows, count via `skeletonRows`) or `loading="overlay"` (scrim over existing rows).
- Other visual props: `bordered` (standalone in a padded card; leave off inside `<Card padding="none">`), `zebra`, `density="compact"`, `maxHeight="320px"` (scrolling body), `stickyFirstColumn`, `activeRowId`, `rowInteractive` (+ `onRowClicked`), `caption` (a11y), `filterQuery`, `columnFilters`, `hiddenKeys`, `columnOrder`, `columnWidths`.
- Inline editing: mark a column `editable`, double-click the cell, commit via Enter/blur → `onCellEdited({ row, key, value })`.
- Pagination: set `pageSize={5}` to slice rows client-side and render the `Pagination` footer (`page` / `onPageChange` for the 1-based page, `pageSizeOptions` for the size dropdown; a size change resets to page 1). `pageSize` unset/`null` (default) renders every row with no footer. Select-all then scopes to the current page.
- Not ported from Angular: the column-picker / set-filter / row-action popover menus (their trigger buttons render for structural parity; `rowActions` draws the kebab column only) and CSV export.
- The table is WIDE — give it room (full-width layout or its own row).

```tsx
<Table
  caption="Active shipments"
  data={shipments}
  columns={[
    { key: 'ref', label: 'Reference', sortable: true },
    { key: 'destination', label: 'Destination' },
    { key: 'weight', label: 'Weight (kg)', align: 'right', sortable: true },
    { key: 'status', label: 'Status' },
  ]}
  cellTemplates={{ status: (row) => <Badge>{row.status}</Badge> }}
  selectable
  sortKey="ref"
  sortDir="asc"
  clientSort
/>
```
