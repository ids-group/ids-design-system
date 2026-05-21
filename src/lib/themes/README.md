# Themes — palette primitives

Tier 1 colour tokens (palette ramps + brand/danger HSL channels + shadow-tint channels) live here.

The DS itself (`../styles/_tokens.scss`) defines only Tier 2 semantic roles and Tier 3 component-scoped tokens; it references palette by name (`var(--violet-600)`, `var(--neutral-0)`, etc.). A theme provides those names with concrete values.

## Architecture: three tiers

| Tier | Lives in | Examples | Consumers |
|---|---|---|---|
| **Tier 1 — Palette primitives** | `themes/_theme-*.scss` | `--violet-600`, `--neutral-0`, `--red-500`, `--brand-h/s/l`, `--shadow-tint-h/s/l` | Only `_tokens.scss` (Tier 2 defs) |
| **Tier 2 — Semantic roles** | `styles/_tokens.scss` | `--brand`, `--text-primary`, `--surface-default`, `--border-divider`, `--success`, `--focus-ring` | Components |
| **Tier 3 — Component scoped** | `styles/_tokens.scss` and inside `*.component.scss` | `--ds-button-bg`, `--ds-progress-h`, `--tooltip-maxw` | Components (their own) |

**Hard rule:** components NEVER consume Tier 1 directly. If you write `var(--violet-600)` inside `button.component.scss`, that's a bug — introduce or reuse a Tier 2 role.

## Available themes

- **`_theme-default.scss`** — Light theme, violet brand + slate neutrals. Bundled into `styles/ds.scss` so consumers using `@use 'styles/ds';` get it for free.

Future:
- `_theme-dark.scss` — Dark-mode flip (`--shadow-tint-l` → ~95%, neutrals inverted, etc.).
- `_theme-high-contrast.scss` — A11y boost.

## How a consumer picks a theme

### Option A — out-of-the-box default

```scss
// Consumer styles.scss
@use 'styles/ds';   // bundles theme-default + tokens + reset + ...
```

### Option B — explicit theme choice

```scss
// Consumer styles.scss
@use 'themes/theme-dark';        // pick a non-default theme
@use 'styles/tokens';
@use 'styles/reset';
@use 'styles/typography';
@use 'styles/scrollbar';
@use 'styles/icon-base';
@use 'styles/dropdown-overlay';
```

Theme must come BEFORE `tokens` so role aliases resolve.

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

1. Create `themes/_theme-X.scss` mirroring the shape of `_theme-default.scss` — all ramps + HSL channels.
2. Optionally add it to `styles/ds.scss` if it should be a default-bundled option.
3. Or let consumers `@use 'themes/theme-X';` directly.

Components don't need any change — they consume semantic roles which automatically pick up the new palette.

## Adding a new brand override

1. Create `<consumer-app>/src/app/styles/_brand-X.scss`.
2. Open with `[data-brand="X"] { ... }`.
3. Override:
   - **Brand HSL channels** (`--brand-h/s/l`) — for focus rings and halos that compose hsla() from channels.
   - **Violet ramp** (`--violet-50..900`) — single source of truth. All brand-derived roles (`--brand`, `--brand-strong`, `--brand-subtle`, `--brand-muted-strong`, `--text-link`, `--surface-tint`) automatically retint. **Do NOT also override the `--brand-*` roles directly — that's redundant.**
   - Other roles you want to retint independently (surfaces, borders, text, success/danger ramps, secondary, etc.).
4. Apply via `<html data-brand="X">` on the host app.

## Rules summary

- Components NEVER reference `var(--violet-600)` / `var(--neutral-200)` / `var(--red-500)` directly. Use a Tier 2 role (`--brand`, `--text-secondary`) or a Tier 3 component token.
- Themes own palette. Brands overlay on top via `[data-brand]`.
- Theme switching = swap one `@use 'themes/X'`. No component changes.
- `--brand-hover`, `--brand-pressed` are auto-derived via `color-mix()`. Don't override unless brand needs non-derived hover.
- Audit guard (suggested pre-commit hook):
  ```bash
  grep -nE 'var\(--(violet|neutral|red|green|yellow|blue|orange|cyan|magenta)-[0-9]+\)' \
    prototype/ds/src/lib/components/**/*.scss && exit 1
  ```
