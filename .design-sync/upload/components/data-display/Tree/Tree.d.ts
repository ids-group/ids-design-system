import * as React from 'react';

/**
 * Tree — the real TreeComponent, run by Angular behind `<ds-tree>`.
 * Hierarchical list (`role="tree"`) driven by a `nodes` data structure, not child elements. Visible nodes render as flat `role="treeitem"` rows; depth indents each row via its level. Clicking a row selects it and (for parents) toggles its children; arrow keys / Home / End walk the visible rows, disabled ones included.
 */
export interface TreeProps {
  /** Root-level nodes; nest via `children`. */
  nodes?: unknown;
  /** Ids of the expanded nodes. */
  expandedIds?: unknown;
  onExpandedIdsChange?: (value: unknown) => void;
  /** `'multiple'` reads and writes `selectedIds`; `'single'` reads and writes `selectedId`. */
  selection?: ('single' | 'multiple');
  /** Id of the selected node, in `'single'` selection. */
  selectedId?: string | null;
  onSelectedIdChange?: (value: string | null) => void;
  /** Ids of the selected nodes, in `'multiple'` selection. */
  selectedIds?: string[];
  onSelectedIdsChange?: (value: string[]) => void;
  /** What expands and collapses a parent. `'row'`: activating the row (click, Enter, Space) selects it and toggles it. `'caret'`: activating the row only selects it, and the chevron is a button of its own that toggles. `'doubleClick'`: a click selects, a double click toggles. In every mode ArrowRight expands and ArrowLeft collapses the focused row. */
  toggleOn?: ('row' | 'caret' | 'doubleClick');
  /** Rows slide open and shut and the chevron turns when a parent expands or collapses. Off under `prefers-reduced-motion: reduce`. */
  animate?: boolean;
  /** Fires with the node when a row is selected (click or Enter/Space), not when one is deselected. */
  onNodeSelected?: (value: unknown) => void;
  /** Fires with the node under the pointer or newly focused, and `null` when the pointer leaves the tree. */
  onNodeHover?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Tree: React.ComponentType<TreeProps>;
