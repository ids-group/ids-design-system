import {
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import type { CardElevation, CardPadding } from '../../core/card.types';
import { resolveWithConfig } from '../../core/config-defaults';

@Component({
  selector: 'ds-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class CardComponent {
  /** Visual treatment; `interactive` makes the card clickable and emits `pressed`.
   *  Unset falls back to `DS_CONFIG.card.elevation`, then `'flat'`. */
  readonly elevation = input<CardElevation | null>(null);
  /** Inner padding preset. Unset falls back to `DS_CONFIG.card.padding`, then the
   *  card's own padding. */
  readonly padding = input<CardPadding | null>(null);
  /** Fires the click event when `elevation` is `interactive`. */
  readonly pressed = output<MouseEvent>();

  readonly elevationResolved = resolveWithConfig(
    this.elevation,
    (config) => config.card?.elevation,
    'flat' as CardElevation,
  );
  readonly paddingResolved = resolveWithConfig(
    this.padding,
    (config) => config.card?.padding,
    null as CardPadding | null,
  );

  protected readonly interactive = computed(
    () => this.elevationResolved() === 'interactive',
  );

  protected readonly classes = computed(() => {
    const pad = this.paddingResolved();

    return `card ${this.elevationResolved()}${pad ? ' padding-' + pad : ''}`;
  });

  protected onClick(event: MouseEvent): void {
    if (this.interactive()) {
      this.pressed.emit(event);
    }
  }

  // Keydown reaches the card from everything projected into it, so consuming it
  // unconditionally cancelled the descendant's own default action — a form's
  // Enter submit, a checkbox's Space, a typed space.
  protected onActivationKey(event: Event): void {
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  }
}
