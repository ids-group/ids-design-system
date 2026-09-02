---
category: Data display
---
Hierarchical list (`role="tree"`) driven by a `nodes` data structure, not child elements. Visible nodes render as flat `role="treeitem"` button rows; depth indents each row via its level. Clicking a row selects it and (for parents) toggles its children; arrow keys / Home / End walk the visible rows.

- `nodes: TreeNode[]` — `{ id, label, icon?, children?, disabled? }`; nest via `children`. `icon` is a DS icon name shown before the label.
- `expandedIds: Set<string>` — ids of open parents. Controlled with `onExpandedIdsChange`, otherwise internal state seeded from it — pass e.g. `new Set(['depots'])` to render branches open statically.
- `selectedId` / `onSelectedIdChange` — single selected node (accent row tint); `onNodeSelected` fires with the full node on activation.
- Parents show a chevron (down when open); leaves get a spacer so labels align.

```tsx
<Tree
  nodes={[
    { id: 'depots', label: 'Depots', icon: 'folder', children: [
      { id: 'leeds', label: 'Leeds Central' },
      { id: 'london', label: 'London EC1A' },
    ]},
  ]}
  expandedIds={new Set(['depots'])}
  selectedId="leeds"
/>
```
