# ColorPicker

Colour field — a swatch + hex trigger button opening a Photoshop-style panel: saturation/brightness plane, hue slider, live preview + hex input, and preset swatches. The plane and hue gradients are pure CSS, so the open panel renders fully statically.

- Value is a hex string (`"#2f54ff"`; 3- or 6-digit input accepted, normalised to lowercase 6-digit). Pass `value` + `onValueChange` (controlled) or just an initial `value` — defaults to `'#2F54FF'`.
- **The trigger owns its own open state — there is no `open` prop.** The panel is a CDK overlay PORTALED to `document.body`, so it floats over the layout and no prop shows it open in a static card.
- `presets` replaces the built-in 11-swatch palette (`readonly string[]` of hex values); picking a preset commits and closes. The selected preset gets a ring + `aria-pressed`.
- `disabled`, `invalid` (error border) and `hint` (helper text below the trigger) as on other fields; `ariaLabel` (default `"Choose colour"`) names both the trigger and the panel dialog.
- Interaction: pointer drag on the plane/hue track, arrow keys on either (Shift = steps of 10), free typing in the hex field commits as soon as it parses. Escape closes.

```tsx
<ColorPicker
  value={routeColour}
  onValueChange={setRouteColour}
  presets={['#2F54FF', '#16A34A', '#EF4444', '#F97316']}
  hint="Route colour on the depot map"
/>
```
