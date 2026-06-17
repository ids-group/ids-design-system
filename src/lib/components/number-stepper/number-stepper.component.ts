import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import type { NumberStepperSize } from './number-stepper.types';

@Component({
  selector: 'ds-number-stepper',
  standalone: true,
  templateUrl: './number-stepper.component.html',
  styleUrl: './number-stepper.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberStepperComponent {
  readonly value = model<number>(0);
  readonly min = input<number>(0);
  readonly max = input<number | null>(null);
  readonly step = input<number>(1);
  readonly size = input<NumberStepperSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });

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
