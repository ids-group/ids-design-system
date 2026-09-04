# Button

Action button with two orthogonal axes: `color` (primary | secondary | tertiary | neutral | error | success | warning) and `variant` (solid | tonal | outline | ghost | text). Default is primary solid. All pairs render, but prefer solid/tonal for success & warning and tonal/outline/ghost for neutral; `variant="text"` is discouraged — use the global `.link` class for link-styled actions.

- Sizes `sm`/`md`/`lg` = 32/40/48px, aligned with Input/Select heights.
- `icon`/`trailingIcon` take DS icon names; `subtext` renders a second smaller line.
- `loading` disables interaction and shows the busy spinner; `fullWidth` stretches to the container.
- Click handler is `onPressed` (blocked while disabled/loading).
- Icon-only actions → IconButton.

```tsx
<Button icon="plus" onPressed={createShipment}>New shipment</Button>
<Button color="error" variant="outline">Delete</Button>
```
