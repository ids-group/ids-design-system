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
import { DsBooleanControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import { resolveFieldMessage } from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

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
  /** Switch size — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
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
