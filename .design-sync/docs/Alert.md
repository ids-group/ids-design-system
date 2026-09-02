---
category: Feedback & status
---
Inline contextual message for a form or content area. `variant` (info | success | warning | error | neutral, default info) drives the tint, the default icon and the ARIA semantics — error/warning render `role="alert"`/assertive, the rest `role="status"`/polite.

- Children are the message body; `title` adds a bold heading above it.
- `actions` slot renders inline actions under the message (small ghost/tonal Buttons).
- `dismissible` shows a close (×) button firing `onClosed`; the Alert does NOT hide itself — the parent must remove it.
- `icon` overrides the variant's default icon (pass a DS icon name); it is always shown.
- Inline element (`inline-flex`) — it shrink-wraps; for full-width page strips use Banner instead.

```tsx
<Alert variant="warning" title="Depot at capacity" dismissible onClosed={dismiss}>
  Croydon depot is at 92% capacity — new inbound shipments may be delayed.
</Alert>
```
