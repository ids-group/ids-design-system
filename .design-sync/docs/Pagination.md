---
category: Navigation
---
Pager (`ds-pagination`) — "Showing X–Y of Z" range label, previous/next arrows, windowed page buttons and a page-size dropdown, in one row. Page count derives from `total / pageSize`; you never pass a page count directly.

- `total` (required) is the ITEM count, not the page count. `currentPage` is 1-based (default 1), `pageSize` defaults to 10.
- Controlled when callbacks are provided: `onCurrentPageChange(page)` fires on any page change — including the automatic reset to page 1 after a size change — and `onPageSizeChange(size)` on dropdown picks. Omit the callbacks for self-managed state.
- Page window: ≤7 pages shows all; otherwise `1 … current−1 current current+1 … last` with ellipses only where pages are hidden.
- `pageSizeOptions` defaults to `[10, 25, 50, 100]`; a `pageSize` not in the list is merged in sorted. `showLabel={false}` hides the range label.
- The size dropdown's open listbox renders INLINE (no portal) and pushes content below it — fine for pickers at the bottom of tables.
- `sizeSelectOpen` (binding-only, default false) seeds the size dropdown open — for static previews/screenshots; it still toggles on click.

```tsx
<Pagination total={347} currentPage={page} onCurrentPageChange={setPage} />
```
