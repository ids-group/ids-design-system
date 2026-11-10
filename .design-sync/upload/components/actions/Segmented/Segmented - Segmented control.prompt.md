# Segmented & button group - segmented control

Options take optional icon and disabled. One tab stop; arrow keys and Home/End move the selection, skipping disabled segments.

A choice inside a track: the track and its segments draw no border, and the selected segment is a solid --segmented-selected fill, at least 3:1 against the track (--accent in light, --accent-strong-overlay on dark), its label in --segmented-selected-on. A standalone control such as ds-toggle-button draws a --border-field boundary instead.

A form control: binds [formControl] and ngModel; label, hint and error render like any field.

Full API: `Segmented.d.ts`. How to use the component anywhere: `Segmented.prompt.md`.
