import * as React from 'react';

/**
 * PageFooter — the real PageFooterComponent, run by Angular behind `<ds-page-footer>`.
 * Page-bottom row (`ds-page-footer`) — the host element itself is the flex row (`justify-content: space-between`, wraps). Three variants via `variant`: `"default"` (plain border-top spread), `"compact"` (subtle bordered card), `"save"` (brand-tinted unsaved-changes bar).
 */
export interface PageFooterProps {
  /** Visual style: default, compact, or the accented `save`-bar look. */
  variant?: ('default' | 'compact' | 'save');
  /** Content for the `[brand]` slot. */
  brand?: React.ReactNode;
  /** Content for the `[nav]` slot. */
  nav?: React.ReactNode;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const PageFooter: React.ComponentType<PageFooterProps>;
