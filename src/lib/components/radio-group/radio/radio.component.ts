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
import { DsFieldBase } from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import { RADIO_GROUP } from '../../radio-group/radio-group.token';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import { resolveFieldMessage } from '@ids-group-ltd/ids-design-system/components';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-radio',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class RadioComponent extends DsFieldBase {
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
  /** Lets a checked standalone radio be cleared by clicking it again. Off by default, and
   *  ignored inside `ds-radio-group`: there a radio is one option of a choice, and clearing it
   *  would leave the group with no value through a gesture the group cannot see. */
  readonly deselectable = input(false, { transform: booleanAttribute });
  /** A disabled parent `ds-radio-group` also disables it, whatever this is set to. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Native `name` attribute — overridden by the group's name when inside `ds-radio-group`. */
  readonly name = input<string>('');
  /** Value compared against the group's selection when inside `ds-radio-group`. */
  readonly value = input<unknown>('');
  /** Overrides the auto-generated id used for the input and its label's `for`. */
  readonly inputId = input<string | null>(null);
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
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

  // A radio fires no `change` when an already-checked one is clicked, so the clear cannot ride on
  // onSelect. Click runs before change, and on an unchecked radio isChecked() is still false here.
  protected onClick(): void {
    if (this.effectiveDisabled() || this.group || !this.deselectable()) {
      return;
    }
    if (this.isChecked()) {
      this.checked.set(false);
    }
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
