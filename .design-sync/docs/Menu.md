---
category: Navigation
---
Menu list surface — port of `ds-menu`. Renders the `role="menu"` list; compose `MenuItem` (and `MenuDivider`) children. ArrowUp/ArrowDown/Home/End move focus between enabled items.

- Standalone it draws its own border/background. Inside a `Popover` the DS CSS drops the frame and padding so the popover surface shows through — `Popover > Menu > MenuItem` is the canonical dropdown composition.
- The trigger button is the consumer's (or use `SplitButton` for the fused main-action + menu pattern).
- Roving tabindex is owned by `Menu`: exactly one item is tabbable at rest and the arrow keys move it. There is nothing to pass.

```tsx
<Menu>
  <MenuItem icon="edit" onPressed={rename}>Rename route</MenuItem>
  <MenuItem icon="copy">Duplicate</MenuItem>
  <MenuDivider />
  <MenuItem icon="trash" error>Delete route</MenuItem>
</Menu>
```
