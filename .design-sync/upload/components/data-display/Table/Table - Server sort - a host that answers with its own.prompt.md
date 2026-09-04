# Table - server sort · a host that answers with its own default

The shape a server-paged list actually has: [sortKey] and [sortDir] are bound ONE-WAY from the host's own state (usually a computed over the URL), and (sortChange) is where it hears about a click. This host's default is Owner descending, and it answers a cleared sort by returning to it — the case that used to leave the header marking nothing over sorted rows.

Third click on the same column clears it, so watch the header: after the clear the highlight must land back on Owner ▼. Host state: ·

Full API: `Table.d.ts`. How to use the component anywhere: `Table.prompt.md`.
