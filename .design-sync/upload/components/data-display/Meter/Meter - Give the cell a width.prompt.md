# Meter - give the cell a width

The meter fills whatever box it is in, so the column decides how wide the bar is. A box sized to its content — width: 'content' on ds-table, or a shrink-to-fit flex or grid item — is sized by what its contents contribute intrinsically, and a bar that is 100% of its cell contributes nothing: a meter alone in such a cell comes out 0px wide. So the host carries a min-inline-size of 3rem, which --ds-meter-min-width overrides. Give it a width of your own where the bar should be a fixed size — the table above puts it in a 64px grid track.

Full API: `Meter.d.ts`. How to use the component anywhere: `Meter.prompt.md`.
