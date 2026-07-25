import * as React from 'react';
import { host } from '../lib/util';

export interface TopbarProps {
  /** Page/brand title (the `[title]` slot) — rendered in the bold `.title` block. */
  title?: React.ReactNode;
  /** Breadcrumb trail (the `[breadcrumbs]` slot), rendered right after the
   *  title — typically a `Breadcrumbs`. */
  breadcrumbs?: React.ReactNode;
  /** Search control (the `[search]` slot) — sits in the flexible middle
   *  region that absorbs the leftover width. */
  search?: React.ReactNode;
  /** Trailing action cluster (the `[actions]` slot) — icon buttons, avatar,
   *  etc., laid out in a small-gap row pinned to the right edge. */
  actions?: React.ReactNode;
}

/** Horizontal app header — port of `ds-topbar`. A fixed-height flex bar with
 *  four named slots: `title`, `breadcrumbs`, `search` (flexes to fill), and
 *  `actions` (right-aligned). No default children slot — all content goes
 *  through the props. Compose inside `AppShell`'s `topbar` prop. */
export function Topbar({ title, breadcrumbs, search, actions }: TopbarProps) {
  return host(
    'ds-topbar',
    null,
    <header className="topbar">
      <div className="title">{title}</div>
      {breadcrumbs}
      <div className="spacer">{search}</div>
      <div className="actions">{actions}</div>
    </header>,
  );
}
