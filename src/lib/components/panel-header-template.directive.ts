import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills a strip above a picker panel's option list — "3 of 40 selected", a
 * "clear all" button, a hint, a link to a fuller search.
 *
 * Context: `count` is how many options are visible after filtering, `total` how
 * many were given, and `query` the text that narrowed them.
 *
 * It sits OUTSIDE the `listbox`, so whatever you put here is not counted as an
 * option and does not break a screen reader's "N of M" position reporting. It
 * also stays put while the list scrolls under it — the panel clips and the list
 * is the scroller.
 */
@Directive({
  selector: '[dsPanelHeaderTemplate]',
  standalone: true,
})
export class DsPanelHeaderTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
