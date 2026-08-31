import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills an option row's LABEL AREA in `ds-select`, `ds-multi-select` and
 * `ds-autocomplete` — an avatar, a colour dot, a second line of metadata.
 *
 * ```html
 * <ds-multi-select [options]="assignees()">
 *   <ng-template dsOptionTemplate let-option>
 *     <ds-avatar size="xs" [seed]="option.label" /> {{ option.label }}
 *   </ng-template>
 * </ds-multi-select>
 * ```
 *
 * The row itself stays library-owned: `role="option"`, `aria-selected`, the
 * active-row class, the checkbox and the check glyph are not projected, so a
 * template cannot take the listbox semantics with it.
 */
@Directive({
  selector: '[dsOptionTemplate]',
  standalone: true,
})
export class DsOptionTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
