# DS Library Catalogue

> Index of the design system components, global helpers, tokens and icons. Use it as a single reference when migrating UI to DS. Each entry shows the selector, the key inputs/outputs/slots, and the public CSS custom properties that consumers can override.
>
> **Import path:** `import { ButtonComponent, … } from 'ds'` (the library publishes as `ds`; consumer apps add a `paths` mapping in their `tsconfig.json` or install the built `dist/ds` package).
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
- Status pills: `--status-planning-bg/fg`, `--status-confirmed-bg/fg`, `--status-active-bg/fg`, `--status-completed-bg/fg`

**Geometry:**
- Spacing: `--s-0`, `--s-px`, `--s-0-5` (2px), `--s-1` (4px), `--s-1-5` (6px), `--s-2` (8px), `--s-2-5` (10px), `--s-3` (12px), `--s-4` (16px), `--s-5` (20px), `--s-6` (24px), `--s-8` (32px), `--s-10` (40px), `--s-12` (48px), `--s-14` (56px), `--s-16` (64px), `--s-20` (80px), `--s-24` (96px), `--s-32` (128px)
- Radius: `--r-0`, `--r-sm` (4px), `--r-md` (8px), `--r-lg` (12px), `--r-2xl` (24px), `--r-pill` (999px), `--r-pill-value`, `--r-flat`
- Border widths: `--bw-default` (1px), `--bw-strong` (2px)
- Hit targets: `--hit-xs` (24), `--hit-sm` (28), `--hit-md` (36), `--hit-min` (32), `--hit-cozy` (40), `--hit-comfy` (44), `--hit-touch` (48)
- Icon sizes: `--icon-2xs` (10), `--icon-xs` (12), `--icon-sm` (14), `--icon-md` (16), `--icon-lg` (20)

**Typography:**
- Families: `--font-sans`, `--font-mono`, `--font-display`, `--font-heading`
- Weights: `--fw-regular` 400, `--fw-medium` 500, `--fw-semibold` 600, `--fw-bold` 700, `--fw-extrabold` 800 (overridden to 700 in brand-mm)
- Sizes: `--fs-display` 64, `--fs-h1` 48, `--fs-h2` 36, `--fs-h3` 28, `--fs-h4` 22, `--fs-h5` 18, `--fs-h5-strong` 20, `--fs-l` 18, `--fs-m` 16, `--fs-s` 14, `--fs-xs` 12, `--fs-2xs` 11, `--fs-3xs` 10, `--fs-4xs` 9, `--fs-mono` 13
- Line heights: `--lh-tight` 1.1, `--lh-snug` 1.25, `--lh-base` 1.4, `--lh-loose` 1.6, `--lh-flat` 1
- Letter spacing: `--ls-tight`, `--ls-snug`, `--ls-normal`, `--ls-wide`, `--ls-wider`

**Motion:**
- Durations: `--dur-instant` 80ms, `--dur-fast` 120ms, `--dur-base` 180ms, `--dur-slow` 260ms, `--dur-slower` 400ms
- Loop: `--dur-loop-fast` 700ms, `--dur-loop-slow` 1400ms
- Easing: `--ease-standard`, `--ease-emphasized`, `--ease-decelerate`, `--ease-accelerate`, `--ease-spring`

**Elevation:**
- `--z100/200/300/400` (raw), `--shadow-popover`, `--shadow-modal`, `--shadow-toast`, `--shadow-card`
- `--blur-sm`, `--blur-md`

**Z-index:**
- `--layer-base`, `--layer-raised`, `--layer-sticky`, `--layer-dropdown`, `--layer-overlay`, `--layer-drawer`, `--layer-modal`, `--layer-popover`, `--layer-toast`, `--layer-tooltip`

**Focus rings:** `--focus-ring`, `--focus-ring-inverted`, `--focus-ring-error`, `--focus-field`, `--focus-field-error`

---

### Grid

Responsive 4-tier page grid loaded via `@use 'styles/ds'` (or directly via `@use '../../ds/src/lib/styles/page-grid';`). One column-count per breakpoint, gutters and margins scale with the viewport, container caps on the widest tier and stays fluid below.

| Tier         | Range         | Cols | Gutter        | Margin         | Container cap            |
| ------------ | ------------- | ---- | ------------- | -------------- | ------------------------ |
| Mobile       | ≤ 640px       | 4    | `--s-3` (12)  | `--s-4` (16)   | fluid                    |
| Tablet       | 641 – 1024px  | 8    | `--s-4` (16)  | `--s-6` (24)   | fluid                    |
| Desktop      | 1025 – 1440px | 12   | `--s-5` (20)  | `--s-8` (32)   | fluid                    |
| Desktop wide | ≥ 1441px      | 12   | `--s-6` (24)  | `--s-10` (40)  | `--col-cap-content` 1280 |

**Tokens:** `--bp-xs` 480, `--bp-sm` 640, `--bp-md` 768, `--bp-lg` 1024, `--bp-xl` 1441, `--bp-2xl` 1536. Per-tier gutters/margins live as `--page-gutter-{mobile|tablet|desktop|wide}` and `--page-margin-{mobile|tablet|desktop|wide}`; the active values resolve through `--page-gutter` / `--page-margin` on `.page-grid`. Content caps: `--col-cap-text` 720, `--col-cap-content` 1280.

**Class API:**
- `.page-grid` — root grid container. Sets `display: grid`, tier-appropriate `grid-template-columns`, `gap`, horizontal `padding`, and `max-width: var(--col-cap-content)` with `margin: 0 auto` for centring at the widest tier.
- `.col-span-1` … `.col-span-12` — span helpers. At narrower tiers (8 / 4 cols), a span wider than the active column-count wraps to its own row.

**Composition rules:**
- One grid per page. Sub-regions align to the same column tracks — never invent a local grid.
- Snap to columns, not pixels. Canonical two-column splits: 8+4, 6+6, 9+3. Never 7+5.
- Sidenav lives OUTSIDE the grid. Reserve its rail (collapsed 64px / open 240px via `--sidenav-w` / `--sidenav-w-collapsed`), then start `.page-grid` in the remaining width.
- Prose caps at 720px via `--col-cap-text` regardless of grid width.
- 8+4 is canonical for record-detail pages (main + meta sidebar); 9+3 is reserved for kit / track-plan picker rails.

**Markup example:**

```html
<main class="page-grid">
  <section class="col-span-8">Main content</section>
  <aside class="col-span-4">Meta sidebar</aside>
</main>
```

---

### Global helper classes

The DS aggregate (`@use 'styles/ds'`) forwards the full stack: theme primitives + tokens + tokens-charts + reset + typography + layout-utils + page-grid + scrollbar + icon-base + dropdown-overlay + skeleton-shimmer. Consumers that only `@use 'styles/tokens'` get the tokens (and transitively `.link` + `@fontsource` font faces, since `_tokens.scss` `@use`s `_link.scss` and `_fonts.scss`) but **do not** pick up typography utilities, `.grid-*`, `.page-grid` / `.col-span-*`, or the dropdown/skeleton overlay rules — load each partial explicitly or switch to the aggregate.

- `.link` — anchor styling, declared in `_link.scss`. Modifiers: `.quiet` `.inline` `.standalone` `.xs` `.sm` `.lg`. Hover→`color-mix(text-link, black 20%)`, active→`color-mix(text-link, black 35%)`, disabled via `[aria-disabled="true"]`. Available whenever `_tokens.scss` is loaded (transitively via `@use 'styles/tokens'` or `@use 'styles/ds'`).
- Typography utilities (`_typography.scss`): `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-h4`, `.t-h5`, `.t-l`, `.t-l-bold`, `.t-m`, `.t-m-bold`, `.t-s`, `.t-s-bold`, `.t-xs`, `.t-xs-bold`, `.t-overline`, `.t-caption`, `.t-mono`, `.t-mono-block`, `.sr-only`
- Layout (`_layout-utils.scss`): `.grid-2`, `.grid-3`, `.grid-4`. Breakpoints: at ≤1100px `.grid-4` drops to 3 columns; at ≤820px both `.grid-3` and `.grid-4` drop to 2 columns. Gap is `--s-4`.
- Page grid (`_page-grid.scss`): `.page-grid` + `.col-span-1` … `.col-span-12`. 4-tier responsive grid (4 / 8 / 12 / 12 columns); see Foundations → Grid above for the full spec.
- Skeleton shimmer (`_skeleton-shimmer.scss`): drives the global `--skeleton-shimmer-x` keyframe used by `<ds-skeleton>` and table skeleton rows.
- Dropdown overlay (`_dropdown-overlay.scss`): styles the `.ds-dropdown-panel` class used by select/dropdown/combobox/date-picker CDK portals — these panels live outside the host's encapsulated tree, so the styles must be global.

---

## Components

### Form & input

#### `<ds-button>` — `ButtonComponent`
Inputs: `variant: ButtonVariant = 'primary'` (`'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' | 'error' | 'success' | 'warning' | 'text'`), `size: ButtonSize = 'l'` (`'s' | 'm' | 'l' | 'sm' | 'md' | 'lg'` — legacy s/m/l = 24/32/40, canonical sm/md/lg = 32/40/48), `type: 'button' | 'submit' | 'reset' = 'button'`, `disabled: boolean = false`, `loading: boolean = false`, `iconOnly: boolean = false`
Variant → role mapping: `primary` → `--primary` fill · `secondary` → `--secondary` fill · `tertiary` → `--secondary-muted` tonal fill · `ghost` → chrome-on-hover (chromeless at rest in iconOnly) · `outline` → bordered surface (keeps border in iconOnly) · `error/success/warning` → status fills · `text` → no-chrome text button. (Renamed 2026-06 from danger→error, link→text; ghost+outline both kept — they differ in iconOnly mode.)
Output: `(pressed): MouseEvent` — only fires when not disabled and not loading
Content slots: default (label / leading or trailing icon)
Tokens: `--ds-button-bg`, `--ds-button-bg-hover`, `--ds-button-bg-active`, `--ds-button-bg-disabled`, `--ds-button-fg`, `--ds-button-fg-disabled`, `--ds-button-border`, `--ds-button-radius`, `--ds-button-focus-shadow`
> **`iconOnly` is deprecated** — use `<ds-icon-button>` for icon-only actions. Retained for back-compat until consumers migrate.

#### `<ds-icon-button>` — `IconButtonComponent`
Icon-only action with its own taxonomy, distinct from `ds-button`. `ariaLabel` is required (icon-only must be labelled for a11y).
Inputs: `icon: required IconName`, `ariaLabel: required string`, `variant: IconButtonVariant = 'standard'` (`'standard' | 'filled' | 'tonal' | 'outlined'`), `size: IconButtonSize = 'md'` (`'sm' | 'md' | 'lg'` = 32/40/48), `type: 'button' | 'submit' | 'reset' = 'button'`, `disabled: boolean = false`, `selected: boolean = false` (toggle — sets `aria-pressed`)
Output: `(pressed): MouseEvent` — fires when not disabled
Variant emphasis: `standard` chromeless (hover-reveal) · `filled` `--primary` · `tonal` `--primary-muted` · `outlined` bordered. `selected` renders the pressed/active fill.
Tokens: `--ds-icon-button-bg`, `--ds-icon-button-fg`, `--ds-icon-button-border`, `--ds-icon-button-bg-hover`, `--ds-icon-button-fg-hover`, `--ds-icon-button-radius`, `--ds-icon-button-focus-shadow`

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

Tokens: `--ds-input-bg`, `--ds-input-border`, `--ds-input-border-hover`, `--ds-input-border-focus`, `--ds-input-fg`, `--ds-input-placeholder`, `--ds-input-radius`, `--ds-input-pad-x`, `--ds-input-pad-y`, `--ds-input-focus-shadow`, `--ds-input-border-error`, `--ds-input-bg-error`, `--ds-input-border-success`, `--ds-input-bg-disabled`

#### `<ds-textarea>` — `TextareaComponent`
Multi-line counterpart to `<ds-input>` — same wrapper/states, reuses the `--ds-input-*` token family. No prefix/suffix slots.
Inputs: `value: model<string>`, `size: 'sm' | 'md' | 'lg' = 'md'`, `label`, `hint`, `placeholder`, `disabled`, `invalid`, `required`, `optional: boolean = false`, `name`, `rows: number = 3`
Tokens: same `--ds-input-*` family as `<ds-input>` (textarea overrides `--ds-input-pad-y` to `--s-3` for vertical breathing room).

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
Pre-styled search input with built-in icon.
Inputs: `value: model<string>`, `placeholder: string = 'Search'`, `shortcut: string = ''` (rendered as a hint pill, e.g. `⌘K`), `showIcon: boolean = true`
Output: `(submitted): string` — emits the current value on Enter / form submit

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
Inputs: `variant: BadgeVariant = 'neutral'` (`'planning' | 'confirmed' | 'active' | 'completed' | 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'solid' | 'count'`), `withDot: boolean = false`, `solid: boolean = false`
Content: label text. Use for status pills, counts, lifecycle markers.

#### `<ds-status-dot>` — `StatusDotComponent`
Input: `status: StatusValue = 'planning'` (`'planning' | 'confirmed' | 'active' | 'completed' | 'warning' | 'error' | 'secondary'`). Tiny coloured dot.

#### `<ds-tag>` — `TagComponent`
Inputs: `variant: 'solid' | 'ghost' = 'solid'`, `closable: boolean = false`
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
Inputs: `collapsed: boolean = false`, `brand: string = ''` (renders a letter mark + name; omit to project custom content)
Content: default slot for groups/items + custom brand/footer rows
Tokens: `--ds-sidenav-bg`, `--ds-sidenav-border`, `--ds-sidenav-width`, `--ds-sidenav-width-collapsed`, `--ds-sidenav-mark-bg`, `--ds-sidenav-mark-fg`

#### `<ds-sidenav-group>` — `SidenavGroupComponent`
Inputs: `label: string = ''`, `icon: IconName | null = null`, `expandable: boolean = false`, `expanded: model<boolean> = true`
Content slots: default (items); `[ds-group-icon]` (custom group icon when not using a DS IconName)
When `expandable=true` renders header button with toggle + caret; collapses body when not expanded.

#### `<ds-sidenav-item>` — `SidenavItemComponent`
Inputs: `icon: IconName | null = null` (optional — falls back to `[icon]` slot), `label: required string`, `href: string = ''`, `routerLink: string | readonly unknown[] | null = null`, `active: boolean = false`, `badge: number | null = null`, `hasAlert: boolean = false`
Content slots: `[icon]` (custom icon when not using a DS IconName), `[trailing]` (right-aligned chrome — badges, indicators, kbd shortcuts)
Tokens (on `:host`): `--ds-sidenav-item-fg`, `--ds-sidenav-item-fg-hover`, `--ds-sidenav-item-bg-hover`, `--ds-sidenav-item-bg-active` (default: `--primary`), `--ds-sidenav-item-fg-active` (default: `--text-on-primary`), `--ds-sidenav-item-rail` (left rail, default: `--secondary`), `--ds-sidenav-item-radius`, `--ds-sidenav-alert-color`

#### `<ds-topbar>` — `TopBarComponent`
No inputs.
Content slots: `[title]`, `[breadcrumbs]`, `[search]`, `[actions]`. Sits at `--topbar-h` height.
Tokens (on `:host`): `--ds-topbar-margin-b` (default `--s-4` = 16px) — bottom gap to the next content block. The topbar owns this gap globally; pages MUST NOT add their own `padding-top` to compensate.

#### `<ds-page-header>` — `PageHeaderComponent`
Inputs: `eyebrow: string = ''`, `title: required string`, `subtitle: string = ''`, `compact: boolean = false`, `divider: boolean = false`, `metaDivider: boolean = false`
Content slots: `[breadcrumbs]`, `[title-badge]` (sits next to the title text), `[actions]` (right edge of title row), `[meta]` (under the title row), `[tabs]` (under the meta row)
Tokens: `--ds-pagehdr-eyebrow-fg`, `--ds-pagehdr-title-fg`, `--ds-pagehdr-sub-fg`, `--ds-pagehdr-meta-fg`, `--ds-pagehdr-meta-icon-fg`, `--ds-pagehdr-divider`, `--ds-pagehdr-title-fs` (default `--fs-h3`; `compact` flips to `--fs-h4`). The page-header does NOT own its bottom gap — the parent page `:host` owns spacing via `display: flex; flex-direction: column; gap: var(--s-4)`.

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
Tokens: `--ds-tab-fg`, `--ds-tab-fg-hover`, `--ds-tab-fg-active`, `--ds-tab-indicator-color`, `--ds-tab-indicator-width`, `--ds-tab-pad-x`, `--ds-tab-pad-y`, `--ds-tabs-divider`, `--ds-tabs-pills-bg`, `--ds-tab-pill-bg-hover` (inactive hover, defaults to `var(--primary-subtle)`), `--ds-tab-pill-bg-active` (defaults to `var(--surface-default)` — elevated card), `--ds-tab-pill-bg-active-hover` (defaults to `var(--primary-subtle)`), `--ds-tab-pill-fg-active` (defaults to `var(--primary-strong)`), `--ds-tab-pill-radius` (defaults to `var(--r-md)` — same as buttons/inputs; override per-instance to `var(--r-pill)` for fully round pills).

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
Tokens: `--ds-card-bg`, `--ds-card-border`, `--ds-card-radius`, `--ds-card-pad`, `--ds-card-shadow`, `--ds-card-shadow-hover`, `--ds-card-focus-shadow`, `--ds-card-hover-lift`
Convention tokens (consumer-side `.title` projected into the card slot — declared at `:root`, not on the host): `--card-title-fs` (default `var(--fs-h4)` = 22px; MM brand steps down to `var(--fs-h5)` = 18px). Consumer markup: `<h3 class="title">…</h3>`; local `.title` class reads the token via `font:` shorthand together with `--fw-bold` / `--lh-snug` / `--font-heading`.

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
Cell templates: `<ng-template dsCellTemplate="<colKey>" let-row>…</ng-template>` — `row` is typed `unknown`, narrow via a helper method on the host.
Content slots: `[empty]` (rendered when `data.length === 0`), `[bulk-actions]` (rendered in the bulk action bar when `selectable && some selected`)
Loading modes: `'skeleton'` replaces rows with shimmer placeholders driven by the global `--skeleton-shimmer-x` keyframe; `'overlay'` keeps existing rows visible behind a translucent layer with a centred spinner.
Tokens (host-scoped, override per-instance): `--ds-table-border: var(--border-default)`, `--ds-table-radius: var(--r-md)`, `--ds-table-header-fg: var(--text-secondary)`, `--ds-table-header-bg: var(--surface-secondary)`, `--ds-table-header-fs: var(--fs-xs)`.

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

Adding icons to DS: edit `src/lib/icons/icons.data.ts`; SVG paths render inside `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">`. For consumer-side icons without forking DS, use `provideDsIcons(…)` below.

#### `DS_ICON_REGISTRY` / `provideDsIcons(icons)`

Consumer apps can register additional icons without forking DS. Each entry maps a name to the raw SVG body — everything that goes *inside* `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">`. Typically one or more `<path>` / `<circle>` / `<rect>` elements with no `stroke`/`fill` of their own (the host SVG paints them).

```ts
import { provideDsIcons } from 'ds';

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
import { provideDsConfig } from 'ds';

bootstrapApplication(AppComponent, {
  providers: [
    provideDsConfig({
      breadcrumbs: { separator: 'chevronRight', clickable: true },
    }),
  ],
});
```

`DsConfig` shape (see `src/lib/config/ds-config.ts`):

```ts
interface DsConfig {
  breadcrumbs?: {
    separator?: IconName;
    clickable?: boolean;
  };
}
```

Currently consumed by:
- `<ds-breadcrumbs>` — `[separator]` / `[clickable]` inputs fall back to `breadcrumbs.separator` / `breadcrumbs.clickable` from config, then to `'chevronRight'` / `true`.

Add more sections to `DsConfig` as we extract reusable defaults; the precedence chain is always: explicit input → config → component default.

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

2. **Route-driven** — annotate routes with `data.breadcrumb` and run a Router→Service bridge once at app bootstrap. Example bridge lives at `app/core/breadcrumbs/breadcrumbs-route.bootstrap.ts` in this repo. `breadcrumb` accepts:
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
