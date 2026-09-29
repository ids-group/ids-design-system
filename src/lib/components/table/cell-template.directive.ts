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
 * `[dsCellTemplateOf]` only types the template: bound to the table's rows, `let-row` is a `T`.
 * Left off, `row` is `unknown`.
 */
@Directive({
  selector: '[dsCellTemplate]',
  standalone: true,
})
export class CellTemplateDirective<T = unknown> {
  /** The `key` of the column this template replaces. An undeclared key renders nothing, silently. */
  readonly dsCellTemplate = input.required<string>();
  /** The table's rows, bound to type `let-row`; never read at runtime. */
  readonly dsCellTemplateOf = input<readonly T[] | null>(null);
  readonly template = inject(TemplateRef<CellTemplateContext<T>>);

  static ngTemplateContextGuard<T>(
    _directive: CellTemplateDirective<T>,
    _context: unknown,
  ): _context is CellTemplateContext<T> {
    return true;
  }
}
