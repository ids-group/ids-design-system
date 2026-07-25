---
category: Forms & inputs
---
Compact quantity control: − button, number input, + button. Sizes `sm`/`md`/`lg` via `size`; the whole control greys out with `disabled`.

- Value: `value` + `onValueChange` (controlled) or an initial `value` (default 0).
- `min` (default 0) and `max` (default null = unbounded) clamp both the buttons and typed input; the −/+ buttons auto-disable at the bounds. `step` (default 1) is the per-click delta.
- No visible label — pass `ariaLabel` for the input's accessible name. Typed input is parsed as an integer and clamped.

```tsx
<NumberStepper value={qty} onValueChange={setQty} min={1} max={20} ariaLabel="Pallet count" />
```
