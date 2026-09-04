# Table - persisted layout & export

[persistLayout]="true" with a storageKey round-trips the column order, widths and hidden set through localStorage, so reorder a column or hide one, reload the page, and it stays. Without a key nothing is stored — two tables would otherwise overwrite each other. [exportButton]="true" renders the CSV button; a server-paged table passes [exportFetcher] so the export covers the whole set instead of the page it holds.

On a touch device the same table works differently, and deliberately. The drag handle paints its line on :hover and :focus-visible, neither of which a coarse pointer produces — so it was an invisible 8px strip at each header's right edge that still swallowed the horizontal swipe used to scroll the table. It now stands down, and width moves into the column panel: every row gets − / + / Fit alongside its visibility and order controls, and the panel itself opens as a ds-bottom-sheet instead of a popover. The steps are the handle's own keyboard steps, so all three routes — drag, arrows, buttons — change width by the same amount. The buttons show on desktop too; there the handle stays the primary way.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
