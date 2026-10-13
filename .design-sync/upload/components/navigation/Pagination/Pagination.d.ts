import * as React from 'react';

/**
 * Pagination — the real PaginationComponent, run by Angular behind `<ds-x-pagination>`.
 * Pager (`ds-pagination`) — "Showing X–Y of Z" range label, previous/next arrows, windowed page buttons and a page-size dropdown, in one row. Page count derives from `total / pageSize`; you never pass a page count directly.
 */
export interface PaginationProps {
  /** Total item count; drives the page count. */
  total?: number;
  /** Items per page, two-way bound. */
  pageSize?: number;
  onPageSizeChange?: (value: number) => void;
  /** 1-based active page. Resets to 1 after a page-size change. */
  currentPage?: number;
  onCurrentPageChange?: (value: number) => void;
  /** Choices in the page-size dropdown. */
  pageSizeOptions?: number[];
  /** Shows the range label, `DS_INTL.pagination.range`: "Showing X-Y of Z", or "Showing 0 of 0" on an empty list. */
  showLabel?: boolean;
  /** Shows the rows-per-page dropdown. Turn it off when the host fixes the page size. */
  showPageSize?: boolean;
  /** Unset falls back to `DS_CONFIG.pagination.size`, then `DS_CONFIG.control.size`, then `'sm'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** `'grouped'` keeps the label beside the controls. `'spread'` pushes them to opposite edges of whatever width the nav is given. Unset falls back to `DS_CONFIG.pagination.layout`, then `'grouped'`. */
  layout?: ('grouped' | 'spread') | null;
  /** The host is still fetching: the page buttons take `aria-disabled` and ignore presses while staying focusable, the size select disables, the range label is masked with a `<ds-skeleton>` so a stale `total` is never quoted, and the nav reports `aria-busy`. */
  loading?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Pagination: React.ComponentType<PaginationProps>;
