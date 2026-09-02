---
category: Actions
---
Standalone binary on/off toggle button with a projected label and optional leading icon. Sets `aria-pressed` from its state. Distinct from Segmented (one-of-many value toggle) and from IconButton's `selected` (icon-only toggle) — this is a labelled on/off control (e.g. "Show completed", filter chips in a toolbar).

- `pressed` + `onPressedChange` — controlled when the callback is provided, otherwise self-managed (seeded from `pressed`).
- `icon` takes a DS icon name, rendered at 14px before the label.
- `disabled` blocks toggling. Label goes in `children`.

```tsx
<ToggleButton icon="filter" pressed={onlyLate} onPressedChange={setOnlyLate}>
  Late deliveries only
</ToggleButton>
```
