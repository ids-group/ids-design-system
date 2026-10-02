# Table - empty states

Four empty-state variants. Headers always stay, so the schema stays legible.

A single tertiary line in the [empty] slot. Use when the empty state is transient or context-obvious.

A paged table announces the empty-state text when a filter leaves no rows. Type a project that does not exist to hear it.

First run: nothing exists yet, so the CTA invites creation.

Data exists but the current filter or search excluded every row.

Network or server failure. The icon tints danger and retry is the primary action.

While loading is on (either mode) the empty state is withheld, so zero rows during a load show no message. No guard of your own is needed.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
