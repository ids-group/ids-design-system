import {
  type ComponentRef,
  DestroyRef,
  Directive,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  DsTableLayout,
  type TableColumn,
} from '@ids-group-ltd/ids-design-system/components/table';
import { TableExportButtonComponent } from './table-export-button.component';

/**
 * CSV export for `<ds-table>`, as a directive so a table that does not export never carries the
 * code. Put it on the table and the toolbar grows the button:
 *
 * ```html
 * <ds-table dsTableExport [columns]="cols" [data]="rows" />
 * ```
 *
 * On a server-paged table the table holds one page, so give it the whole set:
 *
 * ```html
 * <ds-table dsTableExport [exportFetcher]="fetchAll" (exportFailed)="report($event)" />
 * ```
 *
 * `table.runExport()` and `table.exporting()` keep working — they delegate to whichever export
 * directive is present, so a button of your own in `[toolbar]` or a page header still drives it.
 * Pass `[dsTableExport]="false"` to keep the code and drop the built-in button.
 */
@Directive({
  selector: '[dsTableExport]',
  standalone: true,
})
export class DsTableExport<T extends object> {
  private readonly layout = inject<DsTableLayout<T>>(DsTableLayout);

  /** Renders the built-in toolbar button. `false` keeps the feature and hides the control, for a
   *  table whose export is driven from somewhere else on the page. */
  readonly dsTableExport = input(true, { transform: booleanAttribute });

  readonly exportFilename = input<string>('table.csv');

  /** Fetches the rows to export. Without it the export serialises what the table holds, which on
   *  a server-paged table is one page. */
  readonly exportFetcher = input<
    (() => Promise<readonly T[] | Blob | string>) | null
  >(null);

  /** Without it a rejected `exportFetcher` is silent. */
  readonly exportFailed = output<unknown>();

  private readonly busy = signal(false);
  readonly exporting = this.busy.asReadonly();

  private readonly announcement = signal('');

  constructor() {
    this.layout.setExport({
      run: () => this.runExport(),
      csv: (filename, rows) => this.exportCsv(filename, rows),
      exporting: this.exporting,
    });
    this.layout.addStatusFragment(this.announcement.asReadonly());

    const anchor = this.layout.view().toolbarAnchor;
    let created: ComponentRef<TableExportButtonComponent> | null = null;
    effect(() => {
      const host = anchor();
      const wanted = this.dsTableExport();
      if (!host || !wanted || created) {
        return;
      }
      created = host.createComponent(TableExportButtonComponent);
      created.setInput('busy', this.busy());
      created.instance.pressed.subscribe(() => void this.runExport());
    });
    // The button is a separate view, so it is not reached by the host's change detection: its
    // input has to be written when the state moves.
    effect(() => {
      created?.setInput('busy', this.busy());
    });
    inject(DestroyRef).onDestroy(() => created?.destroy());
  }

  /** Without `exportFetcher` this serialises only what the table holds, which on a server-paged
   *  table is one page. */
  async runExport(): Promise<void> {
    const fetcher = this.exportFetcher();
    if (!fetcher) {
      this.exportCsv(this.exportFilename());

      return;
    }
    this.busy.set(true);
    this.announcement.set('Preparing export…');
    try {
      const result = await fetcher();
      if (typeof result === 'string' || result instanceof Blob) {
        this.downloadFile(result, this.exportFilename());
      } else {
        this.exportCsv(this.exportFilename(), result);
      }
      this.announcement.set('Export ready');
    } catch (error) {
      this.announcement.set('Export failed');
      this.exportFailed.emit(error);
    } finally {
      this.busy.set(false);
    }
  }

  /** Serialises the table's visible columns as a CSV download. Pass `rows` to serialise a set you
   *  fetched yourself. */
  exportCsv(filename = 'table.csv', rows?: readonly T[]): void {
    if (typeof document === 'undefined') {
      return;
    }
    const view = this.layout.view();
    const columns = view.visibleColumns();
    const escapeCell = (value: string): string =>
      /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    const cells = (row: T): readonly string[] =>
      columns.map((column: TableColumn<T>) =>
        escapeCell(view.cellText(row, column)),
      );
    // Leading BOM so Excel reads UTF-8 (accented labels and values) correctly.
    const csv =
      '﻿' +
      [
        columns.map((column: TableColumn<T>) => escapeCell(column.label)),
        ...(rows ?? view.sortedRows()).map(cells),
      ]
        .map((row) => row.join(','))
        .join('\r\n');
    this.downloadFile(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
      filename,
    );
  }

  /** Only a Blob gets its object URL revoked — a URL the caller supplied is theirs to manage. */
  private downloadFile(source: Blob | string, filename: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    const url = source instanceof Blob ? URL.createObjectURL(source) : source;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    if (source instanceof Blob) {
      URL.revokeObjectURL(url);
    }
  }
}
