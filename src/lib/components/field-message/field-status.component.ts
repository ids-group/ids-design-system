import { Component, ViewEncapsulation, input } from '@angular/core';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';

/** The trailing marks inside a field's control: a spinner while `pending`, a dot when `changed`.
 *  The dot is decorative; `ds-field-message` carries the "Changed" text the field describes itself with.
 * @internal
 */
@Component({
  selector: 'ds-field-status',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    @if (pending()) {
      <ds-spinner size="sm" />
    }

    @if (changed()) {
      <span class="changed-dot" aria-hidden="true"></span>
    }
  `,
  styleUrl: './field-status.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class FieldStatusComponent {
  /** Shows the spinner. */
  readonly pending = input(false);
  /** Shows the changed dot. */
  readonly changed = input(false);
}
