# AvatarGroup

Stacked row of `Avatar`s with overlapping ring borders. The group's CSS reaches into the child `ds-avatar` hosts, so plain `<Avatar />` children compose directly — no wrapper needed.

- Render at most `max` (default 4) `Avatar` children yourself — the group does NOT slice children; it only computes the chip.
- `total`: the full headcount. When `total > max`, a neutral `+N` chip (`total - max`) is appended after the children. Leave unset (null) for no chip.
- Overlap/ring are themeable via `--ds-avatar-group-overlap` / `--ds-avatar-group-ring` on the host.

```tsx
<AvatarGroup max={3} total={7}>
  <Avatar initials="AB" />
  <Avatar initials="TM" />
  <Avatar initials="RK" />
</AvatarGroup>
```
