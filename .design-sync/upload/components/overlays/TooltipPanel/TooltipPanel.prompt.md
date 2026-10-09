# TooltipPanel

Bare tooltip pill — port of `ds-tooltip-panel`, the dark surface `Tooltip` positions for you. Use directly only for static specimens (style guides, previews) where you place it yourself; product code should use `Tooltip`.

- `text` and `placement` are required; `placement` (`'top' | 'bottom' | 'left' | 'right'`) only sets the arrow direction — the host itself is `position: relative` and flows where you render it.
- `arrow` (default `true`): `false` draws the pill with no arrow.
- `text` renders `**bold**`; `\*\*` is a literal `**`. Nothing else is parsed; markup shows as typed.
- `panelId` sets the element `id` for `aria-describedby` wiring; `style` is for positioning glue.
- The host has `role="tooltip"` built in.

```tsx
<TooltipPanel text="Depot: Leeds LS9 8AG" placement="top" />
```
