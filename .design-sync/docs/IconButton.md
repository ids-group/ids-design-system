---
category: Actions
---
Icon-only action button with its own Material-3-style fill taxonomy: `variant` (standard | filled | tonal | outlined, default standard = chromeless) crossed with the same `color` hue family as Button (primary | secondary | tertiary | neutral | error | success | warning). Use for toolbars, table-row actions, close/back/overflow affordances; use Button for labelled actions.

- `icon` and `ariaLabel` are both **required** — there is no visible text label.
- Sizes `sm`/`md`/`lg` = 32/40/48px (icon auto-scales 16/20/24), aligned with the field/button scale.
- `selected` renders the pressed/active look and sets `aria-pressed` — use it for toggle affordances (bookmark, pin).
- Click handler is `onPressed` (blocked while `disabled`). Disabled renders a muted tint of the variant's own colour, not flat grey.

```tsx
<IconButton icon="edit" ariaLabel="Edit delivery" variant="tonal" />
<IconButton icon="trash" ariaLabel="Delete" variant="outlined" color="error" />
```
