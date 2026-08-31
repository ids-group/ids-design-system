import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Fills a selected chip's content in the trigger of `ds-multi-select` and
 * `ds-autocomplete`, so a picker whose rows carry an avatar does not lose it the
 * moment the option is chosen.
 *
 * The chip is still a `ds-tag` owned by the library: its close button, its
 * accessible remove label and the measured overflow cap are not projected.
 */
@Directive({
  selector: '[dsChipTemplate]',
  standalone: true,
})
export class DsChipTemplateDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
