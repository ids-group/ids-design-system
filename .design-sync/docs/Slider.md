---
category: Forms & inputs
---
Horizontal value slider with a filled track segment. Single thumb by default; `range` switches to two thumbs and a `[low, high]` tuple value.

- Value: `value` + `onValueChange` (controlled) or an initial `value` (number, or `[low, high]` when `range`). `min`/`max` default 0/100; `step` (default 1) snaps drags and arrow-key nudges.
- The fill and thumb positions are inline left/width percentages computed from value/min/max — a static `value` renders the filled state with no interaction needed.
- Keyboard per thumb: arrows ±step, PageUp/PageDown ±10×step, Home/End to that thumb's bound; in `range` mode thumbs clamp against each other.
- `invalid` recolours fill and thumb borders to the error colour; `hint` renders below; `ariaLabel` names the thumb(s) — suffixed "minimum"/"maximum" in range mode.

```tsx
<Slider value={65} min={0} max={100} ariaLabel="Vehicle load" hint="Trailer capacity used (%)" />
<Slider range value={[9, 17]} min={0} max={24} ariaLabel="Delivery window" />
```
