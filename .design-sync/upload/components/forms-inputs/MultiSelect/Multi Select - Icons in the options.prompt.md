# Multi-select - icons in the options

An option carries an optional icon, rendered before its label at 16px. Same field and same markup as ds-select and ds-autocomplete — all three read one DsOption shape, so a field added for one picker is not missing from the other two. Use it for a set the reader recognises by glyph, like a priority scale; it is decoration for anything else, and an icon per row costs scanning speed.

The chips stay text-only. A glyph inside a chip eats the width the label needs, and the chips are already the part of the trigger that runs out of room — maxVisibleChips exists for exactly that.

Full API: `MultiSelect.d.ts`. How to use the component anywhere: `MultiSelect.prompt.md`.
