import * as React from 'react';

/**
 * Drawer — the real DrawerComponent, run by Angular behind `<ds-drawer>`.
 * Edge-anchored slide-in panel for inline edit flows — port of `ds-drawer`. Renders INLINE (no portal): `.drawer-root` is `position: fixed; inset: 0` (scrim + panel absolutely positioned inside it), so it covers the viewport unless an ancestor forms a containing block (`transform`, `filter` or `contain`) — wrap contained specimens in one sized like a mini viewport. Unlike Modal there is no `staticPreview` branch.
 */
export interface DrawerProps {
  /** Open state, two-way bound. */
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  /** Panel size. */
  size?: ('sm' | 'md' | 'lg');
  /** Edge the panel slides in from. */
  placement?: ('right' | 'left' | 'top' | 'bottom');
  /** Drawer title, shown in the header and used for `aria-labelledby`. */
  title?: string;
  /** Fires once the close (slide-out) animation finishes. */
  onClosed?: (value: void) => void;
  staticPreview?: boolean;
  /** Content for the `[drawer-body]` slot. */
  drawerBody?: React.ReactNode;
  /** Content for the `[body]` slot. */
  body?: React.ReactNode;
  /** Content for the `[drawer-footer]` slot. */
  drawerFooter?: React.ReactNode;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Drawer: React.ComponentType<DrawerProps>;
