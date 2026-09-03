import * as React from 'react';

/**
 * MenuDivider — the real MenuDividerComponent, run by Angular behind `<ds-x-menu-divider>`.
 * Thin separator between groups of `MenuItem`s — port of `ds-menu-divider`. No props. The host carries `role="separator"` with horizontal orientation; use it to split routine actions from destructive ones.
 */
export interface MenuDividerProps {
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const MenuDivider: React.ComponentType<MenuDividerProps>;
