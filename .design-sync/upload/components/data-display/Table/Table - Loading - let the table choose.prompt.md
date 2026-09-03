# Table - loading · let the table choose

[loading]="true" resolves the two above by the row count: skeleton while there is nothing on screen, overlay once there is. Prefer it. Which treatment is right is not a preference — replacing visible rows with placeholders throws away what the reader is looking at, and dimming an empty card announces nothing about what is coming — and the table is the only place that holds both halves of the condition. Every list screen was otherwise writing the same items().length > 0? 'overlay': 'skeleton' line; one consumer feature had three copies of it.

Both tables below are [loading]="true". They differ only in whether they have rows.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
