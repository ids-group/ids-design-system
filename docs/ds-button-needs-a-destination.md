# `ds-button` cannot be a link, and on a marketing site most buttons are links

Request, 2026-09-09, from a public marketing site being moved onto the DS.

## The measurement

That consumer styles 31 controls as buttons. **27 of them sit on `<a>`** — router navigation or an
external href — and 4 on `<button>`. The ratio is not an accident of that codebase: a marketing page
is mostly navigation wearing a button's clothes, where an admin screen is mostly actions.

`ds-button` renders `<button>` and takes `type: 'button' | 'submit' | 'reset'`. It has no `href` and
no `routerLink`, and the package exports no attribute directive that could dress a host the consumer
owns — the six are `dsBrandName`, `dsCellTemplate`, `dsFieldClickFocus`, `dsRailTrigger`,
`dsReserveMessages`, `dsTooltip`. So there is no supported way to give an anchor the button's look.

## Why every workaround is worse than the gap

- **Turn the links into buttons.** Middle-click, open-in-new-tab, copy-link-address and the "link"
  role a screen reader announces all go. Navigation stops being navigation.
- **Wrap: `<a><ds-button>`.** An interactive element inside an interactive element — invalid HTML,
  and a worse defect than the one it works around. `ds-sidenav`'s own documentation states the same
  rule for its brand row: *"A collapse toggle projected into the row stays OUTSIDE the link — one
  control never nests inside another."*
- **Copy the button's classes onto an anchor.** `design-system.md` §7 rules this out by name:
  reaching for an internal class "works until the internals move".

So a consumer with 27 link-buttons either keeps a hand-written `.btn` class forever, or breaks
navigation. Both leave the DS's focus ring, disabled handling and press feedback off the most-clicked
controls on the site.

## The library already solves this, one component over

`ds-sidenav-item` picks its element from its destination, and its own documentation states the rule:

> **Three elements, decided by destination.** `routerLink` → an `<a [routerLink]>` with
> `routerLinkActive`; `href` → a plain `<a href>`; **neither → a `<button type="button">`**. Styling
> is identical across all three — the rules are class-based (`.item`) and the button's UA chrome is
> reset — so target the class, never the tag.

The template is three branches sharing one `#content` template, and the same entry already refuses
the shortcut this request also refuses: an item with no destination is a button, because `href="#"`
navigates.

## What is being asked for

Apply that pattern to `ds-button`. In preference order:

1. **`routerLink` / `href` inputs on `ds-button`**, resolving the element the way `ds-sidenav-item`
   already does, with the styling staying class-based so all three render identically. `type`,
   `loading` and `disabled` stay button-only; on an anchor, disabled is `aria-disabled` plus
   `tabindex="-1"`, which is the treatment `ds-sidenav-item` already applies.
2. **A `[dsButton]` attribute directive** that applies the button's appearance to a host the consumer
   owns, taking the same `color` / `variant` / `size` inputs. This is the smaller change and it also
   covers hosts the DS will never enumerate.
3. **A documented recipe**, if neither lands: name the supported way to render a link that looks like
   a button, so consumers stop each inventing their own.

## What it unblocks

The consumer above can then put every one of its 31 controls on the DS instead of 4, which is the
difference between the design system reaching its most-clicked surface and stopping at the four
places that happen to be forms.

---

## Answered 2026-09-09 — preference 1, and it is the whole answer

**`ds-button` takes `routerLink` and `href`.** Three elements decided by destination, exactly as
`ds-sidenav-item` does it: `routerLink` → `<a [routerLink]>` with `routerLinkActive`, `href` →
`<a href>`, neither → `<button type="button">`. The styling is class-based, so all three render
identically — measured: zero differences across eleven computed properties and an identical class
list, and the focus ring is `2px solid` at `offset 2px` on the anchor exactly as on the button,
under real keyboard focus.

`type` and `loading` stay button-only and warn in dev if set on a link. A disabled link takes
`aria-disabled` plus `tabindex="-1"`, and its click is swallowed — which is what stops an `href`
from navigating, since `aria-disabled` is a label and not a behaviour. `disabledReason` reads the
same on all three.

The consumer's 31 controls are now all reachable: 27 anchors and 4 buttons, one component.

### Preference 2 was NOT taken, and the reason is preference 1

A `[dsButton]` directive was built and reverted the same day. It was the Ask's fallback for if
option 1 could not land, and option 1 landed — which leaves the directive covering only hosts a
consumer cannot replace with `ds-button` at all: a `<summary>` inside a `<details>`, or a
third-party control that exposes nothing but a class name. **No such host was measured**, here or
anywhere else.

Against that: a directive cannot carry a stylesheet, so its appearance has to come from a global
class, which means emitting the button's whole visual body a second time. Measured on the compiled
sheet: **9 722 B raw, 1 367 B gzip — 11.3% of the gzipped global stylesheet**, paid by every
consumer whether they use it or not, plus a public class name to support forever. That is a real
price for a capability nothing has asked for with a number.

If a `<summary>`-shaped host turns up and is measured, the work is small and this is the shape:
one shared mixin holding the appearance (the extraction is proven to change no compiled CSS), a
global `.ds-button` in its own partial that consumers `@use` explicitly rather than one forwarded
from `styles/ds`, and the directive writing the class names.

### Preference 3 — the recipe

**A control that navigates is a `ds-button` with a destination.** That is the supported way, and
there is now no case where copying the button's classes onto an anchor is the answer:

```html
<ds-button routerLink="/reports" icon="arrowRight">Go to reports</ds-button>
<ds-button href="https://example.com" variant="outline">Read the spec</ds-button>
```

**A control that acts is a `ds-button` with no destination** and a `(pressed)` handler. For a
link-STYLED action — the underlined look, not the button look — the global `.link` class on a
`<button>` remains the answer, and `variant="text"` still warns in favour of it.

**A host you cannot replace has no supported treatment**, and reaching for `.button` by class is
ruled out by `design-system.md` §7 — it works until the internals move. Ask for it instead: an Ask
with a count of such hosts is what would reopen preference 2.
