import { Directive, TemplateRef, inject, input } from '@angular/core';

/** What a `dsCellTemplate` is handed: the row, as `$implicit` and again as `row`. */
export interface CellTemplateContext<T = unknown> {
  readonly $implicit: T;
  readonly row: T;
}

/**
 * Projects a custom cell template into `<ds-table>` for one column.
 *
 * ```html
 * <ds-table [data]="rows" [columns]="cols">
 *   <ng-template dsCellTemplate="product" [dsCellTemplateOf]="rows" let-row>
 *     {{ row.product }}
 *   </ng-template>
 * </ds-table>
 * ```
 *
 * `[dsCellTemplateOf]` exists only to TYPE the template: bound to the same rows the
 * table gets, it makes `let-row` a `T` under strict templates, so a typo in a field
 * name is a compile error. Left off, `row` is `unknown`.
 */
@Directive({
  selector: '[dsCellTemplate]',
  standalone: true,
})
export class CellTemplateDirective<T = unknown> {
  /** The `key` of the column this template replaces, matched against the table's
   *  `columns`. A key no column declares renders nothing and warns nowhere. */
  readonly dsCellTemplate = input.required<string>();
  /** The table's rows, bound to type `let-row`. Never read at runtime - the table
   *  hands the row out itself. */
  readonly dsCellTemplateOf = input<readonly T[] | null>(null);
  readonly template = inject(TemplateRef<CellTemplateContext<T>>);

  static ngTemplateContextGuard<T>(
    _directive: CellTemplateDirective<T>,
    _context: unknown,
  ): _context is CellTemplateContext<T> {
    return true;
  }
}
