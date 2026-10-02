# Input - with icon · prefix · suffix

Clicking anywhere in the frame — a leading icon, a prefix/suffix add-on, or the padding — focuses the input; only nested controls (a projected button, the clear ✕, the password toggle) keep their own click. Same behaviour on ds-search and ds-textarea. Put dsFieldClickFocus on your own field wrapper and a click anywhere in it focuses the input or textarea inside.

Full API: `Input.d.ts`. How to use the component anywhere: `Input.prompt.md`.
