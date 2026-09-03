# Table - virtual scroll

10 000 rows. With [virtualScroll]="true" only the rows in view are in the DOM, padded above and below by two spacer rows that stand in for the rest — so the scrollbar is the full length of the data and the row count in the DOM stays flat. It needs maxHeight, because a bounded scroller is the viewport it windows against.

Every row must be exactly virtualRowSize tall — that number is the only thing telling the maths where a row starts, so one row that grows puts every offset below it out by the difference. Virtual mode therefore fixes the row height from that same input, forces table-layout: fixed (auto layout re-measures against whichever rows happen to be rendered, and the columns twitch as you scroll) and keeps cells to one line. Row EXPANSION is suppressed for the same reason, with a dev warning; sorting, selection, sticky header and sticky first column all keep working.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
