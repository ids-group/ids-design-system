import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills a selected chip's content in the trigger of `ds-multi-select` and
 * `ds-autocomplete`. The chip stays a library-owned `ds-tag`: its close button,
 * remove label and overflow cap are not projected.
 */
@Directive({
  selector: '[dsChipTemplate]',
  standalone: true,
})
export class DsChipTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
