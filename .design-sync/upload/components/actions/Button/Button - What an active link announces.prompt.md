# Buttons - what an active link announces

A link that IS the current page announces aria-current="page"; a link to a section the reader is INSIDE announces aria-current="true", which is what ARIA means by each. The active class stays prefix-matched so a section link keeps looking lit — they are separate questions, and routerLinkActiveOptions moves the class without touching the announcement. Both buttons below are active on this page; only the first one IS this page.

Full API: `Button.d.ts`. How to use the component anywhere: `Button.prompt.md`.
