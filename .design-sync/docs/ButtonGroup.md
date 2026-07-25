---
category: Actions
---
Fuses adjacent `Button` children into one bordered unit (`role="group"`): inner corners flatten, outer corners keep the radius, adjacent borders overlap into a single divider. Purely presentational — each child Button keeps its own props and `onPressed`.

- Children must be `Button` components (the group's CSS targets their `ds-button` host tags); plain elements won't fuse.
- Works best with uniform children — same `variant`/`size`, typically `color="neutral" variant="outline"` (the ds-docs canonical: Bold / Italic / Underline formatting actions).
- Set `ariaLabel` to name the group for assistive tech.

```tsx
<ButtonGroup ariaLabel="Text formatting">
  <Button color="neutral" variant="outline">Bold</Button>
  <Button color="neutral" variant="outline">Italic</Button>
  <Button color="neutral" variant="outline">Underline</Button>
</ButtonGroup>
```
