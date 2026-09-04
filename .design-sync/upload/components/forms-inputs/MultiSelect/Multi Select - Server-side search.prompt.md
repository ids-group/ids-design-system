# Multi-select - server-side search

filterChange reports what was typed and filterWith="none" stops the panel narrowing the list a second time — the options you hand back are the ones rendered. loading replaces the empty row with a spinner, because "No matches" during a request in flight is a lie. The panel also emits opened, which is where the first fetch belongs.

Typed:

Full API: `MultiSelect.d.ts`. How to use the component anywhere: `MultiSelect.prompt.md`.
