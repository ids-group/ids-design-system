---
category: Data display
---
Label/filter chip. Two fills: `solid` (default, brand accent — high-emphasis selected token) and `neutral` (grey surface + border — low-emphasis metadata).

- `closable` adds a × button; it fires `onClosed` (and stops the click reaching the tag). Set `closeLabel` to a descriptive AT name, e.g. "Remove Depot filter".
- `interactive` makes the whole tag a toggle button (fires `onToggled` on a click, Enter or Space, and is a tab stop); pair with `selected` for the active filter-chip state (accent tint + inset border).
- Not for status vocabulary — that's Badge/StatusDot territory.

```tsx
<Tag variant="neutral" interactive selected onToggled={toggleDepot}>Leeds depot</Tag>
<Tag closable closeLabel="Remove Fragile label" onClosed={removeLabel}>Fragile</Tag>
```
