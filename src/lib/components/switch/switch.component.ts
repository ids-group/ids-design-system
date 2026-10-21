import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DsBooleanControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
import { resolveFieldMessage } from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-switch',
  standalone: true,
  imports: [FieldMessageComponent, FieldStatusComponent],
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
  /** Overrides the generated id of the native `<input>` and its `<label for>`. */
  readonly inputId = input<string | null>(null);
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Label beside the track, wired via for/id. Omit to bring your own <label>. */
  readonly label = input<string>('');
  /** Accessible name for a control with no visible label; overrides `label` when both are set. */
  readonly ariaLabel = input<string | null>(null);
  /**
   * The switch never flips itself: a click or Space cancels the native toggle and
   * `checkedRequested` carries the value the user asked for. It moves only when
   * `checked` changes from outside, so a cancelled confirmation changes nothing.
   */
  readonly controlled = input(false, { transform: booleanAttribute });
  /** The value the user asked for, emitted in place of a flip when `controlled`. Silent otherwise. */
  readonly checkedRequested = output<boolean>();

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly uid = nextControlId('ds-switch');
  protected readonly controlId = computed(() => this.inputId() ?? this.uid);
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
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly pendingShown = this.fieldMessage.pending;
  protected readonly changedShown = this.fieldMessage.changed;
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || null,
  );
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

  protected onClick(event: MouseEvent): void {
    if (!this.controlled()) {
      return;
    }
    event.preventDefault();
    this.checkedRequested.emit(!this.checked());
  }
}
