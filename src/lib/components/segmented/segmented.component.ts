import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
import { resolveFieldMessage } from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import type { SegmentedOption } from './segmented.types';

@Component({
  selector: 'ds-segmented',
  standalone: true,
  imports: [IconComponent, FieldMessageComponent, FieldStatusComponent],
  templateUrl: './segmented.component.html',
  styleUrl: './segmented.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel() || label() || null',
    '[attr.aria-describedby]': 'hintId()',
    '[attr.aria-invalid]': "invalidResolved() ? 'true' : null",
    '[class.joined]': 'joined()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SegmentedComponent),
      multi: true,
    },
  ],
})
export class SegmentedComponent extends DsControlValueAccessor<string> {
  /** Segments to render; each needs a `label` and `value`, optional `icon`/`disabled`. */
  readonly options = input<readonly SegmentedOption[]>([]);
  /** `value` of the selected segment. */
  readonly value = model<string>('');
  /** Accessible name of the radiogroup. */
  readonly ariaLabel = input<string | null>(null);
  /** Visible label above the track. */
  readonly label = input<string>('');
  /** Disables every segment. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Segments share edges instead of floating in a padded track; only the outer ends round.
   *  Needs `--ds-segmented-segment-border` set, since the shared edge is the border. */
  readonly joined = input(false, { transform: booleanAttribute });

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly uid = nextControlId('ds-segmented');
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

  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('seg');

  protected readonly focusableValue = computed(() => {
    const value = this.value();
    const options = this.options();
    if (options.some((option) => option.value === value && !option.disabled)) {
      return value;
    }

    return options.find((option) => !option.disabled)?.value ?? null;
  });

  protected select(option: SegmentedOption): void {
    if (option.disabled || this.isDisabled()) {
      return;
    }
    this.value.set(option.value);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const options = this.options();
    let target = -1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = this.nextEnabled(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = this.nextEnabled(index, -1);
        break;
      case 'Home':
        target = this.nextEnabled(-1, 1);
        break;
      case 'End':
        target = this.nextEnabled(options.length, -1);
        break;
      default:
        return;
    }
    if (target < 0) {
      return;
    }
    event.preventDefault();
    this.value.set(options[target].value);
    this.buttons()[target]?.nativeElement.focus();
  }

  private nextEnabled(from: number, step: number): number {
    const options = this.options();
    const count = options.length;
    if (count === 0) {
      return -1;
    }
    let index = from;
    for (let i = 0; i < count; i++) {
      index = (index + step + count) % count;
      if (!options[index].disabled) {
        return index;
      }
    }

    return -1;
  }
}
