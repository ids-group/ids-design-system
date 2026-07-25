import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';
import { FieldMessage } from '../lib/FieldMessage';

export interface PaginationProps {
  /** Total item count, used to compute the page count. */
  total: number;
  /** Items per page. Controlled when `onPageSizeChange` is provided; otherwise
   *  the component manages its own state seeded from this value. Default 10. */
  pageSize?: number;
  /** Fires when the page size changes via the size dropdown. A size change
   *  also resets the page to 1 (emitting `onPageChange(1)`). */
  onPageSizeChange?: (size: number) => void;
  /** 1-based active page. Controlled when `onPageChange` is provided;
   *  otherwise the component manages its own state seeded from this value.
   *  Default 1. */
  currentPage?: number;
  /** Fires whenever the active page changes, including the reset to page 1
   *  after a size change. */
  onPageChange?: (page: number) => void;
  /** Preset choices offered in the page-size dropdown. Default [10, 25, 50, 100]. */
  pageSizeOptions?: number[];
  /** Shows the "Showing X–Y of Z" range label. Default true. */
  showLabel?: boolean;
  /** Binding-only (not in the Angular API): seeds the page-size dropdown's
   *  open state so it can be shown statically. The panel renders INLINE
   *  (no portal) and pushes content below. Default false. */
  sizeSelectOpen?: boolean;
}

/** Windowed page-number model — ports the Angular `pageItems` computed.
 *  ≤7 pages: all numbers. Otherwise: 1 … (current−1, current, current+1) … last,
 *  with each ellipsis appearing only when it hides at least one page. */
function pageItems(totalPages: number, current: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: (number | 'ellipsis')[] = [1];
  if (current > 3) {
    items.push('ellipsis');
  }
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let i = start; i <= end; i++) {
    items.push(i);
  }
  if (current < totalPages - 2) {
    items.push('ellipsis');
  }
  items.push(totalPages);
  return items;
}

interface SizeOption {
  label: string;
  value: string;
}

/** Inline stand-in for the nested `ds-select` (no Select binding existed at
 *  authoring time — same precedent as SplitButton's inlined popover/menu).
 *  Renders the select's exact markup contract: `button.dropdown.sm[role=combobox]`
 *  trigger + the global `ds-dropdown-panel` skin for the open listbox, rendered
 *  INLINE per the no-portal rule. */
function PageSizeSelect({
  options,
  value,
  onValueChange,
  defaultOpen = false,
}: {
  options: SizeOption[];
  value: string;
  onValueChange: (value: string) => void;
  defaultOpen?: boolean;
}) {
  const [uid] = React.useState(() => nextControlId('ds-select'));
  const [open, setOpen] = React.useState(defaultOpen);
  const listboxId = `${uid}-listbox`;
  const selected = options.find((o) => o.value === value) ?? null;

  return host(
    'ds-select',
    { class: 'size' },
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      className={cx('dropdown', 'sm', open && 'open')}
      aria-expanded={open}
      aria-controls={listboxId}
      aria-label="Rows per page"
      onClick={() => setOpen((v) => !v)}
    >
      <span className="trigger-text">{selected?.label ?? ''}</span>
      <span className="chevron">
        <Icon name="chevronDown" size={14} />
      </span>
    </button>,
    <FieldMessage text="" />,
    open && (
      <div className="ds-dropdown-panel">
        <div className="dropdown-panel">
          <ul className="dropdown-list" role="listbox" id={listboxId} aria-label="Rows per page">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li role="presentation" key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    tabIndex={-1}
                    className={cx('option', isSelected && 'is-selected')}
                    aria-selected={isSelected}
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span className="option-label">{opt.label}</span>
                    {isSelected && <Icon name="check" size={14} className="option-check" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    ),
  );
}

/** Pager with range label, windowed page buttons and a page-size dropdown —
 *  port of `ds-pagination`. Page count derives from `total` / `pageSize`;
 *  changing the size resets to page 1. */
export function Pagination({
  total,
  pageSize = 10,
  onPageSizeChange,
  currentPage = 1,
  onPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  showLabel = true,
  sizeSelectOpen = false,
}: PaginationProps) {
  const [ownSize, setOwnSize] = React.useState(pageSize);
  const size = onPageSizeChange ? pageSize : ownSize;
  const [ownPage, setOwnPage] = React.useState(currentPage);
  const page = onPageChange ? currentPage : ownPage;

  const totalPages = Math.max(1, Math.ceil(total / size));
  const items = pageItems(totalPages, page);
  const rangeStart = (page - 1) * size + 1;
  const rangeEnd = Math.min(page * size, total);
  const rangeLabel = `Showing ${rangeStart}–${rangeEnd} of ${total}`;

  const presets = pageSizeOptions.includes(size)
    ? pageSizeOptions
    : [size, ...pageSizeOptions].sort((a, b) => a - b);
  const sizeOptions: SizeOption[] = presets.map((s) => ({
    label: `${s} per page`,
    value: String(s),
  }));

  const goTo = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    if (!onPageChange) setOwnPage(next);
    onPageChange?.(next);
  };

  const onSizeChange = (value: string) => {
    const next = Number(value);
    if (!onPageSizeChange) setOwnSize(next);
    if (!onPageChange) setOwnPage(1);
    onPageSizeChange?.(next);
    onPageChange?.(1);
  };

  return host(
    'ds-pagination',
    null,
    <nav className="pagination" aria-label="Pagination">
      {showLabel && <span className="label">{rangeLabel}</span>}

      <button
        className="pagination-button"
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => goTo(page - 1)}
      >
        <Icon name="chevronLeft" size={14} />
      </button>

      {items.map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e-${i}`} className="ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            className={cx('pagination-button', item === page && 'active')}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => goTo(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        className="pagination-button"
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => goTo(page + 1)}
      >
        <Icon name="chevronRight" size={14} />
      </button>

      <PageSizeSelect
        options={sizeOptions}
        value={String(size)}
        onValueChange={onSizeChange}
        defaultOpen={sizeSelectOpen}
      />
    </nav>,
  );
}
