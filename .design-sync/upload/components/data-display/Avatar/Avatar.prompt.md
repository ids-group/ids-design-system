# Avatar

User avatar circle. Content priority: `imageUrl` → `initials` → `fallbackIcon` (DS icon name) → empty tinted circle. Optional presence dot in the bottom-right corner.

- Sizes: `xs` / `sm` / `md` (default) / `lg`.
- `status`: `'online' | 'offline' | 'away' | 'busy'` — renders the corner presence dot (green/grey/amber/red) with its own aria-label.
- `tint`: `{ bg, fg }` CSS colour pair for arbitrary palettes, or the literal `'neutral'` for the grey overflow-chip treatment; unset keeps the brand-subtle default.
- `ariaLabel` names the avatar for AT; omit it when a visible name sits beside the avatar (it is then `aria-hidden`).
- Stack avatars inside `AvatarGroup` for the overlap-with-ring treatment.

```tsx
<Avatar initials="AB" ariaLabel="Amelia Barnes" status="online" />
```
