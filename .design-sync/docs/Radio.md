---
category: Forms & inputs
---
Single radio button with inline `label` and `hint` below. Usually placed inside `RadioGroup`, which supplies the shared `name`, selection state and disabled state — set a distinct `value` on each option (compared against the group's selection). Sizes `sm`/`md`/`lg`.

- Inside a group: `checked`/`onCheckedChange`/`name` are ignored — the group's `value` decides which option is checked.
- Standalone: pass `checked` + `onCheckedChange` (fires `true` on select; radios never uncheck themselves) and your own `name`.
- `invalid`, `required` and `disabled` work per-option; a disabled parent group disables all options.
- Omit `label` to bring your own `<label>` — set `inputId` to wire it.

```tsx
<Radio value="ndd" label="Next-day delivery" hint="Arrives before 17:00." />
```
