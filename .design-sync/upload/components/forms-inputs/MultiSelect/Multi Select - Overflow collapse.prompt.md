# Multi-select - overflow collapse

maxVisibleChips defaults to "fit": the trigger keeps as many chips as it is wide and collapses the rest into a "+N more" pill, re-splitting on resize. A number is a CEILING — at most that many, and fewer when the trigger is too narrow to hold them beside the count and still fit what comes after; it measures for the same reason the default does. Only maxVisibleChips="all" skips measuring: it shows every chip and lets the trigger grow a line per selection. Same input and same default on ds-autocomplete, so the two multi-value pickers do not diverge.

Full API: `MultiSelect.d.ts`. How to use the component anywhere: `MultiSelect.prompt.md`.
