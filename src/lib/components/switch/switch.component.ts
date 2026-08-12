import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DsBooleanControlValueAccessor } from '../control-value-accessor';
import { FieldMessageComponent } from '../field-message/field-message.component';
import {
  normalizeFieldErrors,
  resolveFieldMessage,
  type DsFieldError,
  type DsFieldErrorsInput,
} from '../field-errors';
import { nextControlId } from '../field-ids';
import type { DsSize } from '../../core/size';
import { resolveReserveMessage } from '../field-defaults';
import { resolveWithConfig } from '../../core/config-defaults';

@Component({
  selector: 'ds-switch',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent extends DsBooleanControlValueAccessor {
  /** On/off state, two-way bound. */
  readonly checked = model<boolean>(false);
  /** Disables the switch and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Native `name` attribute. */
  readonly name = input<string | null>(null);
  /** Track colour when checked. */
  readonly variant = input<'default' | 'success' | 'error'>('default');
  /** Overrides the generated id used by the native `<input>` and its `<label for>`. */
  readonly inputId = input<string | null>(null);
  /** Applies error styling and marks the input `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Helper text shown below the switch. */
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
  /** Switch size — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  protected readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Inline label rendered beside the track and wired via for/id. Omit to
   *  bring your own <label>. */
  readonly label = input<string>('');

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly uid = nextControlId('ds-switch');
  protected readonly controlId = computed(() => this.inputId() ?? this.uid);
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly invalidResolved = this.fieldMessage.invalid;

  protected readonly switchClasses = computed(() => {
    const variant = this.variant();

    return variant === 'default' ? 'switch' : `switch ${variant}`;
  });

  protected readonly fieldClass = computed(
    () => `switch-field size-${this.sizeResolved()}`,
  );

  protected onCheckedChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
