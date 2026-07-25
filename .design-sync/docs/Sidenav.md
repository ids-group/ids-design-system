---
category: Navigation
---
Vertical navigation rail — port of `ds-sidenav`. Flex column with a brand row on top; compose `SidenavGroup`/`SidenavItem` children (and optionally a `SidenavFooter` last — it pins itself to the bottom).

- `collapsed` shrinks the rail to icon-only width AND drives the collapsed styling of every nested item/group: the host carries `.sidenav.collapsed`, the ancestor class their CSS keys off. Always set `collapsed` here, not on items.
- Brand row: `brand="MyAdmin"` renders a letter-mark tile + wordmark; `logoLetter="A"` overrides the tile glyph; `brandSlot` injects a custom logo node (the `[brand]` slot); `brandName` replaces the plain wordmark text with custom markup (the `[dsBrandName]` slot — tile still comes from `brand`/`logoLetter`). No brand at all → the row collapses via `:empty`.
- Items/groups read the collapsed state via context — they must be inside the `Sidenav` subtree (arbitrary wrappers in between are fine).
- Width/colors themeable via `--ds-sidenav-width`, `--ds-sidenav-width-collapsed`, `--ds-sidenav-bg-color`, `--ds-sidenav-mark-bg-color`.
- Tall component — it expects a full-height rail (natural home: `AppShell`'s `sidenav` prop).

```tsx
<Sidenav brand="IDS Fleet" collapsed={isCollapsed}>
  <SidenavItem icon="home" label="Dashboard" active />
  <SidenavGroup label="Operations">
    <SidenavItem icon="truck" label="Shipments" badge={12} />
    <SidenavItem icon="map" label="Routes" />
  </SidenavGroup>
</Sidenav>
```
