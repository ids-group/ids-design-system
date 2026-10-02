import * as React from 'react';

/**
 * AppLayout — the real AppLayoutComponent, run by Angular behind `<ds-x-app-layout>`.
 * Fixed-frame application shell — port of `ds-app-layout`. Pins itself to the viewport (`100dvh`, `overflow: hidden`); only the content region scrolls, so the sidenav rail and topbar stay put.
 */
export interface AppLayoutProps {
  /** `'content'` (default): rail spans the full height, topbar sits above the content only. `'full'`: topbar spans the full width. */
  topbarSpan?: 'content' | 'full';
  /** Whether the rail is open as an overlay. Ignored at and above the `lg` breakpoint. */
  railOpen?: boolean;
  onRailOpenChange?: (value: boolean) => void;
  /** Accessible name for the rail while it is a modal overlay. Unset falls back to `DS_INTL.appLayout.railLabel`. */
  railLabel?: string | null;
  /** Remember the content scroll per path and restore it on the way BACK. Off by default. Restores on a history traversal, on `state: { dsRestoreScroll: true }`, and on the first navigation after a reload. */
  restoreScroll?: boolean;
  /** Milliseconds to wait for the restored content to grow tall enough. Only with `restoreScroll`. */
  restoreScrollTimeout?: number;
  /** When the content scroll resets to the top: on path change (`'path'`), also on query/fragment-only navigation (`'always'`), or never (`'never'`). */
  scrollReset?: ('path' | 'never' | 'always');
  /** Content for the `[sidenav]` slot. */
  sidenav?: React.ReactNode;
  /** Content for the `[topbar]` slot. */
  topbar?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const AppLayout: React.ComponentType<AppLayoutProps>;
