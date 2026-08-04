import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface DocsMatrixRow {
  /** Unique track key (e.g. the colour name). */
  readonly key: string;
  readonly label: string;
  /** Optional CSS colour for a leading swatch dot. */
  readonly dot?: string;
  /** Optional short note shown right-aligned in the row label. */
  readonly note?: string;
  /** Columns legal for this row; cells outside render "—". Omit = all legal. */
  readonly legal?: readonly string[];
  /** Columns that render but are discouraged — marked with a ⚠ in the cell. */
  readonly discouraged?: readonly string[];
  /** Arbitrary extra data the cell template reads via `let-row="row"`. */
  readonly [extra: string]: unknown;
}

/** Generic 2-axis showcase matrix — projected `<ng-template let-col let-row="row">` per cell. Replaces the hand-rolled grid markup duplicated across button / icon-button sections. */
@Component({
  selector: 'docs-matrix',
  standalone: true,
  imports: [NgTemplateOutlet],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './docs-matrix.component.html',
  styleUrl: './docs-matrix.component.scss',
})
export class DocsMatrixComponent {
  /** Column headers (the variant / fill axis). */
  readonly cols = input.required<readonly string[]>();
  /** Labelled rows (the colour axis). */
  readonly rows = input.required<readonly DocsMatrixRow[]>();
  readonly cornerLabel = input('');
  readonly labelWidth = input('164px');
  readonly minColWidth = input('72px');

  protected readonly cell =
    contentChild.required<TemplateRef<unknown>>(TemplateRef);

  protected readonly gridCols = computed(
    () =>
      `${this.labelWidth()} repeat(${this.cols().length}, minmax(${this.minColWidth()}, 1fr))`,
  );

  protected isLegal(row: DocsMatrixRow, col: string): boolean {
    return !row.legal || row.legal.includes(col);
  }

  protected isDiscouraged(row: DocsMatrixRow, col: string): boolean {
    return !!row.discouraged?.includes(col);
  }
}
