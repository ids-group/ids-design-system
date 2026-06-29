# Themes — palette + role assignments

Colour lives in two files here: a **palette** (defines the concrete colours) and a **theme** (assigns them to semantic roles). The geometry/component layer is separate (`../styles/_tokens.scss`).

## Architecture: three tiers

| Tier                                   | Lives in                                            | Examples                                                                                                                                                                                                                                      | Consumers              |
| -------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Tier 1 — Palette** (defines colours) | `themes/<name>/_palette.scss`                       | `--blue-600`, `--cool-gray-0`, `--brand-gray-500`, `--red-500`, `--blue-h/s/l`, `--shadow-tint-h/s/l`                                                                                                                                         | Only the theme file    |
| **Tier 2 — Theme** (sets roles)        | `themes/<name>/_theme.scss`                         | `--primary: var(--blue-600)`, `--text-primary`, `--surface-default`, `--success`, `--focus-ring`, `--primary-h: var(--blue-h)`, font families; the `--neutral-*` family slot (cool-gray by default, brand-gray via `[data-neutrals="brand"]`) | Components             |
| **Tier 3 — Component / scale**         | `styles/_tokens.scss` and inside `*.component.scss` | `--space-*`, `--radius-*`, `--ds-button-bg-color`, `--duration-fast`, `--layer-modal`                                                                                                                                                         | Components (their own) |

**Hard rule:** components NEVER consume Tier 1 palette directly. If you write `var(--blue-600)` inside `button.component.scss`, that's a bug — introduce or reuse a Tier 2 role.

**Why split palette from theme:** the palette says _what colours exist_; the theme says _what each role is_. A dark theme ships a different palette (different ramp values) + a theme map that re-points roles. Swapping either re-skins the system without touching components.

## Available palette + theme

- **`light/_palette.scss`** — Blue + slate ramps (the concrete colours).
- **`light/_theme.scss`** — Light role map onto the default palette. Both are bundled into `styles/ds.scss` (palette → theme → tokens) so `@use 'styles/ds';` works out of the box.
- **`dark/_palette.scss` + `dark/_theme.scss`** — Dark skin, also bundled into `styles/ds.scss`. Unlike a standalone swap, dark emits **scoped overrides** layered on the default `:root` and activates at runtime — see **Dark theme** below.

Future (each a `themes/<name>/` folder with `_palette.scss` + `_theme.scss`):

- `themes/high-contrast/` — A11y boost.

## Dark theme

`themes/dark/` ships in the default bundle (`@use 'styles/ds'`). Activation:

- `<html data-theme="dark">` — forced dark
- `<html data-theme="light">` — forced light
- attribute unset — follows the OS via `@media (prefers-color-scheme: dark)`

Dark overrides the `--neutral-*` ramp (so neutral-derived roles recompute through the cascade) plus a small set of role exceptions (tint surfaces, on-tint text, scrim, focus-halo alpha). On-fill text uses theme-stable `--static-white` / `--static-ink` so it doesn't flip with the neutrals. `dark/_palette.scss` and `dark/_theme.scss` expose **mixins** applied under the activation selectors — they are NOT standalone `:root` swaps, so don't `@use` them on their own.

**Known limitation:** `data-neutrals="brand"` + dark — dark overrides `--neutral-*` directly and wins (equal specificity, later in source), so the brand-gray hue-tint is dropped in dark mode (renders correctly, just not brand-tinted). A dark brand-gray ramp is a future follow-up.

## How a consumer picks a theme

### Option A — out-of-the-box default

```scss
// Consumer styles.scss
@use 'styles/ds'; // bundles default palette + theme + tokens + reset + ...
```

### Option B — explicit theme choice

```scss
// Consumer styles.scss
@use 'themes/<name>/palette'; // pick a non-default STANDALONE theme: palette …
@use 'themes/<name>/theme'; // … then its role map (NOTE: dark is a scoped overlay, not this)
@use 'styles/tokens';
@use 'styles/reset';
@use 'styles/typography';
@use 'styles/scrollbar';
@use 'styles/icon-base';
@use 'styles/dropdown-overlay';
```

Palette + theme must come BEFORE `tokens` so role aliases resolve.

### Option C — brand layer on top of default theme

```scss
// Consumer styles.scss
@use 'styles/ds'; // default theme + DS
@use './app/styles/brand-manage-my'; // overrides palette/roles via [data-brand]
```

This is the mm-broker pattern: load DS (default theme included), then overlay a brand at a more-specific selector (`[data-brand="manage-my"]`).

## Brand vs theme — what's the difference?

- **Theme** swaps the entire Tier 1 palette. Affects EVERY semantic role downstream.
- **Brand** is a thin overlay scoped via attribute selector (`[data-brand="X"]`). Usually overrides a smaller subset (key palette stops + maybe a few roles).

Same mechanism (CSS custom properties + cascade), different scope.

## Adding a new theme

1. Create a `themes/<name>/` folder with `_palette.scss` (ramps + HSL channels) and `_theme.scss` (role map), mirroring `themes/light/`.
2. Optionally add it to `styles/ds.scss` if it should be a default-bundled option.
3. Or let consumers `@use 'themes/<name>/palette'; @use 'themes/<name>/theme';` directly.

Components don't need any change — they consume semantic roles which automatically pick up the new palette.

## Adding a new brand override

1. Create `<consumer-app>/src/app/styles/_brand-X.scss`.
2. Open with `[data-brand="X"] { ... }`.
3. Override:
   - **Palette HSL channels** (`--blue-h/s/l`) — for focus rings and halos that compose hsla() from channels (the theme bridges `--primary-h: var(--blue-h)`).
   - **Blue ramp** (`--blue-50..900`) — the simplest re-skin lever. All brand-derived roles (`--primary`, `--primary-strong`, `--primary-subtitle`, `--primary-muted-strong`, `--text-link`, `--surface-tint`) retint automatically from it. For a fully calibrated brand you MAY also set the `--primary-*` roles directly to hand-picked hex (when ramp derivation doesn't hit the exact stop) — see `_brand-manage-my.scss`. Leave `--primary-hover`/`--primary-pressed` to the DS `color-mix()` derivation.
   - Other roles you want to retint independently (surfaces, borders, text, success/danger ramps, secondary, etc.).
4. Apply via `<html data-brand="X">` on the host app.

## Rules summary

- Components NEVER reference `var(--blue-600)` / `var(--neutral-200)` / `var(--red-500)` directly. Use a Tier 2 role (`--primary`, `--text-secondary`) or a Tier 3 component token.
- Themes own palette. Brands overlay on top via `[data-brand]`.
- Theme switching = swap one `@use 'themes/X'`. No component changes.
- `--primary-hover`, `--primary-pressed` are auto-derived via `color-mix()`. Don't override unless brand needs non-derived hover.
- Audit guard (suggested pre-commit hook):
  ```bash
  grep -nE 'var\(--(violet|neutral|red|green|yellow|blue|orange|cyan|magenta)-[0-9]+\)' \
    prototype/ds/src/lib/components/**/*.scss && exit 1
  ```
