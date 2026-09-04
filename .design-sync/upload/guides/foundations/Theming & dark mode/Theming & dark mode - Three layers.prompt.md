# Theming & dark mode - three layers

Base palette (themes/_base-palette) — theme-independent primitives at :root: hue ramps + HSL channels, --static-ink (never flips), fonts. Theme / roles (themes/_semantic + themes/<t>/) — the semantic role map (--primary, --surface-*, --text-*, --neutral-*, --focus-ring). Light at :root, dark at :root[data-theme='dark']. Component / scale (styles/_tokens, *.component.scss) — --space-*, --radius-*, --ds-*, motion. Theme-independent.

Hard rule: components never read base-palette primitives (--blue-600) directly — only Tier-2 roles (--primary, --text-secondary) or component tokens.
