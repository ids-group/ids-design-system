# Migrating to the next release

The manifest (`../unreleased.json`) is the terse machine mirror — what a tool applies.
This is the human half: **where to look, what to change, and what you can now delete.**

> **If you are on 0.7.x**, you are taking two releases at once. Read the 0.8.0 notes
> first; everything below is on top of them.

---

## 1. What breaks — eight things, by where you will find them

Work through them in this order. The first three are one rename and are best done together.

### In your templates

| Look for | Change to | Notes |
| --- | --- | --- |
| `<ds-auth-shell>` | `<ds-auth-layout>` | Inputs, outputs and slots all keep their names |
| `sortMode` / `filterMode` **absent** on a `ds-table` | Add `sortMode="client"` (and `filterMode="client"`) **if the table holds every row** | The default flipped to `"server"`. See §2 |

### In your TypeScript

| Look for | Change to |
| --- | --- |
| `AuthShellComponent` | `AuthLayoutComponent` |

### In your stylesheets

| Look for | Change to | Notes |
| --- | --- | --- |
| `--ds-auth-shell-*` | `--ds-auth-layout-*` | Six tokens. **Do not** rename `--auth-card-w` — it carries no such prefix |
| `--search-h` | `--ds-search-height`, or `--ds-field-height` for the whole family | The global token is gone; a declaration of it is now inert |

### Visual changes to eyeball

- **`ds-search` is 40px tall, was 36px.** It was the only control in the library on that
  height. Restore with `ds-search { --ds-search-height: 36px; }` if your toolbar depends
  on it — but see §3 first, because a pin may not be what you want.
- **`ds-number-stepper` at `size="lg"` is 48px, was 44px.** Other sizes unchanged.

### Worth a deliberate pass, not a find/replace

- **`ds-tabs` can now own the URL.** Set `urlParam="tab"` and the active tab survives F5,
  a shared link and the Back button. Per strip: give each `ds-tab` a `value` (the URL is
  written from it, so without one your links carry the visible label and break when it is
  reworded), use **one parameter name per strip** (two strips sharing a name erase each
  other — there is a dev warning), and delete any hand-rolled `queryParamMap` + `navigate()`
  wiring, which would otherwise fight it.

---

## 2. The one that needs judgement per table

`sortMode` and `filterMode` default to `'server'` now, where they used to default to
`'client'`.

**Why it changed:** server-paged is the normal case, and there the old default was
actively wrong — the table sorted the page in hand, so rows looked sorted and were not.

**How to decide, per table:**

- **Binds `total`?** It is server-paged. The new default is what you wanted; do nothing.
- **Does not bind `total`?** It almost certainly holds every row. Add `sortMode="client"`,
  and `filterMode="client"` if any column has `filter: 'set'` — otherwise the headers stay
  clickable and do nothing.

**How to find them all:** run the app in dev and read the console. A reversed dev warning
now fires on exactly the case that needs your attention (no `total`, sortable or filterable
columns, no declared mode) and names each table.

---

## 3. What you can now DELETE — the half a migration guide usually leaves out

Two dogfooding audits (mm-ecm 2026-08-06, mm-broker 2026-08-07) read consumer stylesheets
as a record of what this library made them write. Both found the same thing: **most of the
workarounds were written against hooks that already existed** — the consumer had no signal
that anything had been tokenised since. That is a failure of these notes, not of the
consumer, so here is the list.

Search your styles for these; if you find them, they can go.

| If you have | Delete it, because |
| --- | --- |
| `.button.button.button { … }` or rules against `.v-outline` / `.c-secondary` | `ds-button` reflects `[data-variant]` and `[data-color]` on the HOST. Use `ds-button[data-variant="outline"]` |
| `--radius-sm: 0` to square a checkbox | `--ds-checkbox-radius` |
| `.title.title { font-size }` inside a modal | `--ds-modal-title-font-size` |
| Pagination label type overrides | `--ds-pagination-label-*` |
| `.size { display: none }` on a pager | `[showPageSize]="false"` — and it is now forwarded through `ds-table` too |
| `.actions:empty { display: none }` on a modal | The library already ships it |
| A defensive hover rule on the selected dropdown row | The `:not(.is-selected)` branch already handles it |
| `ds-menu-divider { padding: 0 }` | `--ds-menu-divider-spacing`, which already defaults to 0 |
| A dozen scattered `--ds-*-radius: 0` | Three role declarations: `--ds-radius-inner`, `-control`, `-panel` |
| A global rule squaring `.ds-overlay-pane` | Radius and elevation roles now travel onto portaled panes when the host overrides them |
| Absolutely positioning a search glyph over an autocomplete, or hiding `.autocomplete-chevron` | `dsAutocompletePrefix` and `[showChevron]="false"` |
| Querying the autocomplete's inner `<input>` and dispatching a synthetic `input` event to clear it | `clear()` |
| A hand-built KPI tile whose value is a badge | `ds-stat` takes a projected `[dsStatValue]` |
| A hand-rolled `.scrim` + `.panel` dialog, written because the modal header could not hold a badge or a second line | `ds-modal` projects `[title-badge]` and takes a `subtitle`. You get back the focus trap, focus restore, the scroll lock, Escape and the footer |
| `white-space: normal` forced onto a badge in a table cell | `--ds-badge-white-space` |
| `::ng-deep .card { height: 100% }` for equal-height cards | The card's box fills a stretched host on its own |
| `!important` on `ds-table` cell padding under `density="compact"` | Compact no longer out-specifies the padding hooks |
| A wrapper around `ds-table` for sort/range announcements, keyboard column resize, or a header filter the checklist cannot express | All three ship: the live region, the `role="separator"` handle, and `dsHeaderFilter` |

**How to check you got them all:** grep your styles for `::ng-deep`, `!important` and any
selector naming a DS internal class (`.button`, `.trigger`, `.option`, `.modal`). Each hit
is either a genuine gap worth reporting or an entry in the table above.

---

## 4. After you bump

- **Run the app in dev with the console open.** The library warns about the combinations it
  cannot fix for you: undeclared sort/filter mode, duplicate `urlParam`, lazy without
  `virtualScroll`, an unknown icon name, a projected stat value with an orphaned `unit`.
  Every warning names the component and what to do.
- **Check a toolbar and a form row side by side.** The field-height contract moved
  `ds-search`, so anything you had lined up by hand is worth a second look. If you pin
  heights per component, consider `[data-density]` instead — it retunes the whole family at
  once and survives the next change of this kind.
- **Tell us what you had to hand-roll.** The delete list in §3 exists because two consumers
  wrote forty lines of workarounds against hooks that were already there. If you are
  reaching into a DS internal, that is a gap worth filing.
