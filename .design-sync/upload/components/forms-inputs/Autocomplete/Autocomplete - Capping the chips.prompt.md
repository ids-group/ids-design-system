# Autocomplete - capping the chips

The trigger stays one line by default. maxVisibleChips defaults to "fit" — it measures and keeps as many chips as the trigger is wide, with the rest behind "+N more", re-split whenever the trigger resizes. Left to grow, a multi-value trigger gains a line per selection and pushes the rest of the form down the page. Same input and same default on ds-multi-select, so the two multi-value pickers do not diverge. Backspace still removes the last SELECTED chip, not the last visible one.

The other two modes are one binding away. A number is a CEILING — at most that many, and fewer when the trigger is too narrow to hold them beside the count and the typing area. It measures for the same reason the default does: honouring the count on a phone pushed the text input onto a second line, which is the growth the cap exists to prevent. maxVisibleChips="all" is the one mode that does not measure — it shows every chip and lets the trigger grow.

Drag the handle to watch the default split move with the width.

Full API: `Autocomplete.d.ts`. How to use the component anywhere: `Autocomplete.prompt.md`.
