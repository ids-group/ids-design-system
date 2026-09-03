# Switch

Toggle switch (`role="switch"`) with inline `label` and `hint` below — use for instant on/off settings, not form choices that need a submit. Same state pattern as Checkbox: `checked` + `onCheckedChange` (controlled) or just an initial `checked`. Sizes `sm`/`md`/`lg`.

- `variant` colours the checked track: `default` | `success` | `error`.
- `invalid` applies error styling + `aria-invalid`; `required` adds the asterisk + `aria-required`.
- Omit `label` to bring your own `<label>` — set `inputId` to wire it.

```tsx
<Switch label="SMS updates to driver" checked={sms} onCheckedChange={setSms} />
<Switch label="Depot open" variant="success" checked />
```
