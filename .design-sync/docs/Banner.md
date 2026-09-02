---
category: Feedback & status
---
Full-width page/section message strip with a coloured accent rail. `variant` (info | success | warning | severe | error | neutral, default info) drives colour, default icon and ARIA — error/warning/severe render `role="alert"`/assertive, the rest `role="status"`/polite. `severe` is a stronger warning tier between warning and error.

- Children = message; `title` adds a bold heading; `icon` overrides the default variant icon.
- `actions` slot: `layout="stacked"` (default) wraps actions onto their own line under the text; `layout="row"` keeps them inline on the right.
- `compact` tightens padding, centres items and keeps the title on one line — good for slim notice bars.
- `accentRail={false}` removes the coloured left border.
- `dismissible` shows a close button firing `onClosed`; the parent removes the banner.
- Block element (full width). For small in-context messages use Alert.

```tsx
<Banner variant="severe" title="Strike action" layout="row" actions={<Button size="sm" color="warning">Re-plan routes</Button>}>
  National rail strike on Friday will affect deliveries across the M25 corridor.
</Banner>
```
