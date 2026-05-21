import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Projects a custom cell template into <ds-table> for a specific column.
 *
 * Usage:
 *   <ds-table [data]="rows" [columns]="cols">
 *     <ng-template dsCellTemplate="product" let-row>
 *       <div>{{ asRule(row).product }}</div>
 *     </ng-template>
 *   </ds-table>
 *
 * The template context type is `unknown` because Angular cannot propagate
 * the parent <ds-table>'s row type to projected templates. Consumers should
 * narrow the row with a typed helper method on the host component.
 *
 * Context shape:
 *   - $implicit: the row object (typed `unknown`)
 *   - row: alias for the row object (typed `unknown`)
 */
@Directive({
  selector: '[dsCellTemplate]',
  standalone: true,
})
export class CellTemplateDirective {
  readonly dsCellTemplate = input.required<string>();
  readonly template = inject(TemplateRef<{ $implicit: unknown; row: unknown }>);
}
