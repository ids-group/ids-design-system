# Accordion

Bordered stack of collapsible sections. Wraps `AccordionItem` children; the host itself carries the outer border + `radius-lg`, and a hairline divider renders between adjacent items automatically.

- `multiple` (default `true`): when `false`, opening one item closes all others (single-open mode) — coordination is automatic between uncontrolled items.
- Compose only with `AccordionItem` children; the accordion has no other slots or content.

```tsx
<Accordion multiple={false}>
  <AccordionItem title="Delivery windows" expanded>
    Standard slots run 08:00–18:00, Monday to Saturday.
  </AccordionItem>
  <AccordionItem title="Proof of delivery">Photo capture is required at the doorstep.</AccordionItem>
</Accordion>
```
