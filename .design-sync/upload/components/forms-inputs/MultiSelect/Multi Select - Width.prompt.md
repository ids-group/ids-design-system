# Multi-select - width

Default width="fill" stretches to the container and pins the panel to the trigger. width="content" hugs the trigger's own content and takes that width as the panel's floor instead — so a short trigger no longer forces a panel too narrow to read. --ds-dropdown-panel-min-width and --ds-dropdown-panel-max-width bound the panel in that mode. An option label too long for the panel is cut with an ellipsis and shows in full in a tooltip on hover; one that fits shows none.

Full API: `MultiSelect.d.ts`. How to use the component anywhere: `MultiSelect.prompt.md`.
