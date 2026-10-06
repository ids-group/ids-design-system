# Buttons - color × variant

Defaults: color="primary" variant="solid". ⚠ cells work (with a dev warning) but read poorly: grey solid looks disabled; outline/ghost success/warning lack contrast; use solid/tonal there.

The text column is ⚠: it duplicates .link on <a> / <button>. Use variant="text" only for loading, fullWidth, (pressed) or icons on that look.

secondary (orange) and tertiary (violet) are independent of --primary; recolour via --secondary-h/s/l, --tertiary-h/s/l.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
