# Table - the same thing two-way, when the host has no opinion to defend

sortKey and sortDirection each have a matching Change output, so [(sortKey)] and [(sortDirection)] work: the table writes the host's state and the host reads it back, with no handler to write. Below is the demo above with the handler deleted and nothing else changed.

What you give up is the third click. Clearing a sort sets sortDirection to null and the rows come back unsorted, because there is nowhere left to say "then fall back to Owner descending". Prefer two-way where any sort state is equally valid — a saved view, a URL you round-trip — and the one-way pair plus (sortChange) where the host owns a default it has to be able to restore. Host state: ·

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
