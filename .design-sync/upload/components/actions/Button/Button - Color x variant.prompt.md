# Buttons - color × variant

Every color × variant combination — all of them render. Defaults are color="primary" variant="solid". Cells marked ⚠ are UX-discouraged: they work (and emit a dev-mode warning), but read poorly — grey solid looks disabled; quiet success/warning (outline/ghost) is too low-contrast — prefer solid/tonal there.

The whole text column is ⚠: variant="text" is the link look the global .link class already gives any <a> / <button>. Prefer .link; use variant="text" only when you need the ds-button API on that look (loading, fullWidth, (pressed), icons).

secondary and tertiary are brand roles with their own default hues (warm orange, cool violet), independent of --primary; recolour them with --secondary-h/s/l and --tertiary-h/s/l.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
