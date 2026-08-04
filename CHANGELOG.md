# Changelog

All notable changes to `@ids-group-ltd/ids-design-system` are documented here.

Versioning follows [SemVer](https://semver.org). Mapping from commit types:
`fix` → patch, `feat` → minor, breaking change (API or visual) → major.
While the package is on `0.x`, minor releases may contain breaking changes.

## Unreleased

- **`ds-icon-button` forwards `ariaExpanded` and `ariaControls` to its inner `<button>`, and `ds-button` gains `ariaControls`.** A trigger that opens a panel has to announce state on the element a screen reader focuses; set on `<ds-icon-button>` itself those attributes land on the wrapper, which is not focusable and is never read. `ds-button` already forwarded `ariaExpanded`; the pair is now complete on both.
- **`LayoutScrollService` exposes its scroller and an absolute `scrollTo(top)`.** A scroll-spy or a virtualizer inside `ds-app-layout` needs the content region to measure against, and the only way to get it was `document.querySelector` against the layout's internal markup — a consumer reaching into DS internals for something the DS already holds. `scrollTo` assigns `scrollTop` rather than calling `scrollTo({ behavior })`, so a themed `scroll-behavior: smooth` cannot turn a positioning jump into an animation.
- **`dsRailTrigger` wires a consumer's own burger to the overlay rail.** The responsive rail shipped with `role="dialog"`, `aria-modal` and a focus trap, but nothing connected it to the button that opens it — the burger lives in the consumer's projected topbar, so it announced no state and no relationship. Put the directive on the burger and it toggles `[(railOpen)]` and keeps `aria-expanded` and `aria-controls` correct. Both attributes are dropped while the rail is not an overlay, where `aria-expanded="false"` would contradict what the user sees. A directive rather than a documentation note because these are exactly the attributes a consumer forgets — the DS itself forgot them. `ds-app-layout` also exposes `railId` and the read-only `railOverlay` signal for a consumer that builds its own trigger.

### Added

- **Every field takes `error` and `warning` beside `hint`, and shows exactly one of them.** Until now a
  field had one message input, so a consumer had to multiplex it by hand —
  `[invalid]="showError()" [hint]="showError() ? errorText() : helperText()"` — on every screen that
  validates, and the two bindings could silently disagree. The four sources now resolve on a fixed
  ladder, highest first: `error` (an explicit string — shown at once, because binding it says you have
  already decided), then validation errors, then `warning`, then `hint`. Only ONE line ever renders, so
  a field's height does not depend on how many sources are populated — the same rule Carbon
  (`invalidText` → `warnText` → `helperText`) and Material's subscript follow. `ds-field-message` gained
  a matching `warning` state coloured from `--warning-text`.
- **Fields read validation state from the form control, so `error` is optional.** Both Angular form
  systems are supported at once and neither needs the other. Signal forms binds `errors` and `touched`
  straight in — those input names are Angular 21's `FormUiControl` contract, and the `Field` directive
  already drives the value through the `ControlValueAccessor` the fields have always implemented.
  Reactive and template-driven forms need nothing at all: the field resolves `NgControl` after first
  render (it cannot be injected directly — a field provides `NG_VALUE_ACCESSOR` pointing at itself, so
  asking for `NgControl` in the same constructor is a DI cycle) and subscribes to `control.events`,
  which is what reports touching — `statusChanges` does not. Errors wait for the first blur, or for the
  parent form to be submitted, so a `required` error never greets an untouched form. `invalid` no longer
  has to be kept in sync by hand: it is now OR-ed with what the control reports, and the explicit input
  still wins.
- **`DS_CONFIG.field.errorMessages` — one shared map from error kind to text.** A message on the error
  itself always wins (`required(path, { message: … })` in signal forms, or `{ myError: 'text' }` from a
  plain validator), so this is the fallback for Angular's built-ins, which carry detail objects and no
  wording. Declare it once in `provideDsConfig` and a consumer writes no text at all for `required`,
  `minlength` or `email`. An error that resolves to no text anywhere warns in dev rather than rendering
  an error style with an empty line.

- **`ds-table`’s `clientSort` is replaced by `sortMode: 'client' | 'server' | 'none'`, and the default flips to client sorting.** The boolean could not express "nothing sorts", so a column marked `sortable: true` on a table with no sorting drew a header that looked live, showed a caret on hover and did nothing — an invisible failure that survived review and was caught by opening the page. An enum makes that state unrepresentable: `'none'` now renders the header as plain text, with no button, caret or `aria-sort`. Unset resolves to `'client'`, so `sortable: true` always does something; a server-sorted table declares `'server'`, which is the side that actually knows it wants server sorting. **Migration is mechanical except for one case:** a table that previously bound no `clientSort` and reordered in its own `(sortChange)` handler must now declare `sortMode="server"`, or it will sort locally as well. For a server-PAGED table (one that binds `total`) that is worse than a dead header, because only the current page reorders and the rows look sorted without being sorted — so dev builds warn on exactly that combination: `total` bound, sortable columns, `sortMode` never declared. Rejected alternative: reading `OutputEmitterRef.listeners` to detect an unbound `(sortChange)`. It is private, and a rename would kill the warning SILENTLY — `?.length` on `undefined` just means it never fires again.
### Changed

- **`FieldMessageState` gained `'warning'`.** Additive, but an exhaustive `switch` over the exported
  union in consumer code will no longer compile without that arm.
- **Fields no longer expose a `protected messageState`;** the resolved `message` (text + state) and
  `invalidResolved` replace it. Only reachable by subclassing a field component, which is not a
  supported extension point, but noted for parity with the class-member changes in 0.7.0.

### Fixed

- **A nested `ds-app-layout` opened its rail whenever an OUTER one was open, and its scrim swallowed the clicks meant for the outer.** The open state was written as `:host(.rail-open) &`, which Angular's emulated encapsulation compiles to a DESCENDANT selector — and every instance of a component shares one encapsulation attribute, so `.rail-open[_nghost-x] .rail[_ngcontent-x]` matched the rail of every layout nested inside an open one. Two layouts on a page (a docs shell holding a demo, an app holding a preview pane) opened and closed in lockstep, and clicking the backdrop hit the inner layout's scrim, whose `closeRail()` was a no-op. The state now lives on the elements it styles (`.rail.open` / `.scrim.open`), where a selector cannot reach across host boundaries.
- **The overlay rail escaped its layout and covered the whole window.** Below `lg` the rail is `position: fixed`, which resolves against the viewport, so a layout embedded in a page threw its rail over the top-left of the window instead of its own box — three shells on one docs page stacked three rails and three full-page scrims. The rail and scrim are now `absolute` against a `position: relative` host, which is identical for a full-viewport shell and correct for an embedded one.
- **A path change that only mirrors the reader's position no longer resets the content scroll.** A docs shell whose scroll spy rewrites `/area/section` as the user scrolls hit a loop: the rewrite looked like a page change, the layout scrolled to top, the spy saw the first section again and rewrote the path back. Such a navigation must now carry `state: { dsSamePage: true }`, which the layout skips for both the scroll reset and the rail close. Read from `Router.lastSuccessfulNavigation()` — `getCurrentNavigation()` is already cleared when `NavigationEnd` reaches a subscriber.
- **A closed compact `ds-app-layout` rail no longer holds focus, or 112 tab stops, behind the screen.**
  Below the breakpoint the rail is translated off-canvas, which hides it visually and not at all from
  assistive tech: it kept `role="dialog"` + `aria-modal="true"`, every nav link stayed tabbable, and the
  caret stayed inside the hidden panel after Escape or a scrim click — `cdkTrapFocusAutoCapture` hands
  focus back only when the directive is DESTROYED, not when it flips off — so the next Tab continued from
  invisible navigation with no visible focus ring. The closed overlay rail is now `inert`, and closing it
  returns focus to whatever control claims the rail through `aria-controls`, which both `dsRailTrigger`
  and the DS-button forwarding (`[ariaControls]="shell.railId"`) already set. Verified in Chrome at 604px.
  At/above the breakpoint nothing changes — the rail stays in the layout and interactive.

- **`--ds-overlay-enter-scale` now reaches the portaled panel, so `ds-scale-in` can be retuned per
  instance.** The token was declared and resolved on the pane but missing from the set
  `prepareOverlayEnter()` forwards, so `ds-select { --ds-overlay-enter-scale: 0.9; }` did nothing while
  the other four enter tokens worked — 0.7.1 shipped it as a known gap. Covers every overlay panel
  (select, multi-select, autocomplete, date / time / colour picker, popover, tooltip, menu submenus). A
  global override always worked and is unaffected.

## 0.7.1 — 2026-08-04

### Added

- **`TableColumn.sortValue` — sort a column by its DOMAIN value instead of the rendered text.** Without
  it `clientSort` compares what the cell displays, so `$1.2M / $840K / $95K` sorted by the leading
  character and `Oct 09, 2023 / Feb 27, 2024` sorted by month NAME: the table looked sorted and was not,
  which is worse than leaving it unsorted. Pass an accessor per column —
  `{ key: 'amount', label: 'Amount', sortValue: (row) => row.amountCents }` — returning a number, `Date`
  or plain string. A consumer that had to re-parse its own rendered output (mm-broker shipped a
  `display-compare.ts` sniffing currency, percents and three date formats) can delete it. Only affects
  sorting: the header filter still lists what the user can see. Columns with plain numeric text already
  sorted correctly and need nothing.

- **`ds-checkbox`, `ds-switch` and `ds-radio` warn in dev when a caption is projected instead of passed.**
  `<ds-checkbox>Accept the terms</ds-checkbox>` renders no caption — the text comes from `[label]` only —
  and it failed silently: no error, no warning, nothing in the types, so it survived review and was caught
  by opening the page. All three share that contract, so all three now log which component swallowed the
  text. Production is untouched: the probe that detects it is rendered only under `isDevMode()`, so no
  extra node ships. Real projection support is still open — see `docs/todo.md`.

- **`ds-app-layout` collapses its rail to an off-canvas overlay below `lg`.** On narrow viewports the
  rail no longer occupies a grid column: below the `lg` breakpoint (read at runtime from `--bp-lg`) it
  leaves the flow, becomes a `position: fixed` panel translated off-canvas, and
  animates in over a scrim. A new two-way `[(railOpen)]` model drives it (ignored at/above `lg`), and a
  new `railLabel` input (`'Navigation'` by default) sets the panel's `aria-label` in compact mode. While
  open and compact the panel is a focus-trapped `role="dialog"` with `aria-modal="true"`; clicking the
  scrim, pressing `Escape` anywhere, navigating to a new path, or crossing back above `lg` all close it
  (no body-scroll lock — the host is already `100dvh; overflow: hidden`). At/above `lg` nothing changes.
  Wire a trigger — e.g. a burger in your own projected topbar — to `[(railOpen)]`. The rail keeps its DOM
  position, so you still project the sidenav once. New tokens:
  `--ds-app-layout-rail-bg-color` (`--surface-overlay`), `--ds-app-layout-rail-shadow`
  (`--shadow-modal`), `--ds-app-layout-scrim-color` (`--scrim, hsl(220deg 20% 12% / 45%)`). The
  breakpoint is read from the emitted `--bp-lg` with no literal fallback, so the query and the
  stylesheet's media block cannot disagree; if that custom property is missing — meaning the DS global
  styles were never included — the layout stays in desktop mode and says so in dev rather than guessing
  a width.

- **`dsReserveMessages` — turn on the reserved message row for a whole form at once.** With
  `reserveMessage` now off by default, a validated form would otherwise repeat `[reserveMessage]="true"`
  on every control. Put the directive on the form and every DS field declared inside it reserves:
  `<form dsReserveMessages>…</form>`. It provides `DS_CONFIG` for its subtree, so it composes with the
  app-level config instead of replacing it, and a field's own `[reserveMessage]` still wins so one
  control can opt back out. The switch is the directive's presence, not an input — providers resolve
  before inputs exist. Note it applies to fields **declared** inside the host: projected content keeps
  the injector of the template it was written in.

- **`ds-time-picker` gains `label`, `required` and `optional` — a date + time row now aligns without a
  hand-rolled label.** The time picker had no label API at all, so a labelled form row meant authoring the
  label yourself; the date picker's own label reserved a row the time picker did not, leaving the two
  triggers 22.8px apart vertically. The label renders the same `.label` block with the same tokens as
  `ds-date-picker`, and drives the single-mode trigger's accessible name (`aria-labelledby` when a label
  is set, `aria-label` when it is not) plus `aria-required`; range mode's start/end segment triggers are
  not wired to the label yet.
  Measured on a two-column probe, date vs time now differ by 0px on label top/height, trigger
  top/height/bottom, value inset and glyph top.

- **The value typography of both pickers is now tokenised.** It was hardcoded: the date value was pinned to
  `--font-mono` and the time trigger to `--font-weight-medium`, so a brand could not bring either in line
  with `ds-input` / `ds-select`. Adds `--ds-date-picker-value-font-family` / `-font-size` / `-weight` and
  `--ds-time-picker-value-font-family` / `-font-size` / `-weight`, plus `--ds-time-picker-required-color`.
  The date picker's ghost mask now follows the same three tokens — without that, overriding the family
  drifted the painted placeholders off the value behind them — and both the input and the mask carry
  `font-variant-numeric: tabular-nums`, so a proportional override still lands on the mask.

- **`ds-modal` / `ds-modal-card` take an `[eyebrow]` slot above the title.** Dialogs that need a context
  line ("MY ACTIVITY · ROBERT THOMPSON") had to put it as the first line of the body. The slot renders
  nothing when unfilled, and ships uppercase + tracked by default, retunable via
  `--ds-modal-eyebrow-text-color` / `-font-size` / `-weight` / `-tracking` / `-transform`. Internally the
  `<h2 class="title">` and the eyebrow are now wrapped together in a `<div class="heading">` that carries
  the `flex: 1` the `<h2>` used to hold — a consumer whose own CSS targeted `.modal-card .title` for that
  flex must retarget `.heading`.

- **`ds-table` takes a `rowId` accessor.** Row identity (tracking, selection, expansion, the active-row
  highlight) defaulted to `row.id`, so display-only data with no natural key had to be mapped through a
  synthetic id just to satisfy the generic. Pass `[rowId]="row => row.channel + row.sentAt"` instead; the
  row type relaxes from `{ id: string }` to `object`, and the resolver is public as `rowKey(row)` for hosts
  reading `selectedIds` / `expandedIds`. Rows keeping an `id` need no change.

- **`ds-date-picker` and `ds-time-picker` take `fullWidth`.** Both hugged their content, so neither filled
  a grid/flex track the way `ds-input` and `ds-select` do — a mixed form row had to pin the picker widths
  by hand. Opt-in; the default stays hug-your-content.

- **`ds-pagination` takes `showPageSize`, and its range label is tokenised.** A screen with a fixed page
  size had to hide the rows-per-page dropdown in CSS; the label could only be switched off, not restyled.
  Adds `--ds-pagination-label-font-size` / `-weight` / `-color`.

- **`ds-table` per-side cell padding + header tokens.** `--ds-table-cell-pad-{top,right,bottom,left}` each
  fall back to the existing `-pad-x` / `-pad-y` pair, so an editorial table can ask for a right-only gutter
  (first column flush) without redefining both axes. Also adds `--ds-table-head-border-color`,
  `--ds-table-head-weight` and `--ds-table-head-tracking`.

- **`DS_CONFIG.field.reserveMessage` sets the message-row default app-wide.** With the per-field default
  now `false` (see Changed), a form that validates throughout can turn the reserved row back on in one
  place: `provideDsConfig({ field: { reserveMessage: true } })` covers all 14 message-bearing fields
  instead of repeating `[reserveMessage]="true"` on every control; a per-field input still wins. The
  input's type widens from `boolean` to `boolean | null` (`null` = "not set" → fall through to the config,
  then to the hard-coded fallback), so existing bindings and bare attributes behave exactly as before.

- **`focus()` on `ds-search`, `ds-input` and `ds-textarea`.** The search input was only reachable from
  inside the component, so a filter toolbar's Clear button — disabled once there is nothing left to clear —
  blurred into `<body>` and restarted Tab order at the top of the document. Also gives forms a way to
  focus the first invalid field.

- **Five override tokens that were previously hardcoded:** `--ds-modal-title-font-size` (pairs with the
  existing `-title-weight`), `--ds-date-picker-trigger-radius` (the counterpart of
  `--ds-time-picker-trigger-radius`), `--ds-date-picker-panel-radius` (forwarded onto the portaled pane),
  `--ds-checkbox-radius` (the box only — the indeterminate dash keeps its own), and `--ds-menu-max-width`.
  `ds-toast` also gains `--ds-toast-min-width` / `--ds-toast-max-width` as per-instance hooks over the
  global `--toast-minw` / `--toast-maxw` geometry. All default to the current values.

- **`--ds-popover-min-width` and `--ds-menu-min-width`.** A popover (or a `ds-menu` projected into one)
  hugged its content with no way to widen it — `--ds-popover-max-width` was the only size hook, so a user
  menu that should be wider than its longest item needed global CSS against `.popover` / `ds-menu`. Both
  default to `auto` (today's behaviour) and both are forwarded onto the portaled overlay pane on open, so
  scoping them per instance (`ds-popover { --ds-popover-min-width: 220px; }`) works.

- **Surface entrances are now customizable per surface, via four shipped presets.** Every DS surface
  names its entrance through `--ds-<surface>-enter-keyframes` and takes `-enter-duration` / `-enter-easing`
  (plus `-enter-offset` or `-enter-scale` for the travel/scale a preset reads); surfaces that animate on
  close also take `-leave-duration` / `-leave-easing`. Covered: overlay panels (`--ds-overlay-*`, shared by
  select, multi-select, autocomplete, date / time / colour picker, popover, tooltip and menu submenus),
  modal, drawer, bottom sheet, toast, banner, alert and loading overlay. The presets are global keyframes —
  `ds-slide-in` (fade + short travel), `ds-scale-in` (grows from a micro-scale), `ds-fade-in` (opacity only)
  and `ds-slide-edge-in` (full-distance travel, no fade) — so `ds-select { --ds-overlay-enter-keyframes:
  ds-fade-in; }` is enough to re-skin one instance, and portaled panels forward the tokens onto their
  overlay pane on open — every one except `--ds-overlay-enter-scale`, which is not forwarded, so scaling
  one overlay panel per instance does not work yet (scope it globally instead). Your own `@keyframes` work
  too, but must be declared in GLOBAL styles: emulated
  view encapsulation renames keyframes defined in a component stylesheet. `none` disables an entrance.
  All defaults are unchanged. Leave keyframes are deliberately not swappable — modal/drawer/bottom-sheet
  teardown matches them by name — and reduced motion still wins: the library zeroes the duration itself,
  so a custom entrance carrying its own timing is silenced too. New: `src/lib/styles/_surface-motion.scss`
  (exported from `styles/ds`; add it alongside `styles/overlay-motion` if you import partials à la carte).

### Changed

- **`clientSort` now sinks blank cells to the bottom in BOTH directions, and collates text naturally.**
  Two changes to how an existing table sorts, both deliberate. (1) A cell that reads as "no data" — empty,
  `—`, `–`, `-`, `n/a`, `never`, `none`, matched case-insensitively — sorts last regardless of direction,
  so a descending sort no longer opens with a screen of empty rows. Previously an empty string was simply
  the smallest value and floated to the top. (2) The text fallback now passes `{ numeric: true }` to
  `localeCompare`, so `item 9` comes before `item 10` instead of after it. Both apply to every
  `clientSort` column, with or without the new `sortValue`. If a table relied on blanks sorting first,
  supply a `sortValue` that maps them to a real value.

- **Several exported component classes change their member surface, which breaks a consumer that extends
  them.** Everything else in this release is additive for anyone using the `<ds-…>` elements. Subclassing
  a DS component is unsupported (`design-system.md` § Components), but where it happens the names collide —
  TS4114 demands an `override` modifier, TS2415 fires on a redeclared private member, TS2416 where a
  signature differs. New members this range: all 14 message-bearing field components gain
  `reserveMessageResolved`, and `CheckboxComponent`, `SwitchComponent` and `RadioComponent` also gain a
  protected `devMode`; `InputComponent` and `TextareaComponent` also gain `control` and `focus`, and
  `SearchComponent` gains `focus`; `TableComponent` gains `rowId` and `rowKey`; `PaginationComponent`
  gains `showPageSize`; `TimePickerComponent` gains `label`, `required`, `optional`, `labelId` and
  `fullWidth`; `DatePickerComponent` gains `fullWidth`; and `AppLayoutComponent` gains `railOpen`,
  `railLabel`, `compact`, `closeRail` and the private `navigation`, `destroyRef` and
  `watchDesktopBreakpoint`. One REMOVAL: `TooltipDirective` (`dsTooltip`) drops its protected `onOpen`,
  split into `onPointerEnter` / `onFocusIn` / `onFocusOut` plus a private `scheduleShow`,
  `describedElement` and `focusedTarget` — a subclass that overrode `onOpen` no longer compiles, because
  its `override` now names a member the base does not declare. Rename the subclass's own member, or add
  `override` where the base's semantics genuinely match. Build after upgrading — the compiler enumerates
  every collision.

- **A nested `provideDsConfig` now MERGES with the config above it instead of replacing it.** The
  config resolves through the element-injector chain, so it was always scopable to a route, component
  or directive — but because the provider used `useValue`, a subtree that set one flag silently dropped
  every unrelated app-level setting (scoping `field.reserveMessage` on a form would reset
  `datePicker.locale`, `timePicker.format`, `breadcrumbs.separator` to their defaults, with no error).
  Merging is section by section: only the keys you name are replaced. No action needed — a single
  root-level call behaves exactly as before, and nested provision was neither documented nor usable
  safely. The merge runs through a newly exported helper, `inheritDsConfig(config)`, which reads the
  nearest ancestor config (`skipSelf`, `optional`) and shallow-merges per top-level section; call it from
  within an injection context if you need the same behaviour in your own factory provider or directive
  metadata. This is what makes `dsReserveMessages` composable.

- **BREAKING (layout): `reserveMessage` now defaults to `false` on every field.** It shipped default-on
  in 0.7.0; the reserved row is right for a form that validates and wrong for the many forms that never
  show a message, where it added ~23px of dead space under every control and made a normal 16px field
  stack read as a ~39px hole. The resolution chain is unchanged — per-field input, then
  `DS_CONFIG.field.reserveMessage`, then the default — only the final fallback flipped, so all 14
  message-bearing fields follow (`ds-input`, `ds-textarea`, `ds-select`, `ds-autocomplete`,
  `ds-multi-select`, `ds-checkbox`, `ds-radio`, `ds-radio-group`, `ds-switch`, `ds-slider`,
  `ds-date-picker`, `ds-time-picker`, `ds-color-picker`, `ds-otp-input`). **To restore 0.7.0 behaviour
  exactly, one line:** `provideDsConfig({ field: { reserveMessage: true } })`. Per form or per field,
  bind `[reserveMessage]="true"`. Two clean-ups this enables: existing `[reserveMessage]="false"`
  bindings are now redundant and can be deleted, and any tighter sub-stack added to absorb the reserved
  gap should go back to the normal stack spacing.

- **`ds-time-picker` matches the field family: the clock glyph moved to the trailing edge, the value
  weight dropped to regular, and the trigger gap narrowed.** The glyph rendered BEFORE the value at 14px
  while every sibling field (`ds-date-picker`, `ds-select`, `ds-input`) puts its affordance last at 16px, so
  a date + time row read as two mirrored controls; the trigger also carried `--font-weight-medium` against
  the family's regular, and an 8px gap against 4px. Purely visual — set
  `--ds-time-picker-value-weight: var(--font-weight-medium)` to keep the old weight.

- **`fullWidth` on `ds-date-picker` now pushes the calendar glyph to the trailing edge.** Stretching the
  trigger left the value + glyph packed at the left (the glyph sat 122px short of the right edge on a 274px
  field), so a full-width date field did not line up with the time picker or a `ds-select` beside it.

- **Overlay panels now enter FROM their trigger edge instead of always sliding downward.** A panel below
  its trigger still slides down into place; one placed above now rises, and a side-placed panel comes in
  horizontally — `ds-scale-in` likewise grows out of the anchored edge. Previously every panel, including
  a tooltip sitting above its trigger, animated top-down. Purely visual; no API change.

### Fixed

- **`dsTooltip` now describes the element that actually takes focus, so a tooltip on a non-focusable
  host reaches a screen reader.** It set `aria-describedby` on its host unconditionally. That is right
  when the host is the control, but `ds-menu-item` carries `role="none"` and puts the real `<button>`
  inside, so the description landed on an element the user never focuses: a disabled menu item showed
  its "why" to sighted keyboard users and to nobody else. The directive now records the target of the
  `focusin` event — which bubbles, so it IS whatever took focus — and describes that. A pointer-only
  open still uses the host, where no screen reader is involved. Deliberately not implemented by
  searching the host's subtree for something focusable: that would put the tooltip inside another
  component's internal DOM and hard-code a list of what counts as focusable.

- **`ds-pagination`'s rows-per-page dropdown no longer follows the app's field defaults.** The internal
  `ds-select` was rendered without a `reserveMessage` binding, so it inherited whatever the app had set —
  and a page-size dropdown shows neither hint nor error, so it had nothing to reserve. With the row
  reserved the pager measured 54.8px instead of 32 and, because the `nav` centres its children, the
  select's control sat ~11px above the page buttons' baseline. It is now pinned off inside the template,
  which also makes it immune in the other direction: an app that opts back in with
  `provideDsConfig({ field: { reserveMessage: true } })` or wraps a region in `dsReserveMessages` no
  longer re-breaks every pager inside it. A consumer that collapsed the row with a global
  `ds-pagination ds-field-message { display: none }` can drop that rule.

- **`ds-stat`'s card now fills a stretched host, so a KPI row renders equal-height tiles.** The host is
  `display: block` and `.stat` carried no height, so in a `1fr` grid track the host stretched while the
  visible surface stayed content-sized: three tiles where only two had a `caption` painted 102.1px inside
  126.9px hosts, leaving 24.8px of empty cell under the odd one out. It reads as a layout bug rather than
  as a missing caption, and no token reached it — consumers were shipping
  `ds-stat { height: 100%; .stat { height: 100% } }` from a global stylesheet against DS-internal markup.
  A tile in an unstretched context is unaffected, since the host is still content-sized there.

- **`ds-app-layout` no longer scrolls the content back to top on a same-page URL change.**
  `LayoutScrollService` reset the scroll on every router `NavigationEnd`, so a sort, page or filter change
  that only rewrites the query string or fragment yanked the user to the top of the list. It now compares
  the path (the part before `?` / `#`) and only resets when the path itself changes; `scrollToTop()` stays
  public for a host that wants to reset explicitly, which is per-interaction and therefore more precise
  than the old blanket reset.

- **`ds-table`'s header no longer desyncs when a host maps the "off" sort click back to its own default.**
  Cycling past `desc` nulled `sortKey` internally; a server-paged host that cannot honour "unordered" pushes
  its default key back, and on the *default* column that write is a no-op for Angular's binding diff — so the
  table kept `sortKey === null`, leaving rows ordered while every header showed the neutral icon and
  `aria-sort="none"`. The key now survives the cycle and `sortDir === null` alone means unsorted; rendering
  is unchanged. **If your host reads `sortKey` to decide whether a sort is active, gate on `sortDir`
  instead** — `sortKey` is now non-null after the third click (it names the column the user last touched),
  so `if (sortKey) …` would keep sorting where it previously stopped.

- **A selected dropdown option no longer loses its tint to the hover/keyboard-active state.** In
  `styles/_dropdown-overlay.scss` the `:hover` / `.is-active` branch out-ranked `.is-selected` on
  specificity, so it repainted the row to `--surface-secondary` while keeping the selected label colour —
  and because the panel seeds `.is-active` on the selected option when it opens, it showed at REST too, not
  only under the cursor. A brand that gives the selected row a dark fill got unreadable text. The neutral
  branch is now scoped with `:not(.is-selected)` and the selected row has its own hover/active step
  (`--primary-muted`).

- **A read-only `ds-modal` no longer draws an empty footer strip.** `.actions` rendered its `border-top`
  and padding even with nothing projected into `[actions]`; it now hides when empty, the same guard the
  card already used for `.impact`.

- **`ds-docs`-style à la carte consumers were missing the overlay-panel entrance.** `styles/overlay-motion`
  is now imported by the docs app itself, so portaled panels animate there as they do for consumers of the
  bundled `styles/ds` entry.

- **Dialogs opened through `ModalService` no longer carry the `ds-overlay-pane` panel class.**
  `ModalService.open()` — and therefore `confirm()` — tagged the CDK overlay pane with `ds-overlay-pane`,
  which layered the shared overlay-panel entrance onto the modal on top of its own card/backdrop
  animation; the class is dropped, so `styles/overlay-motion` no longer applies to the pane and the modal
  plays only its own `--ds-modal-*` entrance.

## 0.7.0 — 2026-07-30

### Changed

- **BREAKING: the control `size` scale is unified into one shared `DsSize` type.** The per-component
  size types (`InputSize`, `ButtonSize`, `SelectSize`, `SearchSize`, `CheckboxSize`, `RadioSize`,
  `SwitchSize`, `SpinnerSize`, `TextareaSize`, `NumberStepperSize`, `DatePickerSize`, `TimePickerSize`,
  `DrawerSize`, `IconButtonSize`, `AutocompleteSize`) are removed from the public API — import
  `DsSize` instead (`type DsSize = 'sm' | 'md' | 'lg'`, exported from the package root). `AvatarSize`,
  `ModalSize` and `ContainerSize` remain and now extend it (`'xs' | DsSize`, `DsSize | 'xl' | 'fullscreen'`,
  `DsSize | 'xl' | 'full'`). No runtime or visual change — every component's `size` input behaves exactly as before.

- **BREAKING: form fields now reserve one line for the message row by default.** Every field
  (`ds-input`, `ds-textarea`, `ds-select`, `ds-autocomplete`, and the other message-bearing controls)
  gains a `reserveMessage` input (default `true`). With it on, the field always keeps a message line's
  worth of vertical space even when there's no hint or error, so a form no longer reflows when
  validation messages appear — the row is there from the start. Set `[reserveMessage]="false"` to
  collapse the space back (the previous behaviour) where the layout can absorb the shift.

- **BREAKING: `ds-pagination` drops its manual `(pageChange)` and `(pageSizeChange)` outputs.** They
  duplicated the two-way models — the manual `pageSizeChange` even name-collided with the `pageSize`
  model's own implicit output, and one size change fired the change events three times over. Page and
  size are now driven purely by the `[(currentPage)]` / `[(pageSize)]` two-way models. Migrate
  `(pageChange)="…"` to `(currentPageChange)="…"`; `(pageSizeChange)` keeps working unchanged (it is now
  the `pageSize` model's implicit output, same name and payload). `[(currentPage)]` / `[(pageSize)]`
  bindings are unaffected. (`ds-table` already drove pagination via the models, so it is untouched.)

- **BREAKING: `ds-input` drops the `withAddon` / `withAddonRight` inputs.** They hand-declared what the
  DOM already states — and the doc line was wrong (the flag stripped the control's inset rather than
  "reserving space"). The flush-addon layout is now derived automatically: a boxed `.addon` projected
  into `[dsInputPrefix]`/`[dsInputSuffix]` (`<span dsInputPrefix class="addon">…</span>`) sits flush via
  `:has()`, while a bare projected `<ds-icon dsInputPrefix>` correctly keeps its inset. Delete
  `[withAddon]` / `[withAddonRight]` from your templates — a boxed addon renders identically, and a bare
  icon that previously (mis)set the flag regains its proper inset (a bugfix).

- **BREAKING: `ds-app-shell` is renamed to `ds-app-layout`.** The slotted fixed-frame application layout
  shipped as `ds-app-shell` in the tagged 0.6.3 source; this renames the selector (`ds-app-shell` →
  `ds-app-layout`), the component class (`AppShellComponent` → `AppLayoutComponent`), the exported scroll
  service (`ShellScrollService` → `LayoutScrollService`), and its four tokens (`--ds-app-shell-pad-x` /
  `-pad-y` / `-content-max-width` / `-height` → `--ds-app-layout-*`). Behaviour is unchanged — rename the
  references (see `migrations/`). A consumer still on 0.6.3's `ds-app-shell` must migrate.

- **Retroactive note: `TableComponent` gained four more members (`total`, `sortingOrder`,
  `animateHeight`, `scrollToTopOnPageChange`), and most other component classes changed too**, so a
  consumer that extends a DS class (unsupported — `design-system.md` § Components) can collide on a
  name here as well, exactly as in 0.6.3. Same resolution: rename the subclass's own member, or add
  `override` where the base's semantics genuinely match.

### Added

- **New override tokens for two baked-in weights: `--ds-sidenav-item-label-weight` and
  `--ds-modal-title-weight`.** The nav-item label weight and the modal title weight were locked inside a
  `font:` shorthand with no `--ds-*` hook; a brand can now retune either without reaching past the public
  token contract. Defaults unchanged (`--font-weight-semibold` / `--font-weight-bold`).

- **`ds-table` gains an opt-in `scrollToTopOnPageChange` input.** With it on, changing page scrolls the
  table back into view, so paging from a bottom pager doesn't leave the viewport on the old page's rows.
  Off by default.

- **`ds-search` gains a `size` input (`sm`/`md`/`lg`, default `md`).** Search previously ignored `size`
  and its size CSS never matched, so it sat 4px taller than sibling controls in dense toolbars. `sm` is
  now 32px (matching `ds-input`/`ds-button` at `sm`); the default `md` keeps the prior 36px search-row
  height, so existing consumers are unaffected.

- **`ds-table` gains a `total` input for server-side pagination.** Set `[total]` to the full row count
  when the data you pass in is already the current page (fetched from the server); the table then treats
  `data` as pre-paged — it no longer slices it — and drives the pager off `total` instead of the local
  row count. Leave `total` unset (default `null`) to keep the existing client-side paging behaviour.

- **`ds-table` gains a `sortingOrder` input.** By default a sortable header cycles
  `asc → desc → unsorted`; pass `[sortingOrder]="['asc','desc']"` to drop the unsorted state (useful with
  server-paged lists that must always send a sort direction). The default is unchanged.

- **`ds-table` gains an `animateHeight` input (opt-in).** With `[animateHeight]="true"` the body
  tweens its height when the row set changes (paging, filtering) instead of snapping — the flicker
  when a full page gives way to a short one. Off by default; instant under reduced-motion (it reads the
  DS `--duration-*` token, which the reduced-motion reset zeroes).

- **`TableColumn` gains an optional `srLabel`.** Provides a visually-hidden accessible name for columns
  whose visible `label` is intentionally empty (e.g. an actions column), so screen-reader users still
  hear a column name.

- **`ds-badge` gains a `countLabel` input (default `'notifications'`).** The count's accessible label was
  hard-coded to `"N notifications"`; set `countLabel` for non-notification counts (`'items in cart'`,
  `'results'`, …).

- **`ds-avatar` gains deterministic seeded tinting.** Pass `[seed]` (a user id, email or name) and the
  avatar derives a stable per-person background + auto-contrast text colour, so the same person gets the
  same colour across the product; `[avoidHues]` excludes hue arcs (e.g. a brand colour), and `[tint]` now
  also accepts `'neutral'`. The maths ships standalone too — `avatarTint(seed, options)` returns an OKLCH
  background (`AvatarTintOptions`: `avoidHues` / `lightness` / `chroma` / `foreground`) with a
  WCAG-luminance black-or-white foreground, and `initialsFrom(first, last)` (which also accepts a single
  full-name string) — both exported from the package root.

- **`ds-sidenav-item` gains an `(activate)` output.** Emitted on click, carrying the `MouseEvent`. On an
  `href` item, `preventDefault()` intercepts navigation (e.g. a sidebar driving its own scroll-spy); a
  `routerLink` item navigates regardless (Angular's `RouterLink` ignores `defaultPrevented`), so it's a
  click hook there. Additive; omit it to navigate as before, keeping active/badge/tooltip/collapse intact.

- **`BodyScrollLockService` is now exported.** The ref-counted body-scroll lock that `ds-modal` /
  `ds-drawer` / `ds-bottom-sheet` share is injectable, so a consumer's own full-screen overlay can
  participate in the same lock instead of fighting it (`lock()` / `unlock()`, paired).

### Fixed

- **`ds-menu`: disabled items are now keyboard-reachable.** A disabled `ds-menu-item` was dropped from the
  roving-tabindex nav (unreachable by keyboard) and rendered a native `disabled` button; it now uses
  `aria-disabled` and stays in the arrow / type-ahead order (ARIA menu practice), so a keyboard user can
  focus it — and a `[dsTooltip]` on it now shows on focus, surfacing a "why is this disabled" reason.
  Activation stays blocked. (Reliable screen-reader announcement of that reason is a separate follow-up —
  the tooltip's `aria-describedby` currently lands on the `role="none"` host, not the inner button.)

- **Stacked overlays no longer unlock body scroll under each other.** `ds-modal`, `ds-drawer` and
  `ds-bottom-sheet` each wrote `body.style.overflow` directly, so closing the outer of two stacked
  overlays re-enabled page scroll while the inner one was still open. They now share a ref-counted
  `BodyScrollLockService` — the first lock hides `body` overflow, the last unlock restores it.

- **`ds-avatar`: `--ds-avatar-size` now applies at every size, not just `md`.** The `xs`/`sm`/`lg`
  modifiers set `width`/`height` directly, silently ignoring a consumer's `--ds-avatar-size`; they now
  route through the same private var the token feeds, so an override wins at any size.

- **`ds-table`: an out-of-range page is clamped back into range.** When a client-side filter shrinks the
  result set below the current page, the table now pulls `page` down to the last page that has rows
  instead of rendering an empty body (guarded to client paging — with `total` set the host owns the clamp).

- **`ds-sidenav`: collapsed items no longer overflow by 1px.** A collapsed item was sized to the
  `--sidenav-collapsed-item` hit target, 1px wider than the rail's content box (border-box minus padding
  and the right border), which produced a hairline horizontal scrollbar. Collapsed items now fill the
  available width, and the rail clips any residual x-overflow.

- **`dsTooltip`: keyboard focus now shows and hides the tip reliably, and panels no longer strand.** The
  directive listened on `focus`/`blur`, which don't fire for focus moving between descendants; it now uses
  the bubbling `focusin`/`focusout`, so tooltips on composite controls open and close as focus enters and
  leaves. A re-rendered anchor under a stationary cursor could also leave a panel open — `show()` now
  disposes any existing overlay first, and activation (`click`) dismisses too.

- **`ds-select`: the clear (×) button is now keyboard-operable.** It was a non-focusable `<span>`; it is
  now a real `<button aria-label="Clear selection">`, and the trigger is a focusable `role="combobox"`
  container so the nested button is valid.

## 0.6.3 — 2026-07-27

### Added

- **Typography utilities (`.t-*`) expose per-axis `--ds-t-*` token hooks.** Every `.t-display`/`.t-h1`
  …`.t-mono-block` utility now reads each type property as a longhand through a public
  `--ds-t-<name>-<prop>` custom property that falls back to the current semantic token —
  `font-weight`, `font-size`, `line-height`, `font-family`, plus `letter-spacing` / `text-transform` /
  `color` / `background-color` / `border-color` / `border-radius` where the class sets them. A consumer
  can now retune a single axis in a scope (`[data-brand] .t-h3 { --ds-t-h3-font-weight: var(--font-weight-bold) }`)
  without re-declaring the whole rule or forking the class — the same consumer-first `--ds-*` contract
  the components use, extended to the global utility layer. Default rendering is unchanged (structural
  box props — padding/margin/border-width/max-width/overflow — stay raw). Minor: the `font` shorthand
  was split into longhands, so `.t-*` no longer force `font-style`/`font-variant` back to `normal`
  (they inherit) — only observable inside an italic/small-caps ancestor.
- **`ds-table` row-action kebab menu.** New opt-in `rowActions` input renders a trailing ⋮ column;
  the per-row button opens a `ds-menu` of the configured items (`id`, `label`, optional `icon`,
  destructive `error`, per-row `disabled` predicate) and `rowActionSelected` emits `{ action, row }`
  on pick. Off by default — tables without `rowActions` render exactly as before. Kebab clicks stop
  propagation, so on a `rowInteractive` table a menu click never triggers `rowClicked`. New exported
  types `TableRowAction` / `TableRowActionEvent`.
- **`ds-table` current-row highlight, client filter, and honored column fields.** New opt-in
  `activeRowId` input marks one row as current (tinted via the new `--ds-table-row-active-bg-color`
  token + `aria-current`) — e.g. the row whose detail drawer is open. New `filterQuery` input filters
  rows client-side (case-insensitive substring over cell text; columns with `filterable: true`
  restrict the match set, none marked = all columns) — sorting, pagination totals and the empty slot
  all follow the filtered set. `TableColumn.width` (px, applied to the header cell),
  `TableColumn.truncate` (ellipsis-clip at `width`, 240px fallback, full value in the title tooltip;
  text cells only) and `TableColumn.hidden` (column skipped, still filterable/sortable) were declared
  but ignored — they now work.
- **`ds-table` column picker.** Columns marked `hideable: true` (declared but ignored until now)
  surface a picker button in the header's trailing cell — a checkbox popover toggles column
  visibility, with `hidden: true` as the initial state and the last visible column locked so the
  grid can't go empty. New two-way `hiddenKeys` model (`Set<string> | null`; `null`, the default,
  derives the set from the `hidden` flags — binding a Set takes over and the flags are ignored).
- **`ds-table` inline cell editing.** Columns marked `editable: true` turn into a text input on
  double-click; Enter or blur commits, Escape cancels. The table stays data-agnostic — it emits
  `cellEdited` (`{ row, key, value }`, new exported `TableCellEditEvent` type) and the consumer owns
  the data update.
- **`ds-table` per-column set filters.** A column marked `filter: 'set'` gets a header funnel
  button opening a searchable checkbox list of that column's distinct values; unchecking narrows the
  rows and the funnel highlights while a filter is active. State is two-way bindable via the new
  `columnFilters` model (`Map<key, Set<value>>` — the still-checked values; a column absent or fully
  checked reads as unfiltered) and combines with `filterQuery`.
- **`ds-table` column resizing.** New opt-in `resizableColumns` input adds a drag handle to each
  column header's right edge; widths are two-way bindable via the new `columnWidths` model
  (`Map<key, px>`), seeded from `column.width`. The header clips its label so a narrowed column
  can't spill into its neighbour.
- **`ds-table` column reordering.** New opt-in `reorderableColumns` input adds a drag handle and
  up/down buttons to each row of the column panel (which now lists every column, not just hideable
  ones); the order is two-way bindable via the new `columnOrder` model (`string[] | null`, `null` =
  declaration order), and the panel's `Reset to default` resets all three column models — order,
  visibility **and** widths (`columnOrder`, `hiddenKeys`, `columnWidths`). The panel surfaces
  whenever any column is `hideable` **or** `reorderableColumns` is set.
- **`ds-table` CSV export.** New public `exportCsv(filename?)` method downloads the visible columns
  of the filtered + sorted rows (all rows, not just the current page) as a UTF-8 CSV — wire it to a
  consumer toolbar button via a template reference.
- **`ds-table` density, zebra striping and capped scroll height.** New `density="compact"` input
  tightens cell padding for spreadsheet-dense lists; `zebra` tints odd rows (via the new
  `--ds-table-row-stripe-bg-color` token); `maxHeight` (any CSS length) caps the scroll body and
  scrolls it vertically, pairing with `stickyHeader` for a self-contained scroll region. All opt-in.
- **`ds-table` sticky horizontal scrollbar.** New opt-in `stickyScrollbar` input hides the scroll
  container's native horizontal bar and renders a proxy scrollbar stuck to the bottom of the nearest
  scroll ancestor while the table is in view, mirroring `scrollLeft` both ways — on a tall, wide
  table the horizontal bar stays reachable without scrolling to the table's end. The proxy hides
  itself when the table doesn't overflow.
- **`ds-table` truncated cells open a full-value popover on click.** A `truncate` column's clipped
  cell now shows its complete text in a popover when clicked (in addition to the existing title
  tooltip); the click is swallowed so it never doubles as a row click, while an unclipped cell
  passes the click through to the row unchanged.
- **`ds-app-shell` — slotted fixed-frame application shell.** `[sidenav]`/`[topbar]`/default
  content slots; the host pins to the viewport (`100dvh`, `overflow: hidden`) and ONLY the content
  `<main>` scrolls (`scrollbar-gutter: stable` + automatic native-scrollbar-width padding
  compensation via the new `--ds-scrollbar-width` root variable). `topbarSpan` input switches the
  geometry (`'content'` default: full-height rail; `'full'`: full-width topbar). Built-in
  scroll-to-top on router navigation via the new exported `ShellScrollService` (also injectable
  from routed pages for manual `scrollToTop()`). Tokens: `--ds-app-shell-pad-x/-pad-y/`
  `-content-max-width/-height`.
- **`ds-sidenav-footer` — rail footer brick.** Search row with a live grouped-results popover
  (Enter opens the first hit), Alerts row with an unread dot + feed popover, Collapse row, and a
  user card with an account menu. Inputs `userName`/`userRole`/`alerts`/`collapsed`/
  `searchProvider`/`alertItems`/`profileRoute`; outputs `collapseToggled`/`alertsOpened`/
  `signOutSelected`. New exported types `SidenavSearchProvider`/`SidenavSearchResult`/
  `SidenavAlertItem`. Tokens: `--ds-sidenav-footer-popover-width/-popover-max-width/`
  `-popover-max-height/-head-tracking/-dot-size`.
- **`ds-sidenav` brand-row logo glyph + wordmark projection.** New optional `logoLetter` input sets
  the tile glyph when it differs from the brand's first letter. A new `[dsBrandName]` projection
  slot (exported marker directive `BrandNameDirective`) lets consumers project custom wordmark
  markup — two-tone wordmarks, inline logos — which renders inside `.brand-name` in place of the
  plain `brand` text. Both are optional; omitting them renders exactly as before.

### Changed

- **`ds-input`, `ds-search` and `ds-textarea` focus the control when the frame chrome is clicked.**
  Clicking a leading/trailing icon, a prefix/suffix add-on, or the frame padding now focuses the
  inner `input`/`textarea` instead of doing nothing — the whole field box is a focus target, matching
  native `<label>` behaviour. Clicks on nested controls (projected buttons, the clear ✕, the password
  toggle) are left untouched. Driven by the new exported `FieldClickFocusDirective`
  (`[dsFieldClickFocus]`), which consumers can apply to their own field wrappers. Overlay-trigger
  fields (`ds-autocomplete`, `ds-date-picker`, `ds-select`, `ds-multi-select`, `ds-color-picker`)
  already focused on trigger click and are unchanged.
- **`ds-table` row hover/pressed tints are now exclusive to `rowInteractive` tables.** Passive
  tables no longer tint rows on hover — the tint now honestly signals clickability; interactive rows
  additionally gain a pressed (`:active`) fill via the new `--ds-table-row-pressed-bg-color` token
  (default `--surface-muted`). To restore the old always-on hover on a specific passive table, add
  consumer CSS: `ds-table tbody tr:hover td { background-color: var(--surface-secondary); }`.
- **`ds-table` row click yields to text selection.** On a `rowInteractive` table, a click that
  finishes a mouse text selection no longer emits `rowClicked` — users can drag-select and copy
  cell text without triggering the row's navigation. Only a selection created by that same
  press-drag-release gesture counts (compared against a mousedown snapshot): a pre-existing
  selection the browser can't collapse (e.g. over `user-select: none` content) never wedges row
  clicks. Keyboard activation (Enter/Space) is unaffected.

- **Breaking: `ds-date-picker` input `defaultMonth` is renamed to `defaultDate`.** The input always
  accepted a full `Date` and used its exact day (grid focus lands on that day, the panel opens on
  its month) — the old name undersold it as month-only granularity. Behavior is unchanged: it only
  positions the calendar when the value is empty and is never written to the value. Rename
  `[defaultMonth]="…"` to `[defaultDate]="…"`.
- **`ds-select`, `ds-autocomplete`, `ds-multi-select`, `ds-time-picker`, `ds-color-picker` and
  `ds-popover` overlay panels are now non-modal (no backdrop), matching `ds-date-picker`.** They drop
  the transparent CDK backdrop (`hasBackdrop: true` + `backdropClick`-to-close) for
  `hasBackdrop: false`, so while a panel is open the page behind it stays fully interactive — hover,
  cursor and pointer all reach it, and an outside click both activates whatever it lands on and closes
  the panel. Panels now dismiss on a pointer press outside the panel or on page scroll (a capture-phase
  document scroll listener, since CDK scroll strategies miss a plain `overflow: auto` container).
  Button-style triggers (`ds-select`, `ds-color-picker`, `ds-popover`, `ds-multi-select`) now toggle —
  a click, or Enter/Space, on the trigger closes an open panel (previously a trigger click couldn't
  close it); `ds-time-picker` segment buttons toggle the open segment and switch directly between the
  start/end segments; `ds-autocomplete`'s text input keeps its click for caret placement (only its
  chevron toggles), and typing that overflows the filter input no longer collapses the panel. Focus
  returns to the trigger when a panel closes via Escape, a selection (e.g. a `ds-color-picker` preset)
  or an in-panel control, but an outside-pointer/scroll close leaves focus where the user's click or
  scroll put it (no focus stealing). `ds-modal` / `ModalService` are intentionally unaffected — they
  stay modal. No public API or token changes.
- **`ds-toast` now slides up from below into place as it enters** (previously it dropped in from
  slightly above). The exit animation is unchanged — the toast still slides up as it fades out.
  Visual/motion only; no API change.
- **Retroactive note: the new `ds-table` column API grew `TableComponent`'s member surface by ~76
  names, which breaks a consumer that extends the class.** Everything above is additive for anyone
  using the `<ds-table>` element. Subclassing a DS component is unsupported (`design-system.md`
  § Components), but where it happens the new names collide — TS4114 demands an `override` modifier,
  TS2416 fires where the signature differs. Collisions seen in the wild: `zebra`, `columnOrder`,
  `orderedColumns`, `visibleColumns`, `toggleColumn`, `onColumnDrop`, `moveColumn`, `resetColumns`,
  `columnFilters`, `exportCsv`, `onResizeMove`, `onResizeEnd`. Rename the subclass's own member, or
  add `override` where the base's semantics genuinely match (`zebra` must then adopt the base's
  `booleanAttribute` transform). Build after upgrading — the compiler enumerates every collision.

### Fixed

- **`ds-date-picker` no longer strands focus on `<body>` when the calendar closes by outside
  click or page scroll.** The picker was already non-modal, but a scroll-close or
  outside-pointer close left focus on the document body instead of the field. `close()` now
  returns focus to the field (`preventScroll`) whenever focus was inside the calendar — with
  one exception: a coarse-pointer device with an editable field (`allowInput`) is left alone,
  to avoid re-summoning the soft keyboard, while a readonly field (`allowInput=false`) always
  refocuses. Escape / selection / preset closes already refocused and are unchanged; no API
  change.

## 0.6.2 — 2026-07-21

### Added

- **`ds-sidenav` accepts a projected `[brand]` slot for a custom logo.** A
  `<ng-content select="[brand]">` now sits in the brand row at the top of the rail, so consumers
  can project an `img`/SVG/any markup as the logo instead of — or alongside — the string `brand`
  input. The string `brand` input is unchanged (it still renders an auto letter-mark from the
  first character plus the brand name). The brand row, previously gated on the string `brand`
  being set, now always renders and hides itself via `:empty` when there is neither brand text
  nor projected content, so the empty state is identical to before.

### Fixed

- **`ds-bottom-sheet` Escape is now scoped to its own panel instead of the document.** The sheet
  bound `(document:keydown.escape)`, whereas modal and drawer scope Escape to their panel; with
  stacked overlays this let a background sheet steal the Escape meant for the overlay on top. The
  binding moves to `(keydown.escape)` on the sheet's overlay element, mirroring modal — the focus
  trap auto-captures focus inside the sheet so Escape lands on the panel (sheets whose body has no
  focusable content now need one for Escape to reach them), and a stacked overlay above the sheet
  no longer has its Escape consumed underneath.
- **`ds-date-picker` mobile Backspace/Delete removes one digit and crosses separators instead of
  wiping the whole segment.** Following 0.6.1's routing of mobile edits through `beforeinput`,
  Gboard reports Backspace/Delete with a full-segment "selection" (its composing region), which
  hit the segment editor's selection-clear branch and erased the entire segment (e.g. all of
  `MM`) on one tap — also defeating 0.6.1's separator-crossing behaviour. The mobile `beforeinput`
  path now collapses the selection to the caret edge (`selectionEnd` for Backspace,
  `selectionStart` for Delete) before editing, forcing the single-character branch so one tap
  deletes exactly one digit and crosses a `/` separator, matching desktop `keydown`.
- **`ds-bottom-sheet` no longer jolts all host-app content up then down as it opens.** The `.sheet`
  enters via `translateY(100%) → none` inside the `position: fixed; inset: 0` `.sheet-overlay`, and
  `cdkTrapFocusAutoCapture` focuses the panel's first tabbable at frame ~0 via `element.focus()`
  without `preventScroll` — while the panel still sticks out below the frame. In consumer shells that
  are a containing block for fixed descendants (`filter`/`transform`) combined with `overflow: hidden`
  (e.g. a centred "phone frame"), the still-translated panel contributes scrollable overflow to that
  shell, so the focus scroll-into-view yanks the shell's `scrollTop` up by ≈ the sheet height (all app
  content jumps up in one frame); as the enter animation lands the overflow vanishes and the browser
  clamps the scroll back to 0 (content slides back down). `.sheet-overlay` now uses `overflow: clip`,
  which clips the translating panel so it never leaks scrollable overflow to consumer ancestors and —
  unlike `hidden` — is not programmatically scrollable, so scroll-into-view cannot move it either. No
  visual change: the panel was already visually cut at the frame edge.
- **`ds-drawer` no longer scroll-jolts host-app content as it opens.** Same bug class as the
  bottom-sheet fix: the `.drawer` panel was itself `position: fixed` (a sibling of the fixed
  `.drawer-scrim`) sliding in from `translateX/Y(±100%)` under the same `cdkTrapFocusAutoCapture`, so
  the right/bottom (positive-direction) placements leaked scrollable overflow into the same kind of
  containing-block-plus-`overflow: hidden` consumer frames. The scrim and panel are now wrapped in a
  `.drawer-root` div (`position: fixed; inset: 0; z-index: var(--layer-modal); overflow: clip`) and
  both children switched from `fixed` to `absolute`, so the wrapper genuinely clips them (fixed
  descendants would escape an ancestor's clip); geometry is identical in normal and framed apps across
  all four placements, including the RTL left-drawer case. `isolation: isolate` was added to `.drawer`
  to preserve the stacking context the old `fixed` + `z-index` panel provided, so negative-`z-index`
  content projected into the drawer body can't sink under the scrim. No public API or token change:
  scrim click-to-close, panel-scoped plus document-level Escape, `animationend` teardown, and the focus
  trap are all unchanged.

## 0.6.1 — 2026-07-16

### Fixed

- **`ds-date-picker` panel now closes on scroll of any scroll container.** 0.6.0 used the CDK
  close-scroll strategy, which only observes the window and registered `cdkScrollable`s — so a plain
  `overflow: auto` container (e.g. an app's scrolling `<main>`) never triggered the close and the
  panel floated. It now also closes via a capture-phase document scroll listener, which catches the
  non-bubbling scroll from any nested container.
- **`ds-date-picker` masked typing works on mobile keyboards.** Segment-aware editing was wired to
  `keydown`, but Android/Gboard fires no reliable `keydown` for edits (Backspace arrives as a
  `beforeinput` with `inputType: "deleteContentBackward"`), so deletion fell back to a native delete
  + re-mask that couldn't cross a `/` separator — leaving the caret stuck (many taps to pass a
  separator). Editing (digit entry, Backspace, Delete, selection replace) now also routes through
  `beforeinput`, so a single tap crosses separators on a phone, matching desktop.
- **`ds-date-picker` panel drops the misleading `aria-modal` attribute.** The calendar panel is
  non-modal (no backdrop, the rest of the page stays interactive) but still advertised
  `aria-modal="true"`, telling assistive technology the page behind it was inert. Removed so the
  announced ARIA state matches the panel's actual non-blocking behaviour.

## 0.6.0 — 2026-07-16

### Breaking

- **`styles/breakpoints` is side-effect-free — `--bp-*` now comes from an explicit `emit-vars`
  mixin.** The partial exposes the `$bp-*` Sass aliases and `up()` / `down()` mixins with zero CSS
  output on plain `@use`, so component styles can import it for media queries without duplicating a
  `:root` block. The `--bp-*` runtime custom properties (for JS via `getComputedStyle`) are emitted
  only when `emit-vars` is included. `styles/ds` includes it once — **unaffected** for consumers of
  the aggregate. À-la-carte consumers who `@use '@ids-group-ltd/ids-design-system/styles/breakpoints'`
  directly and need `--bp-*` must add `@include bp.emit-vars;` themselves.

### Added

- **`menu` icon** (hamburger, three horizontal bars) in the icon registry.

### Changed

- **`.grid-2` / `.grid-3` / `.grid-4` layout utils collapse to a single column below 640px**
  (`$bp-sm`), matching the rest of the responsive grid tiers.
- **`.grid-3` / `.grid-4` layout-utils collapse tiers normalized to canonical breakpoints**: 1100px →
  1024px (`$bp-lg`), 820px → 768px (`$bp-md`).
- **`ds-page-header` actions full-width threshold normalized to canonical breakpoint**: 720px → 768px
  (`$bp-md`).
- **`.t-mono-block` scrolls instead of overflowing.** Added `max-width: 100%; overflow-x: auto;` so
  long unbroken lines scroll within the block rather than forcing page-level horizontal overflow.
- **`ds-modal` panel clamps to the viewport on small screens.** New `max-width: calc(100vw -
  var(--space-6))`; `max-height` is now `90vh` with a `90dvh` fallback (browsers without `dvh`
  support keep `90vh`).
- **`ds-date-picker` shows per-segment placeholders and a fixed-width value.** Each empty
  `MM` / `DD` / `YYYY` segment now renders its own format-letter placeholder (e.g. `MM/DD/YYYY`),
  and a partially-typed segment shows the typed digits followed by muted padding letters. Achieved
  with a transparent input layered over a per-slot overlay, so the value stays fixed-width and the
  caret stays aligned as you type across segments (single and range mode).
- **`ds-date-picker` calendar panel is now non-blocking (no backdrop).** The panel renders with
  `hasBackdrop: false`, so hover/pointer events reach the rest of the page instead of being
  swallowed by a full-screen scrim, and the trigger input stays live — clicking it while the panel
  is open repositions the caret without closing. The panel closes on a pointer-down outside the
  field and panel, on Escape, on selecting a day, and on scroll.

### Fixed

- **`ds-description-list` no longer forces page-wide horizontal scroll on narrow viewports.** The
  item's `1fr` grid column had no `minmax(0, …)`, so its min-content contribution (long unbroken
  values like API keys) blew out the track past the container; both grid tracks now use
  `minmax(0, …)` and the value gains `overflow-wrap: anywhere` to actually wrap into the freed space.
- **`ds-drawer` / `ds-bottom-sheet` / `ds-modal` no longer hang mid-close when the tab is backgrounded.**
  Teardown waited on the leave animation's `animationend`, but Chrome freezes CSS animations on a
  hidden document, so the event never fired and the panel stayed stuck in its `closing` state with
  the scrim visible and body scroll locked; each now also arms a 300ms synthetic-fallback timer that
  completes teardown if `animationend` doesn't arrive first (whichever fires first wins, the other is
  cancelled). `ds-drawer`'s `animationend` name check also switched from a loose `.includes()` match
  to per-placement `.endsWith()`, matching the guard already used by `ds-bottom-sheet` / `ds-modal`.
- **`ds-popover` overlay no longer touches or crosses the viewport edge on small screens.** The
  `FlexibleConnectedPositionStrategy` had no viewport margin, so panels near an edge could butt
  right up against it or overflow past it; now reserves an 8px margin on all sides.
- **`ds-date-picker` calendar panel no longer overflows phone viewports.** Below 640px (`$bp-sm`)
  the panel clamps to `calc(100vw - var(--space-4))` and the presets column stacks below the day
  grid instead of sitting beside it, replacing the fixed 454px-wide side-by-side layout that
  overflowed the screen.
- **`ds-date-picker` text entry is now segment-aware — editing one field no longer disturbs the
  others or the caret.** Typing, Backspace and Delete stay within the focused `MM` / `DD` / `YYYY`
  field (single and range mode); previously correcting one segment could shift digits across the
  `/` separators and fling the caret to the end.
- **`ds-date-picker` no longer shows a mask residue or a false invalid state when pristine.** An
  untouched field previously held a `__/__/____` residue that was read out to screen readers and
  could trip validation on blur; it now renders empty and raises no invalid state until the user
  actually enters a value (single and range mode).
- **`ds-date-picker` paste is slot-aware.** Pasting digits fills segments sequentially from the
  caret position rather than flattening the field or clearing unrelated segments.
- **`ds-date-picker` range values can no longer be corrupted by clearing one segment.** Parsing is
  now slot-based instead of slicing by digit count, so clearing one segment of a range no longer
  pulls a digit from an adjacent segment into the emptied slot; a date is parsed and validated only
  once all of its slots are filled.
- **`ds-date-picker` exposes its format hint to screen readers via `aria-placeholder`.** After the
  native placeholder was removed for the overlay rework, the `MM/DD/YYYY` format hint is now surfaced
  to assistive technology through `aria-placeholder`.

## 0.5.1 — 2026-07-13

### Breaking

- **Status vocabulary unified — `danger` → `error`, `warn` → `warning`.** A new exported
  `DsStatus = 'info' | 'success' | 'warning' | 'error'` is the canonical status vocabulary.
  Renamed to match it: the boolean input `[danger]` → `[error]` on `ds-modal` / `ds-modal-card` /
  `ds-menu-item`; `ds-stat` `variant` value `'danger'` → `'error'`; `ds-progress` `variant` value
  `'warn'` → `'warning'` (`ProgressVariant` is now `'default' | Exclude<DsStatus, 'info'>`);
  `ModalConfirmTone` `'danger'` → `'error'` (also `ModalService.confirm({ tone })`);
  `SplitButtonItem.danger` → `.error`. Public tokens renamed in lockstep:
  `--ds-menu-item-danger-label-color` → `--ds-menu-item-error-label-color` and
  `--ds-progress-bar-color-warn` → `--ds-progress-bar-color-warning`. CSS state classes and every
  default value are otherwise unchanged.
- **Event outputs renamed to past-participle (consistent event naming).** Dismissal events unified
  to `closed`: `ds-alert` / `ds-banner` / `ds-toast` `(dismissed)` → `(closed)`. Action events made
  past-tense: `ds-table` `(rowClick)` → `(rowClicked)`, `ds-stepper` `(stepClick)` →
  `(stepClicked)`, `ds-calendar-day` `(daySelect)` → `(daySelected)`, `ds-tabs` `(tabClose)` →
  `(tabClosed)`, `ds-tree` `(nodeSelect)` → `(nodeSelected)`, `ds-split-button` `(itemSelect)` →
  `(itemSelected)`.
- **`ds-progress` — `indeterminate` is now a boolean input, not a `variant` value.** The animation
  mode was conflated with the colour variant (a bar could not be `success`-coloured *and*
  indeterminate). Migration: `<ds-progress variant="indeterminate" />` →
  `<ds-progress indeterminate />`; `'indeterminate'` removed from `ProgressVariant`.
- **`ds-badge` / `ds-status-dot` status API redesigned — factory statuses replaced by a
  consumer-defined registry.** `ds-badge`'s `[variant]` input (`BadgeVariant`) is replaced by
  `[status]` (typed `DsStatusKey`); `ds-status-dot`'s `[status]` is retyped `StatusValue` →
  `DsStatusKey` and no longer defaults to `'planning'`. Both now render the value as a `data-status`
  attribute instead of a factory CSS class, so the built-in per-status rules (`.badge.planning` /
  `.active` / `.confirmed` / `.completed` / `.info` / `.success` / `.warning` / `.error` /
  `.neutral` / `.secondary`, plus the matching `.status-dot.*`) and the factory `--status-*`
  lifecycle theme tokens (`--status-planning-bg-color`, `--status-confirmed-*`, `--status-active-*`,
  `--status-completed-*`) are all removed. The exported types `BadgeVariant`, `BadgeLifecycle`,
  `BadgeSemantic`, and `StatusValue` are removed. Migrate `variant="active"` → `status="active"`,
  then define your own status colours via the new `styles/status` SCSS API (see Added) keyed on
  `[data-status]`. `[count]` mode, `[solid]`, `[withDot]`, `[max]`, and the `--ds-badge-*` /
  `--ds-status-dot-*` hooks are unchanged. Full migration guide (model, worked example, and the
  case where a consumer coloured badges via its own status-named class): `migrations/0.5.1/badge-statuses.md`.
- **`title` is now required on `ds-drawer`, `ds-bottom-sheet`, and `ds-accordion-item`** (was
  optional). Their `title` is the component's accessible name (dialog `aria-labelledby`) or the
  disclosure-button label, so a missing title left them unnamed. `ds-modal` / `ds-modal-card` stay
  required (unchanged); `ds-page-header` is now **optional** (its `title` is a plain `<h1>`, not an
  accessible-name dependency — a non-breaking loosening).
- **Default `secondary` / `tertiary` hues now diverge from `primary`.** Previously both roles
  defaulted to the `--primary` channels, so an un-branded app rendered `primary`, `secondary`, and
  `tertiary` as the same blue. They now default to distinct palette families — `--secondary-h/s/l` →
  `--orange-h/s/l` (warm orange) and `--tertiary-h/s/l` → `--violet-h/s/l` (cool violet), in both
  light and dark themes. Consumers who already set `--secondary-h/s/l` / `--tertiary-h/s/l` per brand
  are unaffected; to keep the old single-hue look, point those channels back at `--primary-h/s/l`.
- **`--static-white` theme token removed.** The fixed-value `--static-white` custom property is gone;
  its uses now emit the literal `white`. No visual change, but a consumer who referenced
  `var(--static-white)` must replace it with `white` (`--static-ink` is retained).

### Added

- **`DsStatus` type export** — `'info' | 'success' | 'warning' | 'error'`, the shared status
  vocabulary used across status-bearing components.
- **`ds-progress` `[indeterminate]` boolean input** — orthogonal to `variant` (see Breaking).
- **`DividerSpacing` is now exported** from the public API (the `ds-divider` `[spacing]` input type
  was previously declared but not re-exported).
- **Extensible status system — `DsStatusRegistry` / `DsStatusKey` + `styles/status` SCSS API.** New
  public exports: `DsStatusRegistry` (an empty interface consumers augment via declaration merging to
  register their own status keys) and `DsStatusKey` (an open `string` until the registry is augmented,
  then a union of the registered keys — the type of `ds-badge` / `ds-status-dot` `[status]`). A new
  SCSS entry point `@use '@ids-group-ltd/ids-design-system/styles/status'` exposes `define($map)` —
  wires `[data-status]` selectors to the `--ds-badge-*` / `--ds-status-dot-*` tokens from a Sass map
  of `name: (bg:, text?:, dot?:)` — and `semantic-preset`, a ready-made `info` / `success` /
  `warning` / `error` / `neutral` set. This is the replacement for the removed factory statuses (see
  Breaking).

### Changed

- **Press-feedback reworked — no button-style press on non-buttons.** The `:active` scale+brightness
  press was removed from the overlay field triggers `ds-autocomplete` / `ds-select` /
  `ds-multi-select` (opening the panel is the feedback). List/menu rows and the color-picker trigger
  (`ds-menu-item`, `ds-list`, `ds-tree`, `ds-accordion` header, `ds-color-picker`) swap the scale for a
  flat rounded `:active` background. Press-scale stays on buttons and compact actionable controls
  (`ds-button`, `ds-calendar-day`, `ds-pagination`, `ds-tabs`, `ds-segmented`, `ds-toggle-button`,
  `ds-sidenav-item`, checkbox / radio / switch). Small icon action buttons — close / dismiss /
  clear / remove `×`, plus the `ds-tag` chip close (used by autocomplete & multi-select chips) — now
  consistently get the button press-scale too (they previously had no `:active` feedback, or only a
  flat tint).
- **`ds-date-picker` keeps the format mask visible while typing.** In manual-input mode the unfilled
  tail of the date mask now stays on-screen as a muted ghost (after typing `12/` the field reads
  `12/DD/YYYY`) instead of the placeholder vanishing on the first keystroke. The typed value renders
  in the monospace font so digits land exactly on the mask's `D`/`M`/`Y` positions and the tail never
  shifts as you type.

### Fixed

- **Boolean attribute coercion on all boolean inputs.** ~54 boolean inputs across ~30 components
  gained `transform: booleanAttribute`, so a bare or string attribute (`<ds-x required>` /
  `disabled="false"`) now coerces correctly instead of being read as a truthy string. Property-
  binding consumers are unaffected.
- **`ds-button` tonal fill — `:active` now darkens past `:hover`.** The `tonal` variant reused the
  same token (`--c-muted-strong`) for both hover and active, so the pressed background was identical
  to hover; active now mixes that tint ~10% toward black for a distinct pressed step.
- **Per-instance overlay panel token overrides now reach the portaled pane.** `--ds-*` panel tokens
  set on the host of `ds-autocomplete`, `ds-multi-select`, `ds-date-picker`, `ds-color-picker`,
  `ds-popover`, and `ds-time-picker` were ignored because the panel renders in a CDK overlay
  (portaled outside `:host`, where the custom properties no longer inherit); the host's resolved
  panel tokens are now forwarded onto the overlay element on open. (`ds-select` uses the shared
  global panel class and was never affected.)
- **`ds-autocomplete` / `ds-multi-select` panels no longer render transparent.** Their internal panel
  colour resolvers were declared on `:host`, but the panel is portaled — so the background collapsed
  to transparent (page content bled through) with broken hover/active highlighting; the resolvers now
  sit on the panel element itself.
- **`ds-tabs` `secondary` variant now applies.** The secondary-toned active indicator and label were
  keyed off `.tabs.secondary`, but the variant class lands on the host, so the selector never
  matched; rewritten to `:host(.secondary)`.
- **`ds-date-picker` range mask no longer clips the second date**, and the trigger's value-to-icon
  gap is tightened to 4px. The field now reserves an extra character of width so the wider range-mode
  mask (two dates) is no longer cut off.
- **`ultra-compact` density tier gained full token coverage.** `[data-density="ultra-compact"]` now
  also scales avatar size, sidenav width, badge / status-dot sizes, and switch geometry — previously
  left at the cozy defaults, so those controls didn't shrink with the tier.

## 0.5.0 — 2026-07-08

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
- **Public token prefixes normalized to match the selector (not aliased).** Four components had
  their `--ds-*` token name fragments hyphenated to align with the Angular selector; the old
  concatenated names silently stop resolving, so consumers who override any of these must rename.
  `--ds-datepicker-*` → `--ds-date-picker-*` (~14 tokens: `bg-color`, `border`, `shadow`, `width`,
  `trigger-bg-color`, `trigger-border-color`, `day-hover-bg-color`, `day-today-label-color`,
  `day-selected-*`, `day-range-*`, `day-disabled-label-color`); `--ds-statusdot-*` →
  `--ds-status-dot-*` (`color`, `size`); `--ds-pagehdr-*` → `--ds-page-header-*` (~10 tokens:
  eyebrow / title / subtitle / meta / crumb text colors, `meta-icon-color`, `divider`, `title-fs`,
  `title-gap`); `--ds-avatargroup-*` → `--ds-avatar-group-*` (`overlap`, `ring`, `overflow-bg-color`,
  `overflow-label-color`). Only the names changed — the CSS property each feeds and every default
  value are byte-identical; purely a naming-consistency fix.

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
  Birth). Manual masked entry is now available (`allowInput`, default `true`): the field enforces
  the locale mask, rejects non-numeric input, hard-caps each segment (so a year can't exceed four
  digits), and flags impossible/out-of-range dates on blur; range mode uses one combined field
  (`MM/DD/YYYY – MM/DD/YYYY` in a single input). Clicking the field or the trailing calendar icon
  opens the panel. New `DsConfig.datePicker` ({ `locale`, `dateFormat`, `firstDayOfWeek` }).
  The panel follows the APG date-picker-dialog pattern: `role="dialog"` (aria-modal, labelled,
  focus-trapped, Escape to close) over a `role="grid"` of labelled `columnheader`/`gridcell`s, each
  day carrying a full-date accessible name; out-of-range days are `aria-disabled` yet stay
  keyboard-reachable, and month/year navigation is announced via a polite live region. Masked entry
  edits at the caret (insert/backspace hop over the mask separators).
- **Public `--ds-*` customization token sweep across ~44 components.** Components/sub-components that
  previously had no public token API (or only a shallow one) now expose per-instance/theme knobs —
  spinner, skeleton, progress, divider, accordion, page-footer, tooltip, w3w, drawer, popover, menu
  (+ item + divider), checkbox, radio, switch, slider, segmented, toggle-button, stepper, select,
  autocomplete, multi-select, date-picker, time-picker, otp-input, number-stepper, bottom-sheet, list,
  loading-overlay, split-button, tree, avatar-group, description-list, dropzone, modal, page-header,
  tabs, tag, timeline, toast, topbar, avatar, color-picker, icon-button, input, empty-state — bringing
  drawer / popover / tooltip up to the same depth as modal / card. Roughly 160–180 new names,
  predominantly color (surface/background, border, text/label, icon, accent, plus hover/selected/focus/
  active states) with secondary sizing (height, width, max-width/height, radius, padding, shadow,
  font-size). Each is a `--_x: var(--ds-x, <role-token>)` resolver whose default equals the existing
  role token, so it is purely additive — zero visual change for consumers who set nothing.

### Changed

- **`ds-search` inner input class renamed `.input` → `.search-input`.** The over-generic name let
  consumer global `.input` styles/resets leak into the component through emulated encapsulation
  (root cause of the PIN-475 double-focus-ring). Only consumer styling that targeted the
  undocumented internal class is affected.
- **`ds-date-picker` trigger is now a text input by default.** Manual masked entry is on
  (`allowInput` defaults to `true`), so the trigger renders as an editable field with a trailing
  calendar icon (single and range) instead of a plain button. Pass `[allowInput]="false"` for a
  read-only field that opens the calendar on click but rejects typing. The field also sizes to its
  content width now (was full-width) — set a width on the host to stretch it. The selected-date
  display is locale-pinned (was the ambient `toLocaleDateString()`), and month/weekday names are
  localized together via the new `locale`.
- **`ds-search` fills its container by default.** Default `max-width` changed from `320px` to `none` —
  `ds-search` now stretches to `width: 100%` like the rest of the field family (input / select /
  textarea) instead of being capped at 320px. New public `--ds-search-maxw` override token (default
  `none`) to opt back into a fixed cap, e.g. `ds-search { --ds-search-maxw: 320px }`.
- **Rounded press feedback + native tap-highlight suppression.** Interactive controls now show a
  rounded `:active` press state (`filter: brightness(0.9)` + `transform: scale(0.97)`) that follows
  each control's own border-radius/shape rather than a square box-shadow/background overlay — applied
  across interactive controls (accordion-item, calendar-day, checkbox, color-picker, list-item,
  menu-item, multi-select, pagination, radio, segmented, select, sidenav-item, switch, tabs,
  toggle-button, tree, autocomplete), skipped on disabled controls. New per-component tuning tokens
  `--ds-press-brightness` (default 0.9) and `--ds-press-scale` (default 0.97). The native Android-Chrome
  rectangular tap-highlight overlay (which ignored border-radius and protruded square corners past
  pill/rounded shapes) is now suppressed globally, the rounded press state replacing it.
  Visual/interaction refinement only — no Angular API change.

### Fixed

- **Accessibility hardening across overlays, pickers, fields and cards.** `ds-bottom-sheet` now
  carries full dialog semantics (`role="dialog"` + `aria-modal`, labelled by its title, focus-trapped
  on open). `ds-select` / `ds-autocomplete` close their panel on Tab (focus then moves on naturally) and
  drop their listbox options out of the tab order (`tabindex="-1"`); `ds-autocomplete`'s "No matches" row
  is announced via `role="status"`. `ds-field-message` renders its error line as a fresh node so
  `role="alert"` reliably re-announces (toggling the role onto an existing node did not). `ds-number-stepper`
  labels its −/+ buttons and gains a new `[ariaLabel]` input to name the field itself; the `ds-avatar-group`
  "+N" overflow chip gets an accessible label; `ds-sidenav-item` exposes its label via `aria-label` only
  when collapsed (icon-only). `ds-card` is keyboard-activatable (Enter / Space, with `role="button"` +
  `tabindex`) when `elevation="interactive"`, and closable `ds-tabs` remove the focused tab on Delete (APG).

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

### Added

- `.t-mono-inline` typography utility — an inline code chip (mono font on a
  subtle surface with padding/radius), completing the mono family alongside
  `.t-mono` (font only) and `.t-mono-block` (block).

### Changed

- Removed the repository link from the npm package: dropped the `repository` field
  from `package.json` and moved the maintainer Development/Releasing docs out of the
  published README into a repo-only `CONTRIBUTING.md`. The README License entry is
  now plain text (no repo link), fixing the npm 404.

## 0.2.1 — 2026-06-16

### Added

- A `homepage` field linking the live docs/showcase, so the npm package page
  points to it.

## 0.2.0 — 2026-06-16

### Breaking

- Renamed the subtle semantic color tokens `--*-subtle` → `--*-subtitle`
  (border, primary, secondary, tertiary, success, warning, error, info). Consumers
  referencing these tokens must rename.

### Changed

- Clarified theme re-skin guidance in the shipped `themes/README`: brand roles
  retint automatically from the `--blue` ramp, but a fully calibrated brand may
  set the `--primary-*` roles directly to hand-picked hex.
- Relicensed from proprietary (UNLICENSED) to MIT.

## 0.1.0 — 2026-06-12

Initial public release.

### Added

- 45+ standalone Angular components: buttons, forms, overlays, navigation, data display
- Three-tier token architecture: palette → semantic theme → geometry/typography/motion tokens
- Default theme and palette, swappable by consumers
- Bundled Mulish and JetBrains Mono fonts
- SCSS sources shipped in the package (`styles/`, `themes/`)
