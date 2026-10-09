# Themes — base palette · sibling themes · brands

Colour is layered in three concerns: a **base palette** (theme-independent primitives), **themes** (light / dark — sibling role maps; light is the default, dark is opt-in), and **brands** (optional overlays authored on a theme). The geometry/component layer is separate (`../styles/_tokens.scss`).

## Architecture: three layers

| Layer                         | Lives in                                       | Examples                                                                                                   | Applied at                                   |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Base palette** (primitives) | `themes/_base-palette.scss`                    | `--blue-600`, `--cool-gray-*`, `--brand-gray-*`, `--red-h/s/l`, `--static-ink`, fonts, `--shadow-tint-h/s` | `:root` (theme-independent)                  |
| **Theme** (role map)          | `themes/_semantic.scss` + `themes/<t>/_*.scss` | `--primary`, `--surface-canvas`, `--text-primary`, the `--neutral-*` slot, `--focus-ring`                  | `:root` (light) / `:root[data-theme='dark']` |
| **Component / scale**         | `styles/_tokens.scss`, `*.component.scss`      | `--space-*`, `--radius-*`, `--ds-button-bg-color`, `--duration-fast`                                       | `:root` (theme-independent)                  |

**Hard rule:** components NEVER consume base-palette primitives directly. `var(--blue-600)` inside `button.component.scss` is a bug — use a Tier-2 role (`--primary`, `--text-secondary`) or a component token.

## Files

- **`_base-palette.scss`** — theme-independent primitives at `:root`: hue ramps (`--blue/red/green/yellow/sky/orange-*`) + HSL channels, `--cool-gray-*` / `--brand-gray-*` ramps, `--static-ink` (never flips), `--shadow-tint-h/s`, font families. Shared by every theme.
- **`_semantic.scss`** — `@mixin roles`: the semantic role map (surfaces, text, icons, borders, primary/secondary/tertiary families, status, status-pills, focus). Structure is identical across themes; values resolve through each theme's own `--neutral-*` ramp. Holds the **light-default** values.
- **`light/_palette.scss` + `light/_theme.scss`** — `@mixin palette` (the `--neutral-*` slot = cool-gray + `--shadow-tint-l: 7%`) and `@mixin theme` (`palette` + `semantic.roles`). Light is the **default** skin and needs no extra overrides.
- **`dark/_palette.scss` + `dark/_theme.scss`** — `@mixin palette` (dark neutral ramp + `--shadow-tint-l: 95%`) and `@mixin theme` (`palette` + `semantic.roles` + the value overrides that genuinely differ on dark: tint surfaces, on-tint text, hover/pressed mixed toward white, scrim, focus-halo alpha, chart tokens).
- **`../styles/_theme-activation.scss`** — applies light at `:root` and dark at `:root[data-theme='dark']`, plus the light-context `data-neutrals='brand'` switch.

`styles/ds.scss` forwards `_base-palette` then `theme-activation` (before `tokens`), so `@use 'styles/ds';` renders light out of the box.

**Why sibling themes (not a dark "patch"):** the dark block declares the COMPLETE token set (`@include palette` + `@include semantic.roles` + its own overrides), so `:root[data-theme='dark']` fully replaces light rather than delta-patching it. The `@mixin roles` in `_semantic.scss` is an authoring-DRY device (the light-default structure both themes share), not a runtime cross-theme dependency.

## Theme switching

**Light is the default — no attribute needed.** Dark is opt-in:

- (nothing) — light
- `<html data-theme="dark">` — dark
- `<html data-theme="light">` — also light (explicit; same as the default)

```scss
:root {
  @include light.theme;
} // default
:root[data-theme='dark'] {
  @include dark.theme;
} // opt-in (complete set → fully wins)
```

There is **no automatic `prefers-color-scheme` switch** — light is deterministic by default. To follow the OS, opt in at the app root with `provideDsTheme`:

```ts
// app.config.ts
import { provideDsTheme } from '@ids-group-ltd/ids-design-system';

export const appConfig: ApplicationConfig = {
  providers: [provideDsTheme({ followSystem: true })],
};
```

It sets `data-theme` from `prefers-color-scheme` at startup and keeps it in sync as the OS changes; a manual `data-theme="dark"` still wins.

On-fill text is the literal `white`, or the theme-stable `--static-ink` where the fill is light, so neither flips with the neutrals.

**Known limitation — `data-neutrals="brand"` + dark:** the brand-gray (hue-derived) neutral switch is a **light-theme feature**. The dark block ships its own neutral ramp and is declared last, so on `data-theme="dark"` the dark neutrals win and the brand-gray tint is ignored. (Benign — renders correct dark, just not brand-tinted neutrals.)

## How a consumer picks a theme

### Option A — out of the box (light)

```scss
@use 'styles/ds'; // base palette + light/dark activation + tokens + reset + …
```

### Option B — à la carte (advanced, opt-in global side-effects)

```scss
@use 'styles/breakpoints' as bp;
@use 'themes/base-palette';
@use 'styles/theme-activation'; // light at :root + dark at [data-theme='dark']
@use 'styles/tokens';
@use 'styles/tokens-charts';
@use 'styles/fonts';
@use 'styles/reset';
@use 'styles/typography';
@use 'styles/link';
@use 'styles/focus';
@use 'styles/ds-color';
@use 'styles/layout-utils';
@use 'styles/page-grid';
@use 'styles/scrollbar';
@use 'styles/icon-base';
@use 'styles/dropdown-overlay';
@use 'styles/toast-overlay';
@use 'styles/surface-motion';
@use 'styles/overlay-motion';

@include bp.emit-vars; // writes --bp-*; not implied by the @use above
```

That is the whole list `styles/ds` forwards — it is written out rather than trailed off, because
the parts that are easy to leave out are the ones that fail silently:

- **`bp.emit-vars` is a separate call.** `@use 'styles/breakpoints'` alone emits nothing; the mixin
  is what writes `--bp-*` for your own stylesheets. The library's components fall back to the same
  values when it is missing.
- **`ds-color`** is what defines the `[ds-color="…"]` zones. Leave it out and the accent never
  recolours — no error, just the primary palette everywhere.
- **`focus`** gives your own elements the base focus ring and carries the `[data-focus]` styles and
  the ring's fade-in. The library's components draw their ring without it.
- **`reset`** sets the page: `border-box`, the body font, form controls in the inherited font. The
  library's components set what they need of it on their own elements.
- **`dropdown-overlay` and `toast-overlay`** style panels that portal to `document.body`, which is
  why they cannot live in a component's own stylesheet. Omitting them renders every dropdown,
  picker panel and toast unstyled.

`base-palette` + `theme-activation` must come BEFORE `tokens` so role aliases resolve. The theme `_palette` / `_theme` files expose **mixins** — don't `@use` them directly; `theme-activation` applies them.

### Option C — brand layer on top

```scss
@use 'styles/ds';
@use './app/styles/brand-acme'; // [data-brand="acme"] overrides (light-authored)
```

## Brand vs theme

- **Theme** swaps the whole role map (light ↔ dark). Light is the default; dark is opt-in and, when active, fully replaces light.
- **Brand** is a thin overlay scoped via attribute (`[data-brand="X"]`), authored on a theme. A brand authored on **light** pairs with the default (light) theme. A brand that wants dark adds a separate `[data-theme='dark'][data-brand="X"]` layer.

## Adding a new theme

1. Create `themes/<name>/_palette.scss` (`@mixin palette` — its `--neutral-*` ramp + `--shadow-tint-l`) and `themes/<name>/_theme.scss` (`@mixin theme` — `@include palette` + `@include semantic.roles` + only the role values that differ for this theme).
2. Add a selector block in `styles/_theme-activation.scss` (`:root[data-theme='<name>'] { @include <name>.theme; }`), after the light default.

Components never change — they consume semantic roles, which the active theme block defines.

## Adding a new brand override

1. Create `<consumer-app>/src/app/styles/_brand-X.scss`.
2. Open with `[data-brand="X"] { … }` (authored on light — the default theme).
3. Override the brand hue (`--blue-*` ramp and/or `--primary` + channels), and any roles you want to retint (surfaces, text, secondary, status). Leave `--primary-hover`/`--primary-pressed` to the DS `color-mix()` derivation.
4. Apply via `<html data-brand="X">`.

## Rules summary

- Components never reference base-palette primitives (`--blue-600`, `--neutral-200`) directly — use a Tier-2 role.
- Light is the default; dark is opt-in (`data-theme="dark"`); OS-follow is a consumer opt-in. No `prefers-color-scheme` by default.
- Themes are sibling and self-contained; `_semantic.scss`'s `@mixin roles` holds the light-default values, dark overrides the deltas.
- Brands are theme-authored overlays, and a brand authored on light pairs with the default theme.
- `--primary-hover`/`--primary-pressed` are auto-derived via `color-mix()` (toward black in light, toward white in dark).
