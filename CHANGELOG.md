## Unreleased

### Changed

- **A loading `ds-button` with an `icon` keeps its label and spins in the icon's place.** The
  spinner takes the leading icon's box and the label stays visible; a button without an icon still
  hides its contents behind one centred spinner. The new `loadingMode` input (`ButtonLoadingMode`:
  `'auto' | 'icon' | 'replace'`, default `'auto'`) picks the behaviour: `'icon'` also uses the
  trailing icon when there is no leading one, and `'replace'` keeps the centred spinner on every
  button. Neither mode changes the button's size or moves its label. To keep the centred spinner on
  a button with an icon, bind `loadingMode="replace"`.
- **A `ds-time-picker` column that does not loop scrolls at the browser's wheel speed.** Every
  column turned one wheel notch into about one row; a column that loops still does, so it reads
  as a drum, while one with `loop="never"` now scrolls as far
  as any list, still snapping to a cell. Measured on a 34px row, a 100px notch moves it about
  three rows instead of one. Nothing to change in your code.
- **Now in a single `ds-time-picker` picks the current time and closes the panel.** It used to set
  the time and leave the panel open. A range panel stays open until Done, as before.

### Added

- **`ds-icon-button` takes an `ariaHasPopup` input.** It sets `aria-haspopup` on the inner
  `<button>` and accepts the same values as `ds-button`: `'true'`, `'menu'`, `'listbox'`, `'tree'`,
  `'grid'`, `'dialog'` or `null`. Bind it on an icon button that opens a menu or another overlay.

### Fixed

- **The first and last `ds-menu-item` round their corners with the menu.** The rows are square and
  the menu clips them at its rounded edge, so the focus ring of the first or last item was cut off
  at two corners and kept square ones at the other two. Those rows now take the menu's inner radius
  and the ring is drawn inside the row. `--ds-menu-item-radius` still sets every row's radius.
  Nothing to change in your code.
- **`ds-menu` rows touch each other, so the pointer never falls between them.** The menu put a 2px
  gap between rows, and a pointer resting in it hovered no row, so the hover fill flickered off
  while moving down the list. `--ds-menu-gap` now defaults to `0px`, which makes the menu 2px
  shorter per row boundary. A custom `--ds-menu-gap` brings the gap and its dead strip back.
- **A looping `ds-time-picker` column marks the selected value once.** A column with fewer values
  than fit in it, such as minutes at a 15-minute step, repeats its set so it can scroll round, and
  every repeat of the selected value was filled. While scrolling, two filled cells four rows apart
  were on screen at once. Only the one nearest the column's centre is filled now. Nothing to change
  in your code.
- **A `ds-time-picker` field keeps its width when it is empty.** The trigger was as wide as its
  text, so the `--:--` placeholder made it 10px narrower than a picked time and the field jumped
  when a time was set or cleared; in 12-hour format AM and PM differed by about 1px too. The
  trigger now reserves the width of its widest time. Nothing to change in your code.
- **`ds-chart` and `ds-column-chart` size the value-axis gutter for the web font.** The tick labels
  were measured once, when they first rendered, so on a page whose web font arrived after the chart
  the gutter kept the width of the fallback face, and a label wider in the real face could be
  clipped. The labels are measured again once the page's fonts have loaded. Nothing to change in
  your code.
- **Column resize separators expose `aria-valuenow`, `aria-valuemin` and `aria-valuemax` before they
  are focused.** A `ds-table` with `dsTableResize` set the range on a separator only while it held
  focus, so a screen reader reading the page met separators with no value. Nothing to change in your
  code.
- **The `ds-date-picker` input announces as a combobox.** The input already declared a dialog popup
  and an expanded state, which a plain text box does not support; it now carries `role="combobox"`.
  Typing a date works as before. Nothing to change in your code.

## 1.0.1 — 2026-10-22

### Changed

- **Validation errors show once a field is touched; `[dsSubmitted]` and `DS_SUBMITTED` are
  removed.** A field bound to a form model reveals its validation errors once it is touched, and
  the unparseable-date error of `ds-date-picker` shows on blur. `[touched]` is an input of every DS
  field. Remove any `[dsSubmitted]` binding, `SubmittedDirective` import and `DS_SUBMITTED`
  provider.

### Fixed

- **A 12-hour `ds-time-picker` no longer closes before AM/PM is chosen.** Picking the hour and then
  the minute closed the panel before the AM/PM column was reached, and the time kept the previous
  AM or PM: from 8:45 PM, picking 9 and 00 gave 9:00 PM. In `'single'` mode on a 12-hour clock the
  panel now stays open until the hour, the minute and AM/PM have each been picked since it opened,
  in any order; the 24-hour clock still closes on the hour and the minute. Nothing to change in
  your code.

## 1.0.0 — 2026-10-21

### Added

- **`dsTooltipAncestor`: a focusable card opens the clipped values inside it.** Put the attribute
  on a focusable element that is not a control (a card, a tile with `tabindex="0"`): keyboard focus
  on it opens the tip of its first clipped `dsTooltipWhenClipped` value, and that value takes no tab
  stop of its own. Without the attribute such an element opens nothing, as before.

### Changed

- **`ds-time-picker` scrolls to a picked value and selects by scrolling.** A click or an arrow key
  scrolls the column smoothly to centre the cell (instantly on open, and under
  `prefers-reduced-motion`). One wheel notch moves a column by about one row, and cells snap to the
  centre after wheel or touch scrolling. While a wheel, touch or scrollbar scroll runs, the centred
  enabled cell becomes the value as it passes the centre and the time picker emits `valueChange`
  each time; the panel stays open. In single mode it closes once both the hour and the
  minute have been picked by click or key (a scroll pick counts toward neither), or on Escape, an
  outside click, or a page scroll. Handle `valueChange` as a value that can change several times
  while the panel is open.

### Fixed

- **`dsTooltipWhenClipped` no longer trips Firefox's "ResizeObserver loop completed with undelivered
  notifications".** The `tabindex` a clipped host takes or loses after a resize is written in the
  next animation frame instead of inside the observer callback. Firefox raised the error for hosts
  under `content-visibility: auto`, and it reached every `error` listener on `window`.

- **`focusBoundControl()` from `@angular/forms/signals` focuses a DS field.** On every DS form
  control, and on `ds-search`, calling `focus()` on the host element now focuses the control's own
  input or trigger; before, signal forms focused the host itself and focus stayed where it was.

## 0.15.3 — 2026-10-20

### Added

- **`ds-table` takes `printHeading` and `printHeadingNote`.** In print the table opens its header
  with a row holding the heading and the line under it, repeated with the header on every page, so
  the heading of a table never ends a page without its rows. Both are hidden on screen; leave them
  unset to print as before.

- **`ds-table` takes `printAllRows`.** A table paged on the client prints every row instead of the
  page on screen, and leaves the pager out of the printout. A table paged by the server (`total`)
  holds only its page and prints that page with its range label. The default, `false`, prints the
  page on screen.

- **Every chart takes `highlightActive`, and `DsConfig.chart.highlightActive` sets it app-wide.**
  `false` keeps the hovered or focused column, bar or heatmap cell at its own colour; unset falls
  back to the config, then `true`, which brightens it. An input on the element wins over the
  config. The input is declared on the internal `DsChartBase`, the base every chart
  extends.

- **`ds-time-picker` takes `loop`, and `DsConfig.timePicker.loop` sets it app-wide.** `'auto'`, the
  default, runs a column on past either end when it holds more values than it shows; `'always'` runs
  every hour and minute column; `'never'` keeps them as lists. An input on the element wins over the
  config. `TimePickerLoop` types the value.

- **`ds-empty-state` takes `titleOverflow`.** `'wrap'`, the default, breaks a long title over
  lines; `'clip'` keeps it on one line, ends it with an ellipsis and shows the full title in a
  tooltip on hover and keyboard focus. `EmptyStateTitleOverflow` types the value.

- **`dsTooltip` takes `dsTooltipConfig`, and `DsConfig.tooltip` sets its options app-wide.**
  `[dsTooltipConfig]="{ placement, delay, arrow, pinOnClick, whenClipped }"` sets one tip;
  `provideDsConfig({ tooltip: { placement, delay, arrow, pinOnClick } })` sets every tip. An unset
  field falls back to the config, then to `'top'`, 120 ms, an arrow and no pin. `whenClipped` reads
  as `dsTooltipWhenClipped`, which wins when set. `DsTooltipConfig` types the object and
  `TooltipPlacement` its `placement`.

### Changed

- **`ds-table` lays columns out as 0.15.0 did by default: `layout` and `DsConfig.table.layout`
  default to `'auto'`, where they defaulted to `'fixed'`.** Each column follows its cell content,
  `kind` has no effect, and a numeric `width`, `width: 'content'`, `minWidth` and `truncate` size
  the column as on 0.15.0. The widths change for an app coming from 0.15.1 or 0.15.2 that sets no
  `layout`; an app coming from 0.15.0 or earlier keeps the widths it had. `'auto'` stays deprecated
  and will be removed, in a release not yet set, leaving `'fixed'` as the one layout: a binding or
  config key that sets `'auto'` changes nothing now, and a development build warns once per page
  while one does. To keep the 0.15.1 widths: `provideDsConfig({ table: { layout: 'fixed' } })`, or
  `layout="fixed"` on one table. A table with `virtualScroll` keeps `table-layout: fixed` either
  way.

- **A `dsTooltipWhenClipped` tip (`TooltipDirective`) also opens on text cut by lines.** A block
  under `line-clamp`, or any host whose text overflows its height under `overflow: hidden` or
  `clip`, counts as clipped, as text cut by width did. A scroll box does not: its text can be
  reached.

- **The agent catalogue ships at `agent/INDEX.md`, where it was `docs/agent/INDEX.md`.** Every leaf
  keeps its path under `agent/`. An agent rule or prompt that reads the catalogue from the installed
  package points at `agent/` instead.

- **The focus ring no longer rounds an element the library does not render.** `styles/ds` still
  rings any focusable element that styles nothing itself, in the same colour, width and offset, but
  no longer gives it `--focus-ring-radius`: the ring follows the element's own `border-radius`, so a
  square tab, stripe or row stays square while focused. A library component keeps its rounded ring.

- **`--ds-dropdown-panel-min-width` floors the whole `ds-select`, `ds-multi-select` or
  `ds-autocomplete` pane, in both `width` modes.** The default stays `0`, so a panel is as wide as
  its trigger; a consumer whose options outgrow a narrow trigger sets its own floor:
  `ds-multi-select.owner-filter { --ds-dropdown-panel-min-width: 220px; }`. The floor is the
  overlay's own width, so a widened panel opened beside the right edge of the viewport is placed
  to stay on screen.
  `--ds-dropdown-panel-max-width` now applies only under `width="content"`: under the default
  `width="fill"` the panel follows the trigger and the token no longer caps it.

- **A printed `ds-pagination` shows only its range label.** Its page buttons, ellipsis and
  page-size select are left out of the printout, inside a `ds-table` and on their own.

- **A pinned column, bar or heatmap cell no longer stays brightened.** The highlight follows the
  pointer and keyboard focus only: once a click holds a mark or a category and the pointer moves
  off it, it keeps its pin at its own colour, and the mark under the pointer brightens instead.

- **Under the category cursor, the column at the hovered category brightens.** A `dsColumnSeries` in
  a `ds-chart` whose `cursor` is `'category'`, or resolves to it under `'auto'`, brightens the column
  at the category under the pointer, as a hovered column does under `cursor="none"`. `'auto'`, the
  default, resolves to `'category'` when two or more series show a tooltip or a series reads the
  category, and to `'none'` otherwise, where only the hovered column brightens.

- **The `ds-time-picker` hour and minute columns run on past either end.** In `ds-time-columns`,
  after the last hour or minute the first comes round again, the selected value is scrolled to the
  middle of its column, and a running column shows no scrollbar and fades at its edges. Under the
  default `loop`, a column that shows all its values, such as `minuteStep` 15, and the AM/PM column
  stay as lists.

- **A `ds-empty-state` title is as wide as its body, 360px, and breaks a long word.** It wraps at
  `--ds-empty-state-title-max-width`, which defaults to `--empty-body-maxw` like the body, and a word
  longer than the line, such as a pasted search term, breaks instead of running past the card. Set
  `--ds-empty-state-title-max-width: none` on a `ds-empty-state` to keep its title the full width.

### Deprecated

- **`dsTooltipPlacement`, `dsTooltipDelay`, `dsTooltipArrow` and `dsTooltipPinOnClick`.** Each still
  works and wins over `dsTooltipConfig` and `DsConfig.tooltip` while set. Move the value into
  `[dsTooltipConfig]` on the same element, or into `provideDsConfig({ tooltip })` where every tip of
  the app takes it. On a `dsDefinitionTerm`, `dsTooltipPlacement` stays the way to place the tip.
  Unset, each input now reads back `null` rather than its default, so code that
  reads `TooltipDirective.dsTooltipPlacement()` and the other three gets `null` where it got
  `'top'`, `120`, `true` or `false`.

### Fixed

- **A `ds-table` under `layout="fixed"`, or with `virtualScroll`, no longer grows to 1 000 000px in
  a container sized to its content.** In a `max-content` grid track or a box at
  `width: max-content` the table took the engine's maximum width, and in an inline-block or an
  absolutely positioned box without a width it took all the width there was. It is now as
  wide as its columns at their declared widths and header labels. In a container with a width of
  its own, nothing changes.

- **A printed `ds-table` keeps its column names on every page.** The header row repeated on a
  page after the first printed without its labels; it prints them now. A row no longer splits
  across a page break, and the printout leaves out the table's own controls: the pager buttons
  and page-size select, the column filter, resize and expand buttons, and the controls the table
  adds to its toolbar. The range label of the pager still prints, and content projected into the
  toolbar stays.

- **Showing and hiding a tooltip, a chart tooltip, a modal, a confirm, a toast, a spinner, a skeleton
  or a loading overlay no longer inserts and removes its stylesheet each time.** The first instance
  keeps the sheet for the life of the app, so Firefox no longer restyles the whole page on every
  show and hide (10 to 21 ms per show on a page of 11 000 elements, measured 2026-10-17).

- **A long group name no longer scrolls the `ds-multi-select` list sideways.** The per-group select-all
  row of `selectAll="group"` and `selectAll="both"` cuts its label to the panel width with an
  ellipsis, as the top select-all row does.

- **Destroying the last instance of a component no longer relayouts the whole page in Chromium.**
  The base rules every component carries, and `styles/component-base` gives a component of yours,
  sit in `:where()` at zero specificity instead of in `@layer ds-component-base`: Chromium relayouts
  every element when a stylesheet holding a cascade layer is removed, as Angular removes a
  component's stylesheet with its last instance, a tooltip on every hide. A rule of yours above zero
  specificity still wins over the base. One at zero specificity, such as `*` or
  `:where(:focus-visible)`, now ties with it inside a component and the component's stylesheet,
  inserted later, wins. Raise such a rule's specificity to keep it. The base no longer sets
  `box-sizing` on `::before` and `::after`, so your rule for them applies inside components too;
  the button spinner and the popover and tooltip arrows set `border-box` themselves, and the tooltip
  arrow now has it without `styles/reset` as well.

## 0.15.2 — 2026-10-14

### Added

- **`ds-table` takes `layout`, and `DsConfig.table.layout` sets it for every table.** `'fixed'`, the
  default, is the layout 0.15.1 introduced. `'auto'` lays a table out as 0.15.0 did: each column
  follows its cell content, `kind` has no effect, and a numeric `width`, `width: 'content'`,
  `minWidth` and `truncate` size the column as they did on 0.15.0. A `layout` on the element wins
  over the config. To keep the 0.15.0 look across an app until its tables are reviewed:
  `provideDsConfig({ table: { layout: 'auto' } })`. A table with `virtualScroll` keeps
  `table-layout: fixed` either way.

### Changed

- **`--text-link` and `--text-link-visited` are theme roles; `.link` and the `ds-table` cell link
  read them.** `--text-link` is `var(--blue-700)` in light and `hsl(var(--blue-h) 90% 74%)` in
  dark; `--text-link-visited` is `hsl(var(--blue-h) calc(var(--blue-s) * 0.6) 45%)` and
  `hsl(var(--blue-h) 50% 70%)`; both stay blue under any brand. `.link` reads
  `var(--ds-link-color, var(--text-link))` and, visited,
  `var(--ds-link-color-visited, var(--text-link-visited))`, at the colours it painted. A `ds-table`
  link cell and a hovered `interactive` cell read
  `var(--ds-table-cell-link-color, var(--text-link))`
  where they read `--accent`: `#1d43ed` where they were `#2e54ff` in light, `#8197f8` where they
  were `#2e54ff` (3.14:1 on the dark surface, now 6.33:1) in dark, and blue under a brand that set
  `--primary`. A brand recolours links by setting `--text-link` and `--text-link-visited` in each
  theme block; `--ds-link-color` and `--ds-link-color-visited` are `.link` hooks, set on `.link` or
  an ancestor. If your theme sets them on `:root` as its link colour, set `--text-link` and
  `--text-link-visited` there instead, and read `var(--text-link)` where you read
  `var(--ds-link-color)` or a palette value such as `var(--blue-700)` for the link colour. The
  visited role 0.15.0 named `--link-visited` is `--text-link-visited`: where you set or read
  `--link-visited`, set or read `--text-link-visited`. Its default reads `--blue-h` and `--blue-s`
  where `--link-visited` read `--primary-h` and `--primary-s`, so it stays blue under a brand that
  sets `--primary-h` or `--primary-s`, as `--text-link` does in dark. To keep a table link in the
  brand colour, set `--ds-table-cell-link-color: var(--accent)` on `ds-table`.

- **`showChange` colours a stretch that starts at zero.** On `dsLineSeries` and `ds-line-chart`,
  the stretch from a reading of 0 thickens in `--ds-chart-positive-color` or
  `--ds-chart-negative-color` like any other, and prints no percentage.

- **The `showChange` stretch and percentage fade in as the chart's other marks do.** They wait
  `--ds-motion-chart-mark-exit-duration` and fade in over `--ds-motion-chart-mark-enter-duration`
  (120ms and 400ms by default), where they appeared at once over 120ms, and leave on
  `--ds-motion-chart-mark-exit-duration` and `--ds-motion-chart-mark-exit-easing`.

### Deprecated

- **`layout: 'auto'` on `ds-table` and in `DsConfig.table.layout`.** It is a temporary way back to
  the 0.15.0 column widths and will be removed. A development build warns once per page while a
  table uses it. Review each table under `'fixed'`, giving a column `width`, `kind` or `minWidth`
  where it needs one, then delete the binding or the config key.

### Fixed

- **A `ds-table` measured while hidden no longer keeps the widths it read there.** A table under a
  `display: none` ancestor, such as an inactive `ds-tabs` panel, measured its header labels when it
  rendered there or its columns, its density or the loaded fonts changed there, and its
  `width: 'content'` columns when it rendered there or its rows, its page or the loaded fonts
  changed there. It read 0 for each and kept those widths when shown: a `width: 'content'` column
  collapsed to 0px and its cells spilled over the next column, a column could shrink below its
  header label, and resizing the window did not bring them back. The table skips both measurements
  while hidden and measures when it is shown.

## 0.15.1 — 2026-10-13

### Breaking

- **`--text-link` and `--link-visited` are removed; `.link` sets its own colour.** Its defaults
  live in `styles/link` and read the palette: `--ds-link-color` defaults to `var(--blue-700)`, and
  to `hsl(var(--blue-h) 90% 74%)` in dark; `--ds-link-color-visited` to
  `hsl(var(--blue-h) calc(var(--blue-s) * 0.6) 45%)`, and to `hsl(var(--blue-h) 50% 70%)` in dark.
  The rendered colours are the same in both themes. A declaration of either removed token sets
  nothing: set `--ds-link-color` or `--ds-link-color-visited` on `.link` or an ancestor instead.
  A read of either resolves to nothing, and so would a read of `--ds-link-color`, which is unset
  until you set it: put the `link` class on the element, or name the palette value.

### Added

- **`TableColumn.kind` sets a `ds-table` column's width from what it holds.** `'id'` and `'date'`
  are 130px, `'number'` 120px and `'status'` 110px, each widened to its header label; `'text'`, the
  default, shares the rest of the table. The type is exported as `TableColumnKind`:
  `{ key: 'premium', label: 'Premium', kind: 'number', align: 'right' }`.

- **`selectRange` sums a dragged range of categories.** On `ds-chart`, `ds-column-chart` and
  `ds-line-chart`, off by default: a press dragged across categories draws a band over them, a pill
  with the sum and mean of every reading in the range, and fades the marks outside it. With a
  category, column or line point focused, Shift+Left and Shift+Right grow or shrink the range from
  its far end. Escape or a press outside the chart clears it; a press released in its own category
  still pins. The pill
  reads the new optional `DsIntl` key `chart.rangeTotal: (range, total, average) => string`; a
  dictionary without it shows the English default `` `${range}: ${total} · avg ${average}` ``.
  `ds-chart` exposes the range as a read-only `selectedRange` signal of the new
  `ChartCategoryRange` (`{ from, to }`), `null` while nothing is selected.

- **`ds-column-chart` takes `legendFilters`, `legendMode` and `hiddenSeries`,** as
  `ds-line-chart` does: the legend hides a series, its columns sink to the baseline and the other
  series settle onto each other. The value axis fits what is left; `[rescaleOnHide]="false"` holds
  it where it stands with every series shown.

- **`dsColumnSeries` takes `hidden` and `runningTotal`; `LineSeriesData` takes `hidden`.** A hidden
  column series sinks to the baseline and a hidden line erases itself back along its own path, and
  draws on again when shown. `ds-chart` takes `rescaleOnHide` (default `true`): a hidden series
  leaves the value axes to the other marks, and with `false` its values still hold them. A custom
  mark passes the new optional `hidden` argument of `ChartScales.reportDomain` to take part.
  `runningTotal` reads the columns as a waterfall's: hovering one stops the axis guide at it, and
  under `dimOthers` fades every column after it.

- **`showChange` on `dsLineSeries` and `ds-line-chart`, off by default.** On the hovered reading,
  the stretches from the reading before it and to the reading after it thicken, each in
  `--ds-chart-positive-color` or `--ds-chart-negative-color` by its own change, and each prints its
  change in percent. With several series it follows the one singled out by hover, focus or the
  legend.

- **A scatter's points enter left to right.** `ds-scatter-chart` takes `staggerMs` (default 40),
  as the column charts do: each point waits by its place across the plot, the whole entrance stays
  within 260ms, and `0` turns it off.

- **Dragging a `ds-table` column edge draws that edge down the whole table.** Under
  `dsTableResize`, a line in `--ds-table-sort-active-icon-color` runs from the header to the last
  row at the edge being dragged, so the width it sets reads against every row. It shows only while
  the drag lasts. `DsTableResize` gained the private `guide` and `placeGuide`; a subclass declaring
  either must rename it.

- **`showDirty` marks a changed field, off by default.** On `ds-input`, `ds-textarea`, `ds-select`,
  `ds-multi-select`, `ds-autocomplete`, `ds-date-picker`, `ds-time-picker`, `ds-color-picker`,
  `ds-checkbox`, `ds-switch`, `ds-radio-group`, `ds-segmented`, `ds-slider` and `ds-otp-input`, a
  value the user changed carries a dot at the end of the control and a "Changed" line under it,
  which the control's `aria-describedby` reads. Turn it on per field with `[showDirty]`, per form
  with the new `dsShowDirty` directive (`ShowDirtyDirective`), or app-wide with `provideDsConfig({
  field: { showDirty: true } })`; a field's own binding wins. The state comes from the new `dirty`
  input, which signal forms binds by name, or from the `NgControl` of a reactive or template-driven
  form, so resetting the form clears the mark. The line reads the new optional `DsIntl` key
  `field.changed`, default `'Changed'`; `--ds-field-changed-color` recolours the dot and
  `--ds-field-changed-text-color` the line. The `pending`, `dirty`, `showDirty` and
  `showDirtyResolved` members sit on the internal `DsFormControlBase` both value-accessor bases
  extend; the internal `ds-field-message` takes `changed` (with `changedText` and `intl`), and the
  new internal `ds-field-status` draws the spinner and the dot.

- **`ds-info-hint` shows rich content and any icon.** Put the markup inside the tag, or pass a
  template to the new `content` input (`TemplateRef<unknown> | null`); `text` is now optional.
  One source shows: `content`, then projected content, then `text`. In dev mode a hint given more
  than one, or none, logs a warning naming what it shows. The panel stays `role="tooltip"` and
  describes the button while open, so keep the content non-interactive. Projected content is
  created with the hint, a `content` template only when the panel opens. `icon` takes any
  `IconName` (default still `'help'`), and `--ds-info-hint-color` (default `var(--icon-default)`)
  colours it at rest and on hover. `dsTooltip`, the `dsDefinitionTerm` that feeds it and
  `TooltipPanelComponent.text` take a `TemplateRef<unknown>` as well as a string, rendered as
  given. `InfoHintComponent`, `TooltipDirective` and `TooltipPanelComponent` gained members, named
  in the migration manifest, as is the one `TooltipDirective` lost; a subclass declaring one of
  those names must rename it.

- **`.link` takes a token per state.** `--ds-link-color-visited` (default
  `hsl(var(--blue-h) calc(var(--blue-s) * 0.6) 45%)`, `hsl(var(--blue-h) 50% 70%)` in dark) with `--ds-link-color-visited-hover` and `--ds-link-color-visited-active`, which derive from it
  as `--ds-link-color-hover` and `--ds-link-color-active` derive from `--ds-link-color`;
  `--ds-link-color-disabled` (default `var(--text-disabled)`); `--ds-link-focus-ring-color`
  (default `var(--focus-ring-color)`); and `--ds-link-underline-color` (default `currentcolor`),
  `--ds-link-underline-thickness` (`1px`) and `--ds-link-underline-offset` (`2px`).

### Changed

- **A `ds-table` column takes its width from its configuration, never from its rows.** The table
  lays out with `table-layout: fixed`: a numeric `width` is exact, `kind` sizes an id, date,
  number or status column, and the `'text'` columns share the rest equally, none narrower than its
  header label or its `minWidth`. Changing `data`, paging the footer pager or loading a server page
  moves no column. When the columns do not fit at those widths the table scrolls sideways, and a
  `truncate` text column without `width` or `minWidth` is then 240px of text (272px with the
  default cell padding, 264px compact) even when its values are shorter. A long value wraps, or
  ellipsizes in a `truncate` column, where the column used to grow to it, and a column of short
  values keeps its share. Give an id, date, number or status column its `kind`; `width: 'content'`
  sizes a column to its rendered cells and is the one width that follows the rows.
  `TableComponent` lost the protected `clipGrows`, `clipMaxWidth`, `clipMinWidth` and
  `columnWidth` and the private `growingClipColumns`, `clipCapsSet`, `clipFit`, `clipFitWidth`,
  `textCanvas`, `measureGrowingClips`, `widestValue` and `splitGrowingClips`, and gained the
  protected `columnWidths` and the private `headerMetrics`, `wrapWidth`, `contentWidths`,
  `fontsLoaded`, `measureAtMaxContent`, `measureHeader` and `measureContentColumns`, so a subclass
  declaring one of those names must rename it.

- **A visited `.link` takes its own colour.** It painted in the link colour; it now paints in
  `--ds-link-color-visited`, a desaturated blue, and darkens from it on hover and press.
  `.link.quiet` and a disabled link keep their own colour. The underline follows the text colour in
  every state, a focused link's included. To keep visited links in the link colour, set
  `--ds-link-color-visited` to the value you give `--ds-link-color`, or to
  `var(--ds-link-color, var(--blue-700))`, and to `var(--ds-link-color, hsl(var(--blue-h) 90% 74%))`
  under `:root[data-theme='dark'] .link`.

- **Every brand shade follows `--primary`; links stay blue.** In light, `--surface-tint` and
  `--primary-subtitle` are `hsl(from var(--primary) h 100% 97%)`, `--primary-muted`
  `h 95% 94%`, `--primary-muted-strong` `h 95% 89%`, and `--primary-strong`
  `hsl(from var(--primary) h calc(s * 0.85) calc(l - 7))`, where they were the `--blue-50`,
  `--blue-100`, `--blue-200` and `--blue-700` steps. In dark, `--surface-tint`,
  `--primary-subtitle`, `--primary-muted`, `--primary-muted-strong` and `--primary-strong` take
  their hue from `--primary` where they took `--primary-h`, at the same saturation and lightness.
  The default blue renders the same RGB. A brand that sets only `--primary` gets active rows,
  selected options, tonal fills and the text on them in its own hue; one that sets them itself
  keeps its values. Links are not a brand shade: `.link` defaults to the `--blue-*` palette in
  both themes, so a link stays blue under any brand, where the dark link and visited link took the
  `--primary-h/s/l` channels; set `--ds-link-color` to change it. A light brand colour (yellow, lime, cyan)
  derives a `--primary-strong` under 4.5:1 on white: the theming page lists the five with what
  each paints and the contrast it must meet. The focus ring and the field halo still read
  `--primary-h/s/l`. Restore with `--primary-strong: var(--blue-700); --surface-tint: var(--blue-50); --primary-subtitle:
  var(--blue-50); --primary-muted: var(--blue-100); --primary-muted-strong: var(--blue-200);` in
  light, and `hsl(var(--primary-h) …)` at the same saturation and lightness in dark.

- **`ds-line-chart` re-scales the value axis when a series is hidden.** `rescaleOnHide` defaults to
  `true`, as on `ds-column-chart` and `ds-chart`: the axis fits the series left showing. Set
  `[rescaleOnHide]="false"` to hold it where it stands with every series shown; a bare
  `rescaleOnHide` restates the default.

- **The value axis answers the hovered reading.** In `ds-chart`, `ds-column-chart`,
  `ds-line-chart` and `ds-waterfall-chart` the hovered category's label turns bold, a dashed guide
  runs from the value axis at the reading, and a pill on the axis prints the axis value there; the
  guide and the pill glide between readings on `--ds-motion-chart-tooltip-move-duration` and
  `-easing`. In `ds-waterfall-chart` the guide stops at the hovered step, reads its running total,
  and under `dimOthers` the steps after it fade. The new `showAxisReadout` input on all four, on by
  default, turns the label, the guide and the pill off. The pill prints through `valueFormat` at
  `'tooltip'`, in full. A formatter that sets `handlesReadout: true` is asked for the new
  `ChartFormatLocation` `'readout'` there instead, and can return the tick's short form. A
  formatter typed for `'tick' | 'tooltip'` alone is a valid `ChartValueFormat` and keeps a full
  number in the pill; code that maps or switches over every `ChartFormatLocation` needs a
  `'readout'` case. `WaterfallChartComponent` gained `showAxisReadout`; a subclass declaring it
  must rename it.

- **One chart motion timing per kind of movement.** Whatever follows the pointer glides on
  `--ds-motion-chart-tooltip-move-duration` and `-easing`: the `ds-scatter-chart` nearest-point
  ring and the `selectRange` band join the band, the panel and the axis readout there, where they
  moved on the `state` timing. Series dimming runs on `--ds-motion-chart-state-duration` everywhere:
  `dsColumnSeries` groups and scatter point groups fade on it, as lines do, and fade back in on it
  too, where they dimmed on the `mark` timing and came back at once.

- **A pinned category keeps its line in a chart with lines.** In a `ds-chart` holding a
  `dsLineSeries` (`ds-line-chart`, a combo), the pinned category draws the cursor line in
  `--ds-chart-cursor-line-color`, without the band fill, under the pin, and glides to the next
  pinned category on `--ds-motion-chart-tooltip-move-duration`; the hover band and line still
  follow the pointer. A column-only chart keeps the pin alone.

- **A highlighted line point rides the line.** Under the category cursor, each series' highlighted
  point travels along its own line to the next category, with the panel and the crosshair, instead
  of jumping there.

- **Keyboard focus glides.** The focus ring of a `ds-chart` category and of a `dsColumnSeries`
  column moves to the next one with the panel. Under forced colours each keeps its own ring.

- **A column keeps its place by key.** A `dsColumnSeries` column with the same `id` glides to its
  new slot when the data is reordered; without an `id` a column is keyed by its label.

- **Hovering a pie, heatmap or scatter names the mark.** A hovered, focused or held `ds-pie-chart`
  slice fades the centre to its share (its value under `partOfWhole: false`) over its name, and the
  total comes back when the pointer leaves. Once the pointer has rested on a `ds-heatmap-chart` cell
  for `--ds-motion-chart-scale-marker-delay` (120ms), a marker over the colour scale prints its
  reading and glides to its place on the ramp; a fast sweep across the grid leaves it still. The
  scale sits 12px lower to hold it. A `ds-scatter-chart` answers with the point nearest the pointer
  anywhere over the plot, where it answered only within 16px of a point: a ring glides to that point
  and a dashed line runs to it from the pointer. Under `prefers-reduced-motion` the centre, the
  marker and the ring change at once. Each is on by default and has its own off switch:
  `showHoverCenter` on `ds-pie-chart` keeps `centerValue` and `centerLabel` in the centre,
  `showScaleMarker` on `ds-heatmap-chart` drops the marker, and `showNearestPoint` on
  `ds-scatter-chart` answers only within 16px of a point, without the ring and line. `nearestRadius`
  on `ds-scatter-chart` caps how far, in CSS pixels, the nearest point answers from; unset, any
  distance.

- **Heatmap cells enter along the diagonals.** `staggerMs` on `ds-heatmap-chart` spaces the
  diagonals from the top-left cell, where it spaced the columns; the spread stays within 260ms.

- **Every mark of a chart moves together when its data changes.** In `ds-chart`, `ds-column-chart`,
  `ds-line-chart` and `ds-waterfall-chart` the line, its markers and area, the value labels, the
  pin, the gridlines with their tick labels and the waterfall connectors glide to their new place on
  the column's own timing (`--ds-motion-chart-mark-duration` and `-easing`). When a category comes
  or goes, the columns, the category labels and the points glide sideways to their new places on the
  same timing and the line and its area morph to the new point count with the points on them: a new
  point leaves its neighbour, a removed one slides into its neighbour as it fades; a new column
  grows and a removed column or label fades. An area filled between two lines (`lower`) changes at
  once. A resize redraws every mark in place at once. The category band and crosshair glide with the
  tooltip panel, on `--ds-motion-chart-tooltip-move-duration` and `-easing`, which `ds-chart` now
  reads. A `ds-pie-chart` turns its slices to their new angles. A removed heatmap row or cell,
  scatter point, pie slice, waterfall connector or waterfall value label fades out. Under
  `prefers-reduced-motion` every one of them lands at once.

- **A loading skeleton turns into the chart.** On the first load, when the data lands, every chart's
  skeleton becomes the chart in one motion: each placeholder travels to the place and size of the
  mark in its place and fades from the skeleton fill to the mark's colour, a mark without one grows
  from the baseline, a spare placeholder sinks and fades, and the tick and category placeholders
  fade into the labels. The line band settles onto the line, the pie ring turns its slices to their
  angles while the legend swatches take their colours, funnel stages and bar tracks take their
  widths, and heatmap cells take their colours; scatter points enter as before. A reload with data
  on screen keeps the plot under `ds-loading-overlay`. It runs on
  `--ds-motion-chart-mark-grow-duration` and `-easing`; under `prefers-reduced-motion` the chart
  replaces the skeleton at once.

- **The hovered mark answers.** A hovered or focused column, bar, waterfall step and heatmap cell
  brightens (`filter: brightness(1.12) saturate(1.1)`), and a hovered pie slice slides 3 units of
  the 100-unit ring out along its middle, past the ring's box. A pin pops in, and pinning another
  mark or category pops a new pin there. The category band and a pin appear in place and glide only
  to a later position. `ChartComponent`, `ColumnSeriesComponent`, `LineSeriesComponent`,
  `ColumnChartComponent`, `LineChartComponent`, `PieChartComponent`, `HeatmapChartComponent` and
  `ScatterChartComponent` gained members, named in the migration manifest, as are the members
  `FunnelChartComponent`, `PieChartComponent`, `HeatmapChartComponent`, `ScatterChartComponent` and
  `LineSeriesComponent` lost; a subclass declaring one of those names must rename it, and one
  overriding a lost member overrides nothing. The internal `WaterfallMarksComponent` gained
  `leaveMark`; the internal `ChartStatesComponent` gained `morphGrowth`, `morphing` and
  `ngOnChanges`; the internal `ChartLegendComponent` gained `highlight` and lost `dwell`,
  `onItemEnter` and `onItemLeave`. The internal `pointScale` with its `PointScale` type, `tickStep`
  and `polylinePoints` are removed.

- **An app that never set a locale formats in British English.** Angular's default `LOCALE_ID`,
  `'en-US'`, now reads as `'en-GB'` everywhere the library formats: English names, Monday-first
  weeks, a 24-hour clock and `DD/MM/YYYY` typed dates in `ds-date-picker`, where the picker used
  `MM/DD/YYYY`. Numbers do not change. Any other `LOCALE_ID`, and `DsConfig.locale`, are used as
  given; `ds-sparkline` now reads `DsConfig.locale` too. For US formats:
  `provideDsConfig({ locale: 'en-US' })`.

- **The calendar week and the clock follow the locale.** Unset, `ds-date-picker` starts its week
  on the first day of its locale (`locale`, `datePicker.locale`, the config `locale`, then
  `LOCALE_ID`) and `ds-time-picker` shows the clock of the config `locale`, then `LOCALE_ID`: en-GB
  (also an app with no locale), de-DE and ru-RU keep Monday and 24 hours; a `DsConfig.locale` of
  en-US gets Sunday-first weeks and 12-hour times. A browser with no week data keeps Monday.
  `firstDayOfWeek`, `datePicker.firstDayOfWeek`, `format` and `timePicker.format` still win;
  `provideDsConfig({ datePicker: { firstDayOfWeek: 1 }, timePicker: { format: '24h' } })` keeps
  Monday and 24 hours under any locale.

- **A pressed tonal `ds-button` deepens toward its own colour.** The pressed fill is the rest fill
  mixed 28% toward the button's colour (`--primary` for primary), where it was the hover fill
  mixed 10% toward black and turned greyer than the hover. `--ds-button-bg-color-active` still
  sets a pressed fill of your own.

- **A pressed `ds-menu-item` with `error` goes one red step deeper.** It fills with
  `--error-muted` on press, over the `--error-subtitle` hover, the pair a ghost error `ds-button`
  uses; the press showed the hover fill.

- **A `ds-funnel-chart` stage grows from its centre.** On entrance each stage grows from 96% about
  its own centre, as a `ds-scatter-chart` point does, so the funnel's axis stands still; it grew
  right and down from its top-left corner.

- **Every field shows a spinner while its value is checked.** `ds-input`, `ds-textarea`,
  `ds-select`, `ds-multi-select`, `ds-autocomplete`, `ds-date-picker`, `ds-time-picker`,
  `ds-color-picker`, `ds-checkbox`, `ds-switch`, `ds-radio-group`, `ds-segmented`, `ds-slider` and
  `ds-otp-input` take a `pending` input, which signal forms binds by name, and read `pending` from
  the `NgControl` of a reactive or template-driven form: while an async validator runs, the field
  shows the small spinner `ds-input` shows for `loading`. It sits at the end of the control; on
  `ds-checkbox` and `ds-switch` after the label, on `ds-radio-group` and `ds-segmented` beside the
  label, or after the options without one, on `ds-slider` under the track and on `ds-otp-input`
  after the cells. A `[loading]` on `ds-input` bound to its own control's pending restates it.
  `InputComponent`, `TextareaComponent`, `SelectComponent`, `MultiSelectComponent`,
  `AutocompleteComponent`, `DatePickerComponent`, `TimePickerComponent`, `ColorPickerComponent`,
  `CheckboxComponent`, `SwitchComponent`, `RadioGroupComponent`, `SegmentedComponent`,
  `SliderComponent` and `OtpInputComponent` gained members, named in the migration manifest, as did
  the internal `FieldMessageComponent` and the internal `DsFormControlBase`; a subclass declaring
  one of those names must rename it.

### Fixed

- **A legend fades the other marks only under `dimOthers`, as hovering a mark does.** Hovering or
  focusing a `ds-pie-chart` legend entry, a `ds-funnel-chart` stage-table row, a `ds-scatter-chart`
  legend entry, a `ds-heatmap-chart` scale step, or a series legend entry of `ds-column-chart` and
  `ds-line-chart` faded the rest whatever `dimOthers` said. It fades them only when `dimOthers` is
  set; a scale step brightens its own cells, a column series brightens and a line thickens either
  way, and under `dimOthers` hovering a column fades the other series too. The same holds for
  `highlighted` on `dsColumnSeries` and `dsLineSeries`. Add `dimOthers` to a chart whose legend
  should keep fading the rest.

- **Moving the pointer down a legend keeps the highlight.** The few pixels between two rows of a
  `ds-pie-chart` legend, and between the entries of the series legend under `ds-chart`,
  `ds-column-chart`, `ds-line-chart` and `ds-scatter-chart`, belonged to no entry, so the
  highlight, the slid-out slice and the tooltip dropped and came back at every row. Each entry
  takes the pointer up to the middle of the gap beside it.

- **Only the main mouse button pins a chart.** A right or middle press on a `ds-chart` category, or
  on any chart's mark, takes no pin, and one outside the chart leaves a held pin in place.

- **A fast pointer no longer leaves the panel and the travelling marker behind.** Crossing a
  category every frame restarted their glide at zero each time, so on a long `ds-line-chart` or
  `ds-chart` they stood still until the pointer stopped while the cursor moved on. Each glide now
  starts two frames in; the scatter ring and the pie arcs glide the same way.

- **A chart's hover clears the moment the pointer leaves the chart.** The panel, the cursor and
  the travelling marker used to stay for `tooltipLingerMs` (500ms) wherever the pointer went, so
  moving onto the next chart lit both; they now wait only while the pointer is still inside the
  chart, in a gap between marks or on the legend, and the panel stays while the pointer is on it.
  Every element the pointer crossed outside also restarted that wait, keeping the panel up for as
  long as the pointer moved; the wait now runs once.

- **On a `'step'` line the travelling marker lands on the reading.** It stopped at the foot of the
  riser, at the previous reading's height.

- **Without markers, the panel and the pin sit on the reading.** A `ds-line-chart` or
  `dsLineSeries` with `showMarkers` off anchored both to the top of the category band, above the
  line; they now sit as they do over a visible marker.

- **A stacked column's panel hangs over the whole stack.** In `ds-column-chart` and `ds-chart`
  with stacked `dsColumnSeries`, hovering a segment opens its panel over the stack's top, so the
  segments above it stay in view and reachable.

- **An expanded `ds-table` row folds all the way.** Opening a row's panel started 24px tall and
  closing it stopped at 24px before the row dropped out: the cell padding sat outside the fold. The
  padding now folds with the panel, so the row grows from 0 and shrinks to 0.

- **A loading chart holds the room of its data table.** `ds-bar-chart` drew no table line while
  loading, the other charts drew the line 5px short, and under `dataTable="visible"` every chart
  drew the closed line where the open table lands, so the page jumped when the data arrived. The
  placeholder now matches the table line, and under `'visible'` draws the open table with a header
  and five rows.

- **Chart labels share one halo.** A `ds-line-chart` annotation, a reference-line label and the
  `showChange` percentage draw the same 3px halo in `--ds-chart-bg-color` with rounded joins, and
  under forced colours each prints in `CanvasText` over a `Canvas` halo; an annotation kept its
  own colour on a white patch there, and the percentage's halo had sharp corners.
  `--ds-line-chart-annotation-halo-color` and `-halo-width` still set the annotation's halo.

- **The `dsTableColumns` button reports its panel open.** On a fresh page the «Columns» button kept
  `aria-expanded="false"` while its panel was open, and followed the panel only after the column
  order had changed once. It reads `true` while the panel is open from the first press.

- **Dragging a `dsTableResize` column moves only that column.** The table filled its container, so
  narrowing one column handed the freed width to the others. Once every visible column has a width,
  the table is as wide as its columns and leaves the rest of the container empty. A column still
  stops at its content's narrowest width, and `Home` on a handle returns the column to auto, which
  fills the container again.

- **`dsTableExport` shows its CSV button.** The toolbar above a `ds-table` showed only when its
  `[toolbar]` slot held content, so a table with `dsTableExport` and no slotted content hid the
  built-in Export button. The toolbar shows whenever the slot or a table feature puts a control in
  it.

- **A `ds-button` keeps focus while `loading`.** A button pressed from the keyboard and then set
  `loading` was disabled natively, so focus fell to the page. A loading button takes
  `aria-disabled="true"` beside `aria-busy` and stays focusable; the click is swallowed, so
  `(pressed)` does not fire and a `type="submit"` does not submit. The `dsTableExport` button shows
  the spinner while an `exportFetcher` runs, in place of the greyed "Preparing…" label. A
  `[disabled]` bound to the same flag as `[loading]` still disables natively and drops focus;
  remove it. Where `[disabled]` ORs that flag with other conditions, remove the flag from the
  expression and keep the rest, provided the rest is false while the button loads. Where it ANDs
  that flag with validity (`busy() && invalid()`), put a submit-attempt flag in its place
  (`submitted() && invalid()`); a component without one sets it at the start of its submit
  handler and moves focus to the first invalid field when a submit fails, since the button
  disables while focused.

- **A pressed `ds-pagination` page keeps focus on its own number.** Page buttons were matched by
  position, so when the window of numbers shifted the focused button relabelled itself: with eight
  or more pages, pressing Page 5 from page 4 left focus on a button reading Page 6. Each page keeps
  its own button.

- **Pressing Previous onto the first page, or Next onto the last, keeps focus in `ds-pagination`.**
  The pressed button disabled under focus and focus fell to the page; it moves to the current
  page's button. `PaginationComponent` gained a member, named in the migration manifest.

- **A `ds-pagination` keeps focus while `loading`.** A page button pressed from the keyboard, with
  the host then setting `loading` (a server-paged `ds-table` does), was disabled natively, so focus
  fell to the page. While loading, the page, Previous and Next buttons take `aria-disabled="true"`
  and stay focusable, and a press is ignored. Previous on the first page, Next on the last and
  every button on an empty list still disable natively.

- **Dismissing a `ds-alert`, a `ds-banner` or a toast moves focus to a neighbour.** Focus sat on the
  close or action button and fell to the page when the element left. A dismissed alert or banner
  hands it to the next control after it, or the one before it when nothing follows; a toast hands it
  to the next toast in the region, else the previous one, else back to the element focused before
  focus entered the region. Focus that a `(closed)` handler or a toast action's `handler` moves
  elsewhere stays there. `ToastRegionComponent` gained members, and the `onDismiss` of
  `AlertComponent` and `BannerComponent` takes an argument, named in the migration manifest.

- **Move up and Move down in the `dsTableColumns` panel keep focus on the moved row.** Pressed from
  the keyboard, a move dropped focus to the page when the row was re-inserted or its button
  disabled at the top or bottom. Focus stays on the pressed button of the moved row, or moves
  to its other button once the row reaches an end. The internal `TableColumnsPanelComponent`
  gained `move` and `rescueFocus`.

- **A `ds-menu` opens at its first item.** Reopening a `ds-split-button` menu, or any `ds-menu`
  in a `ds-popover`, focused the item that had focus when it closed. Once focus leaves the menu,
  its first item takes the tab stop again.

- **Tab leaves an open `ds-menu`.** In a `ds-split-button` menu, or a `ds-menu` in a
  `ds-popover`, Tab on an item did nothing; it closes the menu and moves focus on from its
  trigger. In a submenu they close the submenu and the menu holding it. Choosing a submenu item
  closes the submenu and returns focus to its parent item before the overlay closes, where the
  submenu stayed open.

- **A `ds-popover` holding a `ds-menu` moves focus into it.** Without `panelRole`, opening the
  popover left focus on the trigger, so arrow keys and type-ahead never reached the menu; this hit
  the `ds-table` row-actions menu too. A panel holding a `role="menu"` now focuses the menu's first
  item on open, and Escape returns focus to the trigger. It is not trapped: Tab closes it.

- **ArrowRight on a `ds-menu-item` with a `submenu` focuses the submenu's first item.** It opened
  the submenu and left focus on the parent, so the submenu's items were out of reach; Enter and
  Space focus the first item too. ArrowLeft and Escape close it and focus the parent, as before.
  `MenuComponent` and `MenuItemComponent` gained members, named in the migration manifest; a
  subclass declaring one of those names must rename it.

- **A `ds-icon-button` toggle that is off says so.** With `[selected]` bound to `false` it dropped
  `aria-pressed`, so a screen reader heard a plain button; it renders `aria-pressed="false"`, as
  `ds-toggle-button` does. An icon button with no `selected` binding still carries no
  `aria-pressed`. `IconButtonComponent.selected` is `boolean | null`, `null` when unbound; code
  reading it back as a `boolean` handles `null`.

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| `[rescaleOnHide]="true"` or a bare `rescaleOnHide` on `ds-line-chart` | `true` is the default | nothing |
| `[loading]` on a `ds-input` bound to its own control: `.pending()"` or `.pending"` | the field shows the spinner whenever its control is pending | nothing |

## 0.15.0 — 2026-10-09

### Breaking

- **`--ds-waterfall-chart-skeleton-height` is removed.** The waterfall skeleton draws floating
  steps on the chart's own plot height; delete the declaration.

- **`--chart-skeleton-h` is removed.** No component reads it, so a declaration of it sets nothing;
  delete the declaration.

- **`dsTooltipClippedLead` is removed from `TooltipDirective`.** A `ds-table` header with a `hint`
  needs nothing in its place: its `dsDefinitionTerm` button shows its own clipped label in bold
  above the hint. Anywhere else, delete the binding, or write the lead into the string:
  `[dsTooltip]="'**' + lead + '**\n' + tip"`.

- **`dsTooltipTextSelector` is removed; `dsTooltipWhenClipped` takes the selector.** One attribute
  now says both "only while clipped" and "which element to test": `dsTooltipWhenClipped=".label"`
  tests and discloses the element it matches inside the host, and a boolean or the bare attribute
  still tests the host. Replace the pair `dsTooltipWhenClipped dsTooltipTextSelector=".label"` with
  `dsTooltipWhenClipped=".label"`. Where the clip test is bound, bind the selector or `false`:
  `[dsTooltipWhenClipped]="truncate ? ':scope > .cell' : false"`. The input type widens from
  `boolean` to `boolean | string`, and `TooltipDirective` no longer exposes `hostElement` and
  `isClipped()`. Its text-resolution, positioning and focusable-ancestor internals were reworked
  with the merge: the private `textElement`, `positionFor` and `listenToFocusableAncestor` are gone
  and a private `ancestorFocusTrigger` is new, so a subclass that overrode or declared one of those
  names must adjust.

### Added

- **`TableColumn.minWidth` sets the narrowest a `ds-table` column gets, in px with the padding.**
  A `truncate` column without `width` stops shrinking at it and the table scrolls sideways
  instead: `{ key: 'email', label: 'Email', truncate: true, minWidth: 160 }`. Ignored when `width`
  is a number.

- **`styles/target` gives an icon-only control of yours the library's 24px target.**
  `@include target.min-size` last in its rule: the box keeps its size, a transparent `::before`
  centred on it takes the pointer over at least `--hit-xs`, and the focus ring is drawn on that
  target, 24px across. The ring follows `--focus-ring-offset`, so `[data-focus='edge']` draws it
  2px and `[data-focus='inset']` 4px inside the target's edge. `$ring-on-target: false` leaves the
  ring where the control's own rule draws it, for a control set beside text; `$position: null` for a
  control that is already positioned.

- **`skeletonCount` sets how many marks a chart's loading skeleton draws.** `ds-chart` and
  `ds-column-chart` draw that many columns, `ds-pie-chart` that many slices and legend rows,
  `ds-funnel-chart` that many stages and `ds-waterfall-chart` that many steps; the default is 5.
  Once the data is known, the skeleton takes the data's own count. `ChartComponent`,
  `ColumnChartComponent`, `PieChartComponent`, `FunnelChartComponent` and
  `WaterfallChartComponent` gained the public `skeletonCount`. These classes, `LineChartComponent`,
  `HeatmapChartComponent`, `ScatterChartComponent`, `SelectComponent`, `MultiSelectComponent` and
  `AutocompleteComponent` gained and lost skeleton members, named in the migration manifest; a
  subclass declaring one of those names must rename it.

- **`styles/component-base` gives a component of yours the base the library's components carry.**
  `@include component-base.rules` first in a component stylesheet sets `border-box`, the inherited
  font on form controls, zero heading margins and the base focus ring on that component's own
  elements, whether or not the app loads `styles/reset` and `styles/focus`.

- **The package ships an ESLint plugin and a stylelint plugin that flag API and tokens the library
  has removed or renamed.** Import them from `@ids-group-ltd/ids-design-system/eslint` and
  `@ids-group-ltd/ids-design-system/stylelint`. The ESLint plugin is a flat-config object with seven
  `problem` rules under the `ids-design-system/` namespace, each running on `**/*.ts` and `**/*.html`
  (the template rules need your `@angular-eslint/template-parser`): `no-removed-inputs`,
  `no-removed-outputs` and `no-removed-values` flag a template binding, listener or static attribute
  value for an input, output or value the library dropped, renamed or remapped; `no-renamed-selectors`
  flags a renamed element in templates and in `querySelector`, `closest`, `matches` and `css` strings;
  `no-renamed-imports` flags a removed or renamed symbol imported from the package and autofixes a
  pure rename across the file; `no-removed-members` flags a class member that now overrides nothing
  on a class that extends or implements one of ours; and `no-removed-tokens` flags a removed or
  renamed `--*` custom property in TS strings and template attributes and autofixes a rename.
  `idsDesignSystem.configs.recommended` turns all seven on at `'error'`. The stylelint plugin adds
  the one rule `ids-design-system/no-removed-tokens`, which flags removed or renamed `--*` properties
  in declarations and values and autofixes a rename. The token rules match a whole name, so
  `--x-warn` is not flagged inside `--x-warning`.

- **Both plugins take a `from` and a `to` version, so an upgrade reports only what changed across
  it.** Without a range the token rules list every removal and rename back to 0.2.0, and the other
  ESLint rules back to 0.4.0. With `idsDesignSystem.configs.recommendedFrom('0.13.4', '0.14.5')`, `['error', { from: '0.13.4', to: '0.14.5' }]`
  on one ESLint rule, or `[true, { from: '0.13.4', to: '0.14.5' }]` on
  `ids-design-system/no-removed-tokens`, a removed or renamed name from 0.13.4 or earlier, or from
  after 0.14.5, is left out. `from` is exclusive and `to` inclusive; either can stand alone, and the
  unreleased version counts unless `to` is set.

- **`--ds-loading-overlay-radius` rounds the corners of the `ds-loading-overlay` scrim.** It
  defaults to `0`. Set it to the radius of the container the overlay covers, so the blurred scrim
  ends at the container's own rounded edge instead of in square corners.

- **`dsTooltipPinOnClick` keeps a tooltip open after a click.** With it the tip opens on hover and
  focus with no delay, and a click on the host keeps it open after the pointer leaves until a click
  outside, `Escape` or blur; a second click closes it. Without it a click closes the tip as before.
  While pinned the host carries `data-ds-tooltip-pinned`. Every pinned trigger of the library shows
  the same cue, with no fill: `--accent-strong` ink, and for a text trigger a 2px solid accent
  underline. Hovering a pinned text trigger thickens the underline to 3px, and pressing it adds the
  `--surface-muted` press fill; a pinned icon takes a `--surface-muted` circle on hover and a
  `--border-default` circle on press. `@include pinned.cue()`, `pinned.cue-hover()` and
  `pinned.cue-pressed()` from `styles/pinned` (`$underline: false` for an icon) give your own
  pin-capable trigger the same cue, its hover and its press.
  Use it on info and definition triggers only, never on a control whose click acts.
  `TooltipDirective` gained the public `dsTooltipPinOnClick`, protected `onClick` and
  `onPointerLeave`, and the private `document`, `hostPinOnClick`, `pinsOnClick`, `pin` and
  `unpin`. A subclass declaring one of those names must rename it.

- **`ds-info-hint` is an icon button with a pinned tooltip.** `<ds-info-hint
  ariaLabel="About conversion rate" text="…" />` renders a 14px question-mark icon button named by
  `ariaLabel`, and `icon="info"` swaps the question mark for an "i"; `text` shows on hover and focus, describes the button, and stays open after a click.
  The icon darkens on hover, sits on a `--surface-muted` circle while pressed, and turns
  `--accent-strong` while pinned.
  `InfoHintComponent` is exported from the package root.

- **`dsDefinitionTerm` marks a term that carries its definition, on any element.**
  `<span dsDefinitionTerm="…">term</span>` keeps the surrounding text style with a dotted underline
  in `--text-tertiary`, takes the focus ring, shows the definition on hover and focus, and pins it
  on click; the attribute value is the tooltip text. While the term is clipped, its definition opens
  with the term's own text in bold, a line break, then the definition; a definition that already
  contains the term's text is left as it is. On a host other than `<button>` it adds
  `tabindex="0"`, `role="button"`, and `Enter` / `Space` act as a click; on a `<button>` it sets
  `type="button"`. Hover makes the underline solid in `--text-secondary`, a press (a click held, or
  `Enter` / `Space` held on a non-button) tints the term
  with `--surface-muted`, and a pinned term turns `--accent-strong` with a 2px solid accent underline; no
  state changes its size. `[pinOnClick]="false"` turns the pin off where the click
  already acts. The directive brings its own styles: no stylesheet import is needed, including in an app that
  assembles the style partials one by one.
  `DefinitionTermDirective` is exported from the package root.

- **`dsTooltipArrow` turns a tooltip's arrow off.** `[dsTooltipArrow]="false"` draws the panel with no
  arrow pointing at the host; the default is `true`, so every tooltip keeps its arrow until it is set.
  `TooltipDirective` gained the public `dsTooltipArrow` and `TooltipPanelComponent` the public
  `arrow`, so a subclass declaring either name must rename it.

- **`text-clip.inline-axis` and `text-clip.line-clamp($lines)`** join
  `text-clip.single-line-ellipsis` in `styles/text-clip`. `inline-axis` clips a row sideways and
  leaves the block axis visible; `line-clamp` clamps a block to `$lines` lines at
  `line-height: normal`, the one line-height every font sizes to its own glyphs, so neither cuts a
  glyph whatever the font.

- **`dsTooltip` renders `**bold**`.** Text between a pair of `**` is bold; `\*\*` is a literal `**`
  and an unpaired `**` stays as typed. The panel builds its content from the parsed text, so no
  markup in a string is interpreted as HTML. Nothing else is parsed: no italics, code, lists or
  tags. `dsTooltipWhenClipped` with no `dsTooltip` shows the host's text exactly as written, even
  where it contains `**`. `TooltipPanelComponent` gained the protected `segments`, and
  `TooltipDirective` the private `ownText` and `leadsWithOwnText`, so a subclass declaring one of those
  names must rename it.

- **`--ds-date-picker-max-width` caps the width of `ds-date-picker`.** It defaults to `100%`, so
  nothing changes until it is set. With `fullWidth`, the field fills its container up to the cap,
  which keeps it from spanning a wide dialog or form column; without `fullWidth`, the field stays as
  wide as its date format and never gets narrower than it.

- **`ds-bar-chart` takes `labelPosition`.** `labelPosition="start"` puts each label in a column
  before its bar, on the bar's line, and lines up labels, bars, values and percents in columns
  across rows; the default `'top'` keeps the label above the bar. `BarChartLabelPosition` is its
  type. `--ds-bar-chart-label-column-max-width` (default `40%`) caps the label column, and under
  `'start'` `--ds-bar-chart-row-gap` defaults to `--space-3` (`--space-5` under `'top'`).

- **A `ds-bar-chart` row can hold rows of its own.** `BarChartRow.children` nests rows under a row
  behind a disclosure button after its label, closed at first. A child's bar and derived percent
  are shares of its parent's value, not of `max`; it takes the parent's `color` and `showPercent`
  unless it sets its own, draws at `--ds-bar-chart-child-fill-opacity` (default `0.55`), and is
  listed in the data table whether or not its group is open. One level deep. With `interactive`,
  the row carries `aria-expanded`, and Right opens a closed group and Left closes an open one.

- **`BarChartRow` takes `hint`, `emphasis`, `showPercent` and `detached`.** `hint` turns the label
  into a defined term: a dotted underline, and the hint in a tooltip on hover and keyboard focus,
  announced as the label's description. `emphasis` prints the label in bold. `showPercent` prints
  or hides that row's percent, overriding the chart's. `detached` marks a row that is not a part of
  the others, such as a total of those who finished or left: a dashed divider in
  `--ds-bar-chart-divider-color` separates it from the row before, and `partOfWhole` gives it no
  share. A chart with any `hint` or `children` takes `role="group"` instead of `role="img"`, so the
  buttons inside stay reachable. A chart without the new fields renders as before.
  `BarChartComponent` gained the public `labelPosition`, the protected `isExpanded`, `toggleRow`,
  `hintId`, `holdsControls`, `percentColumn`, `entries`, `showsSkeleton` and `reloading`, and the private `idPrefix` and
  `expanded`, so a subclass declaring one of those names must rename it.

### Changed

- **`ds-chart`, `ds-column-chart`, `ds-line-chart`, `ds-pie-chart`, `ds-funnel-chart`,
  `ds-waterfall-chart`, `ds-heatmap-chart` and `ds-scatter-chart` keep their plot on screen while
  they reload.** With `loading` set and data on screen, the plot, its axes and its legend stay
  under the scrim and spinner of `ds-loading-overlay`, which reaches 8px past the plot and leaves
  the caption uncovered; the plot takes no focus or pointer until `loading` clears. They drew the
  skeleton in its place. The skeleton shows only while there is no data: pass empty data while
  `loading` is set to show it on every load. The internal `ChartStatesComponent` gained `reloading`,
  `dataTable` and `shimmer`, and the internal `ds-chart-skeleton` element draws the axis skeleton.
- **A chart's loading skeleton takes the chart's own shape and size.** `ds-chart` and
  `ds-column-chart` draw the axes with label placeholders and columns, `ds-line-chart` a line,
  `ds-pie-chart` its ring in slices with legend rows, `ds-funnel-chart` narrowing stages over the
  stage table, `ds-waterfall-chart` a total, floating steps and a closing total, `ds-heatmap-chart`
  a cell grid with its labels and scale, and `ds-scatter-chart` its grid lines and labels with no
  dots. Each is laid out on the drawn chart's value space, plot height and gutters, and a data-table
  disclosure keeps its room, so the card keeps its height when the data arrives. A
  `--ds-line-chart-placeholder-height` now sizes the line skeleton with its axis labels included.
- **`ds-heatmap-chart` is as wide as its grid.** The host is `inline-size: fit-content`, capped at
  its container, so the card, the skeleton and the reload overlay match the grid instead of filling
  the row; a wider grid still scrolls inside it. To fill the container again, set
  `inline-size: auto` on it from a component stylesheet, or as `:root ds-heatmap-chart` from a global
  one: a bare `ds-heatmap-chart { inline-size: auto }` there loses to the component's own host rule.
- **`ds-select`, `ds-multi-select` and `ds-autocomplete` load into the list itself.** With
  `loading` set and no options, the list shows three placeholder option rows; with options, they
  stay under a `ds-loading-overlay` over the list, inert until `loading` clears. Both replace the
  spinner row. In `ds-multi-select` the filter input and select all stay live. The overlay host
  sits between the panel and the list and ships in `styles/dropdown-overlay`.

- **Overlay panels, `ds-modal`, `ds-toast`, `ds-banner` and `ds-alert` enter with `ds-fade-in`
  instead of `ds-scale-in`.** A tooltip, popover, select or menu panel, a submenu, a modal card, a
  toast, a banner and an alert now fade in where they stand, without growing or travelling. The
  scale entrance re-rasterised the text as it ended, so the glyphs drew heavier during the entrance
  and then thinned and stepped a pixel as it settled; the fade does not. `--ds-overlay-enter-scale`, `--ds-overlay-enter-offset`, `--ds-modal-enter-scale`,
  `--ds-toast-enter-scale`, `--ds-banner-enter-scale` and `--ds-alert-enter-scale` still work once the
  matching `--ds-*-enter-keyframes` is set to `ds-scale-in` or `ds-slide-in`.
- **A closing `ds-toast` fades where it stands.** It rose 8px while it faded.
- **Chart marks and their labels no longer travel in.** A `ds-funnel-chart` stage grows from 96% while
  it fades in instead of rising 4px, and the value labels of the bar, column, waterfall, heatmap,
  pie and funnel charts and the funnel's table rows fade in where they stand. A `ds-pie-chart` ring
  grows from 96% while it fades in, without the 30° turn.
- **A `ds-menu-item` submenu stays open while the pointer heads for it.** Moving diagonally from
  the item to its submenu crosses the items below it, and a crossing slower than 150ms closed the
  submenu and opened the next one. The pointer may now cross them for as long as it stays inside
  the triangle from where it left the item to the submenu's near edge; the submenu closes once
  the pointer leaves that triangle or rests in it for 300ms, and an item it rested on then opens
  its own submenu. Moving from the submenu back onto its item keeps it open.
  `MenuItemComponent` gained the public `activateHover` and the private `aim`. A subclass
  declaring one of those names must rename it. It lost the private `closeTimer` and
  `clearCloseTimer`, so a subclass member of either name no longer collides.

- **`text-clip.single-line-ellipsis` clips the inline axis only.** It clipped both axes with a
  4px margin, which a font taller than the line box by more than that overran. Ink above and
  below the box now paints over whatever sits there, as it would in any unclipped box.
- **A `ds-stat` value clamped with `--ds-stat-value-lines` sets `line-height: normal`.** At a
  flat line-height the clamp's edge ran through the strip where the last line's descenders and
  the next line's accents overlap. A clamped value is taller: a tile whose value fills two
  lines at the default size grows from 147 to 165px in Mulish. An unclamped value keeps its flat
  line in a browser with container style queries; in one without, it takes `line-height: normal`
  as well.
- **`ds-bar-chart` keeps its rows on screen while it reloads.** With `loading` set and rows in
  `data`, the rows stay under the scrim and spinner of `ds-loading-overlay`, the one `ds-table`
  uses on a reload, which covers the whole card to its rounded corners; the chart takes no focus or
  pointer until `loading` clears. It drew skeleton rows in
  their place. Skeleton rows show only while `data` is empty, and now take the label, value,
  percent and track boxes of a drawn row, so the rows keep their height when data arrives. To show
  the skeleton on every load, pass an empty `data` while `loading` is set.
- **A `**` in an existing tooltip string now makes text bold.** Write `\*\*` where the asterisks
  are meant literally.
- **`ds-modal`, `ds-modal-card` and `ds-drawer` no longer warn in dev mode about content without a
  slot.** Such content renders in the body by design, so neither the console nor a mirrored toast
  reports it any more, and an attribute that names no slot (a directive such as `cdkDrag`) is not
  reported as an unknown slot. Rendering is the same. `ModalComponent`, `ModalCardComponent` and
  `DrawerComponent` lost the private `unslotted`, so a subclass member of that name no longer collides.

- **A `ds-table` column with `truncate` and no `width` grows to its text instead of clipping at
  240px.** The other columns get their content width first; such a column takes what they leave, up
  to the widest value among all filtered rows, on every page, and clips at its column width when
  there is less, down to its header label, so it does not push the table into horizontal scroll.
  In a table that scrolls sideways anyway it clips at 240px of text, or at its `minWidth`. A value
  that was cut at 240px beside empty space now shows whole. To keep the 240px cap everywhere, set
  `width: 272` on the column (240 plus the cell padding).
  `TableComponent` lost the protected `clipWidth` and gained the protected `clipGrows`,
  `clipMaxWidth` and `clipMinWidth` and the private `growingClipColumns`, `clipCapsSet`, `clipFit`,
  `clipFitWidth`, `textCanvas`, `measureGrowingClips`, `widestValue` and `splitGrowingClips`, so a
  subclass declaring one of those names must rename it.

- **`DsIntl` gains a required key: `chart.rowsUnder: (label: string) => string`** (default
  `` (label) => `Rows under ${label}` ``), the name of a bar-chart group's disclosure button. A
  complete `DsIntl` dictionary, or a complete `chart` section of one, declared as a typed object
  stops compiling until it lists it. Overrides passed to `provideDsIntl` are partial and need
  nothing.

- **A `ds-table` header label with a `hint` is a `button[dsDefinitionTerm]`.** A plain label pins
  its hint on click and takes the term's hover, pressed and pinned states; a sortable one sorts on
  click and pins nothing.

### Deprecated

- **`styles/skeleton-shimmer` emits nothing, and `styles/ds` no longer forwards it.** `ds-skeleton`
  carries its own reduced-motion opt-out. The partial stays in the package as an empty file; delete your
  `@use 'styles/skeleton-shimmer'`.

### Fixed

- **A loading `ds-select`, `ds-multi-select` or `ds-autocomplete` list takes no keys.** With
  `loading` set over options already shown, the arrow, `PageUp` / `PageDown`, `Home` / `End` and
  `Enter` keys moved the active row and picked an option under the inert scrim. They do nothing
  until `loading` clears, `aria-activedescendant` points at no option meanwhile, and the field
  itself carries `aria-busy="true"`. Typing in the filter and the multi-select's select-all row stay
  live. `SelectComponent`, `MultiSelectComponent` and `AutocompleteComponent` gained the
  protected `listInert`.

- **A clipped `dsTooltipWhenClipped` value is reachable by keyboard wherever it sits.** A host
  that was not focusable, inside no focusable control (a code in a clickable card or row, a value in
  a plain table cell), showed its full text on hover only. It now takes `tabindex="0"` while it is
  clipped, so Tab stops on it and opens the tip, and it loses the stop once its text fits. A host
  that is focusable, sits inside a control or widget role, or holds a control is left as it was; a
  `tabindex` you set is never touched, and `tabindex="-1"` keeps a clipped value out of the Tab order. Every
  host one resize reaches is measured before any of them takes or loses its stop, so a long table
  with clipped columns lays out once per resize rather than once per host.

- **The keyboard focus ring is rounded on elements that declare no radius.** The close buttons of
  `ds-banner`, `ds-alert`, `ds-toast`, `ds-drawer` and `ds-modal-card`, the `ds-dropzone` remove
  button, the `ds-table` column filter button and cell link, a focusable `ds-sparkline` and
  `ds-tabs` panel, and a middle `ds-accordion-item` header drew a square ring; they take
  `--focus-ring-radius` now. The `ds-number-stepper` step buttons and the `ds-split-button` segments
  round only their outer corners and keep their shared seam square.
  The radius is set at zero specificity in `styles/focus`, and in each component's base layer for
  its own elements, so any radius an element declares wins; an element of yours that paints a fill or border and declares none rounds its corners while
  focused. Declare its `border-radius` to keep it square.

- **The close `×` sits in the centre of its box and focus ring.** The close buttons of `ds-banner`,
  `ds-alert`, `ds-toast` and the `ds-dropzone` remove button laid the icon on a text line, up to 2px
  below or beside the centre of a box that was not square; the `ds-drawer` close icon sat low in a
  box that was already square. They centre the icon in a square box now: 20px in `ds-banner`, 18px
  in `ds-alert`, `ds-toast` and `ds-dropzone`, 24px in `ds-drawer`. The banner and dropzone buttons
  are 8px narrower.

- **The `ds-table` column filter button is a 24px target.** It was the 12px icon alone, so its focus
  ring hugged the icon. The target grows around the icon without changing the header height; the
  icon sits `--space-2` after the label instead of `--space-1`, so a filtered header's label clips
  4px sooner. The button is at full opacity while focused.

- **A `ds-table` cell link's focus ring clears the text.** It was drawn inward, over the first and
  last letter; it is drawn around the text now. In a `truncate` column the link clips its own text,
  so the ring keeps the sides the cell's clip cut off; the cell's tooltip and ellipsis are as before.
  That link is the element that clips, `a.cell-link.cell-clip-text` inside `span.cell-clip`: a rule
  of yours for `ds-table .cell-clip a` still matches it, but one that sets `display`, `overflow`,
  `white-space` or `text-overflow` there overrides the ellipsis; drop those declarations.

- **The focus ring clears the text of a `ds-table` header label, a `ds-list-item` and a
  `ds-breadcrumbs` link.** It was drawn inward, over the first and last letter; it is drawn 2px
  outside the text now, in the padding already around it. Nothing moves at rest, and a header
  term's pressed fill keeps its size.

- **Every icon-only control takes the pointer over at least `--hit-xs` (24px).** The close and
  remove buttons of `ds-alert`, `ds-banner`, `ds-toast`, `ds-dropzone` and `ds-tag`; the clear `×`
  of `ds-input`, `ds-search`, `ds-select`, `ds-autocomplete`, `ds-multi-select`, `ds-time-picker`
  and the `ds-sidenav-footer` search; the `ds-input` password toggle, the `ds-date-picker` calendar
  toggle, the `ds-description-item` copy button, the `ds-bar-chart` row toggle, the arrows of the
  `ds-table` width and column panels, an icon-only `ds-breadcrumbs` item and `ds-info-hint` took a
  click only on their own box, under 24px on at least one side. Each keeps the size it is drawn at and takes the pointer
  over 24px around it; nothing around it moves but the arrows of the `ds-table` width and column
  panels, which sit `--space-2-5` apart instead of `--space-1` so their targets do not overlap. Its
  focus ring is drawn on the edge of that target, 24px across, except on `ds-info-hint` and an
  icon-only breadcrumb, whose ring stays on the icon beside their text. Inside a container that sets `data-focus="inset"` or `"edge"` the ring follows that mode and shrinks with it, as the `ds-table` column filter does (16px), since the table sets inset on itself. The ring's corners take the control's own radius, 4px by default, on every one of them. Raising `--hit-xs` raises every one of these targets. The `ds-input` clear button shows its
  own focus ring; it was cut away with its icon.

- **The `ds-date-picker` month and year arrows sit in the centre of their button.** The browser's
  button padding left the 14px icon 1px right of the centre of its 24px box.

- **A tooltip and a `ds-menu-item` submenu close when anything under them scrolls.** Inside an
  `overflow: auto` container they stayed where they opened while their trigger scrolled away. They
  close now on a scroll of the window or of any scroll container, as
  `ds-popover` and the picker panels already did; a pinned tooltip unpins.
- **A bordered `ds-table`'s reload overlay follows its rounded corners.** The scrim over the rows
  ended in square bottom corners outside the rounded border; it now takes the table's radius,
  `--ds-table-radius` or `--ds-radius-control`.

- **A tooltip's arrow points at the centre of its trigger.** It sat at the middle of the panel, so
  a panel pushed off a viewport edge pointed past a trigger near that edge.

- **A `<div actions>` wrapper lays its buttons out like buttons projected one by one.** In the
  footer of `ds-modal`, `ds-modal-card`, `ds-drawer` and `ds-bottom-sheet`, the buttons inside a
  `<div actions>` (or a `<div drawer-footer>`) touched; they now take the footer's gap, alignment
  and, in `ds-modal-card`, its stacking when the row runs out of width. The wrapper gets
  `display: contents` at zero specificity, so a `display` you set on it yourself still wins and keeps
  your own layout.

- **Text keeps its ascenders and descenders under any font.** A box that truncates text clipped
  both axes, so where the font's ascent plus descent is taller than the line-height, the tails of
  g, j, p, q and y and the marks above Й, Ё and Å were cut flat, by more the taller the font you
  set in `--font-sans`. These now clip along the inline axis only and keep their size:
  `ds-breadcrumbs` (the row and each label), the `ds-stat` label and value, every label that ends
  in an ellipsis (`ds-select`, `ds-multi-select` and `ds-autocomplete` values and options,
  `ds-sidenav-item`, `ds-sidenav-footer`, `ds-tree`, `ds-banner`, `ds-table` headers and
  cells), the chips of a `ds-multi-select` or `ds-autocomplete` in fit mode, the `ds-date-picker`
  value, the `ds-filter-bar` row, and `ds-table` headers with resizable columns. A long label
  still ends in an ellipsis and a long trail still clips at the row's end.

- **A pinned chart tooltip takes the pointer.** Its text can be selected and a link in a
  `tooltipTemplate` clicked; the panel's content ignored the pointer even while its pane was pinned,
  so a press on it went through to the pane. An unpinned tooltip still lets the pointer through to
  the plot, and a `pointer-events: auto` you set on an element of your `tooltipTemplate` is still
  what makes it clickable while `tooltipLingerMs` keeps an unpinned panel open. The internal
  `ChartTooltipDirective` behind `dsChartTooltip` lost the private `closeOnEscape`, so a subclass
  member of that name no longer collides.
- **A `truncate` column dragged with `dsTableResize` clips at its dragged width.** A column with a
  `width` kept cutting its text at that width after being dragged wider, and could not be dragged
  narrower than it plus its padding.
- **A `truncate` column with a numeric `width` is that wide.** Its text was clipped at `width`
  and the cell padding came on top, so `width: 240` rendered a 272px column (264px at compact
  density) while a column without `truncate` rendered 240px. The text now clips inside the
  declared width, 32px shorter at the default density.

- **`ng add` with a `--project` that does not exist stops with an error naming it.** It printed the
  generic "add it manually" message and changed nothing, which hid the typo.

- **`ng add` no longer adds a second `@use` of the package styles.** A line you wrote yourself with
  double quotes, `as` or `with (...)` was not recognised, and Sass then refused the duplicate
  namespace.

- **`check-overrides` reports `--ds-*` values set from templates and code.** `[style.--ds-*]`
  bindings and `setProperty('--ds-*', …)` calls were never matched, so a stale token set that way
  went unreported.

- **Reduced motion stops the skeleton shimmer in an app that does not load `styles/ds`.** The opt-out
  lived in `styles/skeleton-shimmer`, so an app assembling the partials one by one kept the wave
  running for readers who asked for less motion. `ds-skeleton` carries it in its own styles now.

- **The "no matches" row of `ds-select`, `ds-multi-select` and `ds-autocomplete` keeps its type
  without `styles/typography`.** Its family, weight and line height came from the `.t-s` class,
  so without that partial the row fell back to the page's font (the browser's serif on an
  unstyled page). `styles/dropdown-overlay` sets them now, from the same `--ds-typography-s-*`
  hooks, and the row no longer carries `t-s`; with typography loaded it renders as before. A rule
  of yours that reached the row through `.t-s` matches nothing: select `.ds-dropdown-panel .empty`.

- **Components keep their size, fonts and focus ring in an app that does not load `styles/reset`
  or `styles/focus`.** Each component now sets `box-sizing: border-box` on its host and its own
  elements, puts its form controls in the inherited font, clears its heading margins and draws the
  base focus ring on its own focusable elements. Without `styles/reset`, a default `ds-input` field
  and a `ds-input` inside `ds-field-group` grew taller, and a host with a border took the browser's `content-box`; without `styles/focus`, buttons such as the
  `ds-number-stepper` steps and the close buttons of `ds-banner`, `ds-toast`, `ds-modal-card` and
  `ds-drawer` showed the browser's own focus ring. A height animation such as an expanding
  `ds-sidenav-group` animates without the reset as well.

- **`ds-container` with `size="sm|md|lg"` and the responsive rail of `ds-app-layout` work without
  `bp.emit-vars`.** Both fall back to the library's breakpoints; `ds-container` went full-bleed
  and the rail stayed in desktop layout. Your own `--bp-*` still win where you set them, and the
  dev-mode warning about a missing `--bp-lg` is gone.

- **`ds-bar-chart` prints `—` for a row with a non-finite value.** A `NaN` or `Infinity` value, or a
  `[low, high]` pair with a non-finite end, printed `0` and `0.0%` as though it were a reading of zero.
  The row now draws no bar and shows `—` as its value, as its percentage (unless the row sets
  `percent`) and as its share in the data table under `partOfWhole`. The generated summary leaves
  such a row out of its lowest and highest readings, and reads `—` when no row has a value.

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| `--ds-waterfall-chart-skeleton-height:` | the waterfall skeleton draws floating steps on the chart's own plot height and reads no height token | nothing |
| `--chart-skeleton-h:` | no component reads the token | nothing |
| `@use 'styles/skeleton-shimmer'` | the partial emits nothing; `ds-skeleton` styles its own reduced-motion stop | nothing |
| a hand-built info button: `name="info"` on a `ds-icon` inside a `<button>` that carries `dsTooltip` | `ds-info-hint` renders the button, the icon and the pinned tooltip | `<ds-info-hint ariaLabel="…" text="…" />` |
| a hand-built term button styled with `underline dotted` that carries `dsTooltip` | `dsDefinitionTerm` carries the underline, the focus ring, the keyboard access and the pinned tooltip | `<span dsDefinitionTerm="…">` |
| a cell template wrapping the value in an element styled `width: 0; min-width: 100%` with an ellipsis, plus `dsTooltipWhenClipped` on it, so a column without `width` clips at its own width | `truncate: true` on a column without `width` clips at the column width and shows the full value in a tooltip | `truncate: true` on the column; keep the template only for markup it adds besides the value |
| `--ds-overlay-enter-keyframes: ds-fade-in` | `ds-fade-in` is the default entrance of overlay panels | nothing |
| `--ds-modal-enter-keyframes: ds-fade-in` | `ds-fade-in` is the default entrance of a modal card | nothing |
| `--ds-toast-enter-keyframes: ds-fade-in` | `ds-fade-in` is the default entrance of a toast | nothing |
| `--ds-banner-enter-keyframes: ds-fade-in` | `ds-fade-in` is the default entrance of a banner | nothing |
| `--ds-alert-enter-keyframes: ds-fade-in` | `ds-fade-in` is the default entrance of an alert | nothing |
| `tabindex="0"` added to a `dsTooltipWhenClipped` host only so the keyboard reaches it | the host takes `tabindex="0"` by itself while it is clipped, and no stop while its text fits | nothing; keep it where the value must stay a tab stop when it fits |

## 0.14.8 — 2026-10-06

### Added

- **`TableColumn.hint` defines a column's term.** Set it and the header label of `ds-table` gets a
  dotted underline in `--text-tertiary` and shows the hint in a tooltip on hover and keyboard focus,
  announced as the label's description. A sortable label keeps its sort button as the single Tab
  stop; a plain label with a hint renders as a `<button type="button">` styled like the label. While
  the label is clipped, the tooltip shows the label on its first line and the hint under it;
  otherwise it shows the hint alone. A column without `hint` renders as before.

- **`dsTooltipClippedLead` puts a line above a tooltip while its host is clipped.** Set it to the
  host's own text and the tip reads that text, a line break, then `dsTooltip`; while the host shows
  all of its text the tip is `dsTooltip` alone. `TooltipDirective` gained the public
  `dsTooltipClippedLead`, so a subclass declaring that name must rename it.

### Changed

- **A tooltip keeps a line break written into its text.** A `dsTooltip` string, or the text a
  `dsTooltipWhenClipped` host discloses, that holds a newline now breaks there; it read as a space
  before. Runs of spaces still collapse, and a text on one line is unchanged. A string built from a
  data value with a newline, or from a template literal written across several lines, now shows one
  row per line; join the lines with a space to keep the old look.

### Fixed

- **A `ds-table` header label wider than its column ends in an ellipsis.** It ran past the column over
  the next header, and the last column's was cut by the scroll edge. The label now clips inside its
  column; the sort icon and the filter button stay visible, and the clipped label still shows in a
  tooltip. A header that fits looks the same, but every label now sits in a `.th-text` span, which
  carries the ellipsis, inside `.th-label`.

## 0.14.7 — 2026-10-05

### Added

- **`ds-pie-chart` takes `centerCompact` and `centerPlacement`.** `[centerCompact]="false"` keeps the
  full sum at the floor font size instead of the compact form. `centerPlacement="below"` prints the
  value and its caption under the ring at full size, never shrunk or shortened; the default is
  `'inside'`. `PieChartCenterPlacement` is the type of the latter. The
  `--ds-pie-chart-center-value-min-font-size` token sets the smallest size the value shrinks to.
  `PieChartComponent` gained the protected `centerText` and `centerFontSize` and the private
  `compactCenterValue`, `ringElement`, `centerValueElement`, `centerFit`, `ringWidth`, `fitsInside`,
  `fitCenter`, `watchRing` and `refit`, so a subclass declaring one of those names must rename it.

- **`dsModalConfirm` fires a modal's `confirmed`.** Put it on the confirm action inside `ds-modal`
  (`ModalConfirmActionDirective`, exported from the modal entry point) and `(confirmed)` fires when
  that action is pressed. On a `ds-button` it follows `pressed`, so a disabled or loading button never
  confirms; on another element it follows `click` and skips `aria-disabled="true"`. The modal stays
  open until you close it.

- **Dev warnings show as toasts too.** In dev mode every library warning that reaches the console is
  also shown as a `warning` toast titled "Dev warning", once per message, as soon as the app has
  injected `ToastService`; warnings raised before that show then, up to 50. A production build
  shows none. On by default; `provideDsConfig({ toast: { mirrorDevWarnings: false } })` keeps them
  in the console only.

### Fixed

- **`ds-pie-chart` keeps its centre value on one line.** A value wider than the hole broke between
  its digits, so `32,397` read as `32,39` over `7`. The value no longer wraps: it shrinks to the hole,
  down to `--ds-pie-chart-center-value-min-font-size` (default `14px`), and past that floor the sum
  prints in the `'tick'` form of `valueFormat` (`32.4K`). A `centerValue` string is shrunk but never
  shortened.

- **A chart's pin sits under its panel.** `ds-chart` drew the disc of a held category at the foot of
  the plot, far from its panel; it now sits at the head of the reading the panel
  opens over, 8px inside a column's top or 8px below a marker; over a column too short to hold it,
  the disc sits 8px above the column and its value and the panel rises over the disc. The same holds
  for a column pinned in `ds-column-chart` or a `dsColumnSeries`. `ds-bar-chart` draws it at the
  middle of the held bar, under its panel, rather than at the bar's start. In `ds-line-chart`, a line
  series in `ds-chart` and `ds-scatter-chart`, the disc over a held marker or point sits 4px higher.
  `ChartComponent` gained the protected `highlightBand` and `tooltipGap` and the private `bandAt`,
  `hoveredCategory` and `pinRise`, and `ColumnSeriesComponent` the private `pinYOf`, so a subclass
  declaring one of those names must rename it. `ChartComponent`'s protected `bandPinY` is now a
  computed signal read as `bandPinY()`, where it was a method taking the band, so a subclass that
  calls `bandPinY(band)` or overrides it as a method must read or override the signal instead.

- **A held category is not highlighted.** The hover band of `ds-chart` stayed painted on a pinned
  category after the pointer left; under a pin the band now follows the pointer alone, and nothing
  stays highlighted once it leaves the plot.

- **`provideDsIcons` calls add up.** A second call, as a sibling or in a lazy route's providers,
  replaced the icons registered before it; the calls now merge, a later call winning a shared name.

- **A disabled link-button with `disabledReason` stays reachable by Tab.** A `ds-button` with
  `routerLink` or `href`, `disabled` and a `disabledReason` was taken out of the Tab order, so its
  reason was never announced; it now keeps its Tab stop and link role, and still swallows the click.
  A disabled `routerLink` button is announced as a link with or without a reason.

- **`ds-avatar-group` applies `max` to the projected avatars.** Avatars past `max` are hidden,
  and with `total` unset the `+N` chip counts the projected avatars; the group showed every
  projected avatar and drew no chip without `total`. `AvatarGroupComponent` gained a private
  `avatars`, so a subclass declaring that name must rename it: `override` cannot reach a private
  member.

- **`provideDsTheme({ followSystem: true })` keeps a `data-theme` set before startup.** A
  `data-theme` already on `<html>` when the app starts, from `index.html` or a script that restores a
  saved choice, is kept, and OS colour-scheme changes no longer override it. Without the attribute,
  the theme follows the OS as before.

- **`ds-bar-chart` draws a negative value as an empty track.** A row with a negative `value`
  drew a bar as long as its absolute value and was labelled `0`; it now draws no bar, and its label,
  tooltip and accessible name show the real value.

- **Topbar and page-header breadcrumb tokens take effect.** `--ds-topbar-crumb-text-color`,
  `--ds-topbar-crumb-hover-text-color`, `--ds-topbar-crumb-separator-icon-color`,
  `--ds-topbar-crumb-current-text-color`, `--ds-page-header-crumb-text-color` and
  `--ds-page-header-crumb-text-color-hover` changed nothing; they now recolour the projected
  `ds-breadcrumbs`. Unset, the breadcrumbs keep their own `--ds-breadcrumbs-*` colours.

- **The `ds-banner` icon centres on the capitals of the text.** It centred on the line boxes, leading
  included, and a banner with no `title` kept the title-to-body gap above its body, so the icon sat
  up to 2px above the letters. Where `text-box` is supported (Chromium, Safari) the icon now lines up
  with the capitals, compact or not, with or without a title. A banner with no `title` and a body of
  more than one line is up to 4px shorter; every other banner keeps its height.

- **Content without a slot attribute shows in `ds-modal`, `ds-modal-card` and `ds-drawer`.** A
  child with no slot attribute, or with one the overlay does not have, was dropped silently; it now
  renders in the body after `[body]` / `[drawer-body]`, and in dev mode the console asks for its
  slot (`<div body>`, `<div drawer-body>`) or names the unknown one. `ds-drawer` also takes
  `[body]` for its body and `[actions]` for its footer, the slot names of `ds-modal`.
  `ModalComponent`, `ModalCardComponent` and `DrawerComponent` gained the private `unslotted`,
  so a subclass declaring that name must rename it.

- **A dev warning logs once per page.** An identical warning from many instances, such as one per
  `ds-button` with the same discouraged `color` and `variant`, reached the console once per
  instance; it now logs once. The `ds-table` export warning starts with `[ds-table]` like the
  others, and the `ds-app-layout` missing `--bp-lg` message is a warning rather than an error.

## 0.14.6 — 2026-10-02

### Breaking

- **A chart whose pointer picks a category is walked by verticals from the keyboard.** In an
  `interactive` `ds-line-chart` and an `interactive` `ds-chart` with a category cursor, Tab lands
  on the category band (ringed), Left and Right move between bands and wrap, Home and End jump to
  the ends, and Tab leaves the chart in one press. Up and Down focus one series' marker inside the
  band and the panel shows that point alone; Enter on it fires `pointClicked` as a click does.
  Enter on a band pins it and moving to another band lets the pin go; Escape steps back from a
  marker to the band and then closes the panel. The series markers are no longer Tab stops there;
  charts whose pointer picks a mark keep their Tab stops and keys, except that Space on a line
  marker no longer scrolls the page. A class extending `ChartComponent`, `LineSeriesComponent` or
  `ColumnSeriesComponent` may collide with the members they gained (`focusedCategory`,
  `axisPointElements` and the keyboard handlers); a colliding private one must be renamed, since
  `override` cannot reach it.

- **`styles/focus` emits its global rules only through `emit-rules`.** The base focus indicator
  (`:where(:focus-visible)`), the `ds-focus-ring-in` keyframes, the `data-focus` switch and the
  forced-colours outline moved into `@mixin emit-rules`, which `styles/ds` includes. Before, every
  stylesheet that used a focus mixin re-emitted all of them, so each component carrying one shipped a
  copy of 1.0 kB of duplicated global rules unminified. If your global stylesheet composes the parts
  instead of `@use 'styles/ds'`, add `@include focus.emit-rules;` after
  `@use 'styles/focus' as focus;`, or focus rings disappear on elements that style none themselves
  and `data-focus` stops switching. `@use 'styles/ds'` needs nothing.

- **`DsIntl` gains two required keys: `datePicker.previousMonth` and `datePicker.nextMonth`**
  (defaults `'Previous month'` and `'Next month'`). A complete `DsIntl` dictionary, or a complete
  `datePicker` section of one, declared as a typed object stops compiling until it lists them.
  Overrides passed to `provideDsIntl` are partial and need nothing.

### Added

- **`.link.plain`: a link underlined only on hover and keyboard focus.** For a link that stands on its
  own, such as a row action or a list of links; keep the plain `.link`, underlined at rest, for a link
  inside running text. Every other `.link` renders as before.

- **`ds-breadcrumbs` crumbs can carry a hover surface.** `--ds-breadcrumbs-bg-color-hover` (default
  `transparent`) tints a link on hover, `--ds-breadcrumbs-padding` (default `0`) pads every crumb,
  the current one included, so labels stay on one baseline, and `--ds-breadcrumbs-radius` (default
  `var(--radius-sm)`) rounds the surface and the focus ring. Rendering is unchanged until one is set.

- **A `slash` icon.** `<ds-breadcrumbs separator="slash">` separates crumbs with a "/" in the
  weight of `chevronRight`.

### Changed

- **A focused warning or success field shows its state's colour.** Its halo is
  `--ds-field-focus-shadow-warning` or `--ds-field-focus-shadow-success` (defaults
  `--focus-field-warning` and `--focus-field-success`), as an error field's already was, where both
  showed the blue halo of a plain field. Under `data-focus="ring"`, `"edge"` and `"inset"` the
  indicator takes the field's border colour, `--warning-text` or `--success`. Set either token to
  `var(--ds-field-focus-shadow)` to keep the blue. The `field-state` mixin of `styles/field-state`
  takes them as two new trailing arguments, `$warning-focus-shadow` and `$success-focus-shadow`.

### Fixed

- **`ds-dropzone` takes the same file twice.** Picking a file, removing it and picking it again
  emitted nothing, because the browser fires no change for an unchanged selection; `filesAdded`
  now fires on every pick.

- **A `clickable` `ds-stepper`'s step buttons have names.** Each was a focusable button hidden
  from assistive technology, so Tab landed on something a screen reader could not announce; the
  button now carries the step's name and state, `DS_INTL.stepper.step`.

- **`ds-w3w` emits `copied` only once the address is on the clipboard.** It fired on every click,
  before the copy settled and also where the browser has no clipboard, so a "Copied" message could
  report a copy that never happened.

- **`--ds-container-max-width` sets `ds-container`'s width.** Every `size`, the default `xl`
  included, wrote its own width over the token, so setting it changed nothing; the token now wins
  over `size`.

- **`ds-number-stepper` steps by `step` and stops at `min` and `max`.** A button step that would
  pass a bound now lands on it: with `max` 100 and `step` 5, 98 goes to 100, where it went to 103.
  The arrow keys in the field step by `step` too, where they moved by 1. Typed values were already
  clamped.

- **`ds-funnel-chart`, `ds-heatmap-chart` and `ds-pie-chart` draw their keyboard focus ring.** The
  ring's colour and width resolved to nothing inside these charts, so a focused stage, cell or
  slice showed no indicator. It now takes `--focus-ring-color` and `--focus-ring-width`, and
  `--ds-funnel-chart-focus-color`, `--ds-heatmap-chart-focus-color`, `--ds-pie-chart-focus-color`
  and their `-focus-width` pairs restyle it as documented.

- **A pinned chart tooltip leaves the screen with its chart.** Scrolled past, the chart's pinned
  panel stayed held at the edge of the viewport; it now hides while the chart is out of sight and
  shows beside it again when it scrolls back. The pin itself is kept. The internal
  `ChartTooltipDirective` gained a private `detachOffscreen`, so a subclass declaring that name
  must rename it: `override` cannot reach a private member.

- **`ds-column-chart` and `ds-line-chart` follow a plot-height or geometry token re-pointed at a
  breakpoint.** They read `--ds-column-chart-*` geometry and `--ds-line-chart-plot-height` once,
  after the first render, so a media query changing one later never reached the plot; they now
  re-read whenever the chart's width changes. A token changed while the width stays the same is
  still picked up only at the next resize.

- **`styles/press`'s `feedback` mixin plays no press on a control disabled by class or ARIA.** It
  skipped `:disabled`, `[disabled]` and `.is-disabled` only; it now also skips `.disabled` and
  `[aria-disabled='true']`, so an anchor or a custom control marked disabled that way no longer
  darkens and shrinks on press.

- **`ds-funnel-chart`'s Unpin control sits where every other chart's does.** In a framed funnel it
  stood a frame padding further in from the top and the end (41px against 21px with the default
  20px padding); it now lines up with the caption like the rest.

- **`ds-app-layout`'s content region draws no focus ring.** An app that moves focus to the
  `<main>` after a navigation, so the next Tab starts on the new page, got the base indicator round
  the whole content area, and with no key pressed first the browser showed it. The region still
  takes focus; only the ring is gone, except under forced colours, where it stays.

- **`ds-date-picker`'s month arrows have accessible names.** The previous- and next-month buttons in
  the calendar panel are announced as `datePicker.previousMonth` and `datePicker.nextMonth`, where
  they were announced as an unnamed button.

- **`--ds-multi-select-option-bg-color-active` sets the option fill.** It colours the row under the
  keyboard cursor and the pointer in that multi-select's panel; it was declared where the panel had
  already resolved the fill, so setting it changed nothing. Unset, the fill stays
  `--surface-secondary`.

- **An `interactive` `ds-tag` works from the keyboard.** It is a tab stop with `role="button"` and
  `aria-pressed` following `selected`, and Enter or Space emits `toggled`, as a click does; it took a
  click only. If you added your own Enter or Space handler to an interactive `ds-tag` to make it
  keyboard-operable, remove it, or each key press toggles twice, once through your handler and once
  through the host's `toggled`; the `tabindex="0"` and `role="button"` you set alongside it are now
  redundant too. A key pressed on its close button still only closes it. `TagComponent` gained a
  protected `onKeyActivate`, so a subclass declaring that name needs `override`.

- **`ds-chart` shows the Unpin control while its category cursor is held.** A click on a band pins
  the cursor by default, and the composable chart now draws the same pill button as the preset
  charts, on its caption's line or, without a caption, over the top end of the plot. Before, Escape,
  a press outside the plot or a second click on the band released the pin, and nothing on screen
  said so. In every chart the `.pin-reset` button now sits inside an internal `ds-chart-unpin`
  element rendered `display: contents`, so a rule selecting it as a direct child of the chart's
  `figure` no longer matches; select `.pin-reset` alone. `ChartComponent` gained a protected
  `drawsUnpin`, so a subclass declaring that name needs `override`.

- **A `ds-table` expanded row closes the way it opens.** Collapsing a row folds its panel back over
  `--duration-base`, where the panel used to vanish on the next frame; the row leaves the DOM when
  the fold ends. Under `prefers-reduced-motion` it closes at once, as it opens.

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| `(keydown.enter)` and `(keydown.space)` on an interactive `ds-tag`, plus the `tabindex="0"` and `role="button"` set with them | the host is now a tab stop with `role="button"` and emits `toggled` on Enter or Space itself, so your handler and its `(toggled)` both fire on one press | nothing; the tag's own `toggled` |

## 0.14.5 — 2026-09-30

### Breaking

- **`ds-tooltip` is light on the light theme, with a border, like the chart tooltip.** It takes
  `--surface-overlay`, `--text-primary` and a `--border-default` border that runs round the
  caret, where it was `--surface-inverted` with `--text-inverted` and no border; on the dark theme
  it is a dark panel with a `--border-strong` border. Both tooltips read three new theme tokens,
  `--tooltip-bg-color`, `--tooltip-text-color` and `--tooltip-border-color`, and `ds-tooltip`
  gains the `--ds-tooltip-border-color` hook. To keep the inverted look, set
  `--ds-tooltip-bg-color: var(--surface-inverted)`, `--ds-tooltip-text-color: var(--text-inverted)`
  and `--ds-tooltip-border-color: transparent` on `:root`.

- **`ds-chart`'s `cursorPin` input is `pinOnClick`,** the name every other chart already uses, and
  its readback signal `cursorPinResolved()` is `pinOnClickResolved()`. There is no alias: rename
  both. `DS_CONFIG.chart.pinOnClick` still sets the default.

- **`ds-line-chart`'s `tooltipAnchor` takes `'reading'` where it took `'point'`.** The behaviour is
  unchanged: the panel hangs over the highest reading in the category. Replace
  `tooltipAnchor="point"`.

- **`LineChartSeries.area` and a `dsLineSeries` entry's `area` are `boolean | 'fade'`.** Code that
  reads `area` back as a boolean handles `'fade'` too; code that only sets it needs nothing.

- **A chart tooltip is light on the light theme.** The panel takes `--surface-overlay`,
  `--text-primary` and `--border-default`, where it was `--neutral-900` with white text; the
  dark theme keeps its dark panel. A reading's colour dot takes a ring only when its colour is
  close to the panel itself (below 1.5:1, the palest heat-map steps), where any dot below 3:1 took
  one. To keep the dark panel, set `--ds-chart-tooltip-bg-color: var(--neutral-900)`,
  `--ds-chart-tooltip-text-color: var(--neutral-0)` and
  `--ds-chart-tooltip-border-color: var(--neutral-700)` on `:root`.

- **A chart tooltip listing one reading shows no colour dot.** Under the default auto rule the
  tooltip now shows dots only when it lists two to four readings (was one to four); a single-reading
  tooltip drops its dot and the label alone carries the series. `tooltipSwatches` set to `true`
  still forces the dot on; set it to keep a dot on a one-reading tooltip.

- **Three chart tokens lose their declared defaults and fall back to `--ds-chart-bg-color`.**
  `--ds-chart-frame-bg-color`, `--ds-chart-focus-halo-color` and `--ds-chart-hatch-color` no longer
  declare a value; each resolves to `--ds-chart-bg-color` (default `var(--surface-default)`) unless
  you set it. The focus halo, which was white, is now the chart background. The hatched swatch in a
  chart tooltip reads `--ds-chart-hatch-color` with `var(--surface-default)` as its fallback, so
  `--ds-chart-bg-color` does not reach it. Setting any of the three
  still overrides as before; reading one in your own CSS, which used to resolve to its old default,
  now resolves to nothing.

- **Hovering a `ds-bar-chart` row label dims the other rows only when `dimOthers` is set.** A
  row-axis label used to dim the other rows on hover whatever `dimOthers` was; it now does so only
  when `dimOthers` is set on the chart (default `false`), matching the category-label behaviour on
  `ds-chart`. To keep the dimming, set `dimOthers`.

- **`ds-pie-chart` drops the `staggerMs` input.** It was accepted and did nothing; the ring turns
  into place as one object. Remove the binding, or a template that keeps it fails to compile.
  Nothing replaces it.

- **Subclassing a chart breaks on moved, grown and renamed members.** The inputs every chart shares
  (`caption`, `summary`, `frame`, `loading`, `error`, `emptyText`, `errorText`, `valueFormat`,
  `interactive`, `tooltipSwatches`, `tooltipLingerMs`, `pinOnClick`), their resolved signals and the
  protected `defaults` and `intl` move to an internal base class (`DsChartBase`) that `BarChartComponent`, `ChartComponent`,
  `ColumnChartComponent`, `FunnelChartComponent`, `HeatmapChartComponent`, `LineChartComponent`,
  `PieChartComponent`, `ScatterChartComponent` and `WaterfallChartComponent` extend, each dropping
  its own declaration of them. On top of that: `ChartComponent` loses `cursorPin` and
  `cursorPinResolved` and gains `pinOnClickResolved`; `BarChartComponent` loses `dimsOthers` and
  `hoveredLabel`; `LineChartComponent` loses `markAnchor`; `PieChartComponent` loses `staggerMs`;
  `SparklineComponent` gains `area`; `LineSeriesComponent` gains `fadeId`; `WaterfallChartComponent`
  gains `dimOthers` and `tooltip`; and the internal `ChartTooltipDirective` gains `host`. Build
  after upgrading; rename or mark `override` every member the compiler reports. Subclassing a DS
  component is unsupported.

### Added

- **`dsTooltipWhenClipped` applies the tooltip on its own.** A label that should disclose its
  own text when it is cut off takes the one attribute; the empty `dsTooltip` that had to sit
  beside it is no longer needed. `dsTooltip="..."` together with `dsTooltipWhenClipped` still
  shows that text, only while the host is clipped.

- **`ds-breadcrumbs` takes type, gap and clip-width tokens.** `--ds-breadcrumbs-font-size`
  (default `var(--font-size-s)`), `--ds-breadcrumbs-font-weight` (`var(--font-weight-regular)`),
  `--ds-breadcrumbs-current-label-font-weight` (`var(--font-weight-bold)`),
  `--ds-breadcrumbs-gap` (`var(--space-2)`), `--ds-breadcrumbs-label-max-width` (`16ch`) and
  `--ds-breadcrumbs-current-label-max-width` (`32ch`). Rendering is unchanged until one is set.

- **`--ds-chart-bg-color` paints the chart frame and every knockout.** A new token, default
  `var(--surface-default)`. It fills the frame background and every knockout cut into the plot:
  stacked line band separators, the line halo, the outlined line-marker ring, stacked-column hatch
  stripes, bar segment seams, reference-label and annotation halos, the pie centre-text
  knockout and the focus halo. Set it to the surface the chart sits on - a card, say - and the frame
  and every knockout match it. A second new token, `--ds-chart-plot-bg-color` (default
  `transparent`), fills the plot area of `ds-chart` and `ds-scatter-chart`.

- **`dsLineSeries` and `LineChartSeries` take `area: 'fade'`.** Beside `true` (a flat tint at
  `--ds-chart-area-opacity`, `0.16`), `area` now accepts `'fade'`: a vertical gradient from
  `--ds-chart-area-fade-opacity` (new, default `0.32`) at the line down to transparent at the
  baseline. A new optional `--ds-chart-area-color` overrides the fill colour, which otherwise
  follows the series colour.

- **`ds-sparkline` takes an `area` input.** A boolean attribute (default `false`) that fills flat
  under the line, tuned by `--ds-sparkline-area-color` (default the line colour) and
  `--ds-sparkline-area-opacity` (default `--ds-chart-area-opacity`).

- **`ds-heatmap-chart`, `ds-scatter-chart` and `ds-waterfall-chart` gain inputs from the shared
  chart base.** `ds-heatmap-chart` adds `summary` (an accessible summary of the chart) and
  `tooltipLingerMs`; `ds-scatter-chart` and `ds-waterfall-chart` add `tooltipLingerMs`, which holds
  a tooltip open the set number of milliseconds after the pointer leaves a mark (default from
  `DS_CONFIG.chart.tooltipLingerMs`).

- **`ds-waterfall-chart` takes `dimOthers` and `tooltip`.** `dimOthers` (boolean attribute, default
  `false`) dims the other steps while one is hovered; `tooltip` (`ChartItemTooltipTrigger`, default
  `'item'`) sets its tooltip trigger.

### Changed

- **A chart tooltip picks up `--ds-chart-tooltip-*` set on the chart.** `--ds-chart-tooltip-bg-color`,
  `--ds-chart-tooltip-text-color` and `--ds-chart-tooltip-border-color` set on a chart element or
  any ancestor now reach the panel; the tooltip copies them onto its overlay pane each time it
  opens. Before, only `:root` reached it, because the panel renders in an overlay outside the chart.

- **A chart with no `data` renders its empty state instead of throwing.** `data` on `ds-bar-chart`,
  `ds-column-chart`, `ds-funnel-chart`, `ds-pie-chart` and `ds-sparkline`, and `categories` and
  `series` on `ds-line-chart`, are optional and default to empty; omitting one now shows the empty
  state, where a missing required input used to throw NG0950. `ds-scatter-chart`, `ds-heatmap-chart`
  and `ds-waterfall-chart` already treated their data as optional.

### Fixed

- **A `dsLineSeries` with `tooltip="axis"` opens its panel under the default `cursor`.**
  `cursor="auto"` turned the category cursor on only for two or more marks that show a tooltip,
  so a plot whose one tooltip-showing mark was an axis-tooltip line answered nothing until
  `cursor="category"` was set. `auto` now turns it on for any mark with `tooltip="axis"`.

- **Several `provideDsConfig` calls in one `providers` array all apply.** The last one replaced
  the others, whose keys were lost without a warning; they now merge in order, the later call
  winning per key. `provideDsIntl` merges the same way.

- **`ds-table`'s `exportCsv()` and `runExport()` warn when the table has no `dsTableExport`.**
  In a development build either call threw NG0203 from the click handler that made it; it now
  logs the missing directive. Production builds were unaffected.

- **A clipped `ds-breadcrumbs` label shows its full text in a tooltip.** A crumb label past `16ch`
  (the current page past `32ch`) ended in an ellipsis with no way to read the rest; hovering it, or
  focusing its link from the keyboard, now opens a tooltip with the whole label. A label that fits opens none.

- **A modified or non-primary click on a `ds-breadcrumbs` link opens it the browser's way.** Every click
  was prevented and emitted as `(navigate)`, so a consumer routing on it moved the current tab where
  the user asked for a new tab or window. A plain primary click still emits `(navigate)` with the
  default prevented; a Ctrl, Cmd, Shift or Alt click and any non-primary button leave `href` to the
  browser and emit nothing.

- **A `dsTooltip` with no room on its side opens on the opposite side.** The panel had one
  position, so a tooltip on a trigger near the top of the viewport (a page breadcrumb, a toolbar)
  opened above it, ran off the screen and pointed its arrow into the trigger. It now flips to the
  opposite side when the preferred one does not fit, keeps 8px from the viewport edge, and turns
  its arrow to the side it opened on.

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| an empty `dsTooltip` attribute next to `dsTooltipWhenClipped` | `dsTooltipWhenClipped` applies the tooltip directive by itself | nothing; keep a `dsTooltip` that carries text |
| `--ds-chart-tooltip-bg-color`, `--ds-chart-tooltip-text-color` and `--ds-chart-tooltip-border-color` set to light surface and text colours so the tooltip matches a light page | the panel takes `--surface-overlay`, `--text-primary` and `--border-default` by default | nothing; keep an override that sets any other colour |
| `--ds-chart-frame-bg-color` set on a chart only to match the surface behind it | `--ds-chart-bg-color` paints the frame and every knockout together | `--ds-chart-bg-color` set to that surface; keep `--ds-chart-frame-bg-color` only to colour the frame apart from the knockouts |
| `cursor="category"` on a `ds-chart` set only so a `tooltip="axis"` line opens its panel | `cursor="auto"` turns the category cursor on for a mark with `tooltip="axis"` | nothing; keep it on a plot whose marks do not use `tooltip="axis"` |

## 0.14.4 — 2026-09-29

### Breaking

- **A chart answers a resting pointer at once.** `DS_CONFIG.chart.hoverDelayMs` now defaults to
  `0` (was `500`): a chart shows its tooltip, highlight, dimming, category cursor, legend entry,
  heat-map scale step, funnel stage row, pie legend, bar row label and scatter point the moment the
  pointer comes to rest, with no wait. To restore the wait, set
  `provideDsConfig({ chart: { hoverDelayMs: 500 } })`.

- **A chart tooltip lingers after the pointer leaves a mark.** `DS_CONFIG.chart.tooltipLingerMs`
  now defaults to `500` (was `0`), as does the per-series `tooltipLingerMs` on `dsColumnSeries` and
  `dsLineSeries`: the tooltip stays 500 ms after the pointer leaves a mark and glides to the next
  mark it reaches within that window. The highlight, the dimming and the category cursor have no
  hide delay. To dismiss the tooltip the instant the pointer leaves, set
  `provideDsConfig({ chart: { tooltipLingerMs: 0 } })`.

- **A chart tooltip drops its colour swatches once it lists five or more readings.** By default the
  tooltip now shows a colour dot beside each series only when it lists four readings or fewer; from
  five up the dots are dropped and the labels alone carry the series (was: always shown). A new
  `tooltipSwatches` input (`boolean | null`, default `null`) on `ds-chart`, `ds-bar-chart`,
  `ds-column-chart`, `ds-funnel-chart`, `ds-pie-chart`, `ds-heatmap-chart`, `ds-scatter-chart`,
  `ds-waterfall-chart` and `ds-line-chart` forces the dots on with `true` or off with `false`, and
  `DS_CONFIG.chart.tooltipSwatches` sets the default for every chart. To keep dots on every tooltip,
  set `tooltipSwatches` on the chart or `provideDsConfig({ chart: { tooltipSwatches: true } })`.

- **Hovering a category label dims the other columns only when `dimOthers` is set.** A category-axis
  label used to dim the other columns on hover, like a legend entry; it now does so only when
  `dimOthers` is set on the chart. To keep the dimming, set `dimOthers`.

- **`ds-line-chart` honours `tooltip="item"` and `tooltip="none"`.** Both settings previously still
  opened the all-series category panel and band; now `"item"` shows per-marker tooltips with no
  category band and `"none"` shows no tooltip. `"axis"` (the default) is unchanged. To keep the
  all-series panel, use `tooltip="axis"`.

- **Subclassing one of these breaks on a name collision.** `BarChartComponent`,
  `ColumnChartComponent`, `FunnelChartComponent`, `HeatmapChartComponent`, `PieChartComponent` and
  `WaterfallChartComponent` each gained `tooltipSwatches`; `ChartComponent` gained `tooltipSwatches`
  and `tooltipSwatchesResolved`; `LineChartComponent` gained `tooltipSwatches` and `plotCursor`;
  `ScatterChartComponent` gained `tooltipSwatches`, `hoveredIndex`, `nearestMark`, `onCanvasLeave`
  and `onCanvasPointer` and lost `onPointOver` and `onPointOut`; `ColumnSeriesComponent` gained
  `soleSeries` and `slotStepPx` and lost `dimsFromLabel` and `slotBandPx`; the internal
  `ChartTooltipPanelComponent` gained `showsSwatches` and `swatches`; and the internal
  `ChartTooltipDirective` gained `dsChartTooltipSwatches`, `glide` and `glideFrom`. The `min` and
  `max` inputs of `HeatmapChartComponent` and the `max` and `maxSecondary` inputs of
  `LineChartComponent` now carry a `numberAttribute` transform with the write type still
  `number | null`, so a subclass that redeclares one compiles unchanged, and `tooltipLingerMs` on
  `ColumnSeriesComponent` and
  `LineSeriesComponent` defaults to `500`. Build after upgrading; rename or mark `override` every member the
  compiler reports colliding. Subclassing a DS component is unsupported.

### Added

- **`ds-sparkline`, a word-sized trend line for a table cell or a stat.** One `svg` with no axes,
  gridlines, legend or frame and a dot on the last reading. `scale` is `'data'` (the readings' own
  min..max, default) or `'zero'`; a `null` in `data` breaks the line. A tooltip names the reading
  under the pointer, on by default and off with `[tooltip]="false"`; with the tooltip on and a
  `label` set, the sparkline is a tab stop whose arrow keys, Home and End move it. Sized by
  `--ds-sparkline-width` and `--ds-sparkline-height`, 80×24 by default. Import from
  `@ids-group-ltd/ids-design-system/components/sparkline`.

- **`dsColumnSeries` takes a `soleSeries` input.** A boolean attribute (default `false`) that draws
  an offsets series as a single series rather than a stack, so each mark catches the full plot
  height at its category. `ds-waterfall-chart` sets it.

### Changed

- **A chart tooltip glides between marks.** When the tooltip moves from one mark to the next it now
  translates across the plot instead of jumping. Two tokens tune it:
  `--ds-motion-chart-tooltip-move-duration` (`300ms`, `0ms` under reduced motion) and
  `--ds-motion-chart-tooltip-move-easing` (`var(--ease-standard)`). A duration of `0` removes the
  glide; a tooltip re-aimed mid-glide sets off from where it is on screen.

- **A scroll closes an unpinned chart tooltip.** Scrolling the window or an ancestor scroll
  container now dismisses an open, unpinned chart tooltip, where it used to reposition and follow
  its mark; a scroll inside the tooltip or in an `input`, `textarea` or `select` does not. A pinned
  tooltip still repositions and stays.

- **A captionless chart no longer reserves top padding for the Unpin control.** The control floats
  over the top end of the plot, and the chart keeps its height when a mark is held. A captioned
  chart is unchanged, its control on the caption line.

- **`ds-heatmap-chart`'s `min` and `max` and `ds-line-chart`'s `max` and `maxSecondary` coerce a
  static attribute.** Written as `min="0"` they now pass through `numberAttribute` and hold a number;
  before, they held the string. Their write type is still `number | null`, so under
  `strictTemplates` the static attribute fails with TS2322 as before; keep `[min]="0"` there.

### Fixed

- **A toast's announcement stays off screen before any dialog has opened.** `ToastService` speaks
  through the CDK `LiveAnnouncer`, whose region carries `.cdk-visually-hidden`, and the CDK loads that
  rule only with a dialog or a focus trap. On a page where neither had opened yet, the first toast's
  text also rendered as plain text at the bottom-left. `styles/toast-overlay`, which `styles/ds`
  forwards, now declares the rule.

- **A chart answers the pointer across the whole plot, not only over a drawn mark.** In `ds-chart`
  and `ds-column-chart` the gap between column bands was dead ground; hit strips now tile the whole
  category step, so every point of the plot answers its nearest category. A `ds-waterfall-chart`
  step answers at any height of the plot in its category, not only over its drawn bar. A
  `ds-heatmap-chart` cell's hit area now spans half the gap on each side, where the gap between
  cells answered nothing. A `ds-scatter-chart` point answers when the pointer is within 16 screen
  pixels of its centre, where before only its own small shape did; this is not configurable and
  keyboard selection is unchanged.

- **A hovered heat-map colour-scale step shows it.** The colour-scale step under the pointer grows
  to 1.75x its height; before, nothing on the step changed.

- **A hovered funnel stage-table row is tinted edge to edge.** The row highlight now spans the full
  row, using `--ds-chart-legend-hover-bg-color` and `--ds-chart-legend-hover-text-color`.

- **A `ds-funnel-chart`'s entrance no longer flashes a vertical scrollbar.** The figure now clips
  vertical overflow, so stage rows rising during the entrance animation no longer overshoot or
  flash a vertical scrollbar; horizontal scrolling is kept.

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| an app-level `@include cdk.a11y-visually-hidden()` or `a11y-prebuilt.css` added so toast announcements stay hidden | `styles/toast-overlay` declares `.cdk-visually-hidden` | nothing; keep it where the app loads neither `styles/ds` nor `styles/toast-overlay` |
| `DS_CONFIG.chart.hoverDelayMs: 0` set so charts answer a resting pointer at once | `0` is the default | nothing |

## 0.14.3 — 2026-09-27

### Breaking

- **Subclassing one of these breaks on a name collision.** `DrawerComponent`,
  `BottomSheetComponent`, `ColorPickerComponent` and `TimePickerComponent` gained `preview`,
  `DatePickerComponent` gained `preview` and `selectedAnchorDate`, `TextareaComponent` gained
  `countTrimmed` and `countedRange`, and `TooltipDirective` gained `dsTooltipTextSelector`,
  `hostElement`, `isClipped`, `onKeydown` and `textElement`. Build after upgrading; rename or mark
  `override` every member the compiler reports colliding. Subclassing a DS component is unsupported.

- **The `scrollable` arrows of `ds-tabs` take the active tab colour on hover, over a lighter
  surface.** A hovered arrow colours its chevron as the selected tab's label (`--accent` by
  default, `--secondary-strong` under `secondary`, the pill label colour in `pills`) over a
  `--surface-secondary` fill, where it was `--text-primary` over `--surface-muted`. Two new hooks set
  them: `--ds-tabs-scroll-arrow-icon-color-hover` and `--ds-tabs-scroll-arrow-bg-color-hover`. The
  arrow no longer reads `--ds-tab-label-color-hover`, so an override of it meant for the arrows
  moves to `--ds-tabs-scroll-arrow-icon-color-hover`.

### Added

- **`ds-drawer`, `ds-bottom-sheet`, `ds-date-picker`, `ds-time-picker` and `ds-color-picker` take a
  showcase-only `staticPreview` input.** Set, the component renders its panel open in the page
  flow: the drawer and sheet with no scrim, fixed positioning, enter animation, scroll lock or focus
  trap, the three pickers under their trigger instead of in an overlay, showing the bound `value`,
  with no focus trap and no close on Escape or an outside click. Closing does nothing and the
  trigger does not toggle. It is for static documentation specimens, like the same input on
  `ds-modal`, `ds-popover` and `ds-select`, and is not part of the production contract. Off by
  default; nothing changes for a component that does not set it.

- **`[dsTooltip]` takes a `dsTooltipTextSelector` input.** Given a selector, `dsTooltipWhenClipped`
  tests the matching element inside the host for clipping and discloses its text, while the host
  stays the area that opens the tip on hover. Put the directive on a whole row, point it at the
  label inside, and the tip opens wherever the row shows its hover state. Off by default: without
  it the host is both.

- **`ds-textarea` takes a `countTrimmed` input.** Set, the character counter, the soft-limit state
  and the highlight of the excess leave whitespace at either end of the text out, so a value the
  server stores trimmed counts as the server counts it: 3990 characters followed by 20 spaces read
  `3990/4000` and are within a limit of 4000. Whitespace between words still counts, so a
  character typed after those spaces brings them into the count. The native `maxlength` of
  `maxLengthMode="hard"` still counts every character. Off by default.

### Changed

- **The over-limit characters of a soft-limit `ds-textarea` are highlighted in a stronger red**,
  from a new semantic role, `--error-highlight`: `--red-300` in light and `hsl(0deg 38% 40%)` in
  dark (was `--error-muted-strong`). The text keeps its colour, at 7.5:1 over the highlight in
  light and 6:1 in dark with the default text colour. Set `--error-highlight` to retune the
  highlight; `--error-muted-strong` no longer reaches it.

### Fixed

- **A clipped label shows its tooltip wherever its control shows hover.** In `ds-select`,
  `ds-multi-select` and `ds-autocomplete` the tip of an option opened only over the label text,
  while the row highlighted across its padding, icon, checkbox and check mark; it now opens from
  the whole row, the create row of `ds-autocomplete` included. The `ds-select` trigger's tip opens
  from the whole field, not only its text, and a `truncate` cell of `ds-table` opens from the whole
  cell, padding included.

- **A clipped `dsTooltipWhenClipped` tooltip opens on keyboard focus, and only from a control.** A
  host that takes focus itself opens its tip when Tab lands on it, not on a mouse click, and closes
  on any key; before, it opened on any focus, a mouse click included, and stayed open while keys were
  pressed. A host that cannot take focus opens when Tab lands on its nearest focusable ancestor, and
  that ancestor now has to be a control: a native `a[href]`, `button`, `input`, `select`, `textarea`
  or `summary`, a plain table row, or an element with the role `button`, `link`, `tab`, `option`,
  `menuitem`, `menuitemcheckbox`, `menuitemradio`, `row`, `gridcell`, `combobox`, `checkbox`,
  `radio`, `switch` or `treeitem`. A focusable container around it, such as a `ds-tabs` panel, a
  scroll region or a `div` with `tabindex="0"`, opened the tip of the first clipped value inside it
  and opens nothing now; the search stops at that first focusable ancestor rather than reaching a
  control further out. A role-less element with a `tabindex` that acts as a control, like a clickable
  card, discloses again once it carries its role. Hover is unchanged.

- **A `ds-table` wider than its container no longer widens the page.** The hidden header label of
  a column that sets `screenReaderLabel` and no `label` was left out of the table's horizontal
  clip, so with that column past the container's edge the page gained a horizontal scroll as wide
  as the table. The table's scroll box is now `position: relative`: every visually hidden label in
  the table is clipped with the rows and scrolls with them. An element positioned absolutely inside
  a cell template with no positioned ancestor of its own now resolves against that scroll box.

- **A filterable picker announces its result count.** `ds-autocomplete` and a `ds-multi-select`
  with its search field shown removed their live region from the page the first time they opened,
  so no count ever reached a screen reader. They now announce the count on opening and each time
  typing changes the list ("4 results", "No results"). A `ds-select`, and a `ds-multi-select` whose
  search field is not shown, announce no count: nothing is filtered there, and the listbox already
  conveys its size.

- **The `scrollable` arrows of `ds-tabs` sit on the tab label line.** Where a strip's tabs pad the
  bottom more than the top, as `--ds-tab-padding-top` and `--ds-tab-padding-bottom` allow, each
  chevron sat below the labels and its hover surface ran to the divider; the chevron now shares the
  label's centre line and the hover surface is centred on it, inside the strip. With the default
  padding the arrows look as before. In the `pills` variant the hover surface matches a pill's
  height and radius instead of filling the strip.
## 0.14.2 — 2026-09-25

### Breaking

- **A click on a chart mark holds it by default.** `pinOnClick` on `ds-bar-chart`, `ds-column-chart`,
  `ds-funnel-chart`, `ds-line-chart`, `ds-pie-chart`, `ds-heatmap-chart`, `ds-scatter-chart`,
  `ds-waterfall-chart` and the `dsColumnSeries` / `dsLineSeries` marks, and `cursorPin` on
  `ds-chart`, now default to `null` and fall back to `DS_CONFIG.chart.pinOnClick`, then `true` (was
  `false`). A pointer click or tap now holds the mark - its tooltip and highlight stay after the
  pointer leaves and it shows a pin disc on itself - until a second click, Escape or a press elsewhere
  lets go; keyboard focus reaches a mark without pinning it (on a heat map, Enter or Space focus a
  cell, a click pins). `pointClicked` fires either way. To keep marks unheld, set
  `pinOnClick="false"` (`cursorPin="false"` on `ds-chart`) on the one chart, or
  `DS_CONFIG.chart.pinOnClick: false` for all.

- **A chart answers a resting pointer after 500 ms.** The tooltip, the highlight and the dimming of a
  mark, the category cursor, a legend entry, a heat map scale step and a bar's label wait
  `DS_CONFIG.chart.hoverDelayMs` (default `500`) of rest before they show (was: at once). Once a chart
  has answered, the next mark answers at once until the pointer leaves it; touch, keyboard focus, a
  pin and a delay of `0` answer at once. To answer at once, set `DS_CONFIG.chart.hoverDelayMs: 0`. A
  test that hovers a mark and asserts on its tooltip in the same tick waits the delay, or sets it to
  `0`.

- **`pinOnClick` and `ds-chart`'s `cursorPin` are `boolean | null`** (was `boolean`), `null` meaning
  unset, on `ds-bar-chart`, `ds-column-chart`, `ds-funnel-chart`, `ds-line-chart`, `ds-pie-chart`,
  `dsColumnSeries` and `dsLineSeries`. Binding them in a template is unaffected. Code that reads the
  raw input back, or a subclass overriding it, must handle `null`, which falls back to
  `DS_CONFIG.chart.pinOnClick` and then `true`; `dsColumnSeries` and `dsLineSeries` expose the result
  as `pinOnClickResolved()`, `ds-chart` as `cursorPinResolved()`. A reader testing `pinOnClick()` for
  truthiness now sees `null` on an unset chart that does pin, and takes the other branch with no
  compile error.

- **Under the category cursor, the category's drawn band is the one hover area.** The pointer anywhere
  in the band opens the band and its single category tooltip together; the gap between two bands
  answers nothing; a `dsColumnSeries` column or `dsLineSeries` mark under the cursor no longer opens a
  per-mark panel on hover (focus and click still do). This is a `ds-chart` with `cursor="category"`,
  or `"auto"` on two or more marks that show a tooltip; the column, line and waterfall presets draw no
  category cursor and are unaffected. To keep a per-mark hover panel there, set `cursor="none"` on that
  `ds-chart`. A hand-composed mark reads `CHART_SCALES.cursorOn` to leave pointer hover to the band.

- **Chart entrances are slower and staged.** `--ds-motion-chart-mark-enter-duration` is `400ms` (was
  `180ms`) and `--ds-motion-chart-mark-enter-easing` is `--ease-emphasized-decelerate` (was
  `--ease-decelerate`). Columns, bars and waterfall steps grow out of their baseline over the grow
  duration with no fade; a solid line draws on and a dashed one fades; an area fades in under its line;
  the pie ring turns into place; funnel stages rise in; scatter points and line markers settle about
  their centre; heat map cells fade in column by column, having not animated before. Value labels,
  markers, table rows and legend swatches follow once their mark has arrived. Under reduced motion
  every mark appears at once, delays included. A test that waits a fixed time for a chart to finish
  arriving waits about 1.1s, or runs under reduced motion. To bring back the old enter timing:
  `--ds-motion-chart-mark-enter-duration: var(--duration-base); --ds-motion-chart-mark-enter-easing:
  var(--ease-decelerate);` - growing and sweeping marks follow `--ds-motion-chart-mark-grow-duration`
  and `--ds-motion-chart-mark-sweep-duration` instead.

- **`staggerMs` defaults to `40` on `ds-bar-chart`, `ds-column-chart`, `ds-line-chart`,
  `dsColumnSeries` and `dsLineSeries`, and to `60` on `ds-funnel-chart`** (was `0`); `ds-pie-chart` is
  unchanged, and `ds-heatmap-chart` and `ds-waterfall-chart` gain the input at `40`. A long series
  narrows its step so the whole arrival fits within 260ms, rather than stopping at a 300ms cap after
  which every later mark landed at once. To have a series arrive all at once, set `staggerMs="0"`. A
  visual regression test that screenshots a chart a fixed time after it renders now catches later
  marks still arriving.

- **A custom pagination `range` or table `[rangeAnnouncement]` receives zeros on an empty list.**
  `ds-pagination` on an empty list now calls `DS_INTL.pagination.range(0, 0, 0)` (was `(1, 0, 0)`),
  and a paged `ds-table` with no empty-state text now calls its `[rangeAnnouncement]` with `(0, 0, 0)`
  (was never called on an empty table). A formatter that prints first and last unconditionally now
  shows a range of 0 to 0, on the pager and in the table's live-region announcement; guard
  `total === 0` and return your empty-list wording, or, on the table, an empty string to stay silent.
  The default wording returns `Showing 0 of 0`, so an app that never overrides the range text has
  nothing to do.

- **`DsIntl` gains a required key: `field.overLimit: (excess: number) => string`.** A complete
  `DsIntl` dictionary, or a complete `field` section of one, declared as a typed object stops
  compiling until it lists it. Overrides passed to `provideDsIntl` are partial and need nothing.

- **A horizontal `ds-description-list` stacks every item once a value would get less than
  `--ds-description-list-value-min-width`** (default `14rem`, 224px at a 16px root). Each item is a
  wrapping flex row (was: a two-column grid): when the value column would fall below the minimum,
  the label moves above the value (was: the value squeezed beside the label and broke mid-word). The
  label keeps the label width there, so a longer label still wraps at it, where
  `orientation="stacked"` gives the label the full row. Every item of a list switches at the same
  list width, label width + column gap + value minimum: 364px with
  the defaults, 428px with a 180px label and a 24px gap. `orientation="stacked"` is unchanged, and a
  `ds-description-item` outside a list switches the same way at its own width. In a parent that
  sizes to its content - an inline-block, a float, an absolutely positioned box, a flex row item
  with an auto basis, an `auto` grid track - a list whose widest value is narrower than the minimum
  now stacks; give the list or its parent a width, or lower `--ds-description-list-value-min-width`
  on it. To stack later or earlier, set `--ds-description-list-value-min-width` on the list.

- **Subclassing one of these breaks on a name collision.** `BarChartComponent`, `ChartComponent`,
  `ColumnSeriesComponent`, `LineSeriesComponent`, `FunnelChartComponent`, `HeatmapChartComponent`,
  `PieChartComponent`, `ScatterChartComponent` and `WaterfallChartComponent` gained the pinning,
  hover-delay, label-highlight and stagger members; `ColumnChartComponent` and `LineChartComponent`
  only had `pinOnClick` change type; `PaginationComponent` gained `empty`, `TableComponent` gained
  `emptyCell` and `emptyCellText`, `TooltipDirective` gained `detachAncestor`, `disclosesOwnText` and
  `listenToFocusableAncestor`, `TextareaComponent` gained `describedBy`, `maxLengthMode`,
  `nativeMaxLength`, `overflowMirror`, `overflowParts`, `overLimitBy` and `syncOverflowScroll`, and
  `TabsComponent` gained `tablist`, `scrollsHorizontally`, `overflowing`, `showScrollArrows`,
  `canScrollPrevious`, `canScrollNext`, `updateScrollArrows` and `scrollPage`; and three classes
  reachable only through their own entry points gained members too - the internal
  `ChartLegendComponent`, the internal `ChartTooltipPanelComponent` and the internal
  `WaterfallMarksComponent`. Five protected members of `ColumnSeriesComponent` are
  gone: `pinDiscRadius`, `pinGlyph`, `pinGlyphOffset`, `pinGlyphSize` and `slotStepPx`. Build after
  upgrading; rename or mark `override` every member the compiler reports colliding, and delete an
  override whose base member is gone. Subclassing a DS component is unsupported.

### Added

- **A `scrollable` `ds-tabs` strip shows previous and next arrows while tabs lie beyond its edges.**
  Each arrow turns the strip by a page of tabs and hides at its own edge; a strip that fits shows
  none. The strip scrolls smoothly unless reduced motion is set, on an arrow and when a selected tab
  comes into view. The arrows sit outside the tab order and are hidden from assistive technology,
  because the arrow keys already bring the selected tab into view; a click on one leaves focus where
  it was. A scrollable horizontal `ds-tabs` host is a grid: the arrows sit either side of the tab
  list, and the panel spans the row below.

- **`maxLengthMode` on `ds-textarea`.** `'hard'` (the default) keeps the native `maxlength`: typing
  and paste stop at `maxLength`. `'soft'` lets the text run past it: the counter turns red, the
  characters past the limit are highlighted inside the field, and the field reports `aria-invalid`
  with the counter, which reads out the excess, as its description. Both modes count `value.length`,
  whitespace included. A soft limit does not block a submit: validate the length in the form. The type
  is `TextareaMaxLengthMode`, and `DS_INTL.field.overLimit(excess)` words the excess (default
  `120 characters over the limit`).

- **`DS_CONFIG.chart.pinOnClick` and `DS_CONFIG.chart.hoverDelayMs`.** Across every chart,
  `pinOnClick` (default `true`) sets whether a click holds a mark and `hoverDelayMs` (default `500`)
  how long a resting pointer waits before the chart answers.

- **`pinOnClick` on `ds-heatmap-chart`, `ds-scatter-chart` and `ds-waterfall-chart`.** A
  `boolean | null` input (default `null`, falling back to `DS_CONFIG.chart.pinOnClick`, then `true`)
  that none of the three had, with the Unpin control the other charts show.

- **`staggerMs` on `ds-heatmap-chart` and `ds-waterfall-chart`** (default `40`): the heat map
  staggers its columns, the waterfall its steps. Heat map cells fade in column by column, having not
  animated before.

- **Chart entrance tokens.** `--ds-motion-chart-mark-grow-duration` (600ms) and
  `--ds-motion-chart-mark-grow-easing` (`--ease-settle`) time a mark growing out of its baseline;
  `--ds-motion-chart-mark-sweep-duration` (600ms) a ring turning in or a line drawing on;
  `--ds-motion-chart-mark-detail-duration` (180ms) what follows a mark, its value label or marker. They
  sit on three new primitives: `--duration-slowest` (600ms, 0ms under reduced motion),
  `--ease-emphasized-decelerate` and `--ease-settle`, a critically damped spring that never
  overshoots.

- **`--ds-description-list-value-min-width`** (default `14rem`): the narrowest value a horizontal
  `ds-description-list` keeps beside its label before every item stacks.

### Changed

- **The Unpin control sits at the top end of a chart, on its caption's line** (was: floating over the
  bottom centre, where it covered axis labels, legends and tables). While it shows, a caption leaves
  room for it and a chart with no caption gains the line, so it covers nothing.

- **A held mark always shows its pin disc**: a column, a bar, a slice, a funnel stage, a heat map
  cell, a scatter point, a line marker, and a category held under the category cursor (a disc at the
  foot of its band).

- **The pointer cursor appears where a click does something**: over a mark a click would hold, a mark
  set `interactive`, and a category band under the category cursor when a press holds it. The gap
  between two bands keeps the default cursor.

- **Naming a series or a category highlights it on every chart, and the dimming follows the answered
  mark.** A legend entry dims the other series as before; a `ds-funnel-chart` stage row dims the other
  stages whatever `dimOthers` says; a heat map's scale step dims every cell outside that step; a bar's
  label, and a `ds-chart` category label on the axis without the category cursor (`ds-waterfall-chart`
  included), dim the other bars. `dimOthers` follows the mark the chart has answered rather than the
  raw hover, so the fade waits out the hover delay with the tooltip and follows focus. A hand-composed
  mark reads `CHART_SCALES.categoryLabelHover` and `CHART_SCALES.hoverDelayMs` to answer the same way.

- **A column's hover area stops at its own category band** (was: the whole step to the next column),
  so the gap between two columns answers no pointer.

- **A chart tooltip fades in rather than scaling in**, so its rows no longer drift into place each
  time it opens on another mark. `--ds-overlay-enter-keyframes` still overrides it; every other
  overlay keeps its scale.

- **A category tooltip lists its readings top to bottom, in the order their marks are drawn at that
  category** (was: the order the series were declared). The legend keeps the declared order. A
  hand-composed mark that reports its readings through `CHART_SCALES` places each one by its `y`, its
  height in plot pixels from the top; a reading without it follows the placed ones in declared order.

- **A hatched column's stripes run from bottom left to top right, and the tooltip swatch's stripe runs
  the same way.** Width, colour and repeat are unchanged.

- **A tooltip swatch is ringed only when its colour would vanish into the panel.** A swatch below 3:1
  contrast against the tooltip background takes a 1.5px ring in the tooltip's text colour, drawn inside
  the 12px dot; every other swatch has no ring (was: every swatch, ringed outside the dot in the
  surface colour). The check follows the theme, so a colour ringed on the light panel can go unringed
  on the dark one.

### Fixed

- **A tap that pins a mark on a touch screen stays pinned.** The click a browser sends after the tap
  no longer unpins it.

- **Under the category cursor, focus on a column names its category, and focus leaving clears it.**
  Focusing a `dsColumnSeries` column opens the band and the category panel, as focusing a
  `dsLineSeries` marker already did, and focus leaving a column or a marker takes the band and the
  panel down (was: they stayed on screen after focus had gone).

- **A `ds-bar-chart` bar grows out of its value axis in a right-to-left page** (was: from the far
  end).

- **The `dsTooltip` panel wraps a value with no break opportunity.** A long file name or id ran past
  the panel's edge on one line; it now breaks inside the panel's max width.

- **`ds-select`, `ds-autocomplete` and `ds-multi-select` disclose a clipped label.** `ds-select` shows
  its trigger value and option labels, `ds-autocomplete` its option and create labels, and
  `ds-multi-select` its option labels in a tooltip when an ellipsis cuts one off; a label that fits
  shows none.

- **A clipped label inside a button or a clickable row discloses on keyboard focus.** A
  `dsTooltipWhenClipped` host that cannot take focus opened on hover only. It now also opens when
  keyboard focus lands on its nearest focusable ancestor, and closes on that ancestor's blur, click or
  any key; a mouse click opens nothing, an ancestor focusable only through a negative `tabindex`
  (such as a `<main tabindex="-1">` that takes focus on navigation) opens nothing, and of several
  clipped hosts in one ancestor only the first opens. This covers `ds-select`'s trigger value and
  `ds-table`'s clipped cells in an interactive row. A plain `dsTooltip` without
  `dsTooltipWhenClipped` on a non-focusable element stays hover-only.

- **A clipped-text tooltip is read once by a screen reader.** A `dsTooltipWhenClipped` tip whose text
  the host already contains set `aria-describedby` on the focused element, so the text was announced
  as its name and again as its description. It now sets none, on a focusable host or its ancestor; a
  tip given a `dsTooltip` that says more than the host still describes it, as does a plain
  `dsTooltip`. A test asserting `aria-describedby` on a clipped disclosure finds none.

- **`ds-pagination` handles an empty list.** With `total` at `0` the range read `Showing 1-0 of 0` and
  page 1 was marked current; it now reads `Showing 0 of 0`, disables every button, Previous and Next
  included, and marks none current.

- **A paged `ds-table` announces an emptied table.** Its live region went silent when a filter or new
  data left the table with no rows; it now announces the table's empty state - the `[empty]` content
  or `emptyTemplate` text - or, with no empty-state text, its range announcement (`Showing 0 of 0` by
  default).

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| a `pinOnClick`, `pinOnClick="true"` or `[pinOnClick]="true"` binding on a chart or a `dsColumnSeries` / `dsLineSeries` mark | a click holds a mark by default, so a binding of `true` restates it | nothing; keep it where `DS_CONFIG.chart.pinOnClick` is `false` and this chart is the exception |
| a `cursorPin`, `cursorPin="true"` or `[cursorPin]="true"` binding on `ds-chart` | a press holds the category cursor by default, so a binding of `true` restates it | nothing; keep it where `DS_CONFIG.chart.pinOnClick` is `false` and this chart is the exception |
| a `[title]=` or `[attr.title]=` on a `ds-select`, `ds-autocomplete` or `ds-multi-select` that repeats the selected or option label | the picker shows a clipped label in full in a tooltip, so the title adds a second, native one | nothing; a `title` that says more than the label stays legitimate |
| an `[orientation]` on `ds-description-list` switched on a viewport breakpoint, such as `'stacked' : 'horizontal'`, only to stack a narrow list | a horizontal list stacks by itself once a value would get less than `--ds-description-list-value-min-width` | `--ds-description-list-value-min-width` on the list where the switch has to move; keep a switch driven by something other than width |

## 0.14.1 — 2026-09-24

### Breaking

- **`ds-chart`'s `cursor` gains `'auto'` and defaults to it.** The type is `'none' | 'category' | 'auto'`
  (was `'none' | 'category'`) and the default is `'auto'` (was `'none'`). `'auto'` draws the category
  cursor on a plot of two or more marks that show a tooltip, and no cursor otherwise. On such a plot
  the pointer anywhere in a category now opens one panel naming every mark's reading instead of the
  per-mark panel; set `cursor="none"` to keep per-mark. Code that reads `ChartComponent.cursor()`
  back through a `viewChild`, a `#chart="dsChart"` reference or a subclass must handle `'auto'`. The
  `ds-column-chart`, `ds-line-chart` and `ds-waterfall-chart` presets are unaffected.

- **The chart tooltip's `preferBelow` steering is gone; a held panel opens above its mark.**
  `ChartComponent.tooltipPreferBelow` is now `tooltipPinned`, and the internal
  `ChartTooltipDirective` drops `dsChartTooltipPreferBelow` for `dsChartTooltipPinned`. Delete every
  `[dsChartTooltipPreferBelow]` binding. A custom mark that hands `CHART_SCALES.reportTooltip` a
  source renames its `preferBelow` field to `pinned`; a `pinned` panel's pane takes the pointer. A `preferBelow` reached through a variable still compiles and is ignored. The
  library's own charts need nothing.

- **`--ds-chart-hatch-width` defaults to `1.5px` (was `3px`), and the stripe runs down the middle of
  its tile.** The hatch slants from top left to bottom right, and the tooltip swatch draws its stripe
  at the same angle and width. The default draws the same stripe as before. A stylesheet that sets
  `--ds-chart-hatch-width` halves the value to keep its stripe (`--ds-chart-hatch-width:
  calc(<your value> / 2)`); an override left at `3px` now draws a 3px stripe in the 8px repeat and
  reads as a paler mark. The default ships in `styles/tokens-charts`, which `styles/ds` forwards.

- **`ds-auth-layout`'s `landmark` defaults to `'main'` (was `'none'`).** A standalone sign-in page
  needs nothing; its card is now the main landmark on its own. Add `landmark="none"` to every
  `ds-auth-layout` rendered inside a `<main>` or a `role="main"` element, `ds-app-layout`'s content
  included, or the page exposes two main landmarks. Remove a now-redundant `landmark="main"`.

- **`ds-auth-layout`'s generated lockup matches `ds-sidenav`'s rail.** The wordmark is 18px (was
  22px) and the letter-mark tile is a fixed 28px (was 24-32px by viewport height), so the tile no
  longer compresses on a short viewport and a card that just fitted a landscape phone can scroll by
  4px. Two hooks size the type: `--ds-auth-layout-brand-name-font-size` (18px) and
  `--ds-auth-layout-mark-font-size` (16px). To keep the old lockup: `ds-auth-layout {
  --ds-auth-layout-brand-name-font-size: var(--font-size-h4); --ds-auth-layout-mark-size:
  clamp(var(--space-6), 4svh, var(--space-8)); }`.

- **A logo projected into `ds-auth-layout`'s `[brand]` slot is capped at the tile height, 28px.**
  `--ds-auth-layout-brand-max-height` defaults to the tile (was `none`), so a logo sized by its width
  alone now shrinks to 28px tall, keeping its ratio. Set `ds-auth-layout {
  --ds-auth-layout-brand-max-height: none; }` to leave it unconstrained, or a height of your own.
  `ds-sidenav`'s `[brand]` slot is unchanged.

- **`ds-button` and `ds-icon-button` colour and variant classes are spelled out.** On the inner
  button `.c-{color}` is now `.color-{color}` and `.v-{variant}` is `.variant-{variant}`: rename
  `.c-secondary`, `.c-tertiary`, `.c-neutral`, `.c-error`, `.c-success`, `.c-warning` to
  `.color-secondary` ... `.color-warning`, and `.v-tonal`, `.v-ghost`, `.v-outline`, `.v-text` to
  `.variant-tonal` ... `.variant-text`, in selectors scoped under `ds-button`; `ds-icon-button` takes
  the same colour rename. Better: key the rule off the host, `ds-button[data-color="error"]` or
  `ds-button[data-variant="outline"]`. `.color-primary` and `.variant-solid` do not exist: the
  default carries no class, as `.c-primary` and `.v-solid` never did. Bindings (`color="error"`,
  `variant="outline"`) are unaffected; a selector left on an old class matches nothing, and a
  `:not(.c-error)` chain stops excluding anything.

- **`DS_CONFIG.chart.emptyText` and `DS_CONFIG.chart.errorText` are removed for `provideDsIntl`.**
  Move them out of `provideDsConfig` into `provideDsIntl({ chart: { empty: '...', error: '...' } })`
  on the same injector. Deleting the keys without adding `provideDsIntl` compiles and silently
  restores the English 'No data' and 'Could not load the data'. The per-chart `[emptyText]` and
  `[errorText]` inputs are unchanged and still win.

- **Seventeen text inputs default to `null` and fall back to `DS_INTL`.** Each went from
  `input<string>` with an English default to `input<string | null>(null)` (and `ds-table`'s
  `sortAnnouncement` / `rangeAnnouncement` from a function `T` to `T | null`): `placeholder` on
  `ds-autocomplete`, `ds-multi-select`, `ds-date-picker`, `ds-search`; `searchPlaceholder` on
  `ds-multi-select`; `ariaLabel` on `ds-color-picker`, `ds-otp-input`; `closeLabel` on `ds-tag`;
  `countLabel` on `ds-badge`; `moreLabel` and `panelLabel` on `ds-filter-bar`; `menuLabel` on
  `ds-split-button`; `railLabel` on `ds-app-layout`; `otherLabel` on `ds-pie-chart`;
  `noVisibleSeriesText` on `ds-line-chart`; `sortAnnouncement` and `rangeAnnouncement` on `ds-table`.
  Binding these in a template is unaffected. Code that reads the raw input back, or a subclass
  overriding it, handles `null` or reads the new matching `...Resolved` readback: a reader comparing
  `placeholder()` to `'Select…'` now sees `null` for an unset field and takes the other branch with no
  compile error.

- **Chart numbers and percentages format in `DsConfig.locale`, then `LOCALE_ID`.** The built-in value
  format (`ds-bar-chart`, `ds-column-chart`, `ds-line-chart`, `ds-pie-chart`, `ds-funnel-chart`,
  `ds-heatmap-chart`, `ds-scatter-chart`, `ds-waterfall-chart`, and `ds-chart` with its series,
  including hand-composed `dsColumnSeries` / `dsLineSeries`) reads one locale instead of the
  browser's default. Percentages use `Intl`'s percent style rather than `toFixed(1)` + `%`, so de-DE
  prints `13,5 %` with a space and a test expecting `13,5%` fails. An app that never provided
  `LOCALE_ID` now prints en-US grouping where it printed the browser's: set `provideDsConfig({
  locale: '<tag>' })` or provide `LOCALE_ID`. A chart bound to its own `[valueFormat]`, or an app
  with `DS_CONFIG.chart.valueFormat` set, formats values as before; its percentages still change.

- **`ds-date-picker` falls back to `DS_CONFIG.datePicker.locale`, then `DsConfig.locale`, then
  `LOCALE_ID` (was a hard `'en-US'`).** A picker with no `[locale]` binding, in an app that provides
  `LOCALE_ID` or `DsConfig.locale`, now renders month and weekday names and the typed-value order in
  that locale; under a de-DE `LOCALE_ID` the order becomes `DD.MM.YYYY`. An app that provides neither
  still gets en-US. To keep en-US: `provideDsConfig({ datePicker: { locale: 'en-US' } })`.

- **`ds-dropzone` formats file sizes in the locale.** A listed file's size reads `DsConfig.locale`,
  then `LOCALE_ID`; under a de-DE locale `1.5 MB` reads `1,5 MB`. Under en-US the text gains a group
  separator from 1000 KB up to 1 MB and from 1000 MB up (`1,000.0 KB`, `1,024.0 MB`), and is
  unchanged everywhere else. To pin a dot decimal: `provideDsConfig({ locale: 'en-US' })`, which
  also pins chart numbers and `ds-date-picker`.

- **`ds-textarea` text size resolves `--ds-input-font-size`, then `--ds-field-font-size`, then
  `--font-size-s` (was fixed at `--font-size-s`).** A `ds-textarea` under an ancestor that sets
  `--ds-input-font-size` now takes that size; one under no such declaration is unchanged, and
  `ds-input` is unchanged. To keep 14px under an ancestor that pinned another size: `ds-textarea {
  --ds-input-font-size: var(--font-size-s); }`.

- **`ds-search`'s hover border defaults to its own resting border (was `--border-default`).** A
  `ds-search` whose rest border you coloured through `--ds-search-border` or
  `--ds-field-border-color` now keeps that colour under the pointer instead of reverting to grey; one
  under neither draws exactly what it drew. To restore the grey hover: `ds-search {
  --ds-search-border-hover: var(--border-default); }`.

- **Subclassing one of these breaks on a name collision.** Every one but `AuthLayoutComponent`,
  `LineSeriesComponent` and the internal `ChartTooltipDirective` gained a member - most an `intl`
  accessor and the `...Resolved` readbacks that pair with the nullable text inputs above, the nine
  chart components also `renderReady`: `AccordionComponent`, `AccordionItemComponent`,
  `AlertComponent`, `AppLayoutComponent`, `AuthLayoutComponent`, `AutocompleteComponent`,
  `AvatarComponent`, `AvatarGroupComponent`, `BadgeComponent`, `BannerComponent`,
  `BarChartComponent`, `BreadcrumbsComponent`, `ChartComponent`, `ColumnSeriesComponent`,
  `LineSeriesComponent`, `ChartDataTableComponent`, `ColorPickerComponent`, `ColumnChartComponent`,
  `DatePickerComponent`, `DescriptionItemComponent`, `DrawerComponent`, `DropzoneComponent`,
  `FilterBarComponent`, `FunnelChartComponent`, `HeatmapChartComponent`, `InputComponent`,
  `LineChartComponent`, `ModalCardComponent`, `MultiSelectComponent`, `NumberStepperComponent`,
  `OtpInputComponent`, `PaginationComponent`, `PasswordRulesComponent`, `PieChartComponent`,
  `ScatterChartComponent`, `SearchComponent`, `SelectComponent`, `SidenavGroupComponent`,
  `SidenavFooterComponent`, `SliderComponent`, `SpinnerComponent`, `SplitButtonComponent`,
  `StepperComponent`, `TableComponent`, `DsTableExport`, `TabsComponent`, `TagComponent`,
  `TextareaComponent`, `TimePickerComponent`, `ToastComponent`, `ToastRegionComponent`,
  `W3wComponent` and `WaterfallChartComponent`, and seven internal classes reachable only through
  their own entry points: the internal `ChartLegendComponent`, the internal `ChartTooltipDirective`,
  the internal `ModalConfirmComponent`, the internal `TableColumnsPanelComponent`, the internal
  `TableColumnsTriggerComponent`, the internal `TableExportButtonComponent` and the internal
  `TimeColumnsComponent`. Four members are gone:
  `ChartComponent.tooltipPreferBelow`, `ColumnSeriesComponent.onMarkBlur`,
  `LineSeriesComponent.onMarkerBlur` and the internal `ChartTooltipDirective.dsChartTooltipPreferBelow`.
  Build after upgrading; rename or mark `override` every member the compiler reports colliding
  (TS4114, or TS2416 where the signature differs), and delete an override whose base member is
  gone. A method named like a removed member and declared without `override` still compiles and is never called again. Subclassing a DS component is
  unsupported.

### Added

- **`DS_CONFIG.chart.rendering` builds charts as they near the viewport, for a page that asks.**
  Off by default: every chart draws as soon as it is created, which is right for a screen with a
  few of them. A dashboard or a report with dozens sets `deferUntilVisible: true`, and each chart
  then holds its place with a still placeholder of its own shape until it comes within
  `visibleMargin` (default `'10% 0px'`) of the viewport. `buildAheadWhileIdle` (default `true`)
  builds the charts within `buildAheadMargin` (default `'100% 0px'`) while the page is idle,
  `frameBudgetMs` (default `8`) caps how long one task spends building, and `skipWhileOffscreen`
  (default `true`) lets the browser skip a built chart's rendering off screen. Until a deferred
  chart is built a screen reader meets its caption only. `BarChartComponent`,
  `ColumnChartComponent`, `LineChartComponent`, `PieChartComponent`, `FunnelChartComponent`,
  `HeatmapChartComponent`, `ScatterChartComponent`, `WaterfallChartComponent` and `ChartComponent`
  each gained a protected `renderReady`, so a subclass declaring that name needs `override`.

- **`ds-skeleton` takes `shimmer` and `--ds-skeleton-wave-steps`.** `[shimmer]="false"` draws a
  still block of the same shape, for a space held for something that is not loading yet; the
  charts use it for the placeholder above. `--ds-skeleton-wave-steps` sets how many updates one
  pass takes, default `68` - twenty a second over the default duration; more is smoother and costs
  a main-thread update each. `SkeletonComponent` gained the `shimmer` input, so a subclass
  declaring that name needs `override`.

- **`DS_INTL` and `provideDsIntl` hold every string the library renders.** `DS_INTL` is a
  `Signal<DsIntl>`, `DS_INTL_DEFAULTS` its English base, and `provideDsIntl(overrides | () =>
  Signal<overrides>)` merges per section like `provideDsConfig` - an object for one language, or a
  factory returning a signal to switch languages at runtime. Exported from the package root and
  `/core`, with the types `DsIntl`, `DsIntlOverrides`, `DsIntlSortDirection` and `DsIntlStepState`.
  English by default; a text input set on an instance still wins.

- **`DsConfig.locale?: string` sets the BCP-47 locale for chart numbers and percentages,
  `ds-date-picker` and `ds-dropzone` file sizes.** Unset, it is Angular's `LOCALE_ID`. Set it through
  `provideDsConfig({ locale: '<tag>' })`.

- **Six field-family tokens sit under every text-entry field's own token.** `--ds-field-border-color`,
  `--ds-field-border-color-hover`, `--ds-field-border-color-focus`, `--ds-field-text-color`,
  `--ds-field-placeholder-color` and `--ds-field-font-size` reach `ds-input`, `ds-textarea`,
  `ds-select`, `ds-multi-select`, `ds-autocomplete` and `ds-search`, all but
  `--ds-field-border-color-hover` on `ds-search`, whose hover border follows its resting one; a
  per-component token such as `--ds-input-border` still wins where set. The date, time and colour
  pickers, the number stepper and the OTP cells are not in the family. Every default is the value
  each field already drew.

- **`ds-select`, `ds-multi-select` and `ds-search` take their own size and colour hooks.**
  `ds-select`: `--ds-select-border-color-focus` (read by the focused and the open trigger alike),
  `--ds-select-border-color-hover`, `--ds-select-placeholder-color`, `--ds-select-font-size`.
  `ds-multi-select`: `--ds-multi-select-border-color-hover`, `--ds-multi-select-placeholder-color`,
  `--ds-multi-select-font-size`. `ds-search`: `--ds-search-font-size`. Every default is the value the
  trigger already drew.

- **`ds-autocomplete` takes `--ds-autocomplete-text-color`, `--ds-autocomplete-placeholder-color` and
  `--ds-autocomplete-border-color-hover`.** The text colour covers the typed text and the picked
  value; the placeholder resolves `--text-tertiary` through the field family, as `ds-input`'s does.
  Every default is the value it already drew.

- **`ds-button` and `ds-icon-button` take border-colour hooks for hover and press.**
  `--ds-button-border-color-hover` and `--ds-button-border-color-active` on `ds-button`,
  `--ds-icon-button-border-hover` and `--ds-icon-button-border-active` on `ds-icon-button`. Hover
  defaults to the resting border and active to hover, so an unset pair draws what the button drew.

- **`ds-empty-state` takes `--ds-empty-state-title-font-family` (default `--font-sans`) and
  `--ds-empty-state-title-font-weight` (default `--font-weight-bold`)**, beside the title's existing
  size and colour hooks.

- **`ds-badge` takes `--ds-badge-font-size` and `ds-page-header` takes
  `--ds-page-header-subtitle-font-size`.** `--ds-badge-font-size` defaults to `--font-size-xs`; a
  count badge keeps `--font-size-2xs` until the token is set. `--ds-page-header-subtitle-font-size`
  defaults to `--font-size-s`.

- **`ds-banner` takes `--ds-banner-title-font-size`** beside `--ds-banner-body-font-size`; it
  defaults to `--font-size-s`, what the title drew.

- **`ds-table` takes utility-column and footer-padding hooks.** `--ds-table-utility-column-width` and
  `--ds-table-utility-column-padding-x` size the trailing column that carries the column picker and
  the row-actions button; the width default moves from `--space-10` to `--space-6`, the buttons' own
  size, and because cells are border-box nothing moves unless `--ds-table-cell-padding-x` is below
  8px, where the column narrows to button plus padding. `--ds-table-footer-padding-y` (default
  `--space-3`), with `--ds-table-footer-padding-top` and `--ds-table-footer-padding-bottom` falling
  back to it, sets the pagination footer's block padding.

- **Chart legends take `--ds-chart-legend-hover-bg-color` and `--ds-chart-legend-hover-text-color`**
  for the hover and focus state of a legend entry (defaults `--surface-secondary` and
  `--text-primary`).

- **`ds-accordion` takes `chevron`, and `ds-accordion-item` takes eight styling hooks.** `chevron:
  'right' | 'down'` (default `'right'`, type `AccordionChevron`): `'down'` draws a downward chevron
  that turns up when the item opens. `ds-accordion-item` reads `--ds-accordion-header-padding`,
  `--ds-accordion-header-gap`, `--ds-accordion-header-font-family`, `--ds-accordion-header-font-size`,
  `--ds-accordion-header-font-weight`, `--ds-accordion-header-line-height`,
  `--ds-accordion-header-hover-text-color` and `--ds-accordion-body-padding`. Every default is the
  value the item already drew.

- **`ds-bar-chart` takes `highlighted`.** It names one segment by id, or by its position where it has
  none, and fades every other segment in every row to `--ds-chart-dim-opacity`. Unset changes
  nothing.

- **`g[dsColumnSeries]` takes `axis: 'primary' | 'secondary'` (default `'primary'`).**
  `axis="secondary"` measures the columns against the second value axis, as `axis: 'secondary'` does
  in a line series' data.

- **The `check-overrides` schematic: `ng g @ids-group-ltd/ids-design-system:check-overrides`.**
  Read-only: it reports every `--ds-*` custom property a stylesheet, `[style.--ds-*]` or
  `setProperty` sets that the installed version never reads, and every `ds-*` selector naming a class
  the component does not render. Options `strict` (default false; set, it fails when anything is
  reported) and `path` (default `/`).

- **`AnnounceState` is exported, and `ds-banner` / `ds-alert` warn once per instance in dev mode when
  `announce` was never decided.** The warning fires for an error, warning or severe banner (error or
  warning alert) left unbound while `DS_CONFIG.banner.announce` (`alert.announce`) is unset, and for
  an info, success or neutral one that announces only because that key is true. Setting the key
  either way ends the first, an `[announce]` binding ends the second; neither reaches a production
  build.

### Changed

- **Chart legend entries take a hover and focus state.** In `ds-line-chart`, `ds-column-chart`,
  `ds-scatter-chart`, `ds-chart-legend` and the `ds-pie-chart` legend, an entry under the pointer or
  holding keyboard focus gets a `--surface-secondary` tint and `--text-primary` text through
  `--ds-chart-legend-hover-bg-color` and `--ds-chart-legend-hover-text-color`; the entry's padding is
  paid back as a negative margin, so no legend row moves. Hovering or focusing a `ds-pie-chart`
  legend entry fades the other slices whether or not `dimOthers` is set, as the other chart legends
  do; `dimOthers` still governs a pointer over the ring.

- **A category panel hangs over the highest reading at its category, wherever in the band the pointer
  is.** With the pointer beside a column it hung over a lower line marker.

- **Line-series markers fade in with the line, and a thin funnel `area` stage stays visible.** In
  `ds-line-chart` and `ds-chart` line series the point markers fade in with the line and area, on the
  same delay and stagger. A `ds-funnel-chart` with `shape="area"` draws a stage whose share is too
  small to clear the band gap as a band half a gap deep (about 3px at the default stage height) about
  its own middle, instead of a zero-height line; a stage of value 0 still draws nothing.

- **`ds-pie-chart` draws a held slice's pin badge as an HTML element over the ring.** It is 22px
  (`--ds-chart-pin-size`) at any ring size, with the pin glyph centred in its circle.

- **A click on a chart series leaves focus where it was.** Clicking a `g[dsColumnSeries]` or
  `g[dsLineSeries]` series, or a `ds-scatter-chart` series, no longer moves focus onto the series
  group and draws a focus rectangle around all its marks. The keyboard reaches each mark as before.

- **Neutral rows and small buttons darken one step on press, to `--surface-muted`.** The controls that
  had a hover fill and no pressed state: the sidenav group header and caret, the sidenav footer's
  rows, more button, search results and alerts, the date picker's period trigger, nav buttons, month
  and year cells and presets, the time picker's option cells and action buttons, the toast action,
  the description-list copy button, the multi-select select-all row and the tab close button. An
  interactive `ds-tag` takes the shared press dip too, and reads `--ds-press-brightness` and
  `--ds-press-scale`.

### Fixed

- **`ds-modal` and `ds-modal-card` measure their actions row again when its content changes.** The
  row was measured on first render and when the header resized, so a button label that grew after the
  modal opened ('Saving…', a count) left the row on one line and clipped the first button at the
  card's start edge. A changed label or a changed set of actions now stacks or unstacks the row the
  same way the first render does.

- **Column and line series draw before the width is measured.** They waited for the first
  measurement, so they drew nothing wherever the page is never laid out - a frozen snapshot, a
  headless render in virtual time - and the axes showed a frame before the marks.

- **A closing modal backdrop, drawer and bottom sheet stay click-through for the whole leave.** Under
  reduced motion the invisible scrim could take a click aimed at the page for up to 300ms after the
  close; a click on the page during a close now reaches it.

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| a `.modal-backdrop.closing`, `.drawer-scrim.closing` or `.sheet-overlay.closing` rule forcing `pointer-events: none` | the library's closing roots are click-through for the whole leave | nothing; a rule that also shortens `animation-duration` under reduced motion may stay |
| a doubled-class rule such as `.head.head`, `.chev.chev` or `.body-content.body-content` under `ds-accordion-item` | the header padding, gap, type and hover colour, the body padding and the chevron direction are tokens and an input | `--ds-accordion-header-padding` / `-gap` / `-font-*` / `-hover-text-color` and `--ds-accordion-body-padding` on the item; `chevron="down"` on the `ds-accordion` |
| a rule recolouring `.dropdown:focus-visible` or `.dropdown.open` under `ds-select`, with or without `!important` | the focused and the open trigger resolve `--ds-select-border-color-focus` | `--ds-select-border-color-focus` on the `ds-select`, or `--ds-field-border-color-focus` for every field |
| a `.autocomplete-input.autocomplete-input` rule setting `color` or `::placeholder` | the filter input resolves its text and placeholder colours from tokens | `--ds-autocomplete-text-color` and `--ds-autocomplete-placeholder-color`, or `--ds-field-text-color` / `--ds-field-placeholder-color` for every field |
| a `ds-button .button.v-outline:hover` or `ds-icon-button .icon-button:hover` rule recolouring the inner button's edge | the hover and press border colours are tokens that fall back to the resting border | `--ds-button-border-color-hover` / `-active` on the `ds-button`, `--ds-icon-button-border-hover` / `-active` on the `ds-icon-button` |
| a `ds-empty-state .title` or `.title.title` rule setting `font-family` or `font-weight` | the title's face and weight are tokens | `--ds-empty-state-title-font-family` and `--ds-empty-state-title-font-weight` on the `ds-empty-state` |
| a `ds-badge .badge` or `ds-page-header .subtitle` rule sizing the label | the badge label size and the page-header subtitle size are tokens | `--ds-badge-font-size` on the `ds-badge`, `--ds-page-header-subtitle-font-size` on the `ds-page-header` |
| a `ds-banner .banner.compact .title` rule sizing the title | the title size is a token | `--ds-banner-title-font-size` on the `ds-banner` |
| a `ds-table .actions-col` or `.actions-col` rule squeezing the utility column | the utility column's width and horizontal padding are tokens | `--ds-table-utility-column-width` and `--ds-table-utility-column-padding-x` on the `ds-table` |
| a `.pagination-footer.pagination-footer` rule re-padding the footer | the footer's top and bottom padding are tokens | `--ds-table-footer-padding-top` / `-bottom` (or `-y`) on the `ds-table` |
| `cursor="category"` on a `ds-chart` holding two or more marks that show a tooltip | the default cursor resolves to the category cursor there | nothing; the binding stays legitimate on a `ds-chart` of one such mark |
| `landmark="main"` on a `ds-auth-layout` | `main` is the default | nothing |
| `--ds-auth-layout-brand-max-height: var(--ds-auth-layout-mark-size)` | the tile size is the default cap | nothing |
| a `ds-auth-layout .brand-name` rule sizing the wordmark | the wordmark size is a hook | `--ds-auth-layout-brand-name-font-size` on the `ds-auth-layout` |
| a `valueFormat: (value, location) =>` copied only to pin a locale, e.g. `value.toLocaleString('en-US'` | the built-in chart format reads `DsConfig.locale`, then `LOCALE_ID` | `provideDsConfig({ locale: 'en-US' })`; a formatter that changes digits, units or rounding stays |
| a per-element `[countLabel]=`, `[sortAnnouncement]=` or `[rangeAnnouncement]=` that repeats the app-wide translation | the same wording set once in `provideDsIntl` reaches every instance | `provideDsIntl({ ... })` at the root; a binding whose text differs for that one instance stays |

## 0.14.0 — 2026-09-24

### Breaking

- **`ds-chart` opens the tooltip its marks describe, and a mark no longer takes one.** A mark
  reported its context and every consumer bound `dsChartTooltip` on the mark themselves; a plot
  holding two marks could open two panels, and a plot whose consumer forgot the binding opened
  none. Marks now offer the container a tooltip source the way they already report a domain, and
  the container draws the single panel.

  Drop `[dsChartTooltip]`, `[dsChartTooltipOrigin]`, `[dsChartTooltipPreferBelow]` and
  `[dsChartTooltipTemplate]` from `g[dsColumnSeries]` and `g[dsLineSeries]`. What replaces them:
  nothing for the ordinary case, `[tooltipTemplate]` on `<ds-chart>` for a custom panel body, and
  `[tooltipExtraGap]` there for a chart that prints value labels in the gap the panel wants.

- **The chart tooltip pane is inert unless the reading is pinned.** The pane is drawn over the plot
  it describes, so on a funnel or a tight category axis it covered the neighbouring marks and the
  mark underneath never saw the pointer - the panel named a segment the reader had already left.
  A pinned pane takes the pointer again; the panel's own content does not. A rule of yours on
  `.cdk-overlay-pane.ds-chart-tooltip-pane` that assumed `pointer-events: auto` needs
  `.is-pinned` added to it.

- **Subclassing one of these breaks on a name collision.** `ChartComponent`,
  `ColumnSeriesComponent`, `LineSeriesComponent`, `ColumnChartComponent`, `ScatterChartComponent`,
  `ChartDataTableComponent`, `BarChartComponent`, `FunnelChartComponent` and `PieChartComponent`
  each gained members, most of them while the container took over the tooltip, and so did
  `ChartTooltipDirective`, which is internal but reachable through
  `@ids-group-ltd/ids-design-system/components/chart-tooltip`. Outside the charts,
  `ModalCardComponent`, `PaginationComponent`, `SearchComponent`, `SwitchComponent`,
  `TableComponent`, `TextareaComponent`, `LineChartComponent` and `CellTemplateDirective` gained
  members too, and so did
  every field control: each extends one of the internal base classes `DsControlValueAccessor` or
  `DsBooleanControlValueAccessor`, which gained `blur`. Declaring a member of the same name in a
  subclass is a compile error - TS4114, or TS2416 where the signature differs - so rename yours or
  add `override`. Protected members went too: the roving-focus pair on the bar, pie and funnel
  charts and the column series, the per-mark event handlers of the column and line series, and the
  plot's pointer handlers. A method of yours named like one of those, declared without `override`,
  still compiles and is never called again, so delete it. Subclassing a DS component is unsupported
  either way.

- **`ChartScales` requires two tooltip methods.** `reportTooltip(id, source)` and
  `releaseTooltip(id)` are required members now that the container draws the single tooltip panel.
  `<ds-chart>` implements both; a container of your own that implements `ChartScales` by hand does
  not compile until you add them. The type of `source` is not exported - a hand-written container
  forwards what its marks report without naming it.

- **Five tokens take their property's name.** `--ds-input-label-fw` is
  `--ds-input-label-font-weight`, `--ds-tag-fw` is `--ds-tag-font-weight`, `--ds-tag-lh` is
  `--ds-tag-line-height`, and `--ds-slider-thumb-bw` is `--ds-slider-thumb-border-width`. The
  theme-level `--slider-thumb-bw` in `styles/_tokens.scss` is `--slider-thumb-border-width`; the
  slider's own token falls back to it, then to `--border-width-strong`. An unknown custom property is
  not an error, so a declaration left on an old name is inert and the element draws at its fallback
  with no warning.

- **`ds-pagination`'s `layout` input is `PaginationLayout | null` and defaults to `null`.** It was
  `PaginationLayout` with a `'grouped'` default. Writing the attribute in a template is unchanged,
  but code that reads `layout()` back through a `viewChild` now sees `null` on a pager that was never
  given one, and a subclass overriding `layout` must widen its type to match. The effective value -
  the input, then `DS_CONFIG.pagination.layout`, then `'grouped'` - is `layoutResolved()`, which is
  new and public; `sizeResolved()` is public too.

- **A `dsCellTemplate` that reads its row needs `[dsCellTemplateOf]` under strict templates.** The
  directive declares a template context guard, so its context is `unknown` until
  `[dsCellTemplateOf]` names the rows; a template reading `row.name` through a context that used to
  be typed `any` fails with TS2571 or TS2345. Bind `[dsCellTemplateOf]` to the same expression as the
  table's `[data]`. A template passed to `rowExpandTemplate` or `cellTemplateMap` carries no guard and
  is unaffected.

### Added

- **`dsLineSeries` takes an `outline`, on by default.** The line and its markers sit on a band of
  the surface colour, so they stay legible where they cross columns. Set `[outline]="false"` for a
  line on an empty plot where the band only separates it from the gridlines. `ds-line-chart` takes
  the same `outline` input and passes it to its series.

- **`dsColumnSeries` takes `seriesKey` and `highlighted`.** Naming a series in the legend fades the
  others to `--ds-chart-dim-opacity`, which `ds-column-chart` now wires for you.

- **`ChartScales` carries an optional `measured` signal**, true once the plot has its real width.
  A mark of your own can wait for it before building geometry the first measurement would replace.
  A container of your own that implements `ChartScales` may leave it out, and a mark reads it as
  always measured then.

- **`ds-bar` reads `--ds-bar-radius` on the track and the fill.** It defaults to
  `var(--radius-pill)`, the shape both hard-coded before, so a bar can now be squared.

- **`ds-line-chart` sizes its loading and empty states from `--ds-line-chart-placeholder-height`.**
  It sizes the loading skeleton and the empty and error box. Unset, the skeleton falls back to the
  plot height and the message box to the view height, as before. Since 0.13.4
  `--ds-line-chart-plot-height` also sizes the plot, so a value you set only to size the placeholder
  states resizes every plot - move it to the new token.

- **`ds-pagination` takes `loading`.** A boolean attribute, default false: it sets
  `aria-busy="true"` on the `<nav>`, replaces the "N of M" range label with an inline skeleton so a
  stale total is never quoted, and disables Prev, Next, every page button and the rows-per-page
  select. The current page button keeps its colour while disabled.

- **`DS_CONFIG` takes `pagination`.** `pagination?: { size?: DsSize; layout?: PaginationLayout }`
  sets the default size and layout of every pager, `ds-table`'s footer included. A pager resolves
  `size` from its input, then `DS_CONFIG.pagination.size`, then `DS_CONFIG.control.size`, then
  `'sm'`; `layout` from its input, then `DS_CONFIG.pagination.layout`, then `'grouped'`.

- **`ds-table` takes `paginationSize` and `paginationLayout`.** Both default to `null`
  (`DsSize | null` and `PaginationLayout | null`) and are forwarded to the footer pager's `size` and
  `layout`, resolved through the same chain as a standalone pager.

- **`dsCellTemplate` types its `let-row` from `[dsCellTemplateOf]`.** The directive is generic,
  `CellTemplateDirective<T = unknown>`, and `[dsCellTemplateOf]="rows"` - typing only, never read at
  runtime - types `let-row` as the row type under strict templates. The new exported type
  `CellTemplateContext<T = unknown>` is `{ readonly $implicit: T; readonly row: T }`. A template
  passed to `rowExpandTemplate` or `cellTemplateMap` carries no context guard, so its row stays
  untyped (`any`).

- **Every field control and `ds-search` gain `blur(): void`.** The counterpart of `focus()`: it
  drops focus from whichever descendant of the host holds it, leaving an open overlay panel alone.

- **`ds-textarea` exposes the native selection API.** `selectionStart` and `selectionEnd` (0 before
  the view exists), `setSelectionRange(start, end, direction?: 'forward' | 'backward' | 'none')`,
  which does not move focus, and `select()`, each forwarded to the native textarea. A value written
  through `value` reaches the element a microtask later and drops the caret to the end, so after
  `value.set(...)` set the range from a `setTimeout`, not synchronously.

- **`ds-switch` takes `controlled` and emits `checkedRequested`.** `controlled` is a boolean
  attribute, default false; `checkedRequested` is a `boolean` output carrying the value the user
  asked for. Under `controlled` a click or Space is cancelled on the native toggle,
  `checkedRequested` emits `!checked()`, and the switch moves only when `[checked]` changes. Because
  the toggle is cancelled, a two-way `checked`, an `ngModel` or a form control is not updated by the
  gesture - the host commits the value through `[checked]`. Without `controlled` nothing changes.

- **`PaginationLayout` is exported from `@ids-group-ltd/ids-design-system/core`** as well as from
  `@ids-group-ltd/ids-design-system/components/pagination` and the package root.

- **`ds-modal` and `ds-modal-card` read `--ds-modal-actions-stacked-direction`.** Default
  `column`, which stacks the actions in DOM order with the confirming action at the bottom;
  `column-reverse` puts it on top. It has no effect while the actions row fits on one line.

### Changed

- **Modal actions stack full-width when they outgrow the card.** When the `[actions]` row is wider
  than the card, `.actions` gains `.stacked` and every projected action becomes full-width in a
  column, in DOM order - cancel then confirm, matching Tab order. A row that fits stays a
  right-aligned single line. The row used to overflow past the card's start edge and clip the first
  button.

- **`ds-table`'s footer pager is disabled while the table shows skeleton rows.** Whenever the
  table draws skeletons - `loading="skeleton"`, or `loading` on a table with no rows yet - the pager
  gets `loading`, so its controls are disabled and `aria-busy` while the placeholder rows show. The
  overlay mode leaves the pager alone.

- **`ds-scatter-chart` fades the other series while a legend entry is hovered**, to
  `--ds-chart-dim-opacity`, as the other charts with a legend do.

- **Under a category cursor, a line chart's active marker grows for the whole category band**, not
  only while the pointer is on the 4px dot, and the panel anchors above the tallest reading at the
  category rather than whichever mark reported first.

- **The chart tooltip fades out when the pointer leaves the plot** instead of vanishing, and its
  colour dot is larger, with a surface-coloured ring; a hatched dot's stripes run at 45deg.

- **A category panel names every series at the category.** `tooltip="axis"` was documented to do
  this and listed only the series that opened it, because a mark could not see the others. Marks
  now offer the container what they read at the cursor's category and the container merges them,
  so a column and a line sharing a plot appear in one panel.

- **Legend hover fades the other series whether or not `dimOthers` is set.** That input governs
  what a pointer over a MARK does; naming a series in the legend is the reader asking for that one
  directly. On `dsLineSeries` this is the `highlighted` input, so a `[highlighted]` binding of yours
  now fades the other lines without `dimOthers`, where before it only thickened the named one.

- **The unpin control sits below the plot.** The panel it undoes opens above the held mark, so a
  control at the top was the one thing that panel covered.

- **A chart's data table is built the first time it is opened.** A closed disclosure carried the
  whole table in the DOM; it now holds only its summary until the reader opens it, and keeps the
  table from then on. `dataTable="visible"` is unaffected. The browser's find-in-page no longer
  reaches the numbers of a table nobody has opened.

- **A mark's entrance is a CSS animation declared on the mark, and the `mark-enter` class is
  gone.** The entrance plays when the mark is inserted - on first render and for a mark a data
  change adds - exactly as before. A rule of yours that restyled the entrance through
  `.mark-enter` targets the mark itself instead.

### Fixed

- **A stacked mark answers the pointer over its own segment.** Each series carried a hit box
  spanning the whole category slot, so stacked they lay on top of one another and only the series
  drawn last ever answered - every segment reported the top one.

- **A tooltip anchored to a zero-value mark stays with its reading.** Such a mark is degenerate in
  one axis - a column loses its height, a bar its width - and the overlay took the viewport corner
  or the plot's left edge instead of the category.

- **The bar chart's tooltip points at the drawn value, not the track.** A floating bar put its
  panel a full track width from the reading it describes.

- **A segmented bar's tooltip names its segments.** It repeated the row label the pointer was
  already on; the row now heads the panel and each segment gets a line with its share.

- **A hatched mark's tooltip dot carries the same break its mark does**, so the panel and the plot
  encode the distinction the same way and neither relies on hue alone.

- **The pinned-mark badge clears the column's top edge**, instead of sitting flush against it and
  reading as part of the bar.

- **The column panel names a column whose header is visually empty.** A column declared with an
  empty `label` and a `screenReaderLabel` - an actions column, say - was listed in the
  `dsTableColumns` panel as a bare checkbox with no text, so nothing said which column it stood
  for. The row now reads the `screenReaderLabel`, which also gives the checkbox its accessible
  name.

- **A chart that enters hundreds of marks at once no longer freezes the page.** Every entering or
  leaving mark asked the browser for its running animations, and in Chrome that call slows down with each
  animation already running, so a scatter of a thousand points held the main thread for seconds -
  longer still on a page with other charts entering. Under zone.js a `ds-chart` also ran two extra
  change-detection passes of the whole application after its first render, a column or line series
  built its geometry at a stand-in width before the real one arrived, every point, marker and column
  carried up to eight event listeners of its own, and the default number format built a new
  formatter for every label.

- **`ds-date-picker` keeps its border around its value in a container narrower than the mask.**
  The value cannot clip, so the field shrank its border around it and the value and the calendar
  button ran past the border - a range picker under `fullWidth` was the common case. The field now
  keeps its content width as a minimum and overflows the container with its border intact. A
  container that fits the mask renders as before.

- **A chart with an axis title reserves a band for it.** The widest tick label no longer runs
  through the rotated title, and the secondary axis title gets its own band, so both titles stand the
  same distance from their ticks.

- **Axis labels are measured again when their text changes.** The value gutter and the rotation and
  thinning of category labels were decided on the first render alone, so a chart that started out
  loading or empty, or whose categories or ticks changed later, kept overlapping labels.

- **A skeleton pauses its shimmer while it is off screen, and moves it twenty times a second.** The
  wave is main-thread work on every update, on screen or not. Off screen it now stops, and resumes
  where it stopped, so a placeholder that has been scrolled away can come back out of step with its
  neighbours. On screen it advances in 68 steps over the default 3400ms instead of once per display
  frame; a step is about one level of lightness. A `--ds-skeleton-wave-duration` of yours changes
  the step rate with it, since the step count is fixed.

- **Reduced motion stops the skeleton shimmer.** The opt-out rule lost to the component's own
  animation, and the wave kept running for readers who asked for less motion.

- **A chart destroyed while a reading was pinned no longer leaves a key listener on the document.**

- **An expanded `ds-table` row's panel spans every column.** The panel's `<td>` carried
  `display: grid` for its reveal, and a cell whose display is not `table-cell` leaves the table
  layout, so its `colspan` was ignored and the panel rendered one column wide - as narrow as its
  first word. The grid and the `ds-table-expand` animation sit on `.expand-panel-inner`, and the
  projected template is wrapped in `.expand-panel-content`, the track the reveal clips. A rule of
  yours that reached your template's root through `.expand-panel-inner >` selects
  `.expand-panel-content` now; `.expand-panel-cell > .expand-panel-inner` still matches.

### What you can now DELETE

| Delete | Why | Replace with |
| --- | --- | --- |
| `ds-table .expand-panel-cell { display: table-cell }`, or a `::ng-deep` rule of that shape | the expand cell is a table cell, so the rule restates the default - and while it held, it also switched the reveal animation off | nothing |
| `[dsChartTooltip]="` and the `[dsChartTooltipOrigin]="` / `[dsChartTooltipPreferBelow]="` beside it, on any `g[dsColumnSeries]` or `g[dsLineSeries]` | `ds-chart` opens the panel its marks describe, so a binding on the mark opens a second one | nothing for the ordinary case; `[tooltipTemplate]` and `[tooltipExtraGap]` on `ds-chart` where the panel was customised |
| a `ds-modal-card .actions` rule setting `flex-wrap: wrap` | the actions row stacks full-width on its own once it outgrows the card on first render; keep the rule where a label or the set of actions changes after the modal opens | nothing |
| a `.pagination.pagination` or `.pagination-button.pagination-button` rule under `ds-table` forcing the footer pager's width, layout or button height | the footer pager takes its size and layout as inputs | `paginationSize` / `paginationLayout` on `ds-table`, or `provideDsConfig({ pagination: { ... } })`; a height none of `sm`, `md` or `lg` gives stays |
| `querySelector('input')?.blur()` reaching into a field control to drop focus | every field control has a public `blur()` | `blur()` on the field instance |
| `querySelector("textarea")` reaching into `ds-textarea` for its selection | the textarea forwards the native selection API | `selectionStart` / `selectionEnd` / `setSelectionRange()` / `select()` on `ds-textarea` |
| a `(row: unknown)` helper doing `return row as ` your row type for a cell template | `[dsCellTemplateOf]` types `let-row` | `[dsCellTemplateOf]="rows"` on the `dsCellTemplate`; a template passed to `rowExpandTemplate` or `cellTemplateMap` is untyped (`any`) and needs no caster |
| a wrapper around `ds-switch` that calls `preventDefault()` and does `emit(!this.checked())` to gate a change | `ds-switch` cancels its own toggle under `controlled` and reports the request | `controlled` with `(checkedRequested)`, `[checked]` bound to the committed state |

## 0.13.4 — 2026-09-23

### Breaking

- **The second-axis modes are renamed: `'rounded'` is `'aligned'`, `'independent'` is `'dual-grid'`,
  `'stacked'` is `'split'`.** `'exact'` is unchanged. The four words name what is done to the
  GRIDLINES, which is the only thing the modes differ in; the old three named something else or
  nothing at all.

  ```html
  <ds-line-chart yAxisMode="dual-grid" [categories]="months" [series]="series" />
  ```

  It applies to `yAxisMode` on `ds-line-chart`, `secondaryAxisMode` on `ds-chart`, and the
  `ChartAxisMode` union both take. `'stacked'` had to go whatever else happened: `ds-column-chart`
  ships `stack="stacked"`, which puts SERIES on top of each other, while the axis mode puts two
  PLOTS one above the other - one word, two meanings, on charts read side by side.

  An unknown string does not error. Angular assigns it, no mode matches it, and the plot falls back
  to one shared grid - a chart that looks plausible and is measured against the wrong axis. Grep for
  the three old values on those two inputs; there is nothing to see at runtime.

- **`ds-donut-chart` is `ds-pie-chart`.** `DonutChartComponent` is `PieChartComponent`,
  `DonutChartSlice` is `PieChartSlice`, and the entry point is
  `@ids-group-ltd/ids-design-system/components/pie-chart`. The eight `--ds-donut-chart-*` tokens
  take the `--ds-pie-chart-` prefix, and the internal wrapper class `.donut-chart` is `.pie-chart`.

  ```html
  <ds-pie-chart [data]="slices" centerValue="4,208" centerLabel="Total" />
  ```

  The component has drawn a solid pie since it shipped - closing the hole was one value of one
  input - so `Donut` named a default rather than the component. Under `Pie` the ring is the
  default and the disc is the zero case, which is how every other library in the field spells it.

  The old tag is an unknown element, not an error: Angular renders nothing and logs nothing outside
  strict schema mode, so a missed one is a chart that silently vanished. A `--ds-donut-chart-*`
  declaration left behind is valid CSS the component no longer reads, and the chart draws at its
  default size with nothing reported.

- **`thickness` is `innerRadius`, and the value is `1` minus what it was.** `0.32` becomes `0.68`,
  `0.1` becomes `0.9`, `1` becomes `0`. The default draws the identical ring.

  ```html
  <ds-pie-chart [data]="slices" [innerRadius]="0" />
  ```

  The knob names the hole now rather than the band, because the base case is a solid pie and the
  ring is the hole opened in it. `innerRadius="0"` is the pie; `1` no longer is. A value outside
  `[0, 1)` falls back to the default rather than drawing nothing.

  **Renaming without inverting is the hazard here, and nothing catches it.** A value carried across
  untouched is still in range and still valid, so a ring set to `0.32` becomes a nearly solid disc
  and a pie set to `1` becomes a ring. There is no error, no warning, and no type change - only a
  different picture.

- **Centre content renders only where there is a hole to hold it.** At `innerRadius="0"`,
  `centerValue` and `centerLabel` draw nothing.

  They used to render over the solid disc, where the halo behind them had nothing to separate them
  from and no single text colour is readable against three hues. Where a pie's centre figure was
  the only place a total appeared, move it to the caption, the legend or the page around the chart.

- **The grouped slice's id is `ds-pie-other`.** It reaches a consumer through `sliceClicked`
  whenever `maxSlices` groups a tail, so code comparing `slice.id` to `'ds-donut-other'` stops
  matching - without erroring, and with the grouped `Other` then handled as a real category.

- **118 `--ds-*` tokens take their CSS property's name.** `-pad` is `-padding`, `-btn` is
  `-button`, `-fs` is `-font-size`, `-tracking` is `-letter-spacing`, `-transform` is
  `-text-transform`, a bare `-weight` is `-font-weight`, and the truncated dimensions
  (`-w`, `-h`, `-maxw`, `-maxh`, `-minw`, `-col-w`) are spelled in full. Three fall outside those
  rules: `--ds-container-max` is `--ds-container-max-width`, `--ds-segmented-r-inner` is
  `--ds-segmented-radius-inner`, and `--ds-color-picker-sv-h` is
  `--ds-color-picker-saturation-value-height`.

  ```scss
  ds-button { --ds-button-padding-x: var(--space-6); --ds-button-letter-spacing: 0; }
  ```

  Several properties were tokenised all along under names nobody would guess from the property
  being set: tab padding lived under `-tab-pad-*`, menu-item padding under `-menu-item-pad-*`, and
  the checkbox label weight under `--ds-checkbox-label-weight` rather than
  `--ds-checkbox-label-font-weight`. A hook nobody can find is not a hook.

  The whole surface is now guessable from the property being set. What was already spelled out
  (`--ds-button-height`, `--ds-chart-frame-padding`, `--ds-checkbox-label-font-size`) is
  unchanged, and nothing was added or removed.

  An unknown custom property is not an error. The declaration stays in the stylesheet, the
  component reads its own fallback, and the element draws at its default with no build error and
  no console warning, so a missed rename is silent. Grep for the twelve spellings and the three
  named tokens above.

- **`--ds-container-pad` is `--ds-surface-padding`.** It is the padding every surface component
  falls back to - `card` and `stat` read it, `<ds-container>` never did - so it sat in the
  namespace of a component it had nothing to do with, beside `--ds-container-pad-x`, which is
  that component's own padding and is now `--ds-container-padding-x`.

  The two old names read as a pair and controlled unrelated things: a value moved to the wrong one
  re-pads every card in the app and leaves the container alone, or the reverse.

- **Fourteen more tokens take the name of what they configure.** The spelling pass fixed
  abbreviations; this one fixes tokens whose name points at the wrong component or uses a word
  only we say.

  ```scss
  ds-description-item { --ds-description-item-term-text-transform: uppercase; }
  ds-segmented { --ds-segmented-segment-border: 1px solid var(--border-default); }
  ds-tabs { --ds-tabs-gap: var(--space-4); }
  ```

  The eight `--ds-description-list-term-*` and `-details-*` tokens are declared in
  `description-item.component.scss` and style one item, so they are `--ds-description-item-*`.
  The three `--ds-segmented-btn-*` are `--ds-segmented-segment-*`, because the component calls
  its parts segments everywhere else it speaks - `class="segment"` in the template,
  `SegmentedOption` as the published type. `--ds-tabs-strip-gap` is `--ds-tabs-gap`: `strip` is
  our internal word for the tab list and appears nowhere a consumer reads.
  `--ds-description-list-col-gap` is `-column-gap`, and
  `--ds-split-button-bg-hover-color` is `-bg-color-hover`, which is how every other hover colour
  in the library is spelled.

  `--ds-description-list-label-width`, `-row-gap` and `-column-gap` stay on the list, which is
  what they size. `--ds-button-*`, `--ds-split-button-*`, `--ds-icon-button-*` and
  `--ds-pagination-button-*` all style real buttons, so this pass leaves them in their own
  namespace.

  A word that disambiguates a real part is not an abbreviation and was kept:
  `--ds-tab-label-font-size` stays, because a tab has a label and a badge, and
  `--ds-tab-color` would not say which it meant.

  An unknown custom property is not an error, so a missed rename is silent - the component reads
  its own fallback and draws at the default.

- **Nine exported names now say what they are.** A name is a defect when it misleads, when it
  stands for two things, or when two names stand for one.

  ```ts
  import type { ChartGaps, DateRangeValue, SortDirection } from '@ids-group-ltd/ids-design-system';
  ```

  `LineChartGaps` is `ChartGaps`, in `core` beside `ChartAxisMode`, and so is its
  character-identical `@internal` twin `LineSeriesGaps`, which was reachable through the
  `components/chart` entry point. `LineChartAxisMode` was a bare alias of `ChartAxisMode` published next to it,
  and is now that type. `RangeValue` is `DateRangeValue`, which is what its already-qualified
  neighbour `TimeRangeValue` made clear it should have been. `LineChartPoint` is
  `LineChartReading`: `...ChartPoint` is an input datum everywhere else, this one is the
  `pointClicked` payload, matching the new scatter chart's `ScatterChartReading`.

  `SortDir`, `sortDir` and `sortDirChange` are `SortDirection`, `sortDirection` and
  `sortDirectionChange`, and `SortChangeEvent.dir` keeps its name with the type `SortDirection`.
  `TableColumn.srLabel` is
  `screenReaderLabel` - it renders visually-hidden text, so `ariaLabel` would have been a second
  wrong name. `ds-accordion[multi]` is `multiple`, which is how `ds-autocomplete`, `ds-dropzone`
  and `TableExpandMode` all spell it.

  `LayoutScrollService` and `LayoutNavigationService` take their component's name -
  `AppLayoutScrollService` and `AppLayoutNavigationService` - and `DsScrollReset` is no longer
  exported, having become `DsAppLayoutScrollReset`. All three move because `LayoutAlign`, `LayoutGap` and `LayoutJustify` already make `Layout` mean the flex
  container entry point on this same surface.

  **Two of these fail quietly.** A static `sortDir="asc"` left behind is an unknown attribute:
  Angular leaves it on the DOM, the input keeps its default, and the table sorts by nothing with
  no warning. And `multi="false"`, written to get a single-open accordion, becomes an unknown
  attribute against a default of `true` - the accordion opens several panels instead, silently.
  A property binding fails the build; a plain attribute does not.

- **`ds-dropzone` loses `single`; the file count is `multiple` and the width is a token.**

  ```html
  <ds-dropzone [multiple]="true" />
  ```
  ```scss
  ds-dropzone { --ds-dropzone-max-width: var(--col-cap-text); }
  ```

  Two booleans encoded one three-state fact. `single` set the file count, which `multiple` already
  carried - its unset default takes one file, which is exactly what `single` did - and the
  component resolved the overlap by making one silently win: `[multiple]="single() ? false :
  multiple()"`. Setting both to `true` gave a single-file dropzone, with no error and no warning.

  Separately, and with nothing in its name to say so, `single` capped the panel at
  `--col-cap-text`. A narrow dropzone that takes several files could not be expressed at all. That
  width is now `--ds-dropzone-max-width`, unset by default, which is how every other component
  sizes itself.

  Dropping the binding needs no thought about the count - `single` and an unset `multiple` were
  the same file count. It does need a thought about the width: without the token the panel fills
  its column, and nothing reports that.

  **A drop now honours the count too.** The native `multiple` attribute constrains the file
  PICKER and has no say over a drag, so dropping three files on a dropzone that takes one emitted
  three - under `single` as much as without it, for as long as the component has shipped. Both
  ways in run through one place now, and a drop of several files on a one-file dropzone keeps the
  first.

- **`ds-line-chart` draws its plot through `ds-chart`, and two DOM hooks change with it.** The
  second-axis gridline class is `.grid-line.is-secondary`, not `.grid-line.secondary`, and the
  markers no longer carry `data-series-index` - they are numbered across the whole chart, so
  `data-mark-index` alone names one reading.

  ```css
  ::ng-deep ds-line-chart .grid-line.is-secondary { stroke-dasharray: 2 6; }
  ```

  Every `--ds-line-chart-*` hook still reaches the plot; the preset re-points each one at the
  container's own name. `.plot`, `.canvas`, `.axis-label`, `.series-line`, `.series-marker`,
  `.cursor-line` and `.category-band` are all still there, and `.axis-label` gained
  `.is-primary` / `.is-secondary`.

  A selector that stops matching is valid CSS. The rule goes dead, the plot draws at its default,
  and nothing reports either - which is also true of a test locator built on `data-series-index`.

- **The 96 typography hooks spell out their prefix: `--ds-t-*` is `--ds-typography-*`.** Every
  name is otherwise unchanged - `--ds-t-h4-font-size` is `--ds-typography-h4-font-size`.

  ```css
  :root { --ds-typography-h4-font-size: 1.375rem; }
  ```

  `t` was the last abbreviation in the token surface and the one hardest to guess from the property
  it sets: a reader looking for the h4 size in devtools sees `font-size` and has no route from
  there to a single letter.

  **The `.t-h4` / `.t-s` / `.t-mono-inline` classes keep their names.** They are the markup
  vocabulary rather than tokens, and renaming them would rewrite every template that carries one.

  A declaration left on an old name is valid CSS nobody reads. The type falls back to the global
  `--font-size-*` behind each hook, which is near enough the overridden value that a page reads as
  slightly off rather than broken.

### Added

- **`ds-chart-legend` sizes its colour chip from `--ds-chart-legend-swatch-size`.** The column, line
  and scatter charts render the legend and take it, and a preset with a swatch token of its own
  points that at it.

  ```css
  ds-chart-legend { --ds-chart-legend-swatch-size: 14px; }
  ```

  Defaults to `--space-2-5`, which is what the chip measured before.

- **`DS_CONFIG` takes `banner.announce` and `alert.announce`, the app-wide default for whether a
  banner or an alert is spoken when it appears.**

  ```ts
  provideDsConfig({ banner: { announce: true }, alert: { announce: true } });
  ```

  Both default to `false`, which is what the element already did. An app whose banners are raised in
  response to events sets the key once and binds `[announce]="false"` on the strips that are page
  furniture, instead of deciding at every element.

  **The input reads `boolean | null` now**, with `null` meaning unset, because a signal input cannot
  otherwise report whether it was bound. Writing the attribute is unchanged. A subclass that reads
  `announce()` back gets the three-state value and wants `announceResolved()`, which is the one the
  component's own ARIA reads.

- **`ds-chart` holds the category cursor: `cursorPin` and `tooltipLingerMs`.** A press holds the
  cursor where it is until it is pressed again, Escape, or a press outside the plot; the linger is
  the grace period that lets the pointer cross from the plot to a portaled tooltip panel.

  ```html
  <ds-chart cursor="category" cursorPin [tooltipLingerMs]="180" [categories]="months">
  ```

  Both are off by default. The cursor runs on the same state machine the element marks already
  use, so a pin behaves identically whether it is held on a column or on a category.

- **`ds-chart` is exported as `dsChart`.** A template reference reads `cursorPinned()` and calls
  `releaseCursor()`, which is what a preset needs to render its own way out of a held cursor.

  ```html
  <ds-chart #plot="dsChart" cursor="category" cursorPin [categories]="months">
  ```

- **`g[dsLineSeries]` takes `highlighted` and `tooltipAnchor`.** `highlighted` is the id of the one
  series to single out: with `dimOthers` beside it, that series keeps its colour and thickens while
  the rest fade. `tooltipAnchor` decides where an `axis` panel hangs - `'reading'`, the default,
  over the highest reading in the category, `'pointer'` following the cursor.

  ```html
  <svg:g dsLineSeries dimOthers [highlighted]="hovered()" [data]="series()" />
  ```

  Its markers also rove per series now: one tab stop per line, and the arrows walk that line rather
  than every reading on the plot. A focused marker narrows an `axis` panel to its own series.

- **`ChartScales` carries `cursorPointer`**, the pointer position in client pixels, for a mark that
  anchors a panel to the cursor rather than to a reading. `CHART_DEFAULT_VALUE_SPACE` is exported
  alongside it, so a preset can reserve the same box the container will take.

- **`ds-chart-data-table` holds the annex table every chart was drawing itself.** The
  `details`, the summary, the caption and the table; the chart supplies `columns` and `rows` of
  already-formatted cells.

  ```html
  <ds-chart-data-table [columns]="['Label', 'Value']" [rows]="tableRows()" [caption]="caption()" />
  ```

  `rowHeader` renders each row's first cell as a `<th scope="row">`,
  for a matrix whose rows are named rather than numbered. The formatting stays with the chart:
  two charts reading the same number differently is a chart decision, not a table one.

- **`LineSeriesData` takes `lower`.** The band's floor, one entry per category: an `area` series
  given one fills the band between the two curves rather than down to the baseline, which is what
  a stacked plot draws.

  ```ts
  { id: 'pro', label: 'Pro', data: tops, lower: floors, area: true }
  ```

  Unset, the fill reaches the baseline exactly as before. The caller that owns the pile is the one
  that knows where each band starts - a mark never sees the other marks. A `null` must sit in the
  same categories `data` has one, or the two sides break in different places.

- **`g[dsLineSeries]` takes `tooltip="axis"`.** It names every series of that mark at the
  category under the pointer, rather than the one marker hovered.

  ```html
  <ds-chart cursor="category" [categories]="months">
    <svg:g #line="dsLineSeries" dsLineSeries tooltip="axis" [data]="series"
      [dsChartTooltip]="line.tooltipContext()"
      [dsChartTooltipOrigin]="line.tooltipOrigin()" />
  </ds-chart>
  ```

  It follows the container rather than its own hover: set `cursor="category"` on `ds-chart`
  beside it and the panel anchors to the band the cursor draws, which is also what tells the
  reader which category is being named. `'item'` stays the default, so no chart changes on its
  own. `ChartScales` gains `cursorOrigin` for it - the band element, or `null` while the cursor
  is off.

- **`g[dsSeriesAnnotation]` pins labels to readings.** A peak, a launch, the month a number
  turned - legible in a printed page or a screenshot, where a tooltip is not.

  ```html
  <ds-chart [categories]="months">
    <svg:g dsLineSeries [data]="series" />
    <svg:g dsSeriesAnnotation [annotations]="notes" />
  </ds-chart>
  ```

  It takes the readings rather than finding them: a mark never sees the other marks, so the caller
  that owns the series is the one that knows which value a label belongs to. It reports no domain,
  because the series it annotates already did.

- **`ds-chart` takes `cursor`.** `'category'` draws a band and a crosshair down the category
  under the pointer, and reports that category to every mark through the shared scales.

  ```html
  <ds-chart cursor="category" [categories]="weeks">…</ds-chart>
  ```

  `'none'` is the default and what every chart drew before. A plot whose marks are themselves the
  hover targets already answers per mark, and two affordances on one plot read as two different
  questions - so the whole-column cursor is the opt-in, not the baseline.

- **`ds-chart` takes `maxSecondary`.** It pins the ceiling of the second value axis the way
  `max` pins the first.

  ```html
  <ds-chart [max]="40000" [maxSecondary]="250000" [categories]="months">…</ds-chart>
  ```

  Two plots read against each other need both axes pinned, or the second one rescales under the
  reader when a series loses its tallest value. Unset, the axis is derived from what the marks
  report, which is what it did before.

- **A published input can now name its own type.** `g[dsColumnSeries]` and `g[dsLineSeries]` ship
  from the package root, and two of their inputs were typed by symbols the root did not export:
  `offsets` by `ChartStackOffset`, and `curve` by a type that existed twice.

  ```ts
  import type { ChartCurve, ChartStackOffset } from '@ids-group-ltd/ids-design-system';
  import { stackOffsets } from '@ids-group-ltd/ids-design-system';
  ```

  `ChartStackOffset` and `stackOffsets` are published, so a consumer composing a stacked plot out
  of the marks can both compute the offsets and annotate them. `LineCurve` and `LineChartCurve`
  were declared character-identical in two files - one internal, one published - and are one
  `ChartCurve` in `core`, beside `ChartAxisMode` and `ChartGaps`. Both curve names were new in
  this release, so nothing shipped under them.

- **`ds-checkbox` gets the three hooks its label already half had.** `--ds-checkbox-row-align`
  for how the box and its label line up, `--ds-checkbox-gap` for the space between them, and
  `--ds-checkbox-message-indent` for the hint.

  ```scss
  ds-checkbox { --ds-checkbox-message-indent: calc(var(--check-glyph-md) + var(--space-2)); }
  ```

  The hint sits under the box, which is where it has always been; set the indent to the box plus
  the gap and it lines up with the label instead. The other two defaults draw what the component
  drew before, so nothing moves on its own.

- **`ds-segmented` takes `joined`.** The segments share their edges instead of floating in a
  padded track: adjacent borders collapse into one hairline and only the two ends carry the group
  radius.

  ```html
  <ds-segmented joined [options]="ranges" [(value)]="range" />
  ```

  It needs `--ds-segmented-segment-border` set, because the shared edge IS the border. Off by
  default, which is the padded track every consumer draws today.

- **`ds-button` takes `align`.** `'center'` is the default and what every button already drew;
  `'between'` pushes the label and a trailing icon to opposite edges.

  ```html
  <ds-button fullWidth align="between" icon="arrowRight">Continue</ds-button>
  ```

  It only shows once something widens the button past its contents, so on an inline button the two
  values are identical unless a message longer than the label widens it. Named values rather than a
  `justify-content` token: the shape a full-width action wants is the label at one edge and the
  arrow at the other, and publishing the CSS property would publish every other flex arrangement
  with it.

- **`ds-pagination` takes `size` and `layout`.** `size` is the sm/md/lg control scale the rest of
  the library uses, unset resolving `DS_CONFIG.control.size` and then `sm`, which is the height the
  pager already had. `layout="spread"` gives the nav full width and pushes the count label and the
  controls to opposite edges; `'grouped'`, the default, keeps them together.

  ```html
  <ds-pagination size="md" layout="spread" [total]="rows.length" [(currentPage)]="page" />
  ```

  A pager under a full-width table needs bigger targets than the dense default, and that is a
  density question the scale already answers everywhere else.

- **Seven styling hooks where a consumer was reaching past the surface.** Each one is a property
  the component tokenised everything around and not itself, so the only way to set it was a rule
  that doubles a class to out-specify our compiled selector.

  ```scss
  ds-badge { --ds-badge-letter-spacing: 0.01em; }
  ds-pagination { --ds-pagination-label-text-transform: uppercase; }
  ```

  `--ds-badge-letter-spacing`; `--ds-pagination-label-letter-spacing` and
  `--ds-pagination-label-text-transform`; `--ds-option-color` for an unselected picker row, whose
  selected sibling had a colour token all along; `--ds-dropdown-empty-color` and
  `--ds-dropdown-empty-font-size` for the panel's no-results line; and
  `--ds-autocomplete-input-font-size`.

  Every default is the value the component already drew, except the pagination label's: `normal`
  and `none` replace the `letter-spacing` and `text-transform` it inherited, so a label under an
  ancestor that sets either stops following it. The no-results line takes `inherit` as its size
  default, which is what it resolved to when it declared none.

  The empty line's tokens are named for the dropdown panel rather than spelled `--ds-empty-*`,
  because `--ds-empty-state-*` is a different component and the two would have sat one hyphen
  apart meaning unrelated things.

- **Each axis says which numbers it is counting, and in whose colour.** A plot carrying two scales
  is ambiguous without both: nothing on the canvas says which line is read against which set of
  numbers, and nothing says what those numbers ARE.

  ```html
  <ds-line-chart yAxisLabel="Sessions" secondaryAxisLabel="Rate, %" [series]="series" />
  ```

  `ds-line-chart` takes `yAxisLabel` and `secondaryAxisLabel`, and tints each axis with the colour
  of the series measured against it - derived, not asked for, since the chart already knows its own
  series colours. The tint appears only where two scales share one plot: on a single-scale chart it
  would restate the marks' own colour in the furniture, and under `'split'` the two plots are
  already apart. `ds-chart` takes the same pair as `axisLabel` and `secondaryAxisLabel`.

  **On a two-scale plot, where the lines cross depends on the scale chosen, not on the data.** One
  dataset drawn twice crosses between February and March with the right axis at 5% and never meets
  with it at 12%, without a single reading changing. Naming and tinting each axis is what tells the
  reader which scale a line is read against.

- **Category labels turn before they thin.** A chart narrow enough for its labels to collide used to
  print them over each other. It now measures the widest one as it actually rendered and spends the
  cheaper remedy first: a 45-degree tilt, which takes about 71% of the label's width across the
  axis, and only past that does it draw every second or every third.

  Rotation is spent before thinning because a tilt costs the reader a glance and a dropped label
  costs them a reading. The widest label decides for all of them: an axis that thinned on the
  average would still collide on the one long name.

- **`ds-scatter-chart`, with a decimation layer behind it.** Two continuous quantities against each
  other - weight against carriage cost, distance against time. The other charts all put categories
  on one axis; this one does not.

  ```html
  <ds-scatter-chart
    xLabel="Weight, kg"
    yLabel="Cost"
    [data]="[{ id: 'road', label: 'Road', data: readings }]" />
  ```

  **It is the only chart whose mark count the caller decides**, so it is the only one that thins its
  own data. SVG degrades by the number of NODES, not readings: the same data as a line with no
  markers and no `interactive` is one `<path>` and as a scatter it is one node per point, while
  Lighthouse warns at about 800 nodes and errors at about 1400 on a page that may hold four more
  charts. Past FOUR times the plot's width in marks - not two, where the saving is invisible and the
  loss of detail is not - the series is decimated, a line under the plot says how many readings
  were thinned, and the annex table still lists every one.

  `decimator` picks how. `'minMax'`, the default, keeps each bucket's highest and lowest reading by
  construction, so the spike a reader is looking for cannot be the point that was dropped; it also
  stays stable while the reader pans, because a bucket's answer does not depend on its neighbours.
  `'lttb'` draws a truer silhouette at the same budget and makes no such promise. `'none'` is the
  caller taking the node budget on themselves.

  The annex table is built when it is OPENED rather than sitting in the DOM shut, where one node per
  reading would undo what decimating the plot saved; opened, every reading is one click away.

  Marks are semi-transparent by default, because the interesting thing is where they pile up: at
  full opacity a cluster of forty and a cluster of four are the same solid disc. `xLabel` and
  `yLabel` are not decoration - without them the reader has two numbers and no idea which is which.

- **`ds-bar-chart` takes a value range, a target and qualitative bands.** Three small additions that
  turn the same bar into a floating bar and into a bullet chart, neither of which needed a component
  of its own.

  ```html
  <ds-bar-chart [data]="[
    { label: 'Build', value: [2, 9] },
    { label: 'Revenue', value: 268, target: 250, ranges: [150, 220, 300] },
  ]" />
  ```

  A row's `value` may be a `[low, high]` pair, and the bar then spans between its own ends rather
  than from zero - what compares a duration and its PLACEMENT at once, which a bar from zero cannot
  do. The ends may be written either way round, because a reader who reverses them means the same
  band. `BarChartRow.value` is now `BarChartValue`, `number | readonly [low: number, high: number]`,
  so code that READS `row.value` as a number stops compiling; code that only writes it is
  unaffected. `target` draws a tick at one reading; `ranges` paints bands behind the bar, given as their
  upper bounds in ascending order.

  The bands take one neutral hue at rising opacity rather than the series palette: a band is a
  backdrop and the bar is the reading, so a second palette behind them would compete with the bars.
  The track's scale holds the target and the outermost band as well as the bars, so a goal above
  every reading still lands on the plot. `--ds-bar-chart-band-color`,
  `--ds-bar-chart-target-color`, `--ds-bar-chart-target-width` and `--ds-bar-chart-target-overhang`
  tune them.

- **`ds-waterfall-chart`: a running total, bar by bar.** What a figure started at, what moved it,
  and what it ended at - the one variant in the family that genuinely cannot be a mode on another,
  because it needs an accumulating level, bars pinned to zero for the totals and its own
  three-colour semantic all at once.

  ```html
  <ds-waterfall-chart caption="Settlement" [data]="[
    { label: 'Billed', value: 1200, kind: 'total' },
    { label: 'Commission', value: -320 },
    { label: 'Net', value: 0, kind: 'total' },
  ]" />
  ```

  Every row adds its `value` to the running sum wherever it sits. A `'delta'`, the default, hangs
  from the level the bar before it left off at; a `'total'` or `'subtotal'` stands on zero at the
  sum reached. A closing total carries `value: 0` and prints the sum, not a change of its own; a
  subtotal differs from a total only in that the chain carries on past it. The order is never
  sorted, because the sequence is the meaning.

  **Colour never carries the meaning alone.** Each bar prints its own sign above it and each bar's
  accessible name says "increase", "decrease" or "total" in words. The new
  `--ds-chart-positive-color` and `--ds-chart-negative-color` point at the palette's two lead hues
  rather than at `--success` and `--error`: a waterfall's up and down are not success and failure,
  and a cost rising is a rise and a bad one. A total takes `--ds-chart-series-default-color`.

  `showConnectors` draws the dashed rule chaining one bar to the next at the level they share.

- **`ds-heatmap-chart`: a matrix of readings coloured by magnitude.** Depot by weekday, hour by
  date, queue by region - the case where the interesting thing is the shape of a whole grid rather
  than any one reading in it.

  ```html
  <ds-heatmap-chart
    caption="Collections a day, by depot"
    [columns]="weekdays"
    [data]="depots" />
  ```

  `data` is one `HeatmapChartRow` per row, each carrying one reading per column.

  **Two things are not optional here.** Colour is the only channel carrying the quantity on the
  grid, so the scale under it and the annex table below it are always drawn - there is no
  `dataTable` input to turn the table off, because WCAG 1.4.1 is not satisfied by a grid of coloured
  squares. Every cell also names its own reading to assistive tech as `row, column: value`.

  **A `null` reading is a hole, not a low value.** It draws as the surface, stays out of the colour
  scale, is inert under `interactive` and never fires `cellClicked`. The ramp's coldest step is a
  real measurement, and painting "we never measured this" with it states a figure nobody recorded.

  `min` and `max` pin the scale and only ever open it further; set both to compare two heat maps by
  colour, because unset each one spans its own readings and the same hue means a different quantity
  on each. `showValues` prints the readings in the cells, drawing each glyph in its own cell's
  colour inverted so it stays legible at both ends of the heat scale, which runs 1.14:1 to 9.07:1
  against white.

- **A heat scale, `--ds-chart-heat-1..8`, separate from the ramp.** Magnitude on a grid is read
  from the step between two colours and nothing else, and the ramp does not give one: its adjacent
  steps are 2.1-3.9 dE apart with 20.7 end to end, so eight cells show about three the eye can
  separate. The heat scale runs the same hue across the full lightness range, 95% to 31%, which is
  6.9-10.6 with 55.0 end to end (OKLab).

  **`--ds-chart-ramp-*` is unchanged, so `ds-funnel-chart` keeps its stage colours.** The two scales
  want opposite things: a funnel's stages are a shape read at a glance, where a stage at either
  extreme reads as a different object rather than as the next step, and a heat map needs every step
  the eye can hold. `ds-heatmap-chart` is the only thing painting with the heat scale.

  Contrast on white runs 1.14:1 to 9.07:1 across it, so a label placed over a heat colour is chosen
  against that cell's own end of the scale rather than once for the whole of it. The dark theme
  carries the same span, flipped.

- **`stack` on the line: several series as a composition rather than as separate readings.** A set
  of lines answers "how is each one doing"; a stack answers "what is the total made of", which is a
  different question and the one a mix of tiers usually asks.

  ```html
  <ds-line-chart stack="stacked" [categories]="months" [series]="tiers" />
  ```

  `'stacked'` starts each series where the one below it ended; `'normalized'` divides by the
  category's own total, so every category is full and the axis reads in shares. `'none'` stays the
  default and nothing changes without asking. Only a series with `area: true` fills - the lines sit
  on the running total either way.

  A stacked band fills down to the series below it rather than to the baseline, and the boundary is
  a 2px stroke in the surface colour rather than a drawn rule, which survives print and
  colour-vision deficiency. Stacking runs per AXIS, so a secondary-axis series never piles onto one
  measured against the primary. `stack="stacked"` and `yAxisMode="split"` are different things:
  series on top of each other, against two plots one above the other.

- **`curve` on the line: `'linear'`, `'step'` or `'smooth'`.** A line drawn between two readings is
  a claim about what happened in between, and this is where the claim is made. `'linear'` stays the
  default and asserts nothing the data does not say.

  ```html
  <ds-line-chart curve="step" [categories]="months" [series]="baseRate" />
  ```

  `'step'` holds each reading until the next, which is what a quantity that CHANGES at a moment
  actually did - a price, a headcount, a rate - rather than drifting between two. `'smooth'` is a
  monotone cubic, NOT a Catmull-Rom: a Catmull-Rom overshoots, drawing a trough below a minimum the
  data never reaches, which on a chart is a reading that does not exist.

  A filled series follows the same curve, so the fill and its own line share one edge instead of the
  line floating off a straight-edged fill. `dsLineSeries` takes the same input with the same three
  words, so a composed plot and a preset draw one series the same way.

- **The chart container's marks are published API.** `ColumnSeriesComponent`,
  `LineSeriesComponent`, `ReferenceLineComponent` and `ReferenceLabelComponent`, with
  `ColumnSeriesPoint` and `LineSeriesData`, come from the package root as well as
  from `@ids-group-ltd/ids-design-system/components/chart`, and every input on them is documented.

  In `0.13.3` they sat in the `components/chart` entry point still marked `@internal`: reachable
  there, but not public API. Nothing about how they are written
  changes - a mark is still an ATTRIBUTE selector on a real `<svg:g>`. What changes is that a combo
  plot, the case the container exists for, can now be assembled by a consumer: no preset draws
  columns and a cumulative line on two axes, so the marks were the only route to it and were not
  reachable as one.

### Changed

- **A `+N` strip says how many toasts are waiting.** `maxVisible` has always queued the extras, and
  nothing on screen said so: past the cap a toast simply did not appear. The region now renders a
  small counter at the end the next toast will come from - above a top-anchored stack, below a
  bottom-anchored one - and it disappears the moment the queue empties. It is `aria-hidden`, because
  `ToastService` announces every toast through the LiveAnnouncer, queued ones included, so a reader
  has already heard everything it counts.

  On by default. Turn it off with `DS_CONFIG.toast.showQueueCount: false` or
  `[showQueueCount]="false"` on `ds-toast-region`. Colours come from
  `--ds-toast-queue-bg-color` and `--ds-toast-queue-text-color`.

- **`ds-toast`, `ds-banner` and `ds-alert` grow into place instead of fading in.** Their default
  `--ds-<surface>-enter-keyframes` moves from `ds-fade-in` to `ds-scale-in`, so all three now enter
  the way `ds-modal` and the overlay panels already do: opacity plus a growth from `--ds-*-enter-scale`,
  which each of them has declared since motion shipped and which `ds-fade-in` never read. They grow
  from their own centre - `transform-origin` stays unset, as on `ds-modal`.

  `--ds-toast-enter-offset`, `--ds-banner-enter-offset` and `--ds-alert-enter-offset` keep their
  values and their meaning: a preset that travels reads them, so pointing a surface at `ds-slide-in`
  still gets that surface's own distance and direction. Set
  `--ds-toast-enter-keyframes: ds-fade-in` to keep the old entrance.

  A value already set on `--ds-toast-enter-scale`, `--ds-banner-enter-scale` or
  `--ds-alert-enter-scale` did nothing under `ds-fade-in` and takes effect now - a `0.5` left behind
  becomes a visible lurch rather than a no-op.

- **Portaled panels grow out of their trigger instead of fading in place.** The default of
  `--ds-overlay-enter-keyframes` moves from `ds-fade-in` to `ds-scale-in`, so every panel carrying
  `ds-overlay-pane` - select, autocomplete, multi-select, the three pickers, popover, tooltip, the
  chart tooltip and the menu submenu - grows out of its trigger.

  ```css
  :root { --ds-overlay-enter-keyframes: ds-fade-in; }
  ```

  `--_overlay-enter-origin` is already resolved per placement, so a panel below its trigger grows
  from its top edge and one above it from its bottom. Drawer, bottom-sheet, toast, banner and alert
  each name their own keyframe and never read this one; drawer and bottom-sheet keep their edge
  slide, and the other three change under their own entry.

- **`ds-line-chart` measures its plot instead of scaling a fixed viewBox.** One unit is one CSS
  pixel, the axis gutter widens to the widest tick label as it actually rendered, and the category
  labels tilt then thin when they stop fitting - the same treatment `ds-column-chart` and
  `ds-chart` already got.

  **`--ds-line-chart-plot-height` now drives the plot.** It has been declared since the chart
  shipped and reached only the loading skeleton: the plot was a 640x320 viewBox scaled to the
  card's width, so the token parsed and changed nothing. The empty and error boxes reserve the
  height the plot will take rather than a width-derived ratio, so the card no longer moves when the
  last series is switched off.

  Escape now releases the category cursor and its panel together, a tap latches the cursor the way
  a tap on a column latches that column, and a pointer that leaves the plot for the tooltip panel
  keeps it open. None of that was reachable before without a pin.

- **Exported class member surface grew, and some members were renamed or retyped - this matters
  only if you SUBCLASS one of these.** `ButtonComponent` gained `align`; `SegmentedComponent` gained
  `joined`; `PaginationComponent` gained `layout`, `size`, `sizeResolved` and `navClass`;
  `DropzoneComponent` gained `emitPicked`; `ToastRegionComponent` gained `showQueueCount` and
  `queuedLabel`; `AlertComponent` and `BannerComponent` each gained
  `announceResolved` and widened `announce` to `boolean | null`. `ChartComponent` gained 21 members -
  the cursor, second-axis and category-label machinery, `cursor`, `cursorPin`, `cursorPinned`,
  `cursorPointer`, `releaseCursor`, `maxSecondary`, `axisLabel`, `secondaryAxisLabel`,
  `tooltipLingerMs` and `defaults` among them. `LineChartComponent` gained 24 (`curve`, `stack`,
  `yAxisLabel`, `secondaryAxisLabel`, `plot`, `plotHeight` and the rest) and lost 51 protected and
  private geometry members now that its plot is drawn by `ds-chart`, so a subclass that overrode one
  of those overrides nothing. `LineSeriesComponent`, public now, gained 18 (`curve`, `dimOthers`,
  `highlighted`, `patterns`, `pinOnClick`, `stacked`, `tooltipAnchor` and their helpers). Every
  chart gained the `defaults` and the table rows it hands `ds-chart-data-table`:
  `BarChartComponent`, `ColumnChartComponent`, `FunnelChartComponent`, `PieChartComponent` and
  `LineChartComponent`, and the three new ones, `HeatmapChartComponent`, `ScatterChartComponent` and
  `WaterfallChartComponent`, carry the same members.

  Some members changed name or type rather than only being added. `AccordionComponent` traded
  `multi` for `multiple`, `TableComponent` `sortDir` / `sortDirChange` for `sortDirection` /
  `sortDirectionChange`, and `PieChartComponent` `thickness` for `innerRadius`.
  `AppLayoutComponent.scrollReset`, `DatePickerComponent.value` and several chart members
  (`ChartComponent.secondaryAxisMode`, `LineChartComponent.gaps` / `pointClicked` / `yAxisMode`,
  `PieChartComponent.data`) changed type with the symbol renames, so an override typed against the
  old symbol stops compiling.

  Subclassing a DS component is unsupported, but a release that only adds can still fail such a build
  on a name collision: TS4114 demands `override` for a same-named member, TS2416 fires where the
  signature differs. Rename your own member, or add `override` where it genuinely means the same
  thing.

### Fixed

- **`ds-chart`'s error message was grey.** Its template marks the message `is-error`, but `ds-chart`
  carried no colour rule for that state, so "Could not load the data" printed in the same grey as
  "No data". It is `--error` red now, matching what the other charts already showed.

- **The funnel and pie focus hooks did nothing.** `--ds-funnel-chart-focus-color` / `-width`, and
  the pie's pair (`--ds-donut-chart-focus-color` / `-width` before the rename, now
  `--ds-pie-chart-focus-color` / `-width`), resolved into a private name no rule read: an override
  parsed, cascaded and changed no pixel. Each now points its pair at `--ds-chart-focus-ring-color`
  and `--focus-ring-*`, which draws the ring. With neither pair set, a focused funnel stage or pie
  slice draws no ring: the private pair falls back to `--focus-ring-*`, which the same chart sets
  from that pair, and the cycle leaves both invalid. Set the chart's color and width tokens to get
  the ring back.

- **`--ds-table-head-height` is in the token reference, and the loading scrim honours it.** The
  hook, spelled `--ds-table-head-h` before this release, only ever existed as a string inside a
  template attribute rather than in a stylesheet, so the token reference never listed it.

  ```css
  ds-table { --ds-table-head-height: 56px; }
  ```

  It resolves through `--_table-head-height` on the host now, between the pin and the measured row
  height the component publishes: a consumer value wins over the measurement, the measurement wins
  over the 40px floor.

- **An indeterminate `ds-bar` is on the track for most of its cycle instead of under half of it.**
  The sliding chunk ran on the standard ease curve, which decelerates into the end of a transition -
  on a loop there is no end, so it crawled at both extremes, where the chunk sits outside the track.
  Over one 1400ms cycle the chunk was at least partly on the track 48.3% of the time; it is now
  86.7%. On a short track that reads as an empty bar rather than a busy one.

  ```html
  <ds-bar indeterminate ariaLabel="Importing" />
  ```

  Nothing to change - the geometry, the duration and the 30% chunk are the same, and the reduced-motion
  branch still replaces the animation with a full track.

- **`--ds-line-chart-swatch-size` reaches the swatch again.** The token has been declared and
  documented since the chart shipped and reached nothing since the legend became its own component:
  the line chart kept the `.legend-swatch` rule that read it and stopped rendering the element.

  ```css
  ds-line-chart { --ds-line-chart-swatch-size: 14px; }
  ```

  The chart forwards it to `--ds-chart-legend-swatch-size` now, and the three dead legend rules are
  gone. The default is unchanged: the legend's own `--space-2-5` is the 10px the token always
  claimed, so no chart moves.

- **A rule on `.ds-overlay-pane` now decides an autocomplete's panel radius, and either picker's
  panel background.** Each picker declared its panel tokens with a fallback, so they always computed
  to something and were always copied onto the portaled pane as an inline style - which outranks a
  pane-class rule, the only route a consumer has to a panel that is not a descendant of its trigger.
  A shell that squared `--ds-radius-panel` and re-rounded `.ds-overlay-pane` got the rounded panel
  everywhere except autocomplete; multi-select never pinned a radius, only its background.

  ```scss
  .ds-overlay-pane .dropdown-panel { border-radius: var(--ds-radius-panel); } // now applies
  ```

  Nothing moves at the defaults: unset, the tokens fall to the same values the shared panel
  stylesheet has always supplied. `--ds-autocomplete-panel-radius`,
  `--ds-autocomplete-panel-bg-color` and `--ds-multi-select-panel-bg-color` still reach the pane and
  still outrank a pane-class rule, which is what they are for.

- **The two greens in the chart palette are no longer the same colour.**
  `--chart-categorical-6` moves from `hsl(152deg 58% 41%)` to `hsl(148deg 58% 41%)`, which takes it
  from 5.3 to 6.3 away from `--chart-categorical-2` in OKLab. The palette holds itself to 6, below
  which two slots read as one to somebody glancing between a line and its legend swatch - and these
  two sit four positions apart, so a chart with six or more series handed out both.

  All 28 pairs in the palette now sit at least 6 apart.

  Nothing to change in a consumer - the token name is the same and the new hue arrives with it.

- **A chart tooltip no longer runs off the screen.** The panel is never shrunk by the overlay, so a
  tall one - a grouped chart's every series, or a long custom template - was pushed until its top
  met the viewport and the rest ran off the bottom, where nothing could reach it.

  It now stops at the viewport height less the 12px margin the overlay pushes against, and scrolls
  past that. A panel that already fits is untouched.

- **A line series measured against the first axis no longer raises an empty second one.** A mark
  registers a contribution per axis, and a line series registers both whether or not it uses them,
  so a plot whose series all read against the left axis grew a right-hand axis labelled `0` the
  whole way down, and lost the plot width its labels reserved.

  The predicate now counts reported VALUES rather than reporters, which fixes it for any mark that
  registers an axis it does not use, not only the line series. A plot that genuinely carries two
  scales is untouched.

## 0.13.3 — 2026-09-17

### Breaking

- **`ds-progress` and `ds-meter` are one component, `ds-bar`.** They were the same drawing — the
  same 6px pill track, the same fill, the same clamping — under two names, and the only thing that
  genuinely differed between them is now an input. `ds-meter` shipped in `0.13.2` and existed for
  that one release.

  ```html
  <ds-bar [value]="68" ariaLabel="Manifest upload progress" />
  ```

  **For a progress bar the rename is the whole upgrade.** `value`, `max`, `variant`,
  `indeterminate`, `target` and `ariaLabel` keep their names and their defaults, and `semantics`
  defaults to `'progress'` — so a renamed `ds-progress` behaves exactly as it did.
  `ProgressComponent` and `MeterComponent` are both `BarComponent`, and `ProgressVariant` is
  `BarVariant` — all from `@ids-group-ltd/ids-design-system/components/bar`. A subclass of either
  old class stops building; there is one class to extend now, and it carries every member both of
  them had, except that `MeterComponent`'s protected `clamped` and `percent` are `clampedValue` and
  `valuePercent` there.

  **A renamed `ds-meter` needs one more edit.** It was `aria-hidden` unless `ariaLabel` named it;
  `ds-bar` announces as a progress bar by default. Add `semantics="none"` where the figure is
  printed beside the bar, or `semantics="meter"` where the bar is the only place the measurement
  appears. Nothing errors and nothing looks different — the change is entirely in what a screen
  reader says, which is what the input exists to control.

  **`ds-bar-chart` is a different component and is NOT renamed.** `ds-bar` is a prefix of it, so a
  find-and-replace without a word boundary will corrupt every chart in the app.

- **The `--ds-progress-*` and `--ds-meter-*` tokens are `--ds-bar-*`.** `-height`,
  `-track-color`, `-target-color`, `-target-width` and `-min-width` keep their suffix.
  `--ds-progress-bar-color` and its `-success` / `-warning` / `-error` siblings became
  `--ds-bar-fill-color` and siblings, because `--ds-bar-bar-color` stutters. The global
  `--progress-h` is `--bar-h` — same 6px, under a name that still describes the component.

  An override of a name nothing reads still parses, so a missed rename reports nothing and the bar
  simply returns to its default look.

- **`valueFormat` on `ds-column-chart` and `ds-line-chart` now receives a second argument,
  `location`.** The axis tick and the annex table used to share one call with no way to tell them
  apart, so a custom formatter that spelled a value out in full also spelled it out on the axis,
  where a fixed-width column has room for `1.2M` and not `1,248,392`. The callback is
  `(value: number, location: ChartFormatLocation) => string` now, called with `'tick'` for the axis
  label and `'tooltip'` everywhere else a value is printed in full (the annex table, the generated
  description, the value beside a mark).

  ```ts
  valueFormat: ChartValueFormat = (value, location) =>
    location === 'tick' ? compact(value) : spelled(value);
  ```

  An existing one-argument callback still compiles and still runs, because JavaScript ignores an
  argument nothing reads. It cannot tell the two locations apart, though, so it prints the same
  string for both, which is un-abbreviated on the axis wherever the built-in default used to
  abbreviate for it.

  **The built-in default changed too, with no callback involved.** It used to pick one suffix for
  the whole axis, from the axis's own step, so `800K` and `1600K` shared a unit even past a million.
  It now compacts each tick by that tick's own magnitude, so the same axis prints `800K` beside
  `1.6M`. An axis whose ticks cross a thousand, million or billion boundary renders differently.

### Added

- **`ds-chart` is importable, with the marks that draw inside it.** The container the column chart is
  built inside now ships as its own entry point,
  `@ids-group-ltd/ids-design-system/components/chart`, for a plot the five presets do not cover - a
  combo of columns and a cumulative line being the case that asked for it. It owns the frame, the
  axes, the gridlines, the caption, the legend slot, the annex table and the generated description;
  what is drawn against its scales is projected in.

  ```html
  <ds-chart [categories]="months" secondaryAxisMode="rounded">
    <svg:g dsColumnSeries [data]="billed" />
    <svg:g dsLineSeries [data]="cumulative" axis="secondary" />
  </ds-chart>
  ```

  The entry point carries the container, the two series marks, the reference line and label marks,
  their data types, the scales token and the two geometry helpers. A mark is an ATTRIBUTE selector
  on a real `<svg:g>`, never an element of its own: an element the SVG specification does not know
  renders nothing, its children included. Write `<svg:g dsColumnSeries>`, not `<ds-column-series>`.

  **Reach for a preset first.** `ds-bar-chart`, `ds-column-chart`, `ds-donut-chart`,
  `ds-funnel-chart` and `ds-line-chart` carry the accessible defaults, and the container is the
  escape hatch for the plot none of them draws. The marks are Angular components, so nothing
  projected from React or from `@angular/elements` can draw inside the canvas.

- **A column chart can carry several named series per category.** Hand `data` a list of
  `ColumnChartSeries` instead of a flat list of points and every category carries one column per
  series, keyed by a `ds-chart-legend` under the plot. `stack` decides how they share the band:
  `'none'` (the default) and `'grouped'` stand them side by side, `'stacked'` puts each on top of
  the one before it, and `'normalized'` stacks then divides by the category's own total, so every
  band is full and the axis reads in shares.

  ```html
  <ds-column-chart stack="grouped" [data]="[
    { id: 'billed', label: 'Billed', data: months },
    { id: 'committed', label: 'Committed', fill: 'hatched', data: forecast },
  ]" />
  ```

  A series takes one colour for all of its marks and a series-wide `fill` paints every one of its
  columns, where a flat list of points still colours each mark by its own position — the marks of a
  single-series chart ARE the categories and the marks of a grouped one are not. A flat list still
  takes the whole band, so a chart that was passing one stays exactly as it was. Stacked segments
  are separated by a 2px gap in the surface colour rather than a drawn rule, which survives print
  and colour-vision deficiency. `stack="stacked"` and `ds-line-chart`'s `yAxisMode="stacked"` are
  different things: series on top of each other, against two plots one above the other.

- **`ds-donut-chart` takes `partOfWhole`, so its percentages can be turned off.** A ring always
  printed each slice's share and there was no way to stop it. The input defaults to `true`, which is
  what the ring already did, so nothing changes without asking; `[partOfWhole]="false"` drops the
  percentage from the legend, the tooltip and the data table alike.

  It starts `true` here and `false` on every other chart on purpose: a ring IS parts of one whole, so
  a share of the total is a real quantity whatever the data, while a column chart's categories often
  sum to a number nobody can point at.

- **A column can be drawn as a projection rather than a reading.** A `ColumnChartPoint` that sets
  `fill: 'hatched'` keeps its colour and takes a striped texture over it, which is what separates a
  forecast from a settled figure without spending a second hue on it.

  ```html
  <ds-column-chart [data]="[
    { label: 'Jun', value: 3020 },
    { label: 'Jul', value: 3400, fill: 'hatched' },
  ]" />
  ```

  Texture is the encoding that survives greyscale, print and colour-vision deficiency, so it carries
  the distinction where a lighter tint of the same colour would not. The chart reads nothing into the
  flag: which columns are projections is a fact only the caller has. `--ds-chart-hatch-color` and
  `--ds-chart-hatch-width` tune the stripes.

- **A second value axis on `ds-chart`, and a line series to draw against it.** A plot can now carry
  two quantities at two magnitudes - a figure per month on the left axis, the running total of
  those months on the right - instead of flattening one of them against the other's scale.

  `secondaryAxisMode` takes the same four words `ds-line-chart`'s `yAxisMode` does:
  `'rounded'` (the default) hangs the second scale on the first's own gridlines at a round step,
  `'exact'` ends it on its largest reading, `'independent'` scales and grids it on its own, and
  `'stacked'` draws two plots one above the other over a shared category axis. `ChartAxisMode` and
  `ChartAxis` are exported from the core entry point, and `LineChartAxisMode` is now an alias of
  the first.

  `axisColor` and `secondaryAxisColor` paint each axis's tick labels in the colour of the marks
  measured against it, which on a two-scale plot is the only thing that says which numbers a mark
  is read against. They are inert while the plot has one axis.

  `--ds-chart-area-opacity` sets how solid the band a line series fills down to its baseline is.

- **Reference lines and bands on `ds-column-chart`.** `thresholds` draws a target, a budget or an
  SLA across the plot, behind the columns.

  ```ts
  thresholds: ChartThreshold[] = [
    { value: 85, label: 'Target' },
    { value: 73, label: 'Escalation', dash: 'dotted' },
  ];
  ```

  Each entry is ONE number, not a coordinate pair: `value`, plus an optional `label`, `color` and
  `dash` (`'solid' | 'dashed' | 'dotted'`, default `'dashed'`). `to` turns the same object into a
  band filled between two readings instead of a line, written in either order.

  A threshold widens the value axis to hold it, so a target above every column still lands on the
  plot rather than off it. It is also named in the generated description - "Target at 85, 2 of 5
  points above" - so the line reaches a reader who cannot see it.

  Four tokens set the default look: `--ds-chart-threshold-color`,
  `--ds-chart-threshold-band-opacity`, `--ds-chart-threshold-dashed-pattern` and
  `--ds-chart-threshold-dotted-pattern`. A threshold's own `color` overrides the first.

### Changed

- **Hovering a legend item behaves as hovering the mark it names.** On `ds-donut-chart` the panel
  opened over the legend row rather than over the arc, so the reader was pointed at the label
  instead of the slice; on `ds-funnel-chart` the stage rows did nothing at all. Both now open the
  same panel over the MARK and, under `dimOthers`, dim the rest of the plot, identical to pointing
  at the arc or the bar directly, and the keyboard route follows wherever the legend carries it.

- **A chart tooltip opens against its mark, not against the row that holds it.** `ds-bar-chart`
  anchored the panel to the whole row — label, value and track — so it opened a row-height above
  the bar it was about: 46.7px from the mark where the gap asks for 6. It anchors to the bar now.
  The gap itself went from 12px to 6px on every chart, because a panel a finger's width off its
  mark reads as floating free of it.

- **`ds-column-chart`'s `data` input accepts a second shape.** It was
  `readonly ColumnChartPoint[]` and is now
  `readonly ColumnChartPoint[] | readonly ColumnChartSeries[]`. Passing one is unaffected; reading
  the signal back or overriding it is not. `chart.data()[0].value` stops type-checking without a
  narrowing test, because a `ColumnChartSeries` has no `value`, and a subclass redeclaring `data`
  fails on TS2416 since an input signal's type is invariant. Narrow on the shape —
  `'data' in entry` — wherever the values are read back.

- **Exported class member surface moved — only matters if you SUBCLASS one of these.**
  `ProgressComponent` and `MeterComponent` are gone; `BarComponent` carries every member both of
  them had, with `MeterComponent`'s `clamped` and `percent` renamed `clampedValue` and
  `valuePercent`. `ChartTooltipDirective`, internal and not exported from the package root, gains
  `dsChartTooltipPreferBelow`. `ColumnChartComponent` moved its drawing into the shared container
  and took several series, so it gained `thresholds`, `categories`, `geometry`, `tableRows`,
  `viewHeightPx`, `skeletonHeightPx`, `stack`, `resolvedSeries`, `seriesRefs`, `pinnedSeries`,
  `slotCount`, `offsets`, `offsetsFor`, `multiSeries`, `legendItems` and `axisFormat`, and lost the
  members that used to draw its marks. `DonutChartComponent` gained
  `partOfWhole`, `arcAt`, `isDimmed` and three legend handlers; `FunnelChartComponent` gained
  `isDimmed` and `onRowEnter`. A subclass declaring any of those names collides: rename yours, or
  add `override` where it genuinely means the same thing.

- **A held mark opens its panel BELOW itself.** The Unpin control sits at the plot's top edge, and
  a panel opening upward from a mark in the upper half landed on top of it. No z-index fixes that
  — the panel is portaled to the body, and an app layout that isolates its stacking context traps
  the chart's own chrome underneath whatever number it carries. Below-first while pinned keeps the
  two apart; the other three fallbacks still catch a mark with no room under it.

- **Moving a pin from one mark to another no longer blinks.** The press that re-aimed it cleared
  the pin first and the click set it again, so the Unpin control and the held mark's styling
  unmounted for a frame between the two marks. A press that lands on another mark of the same
  chart is a re-aim now, and `pinned` never goes false across it.

- **The pin glyph is a drawing pin seen from the side.** Head-on it read as a lamp or a bell at the
  14px the charts badge it at.

- **A focused mark wears the app's own focus colour.** The ring was white with a dark halo, which
  on a coloured band read as an artefact rather than as a focus indicator. It is
  `--focus-ring-color` with a light keyline around it now — the keyline is what separates it from
  a mark of the same hue family, which is why the indicator is two tones either way.
  `--ds-chart-focus-ring-color` and `--ds-chart-focus-halo-color` still set both; `white` and
  `var(--static-ink)` are the old pair.

- **A chart with nothing to draw keeps its axes.** `ds-line-chart` and `ds-column-chart` render
  the value axis and the category axis behind the empty, error and no-visible-series messages, so
  the message stands in a plot rather than in a blank card. Without ticks or labels: there is no
  data to scale them against. The charts with no axes — donut, funnel, bar — are unchanged.

- **`ds-bar` cannot collapse to nothing in a content-sized cell.** It carries
  `min-inline-size: 3rem`, overridable through `--ds-bar-min-width`. A box sized to its content —
  a `width: 'content'` table column, a shrink-to-fit flex or grid item — is sized by what its
  contents contribute intrinsically, and a bar that is 100% of its cell contributes nothing: one
  alone in such a cell measures 0px wide. `ds-progress` had no floor, so a bar that used to
  disappear there is now visible; set the property to `0` for the old behaviour.

- **`indeterminate` is ignored unless `semantics` is `'progress'`.** Only a task has an unknown
  duration. Nothing that set it on `ds-progress` is affected, because that is the default.

- **An indeterminate `ds-bar` holds still under reduced motion.** With `prefers-reduced-motion:
  reduce` it fills its track without moving; `ds-progress` kept its sweep, at half speed.

### Fixed

- **A pinned tooltip survives a scroll.** Every chart tore its panel down on any scroll of the page,
  and because a pinned mark deliberately stops answering the pointer, nothing brought it back: the
  pin badge and the Unpin control were left sitting over a reading that was no longer on screen.
  The panel repositions now instead of closing. An unpinned tooltip still goes away on both a scroll
  and the pointer leaving, as it always did.

- **A column chart plots a domain that reaches below zero.** Every scale clamped its floor at zero,
  so a negative reading drew nothing at all and a P&L series rendered as a flat baseline with no
  warning. The axis now spans the data, the zero line is drawn where it falls inside the plot, and a
  negative column grows downward from it with its value label at its own tip. Room for that label is
  reserved only when the domain actually reaches below zero, so an all-positive chart keeps its
  height.

- **The value axis fits its own labels.** The gutter was a fixed width, which an SVG canvas CLIPS
  rather than overflows, so a locale whose compact numbers are wider than an English `3.5k` lost the
  leading digit of every tick - `3,5 тыс.` printed as `,5 тыс.`. The gutter is measured from the
  widest label that actually rendered, and `axisGutter` is the floor it will not go below.

## 0.13.2 — 2026-09-15

### Added

- **`ds-line-chart` takes `annotations`, so a reading can be labelled without a pointer.** The
  chart had tooltips and nothing else, which leaves a peak unreadable in a screenshot, a printed
  page or a slide. An annotation names a `categoryIndex`, a `label` and optionally the `seriesId`
  it belongs to — left out, the first plotted series.

  ```html
  <ds-line-chart
    [categories]="months"
    [series]="series"
    [annotations]="[{ categoryIndex: 5, label: 'Peak' }]" />
  ```

  It sits above the reading, below it where the plot has no room — a peak is at the top, which is
  exactly where a label clamped upward lands on its own marker — and anchors to its own edge within
  48 view units of one rather than hanging outside the viewBox. A label whose series is hidden or
  whose reading is `null` draws nothing, so a legend toggle takes its annotations with it.

  It is drawn with a halo rather than a box (`paint-order: stroke`), so it survives crossing the
  line and a gridline; `--ds-line-chart-annotation-color`, `-font-size`, `-weight`, `-halo-color`
  and `-halo-width` set its look. The plot's own text is `aria-hidden`, so the labels are read out
  of the chart's description instead — `Noted: Peak; Launch.` after the series sentences — rather
  than twice from the plot and the annex table.

- **`ds-progress` takes a `target`, drawn as a hairline across the track.** A second point on the
  same 0–100 scale, so a bar reads actual against a goal or a baseline in one glance instead of
  standing alone. Clamped like `value`, ignored while `indeterminate`, and unset draws nothing —
  every existing bar is unchanged.

  ```html
  <ds-progress
    [value]="62"
    [target]="75"
    ariaLabel="Resolved 62% against a 75% target" />
  ```

  **Name the comparison in `ariaLabel`.** `role="progressbar"` announces one value and has no second
  to carry, so the mark is visual only — a reader on a screen reader gets the target from the label
  or not at all. `--ds-progress-target-color` and `--ds-progress-target-width` set its look.

- **`ds-progress` takes a `max`, so `value` can be the real count.** The bar read 0–100 only and
  pinned `aria-valuemax="100"`, which made a caller convert their own numbers before us and put the
  percentage into the accessible name in place of the measurement. `max` is the scale `value` and
  `target` are read against; at its default of 100 they are percentages, so every existing bar is
  unchanged, and `aria-valuemax` follows it.

  ```html
  <ds-progress [value]="37" [max]="80" [target]="64" ariaLabel="Requests handled" />
  ```

  That bar fills to 46.25% and reports `aria-valuenow="37"` of `aria-valuemax="80"` — "37 of 80"
  rather than "46%". A `max` of zero or less falls back to 100, because a scale with no width has no
  fraction to draw.

  `ProgressComponent` grows by the `target` and `max` inputs; a subclass declaring either name stops
  building until it renames the member or marks it `override`.

- **`ds-bar-chart` and `ds-column-chart` take `partOfWhole`, and it is what states each mark's share
  of the total.** A share of a total is only a real quantity when the marks are parts of one whole.
  Visitors per funnel stage, or response time per endpoint, sum to a number nobody can point at, and
  a percentage of THAT is arithmetic dressed as a fact — so the charts no longer state one unless
  you say the relationship holds:

  ```html
  <ds-bar-chart partOfWhole caption="Spend by department, share of the budget" [data]="rows" />
  ```

  With it set, the share appears in two places: the tooltip's second line, and a `Share of total`
  column in the data table. The column is headed `Share of total` rather than `Share` because
  `ds-bar-chart` already prints a percentage beside each row and that one is the share of the
  LARGEST row — two different questions, each now labelled with the one it answers.

  The cell is empty where there is no share to state: a lone mark, or a reading that is zero,
  negative or non-finite. Negatives are left out of the total rather than subtracted from it.

- **Every chart takes `pinOnClick`, which holds a reading in place.** Clicking a mark keeps it, its
  tooltip and — with `dimOthers` — the dimming of everything else, so the comparison survives the
  pointer leaving the chart entirely. Hovering another mark does not move it; clicking another one
  does. Clicking the pinned mark again, pressing outside it, or Escape releases it. Off by default:
  a click is already the drill-down hook, and a mark left lit after the pointer has gone needs a
  reader who knows why it is lit.

  ```html
  <ds-column-chart interactive pinOnClick dimOthers [data]="points" />
  ```

  A pinned mark carries a pushpin on an opaque disc — over the row's bar, the column, the middle of
  the ring's arc, the middle of the funnel band — because the panel can sit anywhere on screen and
  the reader needs to see WHICH mark is held. An `Unpin` button appears centred above the plot while
  anything is pinned, so the way out is on screen rather than a key nobody was told about, and it is
  centred because a corner competes with the donut's legend and the column chart's value labels.

  The click output fires either way — pinning is a state, not a handler. On `ds-line-chart` the pin
  hangs off the data markers rather than the plot, so Enter and Space pin from the keyboard too.

- **`ds-meter` — one track and one fill, for a measurement inside a table cell.** Every chart is a
  block with a caption, a legend and an annex table; in a 60px cell that chrome is the whole cell,
  so a micro-bar in a column had nothing to be built from. This is the mark on its own — no
  caption, no legend, no tooltip, no table.

  ```html
  <ds-meter [value]="row.rate" [max]="highestRate" />
  ```

  `max` is the ceiling the column is read against, usually the column's own largest value, so the
  longest bar fills its track and the rest are its share; at its default of 100, `value` is a
  percentage. A value past `max` fills the track rather than overflowing, a negative one draws
  nothing, and a `max` of zero or less falls back to 100.

  **It is not `ds-progress`.** That reports how far a task has got and says so with
  `role="progressbar"`, which a table of two hundred measurements would announce two hundred times.
  A rate, a score or a count against a ceiling has no beginning and no completion. So the mark is
  `aria-hidden` unless `ariaLabel` names it — leave it unset where the cell prints the figure
  beside the bar, and set it where the bar is the only place the number appears.

  The fill takes `--ds-meter-fill-color`, so a column is coloured once in a stylesheet rather than
  once per row; the `color` input overrides it where the colour carries meaning.
  `--ds-meter-height`, `--ds-meter-track-color` and `--ds-meter-radius` set the rest.

  The bar is as wide as the box it sits in, so the column decides. A box sized to its content —
  `width: 'content'` on `ds-table`, or a shrink-to-fit flex or grid item — is sized by what its
  contents contribute intrinsically, and a bar that is 100% of its cell contributes nothing: one
  alone in such a cell comes out 0px wide. The host carries a `min-inline-size` of `3rem` so it
  cannot vanish, overridable through `--ds-meter-min-width`; give it a width of your own where the
  bar should be a fixed size.

- **A `ds-bar-chart` row takes `segments`, which divide its bar without shortening it.** A row that
  is a distribution had to become its own chart. The bar keeps its own length — the row's share of
  the largest row — and the parts say what it is made of, so one plot answers both "which department
  spends most" and "on what".

  ```html
  <ds-bar-chart [data]="[{ label: 'Engineering', value: 412000, segments: [
    { label: 'Salaries', value: 291000 },
    { label: 'Tooling', value: 74000 },
  ] }]" />
  ```

  The parts are sized against their OWN sum and always fill the bar: a set that does not add up to
  `value` is a data error, and a gap left where the difference is would read as an unlabelled
  category. They are categories rather than one series, so they take the categorical palette in
  order and the row's `color` goes unused; `color` on a segment overrides its slot. Each part gets
  its own row in the annex table under the row it belongs to. Pair the chart with `ds-chart-legend`
  to name them — the parts carry no text of their own.

- **A `ds-bar-chart` row takes `detail`, a second reading printed under the label.** A row often
  encodes a ratio — 12,400 visitors against 456 requests — and the bar can draw only one of the two
  numbers, so the other had nowhere to go. It is passed already formatted, because the row knows
  what its second number means and the chart does not, and it reaches the annex table too.

  ```html
  <ds-bar-chart [data]="[{ label: 'Organic', value: 12400, detail: '456 requests · 3.7%' }]" />
  ```

- **`ds-line-chart` takes `max` and `maxSecondary`, which pin the value axis.** A panel that opens
  one subject at a time derived a different axis for each, so two plots with the same gentle wiggle
  could be four times apart in value with nothing on screen saying so. A fixed maximum is what makes
  two renders comparable.

  ```html
  <ds-line-chart [max]="5000" [categories]="months" [series]="series" />
  ```

  Null, the default, keeps the derived axis, so an existing axis is unchanged. A maximum below
  the data does not clip it — the larger of the two wins, because hiding a reading is worse than
  more headroom than you asked for. `maxSecondary` does the same for the axis a series reaches with
  `axis: 'secondary'`.

- **`ds-funnel-chart` takes `drop`, which says what its Drop column reports.** `'relative'`, the
  default, is the share that leaked at that stage and is what the column always showed;
  `'absolute'` is the COUNT that leaked, and `'none'` takes the column out. Both figures answer a
  real question and they are not the same question: on a settlement funnel the share is a talking
  point and the count is a re-targeting job. The count was recoverable by subtracting two rows, and
  a reader should not have to.

  ```html
  <ds-funnel-chart drop="absolute" [stages]="stages" />
  ```

- **Every chart takes `tooltipLingerMs`, and `DS_CONFIG.chart.tooltipLingerMs` sets it app-wide.**
  How long the panel stays after the pointer leaves the mark. See the tooltip entry under Changed
  for what the default does and when to raise it.

- **A pinned mark offers an `Unpin` control, and says which mark it is.** All five charts render
  a pill button above the plot while a mark is pinned — Escape already released one, and a control
  that says so is what a reader finds without knowing the key. `ds-bar-chart`, `ds-column-chart`,
  `ds-donut-chart` and `ds-funnel-chart` also draw a pin glyph on the pinned bar, column, slice or
  band, so the plot itself carries which one is held rather than leaving it to the panel; the glyph takes no pointer events. `--ds-chart-pin-size` sizes it, and the button
  is `.pin-reset`.

  The internal mark-state interface behind it — not exported from the package root — gains a
  `release()`, and its factory implements it. Only a hand-written implementation of that interface
  has one more method to satisfy.

- **A toggleable legend in `isolate` mode offers `None`.** Beside `All` and the per-series controls,
  which left no way to clear the plot in one action.

### Changed

- **Turning a chart's frame off is an input now, not a stylesheet rule.** The frame still draws by
  default. Switching it off took `ds-bar-chart { --ds-chart-frame-border-width: 0;
  --ds-chart-frame-padding: 0 }` in a global sheet — a deep rule into a component's own chrome,
  which is the shape of styling the rest of the library has been turning into inputs and tokens.

  `frame` takes `'auto'` (the default, draws it) or `'none'`, and falls back to
  `DS_CONFIG.chart.frame` when unset — whether charts live inside cards is one decision per app,
  the same as `dataTable`:

  ```ts
  provideDsConfig({ chart: { frame: 'none' } });
  ```

  ```html
  <ds-donut-chart frame="none" [data]="slices" />
  ```

  The two custom properties still size the frame and still work; a stylesheet zeroing them can drop
  those declarations in favour of the config key. `ChartFrame` is exported from the package root.

- **The annex data table is off by default.** `dataTable` defaults to `'none'` rather than
  `'toggle'`, on all five charts and in `DS_CONFIG.chart.dataTable`. A disclosure under every plot
  is chrome the page did not ask for, and the page usually carries the numbers already.

  It stays the non-visual route to the numbers where a page does NOT carry them, so turn it on
  deliberately — per chart with `dataTable="toggle"`, or once for an app:

  ```ts
  provideDsConfig({ chart: { dataTable: 'toggle' } });
  ```

- **A legend control isolates a series rather than hiding one, and `ds-chart-legend` says which.**
  `mode` is `'isolate'` by default: choosing a series shows that one and hides the rest, which takes
  one action instead of one per series on a crowded chart. `mode="toggle"` is the old behaviour —
  hide one, leave the rest — for taking a dominant series out so the others can be read at a usable
  scale. `ds-line-chart` forwards it as `legendMode`.

  The two are different controls, not two looks: isolate is a single choice among many, so it
  renders as a radio group running `All`, each series, `None`, and toggle renders as the checkboxes
  it already did. That is what gives each the keyboard and screen-reader behaviour it should have.
  One option is always chosen — `All` where the set is neither one series nor empty — because a
  radio group with nothing selected cannot say whether it means "everything" or "not decided".

  **If you set `legendFilters` on `ds-line-chart`, its legend changes shape.** Add
  `legendMode="toggle"` to keep the checkboxes. `hiddenSeries` is unchanged in both modes, so a page
  driving it from a URL parameter needs nothing.

- **A chart tooltip can be dismissed with Escape, and reached with the pointer where you ask for
  it.** The pane was inert and closed the instant the pointer left the mark, which left
  it unreadable at high zoom, unselectable, and impossible to clear without moving the pointer away.

  The pane takes the pointer now, and Escape closes the panel — it stays closed until the pointer
  visits another mark, so a reader who clears the screen keeps it cleared. Reaching the panel is
  `tooltipLingerMs`, which is `0`: the panel goes when the pointer does, because one left behind
  sits over the plot the reader has moved on to. WCAG 1.4.13's hoverable clause only bites where the
  panel holds something to reach — a link, a figure — so set
  `[tooltipLingerMs]="140"` on those charts, or `DS_CONFIG.chart.tooltipLingerMs` for an app whose
  tooltips all carry one. 140ms is what crossing the gap to a portaled panel takes at an ordinary
  pointer speed. The panel's own content does not take the pointer, so its text cannot be selected
  and a link in a `tooltipTemplate` is clickable only with `pointer-events: auto` set on it.

  If you styled `.ds-chart-tooltip-pane` with `pointer-events`, that rule now decides whether the
  pointer can reach the panel at all — the pane must stay `auto`.

- **A chart tooltip's second line is opt-in.** `0.13.1` gave every `ds-bar-chart` and
  `ds-column-chart` tooltip a `18.6% of total` line whether or not the marks were parts of a whole.
  It appears only under `partOfWhole` now. Set it on any chart whose categories genuinely divide one
  total to keep the line; leave it off and the tooltip carries the label and the value, as before
  `0.13.1`.

- **Exported class member surface grew — only matters if you SUBCLASS one of these.** `BarChartComponent`,
  `ColumnChartComponent`, `DonutChartComponent`, `FunnelChartComponent` and `LineChartComponent` all
  gain `pinOnClick` and the protected `onMarkClick`, which `LineChartComponent` spells
  `onMarkerClick` beside its own `pinnedCategory` and `releaseCategoryPin`; `BarChartComponent` and
  `ColumnChartComponent` also gain `partOfWhole` and the protected `valueClearance`; all five gain
  `frame` and `frameResolved`; `LineChartComponent` gains `legendMode`; the
  internal `ChartLegendComponent`, which the package root does not export, gains `mode`, `isolated`,
  `isolate` and `showAll`; and the internal `ChartTooltipDirective`, also unexported there, gains
  `dsChartTooltipExtraGap` and the private `detachEscape` and `closeOnEscape`.

  All five also gain `tooltipLingerMs` and the private `tooltipLingerResolved`; `FunnelChartComponent`
  gains `drop` and the protected `pinnedCenter`; `LineChartComponent` gains `max`, `maxSecondary`,
  `annotations`, `placedAnnotations` and the protected `onPointerAnywhere`, `host`,
  `cancelCategoryClear` and `pendingCategoryClear`; the internal legend also gains `groupName` and
  `hideAll`.

  Outside the charts: `ProgressComponent` gains `target`, `max` and the protected `scale`,
  `clampedTarget`, `targetPercent` and `valuePercent`, and the internal message base the fields and
  the button extend — unexported from the package root — gains a protected
  `reserveFollowsFieldDefault`.

  A subclass declaring any of those names collides. For a public or protected member the fix is
  `override` or a rename; for a private one only a rename works, because TS2415 fires on the name
  and `override` does not clear it.

### Fixed

- **`ds-line-chart` draws from axis to axis.** Its readings sat at the centre of a slot each, which
  left an empty strip of plot against the value axis and another against the far edge — a gap that
  reads as data the chart is withholding. The first reading is on the value axis now and the last
  at the far edge, with the rest dividing the run evenly. The crosshair band is centred on its
  reading and clamped at both ends, so the first and last are half-width and neither hangs over an
  axis label.

- **A drag across a chart no longer selects its chrome.** Axis ticks, legend labels and the caption
  a screen reader needs — clipped to a thin strip for everyone else — all came out selected, and the
  selection painted as bars across the card over content that is not visibly there. The plot is
  `user-select: none` now; the annex table, the funnel's stage table and the visible caption stay
  selectable, because those carry numbers people copy.

- **Clicking a slice or a band no longer draws a rectangle around it.** Chromium focuses an SVG
  shape when it is clicked even with no `tabindex` on it, and reports that focus as NOT
  `:focus-visible` — so a rule keyed on `:focus-visible` never fired and the browser painted its
  own outline instead. On a ring arc or a funnel band an outline is the BOUNDING BOX, which stood
  off the shape and read as a selection nobody asked for. `ds-donut-chart`, `ds-funnel-chart` and
  `ds-line-chart` marks now suppress it on `:focus`. The keyboard indicator is untouched: it is a
  stroke that follows the silhouette, and it still paints under `:focus-visible`.

- **`ds-column-chart`'s tooltip clears the value printed above the column.** The panel is anchored
  to the column and opened 12px above it, which is exactly where `showValues` prints the figure,
  so the two overlapped. It now clears the text as well as the mark; with `showValues` off the gap
  is unchanged.

- **`ds-button` ignores the app-wide `DS_CONFIG.field.reserveMessage`.** The button takes the same
  message line a field does, and with it took the field-wide default: an app calling
  `provideDsConfig({ field: { reserveMessage: true } })` gave EVERY button an empty message row,
  which turns the host from `inline-flex` into a column with a gap. One app found 125 buttons
  across 45 files changed box that way, and nothing in the build, the types or the release notes
  reported it. `reserveMessage` exists so a field row does not shift its neighbours as a message
  appears, and a button is not in that column.

  A button reserves only where you ask it to, with `[reserveMessage]="true"`. Fields are unchanged:
  `DS_CONFIG.field.reserveMessage` still reaches every one of them, `ds-field-group` included.

  The decision lives on the internal `DsMessageBase`, the shared message base the fields and the
  button extend, as a protected `reserveFollowsFieldDefault`. The package root does not export it; a
  subclass reaching it through the deep entry point and declaring that name stops building until it
  renames the member or marks it `override`.

- **Two legends on one page no longer fight over the same selection.** A legend's isolate controls
  are radios, and every legend named the same group — so a page with more than one chart formed a
  single document-wide group: choosing a series in one legend cleared the selection in the others,
  and only the last-rendered legend showed one at all. Each legend now names its own group.

  A legend also always shows exactly one control chosen. A leftover partial state left the group
  with nothing checked; it settles on `All`.

- **`ds-line-chart` holds its height when the last series is switched off.** The empty message
  reserved the plot-height token alone, and the plot is an SVG sized by its ratio against the card
  width — so on any card wider than that token the message box came up short and the card jumped.
  It reserves the canvas ratio now, with the token as the floor for a very narrow card.

### What you can now DELETE

| your workaround | why it is unnecessary | replace with |
| --- | --- | --- |
| `--ds-chart-frame-border-width: 0` with `--ds-chart-frame-padding: 0`, written to strip the frame off a chart inside a card | the frame is an input and an app-wide config key, so reaching into the component's chrome is no longer the route | `frame="none"`, or `provideDsConfig({ chart: { frame: 'none' } })` |
| `dataTable="none"` on a chart | the annex table is off by default, so the binding restates it | nothing — keep it only where the app-wide default is `'toggle'` and this one chart differs |

## 0.13.1 — 2026-09-14

### Added

- **A picker's panel can be styled without painting every other picker's.** Each portaled pane
  carries its own class beside the shared `ds-dropdown-panel` and `ds-overlay-pane` —
  `ds-select-panel`, `ds-multi-select-panel`, `ds-autocomplete-panel`, `ds-color-picker-panel`,
  `ds-date-picker-panel`, `ds-time-picker-panel` — and every one of the six also takes a
  `panelClass` input for a class of your own:

  ```html
  <ds-autocomplete panelClass="search-panel" [options]="options" />
  ```

  ```scss
  .ds-autocomplete-panel .option { font-size: 15px; }
  ```

  The panel is portaled to `document.body`, outside the host, so a class on the pane is the only
  route a consumer stylesheet has to ONE instance of it. `panelClass` takes a string or an array.

  Two panes gain `ds-dropdown-panel` that did not carry it: the date picker's and the time picker's.
  Neither changes appearance, because neither renders any of the class names the skin styles — no
  option rows, no option groups, no list. A rule of yours written against `.ds-dropdown-panel` now
  matches them, though, and so do the panel's custom properties.

  `SelectComponent`, `MultiSelectComponent`, `AutocompleteComponent`, `ColorPickerComponent`,
  `DatePickerComponent` and `TimePickerComponent` each grow by this one input. A subclass of any of
  the six that declares its own `panelClass` stops building until it renames the member or marks it
  `override`.

- **The dropdown panel's border and shadow, and the option's type, read `--ds-*` hooks.**
  `--ds-dropdown-panel-border-color` and `--ds-dropdown-panel-shadow` join the five box hooks the
  panel already had; `--ds-option-weight`, `--ds-option-font-size`, `--ds-option-line-height` and
  `--ds-option-font-family` fill the row's `font` shorthand, which carried four literal values. All
  six forward per instance, like every other dropdown-panel hook: set one on a host and it reaches
  that host's pane, with no global rule. Defaults are today's values, so an untouched theme is
  unchanged.

- **`--ds-modal-title-font-family`.** The title had weight, size and colour hooks but read
  `--font-heading` literally, so a display face had no route in that did not involve outspecifying
  the component's own rule from outside its encapsulation. Defaults to `--font-heading`.

- **`DS_CONFIG` takes a `chart` section.** Four inputs now resolve through it, because each is one
  decision per APP rather than per plot: `valueFormat` — a number reads one way in a product, and a
  formatter passed per chart drifts as soon as there are two screens; `dataTable` — whether the
  numbers behind a plot have a non-visual route is an accessibility policy, not a per-chart taste;
  and `emptyText` / `errorText`, which is where localisation lands.

  ```ts
  providers: [
    provideDsConfig({
      chart: {
        valueFormat: (value) => value.toLocaleString('de-DE'),
        dataTable: 'visible',
      },
    }),
  ];
  ```

  Precedence is the input, then the config, then the built-in default, so binding one on a single
  chart still wins. The four inputs are typed `T | null` and default to `null` — that is what lets
  a chart tell "not set" from an explicit value — and each chart exposes the settled value as
  `dataTableResolved`, `emptyTextResolved`, `errorTextResolved` and `valueFormatResolved`. A
  subclass that read the raw input now reads `null` until something binds it.

  `ChartDataTable` and `ChartValueFormat` are exported from the package root.

  The member surface of `BarChartComponent`, `ColumnChartComponent`, `DonutChartComponent`,
  `FunnelChartComponent` and `LineChartComponent` grows by these four readbacks and by `dimOthers`,
  all public. `ColumnChartComponent` also gains `tooltipAnchor` and the protected `onMarkEnter`,
  `FunnelChartComponent` the protected `hitGapUnits`, and `LineChartComponent` `tooltipAnchor`, the
  protected `cursorBottomY` and the private `readingAnchor`. `DonutChartComponent` LOSES the
  protected `markStagger`.

  A subclass that declares any of those names collides. For a public or protected member the fix is
  `override` or a rename; for a PRIVATE one — `readingAnchor` — only a rename works, because TS2415
  fires on the name itself and `override` does not clear it. A subclass that called `markStagger` no
  longer compiles.

- **The tooltip is pinned to the mark, not to the cursor, and both charts that had a say now take
  an option.** `ds-line-chart` gains `tooltipAnchor`: `'point'`, the default, pins the panel over
  the highest reading in the category, so it stays still while the pointer travels within one band;
  `'pointer'` follows the cursor. `ds-column-chart` gains the same input with `'mark'` and `'cell'`:
  the box catching the pointer is the full-height category cell, so `'cell'` opened the panel at the
  top of the plot rather than over the column it described. `'mark'` is the default and points at
  the column.

  ```html
  <ds-line-chart tooltipAnchor="pointer" [series]="series" [categories]="months" />
  <ds-column-chart tooltipAnchor="cell" [data]="points" />
  ```

  The internal `ChartActiveMark`, which the package root does not export, takes an optional third
  argument on `enter` to name the element inside the hit box that the panel points at. An
  implementation that omits it still satisfies the interface.

### Changed

- **A surface no longer travels on its way in.** `ds-overlay-pane` — every picker panel, the
  popover, the menu submenu, the tooltip, the chart tooltip — plus `ds-alert`, `ds-banner` and
  `ds-toast` defaulted to
  `ds-slide-in`, which offsets the panel and slides it to its place. They now default to
  `ds-fade-in`: the same duration and easing, no travel. The travel read as the panel jumping into
  position, and on a panel that opens UPWARD it read as jumping up from below the trigger.

  `ds-drawer` and `ds-bottom-sheet` keep `ds-slide-edge-in`, because sliding in from an edge is
  what they are, and `ds-modal` keeps `ds-scale-in`. Any surface takes its old entrance back with
  one declaration, the panels at the root and `ds-alert` / `ds-banner` / `ds-toast` each on its own
  hook:

  ```scss
  :root { --ds-overlay-enter-keyframes: ds-slide-in; }
  ds-alert { --ds-alert-enter-keyframes: ds-slide-in; }
  ds-banner { --ds-banner-enter-keyframes: ds-slide-in; }
  ds-toast { --ds-toast-enter-keyframes: ds-slide-in; }
  ```

- **A chart mark arrives by GROWING from its own baseline, not by scaling about its centre.** A
  column grows up out of the category axis and a bar row grows out from the value axis; a ring arc,
  a funnel band and a line have no baseline to grow from and fade instead. The uniform
  `scale(0.94)` this replaces moved every mark's baseline and read as the whole chart zooming in.

- **The mark cap is 3px on `ds-bar-chart` and `ds-column-chart`,** through the new
  `--ds-chart-mark-cap-radius`, with `--ds-bar-chart-cap-radius` and `--ds-column-chart-cap-radius`
  over it. The bar's end was a full pill (half the track height) and the column's top was
  `--radius-sm`; one soft value for both keeps the cap from reading as a change of shape while a
  mark grows in.

- **A gap between two marks now belongs to the marks either side of it.** `ds-funnel-chart`'s
  inter-stage gaps are claimed half by the band above and half by the band below, through a
  transparent stroke — the gap looks exactly as it did and stops being dead space that answers
  nothing. `ds-bar-chart`'s row gap moved from `row-gap` on the list to padding on each row, for
  the same reason: a reader aiming between two bars used to hit neither. That last one makes the
  bar plot one full `--ds-bar-chart-row-gap` taller — 20px at the default — because the first row
  now carries half a gap above it and the last half a gap below.

- **A tooltip now says what the chart does not already print.** On `ds-bar-chart` and
  `ds-column-chart` it repeated the label and the value that sit beside the mark, which told the
  reader nothing they were not looking at. Both now carry a second line — the mark's share of the
  total, `18.6% of total`, arithmetic the reader should not have to do — and `ds-funnel-chart`
  carries the drop into the stage, which the shape cannot show. A mark whose value is zero or
  negative has no share of anything visible and gets no second line at all. `ds-donut-chart` gets
  none either: its panel and its legend both already print the percentage. A projected
  `#dsChartTooltip` template still replaces the lot.

- **`ds-line-chart`'s crosshair moves as one object and fades on the way in and out.** The band and
  the cursor line are one group carrying a `translateX`, so following the pointer is a single
  transform rather than an attribute write per shape. It is not transitioned: the crosshair belongs
  under the pointer, and easing it there makes it arrive late over readings it was never on.

- **`ds-line-chart`'s crosshair covers both plots under `yAxisMode="stacked"`.** It stopped at the
  upper plot's baseline, so the lower plot — same category, same pointer — had nothing marked at
  all.

- **`ds-donut-chart` fades as one ring rather than slice by slice.** Arcs share their edges, and
  two semi-transparent shapes butting up along one let the background through the seam — which
  reads as the slice proportions shifting slightly as the fade ends. Compositing the ring first and
  fading the result cannot do that. `staggerMs` therefore has no effect on this chart — one object
  arrives, not five — and the input stays only for parity with the other four.

- **A chart keeps its height in every state.** An empty `data`, a failed request, or a legend that
  switched the last series off used to shrink the chart to a line of text, which drags the page up
  under the reader at exactly the moment they are being told something. The message now stands in a
  box the size of the plot it replaces, on all five. What sizes that box differs by chart:
  `ds-column-chart` and `ds-line-chart` use their `--ds-*-plot-height`, `ds-donut-chart` its
  `--ds-donut-chart-size`, and `ds-bar-chart` and `ds-funnel-chart` reserve three rows or stages,
  so a chart that normally draws ten rows still shrinks to that reserve.

- **Dimming the other marks is a separate opt-in, and it is off.** `dimOthers` fades the marks that
  are not singled out: on `ds-bar-chart`, `ds-column-chart`, `ds-donut-chart` and `ds-funnel-chart`
  that is every mark but the hovered or focused one, and on `ds-line-chart` — which has no mark
  between two readings to hover — it follows the legend's highlight. It used to ride along with
  `interactive`, and it is off by default because the fade costs the separation BETWEEN the faded
  marks: in OKLab dE ×100, the worst pair of three dimmed series falls from 14.8 at full opacity to
  2.1 at `--ds-chart-dim-opacity`'s default. It buys loudness for one mark and pays for it with the
  rest of the chart. A chart that had the fade gets it back with one attribute.

  ```html
  <ds-donut-chart interactive dimOthers [data]="slices" />
  ```

- **A hidden legend row is no longer struck through.** The unchecked box says what happened and the
  muted label agrees with it; a strike-through says the label itself is wrong.

- **A legend's colour chips arrive with the marks they name.** They used to be solid from the first
  frame while the plot was still fading in, which reads as two objects rather than one. The chip
  now fades on the same curve and the same delay: `ds-chart-legend`'s swatch and, where the legend
  toggles, its checkbox; `ds-donut-chart`'s legend swatch; and `ds-funnel-chart`'s stage-table
  swatch. Nothing in your code changes, and a screenshot test that captures a chart mid-entrance
  will differ.

- **A `title` input no longer leaves a native browser tooltip over the component.** `title` is a
  global HTML attribute, so `<ds-modal title="Settings">` both fed the input AND left the attribute
  in the DOM — and the browser then raised its own tooltip over the whole component, naming it
  rather than whatever the pointer was resting on. Eleven components drop the attribute:
  `ds-accordion-item`, `ds-alert`, `ds-banner`, `ds-bottom-sheet`, `ds-drawer`, `ds-empty-state`,
  `ds-list-item`, `ds-modal`, `ds-modal-card`, `ds-page-header` and `ds-toast`. Each renders the
  title as visible text and names itself through `aria-labelledby` where it needs a name, so
  nothing is lost to assistive technology.

  This wins over a `[attr.title]` of your own on those hosts — bind it and the attribute is still
  removed. If you want a native tooltip there, put it on a wrapper or a projected child, or use
  `dsTooltip`.

- **A chart tooltip no longer fights the pointer that opened it.** The panel opens under the
  cursor, and the CDK pane it is portaled into takes pointer events by default — so the panel
  covered the plot, the plot took a `pointerleave`, the chart cleared its hover, the panel closed,
  the pointer landed on the plot again, and the whole thing flickered for as long as the cursor sat
  there. The pane is `pointer-events: none` now; `pointer-events` on the panel alone never reached
  it.

- **`ds-column-chart` answers the pointer near its column, not across the whole category slot.** A
  column is capped at `--ds-column-chart-column-max-width` while its slot is a `1fr` share of the
  plot, so on a wide chart the hover reached well past the mark on either side. The target is
  `--ds-column-chart-column-max-width` plus one `--ds-column-chart-column-gap` — half the gap each
  side, the rule the funnel's bands already follow — and it spans the category cell's FULL height:
  the plot, the axis gap under it, and the label. Split across the plot and the label alone, the
  axis gap answered for neither, so a pointer travelling between them crossed a band where the
  tooltip closed and reopened. It never exceeds the slot, and where the column is narrower than its
  cap the target is wider than the column itself.

  `.plot-cell` is no longer a positioned box and no longer carries the `::after` that catches the
  pointer; `.column` is and does. A rule of yours that positioned something against `.plot-cell`
  now resolves against `.column`.

- **The legend's checkboxes are not permanently ringed.** `ds-chart-legend` applied the focus ring
  unconditionally instead of under `:focus-visible`, so every legend row looked focused. The
  library's global `:where(:focus-visible)` rule already rings them, so the component needs none of
  its own.

- **A mark's colour change eases instead of jumping,** and a dimmed line fades again. Each mark
  animated exactly one property, because a second `transition` on the same selector REPLACES the
  first rather than adding to it: `ds-line-chart`'s line kept `stroke-width` and lost the dim fade,
  its marker kept `r` and lost the same, and no mark eased its paint at all. Opacity, geometry and
  colour now travel in ONE declaration wherever they share a selector — so recolouring a row,
  pinning a palette slot, or adding a funnel stage and re-spreading the ramp all ease. If you
  declare your own `transition` on a chart mark, name every property it was already easing.

- **A chart tooltip closes when the page scrolls.** CDK's reposition strategy watches `window` and
  registered `cdkScrollable`s only, so an app's own `overflow: auto` container left the panel
  pinned in space while the chart scrolled out from under it. `ds-line-chart` reopens on the next
  pointer move; the other four reopen when the pointer leaves a mark and enters one again.

  The internal `ChartTooltipDirective`, which the package root does not export, grows one PRIVATE
  member, `detachScrollClose`. `@ids-group-ltd/ids-design-system/components/chart-tooltip` is the
  only specifier that reaches the class; a subclass declaring that name must rename it, because
  TS2415 fires on the collision and `override` does not clear it for a private member.

- **The helper behind a chart tooltip's second line is renamed.** The internal `describeStanding`,
  which returned the rank alongside the share, is the internal `describeShare` now. Neither is
  exported from the package root, but `@ids-group-ltd/ids-design-system/components` exports them,
  so an import of the old name stops resolving. Rename it; the signature is unchanged.

### Fixed

- **`ds-table`'s pagination footer insets per side, so the summary lines up with column one.** The
  footer read `--ds-table-cell-pad-x` alone while the cells resolve `--ds-table-cell-pad-left` and
  `-right` separately. A table asking for a flush first column — `--ds-table-cell-pad-left: 0`
  with `-right` set and `-x` unset — got a footer at the 16px default while the column sat at 0.
  The footer now walks the same per-side chain; `-x` still works as the shorthand for both.

  One gap is left: `density="compact"` retunes the cells' padding on the table element itself, and
  the footer sits outside that element rather than inside it, so a compact table with no
  `--ds-table-cell-pad-*` of its own still has 12px cells under a 16px footer. Set
  `--ds-table-cell-pad-x: var(--space-3)` beside `density="compact"`, or keep a local rule on the
  footer.

- **`ds-donut-chart`'s error state holds the plot's height.** It rendered the message as a bare
  paragraph, so a failed request collapsed the ring's 180px to one line of text and dragged the
  page up under the reader. It now stands in the same ring-sized box the no-data state already
  used. The message carries `empty-text is-error` where it carried `empty is-error`, so a rule of
  yours written against `.empty.is-error` inside this chart no longer matches.

- **A role token set on an app shell no longer outranks your rule on a portaled panel.** A panel
  sits in `document.body`, so the component copies the roles it needs onto the pane as an inline
  style. It decided what to copy by comparing the host with `:root` — and because custom properties
  inherit, a shell setting `--ds-radius-panel` for its own chrome made every picker under it an
  overrider, each pinning the shell's value inline. A rule on `.ds-overlay-pane`, which is the only
  route a stylesheet has to a portaled panel, then lost to a value nobody wrote. The comparison is
  now against the host's PARENT, so only a role the host declares itself travels.

  If you were relying on an ancestor's role reaching a panel, set it on the component instead —
  `ds-select { --ds-radius-panel: 8px }` still forwards — or use the panel's own hook, such as
  `--ds-dropdown-panel-radius`, which is forwarded with no such test.

### What you can now DELETE

| your workaround | why it is unnecessary | replace with |
| --- | --- | --- |
| `.ds-overlay-pane .dropdown-panel .option` — a deep rule retyping dropdown rows | the row's weight, size, line-height and family are hooks that forward per instance | `--ds-option-weight`, `--ds-option-font-size`, `--ds-option-line-height`, `--ds-option-font-family` |
| `ds-modal .title.title` — a rule outspecifying the modal's own title rule only to set `font-family` | the title reads a family hook, which needs no specificity at all | `--ds-modal-title-font-family` |
| `.pagination-footer` — a local rule re-insetting the table's footer to match a per-side gutter | the footer resolves the same left/right chain the cells do | nothing, UNLESS the table is `density="compact"` and sets no `--ds-table-cell-pad-*` — there the footer is still 4px wider than the cells and the rule is still doing work |

## 0.13.0 — 2026-09-14

### Breaking

- **`ds-field-group` renders its chrome on an inner row, not on the host.** The border, radius,
  focus ring and the divider between segments moved from `:host` to `.row`, because the group now
  carries a message of its own and that line has to sit OUTSIDE the bordered box. A stylesheet that
  reached `ds-field-group` to change its border, radius or padding now targets a box that no longer
  has them.

  ```scss
  /* before */                      /* after — or better, use the tokens */
  ds-field-group { border: 0; }     ds-field-group .row { border: 0; }
  ```

  Every `--ds-field-group-*` token is unchanged and still declared on the host, so an override
  written through the tokens needs nothing. The host's own box is unchanged too while the group has
  no message and reserves none: measured in the docs app, the row stays 40px and the host stays
  40px — it grows to 57px once `error`, `warning` or `hint` is bound, and it reserves that message
  row on a clean group whenever `reserveMessage` is on, `DS_CONFIG.field.reserveMessage` included.

- **`--ds-button-border` is `--ds-button-border-color`, and `--ds-button-border-disabled` is
  `--ds-button-border-color-disabled`.** Both name a COLOUR, and since the width moved out to
  `--ds-button-border-width` beside them the old names read like a `border` shorthand — set
  `2px solid red` on one and nothing happens. The values and defaults are unchanged; only the
  names moved.

  ```scss
  /* before */            /* after */
  ds-button {             ds-button {
    --ds-button-border: var(--brand);   --ds-button-border-color: var(--brand);
  }                       }
  ```

- **A `ds-button`, `ds-sidenav-item` or `ds-sidenav-group` link no longer claims to be a page it
  is only inside of.** `aria-current` was derived from `routerLinkActive`, which matches by
  PREFIX — so a "back to the section" link on `/case-studies/retail` announced
  `aria-current="page"` for `/case-studies`, a page the reader was leaving rather than on. It now
  says what ARIA means: an exact match announces `page`, a prefix match announces `true`, anything
  else announces nothing. The `active` CLASS still matches by prefix, so nothing changes visually.

  Only a screen reader hears the difference, which is why it went unnoticed for so long — on
  `ds-button` the `active` class is painted by nothing at all. If a test asserted
  `aria-current="page"` on a section link, it now reads `true`.

- **Thirty-one chart palette tokens are renamed, and an override written against an old name
  stops applying in silence.** A custom property that no longer resolves is invalid at
  computed-value time, so the whole declaration around it is dropped: `background:
  var(--chart-cat-3)` paints nothing, a `:root` override of `--chart-cat-3` simply never reaches
  the chart, and neither reports an error. Five groups:

  - Categorical series — `--chart-cat-1` … `--chart-cat-8` become `--chart-categorical-1` …
    `--chart-categorical-8`.
  - Sequential ramp — `--chart-seq-1` … `--chart-seq-6` become `--chart-sequential-1` …
    `--chart-sequential-6`.
  - Divergent ramp — `--chart-div--3` … `--chart-div-3` become `--chart-divergent--3` …
    `--chart-divergent-3`, signed suffix and all.
  - Colours taking the `-color` the rest of the library carries — `--chart-axis-line`,
    `--chart-axis-label`, `--chart-grid-line`, `--chart-cursor-line` and `--chart-tooltip-border`.
  - Abbreviations spelled out — `--chart-axis-fs` becomes `--chart-axis-font-size`,
    `--chart-line-w` becomes `--chart-line-width`, `--chart-line-w-bold` becomes
    `--chart-line-width-bold`, `--chart-dot-r` becomes `--chart-dot-radius`, and
    `--chart-dot-r-active` becomes `--chart-dot-radius-active`.

  Three more are REMOVED rather than renamed, because no chart draws what they named and no rule
  read them: `--chart-axis-title`, `--chart-grid-line-strong` and `--chart-tick-size`. Handle
  `--chart-grid-line-strong` before `--chart-grid-line`: the short name is a prefix of the long
  one, and a prefix-blind sweep renames this one instead of deleting it.

  The sequential VALUES are unchanged in both themes, and so are the divergent zero step and the
  dark-theme divergent steps; the six light-theme signed divergent steps and the eight categorical
  values are not — they are retuned in this same release, so a rename there lands a different
  colour rather than the same one under a new name. `--chart-bar-gap`, `--chart-hover-bg-color`,
  `--chart-tooltip-bg-color` and
  `--chart-tooltip-text-color` keep their names. Recolouring a series
  is better done through the `--ds-chart-` layer below than through the palette.

- **`DsFieldGroupContext` carries two more members, and a class that IMPLEMENTS it no longer
  compiles.** The interface behind `DS_FIELD_GROUP` had one member, `sizeResolved`; it now also
  declares `invalidResolved: () => boolean` and `messageId: () => string | null`, because a segment
  has to read the group's RESOLVED error state — an `error` string counts, not only the `invalid`
  flag — and has to add the group's one message to its own `aria-describedby`. Anyone who provides
  `DS_FIELD_GROUP` from their own wrapper so that DS fields behave as segments inside it gets
  TS2420 until both are supplied: a compile error, not a silent change.

  ```ts
  providers: [{ provide: DS_FIELD_GROUP, useValue: {
    sizeResolved: () => 'md',
    invalidResolved: () => this.invalid(),
    messageId: () => this.messageId(),
  } satisfies DsFieldGroupContext }]
  ```

  `() => false` and `() => null` reproduce the old behaviour exactly. Only a consumer who PROVIDES
  the token is affected; injecting it to read the context is unchanged and gains two members.

- **`TableRowAction.label` is `string | ((row: T) => string)`, which breaks code that READS it.**
  Writing an action is unaffected — a plain string still compiles. But `rowActionSelected` hands
  back the action, and `event.action.label` is now a union: assigning it to a `string`, or calling
  a string method on it, is a compile error rather than a silent wrong value.

  ```ts
  const label = typeof event.action.label === 'string'
    ? event.action.label
    : event.action.label(event.row);
  ```

  Branch on `event.action.id` instead wherever the label was only standing in for the identity —
  that is what `id` is for, and it stayed a `string`.

- **A `ds-stat` label clips to one line.** It wrapped freely before, so a two-word label took two
  lines and made its tile taller than the ones beside it; it now truncates with an ellipsis and
  discloses the full text in a tooltip on hover. There is no hook to put the wrapping back — the
  value's `--ds-stat-value-white-space`, `--ds-stat-value-lines` and `--ds-stat-value-wrap` govern
  the value alone. A label that was relying on two lines needs shortening, or a wider tile.

### Added

- **`LineChartPoint` is exported.** `(pointClicked)` on `ds-line-chart` has always emitted it, and
  the type was reachable from nowhere — a consumer typing the handler had to restate the shape by
  hand.

- **The focus ring on a chart mark is two tones, and it is drawn rather than outlined.** A white
  stroke with a dark halo around it, because one tone is not enough: an accent ring disappears on a
  mark of its own hue family, and a chart's marks are exactly the surfaces a ring has to survive.
  Measured in Chrome on 2026-09-14, WCAG contrast against each of the eight categorical colours:
  the white stroke runs 3.01 – 9.45 and the halo 1.83 – 5.75, so every series colour clears 3:1
  against at least one tone, and the halo clears 17.32 against the chart's own surface.
  `--ds-chart-focus-ring-color` and `--ds-chart-focus-halo-color` are the hooks.

  `outline` is not the mechanism because on an SVG element it paints the BOUNDING BOX rather than
  the silhouette — a donut slice would ring as a rectangle.

  **Forced colours are handled explicitly.** `fill` and `stroke` are not remapped by Windows High
  Contrast, so a chart keeps every series colour, they all resolve to the same one against the
  forced background, and nothing reports a problem. Axes, gridlines and labels now take `CanvasText`
  and the focus ring takes `Highlight` under `(forced-colors: active)`.

- **`ds-line-chart` takes `patterns`, a second encoding channel.** Each series gets a dash of its
  own from a fixed list, in the same order as the palette slots, so the lines are told apart by
  shape as well as by colour — WCAG technique G111. Slot 1 stays solid, so a single-series chart is
  unchanged by turning it on while its `slot` is unset or 1. Off by default: the shipped palette
  clears the colour-blind separation threshold on its own, and this is for monochrome print, a
  retuned palette, or a reader who asks for it.

  ```html
  <ds-line-chart patterns [series]="series" [categories]="months" />
  ```

  The other four charts print a label beside every mark by default — a bar's row, a column's
  category, a donut's legend row unless `legend="none"`, a funnel's stage in its table unless
  `showTable` is off — so colour is not what identifies a mark there.

- **A tap answers the way a hover does, and stays put.** Tapping a mark opens its tooltip and
  LATCHES it: a touch fires `pointerleave` the instant the finger lifts, so without this the panel
  would flash and vanish. The next tap outside the mark releases it. On `ds-line-chart` a tap
  anywhere in the plot picks the category under the finger, the same as a pointer moving over it.

  `ds-line-chart`'s markers carry a hit area rather than relying on the dot: a transparent
  `non-scaling-stroke` of 24px on a fine pointer and 44px under `(pointer: coarse)`. Measured in
  Chrome at a 390px viewport: the marker hit-tests 21px from its centre and misses at 25px, so the
  touch target is 44px across whatever width the plot is scaled to — a stroke in viewBox units
  would have been a different size on a narrow card than on a wide one. It is narrower on a fine
  pointer because a 44px target on a dense chart swallows the neighbouring readings.

- **A mark that arrives and a mark that leaves are now two staged phases.** Removals run first, at
  `--ds-motion-chart-mark-exit-duration`; additions wait that long and then run at
  `--ds-motion-chart-mark-enter-duration`, so a vanishing mark and an arriving one are never on
  screen together. The update phase — a mark changing size — runs on
  `--ds-motion-chart-mark-duration`.

  `staggerMs` spaces the arrivals out. `0` is the default and means no stagger; `40` is the
  documented step, and the total delay is capped at 300ms so a hundred-mark series does not take
  three seconds to appear. `ds-donut-chart` takes the input for parity and ignores it: a ring
  arrives as one object, so there is nothing to stagger. Measured on the docs card at `staggerMs="40"`: five columns
  resolve to 0, 40, 80, 120 and 160ms.

  ```html
  <ds-column-chart staggerMs="40" [data]="points" />
  ```

  Every transition retargets rather than queues: a data change mid-animation continues from where
  the mark actually is. Measured on the column chart's docs card — a bar caught at 163.4px when the
  second change landed carried on to 169.6px, with no jump back to the first target.

  `prefers-reduced-motion` needs nothing from the charts. The durations are tokens, the library's
  global rule already zeroes them, and each mark then lands straight on its final size — measured
  with the tokens zeroed: `animation-duration: 0s`, `animation-delay: 0s`, `opacity: 1`,
  `transform: none`.

- **`ds-line-chart`'s legend can switch a series off.** `legendFilters` turns each entry into a
  real `<input type="checkbox">` — keyboard-operable and correctly announced without inventing a
  role — and `hiddenSeries` is a two-way `model`, so a page can drive the filter from a URL
  parameter and read back what the reader chose. Hovering or focusing an entry dims every other
  series to `--ds-chart-dim-opacity`.

  ```html
  <ds-line-chart
    legendFilters
    [(hiddenSeries)]="hidden"
    [series]="series"
    [categories]="months" />
  ```

  **The value axis does not move when a series is hidden.** `rescaleOnHide` opts into the other
  behaviour, and it is off by default because a silent rescale turns a period-over-period
  comparison into a different claim — measured on the docs card, hiding one series with the
  default leaves the axis at `0 … 5K`, and with `rescaleOnHide` it becomes `0 … 1.6K`.

  Switching every series off replaces the plot with `noVisibleSeriesText` — "All series are
  hidden" by default — carried on a `role="status"` line, with the legend still rendered so the
  reader can switch one back on. Without it the reader is left looking at an empty grid.

  Without `legendFilters`, `ds-line-chart` draws a `ds-chart-legend` whenever there is more than
  one series.

- **Every chart answers a hover, a tap and a keyboard focus with a tooltip.** `ds-bar-chart`,
  `ds-column-chart`, `ds-donut-chart` and `ds-funnel-chart` default to `tooltip="item"` — the mark
  under the pointer, or the one holding focus. `ds-line-chart` defaults to `tooltip="axis"`: a
  pointer names every series at the category under it, while tabbing to a marker names that series
  alone, because focus is already on one reading. `tooltip="none"` turns it off.

  The panel is portaled out of the chart's box, so a chart inside a small dashboard card is not
  what clips it — with no room above the mark it flips below, then to either side, and is pushed
  back on screen rather than cut. On a coarse pointer it clears the tap point by 48px instead of
  12, so the panel is not under the finger.

  ```html
  <ds-line-chart [series]="series" [categories]="months" tooltip="axis" />
  <ds-donut-chart [data]="slices" tooltip="none" />
  ```

  The content is a projected template, never a formatter string, so a tooltip can hold components
  and markup rather than escaped text:

  ```html
  <ds-column-chart [data]="points">
    <ng-template #dsChartTooltip let-tip>
      <strong>{{ tip.category }}</strong>
      @for (entry of tip.entries; track entry.label) {
        <p>{{ entry.label }}: {{ entry.formatted }}</p>
      }
    </ng-template>
  </ds-column-chart>
  ```

  Three tokens paint it — `--ds-chart-tooltip-bg-color`, `--ds-chart-tooltip-text-color` and
  `--ds-chart-tooltip-border-color`. They were declared before this and reached no rule; they reach
  one now. The panel carries `aria-hidden`, because every interactive mark already puts the same
  label and value in its own accessible name and a screen reader would otherwise read each reading
  twice.

- **Hovering or focusing one mark dims the others.** With `interactive` set on `ds-bar-chart`,
  `ds-column-chart`, `ds-donut-chart` or `ds-funnel-chart`, the mark under the pointer or under
  focus keeps its colour and every other mark drops to `--ds-chart-dim-opacity`, default `0.3` —
  the highlight is a fade of the rest rather than a change to the thing being pointed at, so the
  colour a reader is matching against the legend stays the colour it was. Without `interactive`
  nothing dims: a chart nobody can click has no mark to single out.

  ```scss
  /* a denser chart wants a deeper fade */
  ds-donut-chart { --ds-chart-dim-opacity: 0.15; }
  ```

  The fade runs on `--ds-motion-chart-state-duration` and `--ds-motion-chart-state-easing`, so a
  consumer who slows or flattens chart state changes does it in one place for all four. Reduced
  motion needs nothing from the chart — the library's global rule already zeroes every duration.

- **`ds-number-stepper` takes `--ds-number-stepper-field-width`.** The number between the two step
  buttons is sized from the control's own box height — 1.25× it — which is right for two or three
  digits and clips a five-digit quantity. The hook is that width, and the default is the value the
  three sizes carried before, so nothing moved.

  ```scss
  ds-number-stepper { --ds-number-stepper-field-width: 5ch; }
  ```

- **`ds-line-chart` highlights the category under the pointer.** A line has no mark between two
  readings, so the hover target is the whole category: a band paints behind the plot and every
  series' reading at that category grows to the active dot radius. The band is what survives a
  finger covering it on touch, and the grown markers are what the tooltip will anchor to.
  `--ds-chart-hover-bg-color` paints the band, `--ds-chart-cursor-line-color` the rule down its
  centre and `--ds-chart-dot-radius-active` sizes the grown reading; all three were declared and
  reached no rule until now. `--ds-line-chart-hover-bg-color`, `--ds-line-chart-cursor-line-color`
  and `--ds-line-chart-dot-radius-active` override any of them for this chart alone. The band is
  what survives a finger covering it, which a 1px rule on its own does not.

- **Every chart takes `error` and `errorText`.** A failed fetch had to render as `emptyText`, which
  says "No data" when the truth is "could not load". The branch renders ahead of `loading` and
  carries `role="status"`, so the message is announced when it replaces a spinner.

  ```html
  <ds-bar-chart
    [data]="rows"
    [loading]="pending()"
    [error]="failed()"
    errorText="Could not reach the depot service" />
  ```

- **`BarChartRow` and `ColumnChartPoint` take an optional `id`.** Supplying it makes a reorder move
  the DOM nodes instead of rewriting them; left out, the row keeps its position as its key, which is
  what both charts did before. `DonutChartSlice` and `FunnelChartStage` already required one.

- **`ds-line-chart` takes `interactive` and emits `pointClicked`.** Every reading becomes a focusable
  button carrying its series, its category and its value, so a click and a keyboard activation reach
  the consumer the same way they already do on `ds-bar-chart`. A series drawn with
  `showMarkers="false"` grows invisible markers when `interactive` is set, so there is something to
  land on; they appear on hover and on focus.

  ```html
  <ds-line-chart
    interactive
    [series]="series"
    [categories]="months"
    (pointClicked)="openMonth($event)" />
  ```

- **A `TableRowAction` can name itself per row, and can open a divider.** `label` takes
  `(row) => string` as well as a string, so one action reads Pause on a live row and Resume on a
  paused one under the SAME `id` — `rowActionSelected` still fires once with that id, instead of the
  consumer declaring two actions whose `hidden` predicates have to be kept exact opposites by hand.
  `divider: true` draws a line above an item, for the destructive tail that colour alone was
  separating.

  ```ts
  rowActions: TableRowAction<Run>[] = [
    { id: 'suspend', label: (row) => (row.active ? 'Pause' : 'Resume'), icon: 'refresh' },
    { id: 'delete', label: 'Delete', icon: 'trash', error: true, divider: true },
  ];
  ```

  A divider on the FIRST item is ignored: a line at the top of a menu has nothing on one side of it.
  Measured in the docs app across four rows — the label reads Pause on the active row and Resume on
  the other three, and every menu renders exactly one divider, in document order between the last
  ordinary item and Delete.

  These are the last two of the four pieces asked for on 2026-08-18; `hidden` and `disabledReason`
  shipped on 2026-08-21.

- **`ds-field-group` takes `error`, `hint` and `warning`, so the error it shows has words.** The
  group suppresses its segments' own labels and message rows — they would break the glued line — and
  until now it had nowhere for the text to go, which left colour as the only channel and 1.4.1
  failing. It carries the same pair every field carries: `error` is a string that turns the state on
  AND says what is wrong, `invalid` stays the flag for when the text lives in a form-level summary.

  ```html
  <ds-field-group error="Введите сумму больше нуля">
    <ds-select [options]="currencies" />
    <ds-input grow [(value)]="amount" />
  </ds-field-group>
  ```

  It takes the rest of that base too: `reserveMessage` holds the message row's height while the
  group is clean, so binding an error later does not push the form below it down, and
  `messageIcon` overrides the glyph the state resolves to, or removes it with `false`.

  **Every segment announces it, not just the first.** Each carries `aria-invalid` while the group is
  in error and points at the one message through `aria-describedby`, so a reader who tabs straight to
  the second segment hears it too — the group's border is not something a screen reader can see.
  Measured in the docs app: both segments of an `error` group report `aria-invalid="true"` and the
  same `aria-describedby`, and a `hint` group links the message without claiming an error.

  The `invalid` input on every field already described this arrangement in its own documentation —
  *"for when the text lives elsewhere, such as a form-level error summary or one message covering a
  whole field group"*. The group was the half that had never been built.

- **`ds-button` forwards everything else a link can carry: `fragment`, `queryParams`,
  `queryParamsHandling`, `target` and `rel`.** Each is a pass-through to the anchor the component
  already renders, so a call-to-action with a destination modifier stays a `ds-button` instead of
  falling back to a hand-written class.

  ```html
  <ds-button [routerLink]="['/ai-solutions', slug]" fragment="enquiry">Talk to us</ds-button>
  <ds-button [href]="demoUrl" target="_blank" rel="noopener">Open the demo</ds-button>
  ```

  `fragment`, `queryParams` and `queryParamsHandling` belong to a `routerLink` destination and
  dev-warn on any other; `target` and `rel` work on both link destinations and dev-warn on a plain
  button.

- **`routerLink` accepts a `UrlTree`** on `ds-button`, `ds-sidenav-item` and `ds-sidenav-group`, so
  the `UrlCreationOptions` with no input of their own — `relativeTo`, `preserveFragment` — are
  reachable without waiting for one.

  ```ts
  protected readonly enquiry = this.router.createUrlTree(['/ai-solutions', slug], {
    fragment: 'enquiry',
  });
  ```

- **`ariaCurrent` on `ds-button`, `ds-sidenav-item` and `ds-sidenav-group`, and
  `routerLinkActiveOptions` on `ds-button`.** `ariaCurrent` overrides what the link announces,
  including `null` for "announce nothing" and `'step'` or `'location'` where the link is not a
  page. Left alone, the announcement follows the exact/prefix rule above and needs nothing from
  the consumer.

  `routerLinkActiveOptions` moves what the `active` CLASS matches — and, because the announcement
  is written by the same directive, it also bounds the announcement: narrow it to
  `{ exact: true }` and a prefix match is no longer active, so the link announces nothing at all
  rather than `true`. Set it to change the highlight, and pass `ariaCurrent` alongside it if the
  ancestor announcement still matters.

- **Ten classes grew their member surface, which breaks a subclass that declares the same name.**
  Subclassing a DS component is unsupported (`design-system.md` § Components), so this reaches only
  a consumer who does it — and there it is a build error, not a silent change. `ButtonComponent`
  gained `fragment`, `queryParams`, `queryParamsHandling`, `target`, `rel`,
  `routerLinkActiveOptions`, `ariaCurrent`, `linkModifiers` and `ariaCurrentResolved`;
  `SidenavItemComponent` and `SidenavGroupComponent` each gained `ariaCurrent`, `noModifiers` and
  `ariaCurrentResolved`; `TooltipDirective` gained `dsTooltipWhenClipped` and `tipText`;
  `TableComponent` gained `actionLabel` and LOST `cellPopoverText`, `cellTextPopover`, `isClipped`,
  `onCellClipClick` and `onHeaderEnter`, so a subclass that overrode one of the five now overrides
  nothing. `FieldGroupComponent` gained `error`, `hint`,
  `warning`, `messageIcon`, `reserveMessage`, `reserveMessageResolved`, `invalidResolved`,
  `messageId`, `message`, `fieldMessage` and `uid` — it shares the fields' message base now;
  `InputComponent` gained `groupMessage`, and `SelectComponent`, `AutocompleteComponent` and
  `DatePickerComponent` gained `groupMessage` and `describedByIds`. Being public API or not is no protection:
  a `private` name collides with TS2415, and a `protected` one with TS4114 or TS2416, exactly as a
  public name does.

  `routerLink` also widened on the three navigating components — `string | readonly unknown[] |
  null` became `DsRouterLink`, which adds `UrlTree`. Writing it is unaffected; code that READS the
  value back, or overrides the input, has a new union member to handle.
- **`ds-stat` takes `--ds-stat-value-lines` and `--ds-stat-value-wrap`, which compose with the
  `white-space` hook.** The three cover the shapes a KPI value actually needs: clip to one line
  (the default), wrap freely, wrap and put the ellipsis on the line you name, or break a word wider
  than the tile.

  ```scss
  ds-stat { --ds-stat-value-white-space: normal; }                              /* wraps */
  ds-stat { --ds-stat-value-white-space: normal; --ds-stat-value-lines: 2; }    /* … then clips */
  ds-stat { --ds-stat-value-white-space: normal; --ds-stat-value-wrap: anywhere; }
  ```

  `--ds-stat-value-lines` only bites once the value wraps: a clamp on a `nowrap` box has nothing to
  clamp. And wrapping alone does not keep a long value inside the card — a single word wider than
  the tile still paints past the edge, which is what `--ds-stat-value-wrap: anywhere` is for.

  Whatever is clipped is still readable: the label and the value each disclose their full text in a
  tooltip on hover, and only when they are actually clipped, so a tile that fits shows no tip.

- **`dsTooltipWhenClipped`, so any host can disclose only what it is actually hiding.** With it the
  tip opens only while the host shows less text than it holds, re-tested on every open — so it
  appears and stops appearing as a column, panel or window is resized, with no observer to run. Left
  with no `dsTooltip` text it discloses the host's own text, which is what makes it usable on
  projected content.

  ```html
  <span class="cell" dsTooltipWhenClipped [dsTooltip]="row.name">{{ row.name }}</span>
  ```

  `isTextClipped(element)` is exported from `/core` behind it: true when the element, or anything it
  renders, is showing less than it holds. Horizontal only — a clamped block hides whole lines and
  its `scrollWidth` matches its `clientWidth`.

- **Five charts: `ds-bar-chart`, `ds-column-chart`, `ds-donut-chart`, `ds-funnel-chart` and
  `ds-line-chart`.** Each takes a `caption`, a `summary` for the accessible name, a `loading`
  skeleton sized to the real data so the chart does not resize when the numbers land, an `emptyText`
  and a `valueFormat` — and each offers its numbers again as a table under a
  `dataTable: 'toggle' | 'visible' | 'none'` disclosure, because a chart that only draws is a chart
  a screen reader cannot read.

  ```html
  <ds-bar-chart caption="Visitor funnel" [data]="rows" />
  <ds-line-chart [categories]="months" [series]="series" yAxisMode="rounded" />
  ```

  The two that carry real geometry are worth knowing about. `ds-funnel-chart` has a `shape`, and it
  defaults to `'area'` — the silhouette with the stage boundaries moved so each band's AREA is
  proportional to its value, the honest encoding that still leaves a tail you can put a label on.
  `'width'` reads every boundary off the values, which collapses the tail of a steep funnel below a
  labellable width. `'taper'` encodes NOTHING: the silhouette is fixed whatever the data, so editing
  the values moves the table under it and never the shape — reach for it only where the numbers are
  read from that table. `ds-line-chart` has a `yAxisMode` that only matters once a series sets
  `axis: 'secondary'`: `'rounded'` and `'exact'` share one set of gridlines and differ in whether the
  second axis rounds its step up or ends on its largest reading, `'independent'` grids each axis on
  its own, and `'stacked'` draws two plots sharing the category axis.

  All five take `interactive`, and it is the keyboard switch rather than the click switch: the click
  output — `rowClicked`, `pointClicked`, `sliceClicked`, `stageClicked` and `ds-line-chart`'s own
  `pointClicked` — fires with or without the flag. With it set, every mark joins the tab order as a
  `role="button"` answering Enter and Space, and the container announces itself as a `group` rather
  than an `img`; that swap is load-bearing rather than cosmetic, because `role="img"` makes a
  browser treat everything inside as presentational, and a focusable mark inside one is not
  reachable at all.

  `ds-donut-chart` is the exception, and deliberately: its arcs take the keyboard route only when
  `legend="none"`. Where a legend is drawn, its rows already carry the route, and making both
  focusable would give a four-slice chart eight tab stops for four things.

  The focus ring on an SVG mark is a drawn stroke, not an `outline` — an outline on an SVG element
  paints its BOUNDING BOX rather than its silhouette, so a funnel stage would ring as a flat bar
  across its trapezoid. `--ds-funnel-chart-focus-color` and `--ds-funnel-chart-focus-width`,
  `--ds-line-chart-focus-color` and `--ds-line-chart-focus-width`, and
  `--ds-donut-chart-focus-color` and `--ds-donut-chart-focus-width` set it, each falling back to
  `--focus-ring-color` and `--focus-ring-width`. Under forced colours the outline is kept instead,
  where `stroke` is not remapped.

  **Each chart draws its own frame** — border, radius, padding and an `--surface-default` background
  — which is unusual in this library, where a component resists owning chrome. A chart earns the
  exception because it is read as an object rather than as a block of text: a plot, its axes, a
  legend and an annex table all run into the page without an edge. One already sitting in a card
  drops it with `--ds-chart-frame-border-width: 0` and `--ds-chart-frame-padding: 0`.

  `ds-donut-chart` also takes `maxSlices`, which caps the legend: past it the smallest slices are
  summed into one named by `otherLabel`, on the neutral eighth palette colour. Off by default —
  grouping changes what the chart says, so it is the consumer's call — and the tail is summed rather
  than dropped, so the total never moves.

  Two geometry rules are worth knowing because they are not preferences. `ds-donut-chart` holds its
  centre content to the square that fits inside the hole, so a long `centerLabel` wraps instead of
  running out over the ring, and the text carries a halo of the chart's own background — at
  `thickness: 1` it sits on the slices, where no single text colour is readable against three
  different hues. And `ds-bar-chart` keeps a label far closer to its own bar than to the next row,
  because levelling the two makes the eye group a bar with the label BELOW it and read every row off
  by one.

- **Chart colour is three families, and reaching for the wrong one is the usual chart bug.** The
  eight `--ds-chart-series-N-color` hooks are CATEGORICAL — they separate marks that are DIFFERENT
  THINGS, such as donut slices or line series. A bar chart's rows are not different things; they are
  one series measured five times, and painting them from a categorical palette says five categories
  where there is one. So a single series has hooks of its own, and ordered stages have a third set:

  ```scss
  /* different things          */  --ds-chart-series-1-color … --ds-chart-series-8-color
  /* one thing, measured often */  --ds-chart-series-default-color + --ds-chart-series-accent-color
  /* ordered stages of one     */  --ds-chart-ramp-1-color … --ds-chart-ramp-8-color
  ```

  `ds-bar-chart` takes the single-series pair: every row shares `--ds-chart-series-default-color`, and
  setting `color` on one row marks the one the reader should land on — usually
  `var(--ds-chart-series-accent-color)`. There is no accent flag, because the accent is a colour and a
  boolean would only be a less flexible way of setting one. `ds-funnel-chart` takes the ramp, spread
  across however many stages there are, with the last stage leaving it for the accent.
  `ds-donut-chart`, `ds-line-chart` and `ds-column-chart` take the categorical set — a column often IS
  a separate thing (revenue by region), and where a column chart is instead one quantity over time,
  `color` puts every column on the single-series colour in one pass.

  The categorical eight are retuned with this: led by coral and teal, each clearing 3:1 on white for
  WCAG 1.4.11 and at least dE 15 from every other under normal, deuteranope and protanope vision. No
  hue sits between 35 and 130 — a yellow or a lime is high-luminance by nature, and dragging one down
  to clear the contrast floor turns it to mustard. Slot 8 is a neutral rather than a ninth hue: every
  eighth HUE that clears the floor lands within dE 4 of one of the other seven under some colour-vision
  deficiency, so the honest eighth is one that has no hue to collide with.

### Changed

- **`--ds-chart-line-width-bold` now reaches a rule.** Highlighting one `ds-line-chart` series —
  from the legend, or from a mark — thickens it to that width as well as dimming the others, so the
  highlight survives a monochrome print and a reader who cannot tell the two hues apart.

- **A chart's generated description leads with what the chart says, not with how it is drawn.** The
  order is now: what it is and its scale, the trend, the extremes, then where the numbers are —
  `"Visits by month, 3 points, 1,620 to 2,410. Rising throughout. Highest in Nov at 2,410, lowest
  in Sep at 1,620. Full values in the table below."` It used to recite first-to-last and then the
  extremes, which is a recital of the encoding, and blind readers rank that lowest of the four
  levels of chart description — the encoding is the one thing a screen-reader user cannot use.

  The trend is named rather than implied: a series that only ever rises reads "Rising throughout",
  one that dips on the way up reads "Rising overall", and one that returns to its starting value
  reads "Ending where it started".

  The closing pointer follows the table: a chart at `dataTable="none"` no longer promises a table
  that is not rendered. `summary` still overrides the whole sentence.

- **An `interactive` chart is one tab stop, not one per mark.** Arrow keys walk the marks, Home and
  End reach the extremes, and the ends wrap the way `ds-radio-group`'s do. `ds-line-chart` keeps one
  stop PER SERIES, so a two-series plot is two stops and each line is a strand the arrows walk;
  measured on the docs card, twelve markers now expose two tab stops instead of twelve.

  WCAG 2.1.1's Understanding is explicit that not every mouse-operable control has to be separately
  focusable, and that is the permission this rests on. Nothing in the API changed — a page that
  bound `interactive` and an output needs no edit — but a test that counted `[tabindex="0"]` inside
  a chart will now see one per series.

### Fixed

- **A disabled field is no longer announced as invalid.** Every field bound `aria-invalid` from its
  error state alone, so a control that was disabled AND carried an error told a screen reader
  "invalid" about something the reader cannot act on. Nothing on screen changed — the error paint
  already excluded disabled — which is why it went unseen.

  The belief that a natively disabled control made the attribute inert is wrong, and that is what
  kept the defect narrow in the record: measured in Chrome's accessibility tree, a disabled
  `<input aria-invalid="true">` reports `invalid=true` and is NOT ignored. Disabling removes an
  element from the tab order, not from the tree. So this reached all fifteen fields, not the two
  first reported.

  The rule lives in one place — the shared message resolver — rather than in fifteen templates: a
  disabled control is neither submitted nor validated, the same reasoning `_field-state.scss`
  already uses to keep the error paint off it. The message TEXT still shows: a refused field may
  still need to say why.

### What you can now DELETE

| your workaround | why it is unnecessary | replace with |
| --- | --- | --- |
| `class="btn` — a hand-written button class kept only for controls that need `fragment`, `queryParams`, `target` or `rel` | those reach `ds-button` now, so the control can move with the rest | `ds-button` with the matching input |
| `[routerLink]="'/path?a=1#b'"` — a query or hash folded into the link string | the string was percent-encoded into the path and never worked; the inputs carry them properly | `[queryParams]` and `fragment` |
| `RouterLink,` or `RouterLink }` in an import from `@angular/router`, in any position or layout, in your own component, only to write `[queryParams]` on a `<ds-button>` | that put a second `RouterLink` on the host, disagreeing with the anchor's about the destination | the component's own inputs |
| `ds-stat { --ds-stat-value-white-space: normal; }` written only to stop a long value painting over the tile beside it | the value clips by default, so it no longer escapes its card | nothing — keep the hook only where you want the value wrapped and the tile taller |
| `ds-stat .value { overflow: hidden; text-overflow: ellipsis; }` — your own clip on the value | the component clips it, and with `overflow: clip` plus a clip margin, so descenders survive where `hidden` shaved them | nothing |
| `.cell-text-pop` — a rule sizing or colouring the table's full-value popover | the popover is gone; a clipped cell opens a tooltip instead | `--ds-tooltip-*`, if the panel needs changing at all |

## 0.12.3 — 2026-09-10

### Breaking

- **`ds-button`'s `buttonRef` is `controlRef`, and it is typed `HTMLElement`.** The element the
  component renders now follows its destination, so the old name described one of three cases and
  the old type described the same one. Rename the reference; the property behind it is the same `#btn` view child.
  A read of `.nativeElement` that expects a `<button>` — `.disabled`, `.form`, `.type` — no longer
  type-checks and needs a narrow of your own, because the element may be an `<a>`.

  ```ts
  // before
  trigger.buttonRef().nativeElement.focus();
  // after
  trigger.controlRef().nativeElement.focus();
  ```

### Added

- **`ds-button` takes `routerLink` and `href`, so a call-to-action can stay a real link.** Three
  elements, decided by destination: `routerLink` renders an `<a [routerLink]>` that also carries
  `routerLinkActive`, `href` renders a plain `<a href>`, and neither renders the
  `<button type="button">` it always did. Unset — the default — nothing changes.

  The look is identical across all three, because the styling is class-based rather than keyed to
  the tag. What you get back is what the element decides: middle-click, open-in-new-tab,
  copy-link-address and the `link` role a screen reader announces.

  ```html
  <ds-button routerLink="/reports" icon="arrowRight">Go to reports</ds-button>
  <ds-button href="https://example.com" variant="outline">Read the spec</ds-button>
  ```

  `routerLink` takes the shapes a router link takes anywhere, a string or a command array.
  **`type` and `loading` are button-only** and are ignored on a link with a dev-mode warning: an
  anchor has no form to submit, and a navigation cannot be in flight before it starts. `disabled`
  works on all three, but an anchor has no native disabled state, so it takes `aria-disabled` plus
  `tabindex="-1"` — and its click is swallowed, which is what stops an `href` from navigating
  anyway. `disabledReason` reads the same on a link as on a button.

- **`ds-checkbox`, `ds-radio` and `ds-switch` take `ariaLabel`.** A control rendered with no
  visible label — no `label`, nothing projected — had no accessible name and nothing a consumer
  could set to give it one, while `ds-select` and `ds-number-stepper` had taken this input all
  along. The row's `<label>` collapses when empty, so on a bare box the `aria-label` is the whole
  name.

  ```html
  <ds-checkbox ariaLabel="Select all rows" />
  ```

  It applies only when there is no visible label; set it beside one and it overrides what the label
  says, which is the ARIA rule rather than a choice this makes.

- **`--ds-field-group-focus-shadow-error` — the halo a `ds-field-group` draws while invalid and
  focused.** Defaults to `--ds-field-focus-shadow-error`, the same halo a single error field uses,
  so a focused invalid group reads as one state instead of a red border with a blue glow around it.

- **`BreadcrumbItem` takes `ariaLabel`, for the icon-only crumb.** A crumb with an `icon` and no
  `label` — the usual home crumb — rendered as a link with no accessible name at all. Nothing is
  derived from `icon`: `home` is a glyph id, not a word for the user, so a crumb in that shape now
  dev-warns until it is given a name.

  ```ts
  items = [{ icon: 'home', href: '/', ariaLabel: 'Home' }, { label: 'Records' }];
  ```

- **`--focus-ring-radius` — the radius a box takes when it exists only to carry a focus ring.**
  Follows `--ds-radius-inner`, 4px, so retuning the inner radius moves these rings with it. There
  is no `outline-radius` in CSS: an outline follows the
  `border-radius` of the box it is painted on, so a ring host with no radius of its own draws a 90°
  rectangle beside the rounded controls around it. Set this to reshape every such ring at once, or
  give the host its own radius to override it locally.

### Changed

- **A clickable `ds-table` row, a `ds-tree` row and a `ds-list` activator draw a rounded focus
  ring.** All three ringed a square-cornered box while every control around them was rounded; they
  now carry `--focus-ring-radius`. The table row and the list activator paint nothing themselves -
  the table row's tints sit on its cells - so there the radius shapes the ring and nothing else; a
  `ds-tree` row paints its own hover, pressed and selected fill, and that fill now takes the same
  rounded corners. The radius sits on the resting rule
  rather than inside `:focus-visible`, or the shape would appear only while focused. Reachable by
  keyboard only.

- **`ds-checkbox`, `ds-radio` and `ds-switch` draw a rounded focus ring.** The ring goes on the row
  that holds the glyph and its label, and that row had no radius, so it came out square while the
  glyph inside it was rounded. The row now takes `--focus-ring-radius`. The row paints nothing else,
  so this changes the ring and nothing besides it — no fill, no border, no layout. Reachable by
  keyboard only; the resting state of all three is unchanged.

- **Four exported classes grew members — only matters if you SUBCLASS one.** `ButtonComponent`
  gained `routerLink`, `href`, `controlRef` and `destination`, which decides which of the three
  elements renders; `buttonRef` is gone from its surface, so a subclass that overrode it now
  overrides nothing. `CheckboxComponent`, `RadioComponent` and `SwitchComponent` each gained
  `ariaLabel` and `resolvedAriaLabel`. Being public API or not is no protection: a `private` name
  collides with TS2415, and a `protected` one with TS4114 or TS2416, exactly as a public name does.
  Nothing changes for a consumer who
  only uses the elements.

### Fixed

- **`ds-field-group[invalid]` keeps its error border under the cursor and under focus.** Both
  `:hover` and `:focus-within` carried one class more than `.invalid` did, so they out-ranked it —
  and the border is the group's ONLY error affordance, because a segment's own label and message are
  hidden to keep the glued row intact. The error vanished at exactly the moment the user reached the
  control. Hover and focus now do not match an invalid group at all, and its focus halo takes the
  error tint through the new `--ds-field-group-focus-shadow-error`. A valid group hovers and focuses
  exactly as before.

  `.invalid` also stops depending on line order to lose to `.disabled`: both sat at the same
  specificity and only the order of the two rules decided it. Disabled takes no state paint, the
  same rule the nine single fields now follow.

- **`ds-stat variant="error"` recolours the value.** `:host(.error) .value` and the later
  `.stat .value` land on the same specificity once emulated encapsulation adds its attribute to
  each, so the default colour won on source order and the error variant changed nothing at all.
  Error now moves the `--_stat-value-color` resolver, which is how the size variants already work,
  so a consumer's `--ds-stat-value-color` still overrides it.

- **`ds-sidenav-footer`'s collapse button has an accessible name.** Its only name was the
  `Collapse` text beside the chevron, and the collapsed rail hides that text — so on the rail, which
  is the state the button exists to leave, it announced as an unlabelled button. It now carries
  `aria-label`, and both the label and the name say `Expand` while collapsed, because that is what
  the button does from there. The placeholder search row rendered when there are no search items had
  no name either and now matches its live twin.

- **An icon-only `ds-breadcrumbs` crumb has an accessible name.** The crumb rendered an `<a>` around
  a decorative icon and nothing else, so a screen reader announced a link with no name and a
  keyboard user tabbed onto an anonymous stop. Give it `ariaLabel` (above); in dev mode a crumb
  still missing one says so.

- **A disabled field no longer paints its `data-field-state`.** An `error`, `warning` or `success`
  state used to out-rank the disabled look in all nine field components — `ds-input`, `ds-textarea`,
  `ds-select`, `ds-multi-select`, `ds-autocomplete`, `ds-date-picker`, `ds-time-picker`,
  `ds-color-picker` and `ds-otp-input` — so a field left invalid and then disabled kept a red border
  and fill while being unfocusable. It was pure specificity: the state selector carried one more
  class than the disabled rule it landed on. A disabled control is not submitted and is not
  validated, so the error promised a correction that could not be made; ARIA settles the same
  conflict the same way, ignoring an ARIA state that a native attribute contradicts.

  **A read-only field still paints it, deliberately.** `readonly` is submitted where `disabled` is
  not, so a wrong value there does reach the server and is worth flagging. Both skip browser
  validation; only one of them can still send something invalid.

- **A `ds-multi-select` panel's filter row draws a rounded focus ring.** It came out as a hard
  rectangle the full width of the panel, inside a panel whose every other control is rounded,
  because an `outline` has no radius of its own — it follows the box it is drawn on, and that row
  had none. It now carries `--ds-radius-inner`, which is the radius the panel's option rows and
  clear button already use. `ds-sidenav-footer`'s search box was always drawn this way and is
  unchanged.

## 0.12.2 — 2026-09-09

### Breaking

- **`--ds-table-hscroll-bottom` is `--ds-table-sticky-scrollbar-offset`.** The knob now carries the
  name of the feature it belongs to, beside `stickyScrollbar` itself and the new
  `[stickyScrollbarOffset]` input; the old spelling named neither the feature nor the edge it moves.
  It is inert under the old name, and a stylesheet that still sets it stops offsetting the bar with
  nothing said. Rename the declaration and the value carries over unchanged — except where the value
  was a negative offset equal to your scroll container's bottom padding, which the table measures
  and cancels itself now, so that one is deleted rather than renamed
  (delete list: table-hscroll-bottom-workaround).

### Added

- **`ds-sidenav-group` takes a `routerLink`, so a group can be a destination as well as a
  container.** Unset — the default, and what every existing group does — the header only expands,
  unchanged. Set it and the header becomes a link that navigates, and the caret splits off into a
  button of its own, because one control cannot both go somewhere and stay put to open something.
  The link takes the whole header's look, so the row still reads as one control, and it carries the
  active state when its route is the current one.

  ```html
  <ds-sidenav-group label="Reports" icon="chart" expandable routerLink="/reports">
    <ds-sidenav-item label="Daily" routerLink="/reports/daily" />
  </ds-sidenav-group>
  ```

  It takes the same shapes a router link takes anywhere, a string or a command array. **It does
  nothing without `expandable`** — a group that cannot open has no caret to split off, so the header
  stays a plain label and the link is ignored with nothing said. On a group that does opt in, the
  header element changes from a `button` to an `a` — the active state above is a contextual
  `.active` class it carries — and gains a `.group-header-row` wrapper beside a
  `.group-caret-button`, with
  `.group-caret` now sitting inside that button rather than directly in the header; a stylesheet of
  yours reaching `.group-header` by class still lands, one that qualifies it with `button` does
  not.

- **`ds-table` takes `[stickyScrollbarOffset]`, and `DS_CONFIG.table.stickyScrollbarOffset` sets it
  for every table.** Where the sticky horizontal scrollbar comes to rest, as any CSS length.
  Unset — the default — each table measures its own scroll container's bottom padding and cancels
  it, which is what puts the bar on the edge the reader sees; set this for a scrollport whose
  reachable edge is somewhere else, and set it in the config when that is true of a whole app rather
  than of one table. `--ds-table-sticky-scrollbar-offset` still out-ranks both, for a rule that has
  to reach one table from a stylesheet.

  ```html
  <ds-table
    [stickyScrollbarOffset]="'-3rem'"
    [stickyScrollbar]="true"
    [columns]="cols"
    [data]="rows" />
  ```

### Changed

- **An expanded `ds-table` row opens with a reveal instead of appearing at full height.** The
  panel's cell animates its `grid-template-rows` from `0fr` to `1fr`, and a new
  `.expand-panel-inner` wrapper between the cell and your projected expand template clips the
  overflow so the content wipes into place rather than snapping open. The reveal runs over
  `--duration-base` at `--ease-standard`; set those to retune its speed and curve. Under
  `prefers-reduced-motion: reduce` the panel appears fully open with no reveal. Because that
  wrapper now sits between the `<td>` and the projected template, a rule of yours that reached the
  template as a direct child of the cell no longer matches — reach it through `.expand-panel-inner`,
  or drop the child combinator.

- **The skeleton shimmer reads as a wave now, not a wash.** It travels diagonally, down and to the
  right at 45°, so it arrives at the top of one placeholder and the bottom of another instead of
  sweeping every row in step. Two waves cross per period — a main one and a quieter one exactly
  between two mains — which fills the wait a single band left without making the main wave hurry.
  Neither has a flat core: each peaks at a point and is ramp either side, so a pass arrives and
  leaves rather than switching. The tone is one soft step darker than the base, unchanged: a shadow
  moving over the placeholders, not a light switched on over them.
  It is seamless, and the reason is one number. A repeating gradient still paints into a finite
  image which the browser tiles, and an angled gradient meets itself across a tile edge only when
  the tile advances its phase by a whole period: at 135° a square tile of side S advances it by
  S / √2, so the tile has to be period × √2. Left at `auto` the tile was the positioning area — the
  viewport, under `fixed` — and every tile boundary showed as a hard line straight across the page.
  Measured against tiles of period / √2, of period, and one oversized no-repeat image: all three
  seam, this one does not.

  Four hooks, all with defaults — `--ds-skeleton-wave-period` (56rem),
  `--ds-skeleton-wave-duration` (3400ms), `--ds-skeleton-wave-angle` (135deg) and
  `--ds-skeleton-wave-echo-color`. **`--ds-skeleton-wave-duration` replaces the shimmer's old
  dependency on `--duration-loop-slow`**, so a brand that retuned that global no longer reaches the
  skeleton — set the skeleton hook instead. The loop is 3400ms where it was 1400ms, and the pass no
  longer rests between crossings. **`--ds-skeleton-wave-angle` retunes the gradient's direction
  only**: the tile size and the loop's travel are fixed to the 45° diagonal, so an angle far from
  the default tiles visibly. Change it for a small adjustment, not for a new axis.

- **Two classes gained members — only matters if you SUBCLASS one.** `TableComponent` gained
  `showsLoadingSpace`, which decides whether a table that is still loading and has no rows yet holds
  a body open instead of collapsing onto its header, and `publishHeadHeight`, which measures the
  header and publishes its height for the scrim to inset against, `scrollAncestor`, which finds the
  scrollport a sticky offset inside the table resolves against, `hasAnyColumnFilter`, which decides
  whether the column-filter panel is rendered at all, `isFilterPanelOpen`, which tells a header
  button whether the panel showing belongs to it, and the new `stickyScrollbarOffset` input with its
  `stickyScrollbarOffsetResolved`. `SidenavGroupComponent` gained the
  new `routerLink` input and `headerNavigates`, the computed that decides whether the header splits
  into a link and a caret. Only `routerLink`, `stickyScrollbarOffset` and
  `stickyScrollbarOffsetResolved` are public API, and that is no protection for the rest:
  a `private` name collides with TS2415, and a `protected` one with TS4114 or TS2416, exactly as a
  public name does, so a member of yours
  sharing one of those names stops the build. Nothing changes for a consumer who only uses the
  elements — no existing input, output or token changed name or type.

- **A fullscreen `ds-modal` is a full-height panel now, so `--modal-h-fullscreen` reads as a target
  and no longer as a cap.** The class used to set the token as a `max-height`, which let a short
  body shrink the panel; it sets the height itself now, still clipped by the modal's own 90dvh
  ceiling. A modal you sized through that token gets `min(your value, 90dvh)` — set it below the
  ceiling if you want the panel shorter, and expect the extra room to go to the scrolling body with
  the footer at the bottom of the screen.

- **`ds-date-picker` focuses like a field, not like a button.** `--ds-date-picker-focus-shadow`
  falls back to `--ds-field-focus-shadow` instead of `--ds-control-focus-shadow`, so the trigger
  draws the single soft field halo the inputs draw and follows the `data-focus` switch, which it
  used to ignore. A brand that retunes the control family no longer reaches the date picker — retune
  the field family, or set `--ds-date-picker-focus-shadow` outright. `ds-time-picker` still resolves
  the control family, so the two now focus differently.

- **Five classes that carried no styling are gone from the DOM — only matters if YOUR stylesheet
  reached one.** `ds-autocomplete`'s trigger no longer takes `.open` or `.error`,
  `ds-multi-select`'s trigger no longer takes `.readonly`, and `ds-tabs`' count badge is
  `class="badge"` where it was `class="badge neutral count"`. This library never styled any of the
  five, so none of its own rules move; a rule of yours keyed off one stops matching, silently. Every
  state they reported is still on the element:
  `.autocomplete-trigger:has(input[aria-expanded="true"])` for open, the host's
  `[data-field-state="error"]` for error, `.field-trigger[aria-readonly="true"]` for read-only, and
  `.badge` on its own for the badge.

- **The `ds-progress` warning bar is a yellow.** `--ds-progress-bar-color-warning` falls back to
  `--yellow-500` rather than to `--warning-hover`, which mixed the warning hue toward black in the
  light theme and toward white in the dark one — one bar read olive, the other pale. Both themes
  paint the same yellow now. A brand that recoloured the bar through `--warning-hover` no longer
  reaches it; set `--ds-progress-bar-color-warning`. `--warning-hover` itself is unchanged and still
  used elsewhere.

### Fixed

- **A `ds-table` loading in `overlay` mode with no rows keeps a body.** The tbody was empty, so the
  table collapsed onto its header and the spinner floated over nothing. It now holds one
  `aria-hidden` spacer row's worth of height, built from the same padding and line height a real row
  uses, so it tracks density. Only `[loading]="'overlay'"` with zero rows is affected — `skeleton`
  draws its own rows and `[loading]="true"` resolves to `skeleton` when there is nothing to show.
  A test that asserts an empty tbody during an overlay load now sees that one row.

- **The `ds-table` loading scrim starts below the header from the first frame.** The header height
  was read once per load and before layout, so the first frame fell back to a 40px guess under a
  taller header and the blur began mid-header. It is measured after render and re-measured whenever
  the header resizes, so a header that wraps or a density change moves the scrim with it.
  `--ds-table-head-h` still overrides the measurement.

- **The `ds-table` selection checkbox stops twitching when the mark changes.** The box sat on the
  text baseline, so the header row's height moved by a fraction of a pixel as the select-all box
  swapped between its tick and its indeterminate bar. It is centred against the line box now. This
  reaches the table's header and row checkboxes and the `dsTableColumns` panel's per-column
  checkboxes; `ds-checkbox` itself lays the box out as a flex item and never showed it. A
  `::ng-deep` nudge you added to compensate for the old sit is now that much out.

- **`ds-date-picker`'s calendar glyph matches the value it sits beside.** It rendered two pixels
  taller than the digits' cap height and overhung them top and bottom.

- **Clicking above or below the digits in `ds-date-picker` places the caret instead of opening the
  calendar.** The text input only covered the value's own line box, so the band either side of it
  fell through to the trigger. It spans the field's height now.

- **`ds-dropzone` shows the hand cursor once files are listed.** The zone kept the arrow, which read
  as "this is finished, there is nothing to click", while the whole zone had stayed clickable the
  entire time. Nothing about what a click does has changed.

- **`dsTableColumns` draws a styled panel and a styled header button.** The panel's checkboxes, drag
  handles, move buttons and `Reset to default` link came out as the browser's own widgets and the
  button that opens the panel as a bordered grey rectangle, because the rules for `.col-picker`,
  `.col-picker-row`, `.col-picker-option`, `.col-drag`, `.col-move`, `.col-move-btn`, `.col-reset`
  and `.col-picker-btn` were scoped to `ds-table` while the elements they name sit in views of their
  own. Each of those classes is styled from the view that renders it now. Markup, class names and
  API are unchanged, but a stylesheet of yours that reached one of them by a bare class name shared
  the element with nothing and now competes with a scoped rule — qualify your selector, or reach for
  the token the class reads.

- **A `ds-table` sticky horizontal scrollbar rests on the edge the reader can see.** Inside a scroll
  container with bottom padding the bar settled one padding-bottom short of that edge and drew over
  the rows beneath it, because a sticky `bottom` resolves against the scrollport's content box. The
  table measures that padding off its scroll ancestor, cancels it, and re-measures when the
  container resizes, so a padding that moves with a media query moves the bar with it.
  `--ds-table-sticky-scrollbar-offset` still overrides the measurement outright — keep it for a
  scrollport whose reachable edge is not its padding edge, and drop a negative value written to
  cancel your own container's padding, which now offsets the bar a second time
  (delete list: table-hscroll-bottom-workaround).

- **`clearable` on `ds-autocomplete` and `ds-multi-select` draws the clear button the rest of the
  field family draws.** Both rendered the `.clear-btn` markup with no rule able to reach it, so the
  × came out as the browser's default button — a grey bordered rectangle with a square corner and a
  default cursor — next to the properly drawn chips it sits beside. `ds-select`'s rule is shared by
  all three now: chromeless, `--icon-default`, `--ds-radius-inner`, `--space-0-5` of padding and the
  press feedback, over a `--surface-secondary` hover. `ds-select` itself is unchanged, and `ds-input`
  keeps its own filled-disc clear button, which is a different control on purpose
  (delete list: picker-clear-button-workaround).

- **A `ds-table` column filter opens on the first click.** The first click on a filter button only
  built the panel and the second one opened it, because the handler raised the condition that
  renders the panel and then read the panel back in the same synchronous line, before change
  detection had created it. The panel's existence now follows the columns' own filter configuration,
  the way the row-actions menu and the clipped-cell text popover already did, so it is there before
  the first click arrives. This reaches `filterMode` set to anything but `'none'`, both the built-in
  `filter: 'set'` panel and a projected `dsHeaderFilter`, and the keyboard as much as the pointer —
  one Enter on the button opens it. A table with no filterable column renders no panel at all.

- **A `ds-table` column filter button says whether its panel is open.** It announced
  `aria-haspopup="dialog"` and never `aria-expanded`, so a screen reader was told a dialog was
  available but never that it had appeared. The attribute is on every filter button now and reads
  `true` only on the column whose panel is showing.

- **A `ds-table` bulk-action bar rests `--bulk-bar-offset` above the edge the reader can see.**
  Inside a scroll container with bottom padding it floated that offset PLUS the padding above the
  edge, because a sticky `bottom` resolves against the scrollport's content box — the same reason
  the sticky horizontal scrollbar settled short. The table measures its scroll container's bottom
  padding once and both subtract it, so the gap is the offset you set whatever the container's
  padding is. Only a table with row selection inside a padded scroll container moves; the token
  itself is unchanged.

- **A panel re-opened straight after being dismissed can be closed again.** Dismissing an overlay
  disposes it only after its exit animation, so re-opening within that window let the OLD panel's
  disposal clear the state belonging to the NEW one: the component held no reference to the panel on
  screen, `close()` therefore did nothing, and neither Escape nor a click outside would dismiss it —
  while `aria-expanded` reported it collapsed. Reachable by dismissing and re-opening quickly, and
  in `ds-table` by moving from one column filter to another. Measured in `ds-date-picker`,
  `ds-color-picker`, `ds-time-picker` and `ds-popover` — and so in everything `ds-popover` carries:
  `ds-table`'s column filter, row-actions menu and clipped-cell text, `ds-split-button`,
  `ds-filter-bar`'s overflow panel and `ds-sidenav-footer`'s search. `ds-select`,
  `ds-autocomplete` and `ds-multi-select` were already immune and are unchanged in behaviour.

### What you can now DELETE

| your workaround | why it is unnecessary | replace with |
| --- | --- | --- |
| `ds-table .check` — a margin or `transform` nudging the selection box off the text baseline | the box is centred against the line box now, so the nudge is an offset of its own | nothing |
| `--ds-table-hscroll-bottom: -` — a negative offset equal to your scroll container's bottom padding | the table measures that padding and cancels it itself, so the value offsets the sticky scrollbar a second time — and the token it sits on is renamed, so this one is deleted rather than carried over | nothing |
| `ds-autocomplete .clear-btn` (or the `ds-multi-select` one) — your own rule giving the clear × a border, background, radius or size | both draw ds-select's clear button themselves now, so your rule fights it | nothing |

## 0.12.1 — 2026-09-05

### Breaking

- **`ds-table`'s data-grid features are directives now, so a table that does not use them stops
  carrying them.** Reordering, the column picker and resizing left the component; a table with none
  of them costs **35 647 → 16 410 B gzip, −54%**, and `@angular/cdk/drag-drop` goes with the drag
  handle. Each feature is one import and one attribute away, and two of the moved inputs changed
  shape on the way:

  ```html
  <!-- was -->
  <ds-table [reorderableColumns]="true" [resizableColumns]="true" [exportButton]="true" />

  <!-- now: add the directive to the component's imports, and its attribute here -->
  <ds-table dsTableColumns reorderableColumns dsTableResize dsTableExport />
  ```

  Every switch above reads as a boolean attribute, so its bare presence turns it on and
  `[reorderableColumns]="true"` is the same thing written longer. Only `[dsTableExport]="false"`
  earns a value, and it turns the built-in button off while keeping the feature.

  | feature | directive | class, and where it lives | its inputs |
  | --- | --- | --- | --- |
  | reorder + the column picker | `dsTableColumns` | `DsTableColumns`, `…/table-columns` | `reorderableColumns`, `[(hiddenKeys)]`, `[(columnOrder)]` |
  | column resizing | `dsTableResize` | `DsTableResize`, `…/table-resize` | none — the bare attribute is the whole switch |
  | CSV export | `dsTableExport` | `DsTableExport`, `…/table-export` | `exportFilename`, `exportFetcher`, `(exportFailed)` |

  **`exportButton` is gone as an input** — the directive's own presence renders the button, and
  `[dsTableExport]="false"` keeps the feature while hiding the built-in control. `runExport()`,
  `exporting()` and `exportCsv()` stay on the table, because their documentation promises a button
  elsewhere on the page can drive them; they now delegate to the directive, and calling one with no
  directive present logs a dev-mode warning rather than doing nothing. **Binding a moved input
  without adding its directive does not compile**: `reorderableColumns`, `[(hiddenKeys)]`,
  `[(columnOrder)]`, `resizableColumns` and `[(columnWidths)]` are gone from `ds-table` with no
  passthrough, so the template fails the build rather than quietly doing nothing. Two of them do not
  come back as bindings at all — `dsTableResize` declares no inputs and no outputs, so
  `[(columnWidths)]`, `[columnWidths]` and `(columnWidthsChange)` compile nowhere: resizing can no
  longer be toggled by an expression, and the widths are reachable only through a
  `viewChild(DsTableResize)`. `dsTableColumns` keeps the other three under their old names and
  defaults, and `(hiddenKeysChange)` and `(columnOrderChange)` still fire on the same element, so
  those bindings survive once the attribute is there. The handle itself is unchanged: the same
  keyboard steps and minimum width, the same markup, the same `col-*` classes, and no custom
  property added or removed.

  `persistLayout` and `storageKey` stay on the table, under the same storage key and the same
  `{ order, widths, hidden }` shape, so a layout saved by an earlier version still restores — a
  part whose directive is absent is simply not applied. Saving works the other way round now: only
  the slices the present directives own are written, where every save used to carry all three. A
  table that takes `dsTableResize` and not `dsTableColumns` rewrites an existing entry with widths
  alone on its first save and drops the reader's stored order and hidden columns, and `persistLayout`
  with a `storageKey` and neither directive writes nothing at all. Keep both directives on a table
  whose layout you persist.

- **A column declared `hidden: true` renders unless `dsTableColumns` is on the table.** Column
  visibility is the directive's stage now — `ds-table` reads neither `hidden` nor `hideable` without
  it. `TableColumn` is unchanged, both fields still declared and still typed, so a table that sets
  them compiles exactly as before and shows every column. Two structural consequences ride along. A
  table with hideable columns and no `rowActions` used to grow a trailing utility column to carry the
  picker button; without the directive that header cell and its body cells are gone, so a rule that
  counts columns lands one off. And with the directive the button renders unconditionally, where it
  used to need at least one `hideable` column or `reorderableColumns` — a table that takes
  `dsTableColumns` for reordering alone gains the utility column plus a "Choose columns" panel whose
  checkboxes are all disabled. Add the directive wherever a column is declared `hidden` or
  `hideable`.

- **A focused `ds-checkbox`, `ds-radio` or `ds-switch` rings the whole row, label included, instead
  of the glyph.** Ringing the glyph put a brand ring concentric with the brand ring the CHECKED state
  already draws — three bands through two gaps, a target rather than two states a keyboard user has
  to tell apart while moving through a group. The row is also what the pointer already hits, since
  the label carries the hit area. A control with no label has no row to speak of, so there the ring
  keeps its distance instead (`--space-1-5` rather than the usual 2px offset). It is keyboard-only:
  the row matches `:has(:focus-visible)`, so clicking a checkbox with the pointer leaves no ring
  behind. A `ds-table` selection checkbox has no row to ring, so it rings its own box.

- **Every hand-written `outline: none` in the library became `focus.own-indicator`.** The declaration
  is the same everywhere except in forced colours, where it is now skipped. Windows High Contrast
  drops `box-shadow`, so a field whose shell rings with the halo had nothing left once its inner
  control was silenced — the one mode where an indicator is mandatory was the one mode without one.
  If you silence a DS control in your own stylesheet, wrap it the same way:
  `@media not (forced-colors: active) { outline: none; }`.

- **Every focus ring on a control is an `outline` now, not a box-shadow, and its gap is genuinely
  see-through.** A shadow cannot leave a hole: the gap had to be painted with a guessed colour, and
  that guess was a coloured rim everywhere it was wrong — a control standing on a tinted band, a
  photo or a card of another shade got a surface-coloured band around it rather than its own ground.
  `outline-offset` does not paint its gap at all, so the ring now floats over whatever the control
  actually sits on. Two things follow. A negative offset draws the ring INSIDE the element, which is
  how a row inside a clipping panel keeps an indicator that `overflow: hidden` used to eat — `ds-menu`
  and the dropdown panels do this. And the ring no longer competes with `box-shadow`: a focused card
  keeps its elevation, where before the two signals fought for one property. A state carried partly
  by a shadow — the selected segment, the active pill, the sidenav item's rail — still drops that
  shadow while focused, deliberately, because its fill and label colour go on saying which one it is.
  — Restyle the ring through the new `--focus-ring-width` (2px, the WCAG 2.4.13 floor for a
  perimeter indicator), plus `--focus-ring-color` and `--focus-ring-offset`, which are unchanged. Components author it through one mixin,
  `focus.ring($offset)`, so there is a single place to change it.
  — If you set `--focus-ring-inner` to a colour to get a visible ring back, remove it: the token no
  longer reaches a control's ring. It still composes the field halo that `data-focus="ring"` opts into.
  — Watch for an `outline: none` of your own on a DS control. It used to remove nothing, because the
  ring was a shadow; it now removes the indicator outright, and nothing warns.

- **Thirteen `--ds-<component>-focus-shadow` tokens are gone**, on button, icon-button, card,
  checkbox, radio, switch, tabs, toast, breadcrumbs, pagination, sidenav-item, sidenav-group and
  menu-item. Each resolved to `--ds-control-focus-shadow`, which controls no longer read; nor does
  the error button read `--ds-control-focus-shadow-error`. Set
  `--focus-ring-color`, `--focus-ring-width` or `--focus-ring-offset` on the component's own scope
  instead. Field tokens — `--ds-input-focus-shadow` and its siblings — are unchanged, because fields
  keep the soft halo. An override of a removed token still parses and cascades and changes nothing,
  so this fails silently.

- **`data-focus="field"` and `data-focus="outline"` are removed** from the one-place focus switch.
  Both described swapping one box-shadow for another, which no longer describes anything a control
  does. `ring`, `edge` and `inset` keep their meaning, and `edge` is the tight-ring answer that
  `field` was reached for. An unknown value matches nothing and is ignored in silence.

### Added

- **The check mark overshoots as it lands, and its motion is now four tokens.** A tick that scaled
  in on a flat ease read as a state flag; it now arrives on `--ease-spring` over 180ms and leaves on
  `--ease-accelerate` over 120ms, so it settles rather than snaps. The timing is a motion ROLE —
  `--ds-motion-check-enter-duration`, `--ds-motion-check-enter-easing`, `--ds-motion-check-exit-duration`,
  `--ds-motion-check-exit-easing` — with per-scope hooks `--ds-check-mark-*` beneath it, so a dense
  option list can stay calm while forms overshoot. To put the previous motion back, set the four
  tokens to the timing they replaced, `--duration-fast` on `--ease-standard` both ways. Both durations resolve through the `--duration-*`
  scale, which `prefers-reduced-motion` already zeroes, so the mark goes instant on its own.
- **The tick and the indeterminate bar are painted as a mask over `currentcolor`, not as a hardcoded
  white stroke.** One path serves a filled box and a bare row — white on the accent fill, the row's
  own colour on a surface — and under `forced-colors: active` it resolves to `CanvasText`, so in
  Windows High Contrast a checked or indeterminate mark stays distinct from the forced fill of the
  box it sits in, where before the two came out the same colour. This is the mark in `ds-checkbox`,
  in `ds-table`'s select-all, row and column-filter boxes, in a picker panel's option ticks, and in
  `ds-autocomplete` and `ds-multi-select`. Nothing to change on your side: a colour override of your
  own is unaffected, and forced-colors mode discards colour overrides either way.

- **Every option mark in a picker panel is now the SAME mark as a checkbox's,** and animates with
  it: the selected row in `ds-select` and single-mode `ds-autocomplete`, the option boxes in
  multi-mode `ds-autocomplete`, and every box in a `ds-multi-select` panel — option rows, group-all
  and select-all. Each was a `ds-icon name="check"` rendered only while selected, so it had no
  resting state to move from and popped in. The indeterminate bar animates on the same tokens now,
  instead of appearing as a separate element. The mark is painted as a mask over `currentColor`,
  which is what lets one path serve a filled box (white on the accent) and a bare option row
  (accent on the surface). `--ds-option-check-color` still picks its colour.

- **A picker panel's option box is drawn at the checkbox's own border weight.** It used
  `--border-width-strong` where `ds-checkbox` and `ds-radio` read `--check-bw`, so the same control
  shipped at two thicknesses; the panel boxes in `ds-multi-select` and multi-mode `ds-autocomplete`
  are 1px now, on the unchanged 20px `--check-size`.
- **The typing area beside an autocomplete's chips is 40px, not 80px.** `--ds-autocomplete-input-minw`
  is a floor, so in the default `width="fill"` the input still stretches across the row and only the
  chip case changes; under `width="content"` it is what an empty field measures. Set the hook back to
  `80px` to keep the old footprint.
- **A multi-select panel's "Select all" row clips its label like the option rows do.**
  `.select-all-label` carried no clip at all, so a narrow panel wrapped that one row to two lines
  beside single-line options. The per-group "All of …" row is not wrapped in an element, so it is
  not clipped and a long group name still wraps there.
- **`ds-radio` accepts `[deselectable]`,** which lets a checked STANDALONE radio be cleared by
  clicking it again. Off by default and ignored inside `ds-radio-group`, where clearing the one
  selected option would leave the group with no value through a gesture the group cannot see.

### Changed

- **A date field is as wide as its date.** The trigger sized its input with the HTML `size`
  attribute, which counts CHARACTERS — and a mask's slashes, spaces and dash are all narrower than a
  digit, so a range reserved roughly two digits of dead space between the value and the calendar
  button. The painted overlay now sits in the flow and measures the field with the real glyphs.
- **Mono type no longer ligates operators.** JetBrains Mono draws `===` as one triple-bar glyph and
  `!=` as a struck equals, so any prose naming an operator showed something other than the characters
  it was discussing. `--ds-t-mono-ligatures` puts them back for a consumer who wants them.
- **`ds-table` selects rows with the design system's checkbox, not the browser's.** Its
  `<input type="checkbox">` was styled nowhere at all, so the OS drew it — no DS geometry, no DS
  colours, no mark. The box is a shared partial now, so it cannot drift from `ds-checkbox`, and it
  answers the same hooks: `--ds-checkbox-bg-color`, `--ds-checkbox-border-color`,
  `--ds-checkbox-selected-bg-color` and their siblings reach a table's selection column where they
  previously did nothing. The element is still an `<input type="checkbox">`, so a selector of your
  own aimed at it still matches — but it is now competing with the library's own rule instead of
  styling something nothing else touched, and the box sets `appearance: none`.

- **Three classes gained members — only matters if you SUBCLASS one.** `MenuComponent` gained
  `anyIcon`, which it computes over its content children, `RadioComponent` gained `onClick`
  alongside the new `deselectable` input, and `TableComponent` gained `anySelected`, a computed
  over the selection set, the anchors the table's opt-in features render into, and the seam they
  write through. A subclass that declares any of those names stops building, whether or not the
  member is public API.

  **`TableComponent` also LOST the data-grid half**, and how you hear about it depends on how the
  subclass was written: `columnOrder`, `hiddenKeys`, `columnWidths`, `reorderableColumns`,
  `resizableColumns`, `exportButton` and their handlers moved to `dsTableColumns`, `dsTableResize`
  and `dsTableExport`. A member you marked `override` fails the build, because there is no base
  member left to override; one you declared without the modifier still compiles, overrides nothing
  and runs never.

  Four new classes come with those directives, and all four are internal: `DsTableLayout` is
  internal, the seam a feature registers with; `TableColumnsPanelComponent` is internal, the
  column panel; `TableColumnsTriggerComponent` is internal, its header button; and
  `TableExportButtonComponent` is internal, the toolbar button. None is API, none appears in the
  component reference, and each is created imperatively — they are named here only so a name
  collision in a subclass is greppable from the first release that has them.

- **The focus ring eases in instead of appearing at full strength.** Only its colour moves — the
  ring's geometry is already in place, so nothing shifts and the indicator lands where it will stay.
  `outline-offset` is deliberately not animated: an expanding ring lags the caret on a fast Tab, and
  the indicator is a keyboard user's only signal of where they are. It runs as an `animation` rather
  than a transition, because `transition` is a single property and a component that declares its own
  list would have had it replaced for as long as the element held focus — a focused button would have
  lost its background easing. The duration is `--duration-fast`, which the library already zeroes
  under `prefers-reduced-motion: reduce`, so a reduced-motion user sees the ring appear instantly
  with no separate opt-out to wire up.

- **`ds-split-button` with an empty `menuItems` disables its chevron instead of opening an empty
  menu.** The template carried no guard, so a split button configured with nothing to list still
  opened a panel with nothing in it — a chevron is a promise that there is more, and an empty panel
  reads as a broken control. The trigger is now disabled whenever `menuItems` is empty, and a
  development build warns once and names `ds-button` as the control for a single action. It is
  disabled rather than hidden, so the button keeps its geometry: a `ds-split-button` whose items
  arrive asynchronously shows a disabled chevron until they do and enables itself when they land.
  The panel can only ever be the `ds-menu` built from `menuItems` — nothing projects into it, and
  anything else composes from `ds-button` and `ds-popover`. Content you project into
  `ds-split-button` itself still lands on the main button, as before.

### Fixed

- **A `ds-table` column filter's value list draws proper checkbox boxes.** That list renders in an
  overlay, outside the element that declares the box's `--ds-checkbox-*` resolvers — and an
  unresolved custom property inside a `border` invalidates the whole declaration at computed-value
  time, which left a box with no border and no size. The shared box carries each resolver's own
  default as its fallback now, so it paints wherever it is projected, including into an overlay of
  your own. No token name and no default changed, and there is nothing to change on your side.

- **The bulk-action bar vanished exactly when every row was selected.** It was gated on the header
  checkbox's INDETERMINATE predicate — "some rows, but not all" — so selecting the last row hid the
  bar with the selection still live, which is when a bulk action is most likely. It answers the
  selection being non-empty now — the selection set itself, not the rows on screen, so the bar also
  stays up where it used to disappear: select rows on page one and page forward and it holds, and it
  holds when a filter hides every selected row. The selection is still live and still actionable,
  which is the point of the bar.

- **The skeleton shimmer is one wave across the screen again, and it no longer stutters.** Every
  `ds-skeleton` shows the slice of a single viewport-wide band passing over its own position, so a
  page of placeholders reads as one light moving across it rather than as N loops running side by
  side. The band is two tones of the same surface — colour washing over the placeholders, not a
  highlight shone on them. It replaces a per-element `mask-position` slide of a 200vw mask, which on
  a narrow skeleton parked the band off the element for most of the loop, flicked it through, and
  restarted on a hard cut. The wave is anchored with `background-attachment: fixed`, which resolves
  against the nearest transformed, filtered or `will-change: transform` ancestor rather than the
  viewport — so skeletons inside an animated drawer or a transform-based layout wave locally on that
  ancestor instead of joining the page-wide one.

- **A focused first or last `ds-accordion-item` drew a square ring inside the rounded box.** An
  outline follows its own element's radius, and the rounded corner belongs to `ds-accordion`, not to
  the header button. The first and last header take that corner now; the rows between stay square,
  because there is no corner there to follow.

- **A `ds-date-picker` day outside the allowed range highlighted under the pointer as though it
  could be picked.** The day button is only ever `aria-disabled`, never natively disabled, so its
  hover rule still matched and offered an unselectable date. Hover now skips a disabled day; the
  colour and cursor it already carried are unchanged.

- **Three fields answered focus with a one-pixel border tint and nothing else.** The sidenav
  footer's search box, the table's column filter and the table's inline cell editor each turned the
  outline off to make room for a border colour change — one pixel, under the WCAG 2.4.13 floor of a
  2px perimeter, and on the cell editor the accent border is already its resting chrome, so focus
  changed nothing at all. All three ring properly now and keep the tint as a second signal.

- **The search field inside a `ds-multi-select` panel showed no focus indicator at all.** It zeroed
  its own outline and no ancestor painted one, so a keyboard user opening the panel and tabbing to
  the filter had nothing on screen telling them where they were. The row around it rings now, drawn
  inward because the panel clips, and the input is silenced so only one ring appears.

- **A focused `ds-icon-button` sitting flush inside a clipping box lost three sides of its ring.**
  Seen first on the documentation sidebar's collapse toggle, then swept: a `ds-table` row sits flush
  inside the horizontal scroller, and a collapsed `ds-sidenav` clips its own brand link. In each the
  ring had zero room outward and read as sitting behind the control. Any box that clips can now flip
  `--focus-ring-offset` negative on itself and everything focusable inside keeps a whole ring.

- **A `ds-menu` row without an icon started one icon-width left of its neighbours.** `.menu-item` is
  a flex row with a gap, and an item that projected no icon collapsed its wrapper to zero width while
  the gap stayed, so a mixed menu had two text axes and an unindented row read as a different kind of
  thing. The menu decides it now rather than the item — an item cannot see its siblings — so one
  item with an icon makes every item reserve the slot. A menu with no icons anywhere moves
  flush to its padding, because the empty icon slot no longer costs the row's 10px gap. The new `--ds-menu-item-icon-size` sets the width the slot reserves.

- **`ds-split-button` answers a press on either half.** Both segments were missing the darken-plus-
  micro-scale that every other button in the library gives a press, so the one control built from two
  buttons was the one that felt dead under the finger. Each half now darkens through
  `--ds-split-button-bg-color-active` (or `--ds-split-button-outline-bg-color-active` on the outline
  variant) and scales by `--ds-split-button-press-scale`, with the same opt-in pressed halo hook the
  button has (`--ds-split-button-pressed-shadow`, default none). The scale runs AWAY from the seam —
  `transform-origin` is the inner edge on each half — because a centred scale pulls the pressed half's
  inner edge inward and opens a hairline gap in the joint.

### What you can now DELETE

| your workaround | why it is unnecessary | replace with |
| --- | --- | --- |
| `::ng-deep ds-menu-item` — a left padding or margin added so icon-less rows line up with rows that have icons | the menu reserves the icon slot for every row as soon as one item carries an icon | nothing |
| `::ng-deep ds-split-button` — a hand-rolled `:active` darken or scale | both halves darken and scale on press, and the scale runs away from the seam so the joint stays closed | `--ds-split-button-bg-color-active`, `--ds-split-button-press-scale` |
| `::ng-deep .search` — a focus indicator added by hand to a picker's search box, a column filter, a cell editor or a clipped icon button | each of those draws the control ring itself now, and the ring is an `outline` drawn inside the element, so a clipping ancestor no longer eats it | nothing |

## 0.12.0 — 2026-09-04

### Added

- **The library no longer forces itself into your initial bundle, and your imports stay as they are.**
  Every component became its own entry point, so a bundler can place each one in the chunk that
  actually uses it. Until now the package was a single flattened module: one eager import of any
  part of it — a service in a composition root is the usual one — made the whole library reachable
  from the initial bundle, and no amount of lazy routing moved it out. Measured on a documentation app
  of 90 sections that changed not one import line: its initial bundle fell from **240 kB to 138 kB
  gzip**, with the total across initial and lazy chunks moving under a percent. Nothing was
  duplicated; 102 kB simply moved to the routes that use it.

- **Keep importing from the package root — that is the supported spelling and it costs nothing
  extra.** The same app measured the same 138 kB either way. The root is a re-export and nothing
  else, so a bundler sees straight through it. There is no migration here and no reason to rewrite
  an import.

- **Per-component specifiers do resolve** (`@ids-group-ltd/ids-design-system/components/button`),
  for a codebase that prefers a file's dependencies spelled out. They buy no bytes, except inside a
  `@defer` block: a component imported from the package root there stays in the initial bundle, so
  import it from its own specifier. If you want them shorter, one line in your own `tsconfig.json` does it, with no change on
  our side:

  ```json
  "paths": { "ds/*": ["node_modules/@ids-group-ltd/ids-design-system/*"] }
  ```

  `ds/button` then resolves to the same file as the full specifier, so a component imported one way
  and the same component imported the other are one class and `instanceof` holds across them.

### Changed

- **The package root exports exactly what it exported before, name by name.** An entry point has to
  export whatever another entry point imports, so 37 helpers, base classes and shared types are
  reachable inside the package that were not reachable before — every one of them internal, each
  carrying `@internal`, and none in the component reference. **None of them reaches the root:** it
  re-exports the documented surface by name rather than re-exporting whole entry points, so
  `import * as ds` and a barrel of your own see the same names as before and nothing new can collide.
  Two subpaths, `…/components` and `…/core`, hold what the other entry points share; they exist so
  those can resolve, they are internal, and nothing in them is covered by the versioning promise.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround this release made unnecessary. Generated from the `deleteList` in the release manifest
this package ships under `migrations/`.

| If you have | Delete it, because |
| --- | --- |
| `await import('@ids-group-ltd/ids-design-system')` | A dynamic import of the whole package was the only way to keep it out of the initial bundle, and it bought that at the cost of an async boundary in your own code. An ordinary static import from the package root now lands in the chunk that uses it. Replace with: a plain static import from the package root. Still legitimate where the lazy boundary is there for its own sake — a feature area you genuinely want off the critical path. |

## 0.11.4 — 2026-09-03

### Breaking

- **`ds-banner` and `ds-alert` no longer announce themselves unless asked.** Both applied `role` and
  `aria-live` unconditionally, and an `alert` region fires on INSERTION — so a static "maintenance on
  Sunday" strip interrupted a screen reader on every client-side route into the page. MDN says it
  outright: do not use `alert` on content the user has not interacted with. Measured on this site's own
  pages: 12 assertive regions before, 0 now. Pass `[announce]="true"` for a banner the app raises in
  response to an event; for anything transient use `ToastService`, which owns a region built for it.

- **`<ds-toast>`'s `message` input is now `body`**, matching `ToastOptions.body` and `ToastEntry.body`.
  One concept had two spellings across the family; `body` wins because it is the one every consumer
  already passes to the service.

- **Five toast border tokens gain the `-color` the rest of the library uses**:
  `--ds-toast-border` → `--ds-toast-border-color`, and the four variant suffixes with it. They are
  colours, and they were the last holdouts of the old naming.

- **`maxVisible` defaults to 5 instead of unlimited.** An uncapped stack was more permissive than any
  system this component is measured against — Material shows one snackbar and dismisses the previous,
  Carbon and Halstack stack but expect a ceiling. `provideDsConfig({ toast: { maxVisible: n } })` still sets it, and `0` still means
  no cap; a configured `0` is now forwarded rather than skipped, since it is the only way left to ask
  for one.

- **A screen reader was told nothing about a toast, for three of the five variants.** `aria-live` sat
  on each toast, and a live region has to exist in the DOM *before* its text arrives — a node created
  with its message already inside it is the one case NVDA and JAWS reliably do not announce. The
  region host was `role="region"`, a landmark, not a live region. Announcements now go through the CDK
  `LiveAnnouncer`, whose region is built once at service construction and only has its text replaced.
  `error` and `warning` announce assertively, the rest politely. WCAG 2.2 SC 4.1.3.

  A burst is coalesced into one announcement rather than queued, and that is forced rather than
  chosen: `announce()` clears its region synchronously and writes on a 120ms timeout, resolving its
  promise inside that callback — so even a strictly serialised chain loses all but the last message.
  Measured: five announcements each landed and were cleared again in the same millisecond.

  A `<ds-toast>` you place yourself is now silent to a reader. It is a specimen, not an event; use
  `ToastService` for anything that should be announced.

- **Toast defaults move into `provideDsConfig`, and the two toast tokens are gone.**
  `DS_TOAST_CONFIG` and `DS_TOAST_POSITION` were the only configuration in the library that did not
  go through `DsConfig` — thirteen other areas already did — so an app set everything in one call and
  then remembered two bare `InjectionToken` providers for toasts. They are now
  `provideDsConfig({ toast: { maxVisible, position } })`, and the `DsToastConfig` interface is
  removed with its token.
  `position` is PARTIAL and merged field by field over `right` / `top` / `var(--space-6)`: the old
  token's type required all three fields, so moving the stack to the bottom meant restating the other
  two. `DS_TOAST_POSITION_DEFAULT` is unchanged and still exported. One caveat, and it is not new:
  `ToastService` is `providedIn: 'root'`, so the `toast` section resolves only at the root injector —
  a route-level `provideDsConfig` cannot narrow it, unlike every other section.

### Changed

- **Toast and table class internals moved again — only matters if you SUBCLASS one of them.**
  Every name here is a `private` or `protected` internal, not public API and not a signal, but
  `private` collides with TS2415 exactly as a public name does, so a member of yours sharing one
  still stops the build. `ToastComponent` **lost `role`** — the component no longer sets one, so
  an `override role` overrides nothing. `ToastRegionComponent` gained `leaveTimers`,
  `slideNeighbours`, `toastNodes`, `measureTops` and `leaveDuration`, and **renamed
  `promoteFromQueue` to `drainQueue`**; an override of the old name now runs never, so move it.
  `ToastService` gained `announcer`, `pendingAnnouncements`, `pendingAssertive`, `announceTimer`,
  `scrimWatcher`, `announce` and `keepAboveScrims`, and **lost `position`** with the token it
  read. `TableComponent` gained `eventsAtExport`,
  `eventMessages`, `tableHead`, `hostElement` and `announceExport`; its inputs, outputs, models
  and exported types are unchanged. `BannerComponent` and `AlertComponent` each gained
  `announce`, and their `ariaRole` and `ariaLive` now return `null` as well — code that assumed
  the getter is never null stops compiling, while a subclass that narrowed either type back still
  compiles.
  The compiler enumerates every collision, so building after the upgrade is the whole check.

- **The stack no longer jumps when a toast is added.** Its neighbours are put back where they were
  with a `transform` and released, so the re-stack runs on the compositor instead of the browser
  moving them all in one frame. Two new tokens tune it: `--ds-toast-shift-duration` (default
  `--duration-fast`) and `--ds-toast-shift-easing`. A dismissal keeps its own, longer timing — a
  re-stack and a leave are different motions.

### Fixed

- **A click between a boolean control and its label hit nothing.** `ds-radio`, `ds-checkbox` and
  `ds-switch` set the space between control and label with a flex `gap`, which belongs to neither
  box — so the 8px strip between them swallowed the click instead of toggling. That space is now
  padding on the label, which extends its clickable box across the strip: the target grows from
  18px to 26px tall while the text's start position and the row height stay put. No API or token
  change.

- **`ds-table`'s bulk-actions bar rendered its buttons invisible.** The bar is an inverted
  surface, and its buttons were coloured through a bare `.button` rule that stopped applying once
  the button became `ds-button` — which takes its label from `--ds-button-label-color` and ignores
  inherited `color`, so the label sat on the bar's own colour and disappeared. The bar now sets
  ds-button's public tokens for an inverted surface: label to `--text-inverted`, background to
  `transparent`, and hover and active backgrounds to `--surface-inverted-hover`. No new token —
  these are ds-button's existing hooks.

- **The skeleton shimmer stepped instead of sweeping, on any page but a light one.** The travel was
  `--skeleton-shimmer-x`, one animated, registered, INHERITED custom property on `:root` that
  every skeleton read through `mask-position`. A registered custom property is a computed value, so changing it invalidated
  style for the ENTIRE document on every frame and then repainted — fine on the docs site, visibly
  jerky inside a heavy host application. The animation moved onto each skeleton's own band,
  animating `mask-position` per element; `--skeleton-shimmer-x` and the `:root` animation that drove
  it are gone, so anything that referenced it now resolves to nothing. The trade is that a skeleton mounted mid-cycle starts its own pass instead
  of joining the one in flight; the old lock-step was never viewport-anchored anyway, because
  `mask-position` is measured from the host's own box.
- **A focused row drew TWO rings, and neither was the focus colour.** `ds-list-item`, `ds-tree`,
  `ds-tag`, `ds-description-list` and `ds-color-picker` each drew their own `outline` on
  `:focus-visible` while the blanket `:where(:focus-visible)` shadow kept painting under it — an
  accent halo outside, their own outline inside. Worse, that outline asked for
  `--focus-ring-color`, which **nothing defined**, so all seven call sites fell through to
  `currentColor` and ringed themselves in their own text colour: near-black on a list row, grey on
  a tree node. The token is defined now, from the same hue channels as the ring's outer halo, and
  the seven sites share a `focus.outline-indicator` mixin that silences the shadow. The colour is
  `--accent`, so it is the brand hue by default and the family's hue inside a `ds-color` zone —
  measured: `hsl(229 100% 59%)` outside, `hsl(0 75% 49%)` under `[ds-color="error"]`. Override it
  per brand with `--focus-ring-color`.
- **A selected `ds-list-item` or `ds-tree` node retinted its label and left its icon behind.**
  On the list the icon stayed on its resting colour beside an accent label; on the tree the row
  set `color` correctly but `.node-icon` declared its own and won. Both follow the label now,
  through new
  `--ds-list-item-selected-icon-color` / `--ds-tree-row-selected-icon-color` hooks that default to
  the selected label colour.
- **`ds-avatar-group` and `ds-button-group` styled their children by tag name, so a host that
  renames the tag got neither.** Both pierced encapsulation with `::ng-deep ds-avatar` /
  `::ng-deep ds-button`. Measured through the custom-element build, where a tag nested inside
  another component's template has to be renamed (angular/angular#24536), all three
  avatars came back `margin-left: 0` with no ring, and the joined buttons lost their overlap
  margin and every flattened radius. They match the direct child now, so the grouping holds whatever the child is rendered
  as. Computed output in an ordinary Angular app is unchanged when every child is a `ds-avatar` /
  `ds-button` placed directly in the group - verified identical before and after. Any other direct
  child, such as a wrapper element or a `ds-icon-button`, now takes the group styling itself.

- **Six connected-panel tokens did nothing when scoped to one picker.** `--ds-option-padding`,
  `-gap`, `-radius`, `-row-gap`, `--ds-option-bg-color-active` and `--ds-dropdown-panel-maxh` are read
  on the panel, which the CDK portals outside the component, so they only ever resolved from a global
  declaration: `ds-select { --ds-option-padding: … }` was silently ignored while
  `ds-select { --ds-dropdown-panel-radius: … }` beside it worked, because that one was on the
  forwarded list and these were not. They join the shared list every connected picker forwards, so the
  family behaves one way. `--ds-dropdown-panel-maxh` was also the one token `ds-autocomplete` forwarded
  and its two siblings did not. Nothing moves unless you had written one of these on an element, where
  it now takes effect — if you reached for a global declaration because the scoped one did nothing, the
  scoped one is the narrower fix.

- **`ds-split-button`'s hover left its label unreadable inside a status zone.** The hover background defaulted to the family's readable ON-TINT colour — the one meant for text on light surfaces — and this was the only place in the library using it as a background, so the label landed at 1.87:1 on `success` in dark and 2.46:1 on `error`. It now defaults to `--accent-hover`, the family base mixed toward black in light and white in dark, so the hover follows the rest state instead of jumping to another hue: error 5.94 light / 4.22 dark, success 4.17 / 2.85, warning 9.11 / 12.31. `--ds-split-button-bg-hover-color` still overrides it.

  This does not close the whole problem. The label colour on a family's solid background already falls below 4.5:1 at REST for `success` (3.30) and `secondary` (3.31), in both themes and on every solid button — a palette question, not this component's.

- **A chip row could drop a chip, or fail to, when the field sat in a box that sizes itself to its content.** The budget for how many chips fit comes off the trigger's parent, which is only a fixed quantity while that parent takes its width from somewhere else. A parent at `fit-content`, an `inline-block` one, or a flex item that cannot grow all take their width from the chips instead, so the cut was reading back its own result. The parent is now asked whether its width depends on the trigger, and the trigger's own width is used only when it cannot answer. Affects `ds-multi-select` and `ds-autocomplete`.

- **Eight defects the two-wave review confirmed and nobody had acted on.** The toast region and its
  service never tore anything down, so every pending timer fired into a destroyed component — harmless
  in a long-lived app, a stream of "N timers still in the queue" in a consumer's `fakeAsync` tests. The
  180 ms leave timer was untracked and survived `dismissAll()`. `remove()` had no existence guard, so a
  stale `ToastRef.dismiss()` ran the whole leave path on an id nothing held. `LEAVE_DURATION_MS` was
  hardcoded against `--ds-toast-leave-duration`, a public token: the leave length is now READ off the
  node, measured at 964 ms with the token set to 900, where it used to be 180 whatever the consumer
  asked for. Raising `maxVisible` at runtime promoted nothing until the next dismissal; promotion is a
  drain loop now. A negative `maxVisible` said the opposite of what it did and warns in dev. The
  spinner inside a `loading` toast carried its own `role="status"`, which — now that announcements have
  moved to the announcer — was the only live node left in there, so it is `aria-hidden`. And
  `ToastPromiseMessages` is generic, so `promise<T>` stops discarding `T` and a `success` callback
  receives the resolved value instead of `unknown`.

- **A modal, drawer, confirm or bottom sheet opened after a toast covered it and swallowed its action
  button.** `--layer-toast: 1500` could not prevent it and never could: CDK 21 gives every overlay host
  `popover="manual"` and calls `showPopover()`, so hosts live in the browser's top layer, which paints
  strictly in the order things were shown and ignores z-index and stacking contexts. The toast host is
  now re-shown when a scrimmed overlay appears, which is the only thing that moves it back to the
  front. Measured before and after on the same probe: the scrim was the topmost element at the toast's
  centre, and is not any more.

  Only *scrimmed* overlays trigger it. A tooltip or dropdown neither covers the toast meaningfully nor
  eats a click, and the documented scale deliberately puts `--layer-tooltip` above the toast.

- **Typing on a CLOSED `ds-select` did nothing.** Type-ahead landed with the jump wired only for
  an open panel: the closed branch of the key handler returned before reaching it, so a letter
  pressed on a collapsed trigger neither jumped nor committed. It now commits the first
  matching option without opening the panel — `value` is a `model`, so `valueChange` fires —
  the way a native `<select>` does; a key that matches nothing is ignored.
- **A `ds-table` loading scrim covered the top of the first row, or overlapped the header.**
  Its top edge assumed a 40px header. The header is 42.89px at the default density and
  26.89px under `[data-density="ultra-compact"]`, so it cut 2.89px into the header normally
  and started 13.11px too low under that density, where the first row showed through it. The
  header is measured now, so the edge lands on it at every density and at any header font size
  you set. `--ds-table-head-h` still overrides it if you set that, which you should no longer
  need to.
- **One export left `ds-table`'s live region stuck for the rest of the page's life.** The export
  status outranked the sort, row-range and row-expansion lines and was never cleared, so from the
  first export onwards a screen reader heard "Export ready" and nothing else: every later sort,
  page change and bulk expansion was swallowed. The export line now holds the region only until
  one of those lines has something new to say, so "Export failed" still stands until the reader
  moves on, and everything after it is announced again.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround this release made unnecessary. Generated from the `deleteList` in the release manifest
this package ships under `migrations/`.

| If you have | Delete it, because |
| --- | --- |
| a raised `--layer-toast` or `--layer-tooltip` | It never fixed toast-under-modal: overlay hosts live in the browser's top layer, which paints in the order hosts were shown and ignores z-index entirely. The library re-shows the toast host itself now. A layer-scale retune for your own stacking (or for browsers without popover support) is still load-bearing and stays. |
| a `--ds-table-head-h` override added so the loading scrim stops cutting into the header | The scrim measures the real header height now. Sizing the header itself with this token is its normal use and stays. |

## 0.11.3 — 2026-09-02

### Breaking

- **`ds.color()` now refuses a family it does not know, and that stops your Sass build.**
  `@include ds.color(brand)` used to compile and emit eleven `--accent-*` pointers at values that
  could never resolve, so a zone painted itself with `unset` and the mistake looked like a theming
  problem. It `@error`s now, naming the five families it takes: `secondary`, `tertiary`, `error`,
  `success`, `warning`. Anything else fails the build at the `@include`. The `ds-color="…"`
  attribute is untouched — no Sass runs for it.

### Changed

- **The banner and toast icon now centres on the message block**, where most shapes aligned it to
  the first line of text. The two rules agree on a one-line message — which is most toasts — and
  diverge as the text grows: the icon sat some 12px above the block centre at two lines and 21px at
  three. A `compact` banner was already centred and does not move. A `layout="row"` banner with
  actions beside the text moves even at one line: its icon was pinned to the top of the row and now
  centres with the text.

  It is `align-self` on the icon rather than `align-items` on the row, so the close button and the
  action buttons keep the positions they had. `--banner-ic-mt` is **removed**; it existed only to
  nudge the icon down by one border-width under the old rule.

  `ds-alert` follows, for the same reason: it carried the same nudge inlined as
  `var(--border-width-default)` rather than through the token.

  **Known limit.** The icon centres on the flex LINE, which equals the message block only while the
  message is the tallest thing in the row. A one-line toast with a close button is 0.53px off, and with
  a projected `[actions]` button 6–14px off depending on its size. `align-items: center` would be
  unconditional but moves the close button, which is the trade above.

- **`ToastRegionComponent`'s member surface moved again — only matters if you SUBCLASS it.** The
  timer and pause work gained `arm`, `focusWithin`, `host`, `hovered`, `onFocusWithin`, `onHover`,
  `paused`, `pauseAll`, `remaining`, `resumeAll`, `startedAt` and `syncPause`, and **lost
  `startCountdown`**: a countdown is armed when a toast becomes visible and re-armed from what is
  left when a pause ends, where before the region started one timer per toast. Every one is a
  `private` or `protected` internal — none is public API, none is a signal, and there is no
  replacement to call for `startCountdown`, so an override of it should simply go. A member of
  yours sharing one of those names still stops the build, because `private` collides with TS2415
  exactly as a public name does. `host` is the one most likely to clash.
  Rename yours — `override` is not a way out for ten of the twelve, because a member whose base
  declaration is `private` rejects it with the same TS2415 as a plain redeclaration, and that
  includes `host`. Only the two `protected` ones, `onHover` and `onFocusWithin`, accept it. The
  compiler enumerates every
  collision, so building after the upgrade is the whole check.

  Worth flagging for anyone who followed 0.11.2's note: `startCountdown` was announced there as a
  member the region had just gained, so a `startCountdown` of yours added one release ago now
  overrides nothing: marked `override` it fails with TS4113, unmarked it compiles and never runs.
  There is no public replacement to call — the countdown
  is the region's own business now. Delete the override.

- **Four event bindings are silently dead, and there is no `<ds-dropdown>`.** `ds-banner` and
  `ds-toast` emit `(closed)`, not `(dismissed)`; `ds-pagination` emits `(currentPageChange)`, not
  `(pageChange)`; `ds-table` emits `(rowClicked)`, not `(rowClick)`. An unknown event binding
  registers a DOM listener and never fires, so a handler on one of those four runs never, with
  nothing in the console — check your templates for them. `<ds-dropdown>` is not a component of
  this library; its work is `<ds-select>`, and an import naming the other one does not compile.
  `components.md` names the shipped identifiers throughout, and carries `<ds-alert>` with its
  `'neutral'` variant.

### Fixed

- **`ds-color="error"`, `="success"` and `="warning"` lost their accent colour.** Those zones map
  `--accent-strong` onto `--<family>-strong`, and the three status families never defined it — only
  the brand families did. The declaration was invalid at computed-value time, so inside a status
  zone every place that reads `--accent-strong` reset to `unset`: selected list and tree rows,
  the active sidenav item and its rail, the active tab pill, avatar and avatar-group initials, the
  active tag, dropzone text, the date-picker range label, the toast's action label, the selected
  toggle button, the split-button hover fill, the `tonal`, `ghost`, `outline` and `text` variants
  of `ds-button`, and the `tonal` variant of `ds-icon-button`. Text there fell through to the
  inherited body colour; the fill
  and the rail, which inherit nothing, disappeared.

  No new token was needed: a status family already carries its readable on-tint colour as `-text`,
  so `--accent-strong` now asks for `-strong` first and `-text` second, and the brand families keep
  answering it as `-strong` because they have no `-text`. Each pointer also ends in a fallback — to
  the family's base for `-hover`, `-pressed` and `-strong`, to its `-muted` for the tint pointers,
  and to the theme-wide role for `-on` and the two focus pointers — so a role that goes missing in
  future degrades instead of disappearing.

- **`ToastService.promise()` could destroy its own result.** It ran the settled toast's
  auto-dismiss on a wall-clock timer started when the promise resolved, not when the toast became
  visible — the one thing the rest of the timer work had already moved into the region. With a
  `maxVisible` cap set, a promise that settled while its toast was still queued had the result spliced
  out of the queue before anyone saw it: the user saved, it succeeded, and no toast appeared at all.
  The settled duration is now handed to the region with the content, so it starts on promotion.

- **A toast carrying an `action` no longer auto-dismisses.** The overlay is the last child of `body`,
  so the region is dead last in tab order; a keyboard user cannot cross a real page in the five
  seconds the button was alive. An `action` toast now waits, and is always dismissible. Note that
  a `durationMs` you pass alongside an `action` is discarded — the toast waits regardless — and
  `dismissible: false` is discarded on any toast that cannot expire, not only on a `loading` one.

- **Hovering or focusing the region pauses every countdown**, resuming when the pointer or focus
  leaves. A toast being read is not a toast that has been read. The pause is derived from both
  sources rather than latched, so tabbing out of a region the pointer is still over does not
  resume, moving focus between the action and the close button is not a leave, and a toast that
  becomes visible under a stationary pointer — a burst past the cap, or a promise settling — is
  banked rather than counted. A toast paused with almost nothing left resumes with at least 600ms, so
  one hovered with
  almost nothing left does not vanish as the pointer leaves.

- **A disabled accordion item's chevron did not look disabled.** It asked for a colour token this
  library does not define, so the declaration was invalid at computed-value time and the chevron
  inherited whatever colour surrounded it — while the label beside it greyed correctly. It reads the
  disabled text colour now, like the label.

- **The `ds-banner` close button had no accessible name.** It announced as a bare "button", where
  the same control on `ds-toast` and `ds-alert` already said "Dismiss". It says it now.

- **A long unbroken word in a toast overflowed the pill.** A URL or an id with no break
  opportunity ran past the rounded edge instead of wrapping inside it.

- **Nothing that cannot expire can also be unclosable.** The rule is now that any toast with no
  duration is dismissible, whatever you asked for — a `loading` variant, one carrying an `action`,
  or an explicit `durationMs: 0`. A `loading` toast was created with `dismissible: false` and no
  duration, so a promise that never settled held its slot for the life of the page — with a cap of 3, three hung requests blocked the whole channel, including the error
  toasts that would have explained the hang.

## 0.11.2 — 2026-09-01

### Added

- **`PageUp` and `PageDown`.** Ten rows a press, which is the native `<select>` step and the APG
  listbox example’s — a fixed number rather than a measured screenful, so the jump is the same
  wherever the panel happens to be clipped. No picker had these.

- **`clear()` on `ds-select` and `ds-multi-select`.** `ds-autocomplete` has had it; the other two
  offered only the in-trigger button, so an app with its own “reset filters” had to write the empty
  value by hand and guess what empty means for that control. It does NOT move focus, deliberately:
  the caller may be navigating away.

- **Panel header and footer slots.** The panel was a closed box between the filter row and the
  options: "3 of 40 selected", a "clear all" button, a hint or a link under the list had nowhere to
  go. `dsPanelHeaderTemplate` and `dsPanelFooterTemplate` fill a strip above and below, with
  `count`, `total` and `query` in context. Both sit OUTSIDE the `listbox`, so nothing you put there
  is counted as an option or breaks a reader's "N of M" position, and neither scrolls with the list —
  the panel clips and the list is the scroller.

- **`dsGroupLabelTemplate`.** A group heading rendered its text and nothing else, so a count, a team
  glyph or a second line was impossible. The heading ELEMENT stays the library's — it keeps the id the
  group's `aria-labelledby` points at — and only its contents are yours.

- **The option row's geometry is tokens.** `--ds-option-gap`, `--ds-option-padding`,
  `--ds-option-radius` and `--ds-option-row-gap`, plus `--ds-option-bg-color-active` for the
  hover/keyboard fill. A denser panel meant re-declaring the row before, which is exactly how a second
  copy of the panel ended up inside a component.

- **`searchPlaceholder` on `ds-autocomplete`.** Its `placeholder` was doing two jobs — the
  empty-field caption and the hint for typing over a settled value. `ds-multi-select` already
  separated them; now the name means one thing on both. Empty by default, so nothing moves.

- **The result count is announced.** A reader typed into the filter and heard nothing: no live region
  existed in any picker. One is created per picker now, outside the listbox and empty at first — a
  region created together with its text is the case screen readers reliably do not announce.

- **Type-ahead on `ds-select` and `ds-multi-select`.** Typing "ba" jumps to the first option starting
  with "ba", the way a native `<select>` does, and repeating one letter cycles through the options
  beginning with it. On a closed `ds-select` the jump commits, matching the native control.
  `ds-autocomplete` is deliberately excluded: its trigger IS a text field, so typing there is the
  filter and a jump would fight it.

- **`disabledReason` on an option, rendered by `ds-select`.** A disabled row said it could not be
  picked and never why. On `ds-select` the reason reaches the row through `aria-describedby` and is
  visually hidden — the row already looks disabled; the text is for whoever cannot see that. The
  field is on the shared `DsOption`, so `SelectOption`, `MultiSelectOption` and `AutocompleteOption`
  all accept it and it type-checks on all three pickers; `ds-multi-select` and `ds-autocomplete` do
  not yet render it, so a reason set there is carried and not shown.

- **The keyboard cursor keeps its row in view.** On a list longer than the panel the arrows walked the
  cursor out of sight — the reader pressed down and could not see where they were. All three pickers
  scroll the active row into view now, on by default; `scrollActiveIntoView="false"` gives the scroll
  position back to you. It uses `block: 'nearest'`, so a row that is already visible does not move and
  the mouse is never fought.

- **`Home` and `End` on every picker.** They existed on `ds-select` alone, while seven other components
  in the library already had them. The index arithmetic for Home, End, PageUp and PageDown is one
  shared helper now, and `ds-select` and `ds-multi-select` step their arrow keys through it too;
  `ds-autocomplete` keeps its own arrow stepping, which also reaches the create row. It is internal: nothing new is exported.

- **`compareWith` on `ds-autocomplete`.** The component is generic over its value type but compared
  with `===`, which is reference identity: a re-fetch that returned equal data as new objects silently
  dropped the selection. Pass a comparator keyed on what identifies the value —
  `[compareWith]="(a, b) => a?.id === b?.id"`. The default is unchanged, so string and number values
  behave exactly as before. `ds-select` and `ds-multi-select` key on `string` and do not need it.

- **`loading`.** While options were being fetched the panel said "No matches", which is a lie the
  consumer had no way to correct. It shows a spinner instead now, and the listbox reports
  `aria-busy`. Spelled `booleanAttribute` to match `ds-button`, `ds-input` and `ds-loading-overlay`.

- **`opened` and `closed`.** There was no way to know a panel had opened, so a picker whose options
  are fetched on demand had nowhere to start the request. `closed` is the name eight other components
  already use; `opened` is its missing pair. They fire on the transition, not on every write, so
  closing by Escape emits once rather than twice.

- **`filterWith` and `filterChange` — one input for both server-side search and a custom match.**
  The query matcher was hardcoded to a case-insensitive substring of `label`: matching a second field,
  ignoring diacritics or scoring fuzzily was impossible, and so was letting a server do the filtering.
  `filterWith` takes a predicate for the first and the literal `'none'` for the second, where every
  option handed in is rendered and `filterChange` reports what was typed. One input rather than two,
  because they are one decision: who decides what the query matches.

- **`name`, `readOnly` and `clearable` on `ds-multi-select` and `ds-autocomplete`.** The last three
  form-contract members that were `ds-select`'s alone. `name` reaches seven other controls in the
  library, so the two pickers were the outliers; `readOnly` takes focus without opening, and carries
  the same `readonly` binding alias `ds-select` has for signal forms; `clearable` uses the same button
  and the same accessible name as `ds-select`'s.

- **`ds-table` row expansion: one-at-a-time, expand-all, and events.** The base feature shipped
  already; these are the three edges it was missing. `expandMode="single"` collapses the open row
  when another expander is clicked, so a detail panel cannot stack up down the page — enforced when
  the user clicks, not on the binding, because `expandedIds` is the host's model to write and
  rewriting it underneath would be the table arguing with its own consumer. `expandAllToggle` puts
  a chevron in the expander column header, page-scoped when paginating exactly as select-all is.
  `(rowExpanded)` and `(rowCollapsed)` name the row as it opens and closes, expand-all included,
  which is where panel content gets lazy-loaded; a collapse the host writes into `expandedIds`
  itself stays silent, and so does an id whose row is no longer in `data()` — an event carries a
  row, and there is none to carry. Opening two rows or more now also reaches the table's live
  region, which a full page of panels appearing from one keypress previously did not.

- **Column resizing works on a touch device, where the drag handle never could.** The handle
  paints its line on `:hover` and `:focus-visible`; a coarse pointer produces neither, so it was
  invisible — while `touch-action: none` still took the horizontal swipe that scrolls the table,
  leaving a dead 8px strip at the right edge of every header. Under
  `(hover: none) and (pointer: coarse)` the handle now stands down and width moves into the column
  panel: each row carries −, + and Fit next to its visibility and order controls, and the panel
  opens as a `ds-bottom-sheet` rather than a popover. The buttons render on desktop as well, where
  the handle remains the primary route. All three routes share one step, so drag, arrow keys and
  buttons move a column by the same amount, and all three clamp at the scroll viewport.

### Changed

- **Exported class member surface grew — only matters if you SUBCLASS a DS component.**
  `SelectComponent`, `MultiSelectComponent`, `AutocompleteComponent`, `TableComponent`,
  `LoadingOverlayComponent` and `ToastRegionComponent` all gained members for the inputs and outputs
  above, and `DsPanelHeaderTemplateDirective`,
  `DsPanelFooterTemplateDirective` and `DsGroupLabelTemplateDirective` are new classes.
  Subclassing a DS component is unsupported but consumers do it, and a
  member of yours that shares a name with one of ours stops the build. Rename yours, or add `override`
  if you meant to replace ours — the compiler enumerates every collision, so building after the
  upgrade is the whole check.

- **BREAKING for code that CONSTRUCTS a `ToastEntry`: `durationMs` is now a required
  `readonly number`.** The field did not exist on the type before, so it arrives required rather
  than widened: an object literal typed as `ToastEntry` — a test double, a hand-rolled region, a
  store that holds toasts — stops compiling until it carries one. The entry has to know its own
  duration now that the countdown belongs to the region rather than the service.
  `ToastOptions.durationMs` is untouched — still optional, still `5000` by default, still `0` for a
  loading toast — so a caller of `ToastService` writes nothing new.

- **BREAKING visually where a stack of toasts is part of the page: the newest toast enters at the
  top of a top-anchored region.** Every toast was appended, so in a region resolving to a top
  position — the default — the newest one landed at the BOTTOM of the stack, furthest from the
  corner the stack grows out of, and the thing that had just happened was the last one you read. A
  top position prepends now; a bottom position still appends. Either way the newest toast is the one
  nearest the screen edge the region is anchored to.

- **`ds-select`'s option list caps 40px shorter.** The list's `max-height` was declared in
  `ds-multi-select`'s own stylesheet; it sits in the shared panel partial now, so it reaches
  `ds-select` and `ds-autocomplete` too. `ds-select`'s list was previously bounded only by the panel
  cap `--ds-dropdown-panel-maxh` (320px) and now stops at `--picker-maxh` (280px) — roughly one
  option row — which is the height the other two panels already used. `ds-autocomplete` had pinned
  its panel to that value itself and does not move. Set `--picker-maxh` to take the height back, on
  the panel where only that select should change or globally where all three should follow; the
  panel cap is unchanged and is simply no longer what decides where a `ds-select` list stops.

- **`skeleton-mode` is gone from the inner `<table>` element of `ds-table` — only matters if you
  reach in with `::ng-deep`.** The class was bound on that element, not the host, and nothing in the
  library ever painted it, so a rule keyed on it was the only thing giving it meaning. If you have
  one, key it off a class of your own on the host instead; if you do not, nothing about the rendered
  table changes.

### Fixed
- **Dev-mode warnings no longer ship to production bundles.** They were guarded by
  `isDevMode()`, which is a function CALL — a bundler cannot prove the branch dead, so all thirteen
  warning sites and their message closures reached production builds. Each site is now guarded inline
  with `typeof ngDevMode === 'undefined' || ngDevMode`, which `@angular/build` folds away whenever
  script optimization is on, closures included. **Measured: 1 590 B gzip off an app using most of the
  library, 827 B of it off a single `<ds-button>`.** Nothing changes for you — no API, no behaviour,
  and the warnings still fire in development builds exactly as before.

- **A loading scrim stopped the pointer and let the keyboard walk straight under it.**
  `ds-loading-overlay` paints an absolutely positioned scrim over its content, which intercepts
  every pointer event — so a control behind it could not be clicked, and looked unavailable. Nothing
  stopped focus: Tab reached the same control, Enter activated it, and `ds-table` with
  `rowInteractive` would emit `(rowClicked)` for a row whose data the host was in the middle of
  replacing. Neither `onRowClick` nor `onRowKey` consulted the loading state, and a row's
  `tabindex` never did either. The overlay now marks the content it covers `inert` while loading,
  which is the one mechanism that stops pointer and keyboard together and takes the covered controls
  out of the accessibility tree; `aria-busy` stays on the host, so a reader is still told why.
  `inertContent="false"` turns it off for a scrim that covers only PART of its content, and the
  consumer then marks the covered subtree itself — `ds-table` does this, because its scrim starts
  below the header and re-sorting during a refresh is exactly what puts the scrim up.

- **A toast queued behind `maxVisible` expired while it was still waiting.** The auto-dismiss
  countdown started when `ToastService` was called, not when the toast reached the screen, so a
  burst past the cap retired toasts that had never been visible — the more you fired at once, the
  fewer were read, and the ones lost were the ones at the back. The countdown starts when the region
  shows the toast now, promotion out of the queue included, so a queued toast gets its full duration
  on screen. One gap remains: `ToastService.promise()` runs its own timers, so a promise toast held
  behind the cap can still be removed before it is shown.

- **Dismissing a toast that was still queued promoted a different one instead of removing it.** The
  id belonged to an entry that had not become visible yet, so the entry stayed in the queue and
  another toast was pulled forward: the one you dismissed still appeared later, and one you had not
  touched was hurried on screen ahead of its turn. A queued id is spliced out of the queue now and
  nothing is promoted in its place.

- **A column resize handle announced no position and no limits.** The handle is a `role="separator"`,
  which a screen reader presents as a slider, but an auto-sized column carried no `aria-valuenow` at
  all — the user was handed a control with no current value and no way to hear how far it could go in
  either direction. While the handle holds focus it now carries a measured `aria-valuenow` in px,
  `aria-valuemin` of `48` and an `aria-valuemax` of the scroll viewport's width, which is the same
  ceiling the drag, the arrow keys and the column-panel buttons clamp at. All three are present only
  while the handle is focused.

- **A table's loading scrim slid off the table as it scrolled sideways.** `ds-loading-overlay` sat
  inside the scroll container, and the scrim is `position: absolute; inset: 0` — so it was sized to a
  single viewport of the table and then travelled with the content: at 400px of horizontal scroll it
  sat 400px to the left of where it was needed, and every column the scroll had revealed was left
  uncovered. The overlay wraps the scroll container now, so the scrim covers what is on screen at any
  scroll offset.

- **A compact trigger showed one chip where several fitted.** `triggerDisplay="count"` and
  `"labels"` make the trigger hug its content, so the width the chip fit measured was decided by the
  chips it was about to cut — each pass shrank its own input and the split settled on one. The fit
  reads the space AVAILABLE now, the trigger's parent, which no cut can move. `ds-autocomplete` gets
  the same correction since both pickers measure through one helper, and a `width="fill"` trigger is
  unaffected because there the two numbers are identical.

## 0.11.1 — 2026-08-31

### Added

- **Group helpers, for building and narrowing an options array.** Alongside `DsOptionGroup<T>` —
  the shared group type behind each picker's own name — the package exports the union
  `DsOptionItem<T> = DsOption<T> | DsOptionGroup<T>`, the type guard `isDsOptionGroup<T>(item)`
  and `flattenDsOptions<T>(items)`, which returns the options in source order and stamps
  `disabled: true` onto every option of a disabled group. `isDsOptionGroup` is the narrowing to
  read an `options` array back through, now that any element may be a group.

- **A written contract for the picker family.**
  Five rules now hold across the three pickers: one meaning per member name, difference only by a
  stated reason, one panel implementation, no library-invented string without a slot, and one way
  to clip a line. A divergence from them is a defect unless the reason is stated.

- **`dsEmptyTemplate` and `dsCreateTemplate`.** "No matches" and "Create «…»" were literals with no
  way to replace them. Both are slots now, on all three pickers and on `ds-autocomplete`
  respectively. `ds-select` also gained an empty state at all — with no options it used to open a
  blank panel.

- **`selectAll` takes `'group'` and `'both'`.** A row per group, or a group row beside the
  panel-wide one. A group's row is disabled when the group is, and shows the mixed state when part
  of it is picked.

- **`triggerDisplay="labels"`.** Same compact footprint as `count`, but it names the selection
  instead of counting it, cut to the trigger's width with the rest behind "+N" — the same
  measurement the chips already use.

- **Parity the family was missing.** `label`, `required` and `optional` on `ds-multi-select` and
  `ds-autocomplete` — those three existed on `ds-select` alone — and `size` on `ds-multi-select`,
  which `ds-select` and `ds-autocomplete` both already had. It
  meant a form built from the other two could not be labelled or marked required at all.

- **`searchable` on `ds-multi-select` — one input, three meanings.** `true` always shows the
  panel's filter row (the default, unchanged), `false` never, and a **number** is the threshold at
  which it appears — stated where it applies rather than hidden in a config. Set
  `DS_CONFIG.picker.searchable` to give a whole app one threshold and override it per panel with a
  number.

  Hiding the row is not just an `@if`: the filter input is what takes focus on open and what carries
  `aria-activedescendant`, the arrows, Enter, Escape and the Backspace that removes the last chip.
  Without it the TRIGGER runs that model instead, and the active-descendant id rides on the trigger.

- **A compact filter trigger, and a slot to write your own.** `ds-multi-select` takes
  `triggerDisplay="count"`: a `label` caption plus a selected-count `ds-badge` at intrinsic
  width, with an accent border once something is picked. The chip field it replaces is as wide as
  the control and its content changes with every pick, which is why a dense toolbar could not budget
  space for it. (The chips do not grow the trigger: `maxVisibleChips` defaults to `"fit"` and clips
  behind "+N more".)

  `dsPickerTrigger` projects your own trigger contents into `ds-select`, `ds-multi-select` and
  `ds-autocomplete`. **A projected template WINS over `triggerDisplay`**, which is then not read at
  all, so there is no "compact plus a template" combination to document. The trigger ELEMENT stays
  library-owned in both cases: `aria-haspopup`, `aria-expanded`, `aria-controls`, the roving
  `aria-activedescendant` and Enter/Space/ArrowDown/Escape are not projected.

  **Neither `count` nor `labels` is offered on `ds-autocomplete`.** Its trigger holds the text
  input the control exists for, and a caption-plus-count summary would remove it. The slot is there instead, where a
  consumer decides what happens to the input.

- **`dsOptionTemplate` and `dsChipTemplate` — the option row and the selected chip take your content.**
  An option was `{ value, label, disabled?, icon? }` and nothing else, so an avatar, a colour dot, a
  priority glyph or a trailing count had no way in. Two directives now fill those two
  places: `dsOptionTemplate` on `ds-select`, `ds-multi-select` and `ds-autocomplete`, and
  `dsChipTemplate` on the two that render chips — so a visual that identifies an option does not
  vanish the moment it is picked.

  Two directives rather than one keyed one: there are exactly two roles and they differ, so a key
  would be an enum of two. The row and the chip stay library-owned — `role="option"`,
  `aria-selected`, the active-row class, the checkbox, the check glyph and the chip close button are
  not projected.

- **`width` on `ds-multi-select` and `ds-select`, the input `ds-autocomplete` already had.**
  `fill` (the default, unchanged) stretches the control to its container and pins the panel to the
  trigger's width. `content` hugs the trigger's own content and takes that width as the panel's
  FLOOR instead, so the panel keeps growing to its options — a short trigger no longer forces a
  panel too narrow to read its own labels. Nothing moves until you ask for `content`.

  The three pickers now share one `DsControlWidth` behind their own exported names
  (`SelectWidth`, `MultiSelectWidth`, `AutocompleteWidth`), the same way 0.10.0 unified
  `DsOption`. Two new panel-level tokens bound the result in `content` mode:
  `--ds-dropdown-panel-minw` (default `0`) and `--ds-dropdown-panel-maxw` (default `none`).

  `ds-select` also gained token forwarding onto its portaled pane, which it did not have: without
  it a `ds-select { --ds-dropdown-panel-*: … }` never reached the panel, because CDK portals it out
  of the component.

### Changed

- **One stylesheet owns the dropdown panel.** `ds-autocomplete` and `ds-multi-select` each styled their own
  panel class (`.autocomplete-list`, `.panel`) in their own stylesheet, with their own `background`,
  `border-radius`, `max-height` and `overflow`, so the shared partial that paints `ds-select` never
  reached them. The
  partial owns that geometry now, behind `--ds-dropdown-panel-bg-color` beside the `-radius`,
  `-maxh`, `-minw` and `-maxw` knobs, and each picker declares its own name as an ALIAS of the
  shared token on its host and forwards it onto the pane. `--ds-multi-select-panel-bg-color`,
  `--ds-autocomplete-panel-bg-color`, `-radius` and `-maxh` all still work. On `ds-autocomplete` the
  host's alias also shadows a `--ds-dropdown-panel-radius` set on `:root`, so set
  `--ds-autocomplete-panel-radius` there instead.

  The panel is also the flex column and the LIST is the scroller, so a filter row or a select-all row
  stays put while the options move under it. `ds-multi-select` did that per-component before and the
  other two did not.

- **BREAKING for code that READS `ds-autocomplete`'s `options`: the element type is now
  `AutocompleteItem<T>`, not `AutocompleteOption<T>`.** The input holds flat options OR groups,
  so a reader — or a subclass overriding a member typed against the element — that assumed
  every element has `.value` must narrow with `isDsOptionGroup` first. Passing plain options in
  is unchanged.

- **BREAKING for code that READS `ds-multi-select`'s `options`: the element type is now
  `MultiSelectItem`, not `MultiSelectOption`.** The same narrowing: read `.value` only after
  `isDsOptionGroup` has ruled out a group. Writers passing options in are unaffected.

- **BREAKING for code that READS `ds-multi-select`'s `selectAll` into a `boolean`: the type is
  now `boolean | 'group' | 'both'`.** The default is still `false`, so setting it is unchanged;
  assigning it back into a `boolean` stops compiling. The two new values are under Added.

- **BREAKING for CSS overrides: `ds-multi-select`'s panel is the shared dropdown panel too.** `ds-autocomplete` rejoined it
  earlier in this release; the multi-select still carried its own `.panel` / `.options` / `.option`
  copy while its pane ALSO carried `ds-dropdown-panel`, so both rule sets applied at once. One
  implementation now: the class names are `.dropdown-panel` and `.dropdown-list`, and the row is the
  partial's. What stayed is what no other picker has — the filter row, the select-all rows and this
  component's own tokens. Its option row carries only `[disabled]` where `ds-select` sets
  `.is-disabled` beside it, which is why it still declares an `.option:disabled` of its own.

- **The `triggerDisplay` union is exported as `DsTriggerDisplay`** — `'full' | 'count' | 'labels'`.
  A variable typed against it fails to compile rather than passing a dead string, and each name says
  what the trigger shows, which is what matters once `labels` sits beside `count`.

- **Every single-line label clips through one mixin now.** Seven rules hand-rolled
  `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` — the `ds-select` trigger text,
  the `ds-tree` label, the `ds-sidenav-item` label, three labels in `ds-sidenav-footer`, and the
  table cell in virtual mode. They all use `single-line-ellipsis` instead, which clips with
  `overflow: clip` and an `overflow-clip-margin` rather than `hidden`: where the line box is tighter
  than the glyph box, `hidden` eats the glyph and shaves every label, not only the ones with
  descenders. Nothing to do on your side — labels stop losing their bottoms at tight line-heights.

- **Exported class member surface grew — only matters if you SUBCLASS a DS component.**
  `SelectComponent`, `MultiSelectComponent` and `AutocompleteComponent` gained members, and
  `DsOptionTemplateDirective`, `DsChipTemplateDirective`, `DsPickerTriggerDirective`,
  `DsEmptyTemplateDirective` and `DsCreateTemplateDirective` are new classes. Subclassing is unsupported but consumers do it, and a member of yours that shares a name
  with one of ours stops the build. Rename yours, or add `override` if you meant to replace ours —
  the compiler enumerates every collision, so building after the upgrade is the whole check.
  `AutocompleteComponent` also LOST a member — the protected computed `filteredGroups`: a subclass
  that overrode it with `override` now fails with TS4113, and one declared without the modifier
  compiles and never runs, so delete yours.

- **BREAKING for `ds-autocomplete`: one `options` input takes groups on all three pickers.**
  `ds-multi-select` had no groups at
  all; `ds-select` took them mixed into `options`; `ds-autocomplete` took them in a second
  `optionGroups` input whose own documentation said `options` was **ignored** when it was set —
  two inputs where one silently won. There is one shape now: `options` accepts flat options,
  groups, or both mixed, and renders them in the order given.

  The group type is shared as `DsOptionGroup` behind each picker's own name
  (`SelectOptionGroup`, `MultiSelectOptionGroup`, `AutocompleteOptionGroup`), the way
  `DsOption` already was. It carries `disabled`, which `ds-select` had and the other two did
  not; disabling a group disables every option in it.

- **BREAKING for CSS overrides and one token: `ds-autocomplete`'s panel is the shared dropdown
  panel again.** It was passing
  `'ds-overlay-pane'` as its overlay's panel class, and that argument REPLACES the default
  `['ds-dropdown-panel', 'ds-overlay-pane']` rather than adding to it — so nothing from the shared
  partial reached it. The panel had `padding: 0` against the other two pickers' `--space-1`, square
  rows against their `--ds-radius-inner`, and none of `--ds-option-selected-bg-color`,
  `-label-color`, `-bg-color-hover` or `--ds-option-check-color` reached it — set on an
  autocomplete they did nothing at all. One partial paints all three pickers now.

  The panel's classes moved to the shared vocabulary: `.autocomplete-list` → `.dropdown-list`
  inside a new `.dropdown-panel` wrapper, `.autocomplete-optgroup` → `.optgroup`,
  `.autocomplete-optgroup-label` → `.optgroup-label`, and an option's check icon →
  `.option-check`. `--ds-autocomplete-option-bg-color-hover` is gone; the panel-level
  `--ds-option-*` hooks replace it. They paint `.option.is-selected` and the check glyph, so they
  reach `ds-select` and `ds-autocomplete`; `ds-multi-select` marks its selection with a checkbox and
  keeps its own `--ds-multi-select-check-*`. All three forward the four hooks onto the portaled pane,
  so a per-instance `ds-autocomplete { --ds-option-selected-bg-color: … }` reaches the panel.
  `--ds-autocomplete-panel-bg-color`, `-radius` and `-maxh` still work.

- **A settled single value in `ds-autocomplete` ellipsizes instead of wrapping.** A value 134px wide in a
  144px trigger took the trigger from **40px to 63px** — the text
  broke onto a second line and the chevron onto a third. Single mode has no chip row to wrap for, so
  the wrapping had nothing to protect. The ellipsized value carries a `title`, so the full text is
  still there on hover. `valueOverflow="wrap"` restores wrapping. Multi mode with the default chip
  fit is untouched, its chips already had a measured cap; with `maxVisibleChips="all"` the trigger no
  longer wraps either, until `valueOverflow="wrap"` is set.

### Fixed

- **With the filter row hidden, there was no keyboard way to pick an option.** `Enter` and `Space`
  were consumed by the trigger before the panel's own handler saw them, so the panel toggled shut
  instead of selecting the active row: open, arrow down, Enter, nothing chosen. The trigger delegates
  first now. `searchable` shipped in this same release, so only work in flight is affected.

- **An option inside a `disabled` group could not be addressed.** The pickers marked such options
  disabled for rendering, and the flattening helper marked them again — a second copy, so the object
  the template rendered and the object in the flat list were no longer the same one. Every row in the
  group then rendered `id="…-opt--1"`, duplicated across the group, and `aria-activedescendant`
  pointed at an element that did not exist. In `ds-autocomplete`, where a fully disabled group also
  leaves the cursor at `-1`, every row in it painted as the active row at once.

- **`selectAll="group"` also rendered the panel-wide row**, making it indistinguishable from
  `"both"`, and rendered that row even on a flat list with no groups at all.

- **`dsChipTemplate` did nothing on `ds-autocomplete`.** The slot was declared, exported and
  documented; the template never read it, so a projected chip was discarded without a word.

- **`ds-autocomplete`'s `label` was not the accessible name and `required` was not announced.**
  The label rendered an `id` nothing referenced while `aria-label` was set unconditionally from the
  placeholder, and `aria-required` was never emitted despite the input's own documentation. Both
  now match `ds-select` and `ds-multi-select`.

- **`ds-multi-select` keyboard and focus behaviour joined the other two.** Its option rows were tab
  stops (a fifty-option panel was fifty of them), `Tab` did not close the panel, the initial active
  row did not skip a disabled first option, and removing a chip dropped focus to `<body>`.

- **A bare `searchable` attribute meant "unset" instead of "true"**, so it could not override an
  app-level `DS_CONFIG.picker.searchable` of `false` — the one case that key exists for.

- **A compact trigger no longer pins the panel to its own caption width**, which produced a panel too
  narrow to read its options unless `width="content"` was also passed.

- **Re-opening a picker inside its close animation left the panel visible while the component
  believed it was closed**, and leaked that panel's listeners. The detach handler now ignores an
  overlay that is no longer the current one.

- **`ds-select` accepts a `readonly` options array**, which the other two already did, and tracks
  its top-level items by index rather than by label, which is not unique.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround this release made unnecessary. Generated from the `deleteList` in the release manifest
this package ships under `migrations/`.

| If you have                                                       | Delete it, because                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.ds-overlay-pane .autocomplete-list`                             | The autocomplete panel shipped with `padding: 0` and square rows while ds-select's dropdown had `--space-1` padding and rounded rows, so consumers patched the difference globally. The panel now uses the same shared partial as the other two pickers and matches without help. Replace with: nothing — the padding is `--space-1` and the row radius is `--ds-radius-inner` out of the box. |
## 0.11.0 — 2026-08-26

### Added

- **`ds-checkbox` and `ds-radio-group` now show a validation state on the CONTROL, not only in the
  message under it.** Both already rendered `ds-field-message` and already took `hint`/`error`/`warning`;
  what was missing was the paint, so on a checkbox the only sign of an invalid state was the red line
  underneath — which WCAG 1.4.1 says is not enough on its own.
  **Two treatments, because the shapes differ.** The checkbox moves its **border** and nothing else: at
  16px a tinted fill reads as "checked", so the shared field mixin — built for a 39px box with a
  background — could not be reused. The radio group colours its **label**: when a required group is
  unanswered no single radio is wrong, so reddening every ring would point five fingers at one
  unanswered question. Both also carry `warning`.
  **Deliberately NOT extended to `ds-radio`, `ds-switch` or `ds-slider`**: a lone radio's choice belongs
  to its group, a switch applies on flip rather than on submit, and a slider always holds a value inside
  bounds the control enforces itself — "required" is not even expressible there. Those three keep their
  message line under the control instead.

- **`ds-sidenav` `brandRoute` — the brand row can lead home.** Set it and the mark plus wordmark become
  one link; leave it unset and the row stays the plain block it was, because a logo that goes nowhere
  should not be a link and every app decides for itself whether its mark is a way home. The link
  announces itself as `"<brand>, home"`, overridable with **`brandLinkLabel`** — a wordmark alone does
  not say where it goes. Router targets only, and `RouterLink` is instantiated only once `brandRoute` is
  set, so an app with no router provided still renders the sidenav.

- **`ds-button` can say WHY it is refused, without a tooltip.** A greyed button that does not explain
  itself is a dead end, and the only way to explain one was `[dsTooltip]` — reachable by mouse alone.
  `ds-menu-item` gained `[description]` in 0.10.2 for the same purpose. Which input to reach for
  depends on whether the user can lift the refusal on this screen:
  - **Standing refusal** — no permission, no integration, nothing here will change it. Set
    **`disabledReason`** beside `disabled` and the reason renders as a second line INSIDE the button.
    Setting it also flips HOW the button is disabled: **`aria-disabled="true"` instead of the native
    attribute**, because a natively disabled button never takes focus, so its description would
    otherwise never be announced. The click is swallowed in the handler instead, so **`(pressed)` still
    never fires**. The reason is exposed as the button's accessible DESCRIPTION rather than folded into
    its NAME, so a screen reader announces the button's label first and the reason as a separate line
    after it. **Length is deliberately uncapped** — the text wraps and the button grows rather than
    truncating the one thing that explains the refusal.
  - **Temporary refusal** — the form simply is not filled in yet. Do NOT disable the button: leave it
    live, judge validity in the submit handler, and carry the text UNDER it with **`hint` / `warning` /
    `error`** — the same three inputs the fields take, resolved the same way and
    rendered by the same `ds-field-message`, with **`messageIcon`**, **`reserveMessage`** and the same
    `DS_CONFIG.field.*` fallbacks. `reserveMessage` holds the line's height while it is empty, so a
    button that gains an error mid-form does not shove the layout below it.
  Also new: **`ariaDescribedBy`** on both `ds-button` and `ds-icon-button`, for pointing at a
  description the app renders itself. On `ds-button` it is merged with the reason's own id.
  **`ds-icon-button` gets no `disabledReason`** — icon-only leaves no room for a second line, and a
  reason living only in the accessibility tree reproduces exactly the invisibility this closes.
  **Nothing changes for a button that sets none of these.** Without `disabledReason` the native
  `disabled` attribute stays and focus still skips it; without a message the host keeps the
  `inline-flex` box every existing layout was built against. The exception is an app that sets
  `DS_CONFIG.field.reserveMessage: true`: `reserveMessage` falls back to it, so every such button
  reserves an empty message line and becomes a column; set `[reserveMessage]="false"` on those
  buttons to keep the old box. A message-bearing button becomes a column,
  and since the host shrinks to fit, a message longer than the label widens the pair — button included,
  exactly as a field's control spans its own message.

- **`--ds-button-shadow` and `--ds-button-shadow-hover` — the rest state finally has a hook.** Focus and
  pressed already had one (`--ds-button-focus-shadow`, `--ds-button-pressed-shadow`); the resting shadow
  did not, which is the only reason a consumer styling its option buttons as a screen's primary surface
  still had a `::ng-deep ds-button button` rule at all — `background`, `color`, `font-weight` and
  `border` were already tokens. That block becomes four token lines and the deep selector goes.
  **Both default to `none`**, so nothing moves until an app asks. `-shadow-hover` falls back to
  `-shadow`, so setting the resting one alone keeps the button steady under the pointer, and the focus
  ring and pressed halo still win while those states are on.

- **`--ds-card-overflow`, so a card can hold a full-bleed child inside its own radius.** A child whose
  background runs to the card's edge — an image, a grey footer strip — paints its square corners over
  the card's rounded ones, and the host cannot fix it: the rounded box is `ds-card`'s inner element, out
  of reach. The usual workaround was `:host ::ng-deep ds-card .card { overflow: hidden }`; that rule
  can go.
  **Set `--ds-card-overflow: clip`** — `clip` rather than `hidden`, so the card does not also become a
  scroll container.
  **Opt-in, not the new default.** Clipping every card would cut the focus ring off any child sitting at
  its edge: the ring is an outset shadow, and `ds-card` with `padding="none"` is the exact example
  Foundations → Colour already gives for a clipping ancestor. Where a clipped card holds focusable
  content, pair it with `data-focus="inset"` and the indicator moves inside the box instead of
  disappearing.

- **`ds-table` column `link` — a cell that IS a link, so a row can say where it leads.** Until now the
  only way in was clicking the row: `rowInteractive` gives the `<tr>` a tabindex and Enter/Space, but a
  row has no href, so it never enters the tab order **as a link**, a screen reader announces a table
  row, and Ctrl/Cmd-click cannot open it in a new tab. `interactive: true` only tinted the cell while
  the row was hovered — invisible to a keyboard or touch user. A common workaround repeated the
  destination as a `View Details` item in the row's overflow menu, which is a menu entry performing
  navigation rather than an action.
  `link?: (row) => string | readonly unknown[] | null | undefined` returns an Angular route target and the column's
  value renders as a real `<a>`. **`null` for a row leaves that cell plain text**, so a list where only
  some records are reachable needs no second column. External URLs go through a `[dsCellTemplate]` —
  `link` takes route targets only, and `RouterLink` is instantiated only once a column sets `link`, so
  an app with no router provided still renders the table.
  **Composes with `rowInteractive`**: the link stops its own click from reaching the row, so the name
  navigates once and the rest of the row still fires the row handler. The two together cost **two tab
  stops per row**, so on a long list prefer the link alone — which is the shape Roselli's "Don't Turn a
  Table into an ARIA Grid Just for a Clickable Row" argues for, with the row click as an enhancement on
  top of a control that already works.

### Changed

- **Every migration item now carries `action`, and the reasoning has moved out of its way.** The
  manifests the package ships in `migrations/` — the ones your own upgrade tooling reads — gained three prose
  fields per item: `action` is the imperative alone and the only field to execute, `appliesWhen` is
  the boundary (which components, which bindings, and what is explicitly NOT affected), and
  `pitfall` is the way to apply the item mechanically correctly and still ship a broken app. `note`
  keeps what is left, the WHY. **Every item in every published manifest carries the new shape**, and
  the ALL-CAPS markers that used to stand in for the missing fields — `NO ACTION`, `ACTION only if`,
  `DELETE-LIST` — are gone from `note`: if your tooling matched on those, match on `action` and
  `deleteList` instead. **Read `action` first and `pitfall` before you report an item done.** No
  field was removed: every one that was there is still there, with the same name and meaning.
- **If you EXTEND a DS field, its message inputs now live one class further up.** `hint`, `error`,
  `warning`, `messageIcon`, `reserveMessage` and `reserveMessageResolved` moved out of the internal `DsFieldBase` into a new internal `DsMessageBase`, which `DsFieldBase` extends — so `ds-button` can take the message half
  without also inheriting `errors`, `invalid` and `touched`, which describe a form control's validation
  state and mean nothing on a button. **That internal base's own surface is unchanged**: every one of those
  members still resolves through it, with the same names, types and defaults. A subclass redeclaring one of these collides exactly as it did
  before; subclassing a DS component stays unsupported (`components.md` § Components).

- **If you EXTEND a DS component, six of them grew members.** Against 0.10.3: `ButtonComponent` gained `disabledReason`, `ariaDescribedBy`, `softDisabled`, `message`,
  `fieldMessage`, `hasMessageRow`, `describedBy`, `hintId`, `reasonId` and `uid`;
  `IconButtonComponent` gained `ariaDescribedBy`; `TableComponent` grew one member, `cellLink`, which
  backs the new `link` column by resolving a column’s `link(row)` to the value the template binds;
  `SidenavComponent` gained `brandRoute`, `brandLinkLabel` and the protected `brandAriaLabel`; and
  `CheckboxComponent` and `RadioGroupComponent` each gained the protected `controlState`.
  A subclass that happens to declare the same name now fails with TS4114 (“must have an ‘override’
  modifier”), or TS2416 if the signature differs — and `protected` is no protection, since a
  redeclared protected member collides exactly as a public one does.
  Subclassing a DS component stays unsupported (`components.md` § Components); compose instead.

### Fixed

- **A `ds-sidenav-item` with no destination was `<a href="#">`, so clicking it navigated.** With neither
  `routerLink` nor `href` the template fell back to `href="#"` — which rewrites the URL and throws the
  scroll position away, on every click.
  It renders a `<button type="button">` now: an item that only emits `activate` is a button, not a link.
  The element carries no `href`, and a click leaves both the URL and the scroll position untouched.
  **Styling is unaffected** (the rules are class-based, and the UA's button chrome is reset on `.item`),
  and both `<a>` variants are unchanged.
  **If you relied on the anchor**: an item you want to be a link needs `href` or `routerLink`, which it
  always did — `href=""` no longer silently becomes `#`.

- **`ds-table`'s pager took no inset, so it sat out of line with the columns and on the container's
  border.** The footer carried `padding-top` alone — no horizontal, no bottom — while every cell is
  inset by `--ds-table-cell-pad-x`. That padding is what insets the content of a `padding: 0` container,
  which is how tables are normally placed, so the summary line landed **16px left of the column text**
  with its baseline **on the border** — footer padding was `12px 0 0 0`. It is now `12px 16px 12px`,
  matching the cells' inset, with the summary clear of the bottom edge. **It follows `--ds-table-cell-pad-x` with the
  cells**, so retuning that token moves the footer's inset along with the columns'.

- **`ds-banner`'s body had no size of its own, so a 16px page rendered it LARGER than its own 14px
  title** — and in `compact` the title and body ran together with nothing between them. Both came from
  the same place: the gap lived on the TITLE, where it also fired with no body under it and could not
  fire at all in `compact` (which zeroes that margin). The gap now belongs to the body — it appears only
  when a body is actually projected — and the body takes `--font-size-s`, overridable through the new
  **`--ds-banner-body-font-size`**. Title and body both render at 14px in a 16px context, with 4px
  between them in `compact`; a title-only `compact` banner is unchanged, because the wrapper is
  `:empty` and contributes nothing. A body inside a `compact` banner is a supported pairing.

- **A `compact` banner whose title was longer than its column overflowed the column and cut the text
  with nothing to show it had been cut.** `compact` is the one-line strip, so its title carries
  `white-space: nowrap` — but nothing made it DEGRADE: there was no `text-overflow`, and the host had
  no `min-width: 0`, so as a flex or grid ROW item it refused to shrink below its own min-content.
  A 260px column held a **319px** banner with the title clipped mid-word; the title now ellipsises and
  the host can be squeezed, fitting at 227px instead of overflowing.
  A non-compact banner is unaffected: its title still wraps rather than clipping, which is the
  difference between the two variants.

- **`ds-banner` no longer inherits its alignment from whatever it is dropped into.** The component
  itself never set an alignment, so a centred ancestor dragged both the title and the body to `center`
  along with it. It now sets `text-align: start` on its own box, so a banner reads as one alignment
  wherever it sits. If you were centring a banner deliberately by centring its container, that stops
  working — say so and it becomes an input.

- **`ds-sidenav-footer`'s account menu now uses `ds-menu-divider`, so the divider tokens reach it.** It
  hand-rolled a `div` with local styles instead, which meant `--ds-menu-divider-color` and
  `--ds-menu-divider-spacing` did nothing there — an override written against the documented tokens
  silently skipped the one menu the DS ships itself. **The line also sat 6px from its neighbours
  where every other menu puts it 2px away**, because the hand-rolled rule added `--space-1` of its
  own on top of the menu's gap. It now behaves like the component it should always have been: **the
  divider adds no space of its own** — 2px above and 2px below the line, exactly the gap between any
  two ordinary items, so the line takes one row's place instead of pushing the rows apart.

- **`ds-menu-divider` sits FLUSH now — a boundary is not a row, so it takes no space of its own.** Its
  own padding already defaulted to 0 (0.8.0), but `ds-menu` is a flex column and its row gap still
  landed above AND below the line, so every divider sat one row's width away from the items it
  separates. It now cancels that gap: **0px above the line and 0px below**, while two ordinary items
  keep their 2px. `--ds-menu-divider-spacing` is untouched and still the way to add air — set it to
  `8px` and you get exactly 8px each side, and clearing it returns to flush. A divider used outside
  a `ds-menu` is unaffected (the cancel falls back to `0px`).
  **If you set `--ds-menu-divider-spacing`** — including via 0.8.0's restore recipe — **your boundary
  tightens by the menu's row gap**, because that gap no longer stacks on top of your value. Add it back
  in your own value if you want the old measurement exactly.

- **`ds-w3w` rendered a space its own format does not have.** The pill showed
  `/// daring.lion.race`; a what3words identifier is `///daring.lion.race`, flush, which is what the
  component's own `aria-label` has said all along — so the screen and the accessible name disagreed.
  The cause was the template's line breaks: the prefix sat on its own line inside the mark element, and
  in inline flow that leading/trailing whitespace collapses to a rendered space. The mark row is a flex
  container now, which drops whitespace-only text nodes outright, so the identifier renders flush and
  the template stays free to be formatted for reading. No API change, and nothing to do on your side.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround written against a hook that only landed in this release.

| If you have | Delete it, because |
| --- | --- |
| A local rule padding `.pagination-footer`, or a `TODO(ds-table-footer-padding)` marker | The footer is inset by the cells' own padding now — horizontally by `--ds-table-cell-pad-x`, and the same at the bottom as the top. A local rule doubles it. |
| `dsTooltip` on a `ds-button` that is `disabled`, carrying the reason it is refused | `disabledReason` puts the reason inside the button AND makes it focusable, so a keyboard and a screen reader reach it too — which a tooltip never did. Scope it: a tooltip that merely NAMES the action stays. For a refusal the user can lift by filling the form in, drop `disabled` entirely and use `error`/`warning`/`hint`. |
| `::ng-deep ds-card .card` with `overflow: hidden`, to clip a full-bleed child inside the card radius | `--ds-card-overflow: clip` — and pair it with `data-focus="inset"` where the clipped card holds focusable content |
| `::ng-deep ds-button button` kept alive only by a resting `box-shadow` | `--ds-button-shadow` (and `--ds-button-shadow-hover`) on the host |
| A `View Details` `ds-menu-item` in `rowActions` that only repeats where the row already leads | `link` on the column that names the record — a real `<a>`, tabbable and Ctrl/Cmd-clickable, announced as a link rather than as a table row |

## 0.10.3 — 2026-08-24

### Added

- **Two SCSS mixins for building your own composite controls** (`components.md` § Global helper
  classes). `focus.owns-the-focus-ring($control)` — include it in a shell that paints its own ring
  on `:focus-within`, naming the ONE control inside that must not paint the base indicator too.
  `outline: 0` cannot do that, because the base indicator is a box-shadow, and a box-wide reset
  instead silences the tab stops living in the box — a clear button, a stepper arrow. `text-clip.single-line-ellipsis` — a one-line
  label that truncates with an ellipsis, via `overflow: clip` plus `overflow-clip-margin`, because
  `hidden` under a line-height tighter than the font glyph box shaves the top and bottom off every
  glyph. `@use '@ids-group-ltd/ids-design-system/styles/focus'` /
  `@use '@ids-group-ltd/ids-design-system/styles/text-clip'` to reach them; a mixin emits nothing until
  it is included.

### Fixed

- **`ds-input` and `ds-textarea` were the two shells 0.10.2's ring fix missed.** Same defect and same
  cause as "One focus ring per field, not two" below: the universal `:where(:focus-visible)` shadow
  lands on the inner element, the box paints its own halo on `:focus-within`, and the `outline: 0`
  both already had cannot cancel a shadow. So the two plainest fields in the library went on drawing
  a 4px control ring around the `<input>`/`<textarea>` **and** a 3px field halo around the box.
  A sweep of every focusable element in the library found these two and nothing else. Both now paint
  a single ring, and the reset stays scoped to the field element, so `clear-btn` and
  `password-toggle` inside the same box keep their own rings; they are real tab stops.
- **Fourteen public override tokens are now listed in the token reference.** They were always
  overridable and nothing in the components changed. Listed and described:
  `--ds-container-pad-x`, `--ds-multi-select-border-color`
  (+`-focus`), `--ds-segmented-selected-bg-color` / `-label-color` / `--ds-segmented-radius`,
  `--ds-time-picker-option-bg-color-selected` / `-text-color-selected` / `-bg-color-hover`,
  `--ds-time-picker-trigger-bg-color` / `-border` / `-color`, `--ds-field-message-icon-offset` and
  `--ds-time-picker-focus-shadow`.
- **Two buttons inside portaled panels had no focus indicator, and one panel had square corners — a
  private token read from outside the host that declares it.** `ds-date-picker`'s `.period-trigger`
  (the month/year header, `tabindex="0"`) and `ds-time-picker`'s `.time-action` both did
  `box-shadow: var(--_…-focus-shadow)` beside `outline: none`. Those private tokens are declared on
  `:host`, the panels are portaled out of it by the CDK, so the `var()` resolved to nothing — and an
  unresolvable `var()` makes `box-shadow` its initial value, `none`, so a keyboard user landing there
  saw nothing. Another WCAG 2.4.7 failure, and older than the 0.10.x focus work. `ds-time-picker`'s
  panel `border-radius` read the same way and fell back to `0`, so the panel rendered square instead
  of `--ds-radius-panel`. Both now paint correctly; `ds-select`, `ds-multi-select` and
  `ds-autocomplete` panels are unaffected.
- **`ds-search`'s clear button had no focus indicator at all — introduced by 0.10.2's own ring fix.**
  That fix silenced the base indicator with a shell-wide reset, which also hit `.search-clear`, a
  `tabindex="0"` tab stop: with the field's halo already lit, in every shadow-based focus style
  tabbing from the input to the × changed no paint property anywhere on screen (only
  `data-focus="outline"` and forced colours still drew an outline), so a keyboard user could not tell the × had focus. A WCAG
  2.4.7 failure, and the same defect as the double ring seen from the other side. Every shell now
  names the one control it speaks for through the new `focus.owns-the-focus-ring($control)` mixin
  instead of blanketing its box, and `ds-field-group` drops its blanket entirely — each segment
  already silences its own.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround this release made unnecessary. Generated from the `deleteList` in `migrations/0.10.3.json`.

| If you have | Delete it, because |
| --- | --- |
| `ds-input input`, `ds-textarea textarea`, `--ds-input-focus-shadow`, `box-shadow: none` | A rule killing one of the two focus rings a ds-input or ds-textarea used to paint - typically box-shadow: none on the inner input, or --ds-input-focus-shadow re-declared as none to hide the doubling. Replace with: nothing - the component now paints one ring on its own. |
| `.search-clear`, `ds-search` | A focus rule you added to the ds-search clear button because it showed no indicator at all - the shell-wide reset 0.10.2 used silenced that tab stop too. Every shell names the one control it silences now, so the button keeps its own ring. Replace with: nothing - the component paints it. |

## 0.10.2 — 2026-08-24

### Added

- **`TableColumn.interactive` — the cell that says WHICH text opens the record.** On a
  `[rowInteractive]` table the whole row is the control, so the hover tint says "clickable" and
  nothing says what the click leads to; a `cursor: pointer` does not name a target. Mark the column
  `interactive: true` and its cell takes a link colour plus an underline while the row is hovered —
  **both, never hue alone** — through `--ds-table-cell-link-color` (default `--accent`) and
  `--ds-table-cell-link-decoration` (default `underline`). Off unless a column asks for it, and inert
  on a passive table for the same reason the row tint is: nothing should promise a click that does not
  happen. This is commonly written by hand as `:host ::ng-deep ds-table tr:hover .cell-name { color:
  var(--accent); text-decoration: underline }`.

- **`TableRowAction` can vary its items per row: `hidden` and `disabledReason`.** The contract could
  only GREY an item that was always there, so a menu whose items swap by status — a draft offering Edit
  + Launch where a live record offers Revert + Delete — grew a permanently dead half on every row. Now
  `hidden?: (row) => boolean` leaves the item out instead, and **a row with every item hidden renders
  no kebab at all** rather than opening an empty menu. `disabledReason?: string | ((row) =>
  string)` puts the why on the item's second line, read only when `disabled` returns true for that row —
  a reason on a live item would read as a caveat on something that works.

- **`ds-menu-item` takes a `description` — a standing second line under the label.** For a limitation
  the action carries ("only the first 1,000 rows", "read-only in this workspace"), visible without hover
  or focus, which is what separates it from a `[dsTooltip]`. **It reaches assistive tech as
  `aria-describedby`, not as part of the item's name:** the line is `aria-hidden` and referenced by id,
  so the projected label alone names the action. The width cap is now
  `--ds-menu-item-description-max-width` instead of a hand-written `14rem` cap.

- **`data-focus="inset"` — a focus style that survives a clipping ancestor.** The ring is a box-shadow
  outside the border box, so any `overflow: hidden` ancestor ate it and left the element focusable with
  **no indicator at all** — for example a `ds-button` inside a wrapper that clips for its own
  animation. Clipping a card to hold a full-bleed child inside a rounded
  corner is normal, and `ds-card` + `padding: none` invites exactly that. **Unlike the other four focus
  styles this one is NOT pinned to `:root`:** a clip is a local problem, so the attribute works wherever
  you set it and the declarations inherit into the subtree. Put it on the clipping element.

- **`ds-search.clear()` is public.** It empties the field, DROPS an armed keystroke and publishes `''`
  at once — which writing `''` into `value` does not do: the effect watching `value` cancels the timer
  only when the incoming text DIFFERS from what the control last pushed, so a host-owned Clear button
  could not always drop the debounce it was clearing. Public for the same reason `focus()` is, and the
  same button needs both.

- **`ds-search` binds to a form — both systems — and a disabled search now looks disabled.** It held a
  value that nothing could bind: no `NG_VALUE_ACCESSOR`, so `[(ngModel)]`, a `formControlName` and a
  signal form all slid off it while its own `[(value)]` kept working. It extends
  the internal `DsControlValueAccessor` now, like every other control that carries a value, and a new `disabled`
  input folds together with the form's own disabled state. The shell paints the disabled surface from
  the inner input's state, which it never did — a disabled search looked live and still took a click.
  **Deliberately no label and no message row.** A toolbar filter is not a validated field, and giving
  it the field chrome would restyle every toolbar it sits in; reach for `ds-input` where a search
  needs a label.

- **`--ds-menu-radius` — the bare `ds-menu` corner, which two token descriptions already promised.**
  The component hardcoded `var(--radius-md)` while its documentation referred to `--ds-menu-radius`
  as though it were public. Same default, so nothing moves — this only makes the documented hook
  real. The panelled case stays separate: inside a `ds-popover` the menu clips to
  `--ds-menu-clip-radius`, which the popover publishes.

### Changed

- **A field's message line now carries a glyph for `error`, `warning` and `success` — and not for
  `hint`.** Colour was the whole signal before, which fails WCAG 1.4.1: in the light theme warning
  (#8A7400) against success (#156822) is a hue apart and nothing else. Four of six major design
  systems carry a per-state icon in
  the field. **`hint` deliberately stays bare** — it is the resting text rather than a state, and it
  is the majority of rows on any real form, so a glyph there is noise rather than signal.
  **Per state, independently, app-wide:**
  `provideDsConfig({ field: { stateIcons: { warning: false, hint: 'info' } } })` — a name replaces the
  glyph, `false` removes it, each key is independent of the others, and **`stateIcons: false` is the one
  line back to how fields looked before**. **Per field:** `messageIcon` wins over both —
  `[messageIcon]="false"` drops the glyph on that field alone. It is declared once on the shared
  field base, so it reaches all fifteen fields that render a message row.
  **Two new hooks:** `--ds-field-message-icon-gap`, and `--ds-field-message-icon-offset`, which centres
  the glyph on the FIRST line rather than the block — the row is `align-items: flex-start` now, so a
  message that wraps keeps its glyph beside the first line instead of floating in the middle. The offset
  defaults to a calc over the two tokens that set that line, so it survives a retuned message type.
  **The size is not a token, on purpose:** `ds-icon` takes a number and writes `width`/`height`
  attributes, so a CSS hook would mean reaching into another component's template. The glyph is 14px
  (`--icon-sm`, under the 12px message text); making icon size CSS-driven is a separate change to
  `ds-icon`.
- **`ds-stat`'s `value` takes `string | number | null`, so Angular's own pipes bind to it.**
  `number`, `currency`, `percent` and `date` are all typed `string | null`, so
  `[value]="count | number"` failed `strictTemplates` with TS2322 and consumers wrote
  `count.toLocaleString('en-US')` in the template instead — which pins a locale rather than reading
  `LOCALE_ID`, and re-runs on every change-detection pass where a pure pipe is cached. `null` renders
  as nothing, like the empty default, and the four pipes have a demo on the docs page.

- **If you EXTEND a DS component, eleven classes grew and six members changed type.** Against
  0.10.1, and the first three are internal so they reach only a fork: `DsFieldBase`
  (`messageIcon` — the state glyph, declared once for every field rather than per component),
  internal `DsControlValueAccessor` (`bridge`), internal `FieldMessageComponent` (`config`,
  `iconResolved`),
  `AutocompleteComponent` and
  `MultiSelectComponent` (`chipsMode`, `showsEveryChip`), `MenuItemComponent` (`description`,
  `descriptionId`), `SearchComponent` (the CVA surface it now declares itself: `bridge`,
  `disabled`, `formDisabled`, `hidden`, `isDisabled`, `markTouched`, `registerOnChange`,
  `registerOnTouched`, `setDisabledState`, `writeValue`), `SidenavItemComponent` (`rail`,
  `railResolved`), `SidenavComponent` (`rail`), `TableComponent` (`actionReason`, `actionsFor`,
  `hasActionsFor`, `visibleRowActions`) and `TimePickerComponent` (`insideATrigger`). A subclass
  declaring any of those names now fails with TS4114 — or TS2415, since a redeclared private
  collides just as a public one does, and a name on `DsFieldBase` reaches every field through it.
  **Six members kept their name and changed type**, which is the case that compiles for a caller
  and breaks an overrider: `maxVisibleChips` on both pickers (widened to
  `number | 'fit' | 'all' | null`, default now `null`), internal `FieldMessageComponent.icon` (widened to
  `IconName | false | null`, so `false` can mean "no glyph" against a state that supplies one),
  `DsConfig.field` (its shape grew the glyph defaults), `SearchComponent.clear` (`protected` →
  public) and `StatComponent.value` (widened to `string | number | null`).

- **Every readback that resolves through `DS_CONFIG` is now public.** `sizeResolved` on fourteen
  controls, plus `elevationResolved` / `paddingResolved` (card), `withDotResolved` (badge),
  `borderedResolved` / `stickyScrollbarResolved` (table), `dividersResolved` (both modals),
  `reserveMessageResolved` (every field), the picker locale/format resolvers, and
  `brandName` / `letterGlyph` / `taglineText` (sidenav, auth-layout). They were `protected`, so the
  migration path 0.10.0 published — "read `sizeResolved()` now that `size()` returns null when unbound"
  — did not compile: reading one from a host, a test or a `viewChild` was TS2445.
  **The line is `DS_CONFIG`, and it is deliberate.** A host cannot recompute an app-level default, so
  that readback has to be public. Members a host CAN derive from its own bindings stay closed:
  `invalidResolved`, `railResolved`, `sortModeResolved`, `filterModeResolved`.
  **Subclassers:** these are new public names on the classes, so a subclass that happens to use one now
  needs `override`. Composition remains the supported route.

- **The focus ring's inner gap is `transparent`, not `--surface-canvas`.** The 2px band exists to
  separate the ring from the element, so it has to match what is actually BEHIND — and a named surface
  only is that when nothing intervenes. In a dark app with white cards it painted the dark canvas as a
  rim around a white card, reading as a rendering artifact rather than a focus state. Transparent costs
  nothing on a canvas-coloured ground (the same pixels show through) and is right on every other.

- **`maxVisibleChips`: `null` means "unset" now, and `'all'` is the mode that shows every chip.**
  `ds-autocomplete` and `ds-multi-select` took `number | 'fit' | null`, in which `null` was the
  LOUDEST setting — render every chip and let the trigger wrap — while 0.10.0 gave `null` a service
  meaning on twenty-two other inputs: not deciding, fall through to the default. The three modes are
  named now: `'fit'` measures the trigger and shows what fits, a number is a ceiling that is still
  measured ("at most N"), `'all'` renders the lot. **BREAKING: `[maxVisibleChips]="null"` used to show
  every chip and now resolves to `'fit'`** — bind `maxVisibleChips="all"` for the old behaviour. Leaving
  it unbound behaves exactly as before, since `'fit'` was already the default, and `null` now leaves
  room for a `DS_CONFIG` slot to answer it app-wide.

- **The active `ds-sidenav-item` is a tinted wash with a coloured label, not a solid brand pill** — and
  the edge rail is an input rather than a token you blank out. The item filled with `--accent` and put
  `--text-on-primary` on its label, making the loudest element on the screen out of a state that only
  says "you are here". Material fills its navigation drawer's active item with `secondary-container` and labels it
  `on-secondary-container`; Carbon uses `$background-selected` with a border and a weight bump.
  Neither fills with the brand accent. Ours is `--accent-subtitle` behind an `--accent-strong` label,
  and hover deepens toward the accent (`--accent-muted`) instead of lightening toward white — the old
  88%-toward-white mix was invisible on a wash. **The state still does not rest on colour alone:** the
  edge rail and the weight bump both stay — and **the rail is now `--accent-strong`, the active label's
  own colour, instead of `--secondary`.** An orange bar across a monochrome-blue row measured
  **2.33:1** on the light wash, under the 3:1 floor a non-text indicator needs; the accent measures
  6.16:1 light and
  5.28:1 dark. Carbon's indicator is the interactive colour and Material's IS the wash — neither
  introduces a second hue. Restore the old bar with `--ds-sidenav-item-rail: var(--secondary)`.
  Every `--ds-sidenav-item-*-active` token keeps its name, so an app that already retuned them keeps
  its own look and needs no edit.
  **`[rail]="false"` on `ds-sidenav`** drops the edge marker for every item, and an item can override
  it for itself (`[rail]` on `ds-sidenav-item`, unset = follow the parent). The old route was
  `--ds-sidenav-item-rail: transparent` or a `::ng-deep` box-shadow reset — both still work, but the
  input says what it means. `SidenavContract` gained a `rail: () => boolean` member; nothing outside
  the library is expected to implement it.

- **The shipped migration manifests say WHERE to look, not only what changed — and a lint now holds
  them to it.** `migrations/<version>.json` (the files the package carries into your
  `node_modules`) gained `surface`, `detect`, `verify`, `restore`,
  `supersedes`, and a structured `deleteList`. The reason: a migration's `find` pattern can point at a
  prop or class name that never appears in your own code even though the underlying behaviour broke
  there instead — a mechanical grep finds nothing, so an item gets recorded not-applicable while the
  break survives. That is not hypothetical: `0.7.1#table-sortkey-non-null-when-unsorted` named
  `ds-table[sortKey]`, while the code that actually breaks is a host's own
  `sorting: store.sortKey() ? { … } : undefined` — so an upgrade that crossed 0.7.1 before this
  release may have recorded it not-applicable. Re-check it if you server-page a table. `surface` and
  `detect` make that item searchable in the artifact that actually changed; `verify` gives a behavioural entry the positive assertion a re-check can test, since there
  is no removed symbol whose absence proves anything. **Every published manifest now carries the same
  fields, back to the earliest release**, so an upgrade tool works consistently across the
  whole upgrade chain. Two default flips that reverse each other are linked by `supersedes` on the
  LATER item, one way only because a published manifest cannot know its own future: `0.7.0` / `0.7.1`
  on `reserveMessage`, and `0.8.0` / `0.9.0` on the table's sort mode. Three CHANGELOG blocks also
  gained the "What you can now DELETE" table their manifests had been carrying alone — 0.10.0's,
  0.10.1's and 0.6.2's. A lint enforces the contract at release and on every merge, so a manifest
  nobody can act on cannot reach you.

### Fixed

- **One focus ring per field, not two.** Since 0.10.0 the universal `:where(:focus-visible)` rule has
  given every focusable element a `box-shadow`, and these shells paint their own on `:focus-within` —
  `outline: 0`, which each inner control already had, cannot cancel a shadow. So a focused field drew a
  tight ring around its inner control AND a halo around the box. Affected five shapes: `ds-search`,
  `ds-autocomplete`, `ds-date-picker`, `ds-number-stepper`, and any field inside a `ds-field-group`
  (fixed once in the shared segment mixin). It is the same trap 0.10.0 warned consumers about — an app
  rule that styles focus with an `outline` only — landing in our own components.
  **The reset is scoped to the control the shell speaks for, deliberately.** A `ds-number-stepper` step
  button keeps its own ring, and so does a chip's close button: those are `tabindex="0"` tab stops, and
  the halo is already on, so it cannot say which of them focus moved to. The date picker's calendar
  toggle is `tabindex="-1"` and correctly loses its ring.

- **A flat line box stopped shaving descenders off clipped labels.** `.option` sets
  `line-height: 1` while `.option-label` adds the `overflow: hidden` its ellipsis needs and no padding,
  so the label box was exactly the font size tall and the glyph box was taller, clipping the top and
  bottom of every option's text rather than only the ones with a descender. Fixed with
  `overflow: clip` plus a `var(--space-1)` clip margin, which **moves no geometry** — the option row
  stays 30px, the multi-select row 36px, the table row 38px.
  **Six sites:** the shared dropdown overlay (`ds-select`, `ds-autocomplete`), `ds-multi-select`'s own
  copy, `.cell-clip` in `ds-table`, `.label` in `ds-breadcrumbs`, and the `.crumb` rules in
  `ds-topbar` / `ds-page-header`, which share the same shape.
  **Two behaviours are unaffected:** the ellipsis still applies (`text-overflow` reads any
  non-`visible` overflow), and `ds-table`'s clipped-cell popover still fires, since `scrollWidth >
  clientWidth` still reports true under `clip`.
- **A field bound with signal forms threw once per field, and then showed an error it had already
  cleared.** The shared message resolver subscribes to `NgControl`'s `events` stream to follow reactive and
  template-driven forms. The `NgControl` that signal forms bridges carries no such stream, so the
  subscription threw `TypeError: Cannot read properties of undefined (reading 'pipe')`, swallowed into
  the console on every signal-forms field. **The second half is what a user saw:** the throw left
  that snapshot frozen at first render, and the message resolver falls back to it whenever the live
  errors go empty — so a field that had just become VALID went on showing its FIRST failure, with
  `aria-invalid="true"`. For example: empty → "We need an email", `nope` → "That does not look like an
  email address", a valid address → **the required message again**. Now the `NgControl` path bows out
  entirely when it has no live stream, leaving the component's own inputs — which is where a
  signal-forms field's errors and touched arrive — as the single source. The same sequence now clears
  the message and drops `aria-invalid`. **Reactive and template-driven forms are untouched.**

- **`components.md` was missing two layouts and naming three sidenav defaults that are not the
  defaults.** The digest shipped in the package is what a consumer's own
  agent reads to answer "what does this library have", and `ds-app-layout` and `ds-auth-layout` were
  absent from it entirely — an agent asked to build a shell or a sign-in screen could not find either
  and had no way to know they existed. It also named `--primary`, `--text-on-primary` and
  `--secondary` as the active sidenav item's defaults, which the wash rework in this same release
  replaced. Both are corrected. Three smaller claims went with them: the search page said two things
  skip the debounce where the code and this changelog both say three, the `--ds-stat-value-white-space`
  description said an unwrapped phrase is clipped when it escapes the tile instead, and `ds-badge`
  carried a superseded docblock. **No API changed** — only what the shipped documentation says about it.

- **Six overlays dismiss on a click in the host's own empty width.** `ds-select`,
  `ds-multi-select`, `ds-autocomplete`, `ds-date-picker`, `ds-time-picker` and `ds-color-picker` all
  tested the whole HOST in their outside-pointer guard - the trigger box hugs its own content while the host takes whatever width a consumer's
  layout gives it, so the label, the message row and any bare strip beside the trigger swallowed the
  dismiss instead of performing it. Each guard now tests its TRIGGER, as `ds-popover` always did;
  `ds-time-picker` tests whichever of its three triggers are present, since a range renders two.
  **Behaviour change if you relied on it:** a press on the label of an open picker now closes the
  panel. A press on the trigger still keeps it open, which is what that exception exists for (the
  caret, and re-focus).

- **`variant="tonal"` now reads as disabled in the dark theme, where it rested on desaturation alone.**
  The disabled label was **1.11:1** from the enabled one and the fill **1.20:1**, so the only signal was
  a hue going grey — and the label sat at **5.51:1** on its own fill, which reads as a live control.
  Tonal now takes the same 40% label mix ghost, text and outline already use, toward
  `--surface-default`: the state gap
  becomes **2.90:1** in dark and **3.39:1** in light, and the label keeps its hue instead of turning
  grey. **The mix moves toward the surface, not toward tonal's own fill**, even though the label sits
  on that fill: mixing into the fill instead would keep the gap too small to read. The fill itself
  barely moves and does not need to: the label carries the state, which is the same division of
  labour the transparent variants shipped with in 0.10.1. Override with
  `--ds-button-label-color-disabled` as before.

- **`ds-multi-select`'s panel follows `--ds-dropdown-panel-radius` like the other two.** Its panel
  element is `class="panel"`, not `.dropdown-panel`, so it never picked up the shared overlay rule and
  sat at a hardcoded `--radius-md` (8px) while `ds-select` and `ds-autocomplete` moved with the token. It
  now resolves the same chain, so a brand that rounds its dropdowns rounds all three.

- **`ds-date-picker`: a click on the host's own empty width now dismisses the open calendar.** The
  outside-pointer guard treated the whole host element as the trigger, but the visible trigger box
  hugs its mask while the host takes whatever a consumer's layout gives it — `flex-grow: 1` beside a
  Clear button leaves a wide bare strip between the field and the button, and a click there kept the
  calendar open with no visible reason. The guard now tests the trigger box
  itself: a press on the field or its calendar glyph still keeps the panel up, while the label, the
  message row and the host's empty width dismiss it like any other outside click.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround written against a hook that only landed in this release.

| If you have | Delete it, because |
| --- | --- |
| A hand-rolled second line inside a `ds-menu-item` — a projected span, a `max-width` near `14rem`, and probably no `aria-describedby` | The `description` input, capped by `--ds-menu-item-description-max-width` |
| `overflow: visible` forced back onto an element that needs to clip, or your own inset shadow standing in for a focus ring | `data-focus="inset"` on the clipping element |
| A `border-radius` override aimed at `ds-multi-select .panel` alone | `--ds-dropdown-panel-radius` now reaches all three connected panels |
| A timer of your own around a `ds-search` Clear button, or a value written twice to make the debounce let go | `clear()` |
| A copy of the config fallback chain in your own host — `this.size() ?? config.control?.size ?? 'md'` | The component's resolver is public now; read `sizeResolved()` |
| Your own wash replacing the solid active sidenav pill — a `--ds-sidenav-item-bg-color-active` override plus a matching label colour | That IS the default now; compare yours against it and drop it if they agree |
| `--ds-sidenav-item-rail: transparent`, or a `::ng-deep` box-shadow reset to hide the active rail | `[rail]="false"` on `ds-sidenav` |
| A `::ng-deep` `border-radius` rule on a bare `ds-menu` | `--ds-menu-radius` |
| `--ds-button-label-color-disabled` pinned on a tonal button to make its disabled state visible, most likely only in the dark theme | The default disabled-label recipe carries it |
| `count.toLocaleString('en-US')` (or any hand-rolled formatting) inside a `ds-stat` binding, because `[value]="count \| number"` would not typecheck | The pipe binds now, and it reads `LOCALE_ID` instead of a pinned locale |
| A `::ng-deep ds-table tr:hover .some-cell { color; text-decoration }` rule to make one cell read as the row's link target | `interactive: true` on that column, retuned with `--ds-table-cell-link-color` / `--ds-table-cell-link-decoration` |
| `name="error"`, `name="warn"`, `.field-message` | A `ds-icon` rendered by hand beside a field's error or warning text, or a rule on the message row nudging it into line against the old centred layout. Replace with: the built-in state glyph (error / warning / success carry one now), retuned through DS_CONFIG.field.stateIcons or messageIcon, with --ds-field-message-icon-gap / -offset for the spacing. |
| `box-shadow: none`, `--ds-field-focus-shadow` | A rule that killed one of the two focus rings a field used to paint - on an inner input, or by re-declaring the field focus shadow. SCOPE, and it matters: this release suppresses the inner ring on ds-search, ds-autocomplete, ds-date-picker, ds-number-stepper and ds-field-group ONLY. A workaround on ds-input or ds-textarea is still load-bearing here - deleting it brings the double ring back. Leave those two until you are on the release that names them. Also leave any rule you wrote against the universal :where(:focus-visible) base indicator itself: that rule is still the one this library ships. Replace with: nothing: the field paints one ring now. |
| `padding-block`, `option-label` | A padding or line-height override added to an option label, a clipped table cell or a breadcrumb to stop the descenders being shaved. Replace with: nothing: the clip carries a --space-1 margin now, at the same row height. |

## 0.10.1 — 2026-08-20

### Added

- **`ds-segmented` joins the form systems, and gains a label and a message row.** It carried a value
  and no form could bind it — no `NG_VALUE_ACCESSOR`, so `[(ngModel)]`, a `formControlName` and
  signal forms all slid off it. It now extends the internal `DsControlValueAccessor` and resolves its message
  the same way as every other field, mirroring `ds-radio-group`: `label`,
  `hint`, `error`, `warning` and `errors` all behave as they do elsewhere, and `disabled` folds
  together with the form's own disabled state. **The DOM grew a level to fit them:** the pill moved
  off `:host` onto an inner `.track`, so the host can stack label, pill and message. The pill's own
  tokens stayed on `:host` and inherit down, so a token override is unaffected — but a
  `::ng-deep` rule written against the host AS the pill (a background, a border-radius, a grid) now
  targets the stack instead, and wants `.track`.

- **A form model can now raise a WARNING, not only an error** — `DS_FIELD_WARNING_KIND`, newly
  exported. A validation error whose `kind` is `'warning'` paints the field's warning state and shows
  its message, but leaves the control **valid**: `aria-invalid` stays off and a submit guard reading
  validity is not blocked.
  **Why it had to ride inside `errors`.** Angular's `AbstractControl` has no channel for an advisory
  remark — it exposes `errors` and the validity derived from them, and nothing else. So there was no
  way for a form to say "this is worth mentioning but not wrong": `warning` and `success` could only
  be bound by hand from the consumer's own state.
  **It works from both form systems with no new plumbing**, which is the point. A reactive or
  template-driven validator returning `{ warning: 'Long runs of capitals are hard to scan' }` has its
  KEY read as the kind; signal forms assigns its own `ValidationError[]`, which already carries a
  `kind`. Both land in the same `errors` signal.
  Ranked below the explicit `warning` input — the consumer's own string wins, exactly as `error` beats
  `errors` — and shown only after the user has interacted, like any other validation message.
  **`DsFieldError` and `DsFieldErrorsInput` are exported too**, so a typed validator can be written
  against the shape the input accepts. Reserved-kind caveat: a validator already using the key
  `warning` for a BLOCKING error now reads as advisory. Rename that key if you have one.

- **`success` exists on all nine bordered fields, and it is now a STRING that carries its own text.**
  Added to `ds-textarea`, `ds-select`, `ds-multi-select`, `ds-autocomplete`, `ds-date-picker`,
  `ds-time-picker`, `ds-otp-input` and `ds-color-picker` — it was on `ds-input` alone, so a form could
  not use the state consistently. The four box-less controls (`ds-checkbox`, `ds-radio`,
  `ds-radio-group`, `ds-switch`) and `ds-slider` deliberately do NOT get it: they have no box for a border to appear on,
  so the state would show in the message line alone and read as a different treatment.
  **BREAKING for `ds-input`, the one field that already had it:** `success` was
  `input(false, { transform: booleanAttribute })` and is now `input<string>('')`. Replace
  `[success]="true" hint="Available"` with `success="Available"`.
  **Why the type changed rather than staying a flag.** It was the only state that could not say
  anything: `error` and `warning` carry their own text, and `success` was a boolean that recoloured
  the `hint` green. So `success` was the one state whose message had to be smuggled through a
  different input, and a reader of the template could not tell a green hint from a grey one. It is now
  a fourth rung in the same ladder — `error` → `errors` → `warning` → **`success`** → `hint` — and
  reads exactly like `warning`: the text IS the state, no second binding.
  **What this removes:** a success border with no message, which is no longer expressible — exactly as
  it never was for `warning`. `invalid` still exists as the flag partner of `error`, for the
  `[invalid]="…" [hint]="…"` idiom that predates `error`.

- **`ds-list-item` can hold its own controls: `[leading]` and `[trailing]` render OUTSIDE the row's
  button.** A row with a checkbox AND a row-level action had no shape here — every projected node went
  inside `<button class="activator">`, where a nested control is invalid HTML, its click bubbles into
  `activated`, and a screen reader folds it into the button's name and never announces its checked
  state. Dropping `clickable` was no answer either: `cursor`, `:hover`, `:focus-visible` and
  `aria-current` all hung off that button. The row is now the flex container and the button wraps only
  the text, so the master–detail shape works — a checkbox per row for a bulk action, the row itself
  choosing what a detail pane shows, two independent targets.
  **This stays a `role="list"`, deliberately not a `listbox`:** the ARIA spec is explicit that a
  `listbox` option cannot hold interactive content, so a real listbox would have made the pattern
  impossible rather than easier. `role="listitem"` carries no such restriction.
  **`selected` also works properly now.** It set `aria-current` on the inner button, so it did nothing
  at all unless `clickable` was on; `aria-current` sits on the host, which is the row that is current.
  **BREAKING for CSS overrides only** — no API changed. `.activator` no longer carries the row's
  padding, gap or hover tint: those moved to the host. A `::ng-deep .activator { padding: … }` now pads
  the text alone, and a `::ng-deep .activator:hover` no longer paints the full row.

- **Per-side padding on `ds-modal` / `ds-modal-card`.** Each region resolved ONE `pad-y` applied to
  both of its edges, so a layout whose header pads only at the top and whose actions row pads only
  at the bottom — the body's own padding carrying the whole gap between them — could not be said
  through the API at all. A common workaround has been three `!important` rules on `.modal > .header` /
  `> .body` / `> .actions` for exactly this, reaching past the component into its internal class
  names, and `DS_CONFIG.modal.dividers` could not retire them. Six new tokens —
  `--ds-modal-header-pad-top` / `-pad-bottom` and the same for `body` and `actions` — each fall back
  to their region's existing `pad-y`, so **nothing moves unless you set one**, and `--ds-modal-*-pad-y`
  keeps working as the shorthand for both edges.

- **`ds-table`'s own icon buttons are themeable.** The row-action kebab and the column-picker trigger
  hardcoded `--icon-default`, `--icon-strong` on hover and an `--accent` focus outline, and neither is a
  `ds-icon-button`, so the icon-button tokens never reached them — a consumer whose design calls for a
  teal row menu had no supported way to get one short of repainting `--icon-default` for the whole app.
  Three resolvers now cover both: `--ds-table-icon-btn-color`, `--ds-table-icon-btn-color-hover` and
  `--ds-table-icon-btn-focus-color`, defaulting to exactly what was hardcoded, so nothing moves unless
  you set them.

### Changed

- **`invalid` paints the error state only — it no longer promotes `hint` to the error message.**
  Every state carries its own text now, and `hint` is never recoloured into somebody else's state.
  **BREAKING:** `[invalid]="true" hint="Must be before end date"` used to render that hint in red,
  through `role="alert"`. It now renders a red border with a **grey** hint. Use
  `error="Must be before end date"` instead — the state and the message come together.
  **Why, beyond tidiness.** The idiom lost the actual hint: when both were set, the help text the
  author wrote was replaced by the error rather than shown alongside it. It also announced help text
  as an alert, and it made a template unreadable — whether `hint="…"` was a hint or an error depended
  on a different attribute. It was the last input that borrowed another one's text; `success` stopped
  doing it in the same release.
  **`invalid` is not going away and still has its own job:** the error state with NO message, for when
  the text lives elsewhere — a form-level error summary, or one message covering a whole
  `ds-field-group` — plus `aria-invalid` for that case. Carbon and Material split the boolean from
  the text the same way.

- **A disabled `ds-icon-button variant="standard"` mixes its glyph toward the surface too.** It is
  the only icon-button variant with neither a fill nor a border, so the glyph's colour is the whole
  disabled signal — and the shared fixed-lightness recipe could not carry it in dark, where the
  enabled icon is already light (OKLCH L 80%) and a disabled one pinned at L 70% sat **1.46:1** away. The new
  default is `color-mix(in srgb, <icon> 40%, var(--surface-default))`, the same mix the
  borderless button variants take, which picks its direction per theme: light **4.17 → 5.19:1**, dark
  **1.46 → 3.58:1**. Scoped to `standard` deliberately, and that is the trap worth knowing: the resolver is declared
  once on the base and no variant overrode it, so moving the base would have hit `filled` too —
  whose glyph is `--c-on`, i.e. white, and white mixed into a white surface does not move at all,
  which would have left an invisible glyph on a pale disabled fill. `filled`, `tonal` and
  `outlined` keep the base recipe unchanged. `--ds-icon-button-icon-color-disabled` is the same
  hook as before and still wins; only the default under it changed.

- **If you EXTEND a DS field component, read this before comparing member lists.** A diff of
  declared members against 0.10.0 says fourteen field components LOST eight members each — `hint`, `error`,
  `warning`, `errors`, `invalid`, `touched`, `reserveMessage` and `reserveMessageResolved`.
  **Nothing was removed.** The duplication had drifted — `ds-date-picker` had been reading a different
  `invalid` source, and now resolves it like every other field. Those inputs were declared once per
  component and are now declared once in total, on a new internal `DsFieldBase`, which every field
  reaches either directly or through the internal
  `DsControlValueAccessor` / `DsBooleanControlValueAccessor`. All fourteen still carry all eight by
  inheritance, so a template binding, a TS read and an existing `override` all behave exactly as
  before, except an override of `hint`, `error` or `warning` typed `input<string>`, which now fails
  with TS2416 because their write type widened to `string | null | undefined`. A member that moves to a base class is easy to misread as removed; it is not.
  What genuinely grew is smaller: **eight bordered fields gained `success`** (`ds-autocomplete`,
  `ds-color-picker`, `ds-date-picker`, `ds-multi-select`, `ds-otp-input`, `ds-select`,
  `ds-textarea`, `ds-time-picker`), `ds-input` having had it all along. **Only the universal inputs moved:** `success`, `label`, `required` and `optional` stay on the
  components, because they exist on 9, 9, 8 and 5 fields respectively — lifting them would hand a
  checkbox a `success` or a slider a `label` it never had. `ds-segmented`
  is the tenth grown class and the one with real new surface — joining the form systems gave it
  `label`, `disabled`, `isDisabled`, `message`, `invalidResolved`, `fieldMessage`, `hintId` and
  `uid`. A subclass declaring `success` on one of those eight now fails with TS4114; declaring any
  of the eight moved names still collides, because an inherited member collides the same way an
  own one does.
  `DsFieldBase` is internal and deliberately not exported.

### Removed

- **`--opacity-muted` is gone from the token scale.** It was the last token in the file that no
  component read: the disabled states moved onto `--text-disabled` + `--opacity-disabled` in
  0.10.0. Keeping a dead number in a purpose-named scale is worse than removing it — it invites the
  override that silently does nothing, where a consumer retunes it on `ds-button` /
  `ds-icon-button` and gets no visible effect. **Nothing in the library changes.** If you set it,
  drop the declaration; if you READ it in your own CSS, inline the 0.6 or move to the token that
  names the job — `--opacity-disabled` (0.5) for a disabled state where opacity is the only signal,
  `--opacity-text-disabled` (0.38) for disabled text.

### Fixed

- **`ds-field-message`'s docs claimed `state` picks an icon. It never did.** The input's docblock
  said it "decides colour and icon" and `icon`'s said it "overrides the glyph the `state` would
  pick" — but `icon` is a plain `input<IconName | null>(null)` with no per-state default, so a
  consumer following the reference got a colour and no glyph. **Nothing in the library changes**: the
  JSDoc and the generated API reference now say what the code does — `state` sets the colour, and a
  field that wants an icon passes one.

- **A nullable binding on a message input no longer throws.** `hint`, `error`, `warning` and
  `success` took a bare `string`, and the resolver called `.trim()` on whatever arrived — so
  `[error]="form.errors?.message"` put `null` in and crashed the render with a `TypeError` the
  moment the expression was empty. All four now transform at the input boundary, absorbing
  `null`/`undefined` to `''` and trimming, so a blank binding simply means "no message". **You can
  now delete** the `?? ''` you wrapped such a binding in.

- **A `ds-menu` inside a `ds-popover` clips its rows to the panel's rounded corners.** The first and
  last row's fill — a hover tint, or the red of a destructive item — painted through the panel's
  corner, so a destructive last item showed **two square red corners under a rounded popover**.
  **The cause was not a missing clip; it was a clip of the wrong shape.** `ds-menu` has
  `overflow: hidden`, and that is what rounds the edge rows for a bare menu. But its
  `:host-context(.popover)` block flattened `border-radius` to `--radius-flat` while leaving `overflow`
  in force, so inside a popover the menu clipped its rows **square** and the panel's 12px corner
  showed that square fill through it. The popover now publishes `--ds-menu-clip-radius` — its own
  radius less the border it contains — and the menu clips to that, concentric at 11px inside a 12px
  panel. A brand overriding `--ds-popover-radius` is followed automatically.
  **Not fixed with `overflow: hidden` on the panel:** a submenu is a CDK
  overlay portaled to `body`, so clipping the panel would not have reached it, and the panel's clip
  would have cut an edge row's focus ring — the same defect `ds-filter-bar` also had.
  Nothing else changes: the item radius token `--ds-menu-item-radius` still defaults to 0, because the
  MENU owns the edge corners, not the row.

- **Clearing or replacing `ds-date-picker`'s `value` from outside now clears the picker's own typing
  error.** `typedInvalid` / `rangeInvalid` were set by the typing paths and cleared only by those and
  `applyPreset`, so `value.set(null)` re-rendered the field to empty and left **"Enter a valid date
  (MM/DD/YYYY)" standing over it**. `[error]` was no help: a consumer who has just cleared the field
  has no error of its own to bind, and an empty string falls straight back to the picker's.
  The `value → text` effect now clears both flags. It is the right place because every typing path
  holds an `editing` guard while it runs, so reaching the effect means the value did NOT come from the
  keyboard — and a leftover error no longer describes what the field is about to show. Neither typing
  path writes `value` on the invalid branch, so blur validation still stands. If you tore a modal body
  down on `(closed)` purely to get a fresh picker, that can go — and it never worked reliably anyway,
  because reopening inside the 300 ms leave animation cancels the close and `closed` never fires.

- **A disabled `ds-button` with `variant="ghost"`, `variant="text"` or `variant="outline"` mixes its
  label toward the surface instead of taking the shared fixed-lightness recipe.** New default:
  `color-mix(in srgb, <label> 40%, var(--surface-default))`. These three share one accent source and
  have no fill that could carry the state, so the label is the whole signal — and the shared recipe
  was failing it, badly in dark. Against the enabled label, the disabled label goes from **2.54 → 3.41:1**
  in light and **1.11 → 2.91:1** in dark. `outline` does have a border, but its disabled border resolves to only
  **1.30:1** against the page — less than its own *enabled* border at 1.49:1 — so it never covered
  for the label.
  **The dark number is the real defect.** `--primary-strong` there is already light (OKLCH L 67.9%),
  so a recipe pinning the disabled label at L 70% landed two points from the enabled one and the two
  differed in chroma alone. A fixed lightness cannot serve both themes: in light, disabled is
  lighter than the accent; in dark the accent is already light, so disabled has to go darker. The
  surface knows that direction and a constant does not — which is the whole reason the mix target is
  `--surface-default` rather than a number.
  **The trade:** the disabled label is fainter against its own ground — **2.00:1** light, **1.99:1**
  dark, where the old recipe gave 2.69 / 6.45. Disabled text is exempt from WCAG 1.4.3 and 1.4.11 and Material ships its equivalent at
  1.93:1, so this is inside practice. Chroma rises with the mix (0.036 → 0.099 light), so the disabled
  label stays tinted rather than going grey.
  **`solid` and `tonal` are unchanged**, deliberately: a white label mixed into a white surface does
  not move, and tonal's disabled fill already carries the state on its own.
  **Known limitation:** the mix target is `--surface-default`, a stand-in for "whatever is behind" —
  CSS cannot read the actual backdrop, so on a tinted ground (a card at `--surface-secondary`, an
  alert) the disabled label is computed against the page colour rather than that ground. Consumers
  who set `--ds-button-label-color-disabled` are unaffected.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a workaround this release made unnecessary.

| If you have | Delete it, because |
| --- | --- |
| A `?? ''` guard wrapped around a message binding - `[error]="form.errors?.message ?? ''"` - added because a null pushed into `hint` / `error` / `warning` / `success` threw a TypeError during render. | nothing - bind the expression directly, the inputs absorb null now |
| A modal body torn down on `(closed)`, or guarded behind `@if (open())`, purely so a re-opened `ds-date-picker` starts clean | The picker clears its own stale error and text on the value-to-text effect now - and the teardown never worked reliably, because reopening inside the 300 ms leave animation cancels the close and `closed` never fires |

## 0.10.0 — 2026-08-18

### Added

- **A capped chip trigger no longer grows a second line on a narrow screen.** On a narrow trigger,
  `[maxVisibleChips]="2"` honoured the count, ran out of width, and wrapped the text
  input onto its own line — the exact growth the cap exists to prevent. **A number is now a CEILING**
  ("at most N"), measured like `"fit"`, so a 412px trigger shows one chip and `+3 more` on one line
  instead of two chips over two lines. `null` is unchanged and now the only mode that skips measuring.
  Three faults sat behind it, all fixed: the trigger kept `flex-wrap: wrap` while capped, so the row
  could never shrink — it just moved the input down; a squeezed chip wrapped its own label and stood
  46px tall beside 29px neighbours; and the measurement's width cache only filled on a render holding
  EVERY chip, which a numeric cap never produces — so the fit silently fell back to "show them all".
  The `+N more` marker also keeps its room whenever the cap hides anything, instead of being clipped to
  `+2 mor`.

- **A `TableColumn` can say `width: 'content'`.** The column sizes to its widest cell and stops
  wrapping, so the slack goes to the columns that should absorb it. An auto-layout table spreads
  leftover width evenly, which is why a status or a figure ends up as wide as its own header while the
  name column that should take the space does not — and a pixel `width` cannot express that, since
  pinning one column leaves the rest spreading — a `'content'` column takes only what its widest cell
  needs, and the ordinary columns absorb what is left over.
  **You can now delete** the `::ng-deep ds-table { .table th, .table td { width: 1%; white-space: nowrap } }`
  block — the last reach into a table's markup this idiom required. Dragging a column's edge still
  wins, because that is a deliberate pixel width — but note it wins for the WHOLE table at once: on
  a `resizableColumns` table the first drag OR resize keystroke anywhere locks a measured pixel
  width onto every column that has not got one, `'content'` columns included. `Home` on a column's
  own handle hands that one back; the column panel's "Reset to default" button and clearing the
  public two-way `columnWidths` hand back all of them. A `'content'` column also has no clip width,
  so `truncate` on it is a no-op rather than an ellipsis against 240px.
  The `title` attribute and the click-to-popover handler are still emitted on such a cell, but the
  popover cannot open: it opens only when the cell measures as clipped, and this one never does.

- **`ds-table` takes `[loading]="true"` and picks the treatment itself** — skeleton rows while it has
  nothing on screen, overlay once there are rows. `'skeleton'` and `'overlay'` still pin either one
  deliberately, and `false` is unchanged. Which of the two is right is a function of the row count,
  which the table already holds, so restating it beside every list is redundant: **you can now
  delete** the `items().length > 0 ? 'overlay' : 'skeleton'` computed beside each list. The rule is
  not a taste call, which is why it belongs here: replacing visible rows with
  placeholders throws away what the reader is looking at, and dimming an empty card announces nothing
  about what is coming, so a hardcoded `'overlay'` makes a first load read as an empty table that
  flickers.

- **`ds-table` has a toolbar row you can put things in — one `[toolbar]` slot.** The component had two
  projection slots in total (`[empty]`, `[bulk-actions]`) and its toolbar existed only while
  `exportButton` was on, so a control that acts on THIS table — a search box, a status filter, a refresh
  — had nowhere to sit next to Export, so a search + status pair ended up living on the page above the
  table, reading as furniture one card away from the rows it narrows instead of a part of the table
  itself. **Project a handful of controls and the row lays them out** (flex, wrap, 8px gap), so the
  ordinary case needs no CSS of yours; **project one element of your own** and it stretches to fill
  the slot, so your layout is the only one in play — the slot is the row minus the Export button,
  and the whole row when `exportButton` is off. The row **collapses to nothing** when nothing filled
  it and `exportButton` is off, so a table that uses neither is pixel-identical — the `div` is still
  in the DOM, hidden in CSS, so a `ds-table > :first-child` selector or a DOM snapshot still sees
  it. Filters that belong to the PAGE still belong in a `ds-filter-bar` above it.

- **`runExport()`, `exporting()` and `exportStatus()` are public**, so the Export button can live in a
  page header, a filter bar or the new toolbar slot and still run the library's path — the
  `exportFetcher` call, the download, the in-flight state and the live-region announcement. Until now the
  only public export method was `exportCsv()`, which serialises the rows the table HOLDS: on a
  server-paged grid that is one page, so a consumer's own button silently exported a fraction of the
  data. Leave `exportButton` off and drive it yourself:
  `<ds-button [loading]="table.exporting()" (pressed)="table.runExport()">`. That pairing wants an
  `exportFetcher`: without one, `runExport()` falls through to `exportCsv()` synchronously and never
  touches `exporting`/`exportStatus`, so an external button bound to them shows no progress at all.
  The two signals are read-only — a subclass that used to `.set()` them (they were protected writables)
  drives them through `runExport()` now.

- **`provideDsConfig` answers seven more inputs, so an app stops restating itself.** Five new sections: `control.size` (honoured by button, icon-button, input, textarea, select, autocomplete, search,
  date/time picker, number stepper, checkbox, radio, switch and field-group), `card.elevation` and
  `card.padding`, `table.stickyScrollbar` and `table.bordered`, `icon.size`, and `badge.withDot`.
  Precedence is **input → config → built-in**, so a screen that differs still binds the attribute and
  wins. **No default moved** — an app that provides nothing renders exactly as before, with one edge
  worth knowing: the booleans that swapped `booleanAttribute` for a nullable transform
  (`table.bordered`, `table.stickyScrollbar`, `badge.withDot`, and `dividers` on both modal components)
  used to read a binding evaluating to `null`/`undefined` as `false`, and now read it as *unset* — so it
  falls through to the config and then the built-in, which for `dividers` is `true`. A literal
  `[bordered]="false"` is unaffected. **You can now delete** the attribute an app repeats on every
  element — a house default rewritten on every table or button — since each new element is one
  forgotten binding away from looking wrong. `control.size` is a different
  axis from `[data-density]`: the tier rewrites hit targets and padding in CSS for a route, this picks
  which of the three declared sizes a control renders at, and an app can use both. Documented as one
  page under Foundations → Theming rather than in scraps across eight component pages.

- **Option icons on every picker, and one shape behind all three.** `ds-multi-select` and
  `ds-autocomplete` now render an option's `icon` before its label at 16px, which only `ds-select`
  did. The three option types share a new exported `DsOption<T>` — they were three near-identical
  interfaces, which is exactly why `icon` existed on one picker for a release. Each keeps its own
  name (`SelectOption`, `MultiSelectOption`, `AutocompleteOption`), so nothing you import changes.
  From the same shared shape `AutocompleteOption` gains `disabled?` and `icon?`, `MultiSelectOption`
  gains `icon?`, and `SelectOption` — which already carried both — gains nothing.
  **`ds-autocomplete` now acts on a `disabled` option**, where it used to ignore the flag entirely: the
  row carries `.is-disabled` and `aria-disabled`, refuses the click, and **the arrow keys step OVER it** —
  including when the panel opens or the filter re-runs, so the active row is never one that Enter would
  ignore. Behaviourally this matches `ds-select` and `ds-multi-select`, which have honoured it all along.
  The row greys out too, so the state is not subtle.

- **`maxVisibleChips="fit"` on `ds-autocomplete` and `ds-multi-select`** caps the chips by measured
  width instead of a count: one line holds as many as the trigger is wide, the rest collapse into
  "+N more", and the split is redone whenever the trigger resizes. **It is also the new default** — see
  the Changed entry below for what that moves and how to opt out. Choose between the three by what has
  to stay predictable: `"fit"` lets the count follow the width, a NUMBER adds an upper bound on top of
  the same measuring, and `null` is the only mode that shows every chip and the only one that never
  measures. **You can now delete** a `ResizeObserver`, container query or per-breakpoint
  `maxVisibleChips` number written to keep a chip trigger on one line — and a `max-height` +
  `overflow: hidden` cap, which clips a chip mid-glyph and hides the count instead of dropping whole
  chips. The measurement is not free but it is bounded: it runs only where a chip row is rendered —
  which on `ds-multi-select` means a non-empty selection, but on `ds-autocomplete` means any `multiple`
  trigger, empty or not — widths are cached per selection, and a geometry guard skips the re-measure
  when neither width nor count moved.

- **`--ds-dropdown-panel-radius` — a hook for the dropdown corner.** It is panel-level rather
  than per-component on purpose: retuning one picker's corner is not a thing to
  encourage, while `--ds-radius-panel` moves modal, popover and date picker too. Defaults to that
  role, so an untouched theme is unchanged, and it is forwarded onto the portaled pane — scope it with
  a selector (`ds-select { --ds-dropdown-panel-radius: 8px }`) and only that panel moves.
  **Two panels read it, not three:**
  `ds-select` and `ds-autocomplete`. `ds-multi-select`'s panel hardcodes `--radius-md` and is reached by
  neither this token nor `--ds-radius-panel` — so only `--radius-md` itself moves it, and that moves
  buttons, fields and tooltips with it.

- **`ds-avatar` takes a `name`, and the rule that reads it is replaceable.** One binding now does both
  jobs a caller used to wire by hand: it derives the initials and seeds the tint. **The tint hashes the
  NAME, not the initials** — two letters collide wholesale, so Alice Brown and Adam Bell used to share a
  colour whenever a caller seeded from the letters. Swap the rule with `[initialsRule]` on one table or
  `provideDsConfig({ avatar: { initials } })` for the app; an explicit `initials` still wins over both,
  and `seed` still overrides the hash input when identity is an id or an email. The built-in rule is
  `initialsFrom` — first two words — and the docs now say plainly that it is a Latin-script guess: how a
  name is read is a cultural convention, not a UI decision, so the library takes yours rather than
  shipping modes it cannot get right. **You can now delete** the `[seed]`/`[initials]` pair you compute
  beside every avatar. `name` feeds the initials and the tint and nothing else: the avatar stays
  `aria-hidden` unless you bind `ariaLabel`, so a `[name]` on its own leaves it silent to a screen
  reader.

- **`DS_CONFIG.brand` — set the brand once instead of on every screen.**
  `provideDsConfig({ brand: { name, logoLetter, tagline } })` answers `ds-sidenav` and `ds-auth-layout`
  together — `name` and `logoLetter` on both, `tagline` on the auth layout, which is the only one of the
  two with a strapline row. They ask the same questions and an app answers them identically, so
  restating them per screen is redundant. Each field resolves on its own, so a screen can
  override the name without restating the letter — and `brand=""` drops the wordmark while a
  `logoLetter` in the config still paints its tile, so clear both to give a screen no brand row.
  **The two-tone wordmark stays projected:** there is deliberately no accent in the config, because
  a string would have to be split back apart to find one and that is the guessing `[dsBrandName]`
  exists to avoid. The projection wins over both. **You can now delete** an adapter component that
  existed to inject a brand object and fan it out into three bindings.

- **`rememberLastTab` on `ds-tabs` — reopen the tab a screen was last left on.** Off by default, and
  inert without `urlParam` (and outside a routed context), because the parameter supplies the names: a
  remembered INDEX would repoint the moment a tab is inserted. Stored under
  `ds-tabs:{path}:{param}` in `sessionStorage`, so two strips on one path stay apart and tomorrow is a
  fresh visit. **A link always wins** — the query parameter is read first, and memory answers whenever
  it is absent, which is any arrival at the bare path, the deliberately-empty first tab included.
  Tab one is remembered too, or going back to it would be forgotten. Only a user's own click or
  keypress writes the memory; a host driving `selectedIndex` writes neither it nor the URL, as before.
  **You can now delete** a helper that kept the last tab per path.

- **`DS_CONFIG.modal.dividers` — turn modal rules off for a whole app in one declaration.**
  `provideDsConfig({ modal: { dividers: false } })` instead of a binding on every `<ds-modal>`, with an
  explicit `[dividers]` on an element still winning. It also reaches where an attribute cannot: a
  `ModalService` confirm renders a `ds-modal-card` with no `ds-modal` ancestor to bind, and the injected
  default gets there too, and the confirm's card comes out `no-dividers`. One limit on that: the
  service is `providedIn: 'root'` and builds the confirm's injector from the root, so only a ROOT-level
  `provideDsConfig` reaches it — a route- or component-scoped one does not. **You can now delete** a
  `dividers` binding repeated per modal, and any `!important` reach into `.modal > .header|.body|.actions`
  written because the token swap left the padding stacked. Note `[dividers]` now reads
  `boolean | null` internally so "unset" is distinguishable from `false`. A literal `[dividers]="false"`
  is unaffected; a binding that can evaluate to `null`/`undefined` is not, since that used to mean
  "off" and now means "unset", which resolves to `true`.

- **`triggerSize` on `ds-filter-bar`, to match its "+N" trigger to the filters beside it.** Default
  `md`, so nothing moves. The bar cannot work this out for itself — `dsFilterItem` carries a width and
  the filters are arbitrary projected controls whose own `size` it never sees — so a row of `sm`
  filters got an `md` trigger standing 8px taller under `align-items: flex-end`. **You can now delete**
  `--ds-button-height` / `-font-size` / `-pad-x` pinned under `ds-filter-bar` to force this.

- **`[debounce]` on `ds-search`, so a list screen stops wrapping it.** `[debounce]="200"` holds each
  keystroke back before `value` updates; the default `0` writes on every keystroke exactly as before,
  and what the input SHOWS is never delayed at any setting. **Three things skip the timer on purpose**,
  which is what a wrapped `debounceTime` usually gets wrong: emptying the field, the Clear button, and
  Enter — the last flushing a keystroke still in flight so `submitted` carries what the reader can see.
  Emptying also cancels a pending keystroke, so type-then-clear cannot land the stale query a moment
  later. A host writing `value` mid-typing wins and cancels the timer. The Clear button follows what is
  ON SCREEN rather than the debounced `value`, so at a non-zero delay it appears on the first keystroke
  instead of after the wait. **You can now delete** a debounce wrapper around this control.

- **`--ds-stat-value-white-space` and `--ds-stat-value-font-size`, for a tile whose value is a phrase.**
  The value line is `nowrap`, which is right for the number `ds-stat` was built around and wrong for a
  date range or a status — so a text value spilled straight out past the tile's edge, and the way out
  was the projected `[dsStatValue]` slot plus two declarations undoing the component. Both default
  to today's values, so nothing moves until you set them. **The size hook works at every `size`**,
  not just the default: the `sm`/`lg` variants now move the same token instead of restating
  `font-size`, which used to out-rank any override. **You can now delete** a `[dsStatValue]` span
  that exists only to set `white-space` or a smaller size.

- **The global `.link` class now works on a `<button>`, which it has been documented as doing all
  along.** `ds-button` warns `variant="text"` off in favour of `.link`, and an action that is not
  navigation has to be a button — but the class was written for anchors and reset none of the browser's
  button chrome, so everyone who took that advice wrote the same rule by hand. A `<button
  class="link">` used to keep its native chrome — `line-height: normal`, `1px 6px` of padding and an
  outset border — all of that is gone, so it now takes the paragraph's font family, size and
  line-height like an `<a class="link">` in the same paragraph. **You can now delete** a local `.link-button`, or the
  padding/border/background/font reset in your overrides.
  `font-weight` is untouched so `.quiet` and `.standalone` still decide it, and `display` stays
  `inline-block` so a standalone button lays out predictably. The reset is scoped with `:where()`, so
  it sits at `.link`'s own specificity and your rule still wins on source order.

### Changed

- **`avatarTint` switches from OKLCH to `hsl(H 50% 62%)` with white initials, always.** The seeded
  tints read as dull, and every set of initials came out black. The auto-contrast was not the fault:
  measured across the hue circle, the old `oklch(62% 0.14 h)` put every hue's luminance between 0.218
  and 0.271 against a 0.179 black/white crossover, so black was genuinely the better pick every time
  (5.4–6.5:1) — the switch was right, the lightness never let it switch. The new recipe was adopted deliberately: HSL lightness is not perceptually even, so yellows land far lighter than
  blues, and that unevenness is exactly what makes the row read as bright.
  **It is a knowing trade against contrast.** White on the lighter hues measures as little as
  **1.65:1**, under the 4.5:1 WCAG AA asks of text, and no hue across the full 20–300° range clears
  it. Suitable where the avatar sits beside a name that is written out anyway;
  where the initials are the only identifier, pass your own `lightness` / `foreground`.
  **API:** the `chroma` option is gone, replaced by `saturation` (HSL %, default 50). `lightness` keeps
  its name and its default of 62 but now means **HSL** lightness, so an existing numeric override will
  land somewhere different — re-pick it rather than assuming it carried over. `foreground` now defaults
  to `#fff` instead of auto-choosing; pass it explicitly to get anything else. `avoidHues` is unchanged.

- **`ds-input`'s `floating` label is removed, with no replacement.** It only ever did half the job: the
  label was drawn inside a taller control, but it never moved out of the field on focus — the animation
  from inside-the-box to above-it *is* the pattern, and without it an empty field reads as a
  permanently mislabelled one rather than a floating-label one. Completing it is a piece of motion work this library is not doing, so it goes. **Migration is deleting the attribute:**
  `[floating]="true"` → nothing, and the label renders above the field like every other field in the
  library. One thing to re-check when you do: a floating input stood at `--hit-touch` (48px at default
  density) and now takes the ordinary size scale (`--field-h-md` → `--hit-cozy`, 40px at default
  density), so a row whose height was built around one moves. Gone with it are the five internal
  tokens only this variant read (`--field-h-floating`, `--field-floating-label-fs`,
  `--field-floating-label-lh`, `--field-floating-label-top`, `--field-floating-pad-t`) — overriding
  them is now inert.
  `--ds-elevation-floating` is a different token for toasts and is untouched.

- **`ds-table`'s `sortKey` and `sortDir` are an `input` + `output` pair instead of a `model`** — the
  mechanism behind the sort-indicator fix under **Fixed** below, because a `model` cannot tell a host's
  write apart from the
  table's own. **Templates are unaffected:** `[(sortKey)]` still works (`sortKeyChange` and
  `sortDirChange` are emitted), one-way `[sortKey]` with `(sortChange)` still works, and a static
  `sortKey="project"` still works. What breaks is reaching into the component in TypeScript:
  `table.sortKey.set(…)` no longer exists — nor `sortDir.set(…)` — so drive it from your own state and
  bind it, which is what every server-paged list already does. Reading `table.sortKey()` still works and
  now returns what the host bound; the marked state the header renders is internal. **One emission rule
  moved with it:** both `…Change` outputs now fire on EVERY sort click, where a `model` suppressed the
  emit when the value was unchanged. `[(sortKey)]` is unaffected — it rebinds the same value — but a
  `(sortKeyChange)="reload()"` handler now also runs when only the DIRECTION changed. Listen to
  `(sortChange)` instead, which carries both halves once.

- **`ds-modal` / `ds-modal-card`: `error: boolean` → `status: DsStatus`.** A boolean could not express
  a warning or an info dialog, and the rest of the library settled on the `DsStatus` vocabulary in
  0.9.0. **Migration is one attribute:** `[error]="true"` → `status="error"`, and a computed
  `[error]="isDangerous"` → `[status]="isDangerous && 'error'"`, since the input takes `false` and
  `undefined` as "no status" — the longer `? 'error' : null` ternary works too. Unset stays neutral,
  so a dialog that never used `error` looks identical. **What you gain beyond the rename:** a status now
  drives the icon-badge tint, the title colour, a DEFAULT icon and the ARIA role — the same four
  things `ds-alert`'s variant drives, so a status dialog and a status alert on one screen cannot
  disagree. The default icon matters: a tint alone signals by colour only, which fails the
  don't-rely-on-colour rule. `icon` still overrides the pick, and `error`/`warning` default the
  dialog to `alertdialog`. `dialogRole` lives on `ds-modal-card` only — it is now
  `'dialog' | 'alertdialog' | null`, defaulting to `null` rather than `'dialog'` so "unset" is
  distinguishable from a deliberate `dialog`, and an explicit value still wins. `ds-modal` has no such
  input, so `<ds-modal status="error">` becomes an `alertdialog` with nothing to override it. What
  renders is unchanged unless you set a status. Three tokens come with the tints:
  `--ds-modal-title-text-color-warning`, `-success` and `-info`, joining the `-error` that already
  existed. **One thing rides along that no attribute of yours controls:** a
  `ModalService.confirm({ tone: 'error' })` passes `status="error"` down internally, and a status now
  supplies a default icon — so a destructive confirm that never set `options.icon` opens with a red
  error badge where it previously had none. Pass `icon` to choose a different glyph; there is no input
  that turns the badge back off.

- **Chips cap by width by default.** `maxVisibleChips` on `ds-autocomplete` and `ds-multi-select`
  now defaults to `"fit"` instead of "show everything": the trigger keeps as many chips as it is
  wide and collapses the rest into "+N more". A trigger that grew a line per selection was pushing
  the rest of the form down the page. **To keep the old behaviour, bind `[maxVisibleChips]="null"`.**
  Two more things moved with the default, and both are easy to miss. A trigger in any measuring mode is
  now single-line (`flex-wrap: nowrap`), and its chips are held to one line each and clipped rather than
  wrapped — so a chip carrying more than a short label gets squeezed, where `null` still wraps the row.
  And **`[maxVisibleChips]="0"` has inverted**: it used to mean "show them all" and now means "show
  none", putting the whole selection behind `+N more`. If you have a `0` anywhere, it was almost
  certainly written for the old meaning; `null` is what that meant.

- **`size` is now `DsSize | null` on the fourteen controls that resolve `DS_CONFIG.control.size`**, so
  an unbound `size` can fall through to it. `ds-drawer` and `ds-spinner` also take a `size` and are NOT
  among them — theirs stays a non-null `DsSize` defaulting to `'md'`, so a grep for `DsSize` finds
  sixteen controls and only fourteen changed. **Nothing changes in a template** — `size="sm"` binds as
  before and an unbound control still renders `md`. **What changes is reading it back:** `size()` now
  returns `null` when nothing was bound, where it used to return `'md'`. The same is true of
  `ds-card`'s `elevation` and `padding`, `ds-icon`'s `size`, `ds-badge`'s `withDot`, `ds-table`'s
  `bordered` and `stickyScrollbar`, `dividers` on both modal components, `dialogRole` on
  `ds-modal-card`, `brand` and `logoLetter` on `ds-sidenav` and `ds-auth-layout`, and `tagline` on the
  auth layout — all of them now answer `null` for "nothing bound" rather than the old default.
  **There is no public accessor for the resolved value**, and this is the
  awkward part of the release: each component holds a `sizeResolved()` (or `elevationResolved()`,
  `withDotResolved()`, …) but declares it `protected`, so reading it from a host, a test or a
  `viewChild` does not compile. `ds-field-group` is the single exception, where `sizeResolved` is
  public. Until that is opened up, a host that needs to know what a control is rendering at should keep
  the value it bound, or resolve `DS_CONFIG.control.size` itself — the fallbacks are unchanged, but
  they are not all `false`: `'md'` for `size`, `'flat'` for `elevation`, `16` for the icon size,
  `false` for `bordered` / `stickyScrollbar` / `withDot`, **`true`** for `dividers`, `''` for the brand
  strings, and the card's own padding when `padding` is unset. **If you implement
  `DsFieldGroupContext`**, its member is now `sizeResolved` rather than `size`, for the same reason:
  a segment must not have to resolve the group's size a second time.

- **`[data-density="ultra-compact"]` now compresses surface padding too** — `--ds-container-pad`,
  the inner padding `ds-card` and `ds-stat` share, drops from 24px to 16px in that tier only.
  Everything else is untouched: the default and the other three tiers still resolve to 24px. It was
  the one padding the tier missed — it already compressed field padding and table cells, so a card
  kept its full 24px frame while its own cells halved. **If you want the old 24px inside an
  ultra-compact container**, re-declare `--ds-container-pad: var(--space-6)` on it. For a value
  between the rungs — 20px, say — set that one token at `:root`; both components default to it, which
  is why neither `ds-card` nor `ds-stat` should be pinned on its own.

- **`ds-tabs` `urlParam` now SLUGS a tab's label instead of using it raw.** A tab with no `value` used
  to put its display string straight into the address — `?tab=License%20Verification%20Status`. It is now
  kebab-cased and lowercased with diacritics dropped: `?tab=license-verification-status`. **If you
  adopted `urlParam` in 0.9.0 with tabs that declare no `value`, your existing links change** — an old
  one no longer matches and lands on the first tab, which is what a stale bookmark has always done.
  Declare `value` on each tab to pin the names for good: a slug is still derived from copy, so renaming a
  tab still moves the link. What `tabClosed` emits is unchanged — still the raw label.

- **`ds-auth-layout`'s projected `[brand]` slot no longer forces `width: auto`.** It shipped in 0.9.0
  alongside the slot's `max-height`, but at `(0,2,0)` it out-ranks a width the consumer set on their
  own logo, and with the default `max-height: none` it never did anything: an `<img>` with no CSS
  width already keeps its ratio under `max-height`. If you opted into the max-height AND set an
  explicit width on your logo, add `width: auto` yourself to keep the old scaling.

- **The chips of both pickers now render inside a `<span class="chip-row">`** rather than directly
  in the trigger — the element the width measurement needs. **On `[maxVisibleChips]="null"` it is a
  wrapper and nothing more**: `display: contents`, so it adds no box and the chips stay flex items of
  the trigger, identical in spacing, wrapping and height. In the measuring modes — which includes the
  new default — the row becomes a `nowrap` flex box that clips, which is how the cap is enforced.
  Either way, what breaks is a CSS override that walks the structure:
  `.autocomplete-trigger > ds-tag`, `:nth-child` written against the trigger's children, or
  `ds-tag + .autocomplete-input` adjacency — the chips are no longer siblings of the filter input,
  the addon slots or the chevron. Drop the combinator or insert `.chip-row`. Multi-select's trigger is
  `.field-trigger`, not `.trigger`, if you are rewriting a selector against it. Chips carry `data-chip`
  and the marker `data-chip-overflow`; the measurement finds them that way, so leave them in place.

- **If you EXTEND a DS component, this is the release that will break you.** Against 0.9.1,
  **30 exported classes grew their member surface** — among them `ButtonComponent`,
  `TableComponent`, `ModalComponent`, `SearchComponent`, `AvatarComponent`, `IconComponent`, both
  pickers, every bordered field that gained `controlState`, and every control that gained
  `sizeResolved`. A subclass declaring any of those names now fails with TS4114. **Four classes also
  LOST members**, which is the case a subclass notices differently — an `override` that now overrides
  nothing: `ModalComponent.error` and `.onBackdrop`, `ModalCardComponent.error`,
  `BottomSheetComponent.stop` and `InputComponent.floating`. Subclassing a DS component remains
  unsupported, so the full list is stated rather than a sample. **Two kinds of break a member-list diff cannot see**, so check them by hand:
  a member whose SIGNATURE changed keeps its name — `TableComponent.exporting` and `.exportStatus`
  are still there, but as public readonly signals rather than the protected writables a subclass
  could `.set()` — and a plain `private pending: … = null` is not a field the parser recognises, which
  is how `SearchComponent`'s `pending` and `pushed` sit outside its reported seven.

### Fixed

- **A card no longer eats the Enter and Space of everything inside it.** `ds-card` bound
  `(keydown.enter)` and `(keydown.space)` on its `<article>` with an unconditional `preventDefault()`,
  and keydown bubbles — so a card cancelled the DEFAULT ACTION of both keys for its whole subtree, on
  every card, not only the `elevation="interactive"` ones that are supposed to answer a key at all.
  On a card built from `ds-card` + `ds-input` + `ds-checkbox`, Enter in a password field sent **no
  request at all** — the form could only be submitted by clicking the button — Space did not toggle a
  "Remember me" checkbox, Enter on a link inside the card did not follow it, and a space could not be
  typed into a text field, so `John` + Space + `Smith` came out as `JohnSmith`. Both handlers now run
  only on an interactive card, and only when the key landed on the card itself rather than on
  something projected into it.

- **A table row's own controls answer the keyboard again.** `onRowKey` consumed Enter and Space for
  every target inside an interactive `<tr>`, so the row's select checkbox could not be toggled with
  Space and a cell's button could not be activated with Enter — the row-actions button carries a
  `stopPropagation` workaround for exactly this. The row now opens only on a key pressed on the row
  itself.

- **`ds-menu`'s type-ahead no longer swallows a projected field's typing.** Every printable character
  reaching the menu jumped focus to an item and was consumed, which left a search or filter input
  placed inside a menu impossible to type into. Keys from a text-entry control now pass through.

- **`ds-radio-group` no longer swallows Enter, so a form still submits from inside it.** The group
  handled Enter as "select the focused radio" and prevented its default, which is neither native radio
  behaviour nor what APG asks for — and inside a form it silently removed the keyboard's way to submit.
  Enter is no longer handled; Space still selects. A text field sitting among the radios (the
  `Other: ___` row) also keeps its own keys now.

- **A field in error no longer tints itself inside a `ds-field-group`, and an invalid group draws a red
  border rather than a near-black one.** Two faults sat behind it: the state rules are included at the
  end of each stylesheet and score the same `(0,3,0)` as the `.in-group` block that strips a segment's
  chrome, so source order alone decided — the border stayed 0 (`border: 0` zeroes the width, so a later
  `border-color` paints nothing) but the FILL came back, tinting one segment pink mid-row — the exact
  thing a group exists to prevent. All three states now carry `:not(.in-group)`. Separately
  `ds-field-group` itself read `var(--border-error)`, **a token declared nowhere**, so `[invalid]`
  fell through to `currentColor`; it now resolves through a new
  `--ds-field-group-border-color-error`, defaulting to `--error`, matching every other colour the
  component publishes.

- **`ds-timeline-item`'s marker sits level with its heading.** The node is 28px and the heading's line
  box is 19.6px, and both started at the row's top edge — so the circle's centre sat **4.2px** below the
  heading's and read as floating between the heading and the time beneath it. The node column is now
  pulled up by half the difference, computed from the same `--font-size-s` / `--line-height-base` pair
  the heading uses, so retuning the heading moves the marker with it. Every marker now aligns exactly
  with the heading's centre.

- **The collapsed `ds-sidenav` stopped squashing its items into a lozenge.** Every item in the rail
  measured **20×40** where the rail gives it 40×40, so the active item's blue tile rendered as a
  vertical bean with the orange rail bar down one side of it — and the alert dot, positioned from the
  item's corner, landed above the glyph's middle instead of beside it. One cause for both:
  `:host(.collapsed)` set `align-items: center`, which stops a flex child stretching, so each projected
  `ds-sidenav-item` and `ds-sidenav-group` shrank to its 20px icon and the `width: 100%` on `.item`
  resolved against *that*. The rail no longer centres its children — `.brand` already centres its own
  contents, which is all that line was there for. Items now measure 39×40 (the rail's 64px less its
  padding and border). The dot is anchored to the GLYPH's top-right corner rather than the tile's, via a
  new `--sidenav-collapsed-glyph`, so it stays put if the rail width ever changes.
  **ACTION** only if you relied on a projected child of a collapsed `ds-sidenav` sizing to its own
  content — a custom element in the rail now stretches to the full 40px column.

- **`ds-time-picker`: the time you just picked stopped looking selected.** Hovering a chosen hour or
  minute painted it with the neutral hover fill while it kept the selected white text — white on pale
  grey, unreadable. Pure specificity: `.opt:hover:not(:disabled)` scores (0,3,0) and out-ranked
  `.opt.is-selected` at (0,2,0). It read as a *touch* bug because a touch screen leaves `:hover` on the
  last-tapped cell until something else is tapped, so the minute you had just chosen sat greyed out
  until you looked away. Hover now skips a selected option; an unselected one is unchanged.

- **`ds-time-picker` in single mode closes itself, and `Done` is gone from it.** Choosing an hour and a
  minute *is* the completion, so a confirm button underneath it was a second way to say the same thing.
  The panel now closes once both columns have been used **in that opening** — re-opening a field that
  already holds a value asks for both again rather than closing on the first tap, and changing only the
  hour leaves the panel up. `Now` takes the full width of the footer beneath the columns, so it reads as
  one action across the panel rather than a button hugging the right edge. **`mode="range"` is
  untouched**: it keeps `Done`, and picking both halves there does not close anything, because the end
  time still has to be chosen. Internally `ds-time-columns` gained a `partPicked` output — `timeChange`
  carries a whole time and cannot distinguish "chose the same hour again" from "never touched hours".

- **`ds-password-rules`: a pending rule is an empty circle, and a rule fades as it passes.** The
  pending glyph was `minus`, which at 14px beside 12px text read as a stray em-dash rather than an
  unticked box; it is now `circle` — the empty counterpart of the check it turns into. A `circle` icon
  joins the set (86 now), available to anything else that wants one. The row also transitions its
  colour over `--duration-base` instead of snapping, because the reader is looking at the field they
  are typing in, so an instant change says a rule flipped but not which one. No reduced-motion guard
  is needed: the duration tokens are already zeroed globally. Row spacing is unchanged at `--space-1`.

- **`ds-password-rules` printed its screen-reader text on screen.** Every row rendered a visible
  "— not met" / "— not yet met" beside the label, because the component used `.visually-hidden` and
  **nothing anywhere defined it**: three other components (`ds-table`, `ds-date-picker`, `ds-stepper`)
  each declared their own byte-identical copy, so the class only ever worked by accident of being in
  the right component. The leaked text is also what made the two-column layout look broken on a phone —
  it ate the column width and wrapped every label onto two lines, which read as a spacing failure and
  was not one. One `visually-hidden` mixin now backs all four. **No API change**; a checklist just
  stops saying "not met" four times in a row. The host also takes `position: relative`, to contain those
  now-hidden rows — so if you absolutely position anything inside `ds-password-rules`, it anchors to the
  component rather than to whatever ancestor used to hold it.

- **`ds-otp-input` no longer shows two digits in one cell.** Typing a second character into a cell that
  already held one left `12` sitting in that box while the model had already split it correctly across
  two cells — so what the user read and what the form held disagreed. The distribution was never the
  bug: `[value]` was. Angular diffs a binding against the value *it* last wrote, and the typed-in cell's
  signal is unchanged by the split (`'1'` before and after), so the DOM write was skipped and the
  browser's own `"12"` survived. That branch now writes the element itself, like the other two already
  did. Pasting a full code is unaffected — it cancels the native input, so nothing ever reaches the box.

- **A `warning` now shows on the control, and one rule drives all nine bordered fields.** `warning="…"`
  coloured the message and left the box untouched. On 0.9.1 six stylesheets styled `.warning` and
  not one belonged to a bordered field: `ds-field-message`, the message this describes, plus
  `ds-alert`, `ds-banner`, `ds-progress`, `ds-sidenav-footer` and `ds-toast`. It now takes a
  `--warning-text` border. Not `--warning`:
  that is `--yellow-400`, **1.47:1** against a white field where WCAG 1.4.11 asks 3:1 for a component
  boundary, so the obvious mirror of the error recipe would have drawn a border nobody can see;
  `--warning-text` is the first rung of the ramp that clears it, at 4.59:1. Border only, deliberately —
  an error blocks submission and keeps border + tinted fill, so it still reads as the loudest thing in
  a form holding all three.

  The nine had drifted badly and are now one shared `field-state` mixin keyed off a `data-field-state`
  attribute: five painted the error box as border + fill and four as a border alone;
  **`ds-autocomplete` reached for a `--border-error` token that does not exist**, so an invalid
  autocomplete drew a *near-black* border (`rgb(22,26,40)` — `border-color` falling back to
  `currentColor`) instead of a red one; and the same state was spelled four ways — `.error` on the
  wrapper in `ds-input` and `ds-textarea`, `.error` on the box itself in `ds-select`, `ds-date-picker`,
  `ds-time-picker` and `ds-autocomplete`, `.invalid` on the box in `ds-multi-select`, and
  `:host(.invalid)` in `ds-color-picker` and `ds-otp-input`. **What changes visually:**
  `ds-autocomplete` finally shows red, and `ds-multi-select`, `ds-color-picker` and `ds-otp-input` gain
  the tinted fill their five siblings already had. A sixth thing moves that is easy to miss:
  `ds-autocomplete`, `ds-multi-select`, `ds-date-picker`, `ds-time-picker` and `ds-color-picker` had no
  error FOCUS ring at all and kept their ordinary accent one while invalid — the shared mixin gives all
  nine `--ds-field-focus-shadow-error`. Only `ds-input`, `ds-select`, `ds-textarea` and `ds-otp-input`
  carry a per-component override for it, so retuning the other five means moving the family token,
  which moves those four with it. One precedence moved with the shared rule: the ladder
  is now error → warning → success, so a `ds-input` carrying both `[success]="true"` and a `warning`
  string paints the warning, where it used to paint the success and ignore the warning entirely. Every
  per-component override token that shipped in 0.7.x (`--ds-input-bg-color-error`,
  `--ds-select-focus-shadow-error`, …) still wins — the mixin takes them as arguments rather than
  replacing them with the family token. The `.error` class is **still emitted** — on the wrapper by
  `ds-input` and `ds-textarea`, on the box by `ds-select`, `ds-date-picker`, `ds-time-picker` and
  `ds-autocomplete` — and `.success` by `ds-input`, the only control with a success state. A selector of
  yours still matches, but the library no longer paints through them, so a rule written to stack on top
  of the DS one now stands alone.

  **DELETE-LIST:** the dead `.invalid` host class on `ds-color-picker` and `ds-otp-input` is gone, since
  nothing styled it any more; if you selected it from outside, use `[data-field-state="error"]`.
  `ds-multi-select` loses the same class from its internal `.field-trigger` — it was never on the host,
  so `ds-multi-select.invalid` never matched from outside anyway. **The attribute is on those nine and
  only those nine.** `ds-checkbox`, `ds-radio`, `ds-radio-group` and `ds-switch` do not carry it: they
  have no bordered box, they signal through `aria-invalid` and `ds-field-message`, and their paint is
  untouched. Nor does `ds-slider`, which keeps its own `:host(.invalid)` binding and still colours its
  fill and thumb `--error` — so a selector written against `[data-field-state]` will not reach any of
  the five.

- **Binding `error` now tints the control, not just the message.** Every field that takes an `error`
  string — all 14 — put a red message under a box that stayed neutral grey, because the invalid
  state was computed from `[invalid]` and from validator `errors` but not from an explicit `error`.
  That contradicted the input's own contract ("binding it says the consumer has already decided this
  field is in error") — the message showed in red while the box beneath it stayed untouched.
  `error="…"` now drives the red border, the tinted fill, the error focus
  ring and `aria-invalid`, exactly as `[invalid]="true"` always did — the border and fill on the nine
  bordered fields, and `aria-invalid` plus the message state on the other five, which have no box to
  paint. **If you were binding both**
  (`[invalid]="hasError" error="…"`) nothing changes. **If you were binding `error` alone and relying on
  the box staying neutral**, that is now the error box — drop to `warning` for an advisory message, or
  bind `hint` and leave `error` empty.

- **A field inside `ds-field-group` no longer pins its value to the top of the row.** Every segment
  except `ds-button` was affected: the value sat against the top edge instead of the vertical centre —
  **5px out at `sm`, 9px at `md`, 13px at `lg`** — against the 21.6px content height the box fell back
  to on the 32/40/48 row scale. The group stretches its segments to one row height, but a segment's
  host is a block, so the `height: 100%` each one set on its bordered box resolved against `auto` —
  the box kept that content height, and the value with it. `ds-button` escaped the defect only
  because its host already declared `display: inline-flex`; its block was rewritten with the rest
  all the same, to `flex: 1;
  height: auto`. Every segment now centres at all three sizes. The six `.in-group` blocks —
  identical declaration for declaration apart from the box's class name, which is
  why the defect sat in five of them at once — are now one `field-group-segment` mixin, so the next
  change to segment chrome cannot land in some of them and miss the rest.

- **`components.md` had drifted, and it ships inside the package.** The digest a consumer's own
  agents read was still documenting the API and token names of two renames ago: **46 of the 92
  `--ds-*` tokens it named no longer exist** (`--ds-button-fg`, `--ds-sidenav-item-bg-hover`, the
  whole `--ds-pagehdr-*` family, …), `ds-button` was described with its pre-2026-06 single `variant`
  axis (`'primary' | 'secondary' | 'tertiary' | …`) instead of `color` × `variant`, and the topbar
  section named a `--ds-topbar-margin-b` that this library does not define.
  Every name in the body is now the shipped one, and the two paragraphs are rewritten from the
  components' actual API.

- **An outlined button no longer paints its own white background.** `ds-button variant="outline"`,
  `ds-icon-button variant="outlined"` and the outlined half of `ds-split-button` defaulted their fill to
  `--surface-default`, which is invisible on a white page and wrong everywhere else: on a tinted card, a
  table toolbar or an alert the button read as a white sticker laid over the surface instead of a control
  drawn on it. The fill is now `transparent`, which is what Material 3 and Bootstrap both specify for this
  variant. Hover still tints — `--c-subtitle` on `ds-button`, `--surface-secondary` on the other two, all
  opaque. On `ds-button` and `ds-icon-button` the disabled state stays transparent as well, because mixing
  a transparent fill toward the disabled surface would have produced a 72%-alpha box, so the border and
  label carry it, as they do on ghost; a disabled `ds-split-button` is the exception and still paints
  `--surface-muted`, which this change did not reach. **If a button of yours sits on a photo, a gradient
  or any busy ground and relied on that white fill**, set it back per instance:
  `--ds-button-bg-color: var(--surface-default)`, or `--ds-icon-button-bg-color` /
  `--ds-split-button-outline-bg-color` for the other two.

- **Everything focusable now gets the DS focus ring, not the browser's black outline.** The library
  styled focus on the elements that remembered to — 42 of 81 component stylesheets, and only 35 of those
  with `:focus-visible` — and everything else fell through to `outline: auto`, which Chrome paints
  black: the close button inside `ds-alert`, `ds-banner` and `ds-drawer`, a link in projected
  content, and any plain `<button>` an app writes itself.
  One base rule now covers them: `:where(:focus-visible)` sets `outline: none` and resolves
  `--ds-control-focus-shadow`, written at **zero specificity** so every component rule and every app rule
  still out-ranks it. The `data-focus` switch is unaffected — all five modes (default, `ring`, `field`,
  `edge`, `outline`) behave as before, the last replacing the shadow with a real outline at a higher
  specificity. **If you deliberately suppressed a focus ring** by leaving an element unstyled, it will now
  show one; give that element `box-shadow: none` explicitly. Note the rule also drops the outline such an
  element used to get from the browser, so if an `outline` was what you wanted there, declare it yourself.
  **The case that actually bites:** an app rule that styles `:focus-visible` with an **`outline`
  only**. That rule keeps winning on `outline`, but it says nothing about `box-shadow`, so the base
  rule still supplies one and the element renders **both** —
  a second ring in the app's colour around the DS ring. Nothing fails a build and nothing greps for it:
  the app rule looks untouched because it is. Add `box-shadow: none` to that rule, or — better, and what
  this release is for — delete the rule and retint the DS ring through `--ds-control-focus-shadow`.

- **A disabled `ds-button` / `ds-icon-button` now reads as disabled on a COLOURED accent.** One label recipe
  for every variant — `oklch(from accent 70% 0.035 h)` — replacing the 58% default, and on `ds-button` the
  52% overrides that tonal and outline carried (`ds-icon-button` only ever had the base). Those sat right
  where a saturated accent already is, so the disabled label differed from the live one by
  **1.16–1.60:1** on four of the five variants; only `color="neutral"` was
  safe, because its enabled label is nearly black. Now **2.40–2.71:1** on the coloured variants that
  were failing, and higher still on `neutral`, which reaches 6.46:1.
  **The trade, stated:** the disabled label is fainter
  against its own background than it was — 2.1–2.7:1 where the old recipe gave 3.4–5.2 — which is the point,
  and disabled text is exempt from the WCAG contrast floor. **Override per component if you disagree:**
  `--ds-button-label-color-disabled` / `--ds-icon-button-icon-color-disabled` still win. **And delete this
  if you have it:** an override retuning `--opacity-muted` on `ds-button` or `ds-icon-button` never did
  anything — neither component reads that token.

- **A disabled control was dimmed twice, and had nearly disappeared.** Five places each set
  `--text-disabled` AND `opacity: 0.6` on top of it: the closed triggers of `ds-select`,
  `ds-date-picker` and `ds-time-picker`, plus two genuine rows — `ds-menu-item` and the shared dropdown
  option. Measured in the light theme: that lands at **1.68:1** against the surface, where the colour
  alone gives **2.53:1** and an enabled control sits at 17.32:1 — so the state was never in danger of
  being missed, the text was. The opacity is gone from those five; the colour carries the state, which is what it was chosen for.
  Where opacity IS the only signal — a disabled calendar day, `ds-toggle-button` — it now reads
  `--opacity-disabled` (0.5) instead of `--opacity-muted` (0.6), the token named for the job. **If
  you retuned `--opacity-muted` to compensate**, drop it: it is a de-emphasis level for hints and
  secondary text, and it no longer carries any disabled state.

- **`ds-table` lost the sort indicator when a host answered a cleared sort with its own default.** Third
  click clears a column, the host replies with its default sort, the rows come back ordered by it — and
  every header said `aria-sort="none"`. Not the table's arithmetic: Angular writes an input only when the
  bound EXPRESSION changed, diffing against the last value it wrote, which an internal `.set()` never
  updates. So the half of the default that equalled what was last bound was skipped — a host defaulting
  to `owner`/`desc` had its `desc` dropped and stayed at `null`, while a host defaulting to `asc` was
  restored. That is exactly why the same three clicks worked on one screen and not another. The marked
  state is now a `linkedSignal` over BOTH inputs, so a change in either re-seeds the pair and the
  direction arrives with the key. A table that binds neither input is unaffected.

- **`ds-table` painted its empty state while the first read was still in flight.** Only
  `loading="skeleton"` suppressed the empty row, and `overlay` is the mode a list uses on every read
  after the first — so a zero-row reload showed "No records match your filters" or a whole
  `ds-empty-state` CTA underneath the spinner. The empty row is a claim about the data ("there are
  none"), so it is now withheld whenever `loading` is anything but `false`. **You can delete the guard
  you wrote for this** — and check the ones you did not write, since branching failure-vs-empty looks
  complete while saying nothing about loading. Note this closes the door on the `[empty]` slot during a load
  rather than opening another one: there is no `loading` value that renders it, so copy you want a
  reader to see WHILE a load runs has to come from your own page, above or around the table.

- **Releasing the mouse on the backdrop closed `ds-modal` and `ds-bottom-sheet`, even when the press
  started inside the dialog.** Select a sentence in the body and let go past the edge, or overshoot with
  a slider, and the dialog vanished. The cause is in the DOM shape: those backdrops WRAP their
  dialog, and a browser fires `click` at the nearest common ancestor of the press and the release,
  which for that gesture IS the backdrop — so the `target === currentTarget` guard let it through.
  Dismissal now tracks the press and fires only when both the press and the release land on the
  backdrop itself, which is how the CDK has always guarded its own outside-click. `ds-drawer` and
  the `ModalService` confirm were never affected (their scrim is a SIBLING of the panel, so the
  common ancestor is a third element) and are unchanged — all four were re-checked. **If a test of
  yours dismisses a dialog with `backdropEl.click()`**, it now needs `pointerdown` + `pointerup` on
  the backdrop, both with the primary button; a real mouse or touch has always sent both. One side
  effect on `ds-bottom-sheet`: the sheet no longer stops click propagation
  (the guard it needed for the old `click` listener is gone with it), so a click inside the sheet now
  reaches an ancestor handler of yours, the sheet being rendered inline rather than portaled.

- **`ds-filter-bar` clipped the focus ring of its first and last inline filter.** The measured row was
  `overflow: hidden` and each slot is sized to exactly the width `dsFilterItem` declared, so the row's
  box starts flush with the first control — and the focus ring is an OUTSET shadow (3px on fields, 4px
  on controls). Interior filters were fine, living in the 12px gap; the outer two had their ring cut off
  as you tabbed onto them. Now `overflow: clip` with a 4px clip margin: the shadow bleeds, `clip` still
  forbids scrolling, and the width the collapse arithmetic reads is unchanged. Not fixable from an app —
  the row is internal, and padding it from outside would change that measured width.

- **A single-select `ds-autocomplete` kept the text you typed to filter, and since 0.9.0 kept it
  INVISIBLY.** The filter input collapses to zero width once a chosen label is on show, so leftover
  query text disappeared from view while it went on narrowing the list: reopening a settled picker
  offered one option out of four, with nothing on screen to say why and no way to clear it. Before
  0.9.0 the same text simply sat beside the label instead. It is now cleared whenever the panel closes
  over a displayed label — which covers both picking an option and dismissing after typing over a
  settled value. Multi-select is deliberately unchanged: its input never collapses, so the text stays
  visible and useful for the next pick. Nothing to do on your side; `query` was component-private, so
  this was not fixable from an app.

- **Four defects in `ds-sidenav`'s brand row.** A `logoLetter` set without a `brand` string rendered
  **nothing at all** — if you worked around that by passing a dummy `brand`, you can drop it now. A
  brand starting with an emoji or a rarer CJK glyph painted as tofu in the letter-mark. The mark had
  no `aria-hidden`, so a screen reader announced the glyph and then the wordmark ("A MyAdmin"). And a
  logo projected into `[brand]` had no size constraint, so an oversized one set the rail's height —
  `--ds-sidenav-brand-max-height` now caps it, defaulting to `none` so nothing moves until you set it.

- **`env(safe-area-inset-*)` needs one line from YOUR app, and nothing here said so.** The insets read
  0 until the host document sets `viewport-fit=cover` in its viewport meta — a notched device alone is
  not enough, and a library cannot set it for you. So `ds-auth-layout`'s notch padding and
  `ds-bottom-sheet`'s home-indicator padding have been inert in every app that never added it. Both
  component pages now say so and show the tag, and the docs site sets it, so the behaviour can be seen
  rather than described. **One real fix rode along:** `ds-bottom-sheet` was calling
  `env(safe-area-inset-bottom)` with no fallback inside a `padding` shorthand, and an engine that does
  not know the variable throws out the whole declaration — taking the sheet's horizontal padding with
  it. It now reads `env(safe-area-inset-bottom, 0px)`, which is what `ds-auth-layout` — the only other
  component using these insets — already did on all four of its.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a workaround this release made unnecessary.

| If you have | Delete it, because |
| --- | --- |
| A `ResizeObserver`, a container query or a hand-tuned per-breakpoint `maxVisibleChips` number, keeping a chip trigger on one line. | `maxVisibleChips="fit"`, which re-splits on any width change rather than at the breakpoints you listed |
| A `max-height` plus `overflow: hidden` on a chip trigger (`.field-trigger`, `.autocomplete-trigger`), stopping it growing a line per selection - it clips a chip mid-glyph and hides the count. | `maxVisibleChips` (a number, or `"fit"`), which drops whole chips and reports how many are hidden |
| Your own `max-height` on a logo projected into `ds-sidenav`'s `[brand]` slot, or a wrapper sized to hold it. | `--ds-sidenav-brand-max-height` (default `none`, so nothing changes until you set it) |
| A global rule against `.ds-dropdown-panel` or `.cdk-overlay-pane` to change a dropdown corner. | `--ds-dropdown-panel-radius`, which scopes to one picker when written under a component selector |
| A query for `ds-autocomplete`'s inner `<input>` plus a synthetic `input` event, clearing leftover filter text after a pick. | `clear()` - and the component clears that text itself now |
| A local `.link-button` class, or a padding / border / background / font reset on `button.link` in your overrides. | the global `.link` class with `.inline` / `.standalone` / `.sm` / `.xs` |
| A `[dsStatValue]` projection used only to set `white-space: normal` or a smaller font size on a TEXT value. | the two hooks on the ordinary `value` input - keep the slot for a value that is genuinely another component, like a badge |
| A wrapper around `ds-search` adding a typing debounce (typically 200ms) with an immediate path when the field empties. | `[debounce]`, which does both plus the Enter flush |
| `--ds-button-height` / `--ds-button-font-size` / `--ds-button-pad-x` pinned under `ds-filter-bar` to force its trigger smaller. | `triggerSize="sm"` |
| `[dividers]="false"` repeated on every modal, or a reach into `.modal > .header` / `.body` / `.actions` with `!important` because hiding the rules left the padding stacked. | `provideDsConfig({ modal: { dividers: false } })`, which drops the rules AND the padding that existed to clear them |
| A helper keeping the last visited tab per path in `sessionStorage`. | `rememberLastTab` on `ds-tabs` (needs `urlParam`, which supplies the names) |
| An adapter component that injects a brand object and fans it out into `brand` / `[logoLetter]=` / `tagline` bindings on each auth screen. | `provideDsConfig({ brand: … })`; the accent stays a `[dsBrandName]` projection instead of a `brandAccent` string plus an `indexOf` split |
| The `ds-avatar` wiring around your own initials helper (the helper itself stays yours). | `[name]` plus one `[initialsRule]` |
| An attribute repeated identically on every element — `[stickyScrollbar]="true"` on every table, `size="sm"` on every button. | `provideDsConfig` with the matching section (`table`, `control.size`, …) |
| A button wired to `exportCsv()` on a SERVER-PAGED table - it serialises the rows the table holds, so the file is one page. | `runExport()` with an `exportFetcher` |
| The computed beside every list table - `items().length > 0 ? 'overlay' : 'skeleton'`. | `[loading]="true"`, which resolves the treatment itself; pin a value only where you mean to override the rule |
| An override retuning `--opacity-muted` to compensate for a washed-out disabled state. That token is a de-emphasis level for hints and secondary text and carries no disabled state at all - and on `ds-button` / `ds-icon-button` it was always inert, because neither ever read it. | `--ds-button-label-color-disabled` / `--ds-icon-button-icon-color-disabled` |
| A `::ng-deep ds-table { .table th, .table td { width: 1%; white-space: nowrap } }` override - the shrink-to-content idiom. | `TableColumn.width: 'content'` |
| A `(keydown.enter)="$event.stopPropagation()"` (or `.space`) on a control inside a clickable row, added so the row would not steal the control's KEY. Read each hit before deleting: a CLICK still bubbles (`onRowClick` only skips a target inside an `<input>`), so a click-path guard stays. | nothing on the key path - `onRowKey` now requires `target === currentTarget` |
| `setTimeout(() => this.sort`, `sortKey.set(null)`, `this.sortKey.set(` | Host code that re-bound the sort after a cleared sort, written because the header lost its indicator whenever the host default equalled the last value Angular had written. The marked state is a linkedSignal over both inputs now. Replace with: nothing - answer the cleared sort with your default and stop there. |
| `.visually-hidden`, `clip: rect`, `clip-path: inset(50%)` | Your own .visually-hidden definition, or a rule targeting the pending row glyph by name, written because the class ds-password-rules used was declared by no stylesheet and its screen-reader text rendered visibly. One shared mixin backs all four components now. Replace with: nothing - the components carry the class themselves. |
| `ds-timeline-item`, `.node-col`, `ds-timeline-item .node`, `margin: -` | A margin you added on ds-timeline-item or its node to pull the marker onto the heading centre. The component pulls the node column up itself now, so your compensation double-applies. Replace with: nothing - remove the margin. |
| `--field-h-floating`, `--field-floating-label-fs`, `--field-floating-label-lh`, `--field-floating-label-top`, `--field-floating-pad-t` | An override of one of the five floating-label tokens. They were :root declarations backing the floating variant, which this release removed, so the declaration now sets a custom property nothing reads. Replace with: nothing - delete the declaration. |
| `new Event('input'`, `dispatchEvent`, `querySelector` | A query for `ds-autocomplete`'s inner `<input>` plus a synthetic `input` event, clearing leftover filter text after a pick. Replace with: `clear()` - and the component clears that text itself now. |
| A `::ng-deep` override on `ds-field-group` forcing the invalid `border-error` back to red, or suppressing a segment fill inside a group | Both are fixed in the component. Replace with: nothing - both overrides are redundant. |
| `@if (!loading` or `*ngIf="!loading"` wrapped around your own empty state inside `ds-table` | `ds-table` suppresses the empty row for every loading value, not only `"skeleton"`. Replace with: nothing - project the empty template unguarded. |
| A width override under `ds-sidenav.collapsed` or `ds-sidenav[collapsed]`, written because the rail centred every item down to its icon | Items fill the rail column now, so the override double-applies. Replace with: nothing - remove the override. |

## 0.9.1 — 2026-08-10

### Added

- **The token and component reference now documents every public token and prop** — 41 were
  shipping with a name, a type and no description: 10 tokens (nine `--ds-*` - the whole
  `--ds-password-rules-*` set among them, plus `--ds-multi-select-panel-bg-color` and
  `--ds-menu-item-radius` - and the global `--auth-card-w`) and 31 inputs and outputs across
  `ds-calendar-day`, `ds-time-columns`, `ds-field-message`, `ds-divider`, `ds-sidenav-footer` and the three layout primitives. **Three of
  them were guessable wrong**, so check yours if you use them: `ds-time-columns` `value` is always
  `HH:mm` in 24h and `format` changes only the DISPLAY, so a 12h picker still emits 24h;
  `minTime`/`maxTime` disable the out-of-range rows rather than removing them, so the columns keep
  their height as a bound moves; and `ds-calendar-day` `tabIndex` is a roving tabindex (one cell at
  0, the rest at -1), not a tab position you set per day. No behaviour changed — only what the
  reference tells you.

### Changed

- **`migrations/<version>.json` now carries the delete-list, so an upgrade tool can act on it.**
  Each version's manifest gains a `deleteList` array — `{ id, surface, find, why, replaceWith }`
  per row — naming the workarounds that release made unnecessary, from the
  `.button.button.button` triple-class to hand-binding `[value]`/`(valueChange)` on every field of a
  signal form. They existed for 0.9.0 in prose only, which no tool reads — so an upgrade that
  crossed 0.9.0 before this release applied none of them. **Nothing here is required**: skipping it leaves working code that is merely
  redundant. The same table is in this file under 0.9.0 if you would rather read than run.
  `migrations/unreleased/README.md` no longer ships from the package — its content now lives in the
  manifest.

### Fixed

- **The changelog page on the docs site was rendering with browser defaults.** Its markdown styles
  were scoped by emulated encapsulation, which stamps its attribute on the container but not on the
  nodes the markdown renderer produces, so every rule in that block matched nothing: border-top 0px
  and margin-top 0px on the version headings, and `h3` white instead of `--text-secondary`.
  Nothing in the package.

## 0.9.0 — 2026-08-10

### Changed (breaking, behaviour)

- **If you EXTEND a DS component, this release collides with your subclass.** Seventeen exported
  classes gained members, so a subclass declaring the same name stops the build: `TS4114` wants
  `override`, `TS2415` fires on a redeclared private, `TS2416` on a differing signature.
  **`TableComponent` is by far the largest**: `lazy`, `lazyLoad`, `showLabel`, `showPageSize`,
  `filterMode`, `columnFilterOptions`, `sortAnnouncement`, `rangeAnnouncement` and `exportFailed`,
  plus a dozen protected members. **And one signature changed rather than appeared:** `isStriped()`
  now takes an ABSOLUTE row index instead of a window-relative one, so a subclass that overrode it
  stripes the wrong rows rather than failing to compile. Elsewhere: both control-value-accessor
  bases gained `hidden` and `focus()` (inherited by every field control); `ds-input` / `ds-textarea`
  gained `readonlyBinding`, `isReadOnly`, `minLength`, `pattern`; `ds-modal` and `ds-modal-card`
  gained `subtitle` and `dividers`; `ds-autocomplete` gained `maxVisibleChips`, `showChevron` and
  `clear()`. One member was also REMOVED: `TableComponent`'s private `distinctValuesOf()`, now
  `optionsFor()`, which prefers the new `columnFilterOptions` input. The full per-class list is in
  `migrations/0.9.0.json`. **Using the `<ds-…>` elements in a template needs no change** — this only
  reaches you through `extends`.

- **`ds-table` `sortMode` and `filterMode` default to `'server'`, were `'client'`.** Server-paged is the
  normal case, and there the old default was actively wrong: the table sorted the current page, so the
  rows looked sorted and were not — a dev warning existed only to say so. An undeclared table now emits
  `(sortChange)` / updates `columnFilters` and reorders nothing itself. **A table that holds every row
  must now declare `sortMode="client"` / `filterMode="client"`**; the dev warning has been turned around
  to catch exactly that case (no `total` bound + sortable or filterable columns + no declared mode).

### Changed (breaking, visual)

- **The `ds-select` dropdown panel has a 12px corner, was 8px.** It was the one panel outside the
  radius role layer — modal, popover, date picker, time picker, autocomplete, bottom sheet, stat and
  page footer all resolve `--ds-radius-panel` — so it disagreed with its siblings by 4px and could
  not be retuned through the role consumers are told to use. Restore with `--ds-radius-panel: 8px`,
  which moves every panel together; there is no per-panel token for the select, and
  `--ds-select-panel-radius` does not exist. `ds-multi-select` is not part of this: its panel is a
  separate element with a hardcoded `border-radius: var(--radius-md)` that the shared rule does not
  reach, so it stays at 8px.

- **Eight exit `@keyframes` are gone, replaced by four global presets.** `modal-out`, `ds-sheet-fade-out`
  and `drawer-scrim-out` become `ds-fade-out`; `ds-sheet-down` and the four `drawer-panel-close-*` become
  `ds-slide-edge-out`. They were view-encapsulated, so referencing one was only possible from a global
  stylesheet — but if you did, that is the mapping. Nothing about the rendered motion changed.

- **`ds-search` is 40px tall by default, was 36px.** It was the only control in the library on that
  height — `ds-button`, `ds-input`, `ds-select` and both pickers all resolve `--field-h-md` — so a search
  box in a toolbar sat a step short of everything beside it. All three sizes now come off the field scale
  (sm 32 / md 40 / lg 48; only md moved). Restore with `ds-search { --ds-search-height: 36px; }`. The
  height also falls through `--ds-field-height` now, so one token levels a whole toolbar.

- **The global `--search-h` token is gone.** It existed only to hold that 36px and nothing reads it.
  Use `--ds-search-height` to retune search alone, or `--ds-field-height` for the family.

### Added

- **Exit motion is swappable, the way entrances already were** — `--ds-modal-leave-keyframes`,
  `--ds-drawer-leave-keyframes` and `--ds-bottom-sheet-leave-keyframes`, plus four global presets that
  mirror the entrance vocabulary (`ds-fade-out`, `ds-scale-out`, `ds-slide-out`, `ds-slide-edge-out`).
  This was blocked by a real constraint the code documented: teardown matched the animation NAME on
  `animationend`, so renaming the keyframe broke closing entirely. The guard now checks that the event came
  from the animated element rather than from a child, which frees the name — and that same check collapsed
  the drawer's four direction-specific exits into one preset, since an exit reads `--_ds-exit-x/y/scale`
  and falls back to the matching `--_ds-enter-*`. Point a token at your own **global** `@keyframes`; a
  component-scoped name is renamed by Angular and will not resolve.

- **Signal Forms bind to every DS control, with no wrapper and no adapter** — `<ds-input [formField]="f.email" />`
  and the form owns the value, the validation, `touched`, `disabled` and the error text. This was very nearly
  true already and nobody knew: `FormValueControl` requires exactly one member, a `value` `model()`, and all
  fifteen controls had it — thirteen of them bound with no library change at all. What was fixed here:
  `min`/`max`/`maxLength` on `ds-input`, `ds-textarea` and `ds-number-stepper` now accept
  `undefined` on the write side (the binder sends it for an unset bound; read types are untouched);
  `readonly` joins `ds-input`, `ds-textarea` and `ds-select` as the contract spelling of the existing
  `readOnly`, because signal forms binds by NAME and a `readonly()` rule was reaching nothing; `minLength`
  and `pattern` are new native attributes on `ds-input` and `ds-textarea`; `hidden` is declared on both
  control-value-accessor bases, so a `hidden()` rule removes the control on all thirteen that carry one; and
  `focus()` resolves the element that holds the value, so `focusBoundControl()` reaches the stepper's number
  box rather than its minus button and the tabbable radio rather than the first in the DOM. Not implemented:
  `dirty`, `pending`, `disabledReasons`. Reactive and template-driven forms are untouched. Docs: **Practice →
  Signal Forms**, with a live form and a contract table stating what each control implements.

- **`ds-modal` takes a `[title-badge]` slot and a `subtitle`.** For a header that needs more than one
  string, without giving up what a hand-rolled `.scrim` + `.panel` dialog would otherwise lose: the focus
  trap, focus restore, the scroll lock, Escape and the enter/leave animation. Same shape as
  `ds-page-header`; `title` stays the accessible name, so projected markup never enters `aria-labelledby`.
  Two tokens: `--ds-modal-subtitle-text-color` and `-font-size`.

- **`[dividers]` on `ds-modal` / `ds-modal-card`, default `true`.** `[dividers]="false"` drops the header
  and actions rules AND the vertical padding that existed to clear them, because those are one design
  decision — setting `--ds-modal-divider: transparent` alone leaves the padding sized for a divider that
  is no longer there.

- **`ds-table`: keyboard column resizing, export failure handling, and two box tokens.** The resize
  handle is a focusable `role="separator"` with Arrow (16px), PageUp/PageDown (64px) and Home to hand
  the column back to automatic sizing; a drag handle that answered only to a pointer made a resizable column
  unusable without a mouse. `exportFetcher` may now resolve a `Blob` or a URL as well as rows, for a file
  the backend already formatted, and `exportFailed` emits the rejection — swallowing it made a failed export
  indistinguishable from a slow one. Two box tokens: `--ds-table-min-width` (a readability floor, default 0)
  and `--ds-table-hscroll-bottom` (offsets the sticky scrollbar out of a padded container, default 0).

- **The three `ds-modal` regions take their padding from tokens** — `--ds-modal-pad-x` for the gutter all
  three share, plus `--ds-modal-header-pad-y`, `-body-pad-y` and `-actions-pad-y`. The regions are padded
  for a divider-separated layout: set `--ds-modal-divider: transparent` and you are left with spacing
  sized for dividers that are no longer there — these tokens let you retune it directly instead. Nothing
  moves by default. Note the tokens go on `ds-modal` AND `ds-modal-card` — a dialog opened through
  `ModalService` renders the card with no `ds-modal` ancestor.

- **`maxItems` on `ds-breadcrumbs`** — collapses the middle of a deep trail into a crumb that says how
  many it stands for, keeping the first and, crucially, the LAST. Without a cap the row is `nowrap` with
  `overflow: hidden`, so an overlong trail is clipped from the END — hiding the current page, the one
  crumb the reader needs most. Opt-in; every crumb still renders by default.

- **Dev warnings no longer repeat themselves.** Every component with one wrote the same four lines around
  it — `isDevMode`, an `effect`, a condition, a `console.warn` — and each copy shared the same flaw: the
  effect re-runs when ANY signal it read changes, so a warning about a static misconfiguration could be
  logged again on every keystroke. They now go through one internal helper that fires at most once per
  message. Warnings on `ds-button`, `ds-stat` and `ds-table` moved onto it. `ds-tabs` keeps its own,
  because its effect also owns registry bookkeeping that a plain warning cannot express.

- **`maxVisibleChips` on `ds-autocomplete`** — caps the chips in the trigger and collapses the rest into
  "+N more". Without it a multi-select trigger grows a line per selection and pushes the rest of the form
  down the page. Same input name, same transform and same wording as `ds-multi-select`, which
  already had it — the two multi-value pickers should not diverge on this.
  Backspace still removes the last SELECTED chip, not the last visible one.

- **`ds-stat` takes a projected value** — `[dsStatValue]` for a tile whose headline is a badge, a status
  dot or anything a number slot cannot hold. `value` is now optional and acts as the fallback, the same
  shape `[delta]` already had; existing tiles are untouched. The slot is namespaced on purpose: twenty
  components in this library have a `value` input, so a bare `value` attribute would have set theirs to
  the empty string on the way past. A dev warning fires if `unit` is set with no `value`, since a
  projected headline owns the whole line and the suffix would silently vanish.

- **The package now ships `design-system.md` and `components.md`.** `design-system.md` is no longer a
  catalogue: it carries the RULES — which spacing token goes between what, which type role a piece of
  text takes, the field-height contract, who owns a gap, and how to override a component (including the
  two things that break it: reaching for an internal class, and portaled panels). The inventory
  it used to be moved to `components.md`. Both are readable from `node_modules`, so a consumer's agents
  and tooling can follow the system instead of guessing plausible token values.

- **`ds-tabs` warns when two strips claim the same `urlParam`.** Both write the same query parameter, so
  each erases the other's tab and a reload restores whichever wrote last — nothing throws and the URL
  looks plausible. It is the easy mistake when turning `urlParam` on across an app, because `"tab"` is the
  obvious name every time. Dev-mode only.

- **Selected dropdown rows have their own hooks** — `--ds-option-selected-bg-color`, `-label-color`,
  `-bg-color-hover` and `--ds-option-check-color`, defaulting to the theme roles they used to read
  directly. A brand that wanted a different selected treatment previously had to RETARGET `--primary-*`
  inside `.ds-dropdown-panel` and then track what else in the panel read the same role. Panel-level: one
  partial paints select, autocomplete and multi-select alike. Nothing moves by default.

- **`ds-field-group` — several controls in one bordered box** (`select + input`, `input + button`,
  `input + select`). The group owns the border, the radius, the divider and a single `:focus-within` ring;
  the controls inside render naked. Segments hug their content, `grow` takes the slack. `size` uses the
  field height scale, plus `invalid` and `fullWidth`. A control knows it is a segment by injecting
  `DS_FIELD_GROUP` rather than being told with an input — the alternative is manual, and one segment where
  it was forgotten draws its own border mid-row. Six controls can be segments: `ds-input`, `ds-select`,
  `ds-search`, `ds-autocomplete`, `ds-date-picker` and `ds-button`. Not `ds-number-stepper` (a composite
  already) or `ds-multi-select` (its chips wrap, which a fixed-height row cannot take). Grouped controls must not carry a `label` or `hint` — the message row
  would break the glued line, so it is suppressed and a group-level one is not built.

- **`ds-table` lazy loading** — `[lazy]` plus a `(lazyLoad)` output emitting `{ first, rows }` for the
  range now on screen. `data` becomes a sparse array `total` long: write each fetched row at its absolute
  index, and every gap inside the window renders a skeleton row until it arrives. The scroller is sized
  from `total` rather than from what has arrived, so the scrollbar tells the truth from the first frame.
  Needs `virtualScroll` (there is no window to fetch against otherwise) and `total`; a request is not
  re-sent while the range it covered is still on screen. Dev warnings cover all three ways to wire it
  wrong, including `sortMode="client"`, which would sort only the rows that happen to have loaded.

- **`[quiet]` on `ds-menu-item`** — a muted row for a secondary action like "Sign out" under a divider,
  the sibling of the existing `[error]`. Recolouring one item was previously impossible through the
  token: `--ds-menu-item-label-color` resolves on the host against the value inherited from `ds-menu`, so
  setting it per item did not win and the colour had to go on the inner element. `[error]` still wins if
  both are set. Colour comes from `--ds-menu-item-quiet-label-color`.

- **21 hooks for type and box values that a `font:`/`border:`/`padding` shorthand had swallowed.** Same
  shape every time: the value sat inside a shorthand, so overriding the one property meant a selector
  out-ranking the shimmed component rule. `ds-description-item` completes the eyebrow set both halves
  (`--ds-description-list-term-weight` / `-tracking` / `-transform`, `-details-font-size` / `-weight`) —
  the same five `ds-field-label` and the modal eyebrow already exposed. `ds-segmented` gains
  `--ds-segmented-btn-border` (for a hairline chip row), `-btn-pad-x` and label type; `ds-tabs` gains
  `--ds-tab-pad-top` / `-bottom` (an underline tab wants bottom-only and could not say so), label type,
  `--ds-tabs-strip-gap` and `--ds-tabs-panel-pad-top`; `ds-menu` gains item padding, item label type and
  `--ds-menu-gap`; `ds-checkbox` gains `--ds-checkbox-label-weight`, the third label property where size
  and colour were already hookable. Every default reproduces today's value.

- **The theme's radius and elevation roles now reach portaled panels.** A pane lives under `<body>`, so
  nothing component-scoped could reach it: squaring `--ds-radius-panel` left a square app with round
  dropdowns, and the only fix was re-declaring the roles on `.ds-overlay-pane` globally. Roles now travel
  with the tokens each component already forwards — but only where the host actually overrides the root,
  so an open panel still follows a theme switch instead of pinning the value it opened with.

- **`--ds-badge-white-space`** (default `nowrap`, so nothing moves). A badge in a narrow, fixed-layout
  table column has to be allowed to wrap or its label clips, and the property was the one thing on that
  element not reachable through a token — the workaround was a global rule against the private `.badge`.

- **`showPageSize` and `showLabel` on `ds-table`**, forwarded to its footer pager. Both have always existed
  on the standalone `ds-pagination` but were unreachable once the pager was inside a table, so hiding the
  size picker on a fixed-page-size table meant a global selector reaching into the DS. Default `true` — no
  change unless set.

- **`--ds-table-head-pad-top` / `--ds-table-head-pad-bottom`.** Header cells were the one padding in the
  table that stayed symmetric — body cells have had per-side hooks since 0.7.1 — so a header wanting its
  label tight to the top with air above the rule could only be reached with `!important`. Both fall back to
  the density value, so nothing moves until one is set.

- **`ds-autocomplete` can be built as a search field.** `dsAutocompletePrefix` / `dsAutocompleteSuffix`
  content slots — the same names and the same contract as `ds-input`'s addon slots — plus `[showChevron]`
  (default `true`) to drop the trailing arrow, which on a search field invites a click that would list
  everything. Previously a leading glyph had to be absolutely positioned over the field and the chevron
  hidden with a global selector reaching for `.autocomplete-chevron`. Unlike a fixed `variant="search"`,
  the slots also cover the icon-**and**-chevron case a combobox often wants.

- **`ds-autocomplete.clear()`**, emptying both the selected value and the text the user typed. Setting
  `value` to null from outside left the typed query on screen, because the query is component state with no
  input bound to it — so a host resetting the field after navigating had to query the inner `<input>` and
  dispatch a synthetic `input` event at it. It deliberately does not move focus.

- **`--ds-autocomplete-panel-maxh`**, so the dropdown's height before it scrolls no longer needs the private
  `--picker-maxh` (which `ds-multi-select` also reads, making it the wrong lever for one component).

- **`--ds-autocomplete-panel-radius`, bringing its panel into the radius role layer.** Its dropdown was
  hard-coding `--radius-lg` while modal, popover, card, bottom-sheet and both picker panels resolve
  `--ds-radius-panel`, so a consumer who squared the three radius roles still got this panel rounded, with
  no hook to reach it. Nothing moves by default — the role still resolves to
  `--radius-lg` — and the token is forwarded onto the portaled pane on open like the other panel tokens.

- **`ds-app-layout` takes a `scrollReset` strategy, and `LayoutNavigationService` is public.** Owning the
  scroll CONTAINER had quietly meant owning the POLICY: `scrollToTop()` was public so a screen could ADD a
  reset, but nothing could suppress one the layout decided to do. `scrollReset: 'path' | 'never' | 'always'`
  defaults to `'path'`, which is exactly today's behaviour — no consumer sees a change unless they set it.
  `'always'` also resets on a query- or fragment-only navigation (what a server-paged list wants); `'never'`
  hands the decision to the screen.
  — Exporting the navigation service removes a duplication the layout was causing: "did the path change?"
  was being re-derived ad hoc wherever it was needed, and a naive `split('?')` check keeps the fragment
  that `pathChanged` strips, so two implementations could disagree on the answer. It is root-provided and
  stateless, so exposing it costs nothing.

- **`ds-icon` warns in dev when a name resolves to nothing.** An unknown name rendered an empty
  `<svg>` in silence: the types cannot catch it, because `IconName` stays open (`| (string & {})`)
  so a consumer can register their own glyphs through `provideDsIcons()`, and closing the union
  would reject every registered name. The warning names the offending value and sits on the one
  branch that knows — production pays a single falsy check.

### Changed

- **`--ds-radius-inner` now reaches the small affordances it was written for.** Dropdown options, field
  clear buttons, calendar days, chips, and tag and toast close buttons took `var(--radius-sm)` directly
  instead of the role, so the role a consumer is told to retune reached exactly one component. Nothing
  moves (the role's default IS `--radius-sm`), but it changes what a square brand costs: zeroing the three
  radius roles now squares these affordances too, while surfaces that still read the raw scale - the
  `ds-multi-select` panel, menus and steppers among them - stay rounded. Five focus-ring radii inside
  `:focus-visible` keep following the raw scale deliberately — a ring traces a box, it is not a surface a
  brand designs.

- **`ds-auth-layout` compresses its own chrome on a short viewport, so the layout is never the reason a
  card scrolls.** Block padding, the column gap, the letter-mark tile and the masthead's inner gap clamp
  against `svh`. At ~330px of viewport — a landscape phone — that furniture costs ~131px instead of ~219px.
  Every multiplier reaches its maximum at a viewport **800px tall or more** — a viewport height, not a
  screen size: a 1366x768 laptop sits near 630px once browser and OS chrome come off, and a 1080p screen at
  150% display scaling near 585px, so a good many desktops render the compressed furniture too.
  **Type is deliberately excluded**, because clamping it buys no vertical space — the wordmark shares a flex row with the tile, whose height
  exceeds the wordmark's line box at every viewport height, and the glyph sits in a fixed-size grid box —
  while shrinking the brand against a fixed 14px tagline, worst for the users who scale their display up.
  Both are back to the fixed sizes 0.8.0 ships.
  `svh` rather than `dvh` because the dynamic unit changes as a mobile URL bar hides, which would re-space
  the column mid-scroll; `min-height` stays on `dvh` so no strip of body background shows when the bar
  retracts. New opt-outs: `--ds-auth-layout-pad-block` and `--ds-auth-layout-mark-size` (set
  either, or the existing `-gap`, to a fixed value and that dimension stops compressing). A card taller than
  the space left still scrolls — deliberately, because the alternative (pinning the masthead and footer out
  of the flow) frees more room but lets chrome overlap a tall form.

- **`ds-auth-layout` — a round of additional fixes.** All additive or corrective; nothing to migrate.
  The letter-mark is now `aria-hidden`, so a screen reader announces "MyAdmin" rather than
  "A MyAdmin"; it also carries `flex-shrink: 0`, so a long wordmark can no longer squash the square tile
  into a rectangle. `logoLetter` on its own renders its tile instead of nothing (the outer gate never
  tested it). The glyph is taken with a code-point split rather than `charAt(0)`, which returned half a
  surrogate pair for a brand starting with an emoji. `box-sizing: border-box` is declared on the host
  rather than inherited, because the documented à-la-carte style path omits `styles/reset` and without it
  `min-height: 100dvh` plus the block padding overflows by exactly that padding — the scrollbar this
  component exists to avoid. The four `env(safe-area-inset-*)` calls gained `0px` fallbacks and moved to
  physical `padding-left`/`padding-right`, since the safe area belongs to the device and must not swap
  sides with text direction; note the insets are inert unless the **host app** sets `viewport-fit=cover`
  in its viewport meta, which the library cannot do and did not previously say. New tokens, both
  defaulting to today's behaviour: `--ds-auth-layout-mark-radius` (the tile's radius was the one value
  with no override hop) and `--ds-auth-layout-brand-max-height` (`none` by default — set it to cap a
  projected `[brand]` logo, which nothing constrained). New input `landmark` (`'none'` by default): the
  card holds the whole content of an auth screen but `ds-card` renders an `<article>`, which is not a
  landmark, so `landmark="main"` gives a screen-reader user something to jump to on a standalone auth
  page. It is opt-in because the layout is also embedded inside pages that already own a `main`.

- **BREAKING: `ds-auth-shell` is renamed `ds-auth-layout`** (`AuthShellComponent` → `AuthLayoutComponent`,
  and `--ds-auth-shell-*` → `--ds-auth-layout-*`). "Shell" is not this library's word for a layout — the
  app-level one was renamed `ds-app-shell` → `ds-app-layout` back in 0.7.0, and shipping an auth counterpart
  called a shell in 0.8.0 reintroduced the split vocabulary that rename existed to remove. Mechanical:
  rename the tag, the class and the six tokens. Nothing about the behaviour or the slots changes.

### Fixed

- **Opening `ds-date-picker` with the mouse no longer takes the caret out of the field.** Clicking the
  calendar glyph moved focus into the day grid, which a mouse user did not ask for and which, with
  `allowInput` on by default, pulled them out of a field they may have been typing in. The glyph now behaves
  like a click on the field itself: focus follows what the field IS — typeable keeps the caret, read-only
  focuses the grid. The keyboard path is unchanged, ArrowDown still enters the grid however the panel opened.

- **A settled `ds-autocomplete` no longer shows an empty text box beside its value.** In single mode the
  chosen label has always rendered as its own element, but the filter input stayed 80px wide next to it and
  took the caret, so a field with a value read as free text rather than a picker. With a value and the panel
  closed the input now collapses to zero width — it keeps focus, so clicking still opens the panel and
  typing still filters.

- **A column resize no longer moves columns the reader never touched.** Only the dragged column had a width,
  so the browser redistributed the remainder across the auto-sized rest and they visibly jumped. The first
  resize — pointer or keyboard — now freezes every visible column at what it currently measures, once.

- **The clipped-cell popover reaches template cells, and a narrowed header keeps its label.** Clip detection
  walks descendants, so overflow inside a `dsCellTemplate` behaves like a plain truncated cell; a header
  narrowed by resizing gets a `title` with the full label on hover. Scoped to columns that asked for
  `truncate` — a handler on every cell would swallow the row click on an interactive table.

- **`sortValue` string ordering is case- and accent-insensitive** (`sensitivity: 'base'`), matching the
  comparator consumers are migrating off, so a column of strings does not silently reorder.

- **`--ds-field-height` now reaches six more controls.** `ds-autocomplete`, `ds-multi-select`,
  `ds-color-picker`, `ds-number-stepper`, `ds-split-button` and the `ModalService` confirm input each
  spelled their height as the raw `--hit-*` value, so the knob the token name advertises did nothing for
  them. All six are on the `field-box-height` contract now, and no raw `--hit-cozy` height is left in the
  library. Same pixels at every size **except `ds-number-stepper` at `size="lg"`, which goes 44px → 48px**
  to match the family's large field; the other sizes are unchanged. That holds with `[data-density]` on
  the root element: under a `[data-density]` set on an inner container the `--field-h-*` scale keeps its
  root value, so these six no longer follow that container's density.

- **Date and time pickers keep step with the fields beside them under `[data-density]`.** Both triggers
  hard-coded their horizontal padding, which happened to equal `--field-pad-x` at default density but did
  not shrink with it — so setting a density left a picker 8px wider than the `ds-input` next to it. Both now
  resolve `--ds-date-picker-trigger-pad-x` / `--ds-time-picker-trigger-pad-x` from the field family.

- **`ds-card`'s box fills a stretched host**, so a grid row of cards with unequal content paints equal
  heights instead of a stretched host wrapping a short bordered box. `ds-stat` already did this; cards
  needed a `::ng-deep .card { height: 100% }` from the consumer. Nothing changes where the host is
  content-sized, which is every card not in a stretching row.

- **`density="compact"` no longer defeats every `ds-table` padding hook.** It pinned `padding` straight onto
  the cells, which out-specifies the `--ds-table-cell-pad-*` and head hooks, so a compact table silently
  ignored all of them. It now retunes the same density tokens `[data-density]` uses — identical spacing
  except the empty-state cell, which keeps its own 16px padding where compact gave it 8px 12px, and the
  hooks apply.

- **`ds-date-picker`'s trigger stays visibly active while its own panel is open.** The indicator was bound to
  focus only, and opening from the calendar glyph moves focus into the day grid — so the trigger went dark
  while its panel was open, and the refocus on close made it read as a flicker.

- **`ds-table` gains a header filter pipeline and a live region for sort and row range.**
  — **`filterMode: 'client' | 'server' | 'none'`**, mirroring `sortMode` — it shipped defaulting to
  `'client'` and the default was flipped to `'server'` later in this same release, above — plus
  **`columnFilterOptions`** for the real value domain. A header filter on a server-paged table was wrong
  twice over: the checklist could only offer values from the page in hand, and the local pass then filtered
  what the server had already filtered. `'server'` tracks `columnFilters` and filters nothing; `'none'`
  drops the affordance. A dev warning catches the silent case — `filter: 'set'` with `total` bound and no
  declared mode.
  — **`dsHeaderFilter`**, a template slot for a criterion the checklist cannot express (a date range, a
  numeric threshold, an async lookup). The table keeps the header button, the popover and the active-filter
  styling; `active` on the directive tells the highlight whether your criterion is set, because only you
  know. The context carries `close`, so the panel can dismiss itself after applying.
  — **A live region for sort state and row range.** The table announced loading and nothing else, so a
  screen-reader user got no confirmation that the order changed and paging never announced the new range.
  One `role="status"` now carries both, with loading taking precedence while it lasts. `sortAnnouncement`
  and `rangeAnnouncement` take the facts and return the sentence, so translation and word order stay with
  the consumer.

- **`ds-tabs` keeps the active tab in the URL: `urlParam="tab"`.** The input both switches it on and
  names the parameter; leave it out and the URL is untouched. Names come from each `ds-tab`'s `value` —
  the identifier `tabClosed` already emits — so there is no second list to keep in step.
  — Names, not indices (`?tab=1` would repoint every old link the moment a tab is inserted); the first tab
  writes no parameter and every write replaces (clean address, and flipping tabs does not fill the Back
  button); an unknown or missing name lands on tab 0 rather than throwing. Outside a routed context the
  input is inert — the router is injected optionally, so a strip in a dialog is unaffected.

- **Options in the picker panels had no pressed state.** Hover only — so on a phone, where there is no
  hover, tapping a row in `ds-select`, `ds-autocomplete` or `ds-multi-select` gave no feedback that it had
  been hit. The equivalent rows elsewhere (`ds-menu-item`, `ds-list-item`) have had one since 0.7.x. Fixed
  once, in the option partial `ds-select` and `ds-multi-select` share, so both get it consistently, with
  a selected-row variant that stays in the brand family rather than stranding the selected label colour
  on a neutral fill; `ds-autocomplete` styles its own rows and still has hover only.

- **`ds-textarea size="sm"` and `="lg"` got the md vertical padding.** The size variants set the inner
  `<textarea>`'s vertical pad (`--space-2` / `--space-4`), but the `:host`-prefixed pin at the end of the
  file out-ranks them
  once emulated encapsulation shims both selectors: `[_nghost] .field[_ngcontent] .control[_ngcontent]
  textarea[_ngcontent]` carries one more attribute than `.field.sm[_ngcontent] …`. So every textarea
  rendered with 12px top and bottom regardless of `size`, and retuning `--ds-input-pad-y` moved all
  three. There are now three pins, one per size, and the size blocks keep
  only the horizontal padding they own. Consumers see it only on a non-md textarea; the md default is
  unchanged.

### What you can now DELETE

The half a release note usually leaves out: workarounds you may have written against hooks that
already existed, with no signal that anything had been tokenised since. None of this is required;
skipping it leaves working code that is merely redundant.

| If you have | Delete it, because |
| --- | --- |
| `.button.button.button { … }` or rules against `.v-outline` / `.c-secondary` | `ds-button` reflects `[data-variant]` and `[data-color]` on the HOST. Use `ds-button[data-variant="outline"]` |
| your own vertical-padding override on a `sm`/`lg` textarea (a `--ds-input-pad-y` retune or a local rule compensating the wrong padding) | sm/lg textareas rendered the md vertical padding; they are corrected now, so the compensation stacks on top of the fix. A deliberate global `--ds-input-pad-y` retune is a legitimate hook and stays. |
| a `height`/`min-height` pinned in a `ds-multi-select {` rule or one on `ds-autocomplete`, `ds-color-picker`, `ds-number-stepper` or `ds-split-button` to make `--ds-field-height` "work" | Those six spelled their height as the raw `--hit-*` value, so the token did nothing for them; they read the field scale now. |
| `--radius-sm: 0` to square a checkbox | `--ds-checkbox-radius` |
| `.title.title { font-size }` inside a modal | `--ds-modal-title-font-size` |
| Pagination label type overrides — a rule on `ds-pagination` setting `--ds-pagination-label-*` | `--ds-pagination-label-*` |
| `.size { display: none }` on a pager | `[showPageSize]="false"` — and it is now forwarded through `ds-table` too |
| `.actions:empty { display: none }` on a modal | The library already ships it |
| `--ds-modal-divider: transparent`, plus whatever you rewrote the modal padding to afterwards | `[dividers]="false"` — it drops the rules *and* the padding that existed to clear them |
| A defensive `:hover` rule guarding the selected dropdown row — a selector naming `is-selected` | The `:not(.is-selected)` branch already handles it |
| `ds-menu-divider { padding: 0 }` | `--ds-menu-divider-spacing`, which already defaults to 0 |
| A dozen scattered `--ds-*-radius: 0` | For a fully square brand, four lines: `--radius-sm/md/lg/xl: 0` (leave `--radius-pill`). Measured — the three ROLES alone leave the multi-select panel, menus, steppers and other surfaces that still read the raw scale rounded; they are the tool for squaring one family and keeping another. Worked example on the Theming page |
| A global rule squaring `.ds-overlay-pane` | Radius and elevation roles now travel onto portaled panes when the host overrides them |
| Absolutely positioning a search glyph over an autocomplete, or hiding `.autocomplete-chevron` | `dsAutocompletePrefix` and `[showChevron]="false"` |
| Querying the autocomplete's inner `<input>` and dispatching a synthetic `input` event to clear it | `clear()` |
| A hand-built KPI tile — a `kpi` block pairing your own markup with `ds-badge`, where `ds-stat` now fits | `ds-stat` takes a projected `[dsStatValue]` |
| A pinned `--ds-search-height` (or any sibling) to get a shorter control row | `data-density="compact"` on the root element — every field control is 32px there, measured; `--field-h-*` resolve on `:root`, so an inner container keeps 40px |
| A hand-rolled `.scrim` + `.panel` dialog, written because the modal header could not hold a badge or a second line | `ds-modal` projects `[title-badge]` and takes a `subtitle`. You get back the focus trap, focus restore, the scroll lock, Escape and the footer |
| `[value]="f.x().value()" (valueChange)="f.x().value.set($event)"` on every field of a signal form | `[formField]="f.x"` — the control implements the contract already |
| `white-space: normal` forced onto a badge in a table cell | `--ds-badge-white-space` |
| `::ng-deep .card { height: 100% }` for equal-height cards | The card's box fills a stretched host on its own |
| `!important` on a `--ds-table-cell-pad` override under `density="compact"` | Compact no longer out-specifies the padding hooks |
| A wrapper around `ds-table` for sort/range announcements, a `role="separator"` resize handle, or a header filter the checklist cannot express | All three ship: the live region, the `role="separator"` handle, and `dsHeaderFilter` |
| `new Event('input'`, `dispatchEvent`, `querySelector` | Querying the autocomplete's inner `<input>` and dispatching a synthetic `input` event to clear it Replace with: `clear()`. |
| `--ds-autocomplete-input-minw` | A --ds-autocomplete-input-minw override, written to hide the empty filter box that sat beside a chosen value in single mode. The input collapses on its own once a value is picked and the panel closes. Replace with: nothing - unless you genuinely want a wider typing area. |
| `.trigger`, `:focus-within`, `ds-date-picker` | A :focus-within rule on the date-picker trigger, written because the trigger went dark while its panel was open. The component keeps an "open" class alongside the focus rules now. Replace with: nothing - the component holds the indicator itself. |
| A wrapper around the export button catching a rejected `exportFetcher` — a `try {` / `catch` around it | ds-table emits `(exportFailed)` now. Replace with: bind (exportFailed) on ds-table. |
| Your own live region around `ds-table` — an `aria-live` or `role="status"` element announcing sort state or row range | The table announces both through its own role="status" region, so keeping yours announces every change twice. Replace with: nothing - retune the wording through sortAnnouncement and rangeAnnouncement. |

**To sweep for the rest:** grep your styles for `::ng-deep`, `!important` and any selector naming a
DS internal class (`.button`, `.trigger`, `.option`, `.modal`). Each hit is either a row above or a
genuine gap worth reporting.

## 0.8.0 — 2026-08-05

### Added

- **`ds-icon-button` forwards `ariaExpanded` and `ariaControls` to its inner `<button>`, and `ds-button` gains `ariaControls`.** A trigger that opens a panel has to announce state on the element a screen reader focuses; set on `<ds-icon-button>` itself those attributes land on the wrapper, which is not focusable and is never read. `ds-button` already forwarded `ariaExpanded`; the pair is now complete on both.
- **`LayoutScrollService` exposes its scroller and an absolute `scrollTo(top)`.** A scroll-spy or a virtualizer inside `ds-app-layout` needs the content region to measure against, and the only way to get it was `document.querySelector` against the layout's internal markup — a consumer reaching into DS internals for something the DS already holds. `scrollTo` assigns `scrollTop` rather than calling `scrollTo({ behavior })`, so a themed `scroll-behavior: smooth` cannot turn a positioning jump into an animation.
- **`dsRailTrigger` wires a consumer's own burger to the overlay rail.** The responsive rail shipped with `role="dialog"`, `aria-modal` and a focus trap, but nothing connected it to the button that opens it — the burger lives in the consumer's projected topbar, so it announced no state and no relationship. Put the directive on the burger and it toggles `[(railOpen)]` and keeps `aria-expanded` and `aria-controls` correct. Both attributes are dropped while the rail is not an overlay, where `aria-expanded="false"` would contradict what the user sees. A directive rather than a documentation note because these are exactly the attributes a consumer forgets. `ds-app-layout` also exposes `railId` and the read-only `railOverlay` signal for a consumer that builds its own trigger.

- **Overlay panels fade out when DISMISSED, and still close instantly when you choose something.** Floating
  panels (select, autocomplete, multi-select, both pickers, colour picker, popover) have closed instantly
  since the unconditional leave animation was cut, because ~120ms of fade after picking an option reads as the
  panel lagging behind a decision already made. A dismissal is the opposite: Escape, a press outside or the
  page scrolling away produced no result, so the fade reads as the panel backing out rather than as delay.
  Teardown now takes that cause — `'select'` (the default, instant) or `'dismiss'` — and each
  panel passes `'dismiss'` from exactly its Escape / outside-press / scroll paths. Tab still closes instantly,
  because a fading panel must not linger behind moved focus.
  — Tunable through `--ds-overlay-leave-duration` / `-easing`, defaulting to the `--ds-motion-exit-*` role.
  Reduced motion zeroes the duration at `:root`, so the animation still runs and still drives teardown. A
  fading panel is `pointer-events: none`, so it cannot swallow a click aimed at what is behind it.

- **`ds-checkbox`, `ds-switch` and `ds-radio` now RENDER a projected caption, and expose its colour and
  size.** `<ds-checkbox>I accept the <a …>Terms</a></ds-checkbox>` — the first thing a consumer tries, and
  the idiom every other body-bearing DS component accepts — used to render a control with no caption at all:
  no error, nothing in the types. 0.7.1 added a dev warning; this makes the markup work. `[label]` stays the
  documented API and still wins when both are given. One difference worth knowing: the required asterisk
  comes with `[label]` only, because a projected caption's own markup is the only thing that knows where the
  marker belongs.
  — New hooks: `--ds-checkbox-label-color` / `-label-font-size`, the same pair on `ds-switch`, and
  `--ds-radio-label-font-size` (`--ds-radio-label-color` already shipped). The font-size hook beats the size
  class, so setting it pins the caption regardless of `size`. These are deliberately NOT part of the
  `--ds-field-label-*` contract: a label above an input is a heading for the field and reads secondary, while
  a caption beside a checkbox is the content being agreed to and reads primary — routing them together would
  put "Remember me" in uppercase in any brand that sets `--ds-field-label-transform`.
- **`ds-table` renders only the rows in view: `[virtualScroll]="true"` + `virtualRowSize`.** The body used to
  `@for` over every row of `data()`, so 10 000 rows tanked scroll and paint. Virtual mode keeps ~25 rows in
  the DOM regardless of the row count, padding above and below with two spacer rows that stand in for the
  rest — so the scrollbar still spans the whole data set. Needs `maxHeight`: a bounded scroller is the
  viewport it windows against, and without one nothing is virtualized (dev-warned).
  — **NOT the CDK virtual-scroll viewport**, deliberately. That arrangement wraps the table in a transformed
  content wrapper, and the transform creates a containing block that breaks both the sticky header and the
  sticky first column this table already has. Spacer rows leave the existing scroller — and everything
  sticky in it — untouched.
  — Uniform row height is the precondition, not a preference: `virtualRowSize` is the only thing telling the
  arithmetic where a row starts, so one row that grows puts every offset below it out by the difference.
  Virtual mode therefore drives the CSS row height from that same input, forces `table-layout: fixed` (auto
  layout re-measures against whichever rows are rendered, and the columns twitch as you scroll) and keeps
  cells to one line. Row EXPANSION is suppressed with a dev warning; `pageSize` alongside it is warned about
  too, since virtual scrolling is what pagination was for. Sorting, filtering, selection, sticky header,
  sticky first column and column resizing all keep working.
  — Zebra striping switches from `:nth-child` to an absolute-index class while windowing: a rendered row's
  parity depends on its real position, and the spacer rows are children too.
- **`ds-filter-bar` — a Priority+ filter row: as many filters as fit, the rest behind "+N more".**
  Every admin list past three filters hits the same wall — the row wraps to a second line on a laptop, or
  the consumer hand-rolls an overflow menu. Each filter goes in an `<ng-template
  [dsFilterItem]="180">`, and the split is decided from those declared widths plus one
  `ResizeObserver` on the row. Never by measuring the filters: they would have to be in the DOM to be
  measured, so anything that did not fit would flash into view before being taken away.
  — A template rather than plain projection because the bar has to MOVE what does not fit into the panel,
  and projected DOM cannot be relocated. Consequence worth knowing: crossing that boundary destroys and
  re-creates the view, so a control's internal state (an open dropdown, focus) does not survive a resize
  that collapses it — its value does, because that lives in the consumer's own signal or form control.
  — The declared width is a contract, not a hint: the slot is sized to exactly that number, so the
  arithmetic is true by construction and a filter is the same width in the panel as in the row.
  — Mark trailing controls with `dsFilterBarTrailing` (search, a Clear button) rather than wrapping them:
  the bar owns that group's gap and alignment, and a projected wrapper would be a plain block whose children
  stack. The group sits outside the measured row, so flexbox subtracts its width before the row is measured.
  — The trigger carries the count as text plus `aria-expanded`, and the panel is a focus-trapped
  `role="dialog"`. There is exactly one copy of each filter in the accessibility tree, because filters MOVE
  rather than being rendered twice and hidden — the usual implementation of this pattern needs `aria-hidden`
  bookkeeping to compensate. `moreLabel` and `panelLabel` are there for translation.
  — Both slots collapse when nothing lands in them (`:not(:has(*))`, not `:empty`, which a single whitespace
  text node defeats): an empty flex child would still take the row's gap. Dev-mode warning when content
  reaches the bar carrying neither slot marker, since such content is silently dropped.
- **`ds-auth-shell` — the scaffold for the screens in front of the login, counterpart to `ds-app-layout`.**
  Consumers hand-rolled the unauthenticated scaffold every time, and it is the same four parts in each: a
  brand lockup, an optional tagline, one card holding the form, and a support line under it. The brand row
  is the sidenav's row — same `brand` / `logoLetter` / `[dsBrandName]` contract and the same letter-mark
  tile, so the mark on the login screen is the mark in the rail afterwards. The accent colour on the
  wordmark comes from the same projection rather than from splitting a string, so there is no guessing
  where the accent belongs.
  — The card body is the default slot, the support line is `[dsAuthSupport]` (a real `<footer>`, so it
  carries the `contentinfo` landmark), and both the tagline and the support line collapse when absent
  rather than leaving an empty flex child that would take the column's gap and push the card off centre.
  — `cardElevation` / `cardPadding` pass through to `ds-card`; `--ds-auth-shell-min-height`,
  `-card-max-width`, `-gap`, `-bg-color` and the two `-mark-*` colours are the public hooks.
  — The host is the ONLY full-height box: nesting a `100vh` wrapper inside a `100dvh` one scrolls a page
  whose content fits. It also carries `env(safe-area-inset-*)` so a notched phone in landscape does not
  put the card under the cutout. Inside it the column centres with auto margins rather than centre
  alignment — identical while the host can grow, but not when it cannot: embed the shell at
  `--ds-auth-shell-min-height: 100%` in a fixed-height parent and centre alignment puts a form taller than
  the box above the scroll origin where no scrolling reaches it, while auto margins collapse to zero and
  pin it to the padding edge.
- **`ds-password-rules` — the live requirement checklist under a new-password field.** A password policy
  screen tends to get hand-rolled more than once, and the copies drift: different labels for the same
  rule, a different order, different state class names. Each rule carries its own `test`,
  because the POLICY has to mirror the server and only the consumer knows it; the component owns the
  tri-state glyph, the met/failed colours and the type scale. A rule that has not passed reads as PENDING
  and only becomes a failure once `[showUnmet]` is true — bind that to "the user has tried to submit", or a
  half-typed password scolds someone who is still typing. `[columns]="2"` for a checklist beside a wide
  form, and `metCount` / `allMet` are exposed for a host gating its own submit — or import the standalone
  `passwordRulesMet(value, rules)`, the same predicate that backs `allMet`, to gate a submit without
  rendering the list at all. `[listId]` names the `<ul>` so a field's `aria-describedby` can point at it,
  and `DsPasswordRule` (`{ label, test }`) and `DsPasswordRuleState` (`'pending' | 'met' | 'failed'`) are
  exported for typing the rule set.
- **`ds-input` takes `ariaDescribedBy`, MERGED with its own message id.** Needed by the rule list above,
  and by any policy note: setting `aria-describedby` on `<ds-input>` by hand lands on the wrapper, which no
  screen reader reads, and replacing the attribute would have dropped the field's own hint/error
  association. The input joins both ids instead.

- **`ds-table` persists the column layout and can render its own export button.** The three column models
  — order, widths, hidden columns — were two-way with nothing storing them, so every consumer wrote the
  same `localStorage` effect keyed by a screen id, and `exportCsv()` was a public method with no
  affordance to trigger it from.
  — `[persistLayout]="true"` + `storageKey` round-trip `columnOrder`, `columnWidths` and `hiddenKeys`
  through `localStorage`. Both are required: without a key there is nothing to identify a screen by and two
  tables would overwrite each other, so a missing key stores nothing rather than guessing. Only what was
  actually saved is applied, so a table nobody has rearranged keeps its declaration order and `hidden`
  flags.
  — `[exportButton]="true"` renders the CSV button; `exportFilename` names the file and `exportFetcher`
  covers the server-paged case — a table that only HAS the current page would otherwise export one page and
  call it the export, so the button awaits the fetcher and disables itself while it runs. `exportCsv()`
  stays public for a consumer’s own button and now takes an optional row set.
- **Focus-indicator style is a one-place switch: `<html data-focus="ring | field | edge | outline">`.**
  The library shipped two fixed families — a soft halo on fields, a crisp double ring on controls — with no
  way for a brand to choose. Since 22 components already resolve through `--ds-field-focus-shadow` /
  `--ds-control-focus-shadow`, the switch simply retargets those roles: `ring` and `field` make both groups
  match, `edge` is a hairline flush against the element, and `outline` swaps to a real `outline` — which a
  box-shadow token cannot express, so that style also emits a zero-specificity `:where(:focus-visible)`
  rule. Omit the attribute and today’s split is unchanged.
- **Focus survives Windows High Contrast.** Forced-colors mode DROPS `box-shadow`, so a shadow-only
  indicator vanished entirely and a keyboard user in that mode had nothing to follow — a real a11y gap, now
  closed once for every style with a `CanvasText` outline under `@media (forced-colors: active)`. A system
  keyword rather than a brand colour, because forced-colors replaces the palette.
  — Both the switch and this fallback live in the new `styles/_focus.scss`, forwarded into the bundled
  `styles/ds` entry, so a consumer of that entry gets both automatically. A consumer who `@use`s DS
  partials individually gets NEITHER until they add `@use 'styles/focus';`.
- **A role layer between the foundation scales and the components: radius, elevation and motion.** Reading
  the raw scale directly meant a consumer could not re-round "panels" without also re-rounding every
  control that shared `--radius-md`, could not lift every overlay without touching each surface, and could
  not make panel entrances snappier without retuning each one. Every role defaults to the value its members
  already used, so nothing moves until a role is set, and a per-component `--ds-<comp>-*` override still
  wins over its role.
  — **Radius:** `--ds-radius-inner` (the checkbox box, option rows, tags), `--ds-radius-control` (buttons,
  field frames, picker triggers, tooltips), `--ds-radius-panel` (menus, popovers, cards, modals, drawers),
  `--ds-radius-pill`. No `field` role: fields share `--radius-md` with buttons, so one would either
  duplicate `control` or silently re-round every field — scope the role instead
  (`ds-input { --ds-radius-control: 4px; }`).
  — **Elevation:** `--ds-elevation-raised` / `-overlay` / `-floating` / `-modal`. Four roles: the
  library genuinely uses four heights, and folding toast into `overlay` would have changed its
  shadow. The older `--shadow-popover` / `-modal` / `-toast` / `-card` aliases now point AT the
  roles, so either name works — a role moves every surface at that height, an alias retunes one
  family.
  — **Motion:** `--ds-motion-enter-panel-*`, `-enter-surface-*`, `-enter-large-*`, `-exit-*`,
  `-exit-large-*` (duration + easing each). Five roles, not four: panel LEAVES run at `--duration-base`,
  not `fast`, so folding them into `exit` would have sped them up. `ds-loading-overlay` and the toast leave
  stay on the raw scale — they use `--ease-standard`, which no role carries, and a role for two sites would
  be worse than naming the value.
- **`ds-app-layout` restores the reader's scroll on the way BACK: opt-in `restoreScroll` +
  `restoreScrollTimeout` (2000ms).** List → details → back returned the list to the top, because a real
  back IS a path change and the layout resets on those. Off by default — a layout that silently moved the
  scroll would surprise every existing consumer. Restores only when ARMED, which is the whole design: a
  history traversal (back, forward, the mouse side button, `Alt+←`, an edge swipe — all arrive as
  `popstate`), a host whose own "back to list" adds a history entry instead of traversing and says so with
  `state: { dsRestoreScroll: true }`, or the first navigation after a reload. Following a link into a new
  screen still lands at the top.
  — The offset is remembered per PATH in `sessionStorage` (one namespaced blob, 20 entries, oldest first,
  every access guarded — Safari private mode throws on write). Restoring waits for the content to grow via
  `ResizeObserver` rather than counting frames, clamps to what the content allows at the deadline (a list
  that loaded 8 of 40 rows still lands near the reader's row), and cancels on `wheel` / `touchstart` /
  `keydown` — input events only, since our own restore writes emit `scroll`. It never touches
  `history.scrollRestoration`, and it bails on a bfcache restore, which brings its own position back.
  — `LayoutScrollService` gained `contentReady()` (optional: end the growth wait early when your data has
  arrived) and `consumePendingOffset()` (take the offset and cancel the restore — for a virtualizer, which
  needs it BEFORE deciding which rows to build).
  — **Interaction worth knowing:** an app that scrolls on navigation itself — a docs shell whose URL names a
  section, an anchor jump — writes after the layout does and therefore wins. That is the right precedence,
  and it means `restoreScroll` is a no-op on those routes rather than a fight.
- **`ds-button` type and box hooks: `--ds-button-font-size` / `-weight` / `-tracking` / `-height` /
  `-pad-x` / `-pad-y`, plus `data-variant` / `data-color` reflected on the host.** The label type and the
  box were hard-coded, and the size class pinned `height` and `padding`, so a brand wanting 14px/600
  buttons sized by their own padding had to write `.button.button.button { … }` to out-rank the shimmed
  `.button.md` (0,3,0). The hooks follow the read-never-declare rule the colour resolvers already use, and
  each size class re-resolves them with the hook still first — so `--ds-button-height` beats the size it
  would otherwise pick instead of being undone by it. The reflected attributes let a consumer target one
  axis from outside (`ds-button[data-variant="outline"] { --ds-button-border: white; }`) without reaching
  for the `c-*` / `v-*` classes, which sit on the inner `<button>` and are not addressable from a
  host-scoped rule.
- **`--ds-field-height` — one control-box height for the field family, and the `--field-h-*` scale is
  finally the knob its name advertises.** `--field-h-sm`/`-md`/`-lg` have shipped as the field height
  scale for as long as the token file has existed, but only `-lg` was ever read: `ds-input`, `ds-select`,
  `ds-date-picker` and `ds-time-picker` all spelled the other two out as the raw `var(--hit-min)` /
  `var(--hit-cozy)`. Retuning `--field-h-md` therefore changed nothing — a lever that looked live and was
  not. All four now resolve through the scale (identical values, so nothing moves while `[data-density]`
  sits on the root; under one set on an inner element, md and sm fields now keep the root's height,
  because the scale resolves on `:root`), and `--ds-field-height` overrides the resolved size for a
  consumer who wants one height regardless of `size`; scope it per component the usual way
  (`ds-select { --ds-field-height: 44px; }`).
- **One label contract for the whole field family: `--ds-field-label-font-size` / `-weight` / `-color` / `-transform` / `-tracking`.** Five components hard-coded the identical label rule and only `ds-input`
  had hooks, so a form mixing a select with an input rendered labels in two sizes and colours once the
  input's were retuned, and retuning them from an app needed `.field.field .label.label, .select-label.select-label` to
  out-rank the shimmed component rule. `input`, `textarea`, `select`, `date-picker`, `time-picker` and
  `radio-group` now resolve through one mixin and one token set. No per-component token set is needed —
  custom-property scoping already narrows a retune to one component (`ds-select {
  --ds-field-label-transform: uppercase; }`), and `-transform`/`-tracking` make the
  uppercase tracked editorial label reachable through tokens for the first time. `ds-input`’s older
  `--ds-input-label-color`/`-fs`/`-fw` still win where set, and now fall through to the family token
  instead of straight to the raw scale.
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

### Changed

- **`ds-table`’s `clientSort` is replaced by `sortMode: 'client' | 'server' | 'none'`, and the
  default flips to client sorting.** The boolean could not express "nothing sorts", so a column
  marked `sortable: true` on a table with no sorting drew a header that looked live, showed a caret
  on hover and did nothing when clicked. An enum makes that state unrepresentable: `'none'` now
  renders the header as plain text, with no button, caret or `aria-sort`. Unset resolves to
  `'client'`, so `sortable: true` always does something; a server-sorted table declares `'server'`,
  which is the side that actually knows it wants server sorting. **Migration is mechanical except
  for one case:** a table that previously bound no `clientSort` and reordered in its own
  `(sortChange)` handler must now declare `sortMode="server"`, or it will sort locally as well. For
  a server-PAGED table (one that binds `total`) that is worse than a dead header, because only the
  current page reorders and the rows look sorted without being sorted — so dev builds warn on
  exactly that combination: `total` bound, sortable columns, `sortMode` never declared. The union is
  exported as `TableSortMode`, so a host that keeps the mode in a signal or computed can type it
  instead of repeating the literals.

- **A `ds-menu` row's hover fill is square and runs edge to edge.** The row carried `--radius-md`, the
  same 8px the standalone menu panel uses, while sitting flush inside it — and inside a `ds-popover`,
  which drops its padding for a menu, that 8px sat against the popover's 12px corner and left visible
  slivers at the top and bottom of the list. A curve at zero inset can never be concentric with the
  panel's, so the row is now square and the panel clips it: `ds-menu` drops its own `padding` and gains
  `overflow: hidden`, which is what rounds the first and last row. To keep the old rounded highlight,
  set the new hook — `ds-menu { --ds-menu-item-radius: var(--radius-md); }` — and note the panel no
  longer insets the rows, so a radius there reads best with a padding of your own.
- **`ds-radio-group`’s label now looks like every other field label.** It was the one component drawing
  its own type (`medium` weight at `--font-size-s` on `--line-height-flat`) rather than the family’s
  `bold`/`--font-size-xs`; in a form beside an input or a select it read as a different kind of thing.
  Restore the old look with `ds-radio-group { --ds-field-label-weight: var(--font-weight-medium); --ds-field-label-font-size: var(--font-size-s); }`
  and `ds-radio-group > .label { line-height: var(--line-height-flat); }`: the label now sits on
  `--line-height-base`, which has no hook.
- **Fields no longer expose a `protected messageState`;** the resolved `message` (text + state) and
  `invalidResolved` replace it. Only reachable by subclassing a field component, which is not a
  supported extension point, but noted for parity with the class-member changes in 0.7.0.
- **The `ds-time-picker` panel lost its corner radius.** It had drawn `--radius-md` (8px) while every
  other floating surface — popovers, cards, modals and `ds-date-picker`'s own calendar — resolves the panel
  role. The move onto that role reads a private `:host` token, which a CDK-portaled panel cannot see, so
  `border-radius` resolves to its initial `0` and the panel renders SQUARE. The new
  `--ds-time-picker-panel-radius` hook is inert for the same reason. Force the corner back with a global
  `.cdk-overlay-container { --_time-picker-panel-radius: var(--radius-md); }`. It declares the
  private token the panel already reads on an ancestor the panel DOES have, so it inherits down;
  fighting the component’s own rule with a selector is not needed. A rule scoped under
  `ds-time-picker` cannot reach the portaled panel at all. The trigger's radius is untouched.

### Fixed

- **Two leftover `--combobox-*` tokens renamed to `--picker-*`.** `--combobox-offset` and
  `--combobox-maxh` size the listbox panel shared by `ds-autocomplete` and `ds-multi-select`, and survived the
  `ds-combobox` → `ds-autocomplete` rename carrying the name of a component that no longer exists. Now
  `--picker-offset` / `--picker-maxh`. These are global scale tokens rather than `--ds-*` component tokens, so
  the blast radius is anyone who happened to override them — rename the override. Choosing between the two: the LIST decides, not the count — typing is how you
  narrow a set too large to scan, while a checkbox list shows the whole choice and what is NOT selected.
- **A `required` `ds-time-picker` in `mode="range"` never announced as required.** `aria-required` was on the
  single-mode trigger only, so a screen-reader user on a range field was not told either segment was
  mandatory. Both segments now carry it. (Their accessible NAME was already correct — each announces the
  field's own label plus "(from)" / "(to)".)
- **`ds-table`: with `stickyHeader` and `stickyFirstColumn` together, the first body row painted OVER the
  header.** `--table-sticky-corner-z` exists so the corner where both sticky axes meet sits above the body's
  pinned cells, but the sticky-header rule out-specified it, leaving the pinned header cells at the same
  z-index as the pinned body cells — and on a tie DOM order wins, so the body won. The header row read as
  the first row's data in the pinned columns, on any tall table with both flags set. The sticky-header rule
  now leaves the pinned cells' z-index to the corner token.
- **`ng add` never ran its schematic — in any released version.** The package is `"type": "module"` while
  the compiled schematic is CommonJS, so Node refused to load it (`exports is not defined in ES module
  scope`) and the DS global styles were never wired automatically; every consumer either added the `@use`
  line by hand or shipped without the styles. The schematic is now authored as `.cts` and ships as
  `.cjs`, which Node loads correctly under `"type": "module"`, so `ng add` wires up the global styles
  as documented.
- **`ds-menu-divider` added a gap on top of the menu's own row rhythm, so a separated group read as a hole.** The divider carried `padding: var(--space-1) 0` while `ds-menu` already spaces its rows with `gap: var(--space-0-5)`. The two stack: adjacent menu items sat 2px apart while the divider produced 6px + line + 6px, tripling the local rhythm exactly where the eye reads a boundary. Menu items already carry their own `8px 12px` padding, so the line needs no help to separate. The default padding is now **0** — the line takes one row's place instead of adding a second gap — and a menu that genuinely wants divider *plus* air opts in with the new **`--ds-menu-divider-spacing`** token. This follows the direction the platforms took: Material 3 Expressive treats "with gap" as a device SEPARATE from "with divider" rather than bundling them, and Angular Material exposes the same spacing as tokens (`--mat-menu-divider-top-spacing` / `-bottom-spacing`) after shipping it baked in. Visual-only, and only for menus that use the divider.
- **`ds-table` gave the page a second scrollbar when it sat below the fold.** Its host was `display: block` with no `position`, while the `.visually-hidden` nodes it renders — the caption, the two `role="status"` announcers and the per-header sort-state spans — are `position: absolute`. With no positioned ancestor they resolved against the initial containing block, so each one contributed its layout offset to the DOCUMENT's root scroller: a consumer whose shell is `100vh` + `overflow: hidden` with one inner scrolling region got a phantom second scrollbar beside it, growing with how far down the page the table sat. The host is now `position: relative`, which brings the root scroller's overflow back to 0 and leaves only the app's own region scrolling. Nothing else moves: the SR nodes stay 1×1 and clipped, and the overlays that must escape the table are portaled rather than absolutely positioned inside it.
- **A nested `ds-app-layout` opened its rail whenever an OUTER one was open, and its scrim swallowed the clicks meant for the outer.** The open state was written as `:host(.rail-open) &`, which Angular's emulated encapsulation compiles to a DESCENDANT selector — and every instance of a component shares one encapsulation attribute, so `.rail-open[_nghost-x] .rail[_ngcontent-x]` matched the rail of every layout nested inside an open one. Two layouts on a page (a docs shell holding a demo, an app holding a preview pane) opened and closed in lockstep, and clicking the backdrop hit the inner layout's scrim, whose `closeRail()` was a no-op. The state now lives on the elements it styles (`.rail.open` / `.scrim.open`), where a selector cannot reach across host boundaries.
- **The overlay rail escaped its layout and covered the whole window.** Below `lg` the rail is `position: fixed`, which resolves against the viewport, so a layout embedded in a page threw its rail over the top-left of the window instead of its own box, and multiple embedded layouts on one page each stacked a full-page scrim. The rail and scrim are now `absolute` against a `position: relative` host, which is identical for a full-viewport shell and correct for an embedded one.
- **A nested `ds-app-layout` could paint its rail OVER the outer shell's.** The rail sits at
  `--layer-drawer` and its scrim one below; `position: relative` alone still left every layout resolving
  that layer in the one root stacking context, so an inner layout's rail could stack above an outer
  layout's open rail instead of beneath it. The host now sets `isolation: isolate`, giving each
  `ds-app-layout` its own stacking context — the same fix `ds-drawer` already carries. Nothing changes
  for a full-viewport shell with no layout embedded inside it.
- **A path change that only mirrors the reader's position no longer resets the content scroll.** A docs shell whose scroll spy rewrites `/area/section` as the user scrolls hit a loop: the rewrite looked like a page change, the layout scrolled to top, the spy saw the first section again and rewrote the path back. Such a navigation must now carry `state: { dsSamePage: true }`, which the layout skips for both the scroll reset and the rail close. Read from `Router.lastSuccessfulNavigation()` — `getCurrentNavigation()` is already cleared when `NavigationEnd` reaches a subscriber.
- **Closing the rail by NAVIGATING no longer pulls focus back to the burger.** Restoring focus to the trigger is right for a dismissal — Escape, the scrim — and wrong for a link: the reader activated it, so focus belongs wherever the router put it, and handing it back announced "Open navigation" instead of the page they asked for. Dismissal keeps the restore; the navigation and breakpoint paths now clear `railOpen` directly. The breakpoint path had also depended on `compact` being written one line earlier to avoid focusing a trigger that is hidden on desktop — that ordering trap is gone with it.
- **A closed compact `ds-app-layout` rail no longer holds focus behind the screen.** Below the
  breakpoint the rail is translated off-canvas, which hides it visually and not at all from
  assistive tech: it kept `role="dialog"` + `aria-modal="true"`, every nav link stayed tabbable, and
  the caret stayed inside the hidden panel after Escape or a scrim click — `cdkTrapFocusAutoCapture`
  hands focus back only when the directive is DESTROYED, not when it flips off — so the next Tab
  continued from invisible navigation with no visible focus ring. The closed overlay rail is now
  `inert`, and closing it returns focus to whatever control claims the rail through `aria-controls`,
  which both `dsRailTrigger` and the DS-button forwarding (`[ariaControls]="shell.railId"`) already
  set. At/above the breakpoint nothing changes — the rail stays in the layout and interactive.

- **`--ds-overlay-enter-scale` now reaches the portaled panel, so `ds-scale-in` can be retuned per
  instance.** The token was declared and resolved on the pane but missing from the set forwarded onto it, so `ds-select { --ds-overlay-enter-scale: 0.9; }` did nothing while
  the other four enter tokens worked. Covers every overlay panel
  (select, multi-select, autocomplete, date / time / colour picker, popover, tooltip, menu submenus). A
  global override always worked and is unaffected.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround this release made unnecessary. Generated from the `deleteList` in `migrations/0.8.0.json`.

| If you have | Delete it, because |
| --- | --- |
| `.pin-first`, `.pin-select`, `--table-sticky-corner-z`, `sticky` | A consumer z-index on DS table cells, raised to stop the first body row painting over the header when stickyHeader and stickyFirstColumn were both on. The sticky-header rule out-specified --table-sticky-corner-z and both landed on the same z-index; that is fixed in the component. Replace with: nothing - the component orders the layers itself. |

## 0.7.1 — 2026-08-04

### Added

- **`TableColumn.sortValue` — sort a column by its DOMAIN value instead of the rendered text.** Without
  it `clientSort` compares what the cell displays, so `$1.2M / $840K / $95K` sorted by the leading
  character and `Oct 09, 2023 / Feb 27, 2024` sorted by month NAME: the table looked sorted and was not,
  which is worse than leaving it unsorted. Pass an accessor per column —
  `{ key: 'amount', label: 'Amount', sortValue: (row) => row.amountCents }` — returning a number, `Date`
  or plain string. A consumer that had to re-parse its own rendered output — sniffing currency,
  percents and date formats — can delete it. Only affects sorting: the header filter still lists
  what the user can see. Columns with plain numeric text already sorted correctly and need nothing.

- **`ds-checkbox`, `ds-switch` and `ds-radio` warn in dev when a caption is projected instead of passed.**
  `<ds-checkbox>Accept the terms</ds-checkbox>` renders no caption — the text comes from `[label]` only —
  and it failed silently: no error, no warning, nothing in the types, so nothing caught it short of
  opening the rendered page. All three share that contract, so all three now log which component
  swallowed the text. Production is untouched: the probe that detects it is rendered only under
  `isDevMode()`, so no extra node ships. A projected caption still renders nothing.

- **`ds-app-layout` collapses its rail to an off-canvas overlay below `lg`.** On narrow viewports the
  rail no longer occupies a grid column: below the `lg` breakpoint (read at runtime from `--bp-lg`) it
  leaves the flow, becomes a `position: fixed` panel translated off-canvas, and animates in over a
  scrim. A new two-way `[(railOpen)]` model drives it (ignored at/above `lg`), and a
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
  not wired to the label yet. Measured on a two-column probe, date vs time now differ by 0px on label
  top/height, trigger top/height/bottom, value inset and glyph top.

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

- **Four override tokens that were previously hardcoded:** `--ds-modal-title-font-size` (pairs with the
  existing `-title-weight`), `--ds-date-picker-trigger-radius` (the counterpart of
  `--ds-time-picker-trigger-radius`), `--ds-date-picker-panel-radius` (forwarded onto the portaled pane),
  and `--ds-checkbox-radius` (the box only — the indeterminate dash keeps its own). `ds-menu` gains
  `--ds-menu-max-width`, defaulting to `none`, where it had no max-width. `ds-toast` also gains `--ds-toast-min-width` / `--ds-toast-max-width` as per-instance hooks over the
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
  too, but must be declared in GLOBAL styles: emulated view encapsulation renames keyframes defined in a
  component stylesheet. `none` disables an entrance.
  All defaults are unchanged. Leave keyframes are deliberately not swappable — modal/drawer/bottom-sheet
  teardown matches them by name — and reduced motion still wins: the library zeroes the duration itself,
  so a custom entrance carrying its own timing is silenced too. New: `styles/_surface-motion.scss`
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
  stack read as a ~39px hole. The resolution chain gains a config step — per-field input, then
  `DS_CONFIG.field.reserveMessage`, then the default — and the final fallback flipped, so all 14
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
  trigger left the value + glyph packed at the left (the glyph sat 122px short of the right edge on a
  274px field), so a full-width date field did not line up with the time picker or a `ds-select` beside
  it.

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

- **À la carte imports were missing the overlay-panel entrance.** If you import partials individually
  rather than the bundled `styles/ds` entry, add `styles/overlay-motion` — without it, portaled panels
  (select, popover, tooltip, menu submenus, and more) will not animate.

- **Dialogs opened through `ModalService` no longer carry the `ds-overlay-pane` panel class.**
  `ModalService.open()` — and therefore `confirm()` — tagged the CDK overlay pane with `ds-overlay-pane`,
  which layered the shared overlay-panel entrance onto the modal on top of its own card/backdrop
  animation; the class is dropped, so `styles/overlay-motion` no longer applies to the pane and the modal
  plays only its own `--ds-modal-*` entrance.

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround this release made unnecessary. Generated from the `deleteList` in `migrations/0.7.1.json`.

| If you have | Delete it, because |
| --- | --- |
| `[reserveMessage]="false"` | The default is FALSE again, so an opt-out binding only restates it - unless the field sits under a `dsReserveMessages` host or an app config that turns it on, where the binding is still the way back out. Replace with: nothing - delete the binding where no host reserves. |
| `gap: var(--space-1)`, `margin-top: -` | A tighter sub-stack or a negative margin added to swallow the reserved message row is now over-tightening a form that no longer reserves it. Replace with: the normal 16px field stack. |
| `ds-pagination`, `ds-field-message` | A rule hiding the empty message row inside the pagination rows-per-page select. The component pins that select to its own compact shape now, so the row is gone at the source. Replace with: nothing - delete the rule. |

## 0.7.0 — 2026-07-30

### Added

- **New override tokens for two baked-in weights: `--ds-sidenav-item-label-weight` and
  `--ds-modal-title-weight`.** The nav-item label weight and the modal title weight were locked inside a
  `font:` shorthand with no `--ds-*` hook; a brand can now retune either without reaching past the public
  token contract. Defaults unchanged (`--font-weight-semibold` / `--font-weight-bold`).

- **`ds-table` gains an opt-in `scrollToTopOnPageChange` input.** With it on, changing page scrolls the
  table back into view, so paging from a bottom pager doesn't leave the viewport on the old page's rows.
  Off by default.

- **`ds-search` gains a `size` input (`sm`/`md`/`lg`, default `md`).** Search previously ignored `size`
  and its size CSS never matched, so it sat 4px taller than sibling controls in dense toolbars.
  `sm` is now 32px (matching `ds-input`/`ds-button` at `sm`); the default `md` keeps the prior 36px
  search-row height, so existing consumers are unaffected.

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

### Changed

- **BREAKING: the control `size` scale is unified into one shared `DsSize` type.** The per-component
  size types (`InputSize`, `ButtonSize`, `SelectSize`, `CheckboxSize`, `RadioSize`,
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
  DOM already states. The flush-addon layout is now derived automatically: a boxed `.addon` projected
  into `[dsInputPrefix]`/`[dsInputSuffix]` (`<span dsInputPrefix class="addon">…</span>`) sits flush via
  `:has()`, while a bare projected `<ds-icon dsInputPrefix>` correctly keeps its inset. Delete
  `[withAddon]` / `[withAddonRight]` from your templates — a boxed addon on one side renders
  identically, and a bare icon that previously (mis)set the flag regains its proper inset (a bugfix).

- **BREAKING: `ds-app-shell` is renamed to `ds-app-layout`.** The slotted fixed-frame application layout
  shipped as `ds-app-shell` in 0.6.3; this renames the selector (`ds-app-shell` →
  `ds-app-layout`), the component class (`AppShellComponent` → `AppLayoutComponent`), the exported scroll
  service (`ShellScrollService` → `LayoutScrollService`), and its four tokens (`--ds-app-shell-pad-x` /
  `-pad-y` / `-content-max-width` / `-height` → `--ds-app-layout-*`). Behaviour is unchanged — rename the
  references (see `migrations/`). A consumer still on 0.6.3's `ds-app-shell` must migrate.

- **`TableComponent` gained five more members (`total`, `sortingOrder`, `animateHeight`,
  `scrollToTopOnPageChange` and the private `parseDurationMs`), and most other component classes
  changed too**, so a consumer that extends a DS class (unsupported — `design-system.md` §
  Components) can collide on a name here as well, exactly as in 0.6.3. Same resolution: rename the subclass's own member, or add
  `override` where the base's semantics genuinely match.

### Fixed

- **`ds-menu`: disabled items are now keyboard-reachable.** A disabled `ds-menu-item` was dropped from the
  roving-tabindex nav (unreachable by keyboard) and rendered a native `disabled` button; it now uses
  `aria-disabled` and stays in the arrow / type-ahead order (ARIA menu practice), so a keyboard user can
  focus it — and a `[dsTooltip]` on it now shows on focus, surfacing a "why is this disabled" reason.
  Activation stays blocked. (That reason is not announced reliably yet: the tooltip's `aria-describedby` lands on the
  `role="none"` host, not the inner button.)

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
  and the right border), which produced a hairline horizontal scrollbar. Collapsed items now fill
  the available width, and the rail clips any residual x-overflow.

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
  cell now shows its complete text in a popover when clicked (in addition to the title
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
- **The new `ds-table` features grew `TableComponent`'s member surface by 77 names, which breaks
  a consumer that extends the class.** Everything above is additive for anyone using the
  `<ds-table>` element. Subclassing a DS component is unsupported (`design-system.md` §
  Components), but where it happens the new names collide — TS4114 demands an `override` modifier,
  TS2416 fires where the signature differs. Collisions include: `zebra`, `columnOrder`,
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

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a workaround this release made unnecessary.

| If you have | Delete it, because |
| --- | --- |
| A logo overlaid on ds-sidenav’s brand row — `position: absolute` against `ds-sidenav .brand`, written when there was no slot for one. | project it into `[brand]` |
| A scrollTop pin or a scroll-lock hack written against the content jolt an opening sheet used to cause in a shell that is a containing block for fixed descendants. | nothing - the entering panel no longer contributes that overflow |

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

### What you can now DELETE

None of this is required — skipping it leaves working code that is merely redundant. Each row is a
workaround this release made unnecessary. Generated from the `deleteList` in `migrations/0.6.1.json`.

| If you have | Delete it, because |
| --- | --- |
| `ds-date-picker`, `pointer: coarse`, `ontouchstart`, `matchMedia`, `type="date"` | A branch that swapped ds-date-picker for a native input, or disabled its masked typing, on touch devices. It existed because segment-aware editing was wired to keydown, which soft keyboards do not report faithfully; the mobile path goes through beforeinput now, so the masked field works there. Replace with: nothing - render ds-date-picker on touch as well. |

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
  `--ds-progress-bar-color-warn` → `--ds-progress-bar-color-warning`. The CSS state classes follow
  (`.danger` → `.error` on modal, modal-card, menu-item and stat; `.warn` → `.warning` on progress);
  every default value is otherwise unchanged.
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
  to hover; active now mixes that tint ~10% toward black for a distinct pressed step
  (`--ds-button-bg-color-active` restores the old one).
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
  left at the cozy defaults, so those controls didn't shrink with the tier. Its switch goes from
  24×20 px with a 12px thumb to 24×14 px with a 10px one (`--switch-track-h` /
  `--switch-thumb-size` / `--switch-thumb-travel`). The rest go from the root 32px / 6px / 8px /
  240px / 8px to `--avatar-md` 20px, `--badge-dot-size` 4px, `--status-dot-size` 5px, `--sidenav-w`
  200px and `--field-floating-label-top` 4px.

## 0.5.0 — 2026-07-08

### Breaking

- **`ds-combobox` renamed to `ds-autocomplete`.** The clearer industry name for the editable
  type-to-pick control; "combobox" survives only as the ARIA role — which the select-only
  `ds-select` trigger also carries. Renames: selector `ds-combobox` → `ds-autocomplete`;
  `ComboboxComponent` → `AutocompleteComponent`; exported types `ComboboxOption` /
  `ComboboxSize` → `AutocompleteOption` / `AutocompleteSize`; public tokens
  `--ds-combobox-focus-shadow` / `--ds-combobox-maxw` / `--ds-combobox-input-minw` →
  `--ds-autocomplete-*`. Behavior unchanged.
- **`ds-dropdown` removed — use `ds-select`.** The two were near-identical select-only single
  pickers (same trigger, same panel, same keyboard model); `ds-select` is the richer canonical
  form field (`ControlValueAccessor`, `invalid` + `hint` via `ds-field-message`, `required` /
  `optional`, per-option icons, group-level `disabled`). Migration: `<ds-dropdown>` →
  `<ds-select>`; `[error]` → `[invalid]`; `DropdownOption` / `DropdownSize` → `SelectOption` /
  `SelectSize`. Groups go inline in `[options]`, which is what `ds-select` already took
  (`SelectItem = SelectOption | SelectOptionGroup`).
  `readOnly` moved to `ds-select` (see Added).
- **Public token prefixes normalized to match the selector (not aliased).** Four components had
  their `--ds-*` token name fragments hyphenated to align with the Angular selector; the old
  concatenated names silently stop resolving, so consumers who override any of these must rename.
  `--ds-datepicker-*` → `--ds-date-picker-*` (~14 tokens: `bg-color`, `border`, `shadow`, `width`,
  `trigger-bg-color`, `trigger-border-color`, `day-hover-bg-color`, `day-today-label-color`,
  `day-selected-*`, `day-range-*`, `day-disabled-label-color`); `--ds-statusdot-*` →
  `--ds-status-dot-*` (`color`, `size`); `--ds-pagehdr-*` → `--ds-page-header-*` (~10 tokens:
  eyebrow / title / subtitle / meta / crumb text colors, `meta-icon-color`, `divider`, `title-fs`,
  `title-gap`); `--ds-avatargroup-*` → `--ds-avatar-group-*` (`overlap`, `ring`, `overflow-bg-color`,
  `overflow-label-color`); the globals `--datepicker-w` / `-cell-gap` / `-nav-size` →
  `--date-picker-*`. Only the names changed — the CSS property each feeds and every default
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
  (standalone) also gains `invalid` + `hint` via `ds-field-message`, matching checkbox/switch. One
  `md` exception: under `[data-density="ultra-compact"]` a checked `ds-switch` thumb now travels 8px
  and stays inside its 24px track, where it travelled 16px and overran it.
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
- **Public `--ds-*` customization token sweep across 47 components.** Components/sub-components that
  previously had no public token API (or only a shallow one) now expose per-instance/theme knobs —
  spinner, skeleton, progress, divider, accordion, page-footer, tooltip, w3w, drawer, popover, menu
  (+ item + divider), checkbox, radio, switch, slider, segmented, toggle-button, stepper, select,
  autocomplete, multi-select, date-picker, time-picker, otp-input, number-stepper, bottom-sheet, list,
  loading-overlay, split-button, tree, avatar-group, description-list, dropzone, modal, page-header,
  tabs, tag, timeline, toast, topbar, avatar, color-picker, icon-button, input, empty-state — bringing
  drawer / popover / tooltip up to the same depth as modal / card. 182 new names,
  predominantly color (surface/background, border, text/label, icon, accent, plus hover/selected/focus/
  active states) with secondary sizing (height, width, max-width/height, radius, padding, shadow,
  font-size). Each is a `--_x: var(--ds-x, <role-token>)` resolver whose default equals the existing
  role token, so it is purely additive — zero visual change for consumers who set nothing, except
  `--ds-search-maxw`, whose default is `none` where the field was capped at 320px (see Changed).

### Changed

- **`ds-search` inner input class renamed `.input` → `.search-input`.** The over-generic name let
  consumer global `.input` styles/resets leak into the component through emulated encapsulation
  (root cause of a duplicate focus ring). Only consumer styling that targeted the
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
  `none`) to opt back into a fixed cap, e.g. `ds-search { --ds-search-maxw: 320px }`; it replaces
  the global `--search-maxw`, which is gone.
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

### Breaking

- **`ds-button` now takes two orthogonal axes — `color` × `variant` — replacing the single
  conflated `variant` input.** `color` is the hue family (`primary` | `secondary` | `tertiary` |
  `neutral` | `error` | `success` | `warning`, default `primary`); `variant` is the fill style
  (`solid` | `tonal` | `ghost` | `outline` | `text`, default `solid`). The old single axis mixed hue
  and emphasis — migrate as: `primary` → default (drop the attr); `secondary` →
  `variant="tonal"`; `tertiary` → `variant="ghost"`; `outline` → `color="neutral"
  variant="outline"`; `error` / `success` / `warning` → `color="error|success|warning"`; `text` →
  `variant="text"`. New exported `ButtonColor` / `ButtonVariant` types. `text` still renders but is
  **discouraged** (dev-mode `console.warn` — prefer the global `.link` class); a small set of
  low-contrast `color × variant` combos (e.g. `neutral` solid, `success` / `warning` ghost/outline)
  render with a discouraged ⚠ marker rather than being banned. Each instance now sources its accent
  from the `--accent-*` pointer layer (see ds-color). A migrated `outline` button presses to a
  14% `--text-secondary` tint, was `--surface-secondary` (restore via `--ds-button-bg-color-active`).
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
  `heading`, `time`, an optional node `icon`, and a `tone` (`default` | `primary` | `success` |
  `warning` | `error` | `muted`). Exports `TimelineTone`.
- **`ds-description-list` / `ds-description-item`** — term/definition pairs with
  `horizontal` | `stacked` `orientation`; each item takes a `term` and optional `copyValue`
  (renders a copy-to-clipboard button). Exports `DescriptionListOrientation`.
- **`ds-stack` / `ds-inline` / `ds-container` layout primitives.** `ds-stack` (column) and
  `ds-inline` (row, wraps by default) take a named `gap` (`none … xl`) + `align` /
  `justify`; `ds-container` centres content at a named `size` (`sm` | `md` | `lg` | `xl` | `full`).
  Adds semantic `--space-stack` / `--space-inline` spacing aliases plus per-primitive
  `--ds-stack-gap` / `--ds-inline-gap` / `--ds-container-max` / `--ds-container-pad-x` hooks.
  Exports `LayoutGap`, `LayoutAlign`, `LayoutJustify`, `ContainerSize`.
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
  so on-fill text keeps correct contrast across themes: `--primary-on`, `--icon-on-primary` and
  `--text-on-*` read them instead of `--neutral-0` / `--neutral-900`, so under
  `data-neutrals="brand"` `--text-on-warning` is `#161A28`, not the brand-gray 900.
  Non-breaking — additive, light output unchanged.
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
  It replaces `--field-gap-label`, which is gone.

#### Components — new capabilities

- **`ds-button` overlay-trigger support.** New `ariaHasPopup` / `ariaExpanded` inputs
  (forwarded to the native `<button>`) and an exported `buttonRef` for positioning a
  popover/menu and returning focus.
- **`ds-date-picker` month & year grid pickers** in the calendar header — click the
  month/year labels to pick from a compact grid (years in a paged 12-cell grid) instead of
  stepping month-by-month.
- **`ds-table` pagination, client-side sort & sticky first column**: new `pageSize` / `page` / `pageSizeOptions`, `clientSort`,
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
  `bp.up(md)` (`width >= 768px`) / `bp.down(sm)` (`width < 640px`), via `@use 'breakpoints' as bp;`.
  Heads-up: advanced consumers importing `styles/tokens` à la carte now also need
  `styles/breakpoints` for `--bp-*`; the `styles/ds` entry forwards both.
- **`--ds-button-border-disabled`** and **`--ds-icon-button-bg-color-disabled` /
  `-icon-color-disabled` / `-border-disabled`** override tokens — the disabled
  fill/label/border are now individually themeable (previously only button had
  `bg-color`/`label-color-disabled`; icon-button had none).
- **`--ds-button-press-scale`** (default `0.98`) and **`--ds-icon-button-press-scale`**
  (default `0.96`) — tune the press scale-down (set `1` to disable).

### Changed

- **Button & icon-button press is now darken + a micro scale-down; the pressed halo is off by default.**
  `:active` darkens the fill (unchanged, except the old `outline` button: as neutral `outline` it
  presses to a grey ink tint, not `--surface-secondary`) and adds `transform: scale(0.98)` (button) /
  `0.96` (icon-button) for tactile feedback. The old faint pressed halo (`--ds-button-pressed-shadow`) now defaults to `none`
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
  slowed instead of zeroed (`--duration-loop-fast` / `-slow` 1400ms / 2800ms there, were 0ms); one-shot entrance/transition motion stays instant. The page-wide
  skeleton sweep still halts (large-area motion, the one reduced-motion should remove).
- **Overlay scroll-lock is now released on dismiss.** The scoped `@keyframes` name guard now
  matches Angular's emulated-encapsulation suffix (`endsWith`, not `===`), so the page no
  longer stays scroll-locked after an overlay closes.
- **`ds-input` / `ds-search` clear button reads at rest.** `ds-input` draws it in
  `--text-secondary` instead of `--text-tertiary`, and `ds-search` shows it at full opacity instead
  of 0.7, so it no longer needs hover or focus to be seen.
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
  overriding e.g. `--ds-toast-bg` must rename to `--ds-toast-bg-color`; the state variants
  `--ds-*-bg-<state>` take it after `-bg` (`--ds-button-bg-hover` → `--ds-button-bg-color-hover`).
- **Renamed `--*-fg` tokens → semantic `-text-color` / `-label-color` / `-icon-color`.**
  The unclear `fg` abbreviation is gone: text/titles/inputs → `-text-color`, control & nav
  labels → `-label-color`, icons/glyphs → `-icon-color`. Affects all public `--ds-*-fg`
  hooks — avatar, badge, banner, breadcrumbs, button, date-picker, dropzone, empty-state,
  icon-button, input, menu, modal, page-header, pagination, search, sidenav, table, tabs,
  tag and topbar — plus the `--status-*` globals and `--chart-tooltip-fg`. Examples:
  `--ds-modal-title-fg` → `--ds-modal-title-text-color`, `--ds-sidenav-group-fg` →
  `--ds-sidenav-group-label-color`, `--ds-icon-button-fg` → `--ds-icon-button-icon-color`.

### Added

- **Reactive-forms support on `ds-input`, `ds-textarea`, `ds-select`.** They now implement
  `ControlValueAccessor`, so `formControlName` / `[formControl]` and template `[(ngModel)]` bind to
  them out of the box, and `FormControl.disable()` is honoured. The existing `[(value)]` signal API
  is unchanged — both work. Checkbox / switch / combobox / date-picker / radio do not implement
  `ControlValueAccessor` yet.
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
  on the theme default. Default appearance unchanged except `ds-combobox`, which moves to
  the field halo (see Changed).
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
  `background-color` for precision. Alongside it, a library-wide, value-preserving CSS-syntax
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

- Removed the repository link from the npm package: dropped the `repository` field from
  `package.json`. The published README no longer includes its maintainer-only sections, and its
  License entry is now plain text (no repo link) — fixing the npm 404.

## 0.2.1 — 2026-06-16

### Added

- A `homepage` field linking the live docs, so the npm package page
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

## 0.1.0 — 2026-06-15

Initial public release.

### Added

- 45+ standalone Angular components: buttons, forms, overlays, navigation, data display
- Three-tier token architecture: palette → semantic theme → geometry/typography/motion tokens
- Default theme and palette, swappable by consumers
- Bundled Mulish and JetBrains Mono fonts
- SCSS sources shipped in the package (`styles/`, `themes/`)
