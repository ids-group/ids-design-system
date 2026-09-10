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
  selector: 'ds-checkbox',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: { '[attr.data-field-state]': 'controlState()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent extends DsBooleanControlValueAccessor {
  /** Checked state, two-way bound. */
  readonly checked = model<boolean>(false);
  /** Shows the partial/mixed visual state — independent of `checked`. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Disables the checkbox and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Native `name` attribute. */
  readonly name = input<string | null>(null);
  /** Overrides the generated id used by the native `<input>` and its `<label for>`. */
  readonly inputId = input<string | null>(null);
  /** Checkbox size — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Inline label rendered beside the box and wired via for/id. Omit to
   *  bring your own <label>. */
  readonly label = input<string>('');
  /**
   * Accessible name when the control renders no visible label — no `label` and
   * nothing projected. The row's `<label>` collapses when it is empty, so
   * without this a bare box is an unnamed control and there is no way to name
   * it from outside. Set alongside a label and it OVERRIDES what the label
   * says, which is the ARIA rule and almost never what you want.
   */
  readonly ariaLabel = input<string | null>(null);

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly uid = nextControlId('ds-checkbox');
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
  /** Only name via aria-label when there is no visible `<label for>` to do it. */
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || null,
  );
  protected readonly invalidResolved = this.fieldMessage.invalid;
  protected readonly controlState = this.fieldMessage.controlState;

  protected readonly fieldClass = computed(
    () => `checkbox-field size-${this.sizeResolved()}`,
  );

  protected onCheckedChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
