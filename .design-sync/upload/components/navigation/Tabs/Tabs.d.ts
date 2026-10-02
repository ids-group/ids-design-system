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
  /** When true, a tab's content is instantiated on first activation and kept alive. Default renders only the active panel. */
  lazy?: boolean;
  /** When true, a horizontal strip scrolls inside its own box with previous/next arrows while tabs lie beyond its edges, and the active tab is scrolled into view. When false, an overlong strip overflows its container. */
  scrollable?: boolean;
  /** When true, each tab shows a close button; clicking it emits `tabClosed` and does not switch to that tab. */
  closable?: boolean;
  /** Tab list above the panel (`horizontal`, default) or beside it (`vertical`). */
  orientation?: ('horizontal' | 'vertical');
  /** Keep the active tab in a query parameter so it survives reload and sharing: `urlParam="tab"` gives `?tab=activity`. Empty (default) leaves the URL alone. Names come from each `ds-tab`'s `value` (falling back to its `label`), not indices, so inserting a tab does not repoint old links. The FIRST tab writes no parameter and every write REPLACES the history entry. An unknown name lands on the first tab. Outside a routed context the input is inert. */
  urlParam?: string;
  /** Reopen the tab this screen was last left on, per path, from `sessionStorage`. Off by default; needs `urlParam` for the names. A link always wins: memory only fills the gap the first tab leaves in the URL. */
  rememberLastTab?: boolean;
  /** Emitted when a close button is clicked, with the tab's value (or label). The host removes the tab. */
  onTabClosed?: (value: string) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Tabs: React.ComponentType<TabsProps>;
