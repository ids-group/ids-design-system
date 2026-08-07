# Design System — rules and approaches

> **This file is the HOW.** Which spacing goes between what, which type role a piece of
> text takes, where a value belongs and where a literal is a bug. For the WHAT — the
> inventory of components, their inputs and their tokens — see `components.md`, and
> prefer the ds-docs Component API and token reference, which are extracted from source
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

## 4. Overriding a component

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

## 5. What this file does not cover yet

Colour pairing (which surface takes which text role), motion (when a transition earns its
place) and content rules (labels, empty states, error copy) are not written down here yet.
Until they are, ds-docs `Practice → Do / Don't` carries the component-choice decisions —
modal vs drawer, button hierarchy, table density, status without colour — and
`Practice → Token Discipline` carries the token-vs-literal rule in worked form.
