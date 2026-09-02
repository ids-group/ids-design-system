# Divider

Separator rule — the host element IS the rule (role="separator").

- `variant`: `'default'` (hairline) | `'strong'` (darker) | `'vertical'` (needs a flex-row parent — it stretches via `align-self`) | `'label'` (children rendered as an uppercase caption between two rule segments).
- `spacing` = vertical margin: `'none' | 'sm' | 'md' | 'lg'` (4/8/16px; default `'md'`). Use `'sm'` in dense lists (menus, sidenav), `'none'` when the parent layout owns the gap.
- Children are only visible with `variant="label"`.

```tsx
<Divider spacing="lg" />
<Divider variant="label">Earlier deliveries</Divider>
```
