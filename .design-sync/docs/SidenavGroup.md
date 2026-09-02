---
category: Navigation
---
Labelled or collapsible section of the sidenav rail — port of `ds-sidenav-group`. Wrap `SidenavItem` children; nested groups work.

- Default (non-expandable): renders a small uppercase `.group-label` heading above the items. `expanded` is ignored visually — the body always shows.
- `expandable`: the heading becomes a toggle button with optional `icon` (18px, or `iconSlot` for custom markup), the `label` as title, and a rotating caret. Closed state hides the indented body (`height: 0` + `inert`); the open group gets a subtle background via `:has()`.
- `expanded` is the Angular two-way `model()` (default true): pass `onExpandedChange` to control it, or omit for internal state seeded from `expanded`.
- Inside a collapsed `Sidenav` the label/title/caret hide automatically (icon-only rail).

```tsx
<SidenavGroup label="Fleet" icon="truck" expandable expanded>
  <SidenavItem icon="box" label="Shipments" badge={7} />
  <SidenavItem icon="user" label="Drivers" />
</SidenavGroup>
```
