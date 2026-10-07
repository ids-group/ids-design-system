# Sparkline - default

One svg, no container to measure: cheap in a thousand-row table. A tooltip shows on hover. Decorative unless it gets a label. With a label and tooltip on (default) it is a tab stop: focus opens the tooltip on the last reading; Left, Right, Home and End move it.

Sized by --ds-sparkline-width / --ds-sparkline-height (80 x 24px); line styled by --ds-sparkline-line-color (series 1), --ds-sparkline-line-width (1.5px) and --ds-sparkline-dot-radius (2.5px).

Full API: `Sparkline.d.ts`. How to use the component anywhere: `Sparkline.prompt.md`.
