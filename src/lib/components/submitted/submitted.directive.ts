import { Directive, booleanAttribute, inject, input } from '@angular/core';
import { DS_SUBMITTED } from '@ids-group-ltd/ids-design-system/components';

/**
 * The form's submit flag. Every DS field declared inside the host shows its validation errors
 * only while the flag is `true`; the submit button reads the same flag:
 *
 * ```html
 * <form [dsSubmitted]="submitted()">
 *   <ds-input label="Email" [formField]="form.email" />
 *   <ds-button [disabled]="submitted() && form().invalid()" (pressed)="send()">Send</ds-button>
 * </form>
 * ```
 *
 * Set the flag at the start of the submit handler and back to `false` when the form resets.
 * Any element can host it, so fields outside a `<form>` work the same way. A reactive or
 * template-driven form submitted through `ngSubmit` reveals its errors without it.
 *
 * Applies to fields declared inside the host; projected content keeps the injector of the
 * template it was written in.
 */
@Directive({
  selector: '[dsSubmitted]',
  standalone: true,
  providers: [
    {
      provide: DS_SUBMITTED,
      useFactory: () => inject(SubmittedDirective).dsSubmitted,
    },
  ],
})
export class SubmittedDirective {
  readonly dsSubmitted = input.required<boolean, unknown>({
    transform: booleanAttribute,
  });
}
