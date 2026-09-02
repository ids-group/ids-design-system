---
category: Navigation
---
Thin separator between groups of `MenuItem`s — port of `ds-menu-divider`. No props. The host carries `role="separator"` with horizontal orientation; use it to split routine actions from destructive ones.

```tsx
<Menu>
  <MenuItem>Reassign driver</MenuItem>
  <MenuDivider />
  <MenuItem error>Cancel job</MenuItem>
</Menu>
```
