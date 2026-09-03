---
category: Data display
---
One collapsible section inside an `Accordion`: a full-width header toggle button (title, optional `badge` content, chevron that rotates 90° when open) above a body region that expands with a grid animation.

- `title` (required): header text.
- `expanded`: open state. Controlled when `onExpandedChange` is provided; otherwise internal state seeded from it — pass `expanded` alone to render a section open statically.
- `disabled`: greys out and locks the toggle; the current open state stays as-is.
- `badge`: trailing header content next to the title (e.g. `<Badge>3</Badge>`) — sits before the chevron.
- Body content is `children`; it is inert (hidden from interaction/AT) while collapsed.

```tsx
<AccordionItem title="Open exceptions" badge={<Badge status="warning">2</Badge>} expanded>
  Two shipments at the Leeds depot are awaiting re-delivery slots.
</AccordionItem>
```
