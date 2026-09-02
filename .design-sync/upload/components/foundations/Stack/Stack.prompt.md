# Stack

Vertical flex column — port of `ds-stack`. The `ds-stack` host IS the flex container; children render directly with a uniform gap.

- `gap`: `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` → 0 / space-1 / space-2 / space-4 / space-6 / space-8. Unset (null) uses the semantic `--space-stack` default.
- `align` sets `align-items` (`'start' | 'center' | 'end' | 'stretch'`); unset leaves the flex default (stretch — children fill the width).
- No wrapper markup, no padding, no background — pure spacing primitive. Override per-instance via `--ds-stack-gap` if the scale doesn't fit.

```tsx
<Stack gap="md">
  <Stat label="Active shipments" value="128" />
  <Stat label="Delayed" value="6" />
</Stack>
```
