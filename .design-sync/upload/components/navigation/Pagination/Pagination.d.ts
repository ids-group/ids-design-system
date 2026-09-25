import * as React from 'react';

/**
 * Pagination — the real PaginationComponent, run by Angular behind `<ds-x-pagination>`.
 * Pager (`ds-pagination`) — "Showing X–Y of Z" range label, previous/next arrows, windowed page buttons and a page-size dropdown, in one row. Page count derives from `total / pageSize`; you never pass a page count directly.
 */
export interface PaginationProps {
  /** Total item count, used to compute the page count. */
  total?: number;
  /** Items per page, two-way bound. */
  pageSize?: number;
  onPageSizeChange?: (value: number) => void;
  /** 1-based active page, two-way bound; a page change (incl. the reset to 1 after a size change) emits via the implicit `currentPageChange`. */
  currentPage?: number;
  onCurrentPageChange?: (value: number) => void;
  /** Preset choices offered in the page-size dropdown. */
  pageSizeOptions?: number[];
  /** Shows the range label, `DS_INTL.pagination.range`: "Showing X-Y of Z", or "Showing 0 of 0" on an empty list. */
  showLabel?: boolean;
  /** Shows the rows-per-page dropdown. Turn it off for a screen with a fixed page size — otherwise the control offers a choice the host won't honour. */
  showPageSize?: boolean;
  /** Control height - sm/md/lg. A pager under a full-width table wants targets bigger than the dense default. Unset falls back to `DS_CONFIG.pagination.size`, then `DS_CONFIG.control.size`, then `'sm'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** `'grouped'` keeps the label beside the controls. `'spread'` pushes them to opposite edges of whatever width the nav is given. Unset falls back to `DS_CONFIG.pagination.layout`, then `'grouped'`. */
  layout?: ('grouped' | 'spread') | null;
  /** The host is still fetching: every control disables, the range label is masked with a `<ds-skeleton>` so a stale `total` is never quoted, and the nav reports `aria-busy`. `ds-table` sets it from `loading="skeleton"`. */
  loading?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Pagination: React.ComponentType<PaginationProps>;
