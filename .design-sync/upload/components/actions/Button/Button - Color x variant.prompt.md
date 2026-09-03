# Buttons - color × variant

Every color × variant combination — all of them render. Defaults are color="primary" variant="solid". Cells marked ⚠ are UX-discouraged: they work (and emit a dev-mode warning), but read poorly — grey solid looks disabled; quiet success/warning (outline/ghost) is too low-contrast — prefer solid/tonal there.

The whole text column is marked ⚠ on purpose: variant="text" is a no-chrome, underlined, link-styled button, which is exactly what the global .link class already gives any <a> / <button>. For a link-styled action prefer .link (lighter, no component) — reach for variant="text" only when you genuinely need the ds-button API on a link look (loading, fullWidth, the typed (pressed) output, leading/trailing icons). It's kept, not removed — just not the default choice.

secondary and tertiary are brand hue roles, not fixed colours — they ship distinct default hues (a warm orange, a cool violet), independent of --primary, so the three brand rows read apart out of the box. Changing --primary alone won't recolour them — a brand reskins each by overriding --secondary-h/s/l / --tertiary-h/s/l.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
