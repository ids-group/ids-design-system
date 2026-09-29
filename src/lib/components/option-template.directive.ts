import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills an option row's LABEL AREA in `ds-select`, `ds-multi-select` and
 * `ds-autocomplete`.
 *
 * ```html
 * <ds-multi-select [options]="assignees()">
 *   <ng-template dsOptionTemplate let-option>
 *     <ds-avatar size="xs" [seed]="option.label" /> {{ option.label }}
 *   </ng-template>
 * </ds-multi-select>
 * ```
 *
 * The row stays library-owned: `role="option"`, `aria-selected`, the active-row class,
 * the checkbox and the check glyph are not projected.
 */
@Directive({
  selector: '[dsOptionTemplate]',
  standalone: true,
})
export class DsOptionTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
