# Timeline

Vertical event list (`ds-timeline`) — a compound container (`role="list"`) whose only expected children are `TimelineItem` elements. It has no props of its own; the marker column, connecting spine and spacing are all drawn by the items (the spine auto-hides on the last item via `:host(:last-child)` CSS).

- Order children in whatever chronology the page needs (newest-first for activity feeds, oldest-first for shipment histories).
- Don't wrap items in intermediate elements — the last-child CSS that ends the spine relies on `TimelineItem`s being direct children.

```tsx
<Timeline>
  <TimelineItem heading="Delivered" time="Today, 09:42" icon="check" tone="success">
    Signed for by A. Barnes at the Croydon depot.
  </TimelineItem>
  <TimelineItem heading="Out for delivery" time="Today, 07:15" icon="truck" tone="primary" />
  <TimelineItem heading="Order placed" time="Mon 21 Jul" />
</Timeline>
```
