import * as React from 'react';

/**
 * Tabs — the real TabsComponent, run by Angular behind `<ds-tabs>`.
 * Tabbed panels (`ds-tabs`) — a compound: compose with `Tab` children, and the parent renders the tab BAR from the children's props plus the active panel below (ARIA APG tabs with roving tabindex, automatic activation, Home/End keys).
 */
export interface TabsProps {
  /** Index of the active tab, two-way bound. */
  selectedIndex?: number;
  onSelectedIndexChange?: (value: number) => void;
  /** Visual style of the tab strip. */
  variant?: ('line' | 'pills');
  /** When true, a tab's content is instantiated only on first activation and kept alive thereafter. When false (default), all panels render eagerly. */
  lazy?: boolean;
  /** When true, the tab strip scrolls horizontally instead of wrapping. The active tab is scrolled into view on selection. */
  scrollable?: boolean;
  /** When true, each tab shows a close button. Clicking it emits tabClosed with the tab's value (or label as fallback) and does not switch to that tab. */
  closable?: boolean;
  /** Controls whether the tab list and panel are stacked horizontally (default) or the tab list runs vertically beside the panel. */
  orientation?: ('horizontal' | 'vertical');
  /** Keep the active tab in a query parameter, so it survives F5, a shared link and the Back button: `urlParam="tab"` gives `?tab=activity`. Empty (the default) leaves the URL alone, and the strip works exactly as before. The names come from each `ds-tab`'s `value` (falling back to its `label`), so there is no second list to keep in step. **Names, not indices** — writing `?tab=1` would silently repoint every old link the moment a tab is inserted. The FIRST tab writes no parameter and every write REPLACES the history entry, so a pristine screen keeps a clean address and flipping tabs does not fill the Back button. An unknown or missing name lands on the first tab rather than throwing: a URL is user input, and a stale bookmark should still open the screen. Outside a routed context the input is inert. Nothing router-shaped is even resolved until you set it — no DI lookup and, more to the point, no subscription — so a strip that never uses this costs exactly what it did before the input existed. */
  urlParam?: string;
  /** Reopen the tab this screen was last left on, per path, from `sessionStorage`. Off by default, and needs `urlParam` for the names — a remembered INDEX would repoint the moment a tab is inserted. A link always wins: the parameter is read first, memory only fills the gap the first tab leaves in the URL. Session, not local, so tomorrow is a fresh visit. */
  rememberLastTab?: boolean;
  /** Emitted when a close button is clicked. Carries the tab's value input, or its label when value is not set. The host is responsible for removing the tab from its list. */
  onTabClosed?: (value: string) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Tabs: React.ComponentType<TabsProps>;
