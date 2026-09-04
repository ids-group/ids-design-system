# Checkbox - a caption with markup in it

[label] stays the documented API and is what you want almost always. When the caption needs a link or emphasis in it, project the caption instead — the natural markup now works rather than rendering nothing. The two are exclusive: a [label] wins and the projected content is ignored. Note that the required asterisk comes with [label] only; a projected caption owns its own marker, since the DS cannot know where in your markup it belongs. The same applies to ds-switch and ds-radio.

Full API: `Checkbox.d.ts`. How to use the component anywhere: `Checkbox.prompt.md`.
