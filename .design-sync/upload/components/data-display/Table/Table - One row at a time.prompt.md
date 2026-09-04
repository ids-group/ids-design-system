# Table - one row at a time

expandMode="single" closes the open row when another expander is clicked, so the table never grows past one panel. It is enforced on interaction, not on the binding: an expandedIds set you seed with several ids is left as passed — it is your model to write — and dev mode says so.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
