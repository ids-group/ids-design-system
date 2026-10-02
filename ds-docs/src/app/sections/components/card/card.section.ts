import { Component, ViewEncapsulation, signal } from '@angular/core';
import { CardComponent } from 'ds/card';
import type { CardElevation, CardPadding } from 'ds/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-card',
  standalone: true,
  imports: [CardComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './card.section.html',
  styleUrl: './card.section.scss',
})
export class CardSection {
  protected readonly elevations: readonly CardElevation[] = [
    'flat',
    'raised',
    'hover',
  ];
  protected readonly paddings: readonly CardPadding[] = ['sm', 'md', 'lg'];
  protected readonly pressedCount = signal(0);
}
