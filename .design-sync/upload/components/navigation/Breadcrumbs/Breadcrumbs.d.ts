import * as React from 'react';

/**
 * Breadcrumbs — the real BreadcrumbsComponent, run by Angular behind `<ds-breadcrumbs>`.
 * Breadcrumb trail (`ds-breadcrumbs`) — data-driven, not projected links: pass `items` as `{ label?, href?, icon? }[]`. The last item always renders as the bold, non-clickable current page (`aria-current="page"`); earlier items with `href` render as anchors when `clickable`.
 */
export interface BreadcrumbsProps {
  /** Omitted, the component reads `BreadcrumbsService.items`; an explicit array opts out. */
  items?: unknown;
  /** Icon between crumbs; falls back to `DS_CONFIG.breadcrumbs.separator`, then `chevronRight`. */
  separator?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Whether crumbs render as links; falls back to `DS_CONFIG.breadcrumbs.clickable`, then `true`. */
  clickable?: boolean | null;
  /** Caps how many crumbs render, collapsing the middle; the first and the LAST always survive. Uncapped, a long trail is clipped from the END, which is the current page. */
  maxItems?: number | null;
  /** Fires when a clickable crumb with `href` is activated by a plain primary click, whose default navigation is prevented; a modified or non-primary click opens `href` in the browser instead. */
  onNavigate?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Breadcrumbs: React.ComponentType<BreadcrumbsProps>;
