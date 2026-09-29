import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills a strip below a picker panel's option list.
 *
 * Context: the same as the header slot: `count`, `total`, `query`.
 *
 * Like the header it sits OUTSIDE the `listbox` and does not scroll with the
 * options. Anything focusable here is reached by Tab from the panel, so give it
 * an accessible name.
 */
@Directive({
  selector: '[dsPanelFooterTemplate]',
  standalone: true,
})
export class DsPanelFooterTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
