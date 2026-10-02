import * as React from 'react';

/**
 * Tree — the real TreeComponent, run by Angular behind `<ds-tree>`.
 * Hierarchical list (`role="tree"`) driven by a `nodes` data structure, not child elements. Visible nodes render as flat `role="treeitem"` button rows; depth indents each row via its level. Clicking a row selects it and (for parents) toggles its children; arrow keys / Home / End walk the visible rows.
 */
export interface TreeProps {
  /** Root-level nodes; nest via `children`. */
  nodes?: unknown;
  /** Ids of the expanded nodes. */
  expandedIds?: unknown;
  onExpandedIdsChange?: (value: unknown) => void;
  /** Id of the selected node. */
  selectedId?: string | null;
  onSelectedIdChange?: (value: string | null) => void;
  /** Fires with the node when a row is selected (click or Enter/Space). */
  onNodeSelected?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Tree: React.ComponentType<TreeProps>;
