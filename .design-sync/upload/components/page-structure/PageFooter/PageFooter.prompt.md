# PageFooter

Page-bottom row (`ds-page-footer`) — the host element itself is the flex row (`justify-content: space-between`, wraps). Three variants via `variant`: `"default"` (plain border-top spread), `"compact"` (subtle bordered card), `"save"` (brand-tinted unsaved-changes bar).

- Slots (ReactNode props, in render order): `brand` (leading identity/summary text), `nav` (a `<nav>` of quiet links), `actions` (trailing buttons), then `children` for anything else.
- Every slot node becomes a direct flex child of the host — wrap multiple action buttons in one `<div style={{ display: 'flex', gap: 'var(--space-2)' }}>`.
- `save` is the unsaved-changes affordance: brand text like "Unsaved changes · 3 fields edited" plus Discard/Save buttons (size `sm`).

```tsx
<PageFooter
  variant="save"
  brand={<div>Unsaved changes · 3 fields edited</div>}
  actions={
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <Button color="neutral" variant="outline" size="sm">Discard</Button>
      <Button size="sm">Save changes</Button>
    </div>
  }
/>
```
