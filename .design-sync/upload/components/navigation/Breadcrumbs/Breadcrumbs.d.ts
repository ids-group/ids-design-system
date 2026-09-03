import * as React from 'react';

/**
 * Breadcrumbs — the real BreadcrumbsComponent, run by Angular behind `<ds-breadcrumbs>`.
 * Breadcrumb trail (`ds-breadcrumbs`) — data-driven, not projected links: pass `items` as `{ label?, href?, icon? }[]`. The last item always renders as the bold, non-clickable current page (`aria-current="page"`); earlier items with `href` render as anchors when `clickable`.
 */
export interface BreadcrumbsProps {
  /** When omitted, the component reads from `BreadcrumbsService.items`. Pass an explicit array to opt out of the service (per-page override). */
  items?: unknown;
  /** Icon between crumbs; falls back to `DS_CONFIG.breadcrumbs.separator`, then `chevronRight`. */
  separator?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Whether crumbs render as links; falls back to `DS_CONFIG.breadcrumbs.clickable`, then `true`. */
  clickable?: boolean | null;
  /** Caps how many crumbs render, collapsing the middle into an ellipsis — the first and the LAST always survive. Null (default) renders every crumb. Worth setting on any trail that can get deep: the row is `nowrap` with `overflow: hidden`, so without a cap an overlong trail is clipped from the END, which is the current page — the one crumb the reader needs most. */
  maxItems?: number | null;
  /** Fires when a clickable crumb with `href` is activated; default navigation is always prevented. */
  onNavigate?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Breadcrumbs: React.ComponentType<BreadcrumbsProps>;
