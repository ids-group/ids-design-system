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
  /** Shows the "Showing X–Y of Z" range label. */
  showLabel?: boolean;
  /** Shows the rows-per-page dropdown. Turn it off for a screen with a fixed page size — otherwise the control offers a choice the host won't honour. */
  showPageSize?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Pagination: React.ComponentType<PaginationProps>;
