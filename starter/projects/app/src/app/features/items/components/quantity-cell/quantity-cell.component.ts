import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { isLowStock } from '../../items.utils';

/** Presentational: renders an item quantity, emphasised when low-stock. */
@Component({
  selector: 'app-quantity-cell',
  template: `<span [class.low]="low()">{{ quantity() }}</span>`,
  styles: `
    .low {
      color: var(--warning-text, var(--warning));
      font-weight: var(--font-weight-bold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityCellComponent {
  readonly quantity = input.required<number>();
  protected readonly low = computed(() => isLowStock(this.quantity()));
}
