# Multi-select - group headings, and why an option is off

dsGroupLabelTemplate fills a group's heading — the element itself stays ours, so the id the group is named by cannot be detached from it. An option's disabledReason reaches the row as aria-describedby: the row already looks disabled, the sentence is for whoever cannot see that. Open the panel and read the "On leave" rows with a screen reader.

Full API: `MultiSelect.d.ts`. How to use the component anywhere: `MultiSelect.prompt.md`.
