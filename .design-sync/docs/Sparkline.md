---
category: Data display
---
A word-sized trend line for a table cell or a stat: one line with no axes, gridlines, legend or frame, and a dot on the last reading.

- `data`: `(number | null)[]`, one reading per step, oldest first. A `null` breaks the line.
- `categories`: `string[]`, what each reading is, printed in the tooltip. Left out, the tooltip prints the value alone.
- `label`: the accessible name and the tooltip's series name. With it the sparkline is a tab stop whose arrow keys, Home and End move the reading; without it the sparkline is decorative and hidden from assistive technology.
- `scale`: `'data'` (default) spans the readings' own min..max, so a small wiggle fills the height; `'zero'` starts at zero, so two sparklines side by side compare by height.
- `area` (default `false`): fills the band under the line.
- `tooltip` (default `true`): shows the reading under the pointer; `tooltip={false}` turns it off.
- `valueFormat`: `(value: number) => string` for the printed value.
- Sized by `--ds-sparkline-width` and `--ds-sparkline-height`, 80x24 by default.

```tsx
<Sparkline label="Weekly orders" data={[12, 18, 15, 22, 19, 27]} categories={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']} />
```
