import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills an option group's heading.
 *
 * Context: `$implicit` and `group` are the group itself, `count` how many of its
 * options survived the filter.
 *
 * The heading element stays the library's, keeping the id the group's `aria-labelledby`
 * points at.
 */
@Directive({
  selector: '[dsGroupLabelTemplate]',
  standalone: true,
})
export class DsGroupLabelTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
