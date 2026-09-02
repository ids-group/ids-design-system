---
category: Navigation
---
Tabbed panels (`ds-tabs`) — a compound: compose with `Tab` children, and the parent renders the tab BAR from the children's props plus the active panel below (ARIA APG tabs with roving tabindex, automatic activation, Home/End keys).

- Selection: `selectedIndex` (default 0) + `onSelectedIndexChange` (controlled when the callback is provided, self-managed otherwise).
- `variant="line" | "pills"` — underline strip vs pill buttons. `orientation="vertical"` puts the tab list beside the panel.
- `scrollable` makes the strip scroll horizontally instead of wrapping; `lazy` mounts a panel only on first activation (kept alive after).
- `closable` adds an × per tab and Delete-key close; it only EMITS `onTabClosed(value ?? label)` — YOU must remove the `Tab` from children. Non-lazy mode renders only the active panel.
- Panel content lives on each `Tab`'s `children`; per-tab metadata (`label`, `icon`, `count`, `disabled`, `value`) also lives on `Tab`.

```tsx
<Tabs selectedIndex={tab} onSelectedIndexChange={setTab}>
  <Tab label="Active loads" count={12}>…</Tab>
  <Tab label="Completed" icon="check">…</Tab>
  <Tab label="Cancelled" disabled>…</Tab>
</Tabs>
```
