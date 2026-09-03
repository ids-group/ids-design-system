# Tabs - lazy

When lazy is set, each tab's content is instantiated only the first time that tab is activated, then kept alive (not destroyed on switch). Without lazy only the active panel renders (default).

Instantiated on first visit, kept alive thereafter.

Not created until you switch here — then stays mounted.

Deferred until first activation.

Full API: `Tabs.d.ts`. How to use the component anywhere: `Tabs.prompt.md`.
