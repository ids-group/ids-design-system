---
category: Data display
---
Vertical event list (`ds-timeline`) — a compound container (`role="list"`) whose expected children are `TimelineItem` elements. It has no props of its own; the marker column, connecting line and spacing are drawn by the items, and only the last item of the timeline draws no line below its marker.

- Order children in whatever chronology the page needs (newest-first for activity feeds, oldest-first for shipment histories).
- Items may sit inside wrapper elements of their own; the timeline finds them at any depth.

```tsx
<Timeline>
  <TimelineItem heading="Delivered" time="Today, 09:42" icon="check" tone="success">
    Signed for by A. Barnes at the Croydon depot.
  </TimelineItem>
  <TimelineItem heading="Out for delivery" time="Today, 07:15" icon="truck" tone="primary" />
  <TimelineItem heading="Order placed" time="Mon 21 Jul" />
</Timeline>
```
