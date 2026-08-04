import {
  Component,
  type ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  isDevMode,
  model,
  viewChild,
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
  selector: 'ds-checkbox',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
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
  /** Applies error styling and marks the input `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Helper text shown below the checkbox. */
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
  /** Checkbox size — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Inline label rendered beside the box and wired via for/id. Omit to
   *  bring your own <label>. */
  readonly label = input<string>('');

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly uid = nextControlId('ds-checkbox');
  protected readonly controlId = computed(() => this.inputId() ?? this.uid);
  protected readonly hintId = computed(() =>
    this.hint() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() ? 'error' : 'default',
  );

  protected readonly fieldClass = computed(
    () => `checkbox-field size-${this.size()}`,
  );

  protected onCheckedChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }

  protected readonly devMode = isDevMode();
  private readonly projectionProbe =
    viewChild<ElementRef<HTMLElement>>('projectionProbe');

  constructor() {
    super();

    if (this.devMode) {
      afterNextRender(() => {
        if (!this.projectionProbe()?.nativeElement.textContent?.trim()) {
          return;
        }
        console.warn(
          '[ds-checkbox] Projected content renders nothing — the caption comes from the [label] input only, so `<ds-checkbox>Some text</ds-checkbox>` shows no caption at all. Move the text into [label].',
        );
      });
    }
  }
}
