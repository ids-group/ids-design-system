import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Replaces a picker panel's "no matches" row — an icon, a sentence in the app's
 * own language, a "clear the filter" button.
 *
 * Context: `query` is the text that matched nothing.
 *
 * The row keeps `role="status"`, so a reader is told the list emptied whatever
 * the template puts inside it.
 */
@Directive({
  selector: '[dsEmptyTemplate]',
  standalone: true,
})
export class DsEmptyTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
