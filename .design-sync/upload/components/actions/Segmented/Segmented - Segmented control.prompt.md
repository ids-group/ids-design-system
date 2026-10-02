# Segmented & button group - segmented control

Binds to a signal; the selected value is reflected below the control. Each option takes an optional icon and disabled. Arrow keys and Home/End move the selection and skip disabled segments; the group is one tab stop.

It is a form control: [formControl] and ngModel bind, and label, hint and error render like any field.

joined drops the padded track: segments share edges, borders collapse into one hairline and only the outer ends round - the shape for a row of filter chips. It needs --ds-segmented-segment-border set, because the shared edge is that border.

Full API: `Segmented.d.ts`. How to use the component anywhere: `Segmented.prompt.md`.
