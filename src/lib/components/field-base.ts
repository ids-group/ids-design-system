import { Directive, booleanAttribute, input } from '@angular/core';
import { DsMessageBase } from './message-base';
import {
  normalizeFieldErrors,
  type DsFieldError,
  type DsFieldErrorsInput,
} from './field-errors';

/**
 * The inputs every DS form field has, declared once. Only UNIVERSAL inputs belong
 * here: lifting `success` or `label` would add them to controls that never had them.
 * @internal
 */
@Directive()
export abstract class DsFieldBase extends DsMessageBase {
  /** Validation errors, shown once the user has interacted. Bound by signal forms;
   *  reactive and template-driven forms are read through `NgControl`. */
  readonly errors = input<readonly DsFieldError[], DsFieldErrorsInput>([], {
    transform: normalizeFieldErrors,
  });
  /** Paints the error state and sets `aria-invalid` WITHOUT a message; use `error` to show text. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Whether the user has interacted with the field. Bound by signal forms; gates `errors`. */
  readonly touched = input(false, { transform: booleanAttribute });
}
