import { Directive, booleanAttribute, input } from '@angular/core';
import { resolveReserveMessage } from './field-defaults';
import {
  normalizeFieldErrors,
  trimmedText,
  type DsFieldError,
  type DsFieldErrorsInput,
} from './field-errors';

/**
 * The inputs every DS form field has, declared once.
 *
 * Only the UNIVERSAL ones belong here. `success`, `label`, `required` and
 * `optional` stay on the components: they exist on some fields and not others, so
 * lifting them would hand a checkbox a `success` or a slider a `label` it never
 * had — a silent public-API addition.
 *
 * `@Directive()` is required, not decoration: Angular refuses to compile a base
 * class that declares inputs without it.
 */
@Directive()
export abstract class DsFieldBase {
  /** Helper text shown below the field. */
  readonly hint = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Error text. Shown immediately — binding it says the consumer has already
   *  decided this field is in error. Takes precedence over `errors`. */
  readonly error = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Advisory text, shown when there is no error. */
  readonly warning = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Validation errors, shown once the user has interacted. Bound automatically
   *  by signal forms; reactive and template-driven forms are read through
   *  `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  readonly errors = input<readonly DsFieldError[], DsFieldErrorsInput>([], {
    transform: normalizeFieldErrors,
  });
  /** Paints the error state and sets `aria-invalid`, WITHOUT a message of its own
   *  — for when the text lives elsewhere, such as a form-level error summary or
   *  one message covering a whole field group. Use `error` to show text. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Whether the user has interacted with the field. Bound by signal forms; gates
   *  `errors`, so a `required` error does not greet an untouched form. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Reserve the message-row height even when empty, so the field doesn't shift
   *  the layout below it when a hint/error appears. Falls back to
   *  `DS_CONFIG.field.reserveMessage`, then off — opt in per field, or app-wide
   *  for a form that shows validation messages. */
  readonly reserveMessage = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  readonly reserveMessageResolved = resolveReserveMessage(this.reserveMessage);
}
