import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { ProgressVariant } from './progress.types';

@Component({
  selector: 'ds-progress',
  standalone: true,
  imports: [],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.success]': "variant() === 'success'",
    '[class.warn]':    "variant() === 'warn'",
    '[class.error]':   "variant() === 'error'",
    '[class.indeterminate]': 'isIndet()',
  },
})
export class ProgressComponent {
  readonly value = input<number>(0);
  readonly variant = input<ProgressVariant>('default');

  protected readonly clampedValue = computed(() => {
    const v = this.value();
    return Math.max(0, Math.min(100, v));
  });

  protected readonly isIndet = computed(() => this.variant() === 'indeterminate');
}
