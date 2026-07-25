---
category: Navigation
---
Menu list surface — port of `ds-menu`. Renders the `role="menu"` list; compose `MenuItem` (and `MenuDivider`) children. ArrowUp/ArrowDown/Home/End move focus between enabled items.

- Standalone it draws its own border/background. Inside a `Popover` the DS CSS drops the frame and padding so the popover surface shows through — `Popover > Menu > MenuItem` is the canonical dropdown composition.
- The trigger button is the consumer's (or use `SplitButton` for the fused main-action + menu pattern).
- Roving tabindex: pass `tabbable={false}` to all but one enabled `MenuItem` to match the Angular at-rest behaviour; by default every item is tabbable.

```tsx
<Menu>
  <MenuItem icon="edit" onPressed={rename}>Rename route</MenuItem>
  <MenuItem icon="copy" tabbable={false}>Duplicate</MenuItem>
  <MenuDivider />
  <MenuItem icon="trash" error tabbable={false}>Delete route</MenuItem>
</Menu>
```
