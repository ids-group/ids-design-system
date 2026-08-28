# Design System — rules and approaches

> **This file is the HOW.** Which spacing goes between what, which type role a piece of
> text takes, where a value belongs and where a literal is a bug. For the WHAT — the
> inventory of components, their inputs and their tokens — see `components.md`, and
> prefer the documentation site's Component API and token reference, which are generated from source
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
come with it, and every one is retunable through `--ds-t-<role>-*` without touching the
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
  `color` of a MARKER — a required asterisk, an icon badge's glyph. Every one of the eight
  `color: var(--error)` in this library lands only on markers of that kind — a required asterisk, an
  icon sitting on an `--error-subtitle` tint. **That
  glyph-on-tint pair is the pattern to copy**, and the reason not to put prose in this member:
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

### Four durations, and one of them carries almost everything

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

The
apparent exceptions are not exceptions — they are acronyms and notation the case rule does not
touch (`Site URL`, `Project ID`, `Date (en-US, Sunday-first)`). So: capitalise the first word
and whatever is a proper noun or an acronym, and nothing else. `Asset register`, not
`Asset Register`. No trailing colon: the field's shape already says a value follows.

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
| `none` | "No asset allocated yet" | "Pick from the asset register to start building this Sub-record." |
| `error` | "Couldn't load resource allocations" | "Network error — the request timed out after 30 seconds." |
| `locked` | "You don't have access to this Logistics plan" | "Logistics plans are restricted to Logistics and Producer roles. Ask your workspace admin." |

Three things to copy from those: the title is a **statement, not a label** — "No asset
allocated yet", never "Empty"; the error body names a **concrete** cause with the number in it,
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

## 8. Where the rest lives

The decisions this file does NOT make are the ones about which COMPONENT to reach for, and they
have their own home: the documentation site's `Practice → Do / Don't` (modal vs drawer, button hierarchy, table
density, badge proliferation, status without colour, tooltips vs banners) and
`Practice → Token Discipline` (the token-vs-literal rule, in worked pairs). The component
inventory is `components.md`; the generated Component API and token reference on the documentation site are
extracted from source on every build and are the only surfaces that cannot go stale.
