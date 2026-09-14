# Buttons - everything else a link can carry

fragment, queryParams and queryParamsHandling go with a routerLink; target and rel go with either link. Each is a pass-through to the element the component already renders, and each warns in dev on a destination that cannot carry it. For the options with no input of their own — relativeTo, preserveFragment — build a UrlTree with Router.createUrlTree and pass that as the routerLink.

No live demo for fragment on this site: a docs URL already names its section in the path, so a fragment here would be a no-op — which its own link check enforces.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
