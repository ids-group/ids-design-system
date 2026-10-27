# Icon button - toggle

[selected] renders the pressed state and sets aria-pressed, "false" when off; an icon button with no [selected] is no toggle and has none. As a menu trigger, bind ariaHasPopup, [ariaExpanded] and [ariaControls], and hand controlRef() to the overlay it opens; host attributes land on a non-focusable wrapper.

Full API: `IconButton.d.ts`. How to use the component anywhere: `IconButton.prompt.md`.
