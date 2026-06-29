# Themes — base palette · sibling themes · brands

Colour is layered in three concerns: a **base palette** (theme-independent primitives), **themes** (light / dark — sibling, mutually-exclusive role maps), and **brands** (optional overlays bound to a theme). The geometry/component layer is separate (`../styles/_tokens.scss`).

## Architecture: three layers

| Layer                          | Lives in                                   | Examples                                                                                              | Applied at                                  |
| ------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Base palette** (primitives)  | `themes/_base-palette.scss`                | `--blue-600`, `--cool-gray-*`, `--brand-gray-*`, `--red-h/s/l`, `--static-white`, fonts, `--shadow-tint-h/s` | `:root` (theme-independent)                 |
| **Theme** (role map)           | `themes/_roles.scss` + `themes/<t>/_*.scss`| `--primary`, `--surface-canvas`, `--text-primary`, the `--neutral-*` slot, `--focus-ring`              | mutually-exclusive `:root` theme selectors  |
| **Component / scale**          | `styles/_tokens.scss`, `*.component.scss`  | `--space-*`, `--radius-*`, `--ds-button-bg-color`, `--duration-fast`                                   | `:root` (theme-independent)                 |

**Hard rule:** components NEVER consume base-palette primitives directly. `var(--blue-600)` inside `button.component.scss` is a bug — use a Tier-2 role (`--primary`, `--text-secondary`) or a component token.

## Files

- **`_base-palette.scss`** — theme-independent primitives at `:root`: hue ramps (`--blue/red/green/yellow/sky/orange-*`) + HSL channels, `--cool-gray-*` / `--brand-gray-*` ramps, `--static-white` / `--static-ink` (never flip), `--shadow-tint-h/s`, font families. Shared by every theme.
- **`_roles.scss`** — `@mixin roles`: the semantic role map (surfaces, text, icons, borders, primary/secondary/tertiary families, status, status-pills, focus). Structure is identical across themes; the values resolve through each theme's own `--neutral-*` ramp. Holds the **light-default** values.
- **`light/_palette.scss` + `light/_theme.scss`** — `@mixin palette` (the `--neutral-*` slot = cool-gray + `--shadow-tint-l: 7%`) and `@mixin theme` (`palette` + `roles`). Light is the default skin and needs no extra overrides.
- **`dark/_palette.scss` + `dark/_theme.scss`** — `@mixin palette` (dark neutral ramp + `--shadow-tint-l: 95%`) and `@mixin theme` (`palette` + `roles` + the value overrides that genuinely differ on dark: tint surfaces, on-tint text, hover/pressed mixed toward white, scrim, focus-halo alpha, chart tokens).
- **`../styles/_theme-activation.scss`** — applies the theme mixins under mutually-exclusive selectors + the OS-default media rule + the light-scoped `data-neutrals='brand'` switch.

`styles/ds.scss` forwards `_base-palette` then `theme-activation` (before `tokens`), so `@use 'styles/ds';` renders light out of the box.

**Why sibling themes (not a dark "patch"):** the two theme selectors `:root:not([data-theme='dark'])` and `:root[data-theme='dark']` are mutually exclusive, so exactly one theme block matches at runtime and emits the COMPLETE token set (palette + roles + its own overrides). Neither theme patches the other; the shared `roles` mixin is an authoring-DRY device, not a runtime dependency.

## Dark theme

Ships in the default bundle. Activation:

- `<html data-theme="dark">` — forced dark
- `<html data-theme="light">` — forced light
- attribute unset — follows the OS via `@media (prefers-color-scheme: dark)`

```scss
:root:not([data-theme='dark'])      { @include light.theme; }   // default + forced light
:root[data-theme='dark']            { @include dark.theme; }    // forced dark
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light'])   { @include dark.theme; }     // OS default
}
```

On-fill text uses theme-stable `--static-white` / `--static-ink` so it doesn't flip with the neutrals.

**Known limitation — `data-neutrals="brand"` + dark:** the brand-gray (hue-derived) neutral switch is a **light-theme feature**, scoped to `:root:not([data-theme='dark'])`. In dark mode the dark neutral ramp always applies; brand-tinted neutrals are not (yet) built for dark.

## How a consumer picks a theme

### Option A — out of the box

```scss
@use 'styles/ds'; // base palette + light/dark activation + tokens + reset + …
```

### Option B — à la carte (advanced, opt-in global side-effects)

```scss
@use 'themes/base-palette';
@use 'styles/theme-activation'; // light + dark, [data-theme] / prefers-color-scheme
@use 'styles/tokens';
@use 'styles/fonts';
@use 'styles/reset';
// …
```

`base-palette` + `theme-activation` must come BEFORE `tokens` so role aliases resolve. The theme `_palette` / `_theme` files expose **mixins** — don't `@use` them directly; `theme-activation` applies them.

### Option C — brand layer on top

```scss
@use 'styles/ds';
@use './app/styles/brand-manage-my'; // [data-brand="manage-my"] overrides, light-scoped
```

## Brand vs theme

- **Theme** swaps the whole role map (light ↔ dark). Mutually exclusive; the active theme decides everything.
- **Brand** is a thin overlay scoped via attribute (`[data-brand="X"]`), and is **bound to a theme**. `manage-my` is authored on light, so it is scoped `:root:not([data-theme='dark'])[data-brand="manage-my"]` — on dark it doesn't apply (the page degrades to unbranded dark, never light-brand-on-dark). A brand that wants dark adds a separate `[data-theme='dark'][data-brand="X"]` layer.
- Branded apps should **pin their theme** (`<html data-theme="light" data-brand="…">`) so OS auto-dark doesn't mismatch the brand.

## Adding a new theme

1. Create `themes/<name>/_palette.scss` (`@mixin palette` — its `--neutral-*` ramp + `--shadow-tint-l`) and `themes/<name>/_theme.scss` (`@mixin theme` — `@include palette` + `@include roles` + only the role values that differ for this theme).
2. Add a selector block in `styles/_theme-activation.scss` (`:root[data-theme='<name>'] { @include <name>.theme; }`).

Components never change — they consume semantic roles, which the active theme block defines.

## Adding a new brand override

1. Create `<consumer-app>/src/app/styles/_brand-X.scss`.
2. Scope to its theme: `:root:not([data-theme='dark'])[data-brand="X"] { … }` (light brand) — or `[data-theme='dark'][data-brand="X"]` for a dark brand.
3. Override the brand hue (`--blue-*` ramp and/or `--primary` + channels), and any roles you want to retint (surfaces, text, secondary, status). Leave `--primary-hover`/`--primary-pressed` to the DS `color-mix()` derivation.
4. Apply via `<html data-theme="light" data-brand="X">`.

## Rules summary

- Components never reference base-palette primitives (`--blue-600`, `--neutral-200`) directly — use a Tier-2 role.
- Themes are sibling, mutually-exclusive, and self-contained; the shared `roles` mixin holds the light-default values, dark overrides the deltas.
- Brands are theme-bound overlays. A light brand never bleeds onto dark.
- `--primary-hover`/`--primary-pressed` are auto-derived via `color-mix()` (toward black in light, toward white in dark).
