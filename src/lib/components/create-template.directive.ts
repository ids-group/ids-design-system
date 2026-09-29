import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Replaces `ds-autocomplete`'s "Create «…»" row.
 *
 * Context: `query` is the typed text the row would create.
 *
 * The row stays a `role="option"` the keyboard can reach, and picking it still
 * emits `create` - the template fills the row, it does not become the action.
 */
@Directive({
  selector: '[dsCreateTemplate]',
  standalone: true,
})
export class DsCreateTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
