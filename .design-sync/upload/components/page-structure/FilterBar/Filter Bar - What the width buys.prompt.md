# Filter bar - what the width buys

The declared width is a contract rather than a hint: the bar sizes each slot to exactly that number, so the arithmetic that decided the filter fits is true by construction, and a filter is the same width in the panel as it was in the row — no resizing as it crosses over. A control that would rather be wider is narrowed instead of being allowed to break the row.

Crossing that boundary does destroy and re-create the view, so a control's internal state — an open dropdown, focus — does not survive a resize that collapses it. Its value does: that lives in your own signal or form control, which is why the demo above keeps every selection while you drag. The trigger carries the count as text and aria-expanded, and the panel is a focus-trapped dialog; there is exactly one copy of each filter in the accessibility tree, because the filters move rather than being rendered twice and hidden.

Full API: `FilterBar.d.ts`. How to use the component anywhere: `FilterBar.prompt.md`.
