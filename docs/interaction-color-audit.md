# Interaction-color audit

> Audited: 2026-06-10. Scope: all 33 SCSS files with interactive states
> (`:hover`, `:active`, `:focus-visible`, `[aria-selected]`, `.is-active`, …)
> plus every `--ds-*-hover/-active/-pressed` component-token definition.
>
> Question: where are interaction colours picked absolutely, and where are they
> derived by formula (color-mix, HSL calc, opacity overlay)? Goal: converge on
> one general rule that derives hover from base and pressed from hover.

## Current state — four coexisting mechanisms

### 1. Central theme formula (color-mix) — the core already exists

`src/lib/themes/default/_theme.scss:112-113` defines the canonical derivation
for every filled brand/status role:

```scss
--primary-hover: color-mix(in srgb, var(--primary) 88%, black); /* −12% */
--primary-pressed: color-mix(in srgb, var(--primary) 76%, black); /* −24% */
```

Same rule applied to `secondary` (:131-132), `tertiary` (:150-151), `success`
(:163), `warning` (:170), `error` (:177-178), `info` (:185).

Consumers of the derived chain:

| Component   | Usage                                                                |
| ----------- | -------------------------------------------------------------------- |
| button      | primary/error/success/warning variants → `--*-hover` / `--*-pressed` |
| icon-button | primary + inverted-primary variants → `--primary-hover/-pressed`     |
| pagination  | active page hover → `--primary-hover`                                |
| date-picker | selected day hover → `--primary-selected-hover`                      |
| button.text | hover → `--primary-pressed`                                          |

### 2. Local inline formulas with their own constants (outliers)

| Location                                                   | Formula                                                                                                 | Deviation                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/lib/styles/_link.scss:7-8`                            | `color-mix(in srgb, var(--_link-color) 80%, black)` hover, `65%, black` active                          | Steps −20%/−35% instead of theme's −12%/−24%; pressed ≠ 2×hover                          |
| `src/lib/components/sidenav/sidenav-item.component.scss:9` | `color-mix(in srgb, var(--ds-sidenav-item-bg-active) 88%, white)`                                       | Same 88% constant but mixes toward **white** (base is dark); direction hardcoded locally |
| `src/lib/components/button/button.component.scss:38`       | `--ds-button-pressed-shadow: 0 0 0 3px color-mix(in srgb, var(--ds-button-bg-active) 35%, transparent)` | One-off alpha formula (shadow, acceptable)                                               |

### 3. Surface-swap — hover without a formula (the most common mechanism)

Hover/active is achieved by switching to an adjacent semantic token. ~20
declarations:

- `background → var(--surface-secondary)` on hover: menu-item, combobox option,
  dropdown-overlay option, accordion head, toast action, number-stepper step,
  topbar action, table rows, sidenav-group header, button.outline
- `background → var(--surface-muted)`: icon-button default, tag hover, search clear
- borders: `--border-default → --border-strong` (input, textarea, select,
  combobox, date-picker trigger)
- text: `--text-secondary/tertiary → --text-primary`; icons: `--icon-default →
--icon-strong` (modal/banner/drawer/dropzone close buttons)
- tonal buttons step the ramp: secondary `muted → muted-strong`, tertiary
  `subtle → muted`
- selected states are ramp picks: `--primary-subtle` / `--primary-muted`
  (table.selected, dropdown-overlay .is-selected, tag.is-active, tabs pills)
- hover jumps straight to a brand/status token (no derivation): w3w `:host:hover
→ --primary-muted` (w3w.component.scss:17), number-stepper `.step:active →
--primary-muted` (:69-70), breadcrumbs/topbar/page-header crumb hover →
  `--primary`, menu-item.danger hover → `--error-subtle`
  (menu-item.component.scss:33)

### 4. Opacity overlay — declared but almost unused

`src/lib/styles/_tokens.scss:173-174` declares
`--opacity-state-hover: 0.08` / `--opacity-state-pressed: 0.16`, and the theme
comment (`_theme.scss:23-25`) claims hover/pressed states work this way.
In reality the **only** consumer is the tag close button
(`src/lib/components/tag/tag.component.scss:60,64`) — and it mixes in `oklab`
while everything else uses `srgb`:

```scss
background: color-mix(
  in oklab,
  currentColor calc(var(--opacity-state-hover) * 100%),
  transparent
);
```

### Absolute picks (theme/token level only — components are clean)

- `--surface-inverted-hover: var(--neutral-800)` — `_theme.scss:31`
- `--scrollbar-thumb-hover: var(--neutral-400)`, `--scrollbar-thumb-active:
var(--neutral-500)` — `_tokens.scss:206-207`

No component hardcodes palette ramps or raw hex/hsl literals in state rules,
with one fallback exception: `search.component.scss:85` uses
`var(--surface-muted, rgb(0 0 0 / 6%))` — the literal is only a fallback, the
token wins when defined.

## Inconsistencies found

1. **Link** uses its own constants (80/65 vs theme's 88/76) and breaks the
   pressed = 2×hover ratio.
2. **No `-pressed` for statuses** except error: success/warning buttons reuse
   `-hover` on `:active` (`button.component.scss:128,135`). `--info-pressed`
   also missing.
3. **`--primary-selected-hover`** (`_theme.scss:114`) duplicates
   `--primary-hover` — same 88% formula.
4. **Mix direction** (darken vs lighten) is not tokenised — sidenav-item and
   `--surface-inverted-hover` each solve it ad hoc.
5. **Declared overlay mechanism** (0.08/0.16) contradicts actual practice
   (surface swap); the theme comment describes a convention that isn't followed.
6. icon-button default has `bg-active = bg-hover` — no pressed distinction.

## Proposed general formula

The system has already converged on a rule; formalise it and migrate outliers.

```scss
/* _tokens.scss — state constants */
--state-step-hover:   12%;     /* darkening step for hover */
--state-step-pressed: 24%;     /* ALWAYS = 2 × hover */
--state-into:         black;   /* mix direction; dark bases / dark theme set white */

/* derivation rule for ANY fill */
hover(C)   = color-mix(in srgb, C calc(100% - var(--state-step-hover)),   var(--state-into));
pressed(C) = color-mix(in srgb, C calc(100% - var(--state-step-pressed)), var(--state-into));
```

Principles to codify:

- **pressed = 2 × hover.** Already holds in the theme (12/24) and in the
  opacity tokens (0.08/0.16). This is the "click from hover" formula.
- **Direction via `--state-into`.** Light base → mix black; dark base (sidenav
  active, inverted surface, dark theme) → override to white locally. Removes
  the hardcoded `88%, white` from sidenav-item and lets
  `--surface-inverted-hover` become a formula.
- **Neutral/transparent surfaces** get the same idea as an "ink layer" —
  a formalisation of the existing 0.08/0.16 tokens, no pseudo-elements needed:

  ```scss
  hover(surface) = color-mix(in srgb, var(--text-primary) calc(var(--opacity-state-hover) * 100%), surface);
  ```

  The surface-swap ladder (`→ --surface-secondary`) can stay as a documented
  alternative — 8% black over white = #EBEBEB ≈ `--neutral-150` (#E8ECF2) — or
  be migrated gradually. Use `--text-primary` as the ink (not pure black) so
  the cool tint of the neutral ramp is preserved.

### Migration list

- [ ] Link: move to 88/76 steps (or document its stronger steps deliberately —
      text contrast requirements are higher than fills).
- [ ] Add `--success-pressed`, `--warning-pressed`, `--info-pressed`; point
      button `:active` at them.
- [ ] Collapse `--primary-selected-hover` into `--primary-hover`.
- [ ] sidenav-item: replace local `color-mix(... 88%, white)` with the general
      rule + `--state-into: white`.
- [ ] `--surface-inverted-hover`: derive via formula instead of `--neutral-800`.
- [ ] Scrollbar thumb hover/active: derive from `--scrollbar-thumb`.
- [ ] Fix the theme comment (`_theme.scss:23-25`) or actually adopt the overlay
      mechanism — currently it describes a convention nobody follows.
- [ ] Unify the colour space: tag close uses `oklab`, everything else `srgb`.

### Longer term — OKLCH relative colors

`oklch(from C calc(l - 0.06) c h)` is perceptually uniform (srgb-mixing black
into yellow drifts toward olive; oklch keeps hue). The codebase is standardised
on `color-mix in srgb`, so centralise the constants first — switching the colour
space later becomes a one-line change per formula.
