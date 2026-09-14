# Field group - saying what is wrong

The group takes the same pair every field takes. error is a string: it turns the state on and carries the text, in one message under the whole row rather than one per segment. invalid is the flag for when the text lives elsewhere — a form-level summary — and hint uses the same row.

Every segment carries aria-invalid while the group is in error, and every segment points at the one message through aria-describedby — a reader who tabs straight to the second segment hears the error there too, which is the whole reason the state is not announced on the group element itself.

Do not give a grouped control a label or a hint: its message row would break the glued line, so both are suppressed. A group-level label is not built yet — put one above the group with your own markup until it is.

Full API: `FieldGroup.d.ts`. How to use the component anywhere: `FieldGroup.prompt.md`.
