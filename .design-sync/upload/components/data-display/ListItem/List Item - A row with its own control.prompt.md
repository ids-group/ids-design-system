# List Item - a row with its own control

[leading] and [trailing] sit OUTSIDE the row's button, so a row can carry its own controls and still be the thing that selects. That is the master–detail shape: a checkbox per row for a bulk action, the row itself choosing what the detail pane shows. Two independent targets, never one.

This is why the row is not a single <button>: a checkbox nested in one is invalid HTML, its click would bubble into activated, and a screen reader would fold it into the button's name and never announce its checked state. Note it is a role="list" and NOT a listbox — the ARIA spec says a listbox option cannot hold interactive content at all.

Full API: `ListItem.d.ts`. How to use the component anywhere: `ListItem.prompt.md`.
