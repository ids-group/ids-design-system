import { Directive, booleanAttribute, input } from '@angular/core';
import { resolveShowDirty } from './field-defaults';
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

/**
 * The form-state inputs of a DS value control: what signal forms binds by name beyond `errors`
 * and `touched`. Reactive and template-driven forms are read through `NgControl` instead.
 * @internal
 */
@Directive()
export abstract class DsFormControlBase extends DsFieldBase {
  /** Whether an async validator is running. Bound by signal forms; shows a trailing spinner. */
  readonly pending = input(false, { transform: booleanAttribute });
  /** Whether the user has changed the value. Bound by signal forms; drawn only under `showDirty`. */
  readonly dirty = input(false, { transform: booleanAttribute });
  /** Marks a changed value with a dot and a "Changed" line. Unset falls back to
   *  `DS_CONFIG.field.showDirty`, then `false`. */
  readonly showDirty = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  readonly showDirtyResolved = resolveShowDirty(this.showDirty);
}
