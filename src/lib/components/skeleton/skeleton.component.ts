import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'ds-skeleton',
  standalone: true,
  template: '',
  styleUrl: './skeleton.component.scss',
  host: {
    'aria-hidden': 'true',
    '[style.width]':  'width()',
    '[style.height]': 'height()',
    '[class.circle]': 'circle()',
    '[class.inline]': 'inline()',
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class SkeletonComponent {
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
  readonly circle = input<boolean>(false);
  readonly inline = input<boolean>(false);
}
