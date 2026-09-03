# Breadcrumbs - long trail · ellipsis collapse

Six levels, capped with [maxItems]="4" — the first and the LAST always survive, and the collapsed crumb says how many it stands for. Worth setting on any trail that can get deep: the row is nowrap with overflow: hidden, so an uncapped overlong trail is clipped from the END — the current page, the one crumb the reader needs most.

Full API: `Breadcrumbs.d.ts`. How to use the component anywhere: `Breadcrumbs.prompt.md`.
