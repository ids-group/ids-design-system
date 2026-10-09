---
category: Overlays
---
Small icon button that carries supplementary text - `ds-info-hint`, a 14px question mark or "i" placed beside a label or heading. The tip shows on hover and focus, and a click pins it open until a press outside, Escape or blur.

- `text` (required) is the tip; `ariaLabel` (required) is the button's accessible name, such as "About conversion rate".
- `icon` is `'help'` (default, a question mark in a circle) or `'info'` (an "i").

```tsx
<InfoHint text="Share of visits that end in an order" ariaLabel="About conversion rate" />
<InfoHint icon="info" text="Updated hourly" ariaLabel="About refresh rate" />
```
