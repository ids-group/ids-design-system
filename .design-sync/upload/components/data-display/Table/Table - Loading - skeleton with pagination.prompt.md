# Table - loading · skeleton with pagination

The footer keeps its height while [loading]="'skeleton'" is on. Its buttons and the page-size dropdown disable, and the pager reports aria-busy, and the range label gives way to a <ds-skeleton> placeholder, so the pager never shows a count for rows that are not the ones on screen, and can no longer fire a page change while there is nothing behind it.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
