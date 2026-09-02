---
category: Data display
---
One row of a `List` (`role="listitem"`) with a leading / body / trailing layout. `title` + `subtitle` cover the common two-line case; richer middle content goes in `children`.

- `leading` / `trailing`: slots either side of the body — avatar, icon, `Badge`, chevron.
- `clickable`: swaps the inner wrapper for a full-row `<button class="activator">` and fires `onActivated`; also enables hover styling.
- `selected`: marks the row current (host class + `aria-current` on the button when `clickable`).
- `disabled`: host class always; actually blocks interaction only when `clickable`.

```tsx
<ListItem
  clickable
  selected
  title="ORD-20871"
  subtitle="Out for delivery — SW1A 2AA"
  leading={<Avatar name="Amelia Barnes" />}
  trailing={<Badge tone="success">On time</Badge>}
  onActivated={openOrder}
/>
```
