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
  /** horizontal = label column + value, every item stacking once a value would get less than --ds-description-list-value-min-width; stacked = label above value at every width. */
  readonly orientation = input<DescriptionListOrientation>('horizontal');
}
