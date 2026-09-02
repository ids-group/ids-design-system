# Topbar

Horizontal app header — port of `ds-topbar`. Fixed-height flex bar with a bottom border, designed to sit in `AppLayout`'s `topbar` prop.

- All content goes through the four slot props; there is no children slot: `title` (bold heading block), `breadcrumbs` (rendered right after the title — pass a `Breadcrumbs`), `search` (sits in the flexible `.spacer` that absorbs leftover width), `actions` (right-aligned small-gap row — icon buttons, avatar).
- Empty slots still render their wrapper divs (matches the Angular template); the bar looks fine with only `title` + `actions`.
- Height/colors themeable via `--ds-topbar-height`, `--ds-topbar-bg-color`, `--ds-topbar-border`.
- Wide component — it wants the full row width.

```tsx
<Topbar
  title="Depot overview"
  search={<Search placeholder="Search shipments…" />}
  actions={<><IconButton icon="bell" ariaLabel="Alerts" /><Avatar size="sm" initials="AB" /></>}
/>
```
