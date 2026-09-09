import { Component, input, output } from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';

/**
 * The button in the table's utility header cell that opens the column panel.
 *
 * @internal Not API — created by `DsTableColumns` in the header-utility anchor.
 */
@Component({
  selector: 'ds-table-columns-trigger',
  standalone: true,
  styleUrl: './table-columns-trigger.component.scss',
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="col-picker-btn"
      aria-haspopup="dialog"
      aria-label="Choose columns"
      [attr.aria-expanded]="opened()"
      (click)="pressed.emit($event)">
      <ds-icon name="grid" [size]="14" />
    </button>
  `,
})
export class TableColumnsTriggerComponent {
  readonly opened = input(false);
  readonly pressed = output<Event>();
}
