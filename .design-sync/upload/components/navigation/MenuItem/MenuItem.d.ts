import * as React from 'react';

/**
 * MenuItem — the real MenuItemComponent, run by Angular behind `<ds-x-menu-item>`.
 * Single menu entry — port of `ds-menu-item`. Compose inside `Menu`. The host is `role="none"`; the inner button carries `role="menuitem"`.
 */
export interface MenuItemProps {
  /** Leading icon shown before the projected label. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Blocks activation and styles the item as inactive. It stays focusable (`aria-disabled`) and in the roving order, so a `[dsTooltip]` can explain why. */
  disabled?: boolean;
  /** Renders the item in an error/destructive style. */
  error?: boolean;
  /** Renders the item muted but still actionable. */
  quiet?: boolean;
  /** A standing second line under the label naming a limitation the action carries ("will not be saved"). Visible without hover or focus, unlike a `[dsTooltip]`. Reaches assistive tech as `aria-describedby`, NOT as part of the item's name: the line is `aria-hidden` and referenced by id, else it would be concatenated into the name. */
  description?: string;
  /** Optional submenu template; renders a nested `ds-menu` on hover / ArrowRight. */
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
