import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { nextControlId } from '../field-ids';
import { RADIO_GROUP } from '../radio-group/radio-group.token';
import { FieldMessageComponent } from '../field-message/field-message.component';
import {
  normalizeFieldErrors,
  resolveFieldMessage,
  type DsFieldError,
  type DsFieldErrorsInput,
} from '../field-errors';
import type { DsSize } from '../../core/size';
import { resolveReserveMessage } from '../field-defaults';
import { resolveWithConfig } from '../../core/config-defaults';

@Component({
  selector: 'ds-radio',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class RadioComponent {
  /** Standalone two-way binding. When inside ds-radio-group, isChecked() is
   *  derived from the group value instead. */
  readonly checked = model<boolean>(false);
  /** Disables the radio; a disabled parent `ds-radio-group` also disables it. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Native `name` attribute — overridden by the group's name when inside `ds-radio-group`. */
  readonly name = input<string>('');
  /** Value compared against the group's selection when inside `ds-radio-group`. */
  readonly value = input<unknown>('');
  /** Overrides the auto-generated id used for the input and its label's `for`. */
  readonly inputId = input<string | null>(null);
  /** Applies error styling and marks the input `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Helper text shown below the control. */
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
  /** Control size — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  protected readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Marks the radio required — shows an asterisk on the label and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Inline label rendered beside the dot and wired via for/id. Omit to bring
   *  your own <label>. */
  readonly label = input<string>('');

  protected readonly uid = nextControlId('ds-radio');
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
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly invalidResolved = this.fieldMessage.invalid;

  /** Injected via token to avoid circular import with RadioGroupComponent. */
  protected readonly group = inject(RADIO_GROUP, { optional: true });

  readonly effectiveDisabled = computed(
    () => this.group?.isDisabled() || this.disabled(),
  );
  protected readonly effectiveName = computed(
    () => this.group?.groupName() ?? this.name(),
  );
  protected readonly isChecked = computed(() =>
    this.group ? this.group.value() === this.value() : this.checked(),
  );

  protected readonly fieldClass = computed(
    () => `radio-field size-${this.sizeResolved()}`,
  );

  /** Exposed so the group can implement roving tabindex. */
  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  protected get tabIndexAttr(): 0 | -1 {
    if (!this.group) {
      return 0;
    }

    return this.group.isTabbable(this) ? 0 : -1;
  }

  /** Called by the group's keyboard handler to focus this radio's input. */
  focus(): void {
    this.inputElement()?.nativeElement.focus();
  }

  protected onSelect(): void {
    if (this.effectiveDisabled()) {
      return;
    }
    if (this.group) {
      this.group.select(this.value());
    } else {
      this.checked.set(true);
    }
  }
}
