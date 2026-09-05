# Table - resizable columns

dsTableResize adds a drag handle to each header's right edge. Widths are two-way bindable via [(columnWidths)] (a Map<key, px>), seeded from any column.width.

The first resize records a width for EVERY visible column, not just the one you dragged — deliberately. Until then the untouched columns are auto-sized, so the browser redistributes whatever the dragged column gives up and columns nobody touched visibly jump. Measuring them all once, at the first grab, keeps the auto-sized geometry instead of losing it. The consequence to expect: if you persist [(columnWidths)], one drag fills the map for the whole row. That is the saved layout, not a leak — and a second drag adds nothing further.

The handle answers the keyboard, and says where it is. A drag control that only answers a pointer makes a resizable column unusable without a mouse, so the handle is focusable: Arrow keys step by 16px, PageUp/PageDown by 64px, and Home hands the column back to automatic sizing. It is a role="separator", which ARIA reads as a range widget, so while it holds focus it reports aria-valuenow, aria-valuemin and aria-valuemax in pixels — all three together, because a value announced against no bounds is read against ARIA's implicit 0–100. The maximum is the scroll viewport and it is enforced, on the pointer path as well: a column wider than the viewport can never be seen whole, and long text has its own answer here in truncate plus the clip popover.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
