import { Component, ViewEncapsulation, input } from '@angular/core';
import type { ContainerSize } from './layout.types';

@Component({
  selector: 'ds-container',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './container.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.data-size]': 'size()',
  },
})
export class ContainerComponent {
  // Max content width; defaults to the global content cap (--col-cap-content).
  /** Max content width before the container centres itself. `full` removes the cap. */
  readonly size = input<ContainerSize>('xl');
}
