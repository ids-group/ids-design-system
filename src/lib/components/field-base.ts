import { Directive, booleanAttribute, input } from '@angular/core';
import { resolveReserveMessage } from './field-defaults';
import {
  normalizeFieldErrors,
  type DsFieldError,
  type DsFieldErrorsInput,
} from './field-errors';

/**
 * The inputs every DS form field has, declared once. Each of these was
 * hand-copied into all fourteen fields before, which is how `success` came to be
 * missing from eight of them and how `ds-date-picker` drifted to a different
 * `invalid` source — a new state added here now reaches every field at once.
 *
 * Only the UNIVERSAL inputs belong here. `success`, `label`, `required` and
 * `optional` are deliberately left to the components: they exist on 9, 9, 7 and
 * 5 fields respectively, and lifting them would hand a checkbox a `success` or a
 * slider a `label` it never had.
 *
 * The `@Directive()` is not decoration — Angular refuses to compile a base class
 * that declares inputs without it. It carries no host bindings of its own; the
 * two `ControlValueAccessor` bases extend this and add theirs.
 */
@Directive()
export abstract class DsFieldBase {
  /** Helper text shown below the field. */
  readonly hint = input<string>('');
  /** Error text. Shown immediately — binding it says the consumer has already
   *  decided this field is in error. Takes precedence over `errors`. */
  readonly error = input<string>('');
  /** Advisory text, shown when there is no error. */
  readonly warning = input<string>('');
  /** Validation errors, shown once the user has interacted. Bound automatically
   *  by signal forms; reactive and template-driven forms are read through
   *  `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  readonly errors = input<readonly DsFieldError[], DsFieldErrorsInput>([], {
    transform: normalizeFieldErrors,
  });
  /** Applies error styling and marks the field `aria-invalid`. */
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

  protected readonly reserveMessageResolved = resolveReserveMessage(
    this.reserveMessage,
  );
}
