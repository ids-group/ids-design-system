import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import type { DsStatusKey } from '../../core/status';
import { resolveWithConfig } from '../../core/config-defaults';

@Component({
  selector: 'ds-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.data-status]': 'status() || null',
  },
})
export class BadgeComponent {
  /** Consumer-defined status key; colours are wired via styles/status. Unset → neutral. */
  readonly status = input<DsStatusKey>();
  /** Leading status dot, rendered only while `count` is unset — a count replaces the
   *  badge's whole content. Unset falls back to `DS_CONFIG.badge.withDot`, then `false`. */
  readonly withDot = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  readonly withDotResolved = resolveWithConfig(
    this.withDot,
    (config) => config.badge?.withDot,
    false,
  );
  /** Solid accent fill instead of the default subtle background. */
  readonly solid = input(false, { transform: booleanAttribute });
  /** Numeric count to display; overrides projected content when set. */
  readonly count = input<number | null>(null);
  /** Count is capped at this value, shown as `"max+"` beyond it. */
  readonly max = input(99, { transform: numberAttribute });
  /** Noun used in the count's accessible label — set for non-notification counts (cart, results, …). */
  readonly countLabel = input('notifications');

  protected readonly countDisplay = computed(() => {
    const value = this.count();
    if (value === null) {
      return null;
    }

    return value > this.max() ? `${this.max()}+` : String(value);
  });

  protected readonly classes = computed(() => {
    const parts = [
      'badge',
      this.count() !== null ? 'count' : '',
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
      ? `More than ${this.max()} ${this.countLabel()}`
      : `${value} ${this.countLabel()}`;
  });
}
