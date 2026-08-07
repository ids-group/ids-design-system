import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  input,
} from '@angular/core';
import type { DsSize } from '../../core/size';
import { DS_FIELD_GROUP, type DsFieldGroupContext } from './field-group.token';

/**
 * One bordered control out of several: `select + input`, `search + button`,
 * `button + select`. The group owns the border, the radius, the focus ring and
 * the divider between segments; the controls inside render "naked".
 *
 * Segments are the direct children. Each hugs its content by default; mark the
 * one that should take the slack with `grow`:
 *
 * ```html
 * <ds-field-group>
 *   <ds-select [options]="scopes" />
 *   <ds-input grow placeholder="Search…" />
 * </ds-field-group>
 * ```
 *
 * A control knows it is a segment by injecting `DS_FIELD_GROUP` — see the token
 * for why that is DI and not an input. Grouped controls must not carry a `label`
 * or a `hint`: their own message row would break the glued line, so it is
 * suppressed and a group-level one is not built yet.
 */
@Component({
  selector: 'ds-field-group',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './field-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[class]': 'size()',
    '[class.invalid]': 'invalid()',
    '[class.disabled]': 'disabled()',
    '[class.full-width]': 'fullWidth()',
  },
  providers: [
    { provide: DS_FIELD_GROUP, useExisting: forwardRef(() => FieldGroupComponent) },
  ],
})
export class FieldGroupComponent implements DsFieldGroupContext {
  /** Segment height — the field family's scale, so a group lines up with a
   *  plain field beside it. */
  readonly size = input<DsSize>('md');
  /** Draws the error border on the whole group. A single segment cannot be
   *  invalid on its own: the border belongs to the group. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Dims the group. Disable the CONTROLS too — this is the chrome, not their
   *  interactivity. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Fills the container instead of hugging its segments. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
}
