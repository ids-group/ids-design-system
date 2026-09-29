import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills a strip above a picker panel's option list.
 *
 * Context: `count` is how many options are visible after filtering, `total` how
 * many were given, and `query` the text that narrowed them.
 *
 * It sits OUTSIDE the `listbox`, so it is not counted as an option in a screen
 * reader's "N of M" position. It stays put while the list scrolls.
 */
@Directive({
  selector: '[dsPanelHeaderTemplate]',
  standalone: true,
})
export class DsPanelHeaderTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
