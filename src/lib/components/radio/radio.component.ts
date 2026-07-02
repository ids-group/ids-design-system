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
import { nextControlId } from '../field-ids';
import { RADIO_GROUP } from '../radio-group/radio-group.token';
import {
  FieldMessageComponent,
  type FieldMessageState,
} from '../field-message/field-message.component';
import type { RadioSize } from './radio.types';

@Component({
  selector: 'ds-radio',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class RadioComponent {
  /** Standalone two-way binding. When inside ds-radio-group, isChecked() is
   *  derived from the group value instead. */
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly name = input<string>('');
  readonly value = input<unknown>('');
  readonly inputId = input<string | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly hint = input<string>('');
  readonly size = input<RadioSize>('md');
  readonly required = input(false, { transform: booleanAttribute });
  /** Inline label rendered beside the dot and wired via for/id. Omit to bring
   *  your own <label>. */
  readonly label = input<string>('');

  protected readonly uid = nextControlId('ds-radio');
  protected readonly controlId = computed(() => this.inputId() ?? this.uid);
  protected readonly hintId = computed(() =>
    this.hint() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() ? 'error' : 'default',
  );

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
    () => `radio-field size-${this.size()}`,
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
