# Autocomplete - icons in the options

An option carries an optional icon, rendered before its label at 16px in the panel rows. Same field and same markup as ds-select and ds-multi-select: all three read one DsOption shape. Use it for a set the reader recognises by glyph, like a channel or a priority scale; an icon per row costs scanning speed everywhere else.

An option can also carry disabled — the row greys out, says aria-disabled, refuses the click, and the arrow keys step OVER it rather than parking on a row that Enter would ignore. Same field and same behaviour as ds-select and ds-multi-select.

Only ds-select repeats the icon in its trigger, because its trigger is a button showing one label and has room for it. Here the trigger is the text input the reader types into, and its leading slot belongs to [dsAutocompletePrefix] — the DS will not put a glyph in it uninvited.

Full API: `Autocomplete.d.ts`. How to use the component anywhere: `Autocomplete.prompt.md`.
