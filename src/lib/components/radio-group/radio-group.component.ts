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
import { DsControlValueAccessor } from '../control-value-accessor';
import {
  FieldMessageComponent,
  type FieldMessageState,
} from '../field-message/field-message.component';
import { nextControlId } from '../field-ids';
import { RadioComponent } from '../radio/radio.component';
import {
  RADIO_GROUP,
  type RadioGroupChild,
  type RadioGroupContract,
} from './radio-group.token';
import { resolveReserveMessage } from '../field-defaults';

@Component({
  selector: 'ds-radio-group',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel() || label() || null',
    '[attr.aria-describedby]': 'hintId()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
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
  /** Selected radio value; two-way bound. */
  readonly value = model<unknown>(null);
  /** Native `name` shared by every radio in the group. */
  readonly name = input<string | null>(null);
  /** Disables the whole group. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Applies error styling and marks the group `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Helper text shown below the group. */
  readonly hint = input<string>('');
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
  /** Accessible name for the group when no visible label is provided. */
  readonly ariaLabel = input<string | null>(null);
  /** Visible group label; omit to supply your own. */
  readonly label = input<string>('');

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly uid = nextControlId('ds-radio-group');
  readonly groupName = computed(() => this.name() ?? this.uid);
  protected readonly hintId = computed(() =>
    this.hint() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() ? 'error' : 'default',
  );

  // contentChildren gives us references to all projected RadioComponents
  // so the group can drive roving tabindex and forward keyboard events.
  private readonly radios = contentChildren(RadioComponent);

  private get enabledRadios(): RadioGroupChild[] {
    return (this.radios() as unknown as RadioGroupChild[]).filter(
      (radio) => !radio.effectiveDisabled(),
    );
  }

  isTabbable(radio: RadioGroupChild): boolean {
    const currentValue = this.value();
    const allRadios = this.radios() as unknown as RadioGroupChild[];

    // The checked radio is tabbable; if none checked, the first enabled radio.
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

    // Focus the newly selected radio so keyboard users stay on track.
    const selected = (this.radios() as unknown as RadioGroupChild[]).find(
      (radio) => radio.value() === value,
    );
    selected?.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (
      ![
        'ArrowDown',
        'ArrowRight',
        'ArrowUp',
        'ArrowLeft',
        ' ',
        'Enter',
      ].includes(key)
    ) {
      return;
    }

    const enabled = this.enabledRadios;
    if (!enabled.length) {
      return;
    }

    event.preventDefault();

    if (key === ' ' || key === 'Enter') {
      // Select whichever radio currently has DOM focus.
      const allRadios = this.radios() as unknown as RadioGroupChild[];
      const focused = allRadios.find((radio) => {
        // We rely on the radio exposing focus() which targets its inner input.
        // To detect which radio's input is focused we cast to the concrete type.
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

    // Find the index of the currently focused/selected radio among enabled ones.
    let currentIndex = enabled.findIndex((radio) => {
      const component = radio as unknown as RadioComponent;

      return component.inputElement()?.nativeElement === document.activeElement;
    });

    if (currentIndex === -1) {
      // Fall back to the selected radio's index in the enabled list.
      currentIndex = enabled.findIndex(
        (radio) => radio.value() === currentValue,
      );
    }

    let nextIndex: number;
    if (currentIndex === -1) {
      // Nothing focused/selected yet: forward → first, backward → last.
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
