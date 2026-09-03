import * as React from 'react';

/**
 * SidenavGroup — the real SidenavGroupComponent, run by Angular behind `<ds-sidenav-group>`.
 * Labelled or collapsible section of the sidenav rail — port of `ds-sidenav-group`. Wrap `SidenavItem` children; nested groups work.
 */
export interface SidenavGroupProps {
  /** Group heading text. */
  label?: string;
  /** Optional group icon; omit to project custom content via the `[icon]` slot instead. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** When true, the label/icon row becomes a clickable header that expands/collapses the group. */
  expandable?: boolean;
  /** Two-way bindable open state; defaults open so a non-expandable group always shows its items. */
  expanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
  /** Content for the `[ds-group-icon]` slot. */
  dsGroupIcon?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const SidenavGroup: React.ComponentType<SidenavGroupProps>;
