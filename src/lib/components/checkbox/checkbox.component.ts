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
import { FieldMessageComponent, type FieldMessageState } from '../field-message/field-message.component';
import { nextControlId } from '../field-ids';

@Component({
  selector: 'ds-checkbox',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
})
export class CheckboxComponent extends DsBooleanControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly indeterminate = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly name = input<string | null>(null);
  readonly inputId = input<string | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly hint = input<string>('');
  /** Inline label rendered beside the box and wired via for/id. Omit to
   *  bring your own <label>. */
  readonly label = input<string>('');

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly uid = nextControlId('ds-checkbox');
  protected readonly controlId = computed(() => this.inputId() ?? this.uid);
  protected readonly hintId = computed(() => (this.hint() ? `${this.uid}-hint` : null));
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() ? 'error' : 'default',
  );

  protected onCheckedChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
