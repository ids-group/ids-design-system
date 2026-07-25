---
category: Layout
---
Centered max-width page container — port of `ds-container`. Caps content width, centers with `margin-inline: auto`, and applies clamped responsive x-padding.

- `size`: `'sm' | 'md' | 'lg'` map to the breakpoint tokens, `'xl'` (default) to the global content cap (`--col-cap-content`), `'full'` removes the cap (padding remains).
- Pure width primitive — no vertical spacing, no background. Wrap page content inside `AppShell`'s children; nest `Stack`/`Inline` inside for spacing.
- Per-instance overrides: `--ds-container-max`, `--ds-container-pad-x`.

```tsx
<Container size="lg">
  <Stack gap="lg">…page sections…</Stack>
</Container>
```
