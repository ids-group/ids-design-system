# Sidenav Footer - the rail footer on its own

<ds-sidenav-footer> is the one part of the rail a consumer configures rather than composes: it owns the profile row, the alert bell and the collapse handle. Both states below are the same element — [collapsed] switches it. The width comes from the sidenav, so a footer shown outside one needs a frame of its own.

The footer only emits collapse (collapseToggled) and sign-out (signOutSelected); the parent acts on them, so the collapse row here, left unbound, does nothing. A null searchProvider or alertItems keeps that row inert, and an empty profileRoute makes "Your profile" a no-op.

Full API: `SidenavFooter.d.ts`. How to use the component anywhere: `SidenavFooter.prompt.md`.
