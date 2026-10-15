# Design System — rules and approaches

> **This file is the HOW.** Which spacing goes between what, which type role a piece of
> text takes, where a value belongs and where a literal is a bug. For the WHAT — the
> inventory of components, their inputs and their tokens — see `components.md`, and
> prefer the Component API and token reference on the documentation site
> (https://ids-ds.proto.ids-group.co.uk/), which are generated from source
> on every build and cannot go stale.
>
> **Audience: whoever composes a screen, human or agent.** Knowing the 639 tokens is not
> enough to build a page with them: the tokens are a vocabulary, and these are the rules
> that decide which word.
>
> **Every rule below was measured against this library, not imported from general UI
> advice.** Where a generic rule and this file disagree, this file wins — it describes
> the system you are actually building on. The scale rule below is a live example.

---

## 1. Spacing

### The scale is 4px-based WITH half-steps — not a 4/8 scale

```
0 · 2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80
```

`--space-0-5` (2px), `--space-1-5` (6px) and `--space-2-5` (10px) are real, deliberate
steps used for the inside of small controls. A reviewer applying a strict "everything on
4 or 8" rule will flag correct DS values as violations — that rule belongs to other
systems, not this one.

### Which step, by distance

Measured across the library's own components (occurrence counts in parentheses), the
scale is used in four bands. Match the band to the relationship, not to a pixel target:

| Between | Token | Why |
| --- | --- | --- |
| Parts of one control — icon and its label, a chip and its × | `--space-1` (74) or `--space-2` (130) | They read as one object; more than 8px starts to separate them |
| Sibling controls in a row — a field and its button, two chips | `--space-2` (130) or `--space-3` (82) | Related, but individually clickable |
| Blocks inside a section — a heading and its table, stacked fields | `--space-4` (55) | The default "these belong together" gap |
| Sections of a page | `--space-6` (21) and up | A visible break in the reading order |

`--space-2` being the most-used value in the library is not an accident to copy blindly:
it is the dominant *intra-component* gap. Reaching for it between page sections is the
most common way a screen ends up feeling cramped.

### Page gutters are already decided — do not re-pick them

The grid sets the horizontal rhythm per breakpoint tier, and a page should inherit it
rather than declare padding:

| Tier | Gutter | Margin |
| --- | --- | --- |
| ≤ 640px (4 col) | `--page-gutter-mobile` (12px) | `--page-margin-mobile` (16px) |
| 641–1024px (8 col) | `--page-gutter-tablet` (16px) | `--page-margin-tablet` (24px) |
| 1025–1440px (12 col) | `--page-gutter-desktop` (20px) | — |
| ≥ 1441px (12 col) | `--page-gutter-wide` (24px) | — |

### Who owns the gap

A stack sets `gap`, and every child is expected to carry its own trailing space. That is
why `gap="none"` works on a column of fields: each field already reserves its message
row. The failure mode is reaching for `gap="md"` to rescue one child that does not — it
re-adds the doubled rhythm to every other child in the column. Fix the child, not the
container.

---

## 2. Type

### Choose a ROLE, never a raw size

The library ships named roles. Use the class; the size, weight, line-height and tracking
come with it, and every one is retunable through `--ds-typography-<role>-*` without touching the
call site.

| Role | Use for |
| --- | --- |
| `.t-display` | One number or word that IS the screen — a hero metric |
| `.t-h1` … `.t-h5` | Document hierarchy. A page title is `.t-h2` here more often than `.t-h1` |
| `.t-card-title` | The title inside a card or tile, which is not part of the page's heading outline |
| `.t-l` / `.t-m` / `.t-s` / `.t-xs` | Body copy, descending. `.t-s` is the workhorse for dense admin UI |
| `.t-overline` | The small uppercase eyebrow above a title |
| `.t-caption` | Supporting text under a control or figure |
| `.t-mono-inline` / `.t-mono-block` | Code, tokens, IDs — anything where character alignment carries meaning |
| `*-bold` variants | The same role, emphasised. Do not reach for a larger role to get weight |

Writing `font-size: var(--font-size-s)` by hand reproduces one of four properties the
role would have set, and silently opts out of every future retune.

---

## 3. Size and density

### A control in a field row takes the field-height contract

`--ds-field-height` overrides the family; `--field-h-sm` / `-md` / `-lg` are the scale.
Every field-shaped control resolves it — inputs, selects, pickers, search, buttons, the
field group, the number stepper. A literal `height` on a control is a bug: it will not
line up with its neighbours and will not follow a density change.

`--ds-field-border-color`, `-border-color-hover`, `-border-color-focus`, `-text-color`, `-placeholder-color` and `-font-size` do the same for the box's colours and type across input, textarea, select, multi-select, autocomplete and search.

### Corner radius has its own section

Radius is a role, not a step, and nested radii must decrease — see §8.

### Never express a rule in pixels

`[data-density]` retunes the private spacing and height tokens underneath everything
above. A value written as `12px` survives that; a value written as `var(--space-3)`
follows it. This is why every rule on this page names a token.

---

## 4. Colour

### Pick the ROLE for the job, not the colour that looks right

Components never read a palette primitive (`--blue-600`). They read a semantic role, and the
role names say what the thing IS, so the theme and any brand can move underneath. Measured
usage across the library:

| Role | Uses | What it is for |
| --- | --- | --- |
| `--text-primary` | 82 | Body copy, labels, values — the default. If you are unsure, this. |
| `--text-tertiary` | 69 | Meta that must not compete: eyebrows, placeholders, counters, timestamps. |
| `--text-secondary` | 46 | Supporting copy that still has to be read — hints, subtitles, descriptions. |
| `--text-disabled` | 33 | Only for a disabled control. Never as "quiet text". |
| `--surface-default` | 50 | The page and the inside of a control. |
| `--surface-secondary` | 52 | A tier up from the page: table heads, sandboxes, code blocks. |
| `--surface-muted` | 16 | Hover and pressed fills on a neutral row. |
| `--surface-overlay` | 15 | Anything that floats — panels, menus, dialogs. |
| `--border-default` | 44 | The edge of a control. |
| `--border-divider` | 31 | A line BETWEEN things, not around them. |

`--text-tertiary` being the second most used role is the load-bearing fact here: most of what
looks like "grey text" in this system is a deliberate tertiary, and reaching for
`--text-disabled` to get the same greyness tells a screen reader's user nothing and lies to
the next reader of your CSS.

### A status family has four members and they are not interchangeable

Measured by which property each one actually lands on, across every component that uses one:

- **`--<status>`** — the saturated one: `border-color`, the fill of a solid button, and the
  `color` of a MARKER — a required asterisk, an icon badge's glyph. Every `color: var(--error)`
  declaration in this library lands on a marker of that kind: an asterisk, or a glyph sitting on an
  `--error-subtitle` tint. **That glyph-on-tint pair is the pattern to copy**, and the reason not to put prose in this member:
  it is contrast-checked as a large glyph, not as text.
- **`--<status>-text`** — `color`, on a light surface. This is the contrast-safe member, and the
  one you want for a message.
- **`--<status>-subtitle`** — `background`. The tint behind an alert or an icon badge.
- **`--<status>-muted` / `-hover`** — interaction states on the tinted surface.

So a status message is `--error-text` on `--error-subtitle`, never `--error` on anything with
text on it. Statuses are `info | success | warning | error` (`DsStatus`); `danger` and `warn`
are not words this library uses.

### Text on a saturated fill uses the on-role, and it does not flip with the theme

`--text-on-primary`, `-on-error`, `-on-success`, `-on-warning`. They resolve to
`--static-white` / `--static-ink`, which are theme-INDEPENDENT on purpose: the fill under them
is the same colour in light and dark, so flipping the text with the theme would break the pair
that was contrast-checked. Never use `--text-primary` on a filled button.

### Colour is never the only carrier

Every status in this library also has a glyph or a word. A red border alone fails the
colour-blind reader and fails a printout; `ds-alert`, `ds-badge` and the field message all
pair the colour with an icon or text, and a new status surface should too.

---

## 5. Motion

### Four durations, and 109 of the 139 uses are one of them

| Token | Value | What it is for | Uses |
| --- | --- | --- | --- |
| `--duration-instant` | 80ms | A press that must feel like contact. | 2 |
| `--duration-fast` | 120ms | Every hover, colour and border change — the default. | 109 |
| `--duration-base` | 180ms | A surface arriving (dialog, drawer) or a layout settling. | 27 |
| `--duration-slow` | 260ms | Only something large crossing the screen. | 1 |

If a transition you are adding is not `--duration-fast`, be able to say why. The one
`--duration-slow` in the library is a full-height drawer; that is the bar.

### Easing follows direction

`--ease-standard` (132 uses) for anything that changes in place — colour, border, a fill.
`--ease-decelerate` for something ARRIVING, `--ease-accelerate` for something LEAVING: an
entrance slows into its resting place, an exit gets out of the way. The role layer already
encodes this, so prefer it to picking an easing yourself: `--ds-motion-enter-panel-*` (a
dropdown), `--ds-motion-enter-surface-*` (a dialog), `--ds-motion-enter-large-*` (a drawer),
and `--ds-motion-exit-*`, which is deliberately FASTER than its entrance.

**A loop is `linear`, and it is the one place no easing token belongs.** All four `infinite`
animations here — the spinner, the button's spinner, the skeleton shimmer and the indeterminate
bar — run at a constant speed. An easing curve shapes the approach to a RESTING state, and a
repeat has none, so the curve spends the cycle slowing down into a boundary the viewer cannot
see: whatever is moving crawls at both ends of its travel and crosses the middle too fast. Where
the ends sit outside the visible box, as they do for a chunk that slides across a track, that is
time the element is simply absent. `--ease-standard` is the tempting wrong answer, because a loop
does read as "changes in place".

### Transition properties, not `all`

In this library: `background-color` (20), `transform` (12), `color` (10), `border-color` (5),
`opacity` (2). Nothing in the library transitions `all`, and only three places transition a
`width` — animating a layout property costs a reflow per frame. Prefer `transform` and
`opacity`; if you find yourself animating `height`, the answer is usually a `grid-template-rows`
trick or an overlay.

### An animation must mean something

Motion in this library either shows where a surface came from (a panel grows out of its
trigger, a drawer travels from its edge) or confirms a hit (a press). Decoration is not a
reason. The test: describe what the animation TELLS the user in one clause — if you cannot,
delete it.

### Reduced motion zeroes the DURATION, never the animation

`prefers-reduced-motion` sets the duration to `0ms` and leaves the keyframes in place, because
the modal, drawer and bottom sheet tear themselves down on `animationend` — removing the
animation would strand them mounted and leak the body-scroll lock. Follow that pattern in
anything with an exit.

---

## 6. Content

### Labels are sentence case

Most multi-word labels in this system already are, and the
apparent exceptions are not exceptions — they are acronyms and notation the case rule does not
touch (`Site URL`, `Project ID`, `Date (en-US, Sunday-first)`). So: capitalise the first word
and whatever is a proper noun or an acronym, and nothing else. `Order history`, not
`Order History`. No trailing colon: the field's shape already says a value follows.

Mark the exception, not the rule. `required` is the default expectation in most forms, so
`ds-input` and its siblings carry an `optional` input that renders "(optional)" rather than
making you label every other field.

### An empty state is five different situations, and saying which is the whole job

`ds-empty-state` takes a `variant`, and the vocabulary is the rule:
`none | loading | error | locked | success`. A screen that shows the same "No data" for a
first-run list, a filter that matched nothing, a failed request and a permission denial has
told the user nothing in four different ways. The pattern's own worked examples show the shape:

| Variant | Title says the SITUATION | Body says the NEXT STEP or the CAUSE |
| --- | --- | --- |
| `none` | "No items in this order yet" | "Add a product from the catalogue to start building it." |
| `error` | "Couldn't load the order lines" | "Network error — the request timed out after 30 seconds." |
| `locked` | "You don't have access to this warehouse" | "Warehouses are restricted to the Operations and Manager roles. Ask your workspace admin." |

Three things to copy from those: the title is a **statement, not a label** — "No items
in this order yet", never "Empty"; the error body names a **concrete** cause with the number in it,
not "Something went wrong"; and the locked body names **who can unblock them**, because a
permission wall with no next step is a dead end.

### A message says what happened, what follows, and what to do

The library holds itself to this. Every message it prints is tagged with the component that
printed it (`[ds-table] …`), states the consequence, and where there is one names the
fix outright:

> `[ds-table] lazy needs virtualScroll: without a window there is no range to fetch, so every
> gap in `data` renders a skeleton row and nothing ever asks for the rows.`

Anatomy worth keeping: **where** (the tag) → **what is wrong** → **what follows from it** →
**what to do**. The middle clause is the one people drop, and it is the one that stops the
reader guessing whether the warning matters.

### Field errors: the validator owns the words, and it must supply them

A DS field renders the message; it never invents one. Give the validator a message
(`required(path.email, { message: 'We need an email to send the invite to' })`) or map the kind
once for the app in `provideDsConfig({ field: { errorMessages: { … } } })`. With neither, an
invalid field goes red with no words and a dev warning names the kinds it could not resolve —
deliberately, because the alternative is the library writing copy for your domain.

Say what to do, not what went wrong: "Enter a valid email address" beats "Invalid email".

**Errors appear after the user has finished with the field, not while they type**, and the
library enforces it rather than asking you to: `errors` is gated on `touched`, so a `required`
error cannot greet an untouched form and a half-typed address is not yet wrong. An explicit
`error` string is the deliberate exception — binding it says the consumer has already decided,
so it shows immediately.

---

## 7. Overriding a component

Set the component's own `--ds-*` token **on the host element**, scoped as narrowly as the
change deserves:

```scss
ds-select { --ds-field-height: 44px; }              /* every select        */
.toolbar ds-select { --ds-field-height: 32px; }     /* only in the toolbar */
```

Defaults are declared on `:host` (or the component's root class) with a read-with-fallback
chain, so a consumer declaration cascades in without `!important` and without knowing the
internals.

**Two things that break this, both by design:**

- **Reaching for an internal class** — `ds-button .button.v-tonal { … }` — works until the
  internals move. Components reflect what you need on the host instead: `ds-button` carries
  `[data-variant]` and `[data-color]`, so `ds-button[data-variant="outline"]` is the
  supported form.
- **Portaled panels.** A dropdown, a date picker's calendar and a modal render under
  `<body>`, outside the host's subtree, so a host-scoped declaration cannot reach them.
  Those components forward their own panel tokens onto the pane on open, and the theme's
  radius and elevation ROLES travel with them when the host overrides one. A token that is
  neither is best set at `:root`.

---

## 8. Radius

### Reach for a ROLE, never a step

Four role tokens carry every corner in the library. Occurrence counts across the library's own
components (measured 2026-09-01) show which one a given surface actually takes:

| Role | Resolves to | Uses | What it is for |
| --- | --- | --- | --- |
| `--ds-radius-inner` | `--radius-sm` (4px) | 37 | Something nested INSIDE a control — a tick, a kbd cap, a focus halo, a segment |
| `--ds-radius-control` | `--radius-md` (8px) | 26 | The control itself — button, field, tag, tooltip, segmented, search |
| `--ds-radius-panel` | `--radius-lg` (12px) | 13 | A surface that CONTAINS controls — card, modal, bottom sheet, popover, the picker panels, page footer |
| `--ds-radius-pill` | `--radius-pill` (999px) | 4 | Fully round by meaning, not by size — avatar, badge, radio, progress track |

The raw steps (`--radius-sm` … `--radius-2xl`) are the scale the roles map onto. Using one
directly says "this corner belongs to no role", which is almost never true. `--radius-xl` (16px)
and `--radius-2xl` (24px) have no consumer in the library at all — their comments in
the token file describe an intent, not a usage.

### Nesting: inner < control < panel, and never equal

A rounded thing inside a rounded thing needs a SMALLER radius, or the inner corner appears
to bulge out of the outer one. The three roles are ordered for exactly this: a field
(`control`, 8px) inside a card (`panel`, 12px); a tick (`inner`, 4px) inside a checkbox
(`control`). If two nested surfaces share a radius, one of them is wrong.

The optical rule when you need a value the roles do not cover: inner radius = outer radius
minus the padding between them. A 12px panel with 8px of padding wants an 8px child, not 12px.

### `--radius-flat` is a statement, not a zero

`--radius-flat` resolves to `--radius-0`, and it exists so that "this corner is deliberately
square" reads differently from "nobody set a radius". It is what the middle of a button
group and an in-range calendar day use. Writing `border-radius: 0` there loses the intent
the next reader needs.

### Overriding

Most components with a corner expose `--ds-<component>-radius` on `:host`, resolving through
the role — but not all of them, and `ds-toast` is the one to know about: it reads `--radius-lg`
directly, so only the raw step moves it. Retheming corners means moving the four roles rather
than editing components: set `--ds-radius-control` once and every control that resolves it
follows.

---

## 9. Page composition — where things go

The grid itself (tiers, spans, the canonical 8+4 / 6+6 / 9+3 splits, the forbidden 7+5, the
720px prose cap) is specified in `agent/foundations/grid.md`. This section is the layer
above it: which region holds what, and in which order.

### The page is four regions, and three of them are components

```
ds-app-layout
├── [sidenav]  ds-sidenav          — reserve the rail, OUTSIDE the page grid
├── [topbar]   ds-topbar           — global, not per-page
└── (default)  the page itself
    ├── ds-page-header             — breadcrumbs · title · meta · actions · tabs
    ├── ds-filter-bar              — only if the page has data to filter
    ├── the content, on .page-grid
    └── ds-page-footer             — optional, page-level actions or legal
```

The `ds-page-header` slots are the order the eye reads, and they are not interchangeable:
`[breadcrumbs]` above the title, `[title-badge]` beside it, `[meta]` under it, `[actions]`
right-aligned on the title line, `[tabs]` last so the tab row sits on the header's bottom
edge. Putting page actions anywhere else — a floating button, a row above the header —
breaks the one place a user has learned to look.

### Filters sit directly above the data they filter

`ds-filter-bar` goes between the header and the content, full width, with no wrapper that
could clip its overflow popover. Not in a sidebar, not inside the table's own card, not
above the page header. A filter placed away from its data stops reading as a control over
that data, and the 9+3 split is what a genuine filter RAIL is for — reserved, not the
default.

### Primary action per region, once

One primary (default `variant`) per region: one in the page header, one per card, one in a
modal's `[actions]`. A second primary in the same region makes neither primary. Secondary
work takes `outline`, dismissive work takes `ghost`. A modal's actions read
destructive-last: cancel then confirm, never the reverse.

### When content belongs in a card, and when it does not

A `ds-card` earns its border when the content inside it is a UNIT that could be moved,
collapsed or repeated — a record summary, a KPI tile, one form section. It does not earn one
for "this page has content": a full-width table already has its own frame (`ds-table`
resolves `--ds-radius-control`), and a card around it double-borders. The DS default is no card;
reach for one when the boundary means something.

### Supporting information goes under, never beside

Hints, counts, timestamps and helper text sit UNDER the thing they describe, at
`--space-1`. Beside is reserved for actions. `ds-field-message` is the mechanism for a
field; for anything else it is a `.t-s` line at `--text-secondary`. Never a tooltip: a
tooltip is hover-only, so it cannot carry information the user needs in order to act.

### The pattern catalogue

Five page shapes cover what the DS is built for. Naming which one you are building settles
most placement questions before they come up:

| Pattern | Made of | The rule that is easy to miss |
| --- | --- | --- |
| **List + filters** | header · filter-bar · `ds-table` (or a card list) · `ds-pagination` | Filters above the data, pagination below it, both full width |
| **Record detail** | header with `[meta]` · 8+4 grid — main left, meta sidebar right | The sidebar is metadata, never navigation |
| **Form** | header · one `ds-card` per section · actions in the last card | One primary; submit gates on presence, never on validity |
| **Dashboard** | header · a row of `ds-stat` tiles · charts or tables below | Tiles are one row that wraps, not a grid you hand-place |
| **Empty / error** | `ds-empty-state` centred in the region that would have held the data | It replaces the region, not the page — header and filters stay |

### Checking a composition, instead of eyeballing it

Five checks, in the order that catches the most:

1. **Every gap is a token.** A literal `px` between two elements will not follow
   `[data-density]` — see §3. Grep the diff for `px` outside a token declaration.
2. **Every span is a column.** `col-span-*` on `.page-grid`, and the split is 8+4, 6+6 or
   9+3. If a region needs 7+5, the content is wrong, not the grid.
3. **One grid per page.** A sub-region aligns to the page tracks; a local `display: grid`
   with its own columns is how alignment drifts one screen at a time.
4. **Nested radii decrease.** See §8. Two nested surfaces with the same radius is a defect
   you can see once you look for it.
5. **One primary per region**, and prose capped at `--col-cap-text`.

---

## 10. Where the rest lives

The decisions this file does NOT make are the ones about which COMPONENT to reach for, and they
have their own home: the documentation site's `Practice → Do / Don't` (modal vs drawer, button hierarchy, table
density, badge proliferation, status without colour, tooltips vs banners) and
`Practice → Token Discipline` (the token-vs-literal rule, in worked pairs). The component
inventory is `components.md`; the generated Component API and token reference on the documentation site are
extracted from source on every build and are the only surfaces that cannot go stale.
