# Field group - sizes, error and full width

size is the field family's scale, so a group lines up with a plain field beside it. invalid colours the whole box: a single segment cannot be in error on its own, because the border is not its own.

Do not give a grouped control a label or a hint: its message row would break the glued line, so both are suppressed. A group-level label is not built yet — put one above the group with your own markup until it is.

Full API: `FieldGroup.d.ts`. How to use the component anywhere: `FieldGroup.prompt.md`.
