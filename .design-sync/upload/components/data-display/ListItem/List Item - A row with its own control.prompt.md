# List Item - a row with its own control

[leading] and [trailing] sit outside the row's button, so a row can carry its own controls (a bulk-action checkbox) and still be the target that selects - two independent targets.

A checkbox inside a <button> would be invalid HTML, bubble into activated and lose its checked state for screen readers. The host is role="list", not listbox: a listbox option cannot hold interactive content.

Full API: `ListItem.d.ts`. How to use the component anywhere: `ListItem.prompt.md`.
