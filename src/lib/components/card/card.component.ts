import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import type { CardElevation, CardPadding } from './card.types';

@Component({
  selector: 'ds-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class CardComponent {
  readonly elevation = input<CardElevation>('flat');
  readonly padding = input<CardPadding | null>(null);
  readonly pressed = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const pad = this.padding();

    return `card ${this.elevation()}${pad ? ' padding-' + pad : ''}`;
  });

  protected onClick(event: MouseEvent): void {
    if (this.elevation() === 'interactive') {
      this.pressed.emit(event);
    }
  }
}
