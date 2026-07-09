import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import type { BadgeVariant } from './badge.types';

@Component({
  selector: 'ds-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly withDot = input(false, { transform: booleanAttribute });
  readonly solid = input(false, { transform: booleanAttribute });
  readonly count = input<number | null>(null);
  readonly max = input(99, { transform: numberAttribute });

  /** Display text for the count, capped at max+. */
  protected readonly countDisplay = computed(() => {
    const value = this.count();
    if (value === null) {
      return null;
    }

    return value > this.max() ? `${this.max()}+` : String(value);
  });

  protected readonly classes = computed(() => {
    const isCount = this.count() !== null;
    const parts = [
      'badge',
      isCount ? 'count' : this.variant(),
      this.solid() ? 'solid' : '',
    ];

    return parts.filter(Boolean).join(' ');
  });

  protected readonly countAriaLabel = computed(() => {
    const value = this.count();
    if (value === null) {
      return null;
    }

    return value > this.max()
      ? `More than ${this.max()} notifications`
      : `${value} notifications`;
  });
}
