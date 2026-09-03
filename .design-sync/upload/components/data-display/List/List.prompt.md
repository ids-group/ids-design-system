# List

Vertical stack of `ListItem` rows, rendered as `role="list"`. Purely structural — no border of its own, so it drops straight into a `Card`.

- `dividers` (default `true`): hairline separator between adjacent items — the class sits on the list host and the compiled CSS pierces down to the `ds-list-item` children, so it only works with `ListItem` children directly inside.
- Children must be `ListItem` elements.

```tsx
<List>
  <ListItem title="Amelia Barnes" subtitle="Driver — North London" />
  <ListItem title="Depot EC1A 1BB" subtitle="14 collections pending" />
</List>
```
