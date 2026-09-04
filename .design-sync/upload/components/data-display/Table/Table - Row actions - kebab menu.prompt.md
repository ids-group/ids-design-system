# Table - row actions · kebab menu

[rowActions] renders a trailing ⋮ column — the button opens a menu of the configured items and (rowActionSelected) reports the chosen action together with its row. A per-row disabled predicate greys items out (here Delete is blocked for completed records), and disabledReason puts the WHY on the item's second line — a greyed item that does not say why is the same dead control as a greyed button. Where an action does not APPLY to a row, use hidden rather than disabled: greying leaves every row with a permanently dead half, which is what happens when one status offers Edit + Launch and another Revert + Delete. Relaunch below is hidden except on completed records. If every item of a row is hidden the kebab is not rendered at all, so a row with nothing applicable does not open an empty menu. The kebab stops propagation, so on a [rowInteractive] table a menu click never fires (rowClicked). A hand-built action column with no visible header should give its TableColumn an srLabel so screen-reader users still hear a column name.

Row clicked: · Action:

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
