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
