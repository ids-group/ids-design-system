# Sidenav - default

Three groups, brand mark at the top, one item active. Each item exposes an (activate) output (the click MouseEvent) — preventDefault() intercepts navigation on an href item (a routerLink navigates regardless), e.g. to drive scroll-spy.

Projection slots: an item takes [icon] (custom icon, when the icon input is unset) and [trailing] (content before the badge); a group takes [ds-group-icon].

Full API: `Sidenav.d.ts`. How to use the component anywhere: `Sidenav.prompt.md`.
