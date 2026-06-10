# Themes — palette + role assignments

Colour lives in two files here: a **palette** (defines the concrete colours) and a **theme** (assigns them to semantic roles). The geometry/component layer is separate (`../styles/_tokens.scss`).

## Architecture: three tiers

| Tier | Lives in | Examples | Consumers |
|---|---|---|---|
| **Tier 1 — Palette** (defines colours) | `themes/<name>/_palette.scss` | `--blue-600`, `--neutral-0`, `--red-500`, `--blue-h/s/l`, `--shadow-tint-h/s/l` | Only the theme file |
| **Tier 2 — Theme** (sets roles) | `themes/<name>/_theme.scss` | `--primary: var(--blue-600)`, `--text-primary`, `--surface-default`, `--success`, `--focus-ring`, `--primary-h: var(--blue-h)`, font families | Components |
| **Tier 3 — Component / scale** | `styles/_tokens.scss` and inside `*.component.scss` | `--space-*`, `--radius-*`, `--ds-button-bg`, `--duration-fast`, `--layer-modal` | Components (their own) |

**Hard rule:** components NEVER consume Tier 1 palette directly. If you write `var(--blue-600)` inside `button.component.scss`, that's a bug — introduce or reuse a Tier 2 role.

**Why split palette from theme:** the palette says *what colours exist*; the theme says *what each role is*. A dark theme ships a different palette (different ramp values) + a theme map that re-points roles. Swapping either re-skins the system without touching components.

## Available palette + theme

- **`default/_palette.scss`** — Blue + slate ramps (the concrete colours).
- **`default/_theme.scss`** — Light role map onto the default palette. Both are bundled into `styles/ds.scss` (palette → theme → tokens) so `@use 'styles/ds';` works out of the box.

Future (each a `themes/<name>/` folder with `_palette.scss` + `_theme.scss`):
- `themes/dark/` — Dark-mode flip (`--shadow-tint-l` → ~95%, neutrals inverted, etc.).
- `themes/high-contrast/` — A11y boost.

## How a consumer picks a theme

### Option A — out-of-the-box default

```scss
// Consumer styles.scss
@use 'styles/ds';   // bundles default palette + theme + tokens + reset + ...
```

### Option B — explicit theme choice

```scss
// Consumer styles.scss
@use 'themes/dark/palette';      // pick a non-default theme: palette …
@use 'themes/dark/theme';        // … then its role map
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
@use 'styles/ds';                        // default theme + DS
@use './app/styles/brand-manage-my';     // overrides palette/roles via [data-brand]
```

This is the mm-broker pattern: load DS (default theme included), then overlay a brand at a more-specific selector (`[data-brand="manage-my"]`).

## Brand vs theme — what's the difference?

- **Theme** swaps the entire Tier 1 palette. Affects EVERY semantic role downstream.
- **Brand** is a thin overlay scoped via attribute selector (`[data-brand="X"]`). Usually overrides a smaller subset (key palette stops + maybe a few roles).

Same mechanism (CSS custom properties + cascade), different scope.

## Adding a new theme

1. Create a `themes/<name>/` folder with `_palette.scss` (ramps + HSL channels) and `_theme.scss` (role map), mirroring `themes/default/`.
2. Optionally add it to `styles/ds.scss` if it should be a default-bundled option.
3. Or let consumers `@use 'themes/<name>/palette'; @use 'themes/<name>/theme';` directly.

Components don't need any change — they consume semantic roles which automatically pick up the new palette.

## Adding a new brand override

1. Create `<consumer-app>/src/app/styles/_brand-X.scss`.
2. Open with `[data-brand="X"] { ... }`.
3. Override:
   - **Palette HSL channels** (`--blue-h/s/l`) — for focus rings and halos that compose hsla() from channels (the theme bridges `--primary-h: var(--blue-h)`).
   - **Blue ramp** (`--blue-50..900`) — single source of truth. All brand-derived roles (`--primary`, `--primary-strong`, `--primary-subtle`, `--primary-muted-strong`, `--text-link`, `--surface-tint`) automatically retint. **Do NOT also override the `--primary-*` roles directly — that's redundant.**
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
