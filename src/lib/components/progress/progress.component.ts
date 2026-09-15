import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
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
    '[class.warning]': "variant() === 'warning'",
    '[class.error]': "variant() === 'error'",
    '[class.indeterminate]': 'isIndet()',
  },
})
export class ProgressComponent {
  /** Progress 0–100; clamped, and ignored while `indeterminate`. */
  readonly value = input<number>(0);
  /** Colour variant — drives the success/warning/error styling. */
  readonly variant = input<ProgressVariant>('default');
  /** Indeterminate (unknown-duration) animation instead of a fixed `value`. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Accessible name for the progress bar (e.g. "Upload progress"). With a `target` set, name the
   *  comparison here — the mark is drawn, and `role="progressbar"` has no second value to announce,
   *  so "Resolved 62% against a 75% target" is what reaches a screen reader. */
  readonly ariaLabel = input<string | null>(null);
  /** A second point on the same 0–100 scale, drawn as a hairline across the track — a goal or a
   *  baseline to read `value` against. Clamped like `value`, ignored while `indeterminate`, and
   *  unset draws nothing. */
  readonly target = input<number | null>(null);

  protected readonly clampedValue = computed(() => {
    const value = this.value();

    return Math.max(0, Math.min(100, value));
  });

  protected readonly clampedTarget = computed(() => {
    const target = this.target();

    return target == null ? null : Math.max(0, Math.min(100, target));
  });

  protected readonly isIndet = computed(() => this.indeterminate());
}
