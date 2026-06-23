# Changelog

All notable changes to `@ids-group-ltd/ids-design-system` are documented here.

Versioning follows [SemVer](https://semver.org). Mapping from commit types:
`fix` → patch, `feat` → minor, breaking change (API or visual) → major.
While the package is on `0.x`, minor releases may contain breaking changes.

## Unreleased

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
