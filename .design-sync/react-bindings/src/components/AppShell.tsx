import * as React from 'react';
import { cx, host } from '../lib/util';

export type AppShellTopbarSpan = 'content' | 'full';

export interface AppShellProps {
  /**
   * `'content'` (default): the rail spans the full viewport height on the
   * left and the topbar sits above the content column only. `'full'`: the
   * topbar spans the full width and the rail + content sit below it.
   */
  topbarSpan?: AppShellTopbarSpan;
  /** Sidenav rail content (the `[sidenav]` slot) — typically a `Sidenav`. */
  sidenav?: React.ReactNode;
  /** Top bar content (the `[topbar]` slot) — typically a `Topbar`. */
  topbar?: React.ReactNode;
  /** Page content, rendered inside the shell's own `<main>` landmark. */
  children?: React.ReactNode;
}

/** Fixed-frame application shell — port of `ds-app-shell`. The host is pinned
 *  to the viewport (`100dvh` + `overflow: hidden`) and ONLY the content region
 *  scrolls, so the sidenav rail and the topbar stay put on pages taller than
 *  the viewport. The shell renders the `<main>` landmark itself — do not nest
 *  another `<main>` in the content. (The Angular router scroll-to-top service
 *  and the measured `--ds-scrollbar-width` compensation have no React
 *  equivalent here; the CSS falls back to a 0px scrollbar width.) */
export function AppShell({
  topbarSpan = 'content',
  sidenav,
  topbar,
  children,
}: AppShellProps) {
  return host(
    'ds-app-shell',
    { class: cx('app-shell', topbarSpan === 'full' && 'topbar-full') },
    <div className="rail">{sidenav}</div>,
    <div className="bar">{topbar}</div>,
    <main className="content">
      <div className="inner">{children}</div>
    </main>,
  );
}
