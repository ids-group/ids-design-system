import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { DS_FIELD_GROUP, type DsFieldGroupContext } from './field-group.token';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import { DsMessageBase } from '@ids-group-ltd/ids-design-system/components';
import {
  nextControlId,
  resolveFieldMessage,
} from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';

/**
 * One bordered control out of several: `select + input`, `search + button`, `button + select`. The group owns the border, radius,
 * focus ring and segment dividers; the controls inside render "naked".
 *
 * Segments are the direct children. Each hugs its content by default; mark the one that should take the slack with `grow`:
 *
 * ```html
 * <ds-field-group error="Введите сумму больше нуля">
 *   <ds-select [options]="currencies" />
 *   <ds-input grow [(value)]="amount" />
 * </ds-field-group>
 * ```
 *
 * A control knows it is a segment by injecting `DS_FIELD_GROUP`. A segment's own label and message stay suppressed; the group
 * carries them: `error` for state with text, `invalid` for state whose text lives elsewhere.
 */
@Component({
  selector: 'ds-field-group',
  standalone: true,
  imports: [FieldMessageComponent],
  templateUrl: './field-group.component.html',
  styleUrl: './field-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[class]': 'sizeResolved()',
    '[class.invalid]': 'invalidResolved()',
    '[class.disabled]': 'disabled()',
    '[class.full-width]': 'fullWidth()',
  },
  providers: [
    {
      provide: DS_FIELD_GROUP,
      useExisting: forwardRef(() => FieldGroupComponent),
    },
  ],
})
export class FieldGroupComponent
  extends DsMessageBase
  implements DsFieldGroupContext
{
  /** Segment height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Paints the error state without a message, for when the text lives elsewhere. Use `error` to show text; either one is enough. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Dims the group's chrome; disable the controls too. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Fills the container instead of hugging its segments. */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  private readonly uid = nextControlId('ds-field-group');
  private readonly fieldMessage = resolveFieldMessage({
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: computed(() => []),
    invalid: this.invalid,
  });
  protected readonly message = this.fieldMessage.message;
  readonly invalidResolved = this.fieldMessage.invalid;
  readonly messageId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
}
