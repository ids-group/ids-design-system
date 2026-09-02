---
category: Overlays
---
Light surface overlay panel — port of `ds-popover`. This binding is the PANEL only: the trigger button is yours (bind `aria-haspopup`/`aria-expanded` on it and toggle `open`). The panel renders INLINE inside the host (no portal), so it flows where you place it rather than floating over the page.

- `open` defaults to **true** — a Popover with no trigger wiring renders visible out of the box. Toggle it from your trigger for show/hide.
- `placement`: `'top' | 'bottom' | 'left' | 'right'` (default `'bottom'`) — with `arrow: true` it sets the caret side via `data-placement`. Without `arrow` it has no inline effect.
- `arrow: true` renders the small caret pointing at the trigger.
- `panelRole="dialog"` + `panelLabel` for interactive popovers (forms, filter panels); leave `panelRole` unset for plain text content.
- `align` (`'start' | 'end'`) is kept for 1:1 API parity but has no visual effect inline (in Angular it feeds the CDK position strategy).
- A `Menu` child automatically loses its own border and the panel's padding (DS CSS), so `Popover > Menu > MenuItem` composes without double frames.

```tsx
<Popover arrow placement="bottom" panelRole="dialog" panelLabel="Delay reason" open={open}>
  <p>Trailer MAN-4419 held at Dover — customs check.</p>
</Popover>
```
