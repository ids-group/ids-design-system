import { Component, ViewEncapsulation, input } from '@angular/core';
import type { SpinnerSize } from './spinner.types';

@Component({
  selector: 'ds-spinner',
  standalone: true,
  template: '',
  styleUrl: './spinner.component.scss',
  host: {
    'role': 'status',
    'aria-label': 'Loading',
    '[class.sm]': "size() === 'sm'",
    '[class.lg]': "size() === 'lg'",
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
}
