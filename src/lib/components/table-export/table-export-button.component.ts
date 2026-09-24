import {
  Component,
  ViewEncapsulation,
  inject,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';

/**
 * The toolbar control `DsTableExport` renders for itself.
 *
 * It exists as a component rather than a `createComponent(ButtonComponent)` call with
 * `setInput` per binding, so the button's markup stays ordinary template code instead of a
 * hand-rolled imperative copy that drifts from `ds-button`'s own API.
 *
 * @internal Not API — created by the directive, never written in a consumer's template.
 */
@Component({
  selector: 'ds-table-export-button',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [ButtonComponent],
  template: `
    <ds-button
      color="neutral"
      variant="outline"
      size="sm"
      [disabled]="busy()"
      (pressed)="pressed.emit()">
      {{ busy() ? intl().tableExport.buttonBusy : intl().tableExport.button }}
    </ds-button>
  `,
})
export class TableExportButtonComponent {
  protected readonly intl = inject(DS_INTL);
  readonly busy = input(false);
  readonly pressed = output<void>();
}
