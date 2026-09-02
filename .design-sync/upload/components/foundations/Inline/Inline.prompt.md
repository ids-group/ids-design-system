# Inline

Horizontal flex row — port of `ds-inline`. The `ds-inline` host IS the flex container; children lay out in a row, vertically centered, wrapping by default.

- `gap`: `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` (same scale as `Stack`); unset uses the semantic `--space-inline` default.
- `align` overrides the default `center` cross-axis alignment; `justify` (`'start' | 'center' | 'end' | 'between'`) distributes along the row — `'between'` is the usual header pattern (title left, actions right).
- `wrap={false}` forces a single line (`.nowrap`) — use for toolbars that should overflow rather than stack.

```tsx
<Inline gap="sm" justify="between" wrap={false}>
  <h2>Depot LDS-04</h2>
  <Button size="sm">Assign driver</Button>
</Inline>
```
