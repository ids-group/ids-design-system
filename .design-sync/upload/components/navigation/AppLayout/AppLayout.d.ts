import * as React from 'react';

/**
 * AppLayout — the real AppLayoutComponent, run by Angular behind `<ds-x-app-layout>`.
 * Fixed-frame application shell — port of `ds-app-layout`. Pins itself to the viewport (`100dvh`, `overflow: hidden`); only the content region scrolls, so the sidenav rail and topbar stay put.
 */
export interface AppLayoutProps {
  /** `'content'` (default): the rail spans the full viewport height on the left and the topbar sits above the content column only. `'full'`: the topbar spans the full width and the rail + content sit below it. */
  topbarSpan?: 'content' | 'full';
  /** Whether the rail is open as an overlay. Only meaningful below the `lg` breakpoint — above it the rail is always in the layout and this is ignored. Two-way, so a burger in your topbar can drive it. */
  railOpen?: boolean;
  onRailOpenChange?: (value: boolean) => void;
  /** Accessible name for the rail while it is a modal overlay. */
  railLabel?: string;
  /** Remember the content scroll per path and restore it on the way BACK. Off by default: a layout that silently moved the scroll would surprise every existing consumer. Only a history traversal restores — following a link into a screen still lands at the top — plus a host that pushes its own "back to list" and says so with `state: { dsRestoreScroll: true }`, and the first navigation after a reload. */
  restoreScroll?: boolean;
  /** How long to wait for the restored screen's content to grow tall enough before landing as close as it allows. Only meaningful with `restoreScroll`. */
  restoreScrollTimeout?: number;
  /** When the content scroll resets to the top. `'path'` (default) is what the layout has always done; `'always'` also resets on a query- or fragment-only navigation, which is what a server-paged list wants; `'never'` hands the decision to the screen, which can still call `AppLayoutScrollService.scrollToTop()`. It exists because the layout owning the scroll CONTAINER also meant it owned the POLICY: a screen could add a reset but had no way to suppress one. */
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
