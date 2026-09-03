# Card

Content surface (`<article>` inside the host). No named slots — compose header/body/footer freely as children.

- `elevation`: `'flat'` (default, bordered) | `'raised'` | `'hover'` (elevates on hover) | `'interactive'` (clickable: role="button", tabindex, Enter/Space activate, fires `onPressed`).
- `padding`: `'none' | 'sm' | 'md' | 'lg'`; unset (null) keeps the card's default padding. Use `'none'` for full-bleed media, then pad inner sections yourself.
- `onPressed` only fires when `elevation="interactive"`.

```tsx
<Card elevation="interactive" onPressed={openShipment}>
  <h3>Shipment #48211</h3>
  <p>Leeds depot → EC1A 1BB, out for delivery</p>
</Card>
```
