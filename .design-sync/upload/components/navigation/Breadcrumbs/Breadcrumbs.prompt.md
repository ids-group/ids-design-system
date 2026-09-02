# Breadcrumbs

Breadcrumb trail (`ds-breadcrumbs`) — data-driven, not projected links: pass `items` as `{ label?, href?, icon? }[]`. The last item always renders as the bold, non-clickable current page (`aria-current="page"`); earlier items with `href` render as anchors when `clickable`.

- `onNavigate(item)` fires on crumb activation; default anchor navigation is ALWAYS prevented — do router navigation in the callback.
- `clickable={false}` renders the whole trail static (`.is-static`); `separator` swaps the between-crumb icon (default `"chevronRight"`).
- Labels ellipsize at 16ch (32ch for the current crumb); the trail never wraps.
- The Angular `BreadcrumbsService`/router fallback doesn't exist in React — always pass `items` explicitly.

```tsx
<Breadcrumbs
  items={[
    { label: 'Depots', href: '/depots', icon: 'home' },
    { label: 'Leeds LS9', href: '/depots/leeds' },
    { label: 'Bay allocations' },
  ]}
  onNavigate={(item) => router.push(item.href!)}
/>
```
