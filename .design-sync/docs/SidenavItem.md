---
category: Navigation
---
Single sidenav link — port of `ds-sidenav-item`. An anchor with leading icon, label, and optional trailing extras; place inside `Sidenav` (directly or via `SidenavGroup`).

- `label` is required — visible text expanded, `aria-label` when the rail is collapsed (icon-only). `icon` names a DS icon (20px); `iconSlot` projects custom markup instead.
- `active` paints the filled accent treatment + left rail inset and sets `aria-current="page"`. `disabled` greys it out, removes it from tab order, and sets `aria-disabled`.
- End-of-row extras: `badge={12}` pill count, `hasAlert` red dot (both hidden when collapsed, except the dot which pins to the icon corner), `trailing` for arbitrary content (status pill etc.).
- `href` defaults to `'#'`. The Angular `routerLink` input and the collapsed hover tooltip are not ported — do routing via `href` or by intercepting clicks.
- The type `SidenavItemModel` (`{ id, label, href?, active?, badge?, hasAlert? }`) is exported for app-level nav configs.

```tsx
<SidenavItem icon="truck" label="Shipments" href="/shipments" active badge={12} hasAlert />
```
