import * as React from 'react';

/**
 * SidenavGroup — the real SidenavGroupComponent, run by Angular behind `<ds-sidenav-group>`.
 * Labelled or collapsible section of the sidenav rail — port of `ds-sidenav-group`. Wrap `SidenavItem` children; nested groups work.
 */
export interface SidenavGroupProps {
  /** Group heading text. */
  label?: string;
  /** Optional group icon; omit to project custom content via the `[ds-group-icon]` slot instead. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** When true, the label/icon row becomes a clickable header that expands/collapses the group. */
  expandable?: boolean;
  /** Makes the group a destination as well as a container: the header navigates here and the caret becomes a separate control. Unset, the whole header only expands. */
  routerLink?: unknown;
  /** Overrides what the group header announces when it is itself a destination. Unset, the page the reader is on announces `page` and the section containing it announces `true`. */
  ariaCurrent?: ('page' | 'step' | 'location' | 'date' | 'time' | true) | null | undefined;
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
