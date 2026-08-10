import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { optionalBound, boundOr } from '../../core/field-bounds';
import type { DsSize } from '../../core/size';

@Component({
  selector: 'ds-number-stepper',
  standalone: true,
  templateUrl: './number-stepper.component.html',
  styleUrl: './number-stepper.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberStepperComponent {
  /** Current numeric value, two-way bound. */
  readonly value = model<number>(0);
  /** Lower bound — the decrement button and typed input clamp to it. */
  readonly min = input<number, number | undefined>(0, {
    transform: boundOr(0),
  });
  /** Upper bound — the increment button and typed input clamp to it; unbounded when null. */
  readonly max = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  /** Amount added or subtracted per increment/decrement. */
  readonly step = input<number>(1);
  /** Control height — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Disables the stepper and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name for the number input (the stepper has no visible label). */
  readonly ariaLabel = input<string | null>(null);

  protected readonly atMin = computed(() => this.value() <= this.min());
  protected readonly atMax = computed(() => {
    const max = this.max();

    return max != null && this.value() >= max;
  });

  protected readonly stepperClass = computed(() => {
    const parts = ['stepper', `size-${this.size()}`];
    if (this.disabled()) {
      parts.push('disabled');
    }

    return parts.join(' ');
  });

  inc(): void {
    if (this.atMax() || this.disabled()) {
      return;
    }
    this.value.set(this.value() + this.step());
  }

  dec(): void {
    if (this.atMin() || this.disabled()) {
      return;
    }
    this.value.set(this.value() - this.step());
  }

  protected setRaw(raw: string): void {
    const parsed = Number.parseInt(raw, 10);
    const number = Number.isNaN(parsed) ? 0 : parsed;
    let clamped = Math.max(this.min(), number);
    const max = this.max();
    if (max != null) {
      clamped = Math.min(max, clamped);
    }
    this.value.set(clamped);
  }
}
