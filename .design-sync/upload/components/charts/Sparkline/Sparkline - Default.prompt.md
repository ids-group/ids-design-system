# Sparkline - default

One svg per instance, with no container to measure, so a table of a thousand rows stays cheap. It is decorative unless it gets a label: beside a value that already says the number, the line only adds the shape. With a label and tooltip on (the default) it is also a tab stop: focus opens the tooltip on the last reading, Left and Right arrows, Home and End move it. Sized by --ds-sparkline-width / --ds-sparkline-height, 80 x 24px by default; the line takes --ds-sparkline-line-color (series 1), --ds-sparkline-line-width (1.5px) and --ds-sparkline-dot-radius (2.5px).

Full API: `Sparkline.d.ts`. How to use the component anywhere: `Sparkline.prompt.md`.
