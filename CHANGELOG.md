# Changelog

All notable changes to `@ids-group-ltd/ids-design-system` are documented here.

Versioning follows [SemVer](https://semver.org). Mapping from commit types:
`fix` → patch, `feat` → minor, breaking change (API or visual) → major.
While the package is on `0.x`, minor releases may contain breaking changes.

## Unreleased

### Breaking

- **`ds-combobox` renamed to `ds-autocomplete`.** The clearer industry name for the editable
  type-to-pick control (MUI's term); "combobox" survives only as the ARIA role — which the
  select-only `ds-select` trigger also carries. Renames: selector `ds-combobox` →
  `ds-autocomplete`; `ComboboxComponent` → `AutocompleteComponent`; exported types
  `ComboboxOption` / `ComboboxOptionGroup` / `ComboboxSize` / `ComboboxWidth` →
  `AutocompleteOption` / `AutocompleteOptionGroup` / `AutocompleteSize` / `AutocompleteWidth`;
  public tokens `--ds-combobox-focus-shadow` / `--ds-combobox-maxw` / `--ds-combobox-input-minw`
  → `--ds-autocomplete-*`; docs anchor `#combobox` → `#autocomplete`. Behavior unchanged.
- **`ds-dropdown` removed — use `ds-select`.** The two were near-identical select-only single
  pickers (same trigger, same panel, same keyboard model); `ds-select` is the richer canonical
  form field (`ControlValueAccessor`, `invalid` + `hint` via `ds-field-message`, `required` /
  `optional`, per-option icons, group-level `disabled`). Migration: `<ds-dropdown>` →
  `<ds-select>`; `[error]` → `[invalid]`; `[optionGroups]="groups"` → pass groups inline in
  `[options]` (`SelectItem = SelectOption | SelectOptionGroup`); `DropdownOption` /
  `DropdownOptionGroup` / `DropdownSize` → `SelectOption` / `SelectOptionGroup` / `SelectSize`.
  `readOnly` moved to `ds-select` (see Added). Docs "Dropdown" section removed — the Select
  section covers everything.

### Added

- **New `ds-time-picker` component.** A time field (HH:MM) that opens column wheels
  (Hours / Minutes, plus AM·PM in 12-hour mode) in a CDK overlay. Value is a canonical
  24-hour `"HH:MM"` string; **24h vs 12h display is chosen app-wide** via
  `provideDsConfig({ timePicker: { format: '12h' } })` (per-instance `[format]` override
  available). Supports `[minuteStep]`, `[minTime]` / `[maxTime]` + a `[disabledTime]`
  predicate, `single` and `range` modes (`[(value)]` is a `"HH:MM"` string or a
  `[start, end]` tuple), `clearable`, `size` (`sm` / `md` / `lg`), and reactive forms
  (`ControlValueAccessor`) with `invalid` / `hint` via `ds-field-message`. Full keyboard
  support (roving arrows per column, Home/End, Escape). Exports `TimePickerComponent`,
  `TimePickerMode`, `TimePickerSize`, `TimeFormat`, `TimeValue`, `TimeRangeValue`,
  `TimePickerValue`; new `DsConfig.timePicker.format`; public `--ds-time-picker-*` hooks.
- **Selection controls gain `size` + `required`.** `ds-checkbox` / `ds-radio` / `ds-switch`
  take a `size` input (`sm` / `md` / `lg`; `md` unchanged and still density-responsive) and
  a `required` input (adds `aria-required` + a `*` marker on the inline `[label]`). `ds-radio`
  (standalone) also gains `invalid` + `hint` via `ds-field-message`, matching checkbox/switch.
  New exported `CheckboxSize` / `RadioSize` / `SwitchSize`.
- **`ds-input` / `ds-textarea` character counter.** New `[maxLength]` caps input and renders a
  live `"n/max"` counter beside the hint. `ds-textarea` also gains `[readOnly]` (mirrors input).
- **`ds-date-picker` day-level constraints + presets.** New `[minDate]` / `[maxDate]` (disable
  out-of-range days, inclusive), `[disabledDate]` predicate (disable arbitrary days), and
  `[presets]` (`DatePickerPreset[]` — quick-pick buttons in the calendar panel). Disabled days
  aren't selectable by click or keyboard. New exported `DatePickerPreset`.
- **Dropdown-family enhancements.** `ds-select` gains `clearable` + per-option `icon`
  (`SelectOption.icon`) + `readOnly` (non-interactive filled look, ported from the removed
  `ds-dropdown`); `ds-autocomplete` gains `[optionGroups]` + `[allowCreate]` with a "Create …" row
  and a `(create)` output. New exported `AutocompleteOptionGroup`. (Native multi on `ds-select`
  intentionally omitted — use `ds-multi-select`.)
- **`ds-table` expandable rows.** New `[expandableRows]`, `[(expandedIds)]` (`Set<string>`) and
  `[rowExpandTemplate]` — a chevron toggle per row reveals a full-width detail row (works with
  selection, sticky first column, and pagination).
- **Overlay dialogs.** `ds-modal` gains `[closeOnBackdrop]` (opt-out) + `[persistent]` (neither
  backdrop nor Escape dismisses) + `xl` / `fullscreen` sizes. `ds-drawer` gains `[placement]`
  (`right` / `left` / `top` / `bottom`) + `sm` size (new `DrawerPlacement`). `ds-bottom-sheet`
  gains `[snapPoints]` (fractions of viewport height; drag snaps to the nearest, below-lowest closes).
- **`ds-toast` promise / loading / maxVisible.** New `'loading'` variant (spinner, no auto-dismiss)
  and `ToastService.promise(p, { loading, success, error })` (updates the toast in place on settle);
  `DsToastConfig.maxVisible` caps concurrent toasts and queues the rest.
- **`ds-menu` dividers + submenus.** New `ds-menu-divider` (`role="separator"`) and nested submenus
  via `ds-menu-item [submenu]` (opens on hover / ArrowRight, closes on ArrowLeft / Escape).
- **`ds-popover` arrow + placement.** New `[arrow]` caret and `[placement]`
  (`top` / `bottom` / `left` / `right`, new `PopoverPlacement`); the existing `align` stays the
  cross-axis alignment.
- **`ds-tabs` lazy / scrollable / closable / vertical.** New `[lazy]` (defer panel content until
  first shown), `[scrollable]` (horizontal-scroll strip), `[closable]` (per-tab close with a
  `(tabClose)` output), and `[orientation]` (`horizontal` / `vertical`, new `TabsOrientation`;
  roving arrows follow the axis).
- **`ds-accordion` single-open + item `disabled`.** New `[multi]` (default `true`; `false` = only
  one item open at a time via a parent coordinator) and `[disabled]` on `ds-accordion-item`.
- **`ds-stepper` clickable / error / vertical.** New `[clickable]` + `(stepClick)`, `[errorSteps]`
  (indices rendered in an error state), and `[orientation]` (`horizontal` / `vertical`, new
  `StepperOrientation`).
- **`ds-sidenav-item` collapsed tooltip.** When the sidenav is collapsed, hovering/focusing an item
  shows its label as a tooltip.
- **`ds-badge` numeric count.** New `[count]` + `[max]` (default 99) render a count with `"max+"`
  overflow and an accessible label.
- **`ds-avatar` status dot + fallback icon.** New `[status]` (`online` / `offline` / `away` /
  `busy`, new `AvatarStatus`) shows a corner status dot, and `[fallbackIcon]` renders when there's
  no image or initials.
- **`ds-autocomplete` content-width mode.** New `width` input (`fill` — default, stretches to the
  container as before / `content` — the trigger hugs its chips/value plus a minimum typing area,
  for filter toolbars; the panel then sizes to its options with the trigger width as the floor).
  New public hooks `--ds-autocomplete-input-minw` (typing-area minimum, default 80px) and
  `--ds-autocomplete-maxw` (trigger cap, default none; in `content` mode defaults to 100% so chips
  wrap at the parent edge). New exported `AutocompleteWidth`.
- **`ds-date-picker` localization + manual entry.** New `locale` (BCP-47) drives month names,
  weekday headers and the value format together via `Intl` (no more OS-locale mixing); `dateFormat`
  pins an explicit token order (e.g. `MM/DD/YYYY`); `firstDayOfWeek` (0–6, default Monday) shifts the
  week; `defaultMonth` opens the panel near a realistic date when the value is empty (e.g. a Date Of
  Birth). Manual masked entry is now available (`allowInput`, default `true`): the trigger is a text
  field enforcing the locale mask, rejecting non-numeric input and flagging impossible/out-of-range
  dates on blur; range mode exposes two masked inputs. New `DsConfig.datePicker`
  ({ `locale`, `dateFormat`, `firstDayOfWeek` }).

### Changed

- **`ds-search` inner input class renamed `.input` → `.search-input`.** The over-generic name let
  consumer global `.input` styles/resets leak into the component through emulated encapsulation
  (root cause of the PIN-475 double-focus-ring). Only consumer styling that targeted the
  undocumented internal class is affected.
- **`ds-date-picker` trigger is now a text input by default.** Manual masked entry is on
  (`allowInput` defaults to `true`), so the trigger renders as an editable field with a calendar
  button instead of a plain button. Pass `[allowInput]="false"` to restore the button-only,
  calendar-only trigger. The selected-date display is now locale-pinned (was the ambient
  `toLocaleDateString()`), and month/weekday names are localized together via the new `locale`.

## 0.4.0 — 2026-06-30

### Added

#### New components

- **`ds-multi-select`** — multi-value dropdown that renders selections as chips, with an
  in-panel text filter, a checkbox listbox (active-descendant keyboard nav), an opt-in
  `selectAll` row with indeterminate state, and `maxVisibleChips` "+N more" collapsing.
  Reactive-forms (`ControlValueAccessor`) + `[(value)]` (`string[]`), plus `invalid` /
  `hint` / `disabled`. Exports `MultiSelectComponent`, `MultiSelectOption`.
- **`ds-slider`** — single-thumb or two-thumb `range` slider with `min` / `max` / `step`,
  pointer drag and full keyboard control (Arrow / PageUp-Down / Home / End). CVA +
  `[(value)]` (`number` or `[number, number]`), plus `invalid` / `hint` / `disabled`.
- **`ds-otp-input`** — one-time-code field with per-character cells, auto-advance, paste
  distribution, configurable `length`, `numeric` / `alphanumeric` `mode`, optional `mask`,
  and a `completed` output. CVA + `[(value)]` (`string`), plus `invalid` / `hint` /
  `disabled`. Exports `OtpInputComponent`, `OtpMode`.
- **`ds-color-picker`** — Photoshop-style picker (2D saturation/value plane + hue slider +
  hex field + preset swatches), panel portaled via CDK Overlay. CVA + `[(value)]` (hex
  `string`), plus `presets`, `invalid` / `hint` / `disabled`.
- **`ds-tree`** — data-driven tree-view (`nodes: TreeNode[]` with recursive `children`),
  roving-tabindex keyboard nav (Arrow / Home / End; Right expands, Left collapses),
  `[(expandedIds)]` (`Set<string>`), `[(selectedId)]`, and a `nodeSelect` output. Exports
  `TreeComponent`, `TreeNode`.
- **`ds-segmented`** — single-select segmented control (`role="radiogroup"`, roving
  tabindex), data-driven via `options: SegmentedOption[]` with `[(value)]`. A value toggle —
  unlike `ds-tabs` it owns no panels. Exports `SegmentedComponent`, `SegmentedOption`.
- **`ds-button-group`** — `role="group"` wrapper that visually joins projected
  `<ds-button>` children into one segmented row.
- **`ds-split-button`** — a primary action plus an attached dropdown of secondary actions
  (`menuItems: SplitButtonItem[]`), built on `ds-popover` + `ds-menu`; emits `pressed`
  (main) and `itemSelect`. Exports `SplitButtonComponent`, `SplitButtonItem`,
  `SplitButtonVariant`.
- **`ds-toggle-button`** — standalone on/off button with `[(pressed)]` (sets `aria-pressed`)
  and an optional `icon`.
- **`ds-list` / `ds-list-item`** — semantic list (`role="list"`) with optional `dividers`;
  each item has `title` / `subtitle` text, `[leading]` / `[trailing]` slots, and optional
  `clickable` (emits `activated`) with `selected` / `disabled` states.
- **`ds-timeline` / `ds-timeline-item`** — vertical activity feed; each item has a
  `heading`, `time`, an optional node `icon`, and a `tone`
  (`default` | `primary` | `success` | `warning` | `error` | `muted`). Exports
  `TimelineTone`.
- **`ds-description-list` / `ds-description-item`** — term/definition pairs with
  `horizontal` | `stacked` `orientation`; each item takes a `term` and optional `copyValue`
  (renders a copy-to-clipboard button). Exports `DescriptionListOrientation`.
- **`ds-stack` / `ds-inline` / `ds-container` layout primitives.** `ds-stack` (column) and
  `ds-inline` (row, wraps by default) take a named `gap` (`none … xl`) + `align` /
  `justify`; `ds-container` centres content at a named `size`
  (`sm` | `md` | `lg` | `xl` | `full`). Adds semantic `--space-stack` / `--space-inline`
  spacing aliases plus per-primitive `--ds-stack-gap` / `--ds-inline-gap` /
  `--ds-container-max` / `--ds-container-pad-x` hooks. Exports `LayoutGap`, `LayoutAlign`,
  `LayoutJustify`, `ContainerSize`.
- **`ds-loading-overlay`** — region scrim with a centred spinner + optional `label`,
  toggled by `loading`, with `blur`, `spinnerSize` and an `insetTop` offset (clears a
  sticky header). `ds-table` and `ds-empty-state` now render their loading state through it.
- **New `ds-radio-group` component.** A CVA-capable `<ds-radio-group [(value)] name invalid hint label>`
  wrapper that projects `<ds-radio value="…">` children. Manages roving-tabindex keyboard navigation
  and implements `ControlValueAccessor` for reactive-forms use. Standalone `<ds-radio [(checked)]>` is
  unaffected and still works for non-group usage.
- **New `ds-alert` component.** Lightweight inline status message with five variants (`info`, `success`,
  `warning`, `error`, `neutral`), an optional `title`, an optional dismiss button (`[dismissible]`),
  a named `[actions]` slot for follow-up CTAs, a custom `icon` override, and a `(dismissed)` output.
  Smaller and less prominent than `ds-banner` — intended for contextual form/page feedback rather than
  page-level announcements.

#### Theming & colour

- **`ds-color` scoped-accent system.** A new `--accent-*` pointer layer lets any subtree be
  recoloured to a different hue family without per-component overrides. Set it via the
  `[ds-color="secondary | tertiary | error | success | warning"]` attribute on a zone
  container or a component host, or from SCSS with the `ds.color(<family>)` mixin
  (`@use '@ids-group-ltd/ids-design-system/styles/ds' as ds;`). Components route their accent
  (fills, focus rings, surface tint) through `--accent` / `--accent-strong` / `--accent-muted`
  / `--accent-muted-strong` / `--accent-on` / `--accent-pressed` / `--accent-focus-ring` /
  `--accent-focus-field`; `ds-button` / `ds-icon-button` flip the same pointers per instance
  via their `color` input. Ships in the default bundle (forwarded by `styles/ds`) — additive,
  the default (primary) theme is unchanged pixel-for-pixel. Caveat: CDK-portaled overlays
  (dropdown / select / combobox / date-picker / color-picker / popover / tooltip / toast /
  modal panels) render outside the zone subtree, so set `ds-color` on the panel itself to
  recolour them.
- **`--*-muted-strong` semantic roles** for `secondary` / `tertiary` / `error` / `success` /
  `warning` (a denser muted step between `-muted` and the strong tone), plus per-family focus
  rings (`--focus-ring-*` / `--focus-field-*`) and `-pressed` / `-on` aliases so every
  ds-color family can resolve the full accent pointer set.
- **`ds-icon-button` colour axis.** Gains a `color` input (shared `ButtonColor` type, default
  `primary`); `variant` stays the fill axis (`standard` | `filled` | `tonal` | `outlined`).
  Additive — existing usage is unchanged.
- **Dark theme** (`themes/dark/`) — ships with the default bundle (`@use 'styles/ds'`).
  **Light is the default** (no attribute); dark is opt-in via `<html data-theme="dark">`. There is
  no automatic `prefers-color-scheme` switch — to follow the OS, opt in at the app root with the new
  **`provideDsTheme({ followSystem: true })`** provider. Each theme declares `color-scheme` so native
  UI (scrollbars, form controls) matches. Adds theme-stable `--static-white` / `--static-ink` tokens
  so on-fill text keeps correct contrast across themes. Non-breaking — additive, light output unchanged.
  Light and dark are **sibling themes** — a shared base palette (`themes/_base-palette`) + a shared
  role map (`themes/_semantic`); light applies at `:root`, dark at `:root[data-theme='dark']` (the
  dark block declares the complete token set, so it fully replaces light, not patches it).
  `data-neutrals="brand"` is a light-context switch; brand overlays are authored on light. Dark also
  ships its own chart tokens (sequential / divergent ramps + hover/tooltip surfaces); combining
  `data-neutrals="brand"` with dark is a documented no-op for the brand grey tint (dark neutrals win).

#### Forms & fields

- **Reactive-forms (`ControlValueAccessor`) on `ds-checkbox`, `ds-switch`, `ds-combobox`, and
  `ds-date-picker`.** Each control now works with `[(ngModel)]` and `formControl` / `formControlName`
  out of the box. New `invalid` / `hint` inputs render an associated `ds-field-message` below the
  control. `ds-combobox` and `ds-date-picker` also gain a new `disabled` input for template-driven
  disable (previously only the forms layer could disable them). `ds-switch` gains `role="switch"`.
- **`hint` and `invalid` on `ds-select`.** The pre-existing dropdown can now render an
  associated helper/error line (wired via `aria-describedby` + `role="alert"` on error)
  through the shared internal `ds-field-message`; `ds-input` / `ds-textarea` render their hint
  through the same component (the `--ds-input-hint-*` tokens are replaced by
  `--ds-field-message-*` — see Breaking). The new field components above ship with `invalid` /
  `hint` built in.
- **Inline `[label]` on `ds-checkbox` / `ds-radio` / `ds-switch`** — render the control label
  without hand-writing a `<label for>`; `ds-radio-group` accepts a group `label` too.
- **`ds-input` `[loading]` and `[floating]`.** `loading` shows a trailing spinner while the
  field stays editable (pair with a `hint` for async validation); `floating` switches to a
  floating-label layout.
- **`--field-label-gap` token** (single source for label↔control and control↔hint vertical
  rhythm, defaults to `--space-1-5`); every field control now routes its spacing through it.

#### Components — new capabilities

- **`ds-button` overlay-trigger support.** New `ariaHasPopup` / `ariaExpanded` inputs
  (forwarded to the native `<button>`) and an exported `buttonRef` for positioning a
  popover/menu and returning focus.
- **`ds-date-picker` month & year grid pickers** in the calendar header — click the
  month/year labels to pick from a compact grid (years in a paged 12-cell grid) instead of
  stepping month-by-month.
- **`ds-table` pagination, client-side sort & sticky first column** (absorbed from the
  prototype data-grid): new `pageSize` / `page` / `pageSizeOptions`, `clientSort`,
  `stickyFirstColumn`, plus `cellTemplateMap` / `emptyTemplate` for wrapper components.
- **`ModalService.confirm(options): Promise<boolean>`** — promise-based confirmation dialog
  rendered as a modal card (`ModalConfirmOptions`: `title`, `message`, labels, `tone`, `icon`,
  and `typeToConfirm` to gate destructive actions). Resolves `false` on cancel / backdrop /
  Escape.
- **`ds-dropzone` per-file `message` and `queued` state.** `DropzoneFile` gains an optional
  `message` (shown in place of the bare state name) and a `'queued'` value in
  `DropzoneFileState`.

#### Tokens & build

- **`$bp-*` breakpoint Sass aliases + `up()` / `down()` mixins** (`styles/breakpoints`).
  CSS custom properties can't be used in `@media` conditions, so the `--bp-*` scale was
  unusable there. A new partial is now the single source for both representations: it emits
  `--bp-*` (values unchanged) and exposes compile-time `$bp-xs … $bp-2xl` plus the mixins
  `bp.up(md)` (`width >= 768px`) / `bp.down(sm)` (`width < 640px`), via
  `@use 'breakpoints' as bp;`. Heads-up: advanced consumers importing `styles/tokens` à la
  carte now also need `styles/breakpoints` for `--bp-*`; the `styles/ds` entry forwards both.
- **`--ds-button-border-disabled`** and **`--ds-icon-button-bg-color-disabled` /
  `-icon-color-disabled` / `-border-disabled`** override tokens — the disabled
  fill/label/border are now individually themeable (previously only button had
  `bg-color`/`label-color-disabled`; icon-button had none).
- **`--ds-button-press-scale`** (default `0.98`) and **`--ds-icon-button-press-scale`**
  (default `0.96`) — tune the press scale-down (set `1` to disable).

### Breaking

- **`ds-button` now takes two orthogonal axes — `color` × `variant` — replacing the single
  conflated `variant` input.** `color` is the hue family
  (`primary` | `secondary` | `tertiary` | `neutral` | `error` | `success` | `warning`,
  default `primary`); `variant` is the fill style
  (`solid` | `tonal` | `ghost` | `outline` | `text`, default `solid`). The old single axis
  mixed hue and emphasis — migrate as: `primary` → default (drop the attr); `secondary` →
  `variant="tonal"`; `tertiary` → `variant="ghost"`; `outline` →
  `color="neutral" variant="outline"`; `error` / `success` / `warning` →
  `color="error|success|warning"`; `text` → `variant="text"`. New exported `ButtonColor` /
  `ButtonVariant` types. `text` still renders but is **discouraged** (dev-mode `console.warn`
  — prefer the global `.link` class); a small set of low-contrast `color × variant` combos
  (e.g. `neutral` solid, `success` / `warning` ghost/outline) render with a discouraged ⚠
  marker rather than being banned. Each instance flips the internal `--c-*` accent slots,
  which now default to the `--accent-*` pointer layer (see ds-color).
- **Reactive-forms radio now uses `<ds-radio-group>` as the group container and form control.**
  Standalone `<ds-radio [(checked)]>` continues to work for non-group usage, but a group of
  radios that participates in a reactive form should now be wrapped in `<ds-radio-group>`.
- **`ButtonSize` collapsed to `sm | md | lg`** (32 / 40 / 48 px), dropping the duplicate
  legacy `s | m | l` tier. Default is now `md` (was `l` — same 40 px). Migration:
  `m` → `sm` (both 32), `l` → `md` (both 40); the 24 px `s` is removed — its callers move to
  `sm` (32 px). Aligns button with input / select / date-picker / icon-button.
- **Removed `--ds-input-hint-color` / `--ds-input-hint-fs`.** Field helper/error text is now
  rendered by the shared `ds-field-message`; tune its neutral colour and size via the new
  `--ds-field-message-color` / `--ds-field-message-font-size` hooks (these apply to every field's
  helper/error line, not just input).

### Changed

- **Button & icon-button press is now darken + a micro scale-down; the pressed halo is off by default.**
  `:active` darkens the fill (unchanged) and adds `transform: scale(0.98)` (button) / `0.96` (icon-button)
  for tactile feedback. The old faint pressed halo (`--ds-button-pressed-shadow`) now defaults to `none`
  — still settable to re-enable it. Honors `prefers-reduced-motion` (scale dropped, colour stays).
- **Button & icon-button `[disabled]` is now a per-variant muted tint, not one flat grey.**
  The disabled look derives from each variant's own colour: solid fills (primary/error/
  success/warning) and the chrome-less `text` button use a flat pale tint (`oklch` from the
  accent, pinned lightness/chroma); the `tonal` / `ghost` / `outline` button variants and
  icon-button `tonal` / `outlined` use `color-mix(fill 28%, --surface-disabled)`, preserving
  the enabled emphasis ladder. `text` / icon-button `standard` stay chrome-less (no box).
  Visual change to the default disabled appearance — override the `--ds-*-disabled` tokens to
  restore a flat grey.
- **`ds-bottom-sheet` now animates its close** — slide-down + scrim fade on dismiss (scrim
  tap / Escape / downward drag / programmatic `open = false`), mirroring the open animation
  instead of vanishing instantly. Honors `prefers-reduced-motion` (closes instantly). The
  `closed` output now emits at the end of the leave animation rather than on the click.
- **Smooth motion across components.** Interactive state changes that used to snap now ease,
  all on the existing `--duration-*` / `--ease-*` tokens (`prefers-reduced-motion` zeroes
  them). Selection fills animate (checkbox check / radio dot scale + fade, switch unified to
  one duration); hover/active/selected eases on pagination, tabs pills, sidenav (incl. the
  collapse width), table rows + sort icon, dropzone drag-over, stepper, combobox / date-picker
  / dropdown options, breadcrumb crumbs and more. `ds-modal` and `ds-drawer` now animate their
  close (animate-then-remove, like `ds-bottom-sheet`) — the modal card enters with scale + fade
  (no slide). `ds-accordion` expand/collapse actually animates now (grid-rows, not height:auto).
  Floating panels (`ds-select` / `ds-dropdown` / `ds-combobox` / `ds-date-picker` / `ds-popover`,
  plus `ds-tooltip` on open) fade + slide in on open and out on close via a shared overlay-motion
  helper; `ds-banner` fades in on mount; the toggle button's pressed/hover state eases too.
  Action-driven dropdown / menu / picker panels close instantly (no leave-animation lag) when a
  selection is made, while dismiss (scrim / Escape) keeps the fade.

### Fixed

- **`prefers-reduced-motion` no longer freezes looping indicators.** A blanket
  `animation-duration: 0 !important` was stopping spinners and the indeterminate progress
  bar (a frozen spinner reads as "hung", not "loading"). Looping status indicators are now
  slowed instead of zeroed; one-shot entrance/transition motion stays instant. The page-wide
  skeleton sweep still halts (large-area motion, the one reduced-motion should remove).
- **Overlay scroll-lock is now released on dismiss.** The scoped `@keyframes` name guard now
  matches Angular's emulated-encapsulation suffix (`endsWith`, not `===`), so the page no
  longer stays scroll-locked after an overlay closes.
- **`ds-input` / `ds-search` clear button stays visible when the field is blurred** — its
  contrast was bumped so it reads at rest, not only on focus.
- **`ds-combobox`** truncates long option labels with an ellipsis instead of wrapping in
  narrow panels, and its multi-select option row now fills the panel width (label no longer
  clipped to zero).
- **`ds-accordion`** collapses its body fully (padding moved off the clipped wrapper) and
  restores body padding when expanded.

## 0.3.0 — 2026-06-23

### Breaking

- **Renamed `--*-bg` tokens → `--*-bg-color`.** Every background token held only a colour
  and fed the `background` shorthand; they were renamed and switched to `background-color`.
  Affects all public `--ds-*-bg` hooks — avatar, badge, banner, button, card, date-picker,
  dropzone, empty-state, icon-button, input, modal, pagination, search, sidenav, stat,
  table, tabs, tag, toast and topbar — plus global tokens (`--select-bg`, `--chart-hover-bg`,
  `--chart-tooltip-bg`, the `--status-*-bg` set) and private `--_*` tokens. Consumers
  overriding e.g. `--ds-toast-bg` must rename to `--ds-toast-bg-color`.
- **Renamed `--*-fg` tokens → semantic `-text-color` / `-label-color` / `-icon-color`.**
  The unclear `fg` abbreviation is gone: text/titles/inputs → `-text-color`, control & nav
  labels → `-label-color`, icons/glyphs → `-icon-color`. Affects all public `--ds-*-fg`
  hooks — avatar, badge, banner, breadcrumbs, button, date-picker, dropzone, empty-state,
  icon-button, input, menu, modal, page-header, pagination, search, sidenav, table, tabs,
  tag and topbar — plus the `--status-*` and chart-tooltip globals. Examples:
  `--ds-modal-title-fg` → `--ds-modal-title-text-color`, `--ds-sidenav-group-fg` →
  `--ds-sidenav-group-label-color`, `--ds-icon-button-fg` → `--ds-icon-button-icon-color`.

### Added

- **Reactive-forms support on `ds-input`, `ds-textarea`, `ds-select`.** They now
  implement `ControlValueAccessor`, so `formControlName` / `[formControl]` and template
  `[(ngModel)]` bind to them out of the box, and `FormControl.disable()` is honoured. The
  existing `[(value)]` signal API is unchanged — both work. Shared via an internal
  `DsControlValueAccessor` base. Checkbox/switch/combobox/date-picker/radio are not yet
  wired (tracked).
- **`ng add` support.** `ng add @ids-group-ltd/ids-design-system` wires the design
  system's global styles (`@use '@ids-group-ltd/ids-design-system/styles/ds';`) into the
  target project's global styles entry, idempotently. It targets the default/first
  application project or an explicit `--project`; if no styles file is found it logs the
  one-line import to add manually. Components stay standalone — import them directly.
- **`ds-combobox` `size` input** (`sm | md | lg`, default `md`), mirroring `ds-select`;
  sets the trigger min-height (32 / 40 / 48 px). New exported `ComboboxSize` type.
- **Overridable focus rings.** New shared group tokens `--ds-field-focus-shadow` /
  `--ds-control-focus-shadow` (+ `-error` variants), defaulting to the semantic
  `--focus-field` / `--focus-ring`. Every focusable component now reads its focus shadow
  through a per-component public hook `--ds-<comp>-focus-shadow` (fields also expose a
  matching `-error` hook) that falls back to the group token; the global `.link` utility
  and the shared dropdown/select overlay panel read the group token directly. A consumer
  can retune focus for one component, a whole group (all fields or all controls), or rely
  on the theme default. Default appearance unchanged.
- **`ds-tag` hover tokens** `--ds-tag-hover-bg-color` / `--ds-tag-hover-label-color`
  (private tokens hoisted to `:host` for consumer override).
- **`--opacity-state-active`** (0.24) overlay token, backing the new tag pressed state.

### Changed

- **`ds-stepper` now shows step labels.** The captions passed via `[steps]` render as
  visible labels (previously screen-reader-only — only numbers showed), with the current
  step emphasised. A new `labelPosition` input (`bottom` | `inline`, new exported
  `StepperLabelPosition` type) chooses the layout:
  `bottom` (default) stacks the caption beneath each node in a full-width row with equal
  segments; `inline` puts it beside the node in a compact row that hugs its content (a
  header progress bar). New `--ds-stepper-label-color` / `--ds-stepper-label-color-current`
  / `--ds-stepper-label-font-size` hooks. Visual change for existing usages.
- **Tag:** added an `:active` (pressed) state to the close/dismiss button (previously only
  hover was styled), using the new `--opacity-state-active` overlay.
- **Accordion & sidenav group** now animate open/close (`height: 0 ↔ auto`) via an opt-in
  `interpolate-size: allow-keywords` on `:root`. Collapsed content now stays in the DOM and
  is marked `inert` instead of being removed — replacing the accordion's `@if` show/hide and
  the sidenav group's `display: none`. The accordion body carries an `.is-open` class when
  expanded.
- **`ds-combobox` focus** now uses the soft field halo (`--focus-field`) instead of the
  hard ring (`--focus-ring`), matching `ds-input` / `ds-select` / `ds-search`. Minor visual
  change to the combobox focus state.
- Backgrounds and several control transitions switched from the `background` shorthand to
  `background-color` for precision. Alongside it, a repo-wide, value-preserving CSS-syntax
  modernization: legacy `hsl()/hsla()` comma syntax → modern space/slash form, `clip:
rect(…)` → `clip-path: inset(50%)` on visually-hidden helpers, and `min-/max-width`
  media queries → range syntax (`width >= …`). No intended visual change.

### Fixed

- **`ds-drawer`** now closes on Escape even when focus has left the panel — a
  `document`-level Escape handler was added alongside the existing panel-level one
  (previously Escape dismissed the drawer only while focus stayed inside it).
- **`ds-combobox`** "No matches" empty option is no longer exposed as selectable
  (`aria-selected="false"`).

## 0.2.2 — 2026-06-17

- Added `.t-mono-inline` typography utility — an inline code chip (mono font on a
  subtle surface with padding/radius), completing the mono family alongside
  `.t-mono` (font only) and `.t-mono-block` (block).
- Removed the repository link from the npm package: dropped the `repository` field
  from `package.json` and moved the maintainer Development/Releasing docs out of the
  published README into a repo-only `CONTRIBUTING.md`. The README License entry is
  now plain text (no repo link), fixing the npm 404.

## 0.2.1 — 2026-06-16

- Added a `homepage` field linking the live docs/showcase, so the npm package page
  points to it.

## 0.2.0 — 2026-06-16

- **Breaking:** renamed the subtle semantic color tokens `--*-subtle` → `--*-subtitle`
  (border, primary, secondary, tertiary, success, warning, error, info). Consumers
  referencing these tokens must rename.
- Clarified theme re-skin guidance in the shipped `themes/README`: brand roles
  retint automatically from the `--blue` ramp, but a fully calibrated brand may
  set the `--primary-*` roles directly to hand-picked hex.
- Relicensed from proprietary (UNLICENSED) to MIT.

## 0.1.0 — 2026-06-12

Initial public release.

- 45+ standalone Angular components: buttons, forms, overlays, navigation, data display
- Three-tier token architecture: palette → semantic theme → geometry/typography/motion tokens
- Default theme and palette, swappable by consumers
- Bundled Mulish and JetBrains Mono fonts
- SCSS sources shipped in the package (`styles/`, `themes/`)
