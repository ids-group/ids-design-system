# List Item - a row with its own control

[leading] and [trailing] sit outside the row's button, so a row can hold its own control (a bulk-action checkbox) and still select.

A checkbox inside a <button> is invalid HTML, bubbles into activated and loses its checked state for screen readers. The host is role="list", not listbox, whose options cannot hold interactive content.

Full API: `ListItem.d.ts`. How to use the component anywhere: `ListItem.prompt.md`.
