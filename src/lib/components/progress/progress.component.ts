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
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'isIndet() ? null : clampedValue()',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.success]': "variant() === 'success'",
    '[class.warn]': "variant() === 'warn'",
    '[class.error]': "variant() === 'error'",
    '[class.indeterminate]': 'isIndet()',
  },
})
export class ProgressComponent {
  readonly value = input<number>(0);
  readonly variant = input<ProgressVariant>('default');
  /** Accessible name for the progress bar (e.g. "Upload progress"). */
  readonly ariaLabel = input<string | null>(null);

  protected readonly clampedValue = computed(() => {
    const value = this.value();

    return Math.max(0, Math.min(100, value));
  });

  protected readonly isIndet = computed(
    () => this.variant() === 'indeterminate',
  );
}
