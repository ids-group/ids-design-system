---
category: Navigation
---
Bottom block of the app sidenav — port of `ds-sidenav-footer`. Quick actions (Search / Alerts / Collapse) plus the signed-in user with an account menu. Pins itself to the bottom via `margin-top: auto` — render it as the LAST child of `Sidenav`.

- `collapsed` must mirror the parent `Sidenav`'s value (the footer styles its own icon-only mode); the Collapse row emits `onCollapseToggled` — the parent owns the state and the chevron flips (`chevronLeft`/`chevronRight`).
- Search: pass `searchProvider={(q) => results}` to make the row open a live results popover (grouped by `result.group`); omit it for an inert row. Alerts: `alertItems={[...]}` (even `[]`, which shows "You're all caught up.") enables the popover; `null`/omitted keeps the row inert; `alerts` shows the unread dot; opening emits `onAlertsOpened`.
- Profile block only renders when `userName` is set — avatar initials are derived automatically; `userRole` is the second line. The account menu has fixed items; "Sign out" emits `onSignOutSelected`, "Your profile" navigates to `profileRoute`.
- `onNavigate(route, queryParams?)` replaces the Angular `Router.navigate` for search results, alert clicks, and the profile item.
- Static preview props: `searchOpen` / `alertsOpen` / `accountMenuOpen` force a popover open; `query="dep"` pre-fills the search box so results render. Popovers render INLINE in the column (no portal) — an open panel pushes the rows below it.

```tsx
<SidenavFooter
  userName="Amelia Barnes"
  userRole="Dispatch manager"
  alerts
  alertItems={alerts}
  collapsed={isCollapsed}
  onCollapseToggled={() => setCollapsed(!isCollapsed)}
  onNavigate={(route) => router.push(route)}
/>
```
