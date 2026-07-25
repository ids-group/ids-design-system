---
category: Overlays
---
Hover/focus text tooltip — port of the Angular `[dsTooltip]` directive. Wrap the trigger element; the dark panel renders INLINE inside a relatively-positioned wrapper span (no portal), absolutely positioned 8px off the chosen side of the trigger.

- `text` (required) is the tooltip content — plain string only. Empty string never shows.
- `placement`: `'top' | 'bottom' | 'left' | 'right'` (default `'top'`) — sets both the panel position and its arrow direction.
- `open: true` forces the panel visible for static rendering; without it the panel shows on hover/focus after `delay` ms (default 120) and hides on leave/blur/Escape.
- A single-element child receives `aria-describedby` pointing at the panel while visible.
- Content is text-only by design (max-width capped by the DS token) — richer content belongs in `Popover`.

```tsx
<Tooltip text="Delete shipment" placement="bottom">
  <IconButton icon="trash" ariaLabel="Delete shipment" />
</Tooltip>
```
