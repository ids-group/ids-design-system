import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import type { DsStatusKey } from '@ids-group-ltd/ids-design-system/core';
import {
  DS_INTL,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';

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
  protected readonly intl = inject(DS_INTL);
  /** Consumer-defined status key that colours the badge. Unset is neutral. */
  readonly status = input<DsStatusKey>();
  /** Leading status dot, rendered only while `count` is unset (a count replaces the
   *  badge's whole content). Unset falls back to `DS_CONFIG.badge.withDot`, then `false`. */
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
  /** Counts above this show as `"max+"`. */
  readonly max = input(99, { transform: numberAttribute });
  /** Noun used in the count's accessible label; set for non-notification counts (cart, results).
   *  Unset falls back to `DS_INTL.badge.noun`. */
  readonly countLabel = input<string | null>(null);
  readonly countLabelResolved = computed(
    () => this.countLabel() ?? this.intl().badge.noun,
  );

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
    const noun = this.countLabelResolved();

    return value > this.max()
      ? this.intl().badge.overMax(this.max(), noun)
      : this.intl().badge.count(value, noun);
  });
}
