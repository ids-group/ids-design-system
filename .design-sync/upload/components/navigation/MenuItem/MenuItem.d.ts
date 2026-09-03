import * as React from 'react';

/**
 * MenuItem — the real MenuItemComponent, run by Angular behind `<ds-x-menu-item>`.
 * Single menu entry — port of `ds-menu-item`. Compose inside `Menu`. The host is `role="none"`; the inner button carries `role="menuitem"`.
 */
export interface MenuItemProps {
  /** Leading icon shown before the projected label. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Blocks activation and styles the item as inactive. It stays keyboard-focusable (`aria-disabled`, ARIA menu practice) and in `ds-menu`'s roving order, so a `[dsTooltip]` explaining why can be reached and shown. */
  disabled?: boolean;
  /** Renders the item in an error/destructive style. */
  error?: boolean;
  /** Renders the item muted — a secondary row like "Sign out" under a divider, still actionable but not competing with the items above it. */
  quiet?: boolean;
  /** A standing second line under the label — a limitation the action carries ("will not be saved", "read-only in this workspace"). Visible without hover or focus, which is what separates it from a `[dsTooltip]`. Reaches assistive tech as `aria-describedby`, NOT as part of the item's name: the projected label names the action, and a caveat is a description of it. That is why the line is `aria-hidden` in the DOM and referenced by id — inside the button and visible, it would otherwise be concatenated into the name. */
  description?: string;
  /** Optional submenu template — renders a nested `ds-menu` on hover / ArrowRight. */
  submenu?: unknown;
  /** Fires on click, unless the item is disabled or opens a submenu. */
  onPressed?: (value: MouseEvent) => void;
  /** Content for the `[icon]` slot. */
  iconContent?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const MenuItem: React.ComponentType<MenuItemProps>;
