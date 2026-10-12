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
 * The bare attribute is the whole switch; there is no input to bind. Seed a width through the
 * column's own `width`, read live ones through `viewChild(DsTableResize)`; `persistLayout` on the
 * table carries them across a reload.
 */
@Directive({
  selector: '[dsTableResize]',
  standalone: true,
})
export class DsTableResize<T extends object> {
  private readonly layout = inject<DsTableLayout<T>>(DsTableLayout);

  /** Per-column pixel widths, keyed by column key. */
  readonly columnWidths = signal<Map<string, number>>(new Map());

  private resizeState: {
    key: string;
    startX: number;
    startWidth: number;
    header: HTMLElement;
  } | null = null;

  private readonly guide = signal<{ x: number; height: number } | null>(null);

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
      guide: this.guide.asReadonly(),
    });
  }

  /** `'content'` is not a pixel value; it is carried by a class, see `fitsContent`. */
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

  /** The scroll viewport. `aria-valuemax` must be a bound both resize paths apply. */
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
      header,
    };
    this.placeGuide(header, header.offsetWidth);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  /** Freezes columns at their measured width before the first drag, or untouched auto-sized columns jump. */
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
    this.placeGuide(this.resizeState.header, Math.round(width));
  }

  private onResizeEnd(): void {
    this.resizeState = null;
    this.guide.set(null);
  }

  // From the width being set, not the header's box: the new width has not been laid out yet.
  private placeGuide(header: HTMLElement, width: number): void {
    const table = header.closest('table');
    if (!table) {
      return;
    }
    this.guide.set({
      x: table.offsetLeft + header.offsetLeft + width,
      height: table.offsetHeight,
    });
  }

  private onResizeFocus(column: TableColumn<T>, event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.resizeFocus.set({
      key: column.key,
      measured: this.resolvedColumnWidth(column, target),
      max: this.columnWidthCeiling(),
    });
  }

  /** Computed only while the separator holds focus: measuring on every change detection forces layout per column. */
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

  /** Stepping an auto-sized column starts from its rendered width; the panel passes no header cell, so it is found by `data-col-key`. */
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
