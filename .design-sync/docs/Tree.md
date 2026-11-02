---
category: Data display
---
Hierarchical list (`role="tree"`) driven by a `nodes` data structure, not child elements. Visible nodes render as flat `role="treeitem"` rows; depth indents each row via its level. Clicking a row selects it and (for parents) toggles its children; arrow keys / Home / End walk the visible rows, disabled ones included.

- `nodes: TreeNode[]` — `{ id, label, icon?, children?, disabled? }`; nest via `children`. `icon` is a DS icon name shown before the label.
- `expandedIds: Set<string>` — ids of open parents. Controlled with `onExpandedIdsChange`, otherwise internal state seeded from it — pass e.g. `new Set(['depots'])` to render branches open statically.
- `selection`: `'single'` (default) uses `selectedId` / `onSelectedIdChange`, one selected node (accent row tint). `'multiple'` uses `selectedIds` / `onSelectedIdsChange` (`string[]`): a click, Enter or Space with Shift, Ctrl or Cmd held adds or removes a row, a plain one selects that row alone.
- `onNodeSelected` fires with the full node on activation; `onNodeHover` with the node under the pointer or newly focused, and `null` when the pointer leaves the tree.
- Parents show a chevron (down when open); leaves get a spacer so labels align. A disabled row is focusable and announced as disabled, but selects nothing.

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
