import * as React from 'react';

/**
 * Topbar — the real TopBarComponent, run by Angular behind `<ds-x-topbar>`.
 * Horizontal app header — port of `ds-topbar`. Fixed-height flex bar with a bottom border, designed to sit in `AppLayout`'s `topbar` prop.
 */
export interface TopbarProps {
  /** Content for the `[title]` slot. */
  title?: React.ReactNode;
  /** Content for the `[breadcrumbs]` slot. */
  breadcrumbs?: React.ReactNode;
  /** Content for the `[search]` slot. */
  search?: React.ReactNode;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Topbar: React.ComponentType<TopbarProps>;
