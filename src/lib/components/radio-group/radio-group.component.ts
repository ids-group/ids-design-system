import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  input,
  model,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
import { resolveFieldMessage } from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import { RadioComponent } from './radio/radio.component';
import {
  RADIO_GROUP,
  type RadioGroupChild,
  type RadioGroupContract,
} from './radio-group.token';
import { isTextEntryTarget } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-radio-group',
  standalone: true,
  imports: [FieldMessageComponent, FieldStatusComponent],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel() || label() || null',
    '[attr.aria-describedby]': 'hintId()',
    '[attr.aria-invalid]': "invalidResolved() ? 'true' : null",
    '[attr.data-field-state]': 'controlState()',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
    {
      provide: RADIO_GROUP,
      useExisting: forwardRef(() => RadioGroupComponent),
    },
  ],
})
export class RadioGroupComponent
  extends DsControlValueAccessor<unknown>
  implements RadioGroupContract
{
  /** Value of the selected radio. */
  readonly value = model<unknown>(null);
  /** Native `name` shared by every radio. */
  readonly name = input<string | null>(null);
  /** Disables the whole group. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name when there is no visible `label`. */
  readonly ariaLabel = input<string | null>(null);
  /** Visible group label; omit to supply your own. */
  readonly label = input<string>('');

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly uid = nextControlId('ds-radio-group');
  readonly groupName = computed(() => this.name() ?? this.uid);
  protected readonly hintId = computed(() =>
    this.message().text || this.changedShown() ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    pending: this.pending,
    dirty: this.dirty,
    showDirty: this.showDirtyResolved,
    disabled: () => this.isDisabled(),
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly pendingShown = this.fieldMessage.pending;
  protected readonly changedShown = this.fieldMessage.changed;
  protected readonly invalidResolved = this.fieldMessage.invalid;
  protected readonly controlState = this.fieldMessage.controlState;

  private readonly radios = contentChildren(RadioComponent);

  private get enabledRadios(): RadioGroupChild[] {
    return (this.radios() as unknown as RadioGroupChild[]).filter(
      (radio) => !radio.effectiveDisabled(),
    );
  }

  isTabbable(radio: RadioGroupChild): boolean {
    const currentValue = this.value();
    const allRadios = this.radios() as unknown as RadioGroupChild[];

    if (currentValue !== null && currentValue !== undefined) {
      const matchIndex = allRadios.findIndex((r) => r.value() === currentValue);
      if (matchIndex !== -1) {
        return allRadios[matchIndex] === radio;
      }
    }

    const firstEnabled = allRadios.find((r) => !r.effectiveDisabled());

    return firstEnabled === radio;
  }

  select(value: unknown): void {
    this.value.set(value);
    this.markTouched();

    const selected = (this.radios() as unknown as RadioGroupChild[]).find(
      (radio) => radio.value() === value,
    );
    selected?.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    // Enter is deliberately absent: swallowing it would remove the form's keyboard submit.
    if (
      !['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', ' '].includes(key)
    ) {
      return;
    }
    // A text field beside the radios (an "Other" row) types its own keys.
    if (isTextEntryTarget(event)) {
      return;
    }

    const enabled = this.enabledRadios;
    if (!enabled.length) {
      return;
    }

    event.preventDefault();

    if (key === ' ') {
      const allRadios = this.radios() as unknown as RadioGroupChild[];
      const focused = allRadios.find((radio) => {
        const component = radio as unknown as RadioComponent;

        return (
          component.inputElement()?.nativeElement === document.activeElement
        );
      });
      if (focused) {
        this.select(focused.value());
      }

      return;
    }

    const forward = key === 'ArrowDown' || key === 'ArrowRight';
    const currentValue = this.value();

    let currentIndex = enabled.findIndex((radio) => {
      const component = radio as unknown as RadioComponent;

      return component.inputElement()?.nativeElement === document.activeElement;
    });

    if (currentIndex === -1) {
      currentIndex = enabled.findIndex(
        (radio) => radio.value() === currentValue,
      );
    }

    let nextIndex: number;
    if (currentIndex === -1) {
      nextIndex = forward ? 0 : enabled.length - 1;
    } else {
      nextIndex = forward
        ? (currentIndex + 1) % enabled.length
        : (currentIndex - 1 + enabled.length) % enabled.length;
    }

    const target = enabled[nextIndex];
    this.select(target.value());
  }
}
