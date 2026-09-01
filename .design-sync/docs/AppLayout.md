---
category: Navigation
---
Fixed-frame application shell — port of `ds-app-layout`. Pins itself to the viewport (`100dvh`, `overflow: hidden`); only the content region scrolls, so the sidenav rail and topbar stay put.

- Slots are props: `sidenav` (left rail, usually a `Sidenav`), `topbar` (usually a `Topbar`), `children` (page content, rendered inside the shell's own `<main><div class="inner">`).
- `topbarSpan`: `'content'` (default — rail spans full height, topbar sits above the content column only) | `'full'` (topbar spans the full width, rail + content below it).
- The shell renders the `<main>` landmark itself — never nest another `<main>` in the content.
- Content width/padding are themeable via `--ds-app-layout-content-max-width`, `--ds-app-layout-pad-x/-y`; shell height via `--ds-app-layout-height` (useful in embedded previews).
- Angular-only extras not ported: router scroll-to-top and the measured `--ds-scrollbar-width` right-inset compensation (CSS falls back to 0px).

```tsx
<AppLayout
  sidenav={<Sidenav brand="IDS Fleet">…</Sidenav>}
  topbar={<Topbar title="Shipments" />}
>
  <h1>Today’s deliveries</h1>
</AppLayout>
```
