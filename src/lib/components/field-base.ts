import { Directive, booleanAttribute, input } from '@angular/core';
import { DsMessageBase } from './message-base';
import {
  normalizeFieldErrors,
  type DsFieldError,
  type DsFieldErrorsInput,
} from './field-errors';

/**
 * The inputs every DS form field has, declared once.
 *
 * Only the UNIVERSAL ones belong here. `success`, `label`, `required` and
 * `optional` stay on the components: lifting them would hand a checkbox a
 * `success` or a slider a `label` it never had, a silent public-API addition.
 * @internal
 */
@Directive()
export abstract class DsFieldBase extends DsMessageBase {
  /** Validation errors, shown once the user has interacted. Bound automatically
   *  by signal forms; reactive and template-driven forms are read through
   *  `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  readonly errors = input<readonly DsFieldError[], DsFieldErrorsInput>([], {
    transform: normalizeFieldErrors,
  });
  /** Paints the error state and sets `aria-invalid`, WITHOUT a message of its own, for when
   *  the text lives elsewhere (an error summary, one message covering a field group).
   *  Use `error` to show text. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Whether the user has interacted with the field. Bound by signal forms; gates
   *  `errors`, so a `required` error does not greet an untouched form. */
  readonly touched = input(false, { transform: booleanAttribute });
}
