---
category: Data display
---
One term/detail pair inside a `DescriptionList` (`role="group"` with a `role="term"` label and `role="definition"` value). Layout (side-by-side vs stacked) follows the parent list's `orientation` — don't set it here.

- `term`: the plain-text label.
- `children`: the value — plain text or rich content (`Badge`, `StatusDot`, links).
- `copyValue`: when set, a small copy button renders after the value and copies exactly this string to the clipboard (icon flips to a check for 1.2s). Use it for ids, references, postcodes.

```tsx
<DescriptionItem term="Tracking ref" copyValue="TRK-9982-XY">
  TRK-9982-XY
</DescriptionItem>
```
