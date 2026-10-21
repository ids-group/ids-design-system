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
  /** The only way to drive a lone radio: it is not a `ControlValueAccessor`, so `[formControl]`
   *  and `ngModel` do not bind to it (inside `ds-radio-group` the group is the form control).
   *  Not read inside a group. */
  readonly checked = model<boolean>(false);
  /** Lets a checked standalone radio be cleared by clicking it again. Ignored inside
   *  `ds-radio-group`, which cannot see that gesture. */
  readonly deselectable = input(false, { transform: booleanAttribute });
  /** A disabled parent `ds-radio-group` also disables it, whatever this is set to. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Native `name`; the group's name overrides it inside `ds-radio-group`. */
  readonly name = input<string>('');
  /** Value compared against the group's selection when inside `ds-radio-group`. */
  readonly value = input<unknown>('');
  /** Overrides the generated id of the input and its label's `for`. */
  readonly inputId = input<string | null>(null);
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Shows an asterisk on the label and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Label beside the dot, wired via for/id. Omit to bring your own <label>. */
  readonly label = input<string>('');
  /** Accessible name for a control with no visible label; overrides `label` when both are set. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly uid = nextControlId('ds-radio');
  protected readonly controlId = computed(() => this.inputId() ?? this.uid);
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    disabled: () => this.effectiveDisabled(),
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || null,
  );
  protected readonly invalidResolved = this.fieldMessage.invalid;

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

  readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  protected get tabIndexAttr(): 0 | -1 {
    if (!this.group) {
      return 0;
    }

    return this.group.isTabbable(this) ? 0 : -1;
  }

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
