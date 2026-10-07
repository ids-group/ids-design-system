# Sidenav Footer - the rail footer on its own

<ds-sidenav-footer> is the rail part you configure, not compose: profile row, alert bell, collapse handle. [collapsed] picks the state. Width comes from the sidenav; outside one, give it a frame.

It only emits collapseToggled and signOutSelected; the parent acts, so the unbound collapse row here does nothing. A null searchProvider or alertItems makes that row inert; an empty profileRoute makes "Your profile" a no-op.

Full API: `SidenavFooter.d.ts`. How to use the component anywhere: `SidenavFooter.prompt.md`.
