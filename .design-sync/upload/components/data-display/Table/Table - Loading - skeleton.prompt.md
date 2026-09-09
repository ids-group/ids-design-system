# Table - loading · skeleton

First-load placeholder — rows are replaced with shimmer skeletons that lock-step with every other <ds-skeleton> on the page. Use [loading]="'skeleton'" when you have no rows to show yet. [skeletonRows] sets how many shimmer rows stand in — five by default. Match it to the page size you are about to show, so the body does not resize the moment the rows land.

The same table with [skeletonRows]="3".

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
