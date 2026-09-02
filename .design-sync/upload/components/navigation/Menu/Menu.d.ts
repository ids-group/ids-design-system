import * as React from 'react';

/**
 * Menu — the real MenuComponent, run by Angular behind `<ds-x-menu>`.
 * Menu list surface — port of `ds-menu`. Renders the `role="menu"` list; compose `MenuItem` (and `MenuDivider`) children. ArrowUp/ArrowDown/Home/End move focus between enabled items.
 */
export interface MenuProps {
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Menu: React.ComponentType<MenuProps>;
