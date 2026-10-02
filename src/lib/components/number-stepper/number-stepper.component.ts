import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import {
  DS_INTL,
  optionalBound,
  boundOr,
} from '@ids-group-ltd/ids-design-system/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

function clampToBounds(value: number, min: number, max: number | null): number {
  const atLeastMin = Math.max(min, value);

  return max == null ? atLeastMin : Math.min(max, atLeastMin);
}

@Component({
  selector: 'ds-number-stepper',
  standalone: true,
  templateUrl: './number-stepper.component.html',
  styleUrl: './number-stepper.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberStepperComponent {
  protected readonly intl = inject(DS_INTL);
  /** Current numeric value, two-way bound. */
  readonly value = model<number>(0);
  /** Lower bound; the decrement button and typed input clamp to it. */
  readonly min = input<number, number | undefined>(0, {
    transform: boundOr(0),
  });
  /** Upper bound; the increment button and typed input clamp to it. Unbounded when null. */
  readonly max = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  /** Amount added or subtracted per click. */
  readonly step = input<number>(1);
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Disables the stepper and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name for the number input; the stepper has no visible label. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly atMin = computed(() => this.value() <= this.min());
  protected readonly atMax = computed(() => {
    const max = this.max();

    return max != null && this.value() >= max;
  });

  protected readonly stepperClass = computed(() => {
    const parts = ['stepper', `size-${this.sizeResolved()}`];
    if (this.disabled()) {
      parts.push('disabled');
    }

    return parts.join(' ');
  });

  inc(): void {
    if (this.atMax() || this.disabled()) {
      return;
    }
    this.value.set(
      clampToBounds(this.value() + this.step(), this.min(), this.max()),
    );
  }

  dec(): void {
    if (this.atMin() || this.disabled()) {
      return;
    }
    this.value.set(
      clampToBounds(this.value() - this.step(), this.min(), this.max()),
    );
  }

  protected setRaw(raw: string): void {
    const parsed = Number.parseInt(raw, 10);
    this.value.set(
      clampToBounds(Number.isNaN(parsed) ? 0 : parsed, this.min(), this.max()),
    );
  }
}
