---
category: Feedback & status
---
Single toast notification pill — port of `ds-toast`. In Angular these are raised at runtime by ToastService; this binding renders the specimen statically wherever you place it (stack several with `ToastRegion`).

- `variant`: `'info' | 'success' | 'warning' | 'error' | 'loading'` (default `'info'`) — sets the accent bar, default icon (spinner for `loading`) and ARIA (`error`/`warning` → `role="alert"` assertive; others → `role="status"` polite).
- `body` is the message; optional `title` renders bold above it. `children` append extra body content.
- `dismissible: true` shows the × close button; it and an invoked `action` both fire `onClosed`.
- `action: { label, handler }` renders one text action button (e.g. "Undo", "Retry"); `icon` overrides the variant's default glyph; `actions` slots custom trailing controls.

```tsx
<Toast
  variant="success"
  title="Shipment booked"
  body="Order #48211 assigned to Leeds depot."
  dismissible
  action={{ label: 'View', handler: openOrder }}
  onClosed={hide}
/>
```
