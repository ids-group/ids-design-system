import { Component, ViewEncapsulation, input } from '@angular/core';
import type { DsSize } from '../../core/size';

@Component({
  selector: 'ds-spinner',
  standalone: true,
  template: '',
  styleUrl: './spinner.component.scss',
  host: {
    role: 'status',
    'aria-label': 'Loading',
    '[class.sm]': "size() === 'sm'",
    '[class.lg]': "size() === 'lg'",
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class SpinnerComponent {
  /** Spinner size — sm/md/lg. */
  readonly size = input<DsSize>('md');
}
