# DS Component Catalogue

> Index of the design system components, global helpers, tokens and icons. Use it as a single reference when migrating UI to DS.
>
> **This file is the WHAT — the inventory.** For the HOW (which spacing between what,
> which type role where, how a page is composed) see `design-system.md`, which carries
> the rules this catalogue deliberately does not.
>
> **Where it overlaps with generated output:** the documentation site
> (https://ids-ds.proto.ids-group.co.uk/) carries a generated Component API table and
> a token reference from source on every build, and those cannot go stale. Where this file
> and the generated tables disagree, the generated ones are right — prefer them for exact inputs and token names, and
> use this catalogue for orientation. Each entry shows the selector, the key inputs/outputs/slots, and the public CSS custom properties that consumers can override.
>
> **Import path:** `import { ButtonComponent, … } from '@ids-group-ltd/ids-design-system'`.
>
> **Templating note:** every component is standalone with `ViewEncapsulation.Emulated`. Pass classes on the host element to scope local tweaks; override DS tokens at the host level (`ds-xxx { --ds-xxx-…: … }`) — defaults are declared on `:host` (or the root class) so consumer overrides cascade in.

---

## Foundations

### Tokens (Tier 2 — semantic roles)

Loaded via `@use 'styles/tokens';` (when the consumer also `@use 'styles/ds';` the full aggregate is pulled in). Brand themes override Tier 1 palette + a few Tier 2 roles in their own `_brand-*.scss`.

**Colour roles:**
- Surfaces: `--surface-canvas`, `--surface-default`, `--surface-secondary`, `--surface-overlay`, `--surface-tint`, `--surface-disabled`, `--surface-muted`, `--surface-inverted`, `--surface-inverted-hover`, `--surface-scrim`
- Borders: `--border-default`, `--border-strong`, `--border-subtle`, `--border-divider`, `--border-disabled`, `--border-inverted`
- Text: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--text-disabled`, `--text-inverted`, `--text-link`, `--text-on-primary`, `--text-on-success`, `--text-on-error`
- Icons: `--icon-default`, `--icon-strong`, `--icon-muted`, `--icon-on-primary`
- Primary (main brand fill): `--primary`, `--primary-hover`, `--primary-pressed`, `--primary-selected-hover`, `--primary-strong`, `--primary-subtle`, `--primary-muted`, `--primary-muted-strong`, `--primary-on` + HSL channels `--primary-h/s/l`
- Secondary (paired CTAs, accent rails, opt-in variants): `--secondary`, `--secondary-hover`, `--secondary-pressed`, `--secondary-strong`, `--secondary-subtle`, `--secondary-muted`, `--secondary-on` + HSL channels `--secondary-h/s/l`
- Tertiary (third brand hue — tertiary button, tonal chips, indicators): `--tertiary`, `--tertiary-hover`, `--tertiary-pressed`, `--tertiary-strong`, `--tertiary-subtle`, `--tertiary-muted`, `--tertiary-on` + HSL channels `--tertiary-h/s/l`
- Error (destructive, was --danger): `--error`, `--error-hover`, `--error-pressed`, `--error-subtle`, `--error-muted`, `--error-border`, `--error-text` + HSL channels `--error-h/s/l`
- Status: `--success`, `--success-hover`, `--success-subtle`, `--success-muted`, `--success-border`, `--success-text`
- Status (warning/info): same shape with prefix swapped
- Status pills: the DS ships no predefined status keys — consumers register their own vocabulary (e.g. `planning`, `confirmed`) and wire colours per key via `@use 'styles/status'` (`status.define(...)` / `status.semantic-preset`), which sets `--ds-badge-bg-color` / `--ds-badge-label-color` / `--ds-status-dot-color` per `[data-status]`. Full guide (model, worked example, migration from factory statuses): [`migrations/0.5.1/badge-statuses.md`](migrations/0.5.1/badge-statuses.md)

**Geometry:**
- Spacing: `--space-0`, `--space-px`, `--space-0-5` (2px), `--space-1` (4px), `--space-1-5` (6px), `--space-2` (8px), `--space-2-5` (10px), `--space-3` (12px), `--space-4` (16px), `--space-5` (20px), `--space-6` (24px), `--space-8` (32px), `--space-10` (40px), `--space-12` (48px), `--space-14` (56px), `--space-16` (64px), `--space-20` (80px), `--space-24` (96px), `--space-32` (128px)
- Radius: `--radius-0`, `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-2xl` (24px), `--radius-pill` (999px), `--radius-pill-value`, `--radius-flat`
- Border widths: `--border-width-default` (1px), `--border-width-strong` (2px)
- Hit targets: `--hit-xs` (24), `--hit-sm` (28), `--hit-md` (36), `--hit-min` (32), `--hit-cozy` (40), `--hit-comfy` (44), `--hit-touch` (48)
- Icon sizes: `--icon-2xs` (10), `--icon-xs` (12), `--icon-sm` (14), `--icon-md` (16), `--icon-lg` (20)

**Typography:**
- Families: `--font-sans`, `--font-mono`, `--font-display`, `--font-heading`
- Weights: `--font-weight-regular` 400, `--font-weight-medium` 500, `--font-weight-semibold` 600, `--font-weight-bold` 700, `--font-weight-extrabold` 800 (a brand overlay may step this down to 700)
- Sizes: `--font-size-display` 64, `--font-size-h1` 48, `--font-size-h2` 36, `--font-size-h3` 28, `--font-size-h4` 22, `--font-size-h5` 18, `--font-size-h5-strong` 20, `--font-size-l` 18, `--font-size-m` 16, `--font-size-s` 14, `--font-size-xs` 12, `--font-size-2xs` 11, `--font-size-3xs` 10, `--font-size-4xs` 9, `--font-size-mono` 13
- Line heights: `--line-height-tight` 1.1, `--line-height-snug` 1.25, `--line-height-base` 1.4, `--line-height-loose` 1.6, `--line-height-flat` 1
- Letter spacing: `--letter-spacing-tight`, `--letter-spacing-snug`, `--letter-spacing-normal`, `--letter-spacing-wide`, `--letter-spacing-wider`

**Motion:**
- Durations: `--duration-instant` 80ms, `--duration-fast` 120ms, `--duration-base` 180ms, `--duration-slow` 260ms, `--duration-slower` 400ms
- Loop: `--duration-loop-fast` 700ms, `--duration-loop-slow` 1400ms
- Easing: `--ease-standard`, `--ease-emphasized`, `--ease-decelerate`, `--ease-accelerate`, `--ease-spring`

**Elevation:**
- `--z100/200/300/400` (raw), `--shadow-popover`, `--shadow-modal`, `--shadow-toast`, `--shadow-card`
- `--blur-sm`, `--blur-md`

**Z-index:**
- `--layer-base`, `--layer-raised`, `--layer-sticky`, `--layer-dropdown`, `--layer-overlay`, `--layer-drawer`, `--layer-modal`, `--layer-popover`, `--layer-toast`, `--layer-tooltip`

**Focus rings:** `--focus-ring`, `--focus-ring-inverted`, `--focus-ring-error`, `--focus-field`, `--focus-field-error`

---

### Grid

Responsive 4-tier page grid loaded via `@use 'styles/ds'` (or directly via `@use 'styles/page-grid';`). One column-count per breakpoint, gutters and margins scale with the viewport, container caps on the widest tier and stays fluid below.

| Tier         | Range         | Cols | Gutter        | Margin         | Container cap            |
| ------------ | ------------- | ---- | ------------- | -------------- | ------------------------ |
| Mobile       | ≤ 640px       | 4    | `--space-3` (12)  | `--space-4` (16)   | fluid                    |
| Tablet       | 641 – 1024px  | 8    | `--space-4` (16)  | `--space-6` (24)   | fluid                    |
| Desktop      | 1025 – 1440px | 12   | `--space-5` (20)  | `--space-8` (32)   | fluid                    |
| Desktop wide | ≥ 1441px      | 12   | `--space-6` (24)  | `--space-10` (40)  | `--col-cap-content` 1280 |

**Tokens:** `--bp-xs` 480, `--bp-sm` 640, `--bp-md` 768, `--bp-lg` 1024, `--bp-xl` 1441, `--bp-2xl` 1536. Per-tier gutters/margins live as `--page-gutter-{mobile|tablet|desktop|wide}` and `--page-margin-{mobile|tablet|desktop|wide}`; the active values resolve through `--page-gutter` / `--page-margin` on `.page-grid`. Content caps: `--col-cap-text` 720, `--col-cap-content` 1280.

**Class API:**
- `.page-grid` — root grid container. Sets `display: grid`, tier-appropriate `grid-template-columns`, `gap`, horizontal `padding`, and `max-width: var(--col-cap-content)` with `margin: 0 auto` for centring at the widest tier.
- `.col-span-1` … `.col-span-12` — span helpers. At narrower tiers (8 / 4 cols), a span wider than the active column-count wraps to its own row.

**Composition rules:**
- One grid per page. Sub-regions align to the same column tracks — never invent a local grid.
- Snap to columns, not pixels. Canonical two-column splits: 8+4, 6+6, 9+3. Never 7+5.
- Sidenav lives OUTSIDE the grid. Reserve its rail (collapsed 64px / open 240px via `--sidenav-w` / `--sidenav-w-collapsed`), then start `.page-grid` in the remaining width.
- Prose caps at 720px via `--col-cap-text` regardless of grid width.
- 8+4 is canonical for record-detail pages (main + meta sidebar); 9+3 is reserved for a narrow picker or filter rail.

**Markup example:**

```html
<main class="page-grid">
  <section class="col-span-8">Main content</section>
  <aside class="col-span-4">Meta sidebar</aside>
</main>
```

---

### Global helper classes

The DS aggregate (`@use 'styles/ds'`) forwards the full stack: theme primitives + tokens + tokens-charts + fonts + reset + typography + link + layout-utils + page-grid + scrollbar + icon-base + dropdown-overlay + skeleton-shimmer. Consumers that only `@use 'styles/tokens'` get pure tokens — **no** font faces, `.link`, typography utilities, `.grid-*`, `.page-grid` / `.col-span-*`, or the dropdown/skeleton overlay rules — load each partial explicitly (`@use 'styles/fonts'; @use 'styles/link';` …) or switch to the aggregate.

- `.link` — anchor styling, declared in `_link.scss`. Modifiers: `.quiet` `.inline` `.standalone` `.xs` `.sm` `.lg`. Hover→`color-mix(text-link, black 20%)`, active→`color-mix(text-link, black 35%)`, disabled via `[aria-disabled="true"]`. Loaded via `@use 'styles/link'` (included in the `@use 'styles/ds'` aggregate).
- Typography utilities (`_typography.scss`): `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-h4`, `.t-h5`, `.t-l`, `.t-l-bold`, `.t-m`, `.t-m-bold`, `.t-s`, `.t-s-bold`, `.t-xs`, `.t-xs-bold`, `.t-overline`, `.t-caption`, `.t-mono`, `.t-mono-block`, `.sr-only`
- Layout (`_layout-utils.scss`): `.grid-2`, `.grid-3`, `.grid-4`. Breakpoints: at ≤1100px `.grid-4` drops to 3 columns; at ≤820px both `.grid-3` and `.grid-4` drop to 2 columns. Gap is `--space-4`.
- Page grid (`_page-grid.scss`): `.page-grid` + `.col-span-1` … `.col-span-12`. 4-tier responsive grid (4 / 8 / 12 / 12 columns); see Foundations → Grid above for the full spec.
- Skeleton shimmer (`_skeleton-shimmer.scss`): drives the global `--skeleton-shimmer-x` keyframe used by `<ds-skeleton>` and table skeleton rows.
- Dropdown overlay (`_dropdown-overlay.scss`): styles the `.ds-dropdown-panel` class used by select/dropdown/combobox/date-picker CDK portals — these panels live outside the host's encapsulated tree, so the styles must be global.

**Two mixins for building your own composite controls.** `@use` the partial directly to reach the mixin; a mixin emits nothing until it is included.

- `@use 'styles/focus' as focus;` → `focus.owns-the-focus-ring($control)`. This partial IS part of the `styles/ds` aggregate — it also carries the base indicator and the `data-focus` switch — so reaching for the mixin adds no CSS. Include it in a shell that paints its own ring on `:focus-within`, naming the ONE control inside that must not paint the base indicator too. `outline: 0` cannot do this — the base indicator is a box-shadow — and a box-wide reset instead of a named control silences the tab stops inside the box (a clear button, a stepper arrow), which leaves a keyboard user unable to tell what has focus. See Foundations → Colour → Focus for the worked example.
- `@use 'styles/text-clip' as text-clip;` → `text-clip.single-line-ellipsis`. Mixin-only, so this partial is NOT part of the `styles/ds` aggregate and emits nothing on its own. A one-line label that truncates with an ellipsis. Use it instead of hand-writing `overflow: hidden; text-overflow: ellipsis`: with a line-height under the font's glyph box (Mulish measures 1.257em, so `--line-height-flat` and `--line-height-tight` both qualify) that `hidden` shaves the top and bottom off every glyph.

---

## Components

Every entry below names its exported class (`ButtonComponent`, `TableComponent<T>`, …). Those names are exported for typing, DI, `viewChild` and template refs — **not as an extension point: subclassing a DS component is unsupported.** Any minor release may add members to a class, and a subclass that happens to have used one of those names breaks on it (TS4114 "must have an 'override' modifier", or TS2416 when the signature differs) — DS 0.6.3 added ~76 members to `TableComponent` alone. Compose instead: wrap the component, project into its slots, retune it through its `--ds-*` tokens. If you subclass anyway, treat every upgrade as potentially build-breaking — the changelog flags the risk, it does not avoid it.

**The `--ds-*` token contract, once for every component below.** Every public `--ds-<component>-*` token is READ WITH A FALLBACK and never declared by the component, so a consumer's value always wins and always inherits: set it on the host (`ds-button { --ds-button-bg-color: teal }`), on any ancestor, at `:root`, or inline. Unset tokens fall through to the component's own default, so there is nothing to opt into and nothing to reset. Two consequences worth stating: a token set at `:root` reaches EVERY instance — scope per instance or per section and keep theme-wide re-skins at role level (`--primary`, `--ds-radius-control`) — and where a component derives one value from another (a hover fill mixed from the resolved background), overriding the source retunes the derived states with it. Individual entries below therefore note only what DEVIATES from this: a derived state, a variant-specific default, a token that beats a size class.

> **Token and API lists below are hand-maintained, so treat this file as prose about intent.** The authoritative surfaces are the **Component API tables** and the **token reference** on the documentation site, both generated from the source of each release, so they cannot go stale — trust those first, and read this file for the reasoning a generated table cannot carry. Where the two disagree, the generated one is right.

### Form & input

**Shared by every field** (input, textarea, select, multi-select, autocomplete, date/time/colour picker,
checkbox, radio, radio-group, switch, slider, segmented, OTP): `label`, `hint`, `error`, `warning`,
`errors`, `invalid`, `touched`, `reserveMessage` — and one message line under the control that renders
whichever of them wins. The ladder is error → errors → warning → advisory errors → success → hint.

`error`, `warning` and `success` lead that line with a glyph; `hint` does not, because it is the resting
text rather than a state. Retune app-wide with `DS_CONFIG.field.stateIcons` (per state, independent —
`false` removes one, an `IconName` replaces it, `stateIcons: false` removes all four), or per field with
`messageIcon: IconName | false | null`, which wins over the config. Spacing hooks:
`--ds-field-message-icon-gap`, `--ds-field-message-icon-offset`.

**`ds-search` is deliberately NOT on that list.** It binds to a form like the others — `[formControl]`,
`formControlName`, `[(ngModel)]`, signal forms, plus its own `[(value)]` — and it takes `disabled` and
`hidden`, but it renders no message row and therefore takes none of the message inputs. A toolbar filter
is not a validated field; where a search needs a label or an error line, use `ds-input`.

#### `<ds-button>` — `ButtonComponent`
Inputs: **two orthogonal axes** — `color: ButtonColor = 'primary'` (`'primary' | 'secondary' | 'tertiary' | 'neutral' | 'error' | 'success' | 'warning'`) and `variant: ButtonVariant = 'solid'` (`'solid' | 'tonal' | 'outline' | 'ghost' | 'text'`). Plus `size: DsSize | null = null` (unset resolves `DS_CONFIG.control.size`, then `md`), `type: 'button' | 'submit' | 'reset' = 'button'`, `disabled`, `loading`, `fullWidth`, `icon: IconName | null`. Plus the refusal pair below: `disabledReason`, and the field message inputs `hint` / `warning` / `error` / `messageIcon` / `reserveMessage` / `ariaDescribedBy`.
Axis meaning: **variant is loudness** (solid > tonal > outline/ghost/text), **color is hue** — every pair renders, and the UX-discouraged ones dev-warn with the reason. Only solid and tonal paint a fill: outline, ghost and text are TRANSPARENT, so they adopt the surface they sit on. Disabled splits by whether the fill can carry the state: `solid` and `tonal` keep `oklch(from accent 70% 0.035 h)`, while `outline`, `ghost` and `text` — the three with no fill of their own — mix the label toward the surface, `color-mix(in srgb, <label> 40%, var(--surface-default))`, because a fixed lightness cannot serve both themes. (History: the single `variant` axis was split into color × variant in 2026-06; `danger`→`error`, `link`→`text`, the old `ghost`→`outline`.)
Output: `(pressed): MouseEvent` — only fires when not disabled and not loading
Content slots: default (label / leading or trailing icon), plus `[dsButtonSubtext]` for a projected second line. For icon-only actions use `<ds-icon-button>`.
**Saying WHY a button is refused, and the two kinds of refusal.** A greyed control that does not say why is a dead end, and until 0.10.4 the only way to explain one was a tooltip — mouse-only. Which input to reach for is decided by whether the user can lift the refusal on this screen:
- **Standing** (no permission, no integration — nothing here will change it): `disabledReason` beside `disabled`. The reason renders as a second line INSIDE the button, and setting it flips how the button is disabled — `aria-disabled="true"` instead of the native attribute, because a natively disabled button never takes focus and its description would never be announced (measured; Chrome's a11y tree reports name `"Approve invoice"`, description `"Needs the Finance role"`, state disabled). The click is swallowed in the handler instead, so `(pressed)` still never fires. Leave `disabledReason` unset and NOTHING changes: the native attribute stays, and so does every existing layout. Length is deliberately uncapped — the text wraps and the button grows.
- **Temporary** (the form is not filled in yet): do NOT disable the button at all. Leave it live, judge validity in the submit handler, and carry the text UNDER the button with `hint` / `warning` / `error` — the same three inputs the fields take, resolved and rendered by the same `ds-field-message` row the fields use, with the same `messageIcon` and `reserveMessage` knobs and the same `DS_CONFIG.field.*` fallbacks. Those inputs live on an internal shared base class that `ButtonComponent` and every field extend, so the behaviour cannot drift apart. What it does NOT take is `errors` / `invalid` / `touched`: a button has no validation state of its own.
Layout: a message-bearing button becomes a column (host class `with-message`), and because the host shrinks to fit, a message longer than the label widens the pair — button included, exactly as a field's control spans its own message. Without a message the host keeps the `inline-flex` box every existing layout was built against.
Tokens: `--ds-button-bg-color`, `--ds-button-bg-color-hover`, `--ds-button-bg-color-active`, `--ds-button-bg-color-disabled`, `--ds-button-label-color`, `--ds-button-label-color-disabled`, `--ds-button-border`, `--ds-button-radius`, `--ds-button-focus-shadow`, `--ds-button-pressed-shadow`, `--ds-button-shadow`, `--ds-button-shadow-hover`. The last two are the REST and hover shadow, both `none` by default — before them the only way to give a button a resting shadow was a deep selector into its inner `<button>`. `-shadow-hover` falls back to `-shadow`, so setting the resting one alone keeps the button steady under the pointer; focus and pressed keep their own hooks and still win while those states are on. For `variant="solid"`, `-bg-color-hover` / `-bg-color-active` / `-pressed-shadow` default to a `color-mix()` derivation of the resolved fill (88 % / 76 % + black — the theme's hover/pressed recipe), so overriding the fill alone retints the whole state set; tonal, outline, ghost and text keep explicit ramp defaults, so a full retint there means setting the state tokens too. 

#### `<ds-icon-button>` — `IconButtonComponent`
Icon-only action with its own taxonomy, distinct from `ds-button`. `ariaLabel` is required (icon-only must be labelled for a11y).
Inputs: `icon: required IconName`, `ariaLabel: required string`, `ariaDescribedBy: string | null = null` (point at text the page already shows — e.g. why the action is refused; icon-only leaves no room for a second line, which is why there is deliberately no `disabledReason` here), `variant: IconButtonVariant = 'standard'` (`'standard' | 'filled' | 'tonal' | 'outlined'`), `size: IconButtonSize = 'md'` (`'sm' | 'md' | 'lg'` = 32/40/48), `type: 'button' | 'submit' | 'reset' = 'button'`, `disabled: boolean = false`, `selected: boolean = false` (toggle — sets `aria-pressed`)
Output: `(pressed): MouseEvent` — fires when not disabled
Variant emphasis: `standard` chromeless (hover-reveal) · `filled` `--primary` · `tonal` `--primary-muted` · `outlined` bordered. `selected` renders the pressed/active fill.
Tokens: `--ds-icon-button-bg-color`, `--ds-icon-button-icon-color`, `--ds-icon-button-border`, `--ds-icon-button-bg-color-hover`, `--ds-icon-button-bg-color-active`, `--ds-icon-button-icon-color-hover`, `--ds-icon-button-radius`, `--ds-icon-button-focus-shadow`. `filled`/`selected` derive hover/active from the resolved bg, `standard`/`tonal`/`outlined` keep explicit ramp defaults.

#### `<ds-input>` — `InputComponent`
Inputs: `value: model<string>`, `type: InputType = 'text'` (`'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'`), `size: 'sm' | 'md' | 'lg' = 'md'`, `label: string = ''`, `hint: string = ''`, `placeholder: string = ''`, `disabled: boolean = false`, `invalid: boolean = false`, `required: boolean = false`, `optional: boolean = false`, `name: string | null = null`, `clearable: boolean | null = null` (inline clear (×) button; `null` resolves to `true` for `type="search"` and `false` otherwise)
Content slots — addon attributes apply to any child element:
- `[dsInputPrefix]` — leading content (icon, label, etc.)
- `[dsInputSuffix]` — trailing content (icon button, label, etc.)
- `class="addon"` — heavyweight slot pill with its own background + divider (use for textual `https://` style prefixes; for icons, prefer plain `dsInputPrefix`)

Example:
```html
<ds-input label="Email" type="email" [(value)]="email">
  <ds-icon dsInputPrefix name="mail" [size]="16"/>
  <button dsInputSuffix type="button" (click)="reveal()">
    <ds-icon name="eye-off" [size]="16"/>
  </button>
</ds-input>
```

Tokens: `--ds-input-bg-color`, `--ds-input-border`, `--ds-input-border-hover`, `--ds-input-border-focus`, `--ds-input-text-color`, `--ds-input-placeholder`, `--ds-input-radius`, `--ds-input-pad-x`, `--ds-input-pad-y`, `--ds-input-focus-shadow`, `--ds-input-border-error`, `--ds-input-bg-color-error`, `--ds-input-border-success`, `--ds-input-bg-color-disabled`

#### `<ds-textarea>` — `TextareaComponent`
Multi-line counterpart to `<ds-input>` — same wrapper/states, reuses the `--ds-input-*` token family. No prefix/suffix slots.
Inputs: `value: model<string>`, `size: 'sm' | 'md' | 'lg' = 'md'`, `label`, `hint`, `placeholder`, `disabled`, `invalid`, `required`, `optional: boolean = false`, `name`, `rows: number = 3`
Tokens: same `--ds-input-*` family as `<ds-input>` (textarea overrides `--ds-input-pad-y` to `--space-3` for vertical breathing room).
New: `autosize: boolean = false` (grows with content; forces `resize='none'`), `minRows`/`maxRows: number | null = null`, `resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical'`.

#### `<ds-number-stepper>` — `NumberStepperComponent`
Spinbox for bounded quantities — −/+ buttons around a numeric value.
Inputs: `value: model<number> = 0`, `min: number = 0`, `max: number | null = null`, `step: number = 1`, `size: 'sm' | 'md' | 'lg' = 'md'`, `disabled: boolean = false`
Methods: `inc()`, `dec()` (clamp to min/max). Buttons disable at the bounds.

#### `<ds-checkbox>` — `CheckboxComponent`
Inputs: `checked: model<boolean>`, `indeterminate: boolean = false`, `disabled: boolean = false`, `name: string | null = null`, `inputId: string | null = null`

#### `<ds-radio>` — `RadioComponent`
Inputs: `checked: model<boolean>`, `disabled: boolean = false`, `name: string = ''`, `value: string = ''`, `inputId: string | null = null`. Use in groups via shared `name`.

#### `<ds-switch>` — `SwitchComponent`
Inputs: `checked: model<boolean>`, `disabled: boolean = false`, `name: string | null = null`, `variant: 'default' | 'success' | 'error' = 'default'`, `inputId: string | null = null`

#### `<ds-select>` — `SelectComponent`
Inputs: `value: model<string>`, `options: SelectItem[]` (`SelectOption | SelectOptionGroup`, where `SelectOption = { label, value, disabled? }` and `SelectOptionGroup = { label, options: SelectOption[], disabled? }`), `placeholder: string = ''`, `size: 'sm' | 'md' | 'lg' = 'md'`, `label: string = ''`, `disabled: boolean = false`, `invalid: boolean = false`, `required: boolean = false`, `optional: boolean = false`, `name: string | null = null`
Renders trigger + CDK overlay panel; keyboard support: ArrowUp/Down, Enter/Space, Home/End, Escape — skipping group-header labels. Pass a mix of flat `SelectOption`s and `SelectOptionGroup`s to render `<optgroup>`-style sections; existing flat-list consumers keep working unchanged. Type guard `isSelectOptionGroup(item)` is re-exported.

#### `<ds-combobox>` — `ComboboxComponent<T>`
Searchable select with typeahead. Generic on the option value type `T`.
Inputs: `options: readonly ComboboxOption<T>[]` (`{ value: T, label: string }`), `value: model<T | readonly T[] | null>`, `multiple: boolean = false`, `placeholder: string = 'Select…'`
In multi mode, selected values render as `<ds-tag closable>` chips above the trigger.

#### `<ds-search>` — `SearchComponent`
Pre-styled search input with built-in icon. A form control, but not a field: no label, no message row.
Inputs: `value: model<string>`, `placeholder: string = 'Search'`, `shortcut: string = ''` (rendered as a hint pill, e.g. `⌘K`), `showIcon: boolean = true`, `clearable: boolean = false`, `ariaLabel: string = ''`, `disabled: boolean = false`, `hidden: boolean = false`, `size: DsSize | null = null`, `debounce: number = 0` (ms held before `value` updates; clearing, Enter and `clear()` all skip the timer)
Output: `(submitted): string` — emits the current value on Enter / form submit
Methods: `clear()` — empties the field, drops an armed keystroke and publishes `''` at once, which writing `''` into `value` does not; `focus()`.
Binds through `NG_VALUE_ACCESSOR`, taking the value plumbing without the field-message layer — so `hint` / `error` / `warning` / `errors` / `invalid` / `touched` / `reserveMessage` / `messageIcon` are NOT inputs here.

#### `<ds-date-picker>` — `DatePickerComponent`
Inputs: `mode: 'single' | 'range' = 'single'`, `size: 'sm' | 'md' | 'lg' = 'md'`, `value: model<Date | RangeValue | null>` (`RangeValue = [Date | null, Date | null]`), `placeholder: string = 'Select date'`, `label: string = ''`, `hint: string = ''`, `required: boolean = false`, `optional: boolean = false`
Trigger button opens a CDK overlay calendar; selecting a day in `'single'` closes the panel, in `'range'` it closes after the second pick.

#### `<ds-dropzone>` — `DropzoneComponent`
File upload area.
Inputs: `accept: string = ''`, `multiple: boolean = false`, `files: model<DropzoneFile[]>` (`{ id, name, size, state: 'uploading' | 'success' | 'error', progress }`)
Outputs: `(filesAdded): File[]` (raw browser File list from drop or picker), `(fileRemoved): DropzoneFile` (a chip's remove button)

---

### Display & feedback

#### `<ds-badge>` — `BadgeComponent`
Inputs: `status: DsStatusKey` (consumer-registered status key; colours wired via `styles/status`, unset → neutral), `withDot: boolean = false`, `solid: boolean = false`, `count: number | null = null`, `max: number = 99`
Content: label text. Use for status pills, counts, lifecycle markers.

#### `<ds-status-dot>` — `StatusDotComponent`
Input: `status: DsStatusKey` (same consumer-registered vocabulary as `ds-badge`; colours wired via `styles/status`, unset → neutral). Tiny coloured dot.

#### `<ds-tag>` — `TagComponent`
Inputs: `variant: 'solid' | 'neutral' = 'solid'`, `closable: boolean = false`
Output: `(closed): void` — emits when the close button is pressed
Content: label.

#### `<ds-avatar>` — `AvatarComponent`
Inputs: `size: 'xs' | 'sm' | 'md' | 'lg' = 'md'`, `initials: string = ''`, `imageUrl: string | null = null`, `tint: { bg, fg } | 'neutral' | null = null` (off-token override; `'neutral'` swaps to the overflow-chip palette)

#### `<ds-avatar-group>` — `AvatarGroupComponent`
Inputs: `max: number = 4` (visible avatars before "+N" overflow), `total: number | null = null` (used to compute the overflow count; without `total` no overflow chip renders).
Content: project `<ds-avatar>` children.

#### `<ds-progress>` — `ProgressComponent`
Linear progress bar (no circular variant).
Inputs: `value: number = 0` (0–100, clamped), `variant: 'default' | 'success' | 'warn' | 'error' | 'indeterminate' = 'default'`

#### `<ds-spinner>` — `SpinnerComponent`
Input: `size: 'sm' | 'md' | 'lg' = 'md'`. Pure-CSS spinner, `role="status"` with built-in `aria-label`.

#### `<ds-skeleton>` — `SkeletonComponent`
Inputs: `width?: string`, `height?: string`, `circle: boolean = false`, `inline: boolean = false`. Shimmer animation requires the global `_skeleton-shimmer.scss` (already pulled in by `ds.scss`).

#### `<ds-stat>` — `StatComponent`
Inputs: `label: required string`, `value: required string | number`, `delta: number | null = null`, `deltaLabel: string = ''`, `caption: string = ''`, `unit: string = ''`, `variant: 'default' | 'danger' = 'default'`
Delta direction is derived from the sign of `delta`: positive → up (arrow + green), negative → down (arrow + red), zero/null → neutral.

#### `<ds-empty-state>` — `EmptyStateComponent`
Inputs: `variant: 'none' | 'loading' | 'error' | 'locked' = 'none'`, `icon: IconName | null = null` (defaults derive from variant — `warn` for error, `lock` for locked, `package` otherwise), `title: string = ''`, `body: string = ''`
Content slot: `[actions]` — CTA buttons / links.

#### `<ds-banner>` — `BannerComponent`
Inputs: `variant: 'info' | 'success' | 'warning' | 'severe' | 'error' | 'neutral' = 'info'`, `title: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null` (variant-derived default), `compact: boolean = false`, `layout: 'stacked' | 'row' = 'stacked'`, `accentRail: boolean = true`
Output: `(dismissed): void`
Content slots: default (body text), `[actions]` (trailing CTAs)
- `layout="stacked"` (default): actions wrap onto a new line, indented under the body. Use for multi-line messages or multiple CTAs.
- `layout="row"`: actions sit at the right edge, vertically centred with the body. Use for one-line messages with a single trailing CTA.

#### `<ds-toast>` — `ToastComponent`
Inputs: `variant: 'info' | 'success' | 'warning' | 'error' = 'info'`, `title: string = ''`, `message: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null` (variant-derived default)
Output: `(dismissed): void`

The companion `<ds-toast-region>` lives inside the `ToastService` (see Services) — it is auto-mounted via a CDK overlay on first `toast.show()`, so consumers do **not** need to place `<ds-toast-region>` anywhere in their markup. Render `<ds-toast>` directly only for static specimens.

---

### Layout & navigation

#### `<ds-sidenav>` — `SidenavComponent`
Inputs: `collapsed: boolean = false`, `brand: string | null = null` (renders a letter mark + name; omit to project custom content, or set `DS_CONFIG.brand.name`), `logoLetter: string | null = null` (the mark's glyph; derived from `brand` when unset), `rail: boolean = true` (whether an active item draws its edge marker — turn it off here rather than painting `--ds-sidenav-item-rail` transparent), `brandRoute: string | readonly unknown[] | null = null`, `brandLinkLabel: string | null = null`
Content: default slot for groups/items + custom brand/footer rows
**The brand row leads home only if you say so.** `brandRoute` turns the mark + wordmark into one link; unset, the row stays a plain block. A logo that goes nowhere should not be a link, and whether a mark is a way home is an app's decision, not the DS's — so this is opt-in, like every other new capability here. The link announces itself as `"<brand>, home"` because a wordmark alone does not say where it goes; `brandLinkLabel` overrides that. Router targets only, and `RouterLink` is instantiated only inside the `@if`, so an app with no router provided still renders the sidenav. A collapse toggle projected into the row stays OUTSIDE the link — one control never nests inside another.
Tokens: `--ds-sidenav-bg-color`, `--ds-sidenav-border`, `--ds-sidenav-width`, `--ds-sidenav-width-collapsed`, `--ds-sidenav-mark-bg-color`, `--ds-sidenav-mark-label-color`

#### `<ds-sidenav-group>` — `SidenavGroupComponent`
Inputs: `label: string = ''`, `icon: IconName | null = null`, `expandable: boolean = false`, `expanded: model<boolean> = true`
Content slots: default (items); `[ds-group-icon]` (custom group icon when not using a DS IconName)
When `expandable=true` renders header button with toggle + caret; collapses body when not expanded.

#### `<ds-sidenav-item>` — `SidenavItemComponent`
Inputs: `icon: IconName | null = null` (optional — falls back to `[icon]` slot), `label: required string`, `href: string = ''`, `routerLink: string | readonly unknown[] | null = null`, `active: boolean = false`, `badge: number | null = null`, `hasAlert: boolean = false`, `rail: boolean | null = null` (draws the active item's edge marker; unset follows the parent `ds-sidenav`)
Content slots: `[icon]` (custom icon when not using a DS IconName), `[trailing]` (right-aligned chrome — badges, indicators, kbd shortcuts)
**Three elements, decided by destination.** `routerLink` → an `<a [routerLink]>` with `routerLinkActive`; `href` → a plain `<a href>`; **neither → a `<button type="button">`**. Until 0.11.0 the last case fell back to `href="#"`, which navigates: it rewrites the URL and discards the scroll position on every click. An item that only emits `activate` is a button. Styling is identical across all three — the rules are class-based (`.item`) and the button's UA chrome is reset — so target the class, never the tag.
Tokens (on `:host`): `--ds-sidenav-item-label-color`, `--ds-sidenav-item-label-color-hover`, `--ds-sidenav-item-bg-color-hover`, `--ds-sidenav-item-bg-color-active` (default: `--accent-subtitle` — a wash, not a solid pill), `--ds-sidenav-item-label-color-active` (default: `--accent-strong`), `--ds-sidenav-item-bg-color-active-hover` (default: `--accent-muted`, deepening toward the accent), `--ds-sidenav-item-rail` (left rail, default: `--accent-strong`), `--ds-sidenav-item-radius`, `--ds-sidenav-alert-color`

#### `<ds-topbar>` — `TopBarComponent`
No inputs.
Content slots: `[title]`, `[breadcrumbs]`, `[search]`, `[actions]`. Sits at `--topbar-h` height.
Tokens (on `:host`): `--ds-topbar-height`, `--ds-topbar-bg-color`, `--ds-topbar-border`, `--ds-topbar-title-text-color`, plus the `--ds-topbar-crumb-*` set for the breadcrumb row. **The topbar owns no bottom gap** — it has no margin token and sets no margin; spacing to the next block belongs to the page or to `ds-app-layout`'s content padding.

#### `<ds-app-layout>` — `AppLayoutComponent`
Inputs: `topbarSpan: 'content' | 'full' = 'content'`, `railOpen: model<boolean> = false` (the overlay rail below `--bp-lg`), `railLabel: string = 'Navigation'`, `restoreScroll: boolean = false`, `restoreScrollTimeout: number = 2000` (ms), `scrollReset: 'path' | 'always' | 'never' = 'path'`
Content slots: `[sidenav]`, `[topbar]`, default (the page)
Reads: `railId` and the read-only `railOverlay` signal, for a consumer-built burger; `dsRailTrigger` wires one for you.
Tokens: `--ds-app-layout-pad-x`, `--ds-app-layout-pad-y`, `--ds-app-layout-content-max-width`, `--ds-app-layout-height`, `--ds-app-layout-rail-bg-color`, `--ds-app-layout-rail-shadow`, `--ds-app-layout-scrim-color`
It owns the app's scroll CONTAINER, so a screen that needs to move the scroll calls `LayoutScrollService` rather than touching `window`.

#### `<ds-auth-layout>` — `AuthLayoutComponent`
Inputs: `brand: string | null = null`, `logoLetter: string | null = null`, `tagline: string | null = null` (all three fall back to `DS_CONFIG.brand`), `cardElevation: CardElevation = 'raised'`, `cardPadding: CardPadding = 'lg'`, `landmark: 'main' | 'none' = 'none'`
Content slots: `[brand]` (replaces the whole mark row), `[dsBrandName]` (the name beside the generated mark), default (the card body), `[dsAuthSupport]` (the line under the card)
Tokens: `--ds-auth-layout-min-height`, `--ds-auth-layout-bg-color`, `--ds-auth-layout-gap`, `--ds-auth-layout-pad-block`, `--ds-auth-layout-card-max-width`, `--ds-auth-layout-mark-size`, `--ds-auth-layout-mark-radius`, `--ds-auth-layout-mark-bg-color`, `--ds-auth-layout-mark-label-color`
`landmark="main"` only when the page has no other `<main>`; the sign-in card is not automatically the document's main landmark.

#### `<ds-page-header>` — `PageHeaderComponent`
Inputs: `eyebrow: string = ''`, `title: required string`, `subtitle: string = ''`, `compact: boolean = false`, `divider: boolean = false`, `metaDivider: boolean = false`
Content slots: `[breadcrumbs]`, `[title-badge]` (sits next to the title text), `[actions]` (right edge of title row), `[meta]` (under the title row), `[tabs]` (under the meta row)
Tokens: `--ds-page-header-eyebrow-text-color`, `--ds-page-header-title-text-color`, `--ds-page-header-subtitle-text-color`, `--ds-page-header-meta-text-color`, `--ds-page-header-meta-icon-color`, `--ds-page-header-divider`, `--ds-page-header-title-fs` (default `--font-size-h3`; `compact` flips to `--font-size-h4`). The page-header does NOT own its bottom gap — the parent page `:host` owns spacing via `display: flex; flex-direction: column; gap: var(--space-4)`.

#### `<ds-page-footer>` — `PageFooterComponent`
Input: `variant: 'default' | 'compact' | 'save' = 'default'`
Content: default `<ng-content>`. Sticky footer bar pattern.

#### `<ds-breadcrumbs>` — `BreadcrumbsComponent`
Inputs: `items: BreadcrumbItem[] | null = null` (`{ label?, href?, icon? }` — when `null`/omitted, the component reads from `BreadcrumbsService.items` so route-driven flows work without a per-page `[items]` binding), `separator: IconName | null = null` (overrides `DsConfig.breadcrumbs.separator`, falls back to `'chevronRight'`), `clickable: boolean | null = null` (overrides `DsConfig.breadcrumbs.clickable`, falls back to `true`)
Output: `(navigate): BreadcrumbItem` — emits when an item with `href` is clicked and `clickable` resolves to `true` (event is `preventDefault`-ed so the consumer can decide what to do)

#### `<ds-tabs>` + `<ds-tab>` — `TabsComponent`, `TabComponent`
Container holds `<ds-tab label="…">` children.
Tabs inputs: `selectedIndex: model<number> = 0`, `variant: 'line' | 'pills' = 'line'`
Tab inputs: `label: required string`, `icon: IconName | null = null`, `count: number | null = null`, `disabled: boolean = false`. The tab's projected content renders in the active panel.
Tokens: `--ds-tab-label-color`, `--ds-tab-label-color-hover`, `--ds-tab-label-color-active`, `--ds-tab-indicator-color`, `--ds-tab-indicator-width`, `--ds-tab-pad-x`, `--ds-tab-pad-y`, `--ds-tabs-divider`, `--ds-tabs-pills-bg-color`, `--ds-tab-pill-bg-color-hover` (inactive hover, defaults to `var(--primary-subtle)`), `--ds-tab-pill-bg-color-active` (defaults to `var(--surface-default)` — elevated card), `--ds-tab-pill-bg-color-active-hover` (defaults to `var(--primary-subtle)`), `--ds-tab-pill-label-color-active` (defaults to `var(--primary-strong)`), `--ds-tab-pill-radius` (defaults to `var(--radius-md)` — same as buttons/inputs; override per-instance to `var(--radius-pill)` for fully round pills).

#### `<ds-stepper>` — `StepperComponent`
Inputs: `steps: readonly string[] = []`, `current: number = 0`. Horizontal step indicator with done/active/upcoming nodes.

#### `<ds-pagination>` — `PaginationComponent`
Inputs: `total: required number`, `pageSize: model<number> = 10`, `currentPage: model<number> = 1`, `pageSizeOptions: number[] = [10, 25, 50, 100]`, `showLabel: boolean = true`
Outputs: `(pageChange): number`, `(pageSizeChange): number`

#### `<ds-divider>` — `DividerComponent`
Inputs: `variant: 'default' | 'strong' | 'vertical' | 'label' = 'default'`, `spacing: 'none' | 'sm' | 'md' | 'lg' = 'md'`
Content: label text (when `variant="label"`).

---

### Surfaces

#### `<ds-card>` — `CardComponent`
Inputs: `elevation: 'flat' | 'raised' | 'hover' | 'interactive' = 'flat'`, `padding: 'none' | 'sm' | 'md' | 'lg' | null = null` (when `null`, no `padding-*` class is applied and the consumer controls padding via own CSS or `--ds-card-pad`)
Output: `(pressed): MouseEvent` — fires only when `elevation="interactive"`
Tokens: `--ds-card-bg-color`, `--ds-card-border`, `--ds-card-radius`, `--ds-card-pad`, `--ds-card-shadow`, `--ds-card-shadow-hover`, `--ds-card-focus-shadow`, `--ds-card-hover-lift`, `--ds-card-overflow`
Full-bleed child: a child whose background reaches the card edge paints square corners over the radius, and the host cannot fix it — the rounded box is the card's inner element. Set `--ds-card-overflow: clip` (`clip`, not `hidden`, so the card stays out of the scroll-container business). It is opt-in because a clipped card also cuts the focus ring off a child at its edge; where the clipped card holds focusable content, pair it with `data-focus="inset"`.
Convention tokens (consumer-side `.title` projected into the card slot — declared at `:root`, not on the host): `--card-title-fs` (default `var(--font-size-h4)` = 22px; a brand can step it down to `var(--font-size-h5)`). Consumer markup: `<h3 class="title">…</h3>`; local `.title` class reads the token via `font:` shorthand together with `--font-weight-bold` / `--line-height-snug` / `--font-heading`.

#### `<ds-accordion>` + `<ds-accordion-item>` — `AccordionComponent`, `AccordionItemComponent`
Accordion is a thin wrapper that rounds + borders its children. Item inputs: `title: string = ''`, `expanded: model<boolean> = false`. Content slots on item: default (body), `[badge]` (rendered next to the title in the header).

---

### Overlay

#### `<ds-modal>` — `ModalComponent`
Inputs: `open: model<boolean> = false`, `size: 'sm' | 'md' | 'lg' = 'md'`, `danger: boolean = false`, `title: required string`
Output: `(closed): void` — fires on backdrop click, close button, or `open` being set to false. `(confirmed)` is declared on the component but no internal handler emits it; treat it as not implemented and emit confirmation from the consumer-side action button instead.
Content slots: `[body]`, `[impact]` (highlighted strip under the body for destructive consequences), `[actions]` (footer button row). Backdrop click + close button close the dialog.

#### `<ds-modal-card>` — `ModalCardComponent`
The visual card the `<ds-modal>` host renders inside its backdrop. Exposed as a separate selector for cases where you need custom positioning (e.g. inside a drawer) without re-implementing the dialog chrome. Inputs: `size`, `danger`, `title: required`, `showClose: boolean = true`. Output: `(closed)`. Slots: `[body]`, `[impact]`, `[actions]`.

#### `<ds-drawer>` — `DrawerComponent`
Side panel (no `side` input — always anchored right).
Inputs: `open: model<boolean> = false`, `size: 'md' | 'lg' = 'md'`, `title: string = ''`
Output: `(closed): void`
Content slots: `[drawer-body]`, `[drawer-footer]`.

#### `<ds-bottom-sheet>` — `BottomSheetComponent`
Mobile-first panel anchored to the bottom edge (touch equivalent of drawer/modal). Drag-down on the grab strip, scrim tap, or Esc dismisses; body scroll locks while open; caps width + centres on wide viewports.
Inputs: `open: model<boolean> = false`, `title: string = ''`
Output: `(closed): void`
Content slots: default (body), `[actions]` (footer).

#### `<ds-popover>` — `PopoverComponent`
Floating panel anchored to a trigger via CDK overlay. Input: `align: 'start' | 'end' = 'start'` — controls overlay alignment relative to the trigger (`start` = left-edge anchored, `end` = right-edge anchored). Open via the component method `toggle(triggerElement)` (or `close()`), and project the panel body inside a `<ng-template #panel>` (read internally via `viewChild`).

#### `[dsTooltip]` — `TooltipDirective`
Attribute directive. Apply to any focusable element.
Inputs: `dsTooltip: string = ''` (the text; empty disables), `dsTooltipPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top'`, `dsTooltipDelay: number = 120` (ms)
Renders `<ds-tooltip-panel>` via CDK overlay on hover / focus; hides on leave / blur.

#### `<ds-menu>` + `<ds-menu-item>` — `MenuComponent`, `MenuItemComponent`
Menu is a container. Item inputs: `icon: IconName | null = null`, `disabled: boolean = false`, `danger: boolean = false`. Output: `(pressed): MouseEvent`. Content: label text; supports `[icon]` content slot for custom icons.

#### `<ds-dropdown>` — `DropdownComponent`
Trigger button + CDK overlay panel combo.
Inputs: `value: model<string> = ''`, `options: DropdownOption[]` (`{ label, value, disabled?, icon? }`), `placeholder: string = 'Select…'`, `size: 'sm' | 'md' | 'lg' = 'md'`, `label: string = ''`, `disabled: boolean = false`, `readOnly: boolean = false`, `error: boolean = false`, `name: string | null = null`
Selection is communicated via the `value` model. Keyboard: ArrowUp/Down, Enter/Space, Home/End, Escape.

---

### Tables

#### `<ds-table>` — `TableComponent<T extends { id: string }>`
Inputs: `data: required readonly T[]`, `columns: required readonly TableColumn<T>[]`, `selectable: boolean = false`, `bordered: boolean = false` (opt-in outer border + radius; off by default so tables flush inside `<ds-card padding="none">` don't double-border), `loading: false | 'skeleton' | 'overlay' = false`, `stickyHeader: boolean = true`, `selectedIds: model<Set<string>>`, `sortKey: model<string | null>`, `sortDir: model<SortDir>` (`'asc' | 'desc' | null`), `skeletonRows: number = 5`
Outputs: `(rowClick): T`, `(sortChange): SortChangeEvent` (`{ key, dir }`)
Column shape: `{ key: string, label: string, sortable?: boolean, align?: 'left' | 'right' | 'center', cell?: (row: T) => string }`
Opening a row: give one column `link: (row) => <route target> | null` and its value renders as a real `<a>` — visible without hovering, in the tab order as a link, and Ctrl/Cmd-clickable, none of which a clickable `<tr>` can do. `null` for a row leaves that cell as plain text, so a partly-reachable list stays one column; external URLs go through a `[dsCellTemplate]` instead, since `link` takes Angular route targets only. It composes with `rowInteractive` (the link stops its click from reaching the row), but the two together cost **two tab stops per row** — on a long list prefer the link alone. `interactive: true` only tints a cell on row hover, which a keyboard or touch user never sees; prefer `link` wherever the row actually leads somewhere.
Cell templates: `<ng-template dsCellTemplate="<colKey>" let-row>…</ng-template>` — `row` is typed `unknown`, narrow via a helper method on the host.
Content slots: `[empty]` (rendered when `data.length === 0`), `[bulk-actions]` (rendered in the bulk action bar when `selectable && some selected`)
Loading modes: `'skeleton'` replaces rows with shimmer placeholders driven by the global `--skeleton-shimmer-x` keyframe; `'overlay'` keeps existing rows visible behind a translucent layer with a centred spinner.
Tokens: `--ds-table-border: var(--border-default)`, `--ds-table-radius: var(--radius-md)`, `--ds-table-bg-color`, `--ds-table-head-text-color: var(--text-secondary)`, `--ds-table-head-bg-color: var(--surface-secondary)`, `--ds-table-head-fs: var(--font-size-xs)`, `--ds-table-row-hover-bg-color`, `--ds-table-row-selected-bg-color`, `--ds-table-divider`, `--ds-table-sort-active-icon-color`, `--ds-table-cell-pad-x/y`. (Renamed 2026-06: `--ds-table-header-*` → `--ds-table-head-*`, matching the tokens reference.)

---

### Domain

#### `<ds-w3w>` — `W3wComponent`
What3Words address chip — branded display for `///word.word.word` addresses; click-to-copy.
Inputs: `address: required string`, `prefix: string = '///'`, `copyable: boolean = true`
Output: `(copied): string` — emits the raw `address` value after a copy attempt

---

## Icons

Icon component: `<ds-icon [name]="iconName" [size]="16" [stroke]="1.75">`. `IconName` is `keyof typeof ICONS | string` — built-in DS names autocomplete; consumer-registered names (see `provideDsIcons` below) accept any string at the cost of autocomplete.

All built-in icons (kebab-case where indicated, camelCase otherwise — DS uses both):

`search` `plus` `minus` `check` `x` `chevronDown` `chevronRight` `chevronLeft` `chevronUp` `arrowRight` `arrowUp` `arrowDown` `info` `warn` `error` `success` `bell` `settings` `user` `users` `home` `calendar` `truck` `box` `map` `activity` `folder` `edit` `external` `trash` `copy` `download` `upload` `eye` `filter` `sort` `sortAsc` `sortDesc` `grid` `list` `moreH` `moreV` `link` `flag` `star` `inbox` `archive` `clock` `refresh` `play` `pause` `cmd` `paperclip` `file` `image` `lock` `logout` `help` `pin` `bookmark` `sparkle` `layers` `chart` `gauge` `package` `git` `sun` `moon` `save` `rotate` `qr` `globe` `phone` `bin` `pen` `smile` `frown` `mail` `eye-off` `check-circle` `drag`

Icons render inside `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">`. For consumer-side icons without forking DS, use `provideDsIcons(…)` below.

#### `DS_ICON_REGISTRY` / `provideDsIcons(icons)`

Consumer apps can register additional icons without forking DS. Each entry maps a name to the raw SVG body — everything that goes *inside* `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">`. Typically one or more `<path>` / `<circle>` / `<rect>` elements with no `stroke`/`fill` of their own (the host SVG paints them).

```ts
import { provideDsIcons } from '@ids-group-ltd/ids-design-system';

bootstrapApplication(AppComponent, {
  providers: [
    provideDsIcons({
      'cloud-upload': '<path d="M7 18a5 5 0 1 1 .9-9.9 …"/><path d="M12 21V11"/>',
      shield:         '<path d="M12 3 4 6v6c0 5 …"/>',
    }),
  ],
});
```

Lookup order: built-in `ICONS` first, then the consumer registry. Names that collide with built-ins are ignored — fork the DS source if you need to override a built-in.

---

## App config

#### `DS_CONFIG` / `provideDsConfig(config)`

Inject `DS_CONFIG` token (default factory returns `{}`) to set library-wide defaults that consumer-level component inputs can still override.

```ts
import { provideDsConfig } from '@ids-group-ltd/ids-design-system';

bootstrapApplication(AppComponent, {
  providers: [
    provideDsConfig({
      breadcrumbs: { separator: 'chevronRight', clickable: true },
    }),
  ],
});
```

`DsConfig` shape (the exported `DsConfig` type is the full contract):

Twelve sections. The exported `DsConfig` type is the source of truth — each key carries its own
doc comment there, including why it is an app-level decision at all.

```ts
interface DsConfig {
  field?: {
    reserveMessage?: boolean;              // keep a message line of space when empty
    errorMessages?: Record<string, string>; // fallback text per validation-error kind
    stateIcons?: false | {                 // the message line's leading glyph, per state
      error?: IconName | false;            // default: `error`
      warning?: IconName | false;          // default: `warn`
      success?: IconName | false;          // default: `success`
      hint?: IconName | false;             // default: NONE — hint is not a state
    };
  };
  control?: { size?: DsSize };             // every control on the field-height contract
  card?: { elevation?: CardElevation; padding?: CardPadding };
  table?: { stickyScrollbar?: boolean; bordered?: boolean };
  modal?: { dividers?: boolean };          // reaches a ModalService confirm, which has no host to bind
  icon?: { size?: number };
  badge?: { withDot?: boolean };
  breadcrumbs?: { separator?: IconName; clickable?: boolean };
  datePicker?: { locale?: string; dateFormat?: string; firstDayOfWeek?: number };
  timePicker?: { format?: '24h' | '12h' };
  avatar?: { initials?: (name: string) => string };
  brand?: { name?: string; logoLetter?: string; tagline?: string };
}
```

Precedence is always: **explicit input → config → component default.** A component publishes what it
resolved as a public readback (`sizeResolved()`, `dividersResolved()`, …) so a host can read the
effective value rather than re-deriving the chain.

**Call `provideDsConfig` once per injector.** Two calls in the same `providers` array do NOT merge —
both resolve their parent with `skipSelf`, so the later wins and the earlier is silently lost. Merging
happens across injector LEVELS: a route or component inherits the app's config and overrides only the
keys it names.

---

## Services

#### `BreadcrumbsService`

`@Injectable({ providedIn: 'root' })`. Signal-based state primitive — apps push crumbs, `<ds-breadcrumbs>` reads from here when its `[items]` input is omitted.

```ts
private readonly crumbs = inject(BreadcrumbsService);
// signal-readable items
this.crumbs.items()      // -> BreadcrumbItem[]
// mutators
this.crumbs.set([{ label: 'Overview', href: '/workspaces' }, { label: 'Detail' }]);
this.crumbs.push({ label: 'Extra' });
this.crumbs.replaceLast({ label: 'Renamed' });
this.crumbs.pop();
this.crumbs.clear();
```

**Two ways to feed it:**

1. **Programmatic** — each page calls `this.crumbs.set(...)` (e.g. inside `effect(() => …)` when the page model resolves). Use when crumb labels depend on data the page already has loaded (a program name, a campaign title).

2. **Route-driven** — annotate routes with `data.breadcrumb` and run a Router→Service bridge once at app bootstrap. `breadcrumb` accepts:
   - `string` → `{ label: string, href: <built-from-url> }`
   - `BreadcrumbItem`
   - `BreadcrumbItem[]`
   - `(snap: ActivatedRouteSnapshot) => string | BreadcrumbItem | BreadcrumbItem[]`

   Mix-and-match: route bridge sets a base trail, page effect overrides with a richer version when its data is ready.

#### `ToastService`
`@Injectable({ providedIn: 'root' })`. Inject and call:
- `show(opts: ToastOptions): ToastRef` — `{ title?, body, variant?: 'info' | 'success' | 'warning' | 'error', dismissible?, durationMs? = 5000 }`. Returns `{ id, dismiss() }`.
- `dismissAll(): void`

On first `show()` the service lazily creates a CDK overlay and mounts a `<ds-toast-region>` into it. **Consumers do not need to add a region element to their template** — the service handles mounting itself.

---

## Migration tips

- **Don't add `class="card"` on `<ds-card>`.** Some consumer apps carry a legacy global `.card` rule that adds a second border on top of the component's own — use `ds-card` as-is, override tokens via `ds-card { --ds-card-...: ... }`, or pass a domain class like `class="kpi"`.
- **`@use 'tokens'` alone won't give you `.link` / `.t-*` / `.grid-*`.** Pull those partials explicitly or `@use 'styles/ds'` for the full aggregate. See Foundations → Global helper classes.
- **`<ng-content>` default slot is allowed once per template.** If you duplicate it across `@if/@else` branches Angular silently drops projected children. Hoist a single default slot and toggle visibility via a class.
- **Tokens on `:host`, not on the inner root class.** Defaults declared inside `.card { --ds-card-...: … }` block external overrides because the inner specificity wins. Move them to `:host` so consumer `ds-card { --ds-card-...: ... }` cascades through.
- **Brand overrides Tier 1 palette + a few Tier 2 roles.** Don't add brand-specific values inside individual components; put them in a consumer-side `_brand-*.scss` scoped to `[data-brand="…"]` — the DS itself stays brand-agnostic.
