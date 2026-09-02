# Stepper

Progress stepper (`ds-stepper`) — numbered nodes joined by connectors, one per entry of `steps` (plain string labels). States derive entirely from `current` (zero-based) + `errorSteps`: earlier = completed (check icon), `current` = active (filled), later = upcoming (number); indices in `errorSteps` render the error glyph and win over everything.

- `orientation="vertical"` stacks steps top-to-bottom; `labelPosition="inline"` puts captions beside nodes in a compact row (default `"bottom"` is the full-width wizard layout).
- `clickable` turns nodes into buttons and fires `onStepClicked(index)` — the component never changes `current` itself; update it in the callback.
- Completed connectors highlight only up to `current` (and never on error steps).
- Horizontal default stretches steps evenly (`flex: 1`) — give it real width.

```tsx
<Stepper
  steps={['Collection booked', 'In transit', 'At depot', 'Delivered']}
  current={2}
/>
```
