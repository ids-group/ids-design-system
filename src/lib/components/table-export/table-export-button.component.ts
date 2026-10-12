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
 * @internal Not API - created by the directive, never written in a consumer's template.
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
      [loading]="busy()"
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
