# Field Message - messages: error, warning, hint

A field takes all three and shows exactly ONE, highest first: error → validation errors → warning → hint. Only one line ever renders, so the field's height never depends on how many of them you bound. All three fields below carry the same hint; the second adds a warning and the third adds both.

The control paints the state too, not only the line under it. An error takes a red border AND a tinted fill because it blocks submission; a warning and a success take the border alone, so an error still reads as the loudest thing in a form holding all three. One rule drives all nine bordered fields, off a data-field-state attribute on the host — style against that attribute rather than a class if you need to extend it.

Full API: `FieldMessage.d.ts`. How to use the component anywhere: `FieldMessage.prompt.md`. This component is not exported by the package, so it has neither.
