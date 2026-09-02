---
category: Forms & inputs
---
what3words pill (`ds-w3w`) — displays a three-word location identifier (`///daring.lion.race`) as a monospace, brand-coloured token with a map icon; the `///` prefix mark is danger-red. Not a text input: it is a read-only, click-to-copy display chip that sits with badges/tags as a pill-family component.

- `address` (required): the three-word string WITHOUT the prefix, e.g. `"daring.lion.race"`.
- `prefix` defaults to `"///"` and renders as the red `.mark` before the address.
- `copyable` (default `true`): the whole pill becomes a keyboard-activatable button (`role="button"`, Enter/Space) that writes `prefix + address` to the clipboard and shows a trailing copy icon. `onCopied(address)` fires after copy.
- `copyable={false}` renders a static pill — no role/tabindex, no copy icon.

```tsx
<W3w address="daring.lion.race" onCopied={(addr) => toast(`Copied ///${addr}`)} />
```
