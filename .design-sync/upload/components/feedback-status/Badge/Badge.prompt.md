# Badge

Status/count chip. Colour comes from the consumer's status wiring — the DS predefines NO statuses; an unset `status` renders the neutral surface. `data-status` is set on the host so app CSS can wire `--ds-badge-bg-color` / `--ds-badge-label-color` per key.

- Label mode: children text, optional `withDot` leading dot, `solid` accent fill.
- Count mode: `count` (number) replaces children; capped at `max` (default 99) as "99+".

```tsx
<Badge withDot>In transit</Badge>
<Badge count={140} max={99} />
```
