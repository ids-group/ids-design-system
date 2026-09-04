# App layout - opening the rail from your own chrome

Below the lg breakpoint the rail becomes an overlay, and the button that opens it lives in YOUR topbar — so the layout cannot wire it up for you. Two routes, and picking the wrong one is the easy mistake. On a native button put dsRailTrigger on it: the directive toggles the rail and keeps aria-expanded and aria-controls correct. On a ds-icon-button do NOT — the directive's attributes would land on the wrapper, and the inner button is what a screen reader reads. Bind that component's forwarding inputs instead, off a template ref: [ariaExpanded]="layout.railOverlay()? layout.railOpen(): null" and [ariaControls]="layout.railId". These docs use the second route — the burger at the top of this page on a narrow screen is it.

Both attributes are dropped while the rail is NOT an overlay: above the breakpoint the rail is permanently in the layout, so aria-expanded="false" would state the opposite of what the reader sees.

Full API: `AppLayout.d.ts`. How to use the component anywhere: `AppLayout.prompt.md`.
