# Select

Single-choice dropdown field. Trigger button + listbox panel; `label` above, helper `hint` below, error via `invalid` (error text goes in `hint`). Sizes `sm`/`md`/`lg` = 32/40/48px, aligned with Input.

- Value: pass `value` + `onValueChange` (controlled) or just an initial `value`. Values are the option `value` strings.
- `options` is a data prop: flat `{ label, value, disabled?, icon? }` items and/or groups `{ label, options: [...], disabled? }` — groups render uppercase section headers; group `disabled` disables every option in it.
- `open` + `onOpenChange` control the panel (uncontrolled fallback otherwise); the open panel renders inline inside the host — use `open` to show the dropdown statically.
- `clearable` shows an inline × when a value is selected; `readOnly` blocks opening and hides the chevron; `required` shows an asterisk, `optional` shows "(optional)".
- Selected option's `icon` also renders in the trigger. Keyboard: arrows/Home/End navigate, Enter/Space picks, Escape closes.

```tsx
<Select
  label="Depot"
  placeholder="Choose a depot"
  options={[
    { label: 'Birmingham Hub', value: 'bhx' },
    { label: 'Leeds North', value: 'lba', disabled: true },
  ]}
  value={depot}
  onValueChange={setDepot}
/>
```
