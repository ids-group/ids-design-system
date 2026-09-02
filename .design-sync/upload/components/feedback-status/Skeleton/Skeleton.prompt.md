# Skeleton

Shimmering loading placeholder. The host element itself is the block — no children. Hidden from assistive tech (`aria-hidden`).

- `width` / `height` take any CSS length (`"120px"`, `"50%"`); size them to mirror the real content.
- `circle` for avatar/dot stand-ins (pill radius); `inline` to sit inline-block within a text line.
- Compose several to sketch a loading layout: a circle + two text bars approximates a list row.

```tsx
<Skeleton circle width="40px" height="40px" />
<Skeleton width="60%" height="14px" />
```
