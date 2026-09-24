# Segmented & button group - segmented control

Binds to a signal; the selected value is reflected below the control.

joined drops the padded track and lets the segments share their edges: the borders collapse into one hairline and only the outer ends round, which is the shape a row of filter chips wants. It needs --ds-segmented-segment-border set, because the shared edge IS that border - without one there is nothing to collapse.

Full API: `Segmented.d.ts`. How to use the component anywhere: `Segmented.prompt.md`.
