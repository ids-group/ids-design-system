import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';

@Component({
  selector: 'ds-list',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './list.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'list',
    '[class.dividers]': 'dividers()',
  },
})
export class ListComponent {
  // Draw a hairline separator between adjacent items.
  readonly dividers = input(true, { transform: booleanAttribute });
}
