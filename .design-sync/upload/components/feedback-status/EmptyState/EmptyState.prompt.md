# EmptyState

Centred placeholder for regions with nothing (or nothing yet) to show: icon tile + `title` + `body` text + an `actions` CTA slot. `variant` (none | loading | error | locked | success, default none) tints the icon tile and picks the default icon (package / package / warn / lock / success); `variant="loading"` additionally covers the whole block with a LoadingOverlay scrim.

- `title` and `body` are plain strings; `actions` takes JSX (typically one primary Button, optionally a secondary).
- `icon` overrides the variant's default icon.
- Generously padded block element — drop it into the empty table/panel region itself.

```tsx
<EmptyState
  variant="none"
  title="No shipments scheduled"
  body="Book your first collection to see shipments here."
  actions={<Button icon="plus">Book collection</Button>}
/>
```
