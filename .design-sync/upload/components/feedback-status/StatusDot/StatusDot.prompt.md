# StatusDot

Colour-coded dot atom (role="img"). The DS predefines NO statuses — `status` sets `data-status` on the host and app CSS wires `--ds-status-dot-color` per key; without one the dot is the muted neutral grey.

- `status`: free-form consumer key, e.g. `"in-transit"`, `"delayed"` — also used as the default aria-label.
- `ariaLabel` overrides the key with a human label ("Delayed at depot"); prefer it when the key isn't readable.
- Vertically centres itself against surrounding text (1em inline-flex host) — safe inline in table cells and list rows. For a dot inside a label chip use Badge `withDot`; for presence on people use Avatar `status`.

```tsx
<StatusDot status="delayed" ariaLabel="Delayed" /> Order #48211
```
