# Segmented

Radio-like segmented control (`role="radiogroup"`) for switching between mutually exclusive views or modes — e.g. List / Map / Timeline. One segment is always the selection; for a standalone on/off control use ToggleButton instead.

- `options: SegmentedOption[]` — `{ label, value, icon?, disabled? }`; icons render at 16px before each label.
- `value` + `onValueChange` — controlled when the callback is provided, otherwise self-managed (seeded from `value`). The selected segment gets the `selected` class and `aria-checked`.
- Set `ariaLabel` to name the control. Arrow/Home/End keys move the selection (roving tabindex, disabled segments skipped).

```tsx
<Segmented
  ariaLabel="View mode"
  options={[
    { label: 'List', value: 'list', icon: 'menu' },
    { label: 'Map', value: 'map' },
    { label: 'Timeline', value: 'timeline' },
  ]}
  value={view}
  onValueChange={setView}
/>
```
