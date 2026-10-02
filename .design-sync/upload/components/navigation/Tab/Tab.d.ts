import * as React from 'react';

/**
 * Tab — the real TabComponent, run by Angular behind `<ds-tab>`.
 * Declarative tab definition (`ds-tab`) — only valid as a direct child of `Tabs`. Renders nothing itself: the parent reads its props to build the tab bar and shows its `children` as the active panel's content.
 */
export interface TabProps {
  /** Text shown in the tab button. */
  label?: string;
  /** Icon shown before the label. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Numeric badge shown after the label. */
  count?: number | null;
  /** Excludes the tab from selection and keyboard navigation. */
  disabled?: boolean;
  /** Identifier emitted by tabClosed. Falls back to label when omitted. */
  value?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Tab: React.ComponentType<TabProps>;
