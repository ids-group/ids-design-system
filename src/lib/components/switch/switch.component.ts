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
import {
  FieldMessageComponent,
  type FieldMessageState,
} from '../field-message/field-message.component';
import { nextControlId } from '../field-ids';
import type { DsSize } from '../../core/size';
import { resolveReserveMessage } from '../field-defaults';

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
  /** Switch size — sm/md/lg. */
  readonly size = input<DsSize>('md');
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
    this.hint() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() ? 'error' : 'default',
  );

  protected readonly switchClasses = computed(() => {
    const variant = this.variant();

    return variant === 'default' ? 'switch' : `switch ${variant}`;
  });

  protected readonly fieldClass = computed(
    () => `switch-field size-${this.size()}`,
  );

  protected onCheckedChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
