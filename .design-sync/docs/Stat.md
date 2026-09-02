---
category: Data display
---
KPI metric block: `label` above a headline `value`, then either a signed delta line or a plain caption. Both `label` and `value` are required.

- `unit` is appended flush after the value (e.g. `value={98} unit="%"`).
- `delta` (number): sign picks the arrow and colour — positive = up/green, negative = down/red, 0 = no arrow. `deltaLabel` suffixes the magnitude ("vs last month"). `deltaTone="neutral" | "secondary"` overrides the automatic colouring (e.g. when down is good).
- `caption` shows only when `delta` is unset; `deltaContent` (ReactNode) replaces the default "{magnitude} {deltaLabel}" text inside the delta line.
- `variant="error"` colours the value red; `size` = `'sm' | 'md' | 'lg'` type scale.

```tsx
<Stat label="On-time deliveries" value={96.4} unit="%" delta={2.1} deltaLabel="vs last week" />
```
