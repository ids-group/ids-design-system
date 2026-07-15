import { Component, ViewEncapsulation, input } from '@angular/core';

export type DescriptionListOrientation = 'horizontal' | 'stacked';

@Component({
  selector: 'ds-description-list',
  standalone: true,
  templateUrl: './description-list.component.html',
  styleUrl: './description-list.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.stacked]': "orientation() === 'stacked'",
  },
})
export class DescriptionListComponent {
  /** horizontal = label column + value; stacked = label above value. */
  readonly orientation = input<DescriptionListOrientation>('horizontal');
}
