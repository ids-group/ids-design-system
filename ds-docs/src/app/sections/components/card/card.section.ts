import { Component, ViewEncapsulation } from '@angular/core';
import { CardComponent, type CardElevation, type CardPadding } from 'ds';

@Component({
  selector: 'section-components-card',
  standalone: true,
  imports: [CardComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './card.section.html',
  styleUrl: './card.section.scss',
})
export class CardSection {
  protected readonly elevations: readonly CardElevation[] = ['flat', 'raised', 'hover'];
  protected readonly paddings: readonly CardPadding[] = ['sm', 'md', 'lg'];
}
