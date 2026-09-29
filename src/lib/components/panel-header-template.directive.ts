import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills a strip above a picker panel's option list.
 *
 * Context: `count` is how many options are visible after filtering, `total` how
 * many were given, and `query` the text that narrowed them.
 *
 * It sits OUTSIDE the `listbox`, so its content is not counted as an option and does
 * not break a screen reader's "N of M" position reporting. It stays put while the
 * list scrolls under it.
 */
@Directive({
  selector: '[dsPanelHeaderTemplate]',
  standalone: true,
})
export class DsPanelHeaderTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
