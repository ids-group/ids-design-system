# Select

Single-choice dropdown field. Trigger button + listbox panel; `label` above, helper `hint` below, error via `invalid` (error text goes in `hint`). Sizes `sm`/`md`/`lg` = 32/40/48px, aligned with Input.

- Value: pass `value` + `onValueChange` (controlled) or just an initial `value`. Values are the option `value` strings.
- `options` is a data prop: flat `{ label, value, disabled?, icon? }` items and/or groups `{ label, options: [...], disabled? }` — groups render uppercase section headers; group `disabled` disables every option in it.
- **There is no `open` prop** — the trigger owns its open state and the panel is a CDK overlay PORTALED to `document.body`. `staticPreview` is the one way to render the panel in flow, which is how a static card shows one; `onOpened` fires when a real one opens.
- `clearable` shows an inline × when a value is selected; `readOnly` blocks opening and hides the chevron; `required` shows an asterisk, `optional` shows "(optional)".
- `loading`: with no options, the list shows three placeholder rows; with options, the rows stay under a `ds-loading-overlay` until it clears.
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
