---
category: Forms & inputs
---
Multi-choice dropdown. Selected options show as removable chips in the trigger; the panel has a filter input, optional "Select all" row and checkbox options. Helper `hint` below, error via `invalid`.

- Value: pass `value` (string[]) + `onValueChange` (controlled) or just an initial `value`. `options` is a flat `{ label, value, disabled? }` data prop — no groups.
- `open` + `onOpenChange` control the panel (uncontrolled fallback otherwise); the open panel renders inline inside the host — use `open` to show it statically.
- `maxVisibleChips={2}` collapses extra chips into "+N more"; `selectAll` adds a tri-state Select-all row scoped to the current filter; `searchPlaceholder` labels the in-panel filter.
- Chip × removes a value; Backspace in an empty filter removes the last chip. The panel filter is internal typing state (not a prop).

```tsx
<MultiSelect
  placeholder="Assign drivers"
  options={[
    { label: 'Amelia Barnes', value: 'ab' },
    { label: 'Ravi Chauhan', value: 'rc' },
  ]}
  value={drivers}
  onValueChange={setDrivers}
  maxVisibleChips={3}
  selectAll
/>
```
