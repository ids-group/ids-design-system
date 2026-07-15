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
  /** Visual treatment; `interactive` makes the card clickable and emits `pressed`. */
  readonly elevation = input<CardElevation>('flat');
  /** Inner padding preset; `null` keeps the card's default padding. */
  readonly padding = input<CardPadding | null>(null);
  /** Fires the click event when `elevation` is `interactive`. */
  readonly pressed = output<MouseEvent>();

  protected readonly interactive = computed(
    () => this.elevation() === 'interactive',
  );

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
