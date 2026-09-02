---
category: Forms & inputs
---
Checkbox with an inline `label` beside the box and a `hint` line below. Sizes `sm`/`md`/`lg`. Checked state follows the Input pattern: pass `checked` + `onCheckedChange` (controlled) or just an initial `checked`.

- `indeterminate` shows the partial/mixed visual — independent of `checked` (use for "some children selected" parents).
- `invalid` applies error styling + `aria-invalid`; put the error text in `hint`.
- `required` shows an asterisk and sets `aria-required`; `disabled` blocks interaction.
- Omit `label` to bring your own `<label>` — set `inputId` so its `for` matches.

```tsx
<Checkbox label="Add tail-lift on delivery" hint="Adds £15 per drop." />
<Checkbox label="Select all depots" indeterminate />
```
