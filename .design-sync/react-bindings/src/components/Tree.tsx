import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName;
  children?: TreeNode[];
  disabled?: boolean;
}

interface VisibleNode {
  node: TreeNode;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
}

export interface TreeProps {
  /** Root-level nodes; nest via `children`. */
  nodes?: readonly TreeNode[];
  /** Set of currently expanded node ids. Controlled when `onExpandedIdsChange`
   *  is provided; otherwise the component manages its own state seeded from
   *  this value. */
  expandedIds?: ReadonlySet<string>;
  /** Emits the next expanded-id set when a parent row is toggled. */
  onExpandedIdsChange?: (ids: Set<string>) => void;
  /** Id of the currently selected node. Controlled when `onSelectedIdChange`
   *  is provided; otherwise internal state seeded from this value. */
  selectedId?: string | null;
  /** Emits the newly selected node id. */
  onSelectedIdChange?: (id: string | null) => void;
  /** Fires with the node when a row is selected (click or Enter/Space). */
  onNodeSelected?: (node: TreeNode) => void;
}

/** Hierarchical list — port of `ds-tree`. Renders the depth-first list of
 *  visible nodes as flat `role="treeitem"` button rows; depth indents via the
 *  row's `--_level` custom property. Clicking a row selects it and toggles its
 *  children; arrow keys walk the visible rows (roving tabindex). */
export function Tree({
  nodes = [],
  expandedIds,
  onExpandedIdsChange,
  selectedId,
  onSelectedIdChange,
  onNodeSelected,
}: TreeProps) {
  const hostRef = React.useRef<HTMLElement>(null);
  const [ownExpandedIds, setOwnExpandedIds] = React.useState<ReadonlySet<string>>(
    () => new Set(expandedIds ?? []),
  );
  const [ownSelectedId, setOwnSelectedId] = React.useState<string | null>(selectedId ?? null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const expanded = onExpandedIdsChange ? (expandedIds ?? new Set<string>()) : ownExpandedIds;
  const selected = onSelectedIdChange ? (selectedId ?? null) : ownSelectedId;

  const setExpanded = (next: Set<string>) => {
    if (!onExpandedIdsChange) setOwnExpandedIds(next);
    onExpandedIdsChange?.(next);
  };

  // Depth-first list of currently-visible nodes; drives rendering and keyboard nav.
  const visibleNodes = React.useMemo<VisibleNode[]>(() => {
    const out: VisibleNode[] = [];
    const walk = (list: readonly TreeNode[], level: number): void => {
      for (const node of list) {
        const hasChildren = !!node.children?.length;
        const isOpen = expanded.has(node.id);
        out.push({ node, level, hasChildren, expanded: isOpen });
        if (hasChildren && isOpen) {
          walk(node.children ?? [], level + 1);
        }
      }
    };
    walk(nodes, 0);

    return out;
  }, [nodes, expanded]);

  // The single roving-tabindex treeitem — the active node, or the first one.
  const effectiveActiveId = activeId ?? visibleNodes[0]?.node.id ?? null;

  const isSelected = (id: string) => selected === id;
  const isActive = (id: string) => effectiveActiveId === id;

  const toggle = (node: TreeNode) => {
    if (node.disabled || !node.children?.length) return;
    const next = new Set(expanded);
    if (next.has(node.id)) {
      next.delete(node.id);
    } else {
      next.add(node.id);
    }
    setExpanded(next);
  };

  const select = (node: TreeNode) => {
    if (node.disabled) return;
    if (!onSelectedIdChange) setOwnSelectedId(node.id);
    onSelectedIdChange?.(node.id);
    setActiveId(node.id);
    onNodeSelected?.(node);
  };

  const onRowClick = (entry: VisibleNode) => {
    if (entry.node.disabled) return;
    select(entry.node);
    if (entry.hasChildren) {
      toggle(entry.node);
    }
  };

  const focusNode = (id: string) => {
    setActiveId(id);
    hostRef.current?.querySelector<HTMLElement>(`[data-node-id="${id}"]`)?.focus();
  };

  const moveActive = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= visibleNodes.length) return;
    focusNode(visibleNodes[targetIndex].node.id);
  };

  const moveToParent = (index: number) => {
    const level = visibleNodes[index].level;
    for (let i = index - 1; i >= 0; i--) {
      if (visibleNodes[i].level < level) {
        focusNode(visibleNodes[i].node.id);

        return;
      }
    }
  };

  const onKeydown = (event: React.KeyboardEvent) => {
    const index = visibleNodes.findIndex((entry) => entry.node.id === effectiveActiveId);
    if (index < 0) return;
    const current = visibleNodes[index];
    switch (event.key) {
      case 'ArrowDown':
        moveActive(index + 1);
        break;
      case 'ArrowUp':
        moveActive(index - 1);
        break;
      case 'Home':
        moveActive(0);
        break;
      case 'End':
        moveActive(visibleNodes.length - 1);
        break;
      case 'ArrowRight':
        if (current.hasChildren && !current.expanded) {
          toggle(current.node);
        } else if (current.hasChildren) {
          moveActive(index + 1);
        }
        break;
      case 'ArrowLeft':
        if (current.hasChildren && current.expanded) {
          toggle(current.node);
        } else {
          moveToParent(index);
        }
        break;
      default:
        // Enter / Space activate the focused row via its native button click.
        return;
    }
    event.preventDefault();
  };

  return host(
    'ds-tree',
    { ref: hostRef, role: 'tree', onKeyDown: onKeydown },
    visibleNodes.map((entry) => (
      <button
        key={entry.node.id}
        type="button"
        className={cx('row', isSelected(entry.node.id) && 'selected')}
        role="treeitem"
        data-node-id={entry.node.id}
        aria-level={entry.level + 1}
        aria-expanded={entry.hasChildren ? entry.expanded : undefined}
        aria-selected={isSelected(entry.node.id)}
        tabIndex={isActive(entry.node.id) ? 0 : -1}
        disabled={entry.node.disabled}
        style={{ ['--_level' as string]: String(entry.level) }}
        onClick={() => onRowClick(entry)}
      >
        {entry.hasChildren ? (
          <Icon
            className="caret"
            name={entry.expanded ? 'chevronDown' : 'chevronRight'}
            size={16}
          />
        ) : (
          <span className="caret-spacer" />
        )}

        {entry.node.icon && <Icon className="node-icon" name={entry.node.icon} size={16} />}

        <span className="label">{entry.node.label}</span>
      </button>
    )),
  );
}
