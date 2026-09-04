import { Directive, inject, signal } from '@angular/core';
import {
  DsTableLayout,
  type TableColumn,
} from '@ids-group-ltd/ids-design-system/components/table';

const MIN_COLUMN_WIDTH = 48;
const RESIZE_STEP = 16;
const RESIZE_PAGE = 64;

/**
 * Column resizing for `<ds-table>`, as a directive so a table with fixed columns never carries
 * the drag, the keyboard range widget or the width buttons in the column panel:
 *
 * ```html
 * <ds-table dsTableResize [columns]="cols" [data]="rows" />
 * ```
 *
 * `[(columnWidths)]` is two-way and round-trips through `persistLayout` on the table, so a width
 * the reader dragged survives a reload.
 *
 * The handle's MARKUP stays in the table's header, gated on this directive being present, and so
 * does the width template the column panel renders. Two reasons: a per-column
 * `ViewContainerRef` would cost every header cell of every table a container to save seventeen
 * lines of template, and a directive has no view of its own to declare an `ng-template` in. The
 * bytes here are in the logic, and the logic is all here.
 */
@Directive({
  selector: '[dsTableResize]',
  standalone: true,
})
export class DsTableResize<T extends object> {
  private readonly layout = inject<DsTableLayout<T>>(DsTableLayout);

  /** Per-column pixel widths, keyed by column key. Seeded from `column.width` where unset. */
  readonly columnWidths = signal<Map<string, number>>(new Map());

  private resizeState: {
    key: string;
    startX: number;
    startWidth: number;
  } | null = null;

  private readonly resizeFocus = signal<{
    key: string;
    measured: number;
    max: number;
  } | null>(null);

  constructor() {
    this.layout.addPersistedSlice({
      key: 'widths',
      read: () => [...this.columnWidths()],
      write: (value) =>
        this.columnWidths.set(new Map(value as [string, number][])),
      reset: () => this.columnWidths.set(new Map()),
    });
    this.layout.setResize({
      widthOverride: (key) => this.columnWidths().get(key),
      range: (column) => this.resizeRange(column),
      onStart: (column, event) => this.onResizeStart(column, event),
      onMove: (event) => this.onResizeMove(event),
      onEnd: () => this.onResizeEnd(),
      onFocus: (column, event) => this.onResizeFocus(column, event),
      onBlur: () => this.resizeFocus.set(null),
      onKey: (column, event) => this.onResizeKey(column, event),
      step: (column, delta) => this.stepColumnWidth(column, delta, null),
    });
  }

  /** `'content'` is not a pixel value — it is carried by a class instead, see `fitsContent`. */
  private columnWidth(column: TableColumn<T>): number | null {
    const dragged = this.columnWidths().get(column.key);
    if (dragged !== undefined) {
      return dragged;
    }

    return typeof column.width === 'number' ? column.width : null;
  }

  private viewport(): HTMLElement | null {
    return this.layout.view().scrollViewport() ?? null;
  }

  /**
   * The widest a single column may be dragged: the scroll viewport.
   *
   * A column wider than the viewport can never be seen whole, and long text has its own
   * affordance here — `truncate` clips it and the clip popover shows the rest — so nothing is lost
   * by stopping at the edge. The ceiling exists at all because `aria-valuemax` has to be TRUE: a
   * focusable `role="separator"` is a range widget, and announcing a bound that neither resize
   * path applies is worse than announcing none.
   */
  private columnWidthCeiling(): number {
    return Math.max(MIN_COLUMN_WIDTH, this.viewport()?.clientWidth ?? 0);
  }

  private clampColumnWidth(width: number): number {
    return Math.min(
      this.columnWidthCeiling(),
      Math.max(MIN_COLUMN_WIDTH, width),
    );
  }

  private onResizeStart(column: TableColumn<T>, event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const header = (event.target as HTMLElement).closest('th');
    if (!header) {
      return;
    }
    this.lockMeasuredWidths(header);
    this.resizeState = {
      key: column.key,
      startX: event.clientX,
      startWidth: header.offsetWidth,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  /**
   * Freeze the columns at what they currently measure, once, before the first drag moves
   * anything.
   *
   * Without it only the dragged column has a width and the rest are still auto-sized, so the
   * browser redistributes the remainder across them and columns the reader never touched visibly
   * jump. Measuring first means the drag changes one column and leaves the others where they
   * were. Reads the header row that is actually on screen rather than assuming a column order.
   */
  private lockMeasuredWidths(from: HTMLElement): void {
    const columns = this.layout.view().visibleColumns();
    if (columns.every((column) => this.columnWidth(column) !== null)) {
      return;
    }
    const headerRow = from.parentElement;
    if (!headerRow) {
      return;
    }
    const widths = new Map(this.columnWidths());
    for (const column of columns) {
      if (this.columnWidth(column) !== null) {
        continue;
      }
      const cell = headerRow.querySelector<HTMLElement>(
        `th[data-col-key="${CSS.escape(column.key)}"]`,
      );
      if (cell) {
        widths.set(column.key, Math.max(MIN_COLUMN_WIDTH, cell.offsetWidth));
      }
    }
    this.columnWidths.set(widths);
  }

  private onResizeMove(event: PointerEvent): void {
    if (!this.resizeState) {
      return;
    }
    const width = this.clampColumnWidth(
      this.resizeState.startWidth + (event.clientX - this.resizeState.startX),
    );
    const next = new Map(this.columnWidths());
    next.set(this.resizeState.key, Math.round(width));
    this.columnWidths.set(next);
  }

  private onResizeEnd(): void {
    this.resizeState = null;
  }

  private onResizeFocus(column: TableColumn<T>, event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.resizeFocus.set({
      key: column.key,
      measured: this.resolvedColumnWidth(column, target),
      max: this.columnWidthCeiling(),
    });
  }

  /**
   * The separator's range, and only while it holds focus — that is when a range widget is
   * announced, and an auto-sized column has no width to report until something measures one.
   * Measuring on every change detection to fill an attribute nothing is reading would force
   * layout once per resizable column.
   *
   * `now` prefers the known width, which the first arrow key makes known and keeps live; the
   * focus measurement only covers the moment before that.
   */
  private resizeRange(
    column: TableColumn<T>,
  ): { now: number; min: number; max: number } | null {
    const focused = this.resizeFocus();
    if (focused?.key !== column.key) {
      return null;
    }

    return {
      now: this.columnWidth(column) ?? focused.measured,
      min: MIN_COLUMN_WIDTH,
      max: focused.max,
    };
  }

  private resolvedColumnWidth(
    column: TableColumn<T>,
    from?: HTMLElement,
  ): number {
    const known = this.columnWidth(column);
    if (known !== null) {
      return known;
    }

    return from?.closest('th')?.offsetWidth ?? MIN_COLUMN_WIDTH;
  }

  private onResizeKey(column: TableColumn<T>, event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const delta: number | 'auto' | null =
      event.key === 'ArrowLeft'
        ? -RESIZE_STEP
        : event.key === 'ArrowRight'
          ? RESIZE_STEP
          : event.key === 'PageDown'
            ? -RESIZE_PAGE
            : event.key === 'PageUp'
              ? RESIZE_PAGE
              : event.key === 'Home'
                ? 'auto'
                : null;
    if (delta === null) {
      return;
    }
    event.preventDefault();
    this.stepColumnWidth(column, delta, target.closest('th'));
  }

  /**
   * The header cell is passed when the caller has it — the column panel does not, so it is looked
   * up by `data-col-key`, and the measurement matters: stepping an auto-sized column has to start
   * from what it currently RENDERS, not from the minimum.
   */
  private stepColumnWidth(
    column: TableColumn<T>,
    delta: number | 'auto',
    from: HTMLElement | null,
  ): void {
    const header = from ?? this.headerCellFor(column);
    if (header) {
      this.lockMeasuredWidths(header);
    }
    const widths = new Map(this.columnWidths());
    if (delta === 'auto') {
      widths.delete(column.key);
    } else {
      const current = this.resolvedColumnWidth(column, header ?? undefined);
      widths.set(
        column.key,
        this.clampColumnWidth(Math.round(current + delta)),
      );
    }
    this.columnWidths.set(widths);
  }

  private headerCellFor(column: TableColumn<T>): HTMLElement | null {
    return (
      this.viewport()?.querySelector<HTMLElement>(
        `th[data-col-key="${CSS.escape(column.key)}"]`,
      ) ?? null
    );
  }
}
