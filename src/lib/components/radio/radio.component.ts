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
import { DsFieldBase } from '../field-base';
import type { IconName } from '../../icons/icons.data';
import { nextControlId } from '../field-ids';
import { RADIO_GROUP } from '../radio-group/radio-group.token';
import { FieldMessageComponent } from '../field-message/field-message.component';
import { resolveFieldMessage } from '../field-errors';
import type { DsSize } from '../../core/size';
import { resolveWithConfig } from '../../core/config-defaults';

@Component({
  selector: 'ds-radio',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class RadioComponent extends DsFieldBase {
  /** Glyph on the message line, overriding what the state resolves to. Unset
   *  follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph on this field
   *  alone. */
  readonly messageIcon = input<IconName | false | null>(null);

  /** Standalone two-way binding, and the ONLY way to drive a lone radio: this
   *  component is deliberately not a `ControlValueAccessor`, so `[formControl]` and
   *  `ngModel` do not bind to it. Inside `ds-radio-group` the GROUP is the form
   *  control — a radio is one option of a choice, not a value of its own — and a
   *  second accessor on the option would fight it. A lone radio in a form binds
   *  through `[(checked)]`, or becomes a one-option `ds-radio-group`.
   *
   *  When inside `ds-radio-group`, `isChecked()` derives from the group value and
   *  this input is not read. */
  readonly checked = model<boolean>(false);
  /** Disables the radio; a disabled parent `ds-radio-group` also disables it. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Native `name` attribute — overridden by the group's name when inside `ds-radio-group`. */
  readonly name = input<string>('');
  /** Value compared against the group's selection when inside `ds-radio-group`. */
  readonly value = input<unknown>('');
  /** Overrides the auto-generated id used for the input and its label's `for`. */
  readonly inputId = input<string | null>(null);
  /** Control size — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
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
