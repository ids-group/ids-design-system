# The hand-maintained surface of the `@angular/elements` route

Everything in `.design-sync/elements/` is generated: `gen.mjs` reads the AST and
emits both the custom-element registrations and the typed React wrappers, so a
new component, a renamed input or a changed union appears in the bundle on the
next build. **This file is the list of things that generation cannot cover**, and
it exists because that list grows silently — the attribute-directive count went
from 6 to 15 in a single month with nobody noticing.

`manual-surface.json` is the machine-readable half; `check-manual-surface.mjs`
recomputes both lists from `src/lib` and fails when they diverge from what is
recorded here. After triaging a new entry, add it below and re-record with
`--bless`. The gate also fails on an entry this file never mentions: an
unexplained entry is an excuse, not a record.

## 1. Projection through the element boundary — SOLVED

Two generator defects, both fixed 2026-09-01, **no component was changed**. Everything below
was measured in a real Chrome tab with `document.createElement` + `innerHTML` + `appendChild`,
so React is not on the path.

### Defect A — nested custom elements

[angular/angular#24536](https://github.com/angular/angular/issues/24536): a custom element
nested inside another custom element's template loses **both** its projected content and its
inputs. `ds-modal`'s template renders `<ds-modal-card>`, which the generator also registered,
so the inner element re-bootstrapped and took the card's bindings and projection with it. That
one fact explains the empty card, the empty `title`, and why four earlier hypotheses (React
wrapper timing, React 19, hoisting `<ng-content>` into an `<ng-template>`, widening the `@if`)
all failed.

**Fix, per upstream's own advice — do not nest them.** `gen.mjs` scans every
`*.component.html` and `*.component.ts` under `src/lib` for `<ds-…` tags; a component used
inside another component's template registers under an alias, `ds-x-<name>`, that no template
mentions, so Angular renders it as an ordinary component there. **32 of 96** take an alias (`COMPONENTS` in `gen/elements.ts`, 2026-10-09).
The React wrapper emits the alias, so `<Modal>` and `<Button>` are unchanged for a caller and
the tag never surfaces in a preview or a design. Angular's component styles are
attribute-scoped, so the alias costs no CSS.

### Defect B — host-directive inputs were never registered

`createCustomElement` builds its property list from the component's **own** inputs, so an
input re-exposed through `hostDirectives` had no accessor at all and a write landed as a plain
expando. Read off the live registration before the fix: `ds-modal`'s prototype carried `open`,
`size`, `status`, `title`, `subtitle`, `dividers`, `closeOnBackdrop`, `persistent` — and no
`staticPreview`. So `staticPreview`, the documented way to render an overlay statically, had
**never** worked on any element; `elements/README.md` claimed the generator picked these up,
and it did — for the React wrapper only.

**Fix:** `gen.mjs` emits a `HOST_INPUTS` map and `defineDsElements` defines a forwarding
accessor per entry before `customElements.define`. Eight entries, all `staticPreview`:
`ds-x-bottom-sheet`, `ds-color-picker`, `ds-x-date-picker`, `ds-drawer`, `ds-modal`,
`ds-x-popover`, `ds-x-select`, `ds-time-picker`.

This is what closed the last symptom. With `staticPreview` reaching the component, the card
renders at view creation, the projection is placed immediately, nothing is detached — and so
**registered elements nested inside a slot survive**, which they did not before. The mechanism
they were dying of is [angular/angular#38962](https://github.com/angular/angular/issues/38962):
a detached Angular element has its component destroyed after ~10 ms and its DOM node removed.

### Verified — full slot sweep

Every component with projection was probed with its real slot names, extracted from its own
template rather than guessed: **44 templates, 36 green on the first pass.** All eight
remainders were then driven with the inputs their slots depend on:

| component                | slot             | verdict                                                                                                                                            |
| ------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stat`                   | `[delta]`        | ✅ works with the `delta` input set — the first sweep passed unnamed content to a component that has only named slots                              |
| `table`                  | `[empty]`        | ✅ works with an empty `data` array                                                                                                                |
| `table`                  | `[bulk-actions]` | inconclusive — needs the real selection API, no evidence of a defect                                                                               |
| `sidenav`, `auth-layout` | `[dsBrandName]`  | by design — gated on a `contentChild` query for the **directive**, and a directive cannot be applied through an element boundary (see §2)          |
| `sidenav-item`           | unnamed          | by design — the template's own first comment says there is deliberately no default `<ng-content>`                                                  |
| `filter-bar`             | unnamed          | by design — it drops anything carrying neither slot attribute, and `dsProjectionDropped` warns about it at runtime                                 |
| `tab`                    | unnamed          | by design — `tab.component.html` is only `<ng-template #content><ng-content /></ng-template>`, stamped by `ds-tabs`; standalone it renders nothing |

Spot checks that now pass and previously did not: `ds-modal` (`title` + `[body]` + a nested
`ds-checkbox` + a nested `ds-x-button`), `ds-drawer` `[drawer-body]`, `ds-bottom-sheet`,
`ds-x-popover` with `staticPreview`, `ds-card` containing a registered `ds-checkbox`,
`ds-alert` `[actions]` containing a registered `ds-x-button`.

### The one rule that governs every slot (measured 2026-09-01)

**A slot works — including nested DS components inside it — as long as its gate is true by the
time the element connects.** Angular Elements applies initial input values immediately after
creating the component, inside the same microtask, so a gate driven by an initial prop is live
before anything is detached. Measured on `ds-modal` with a nested `ds-checkbox` in `[body]`:

| construction                         | plain markup | nested registered element |
| ------------------------------------ | ------------ | ------------------------- |
| `staticPreview` set at creation      | ✅           | ✅                        |
| `open` set at creation               | ✅           | ✅                        |
| closed at creation, `open` set later | ✅           | ❌                        |

Only the third row loses anything, and only the custom elements in it — the projected wrapper
and its plain markup survive. The mechanism is
[angular/angular#38962](https://github.com/angular/angular/issues/38962): a detached Angular
element has its component destroyed after ~10 ms and its node removed. Toggling a gate long
after upgrade is exactly that detach.

**So the contract for a preview is: pass the state as an initial prop, never toggle it after
mount.** A static design preview always satisfies this, because it renders with its props set.

`ds-table` `[bulk-actions]` was the one case that looked unfixable, because a selection normally
happens after mount. It obeys the same rule: with `selectedIds` passed as an initial prop the
bulk bar renders and the nested `ds-x-button` inside it survives — verified. Selecting a row
through the UI afterwards renders the bar and its plain content, and drops the nested component.

### What the manifest list means now

`manual-surface.json` records the 16 templates whose `<ng-content>` sits inside a control-flow
block of their own. **That is a watch-list, not a defect list** - all 16 are green today. It exists
because the two defects above were invisible until someone looked, and a new component that gates
its projection deserves the same look. `check-manual-surface.mjs` fails when the list changes so
the look actually happens. A template whose `<ng-content>` sits in an `<ng-template>` that another
component stamps is not on it, because the gate lives in the stamper; `chart` is that case (below).

The sixteen, each with the gate its `<ng-content>` sits behind:

| component       | gate              | status                                                                                                 |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `modal`         | `rendered()`      | overlay; ✅ via staticPreview and via open                                                             |
| `drawer`        | `rendered()`      | overlay; ✅                                                                                            |
| `bottom-sheet`  | `rendered()`      | overlay; ✅                                                                                            |
| `auth-layout`   | `letterGlyph()`   | ✅                                                                                                     |
| `badge`         | `count()`         | projection in the live @else; ✅                                                                       |
| `checkbox`      | `label()`         | projection in the live @else; ✅                                                                       |
| `radio`         | `label()`         | projection in the live @else; ✅ — moved under `radio-group/` by the entry-point split, same component |
| `switch`        | `label()`         | projection in the live @else; ✅                                                                       |
| `dropzone`      | `files()`         | ✅                                                                                                     |
| `menu-item`     | `icon()`          | ✅                                                                                                     |
| `sidenav`       | `brandRoute()`    | [dsBrandName] is directive-gated — see the sweep above                                                 |
| `sidenav-group` | `expandable()`    | ✅ with label + expandable set                                                                         |
| `sidenav-item`  | `routerLink()`    | no default slot by design                                                                              |
| `stat`          | `delta()`         | ✅ with the delta input set                                                                            |
| `table`         | `emptyTemplate()` | [empty] ✅; [bulk-actions] ✅ with `selectedIds` passed as an initial prop                             |
| `filter-bar`    | `collapsed()`     | drops unslotted content by design                                                                      |

`ds-modal-card` also has projection but does not appear here: its slots are at root level,
outside any block, and it is one of the components that register under an alias.

### `chart` - the gate is live, the marks are what cannot cross (2026-09-17)

`ds-chart` is the container `ds-column-chart` is built inside; the other four charts each still
draw their own canvas. Its three
`<ng-content>` slots sit in the `<ng-template>` it hands to the shared state frame
(`figure[dsChartStates]`), which stamps it in the last arm of a four-way state chain -
`@if (error()) … @else if (pending()) … @else if (empty()) … @else { the canvas }` - and by the rule
above that arm is live at connect: `error`, `loading` and `categories` are all initial props, so an element created with
`categories` set has the marks' branch stamped out in the same microtask it upgrades. Nothing is
toggled after mount.

`isEmpty()` is read off `categories` alone and never off the domains the marks report, which is what
keeps it that way. The marks are projected INTO the branch this gate decides, so a container that
waited for a domain report before rendering them would never receive one.

**What cannot cross the boundary is the marks themselves.** Each is an Angular component with an
ATTRIBUTE selector on a real `<svg:g>` - `g[dsColumnSeries]`, `g[dsLineSeries]`,
`g[dsReferenceLine]`, `g[dsReferenceLabel]` - because an element the SVG specification does not know
is not rendered and neither are its children. An attribute selector has no tag, so
`createCustomElement` has nothing to define; they are absent from §2's list as well, because that
list matches a bare `[dsFoo]` selector and these carry an element in front of it. The generated
`referenceLine` / `referenceLabel` slot props are inert for a second reason: `runtime.tsx` claims a
named slot by wrapping the prop in a `<span style="display: contents">`, and an HTML `<span>` inside
an `<svg>` renders nothing - the very fact that put the marks on `<svg:g>` in the first place. So a
`Chart` rendered from React draws its frame, caption, axes, gridlines, ticks and states, and no
marks at all.

**Acceptable, and nothing a card can show is lost.** Every chart a design places reaches it through
`ColumnChart`, `BarChart`, `LineChart`, `PieChart` or `FunnelChart`, each of which carries its own
marks internally and takes its data as an ordinary prop - the container is an Angular composition
seam, not a thing a design writes by hand. `ds-chart` registers under the alias `ds-x-chart` anyway,
because `ds-column-chart` renders it inside its own template (§1, defect A).
`.design-sync/docs/Chart.md` says all of this to the design agent and sends it to a preset, so the
route is documented rather than discovered as an empty plot.

**Not built:** a registered component per mark, which is the only shape that would make the
container composable from React. It would add four public components to the library for a
design-tool-only need, and each would still have to be written inside a `Chart`'s canvas in the
right order to mean anything - the same trade already recorded for `[dsTooltip]` and the
`[dsTable*]` family. Revisit if a design host ever needs a combination the five presets cannot
express.

## 2. Attribute directives — no element to register

A directive has no tag, so `@angular/elements` has nothing to define and it is
absent from the generated surface entirely. Twenty-two of them:

`[dsBrandName]` · `[dsCellTemplate]` · `[dsChartTooltip]` · `[dsChipTemplate]` · `[dsCreateTemplate]` ·
`[dsDefinitionTerm]` · `[dsEmptyTemplate]` · `[dsFieldClickFocus]` · `[dsGroupLabelTemplate]` ·
`[dsModalConfirm]` · `[dsOptionTemplate]` · `[dsPanelFooterTemplate]` · `[dsPanelHeaderTemplate]` ·
`[dsPickerTrigger]` · `[dsProjectionDropped]` · `[dsRailTrigger]` ·
`[dsReserveMessages]` · `[dsTableColumns]` · `[dsTableExport]` ·
`[dsTableResize]` · `[dsTooltip]` · `[dsTooltipWhenClipped]`

`[dsModalConfirm]` wires a projected action to `ds-modal`'s `confirmed` output: behaviour with nothing to draw, so a static card loses nothing by its absence and the confirm button renders as the plain button it sits on.

Most are template-slot markers for the picker family (`dsOptionTemplate`,
`dsPanelHeaderTemplate`, …) and are meaningless without an Angular template
anyway, so a design tool has no use for them. **`[dsTooltip]` was called the one that hurts; on a second look it does not.** A tooltip is
revealed on hover, and a static design card has no hover — `NOTES.md` already records the same
thing about `ds-description-list`'s hover-revealed copy button being invisible in captures. So
the design agent gains almost nothing from it. Searched for a way to register a directive as a
custom element (2026-09-01): there is none — `createCustomElement` takes components only. The
available shape is a thin component whose `hostDirectives` re-expose the directive's inputs,
which would now work end to end because host-directive inputs reach the element (§1, defect B).
**Not built:** it would either add a public component to the library for a design-tool-only need,
or add a design-sync-local component for a feature that cannot be seen in a static card. Revisit
only if the design host ever renders interactive cards.

`[dsDefinitionTerm]` marks a term that reveals its definition on hover and pins it open on a click, the same behaviour as `[dsTooltip]`. A static card has neither a hover nor a click, so nothing visible is lost; `ds-table` applies it internally.

`[dsProjectionDropped]` is dev-only and never ships a node in production.

**The three `[dsTable*]` directives are the table's opt-in features** (2026-09-05), and they are a
different case from the template-slot markers above: they carry real behaviour, not a marker. They
exist because `ds-table` shipped the data-grid features to everyone who ever drew a table — moving
reorder, the column picker and resizing behind directives took its marginal cost from **35 647 to
16 410 B gzip** and sent `@angular/cdk/drag-drop` with them.

**What the elements route loses, and why it is acceptable.** A design card shows a table in a
state, not a reader rearranging one: the picker opens on a click, resizing is a drag, and the CSV
button downloads a file — none of the three is visible in a static capture, exactly the argument
already recorded above for `[dsTooltip]`. The features the card CAN show — columns, rows, sorting,
selection, pagination — are all still inputs on `ds-table` itself and reach the element unchanged.
**Nothing that was visible in a card before has stopped being visible**, because the built-in
export button was the only rendered affordance of the three and a card never pressed it.

**`[dsChartTooltip]` drives the charts' own overlay** (2026-09-14), and it is applied inside our
chart templates rather than by a consumer: a chart hands it a `ChartTooltipContext` and an origin,
non-null opens the panel and null closes it, so pointer and keyboard share one path. The
`components/chart-tooltip` entry point exports the class, so it is reachable, but it is inert
without a chart's context and origin.

**What the elements route loses is nothing a card can show**, by the argument already recorded above
for `[dsTooltip]`: the panel is revealed on hover, tap or focus, and a static card has none of the
three. `ds-chart-tooltip-panel` registers as an element in its own right, so a specimen that wants
the surface places the panel itself — which is what `.design-sync/docs/ChartTooltipPanel.md` tells
the design agent to do.

The three panel components they create (`ds-table-columns-panel`, `ds-table-columns-trigger`,
`ds-table-export-button`) carry `@internal` and are created imperatively through a
`ViewContainerRef`, so they appear in no template and no consumer can write one.
`check-manual-surface.mjs` skips a component that is BOTH marked internal AND rendered by no
template of ours — the second half matters, because `CalendarDay` and `FieldMessage` are internal
too and do render inside their parents' previews.

## 3. Imperative APIs that do not cross the boundary

Angular's element strategy publishes inputs and outputs, not methods. So
`popover.toggle(trigger)` — how the DS opens a popover — is unreachable from a
React wrapper, and the same holds for menu open/close. Trigger-driven overlays
need an input-based open state before a design can use them.

## Keeping this honest

Run `npm run check:cards`. It builds the elements surface first, because
`check-manual-surface.mjs` reads the gitignored `elements/gen/sections.json` and
cannot run without it — `node tools/check.mjs manual-surface` alone works only in a tree
that has already built. The gate itself fails when a new component starts
projecting inside a control-flow block, when a new attribute directive appears,
when a recorded entry disappears, or when a recorded component is not mentioned
in this file. Triage first, edit this file, then `--bless`.

CI runs it in `build-design-sync.sh`, which is the `after-release` pipeline: a
failure there leaves the published package and the deployed docs alone and stops
only the upload tree from being rebuilt. So the release does not wait on it, and
running `check:cards` before a release is what keeps a gap out of one.
