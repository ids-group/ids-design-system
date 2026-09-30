import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import type { BarSemantics, BarVariant } from './bar.types';

/** One horizontal track with one fill: a task's completion, or a measurement on a known scale. */
@Component({
  selector: 'ds-bar',
  standalone: true,
  imports: [],
  templateUrl: './bar.component.html',
  styleUrl: './bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.role]': 'role()',
    '[attr.aria-hidden]': "semantics() === 'none' ? true : null",
    '[attr.aria-valuemin]': 'role() ? 0 : null',
    '[attr.aria-valuemax]': 'role() ? scale() : null',
    '[attr.aria-valuenow]': 'role() && !isIndet() ? clampedValue() : null',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.success]': "variant() === 'success'",
    '[class.warning]': "variant() === 'warning'",
    '[class.error]': "variant() === 'error'",
    '[class.indeterminate]': 'isIndet()',
  },
})
export class BarComponent {
  /** The reading, in units of `max`; clamped, and ignored while `indeterminate`. */
  readonly value = input(0, { transform: numberAttribute });
  /** The full scale `value` and `target` are read against; the accessible name reads "value of max". Zero or less falls back to 100. */
  readonly max = input(100, { transform: numberAttribute });
  /** What the bar is, and so how it is announced. See `BarSemantics`. */
  readonly semantics = input<BarSemantics>('progress');
  /** Colour role: drives the success/warning/error styling. */
  readonly variant = input<BarVariant>('default');
  /** Indeterminate animation instead of a fixed `value`; ignored unless `semantics` is `'progress'`. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Overrides the fill for this one bar. */
  readonly color = input<string | null>(null);
  /** Accessible name. With a `target`, name the comparison here: the role has no second value to
   *  announce. Unused under `semantics="none"`. */
  readonly ariaLabel = input<string | null>(null);
  /** A second point on the scale, drawn as a hairline across the track. Clamped like `value`, ignored while `indeterminate`. */
  readonly target = input<number | null>(null);

  protected readonly role = computed(() => {
    const semantics = this.semantics();

    return semantics === 'none'
      ? null
      : semantics === 'meter'
        ? 'meter'
        : 'progressbar';
  });

  protected readonly scale = computed(() => {
    const max = this.max();

    return Number.isFinite(max) && max > 0 ? max : 100;
  });

  protected readonly clampedValue = computed(() => {
    const value = this.value();

    return Number.isFinite(value)
      ? Math.max(0, Math.min(this.scale(), value))
      : 0;
  });

  protected readonly valuePercent = computed(
    () => (this.clampedValue() / this.scale()) * 100,
  );

  protected readonly clampedTarget = computed(() => {
    const target = this.target();

    return target == null || !Number.isFinite(target)
      ? null
      : Math.max(0, Math.min(this.scale(), target));
  });

  protected readonly targetPercent = computed(() => {
    const target = this.clampedTarget();

    return target === null ? null : (target / this.scale()) * 100;
  });

  protected readonly isIndet = computed(
    () => this.indeterminate() && this.semantics() === 'progress',
  );
}
