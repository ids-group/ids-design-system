---
category: Forms & inputs
---
Multi-line text field with the same anatomy as Input: `label` above, `hint` below, `invalid` for error styling (error text goes in `hint`). Sizes `sm`/`md`/`lg` change padding/typography; height comes from `rows` (default 3). Value: `value` + `onValueChange` (controlled) or just an initial `value`.

- `autosize` grows the field with content (CSS `field-sizing: content`) and forces `resize` off; bound it with `minRows`/`maxRows` (in lines — beyond `maxRows` it scrolls).
- Without autosize, `resize` controls the native handle: `vertical` (default) | `none` | `horizontal` | `both`.
- `maxLength` adds the native cap plus a live "{current}/{max}" counter; `required` / `optional` mark the label; `readOnly` allows focus but not edits.
- No visible `label`? Set `ariaLabel`.

```tsx
<Textarea label="Delivery instructions" hint="Gate codes, loading bay, contact on site."
  autosize minRows={3} maxRows={8} maxLength={280} />
```
