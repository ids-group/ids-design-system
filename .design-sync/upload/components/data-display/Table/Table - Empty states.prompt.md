# Table - empty states

Four canonical row-empty variants. Headers always stay so the schema is legible.

A single tertiary line in the [empty] slot. Use when the empty state is transient or context-obvious.

First-run variant — nothing exists yet, so the CTA invites creation.

Data exists but the current filter or search excluded every row.

Network or server failure. Icon tints danger; retry is the only sensible primary action.

The empty state is a claim about the data — “there are none” — so the table withholds it until it has finished asking. Both loading modes suppress it: the same table with [loading]="'overlay'" and zero rows shows its spinner and no message, where it used to paint “No records match your filters” underneath one. You do not need a guard of your own — a consumer audit found 9 of 14 overlay-loading tables shipping that sentence during a load, because branching failure-vs-empty looks complete while saying nothing about loading.

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
