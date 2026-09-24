# Bar - give the cell a width

The bar fills whatever box it is in, so the column decides how wide it is. A box sized to its content — width: 'content' on ds-table, or a shrink-to-fit flex or grid item — is sized by what its contents contribute intrinsically, and a bar that is 100% of its cell contributes nothing: one alone in such a cell comes out 0px wide. So the host carries a min-inline-size of 3rem, which --ds-bar-min-width overrides. Give it a width of your own where the bar should be a fixed size — the table above puts it in a 64px grid track.

Full API: `Bar.d.ts`. How to use the component anywhere: `Bar.prompt.md`.
