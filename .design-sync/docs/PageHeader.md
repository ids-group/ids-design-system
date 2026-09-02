---
category: Page structure
---
Top-of-page block (`ds-page-header`) — eyebrow/title/subtitle stack with a breadcrumb trail above, an actions area on the trailing edge, an optional meta row and an optional tabs strip below. The `title` renders as the page `h1`.

- Text props: `eyebrow` (small uppercase label), `title`, `subtitle` — all optional strings; empty ones render nothing.
- Slots (ReactNode props, mirroring the Angular `ng-content` selects): `breadcrumbs` (above the title row — pass a `<Breadcrumbs>`), `titleBadge` (inline pill next to the h1 — max one `<Badge>`), `meta` (row under the subtitle; auto-hides when empty), `actions` (buttons, trailing edge), `tabs` (a `<Tabs>` strip below the row).
- `compact` tightens spacing and drops the title a size — index pages and dialogs.
- `divider` draws a bottom rule; default off. When `tabs` is present the divider is auto-suppressed (the strip supplies its own border). `metaDivider` rules above the meta row only.
- Meta items: give each child `className="meta-item"` for the DS icon+text treatment.

```tsx
<PageHeader
  eyebrow="Depot · 2026 cycle"
  title="Leeds LS9 depot"
  subtitle="30 Apr – 3 May · North Site · 4 sub-records"
  breadcrumbs={<Breadcrumbs items={trail} />}
  titleBadge={<Badge status="confirmed" withDot>Confirmed</Badge>}
  actions={<Button icon="plus">Add sub-record</Button>}
/>
```
