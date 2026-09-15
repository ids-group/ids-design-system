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
    '[attr.aria-valuemax]': 'scale()',
    '[attr.aria-valuenow]': 'isIndet() ? null : clampedValue()',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.success]': "variant() === 'success'",
    '[class.warning]': "variant() === 'warning'",
    '[class.error]': "variant() === 'error'",
    '[class.indeterminate]': 'isIndet()',
  },
})
export class ProgressComponent {
  /** Progress in units of `max`, so 0–100 by default; clamped, and ignored while
   *  `indeterminate`. */
  readonly value = input<number>(0);
  /** The full scale `value` and `target` are read against. Left at 100 they are percentages, which
   *  is why nothing existing changes. Set it to the real total — `[value]="37" [max]="80"` — and
   *  the accessible name carries "37 of 80" rather than the 46% a caller would otherwise have to
   *  compute and a screen reader would read instead. Zero or less falls back to 100, because a
   *  scale with no width has no fraction to draw. */
  readonly max = input<number>(100);
  /** Colour variant — drives the success/warning/error styling. */
  readonly variant = input<ProgressVariant>('default');
  /** Indeterminate (unknown-duration) animation instead of a fixed `value`. */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Accessible name for the progress bar (e.g. "Upload progress"). With a `target` set, name the
   *  comparison here — the mark is drawn, and `role="progressbar"` has no second value to announce,
   *  so "Resolved 62% against a 75% target" is what reaches a screen reader. */
  readonly ariaLabel = input<string | null>(null);
  /** A second point on the same scale as `value`, drawn as a hairline across the track — a goal or
   *  a baseline to read `value` against. Clamped like `value`, ignored while `indeterminate`, and
   *  unset draws nothing. */
  readonly target = input<number | null>(null);

  protected readonly scale = computed(() => {
    const max = this.max();

    return max > 0 ? max : 100;
  });

  protected readonly clampedValue = computed(() =>
    Math.max(0, Math.min(this.scale(), this.value())),
  );

  /** Width and offset are percentages of the track whatever the scale is. */
  protected readonly valuePercent = computed(
    () => (this.clampedValue() / this.scale()) * 100,
  );

  protected readonly clampedTarget = computed(() => {
    const target = this.target();

    return target == null ? null : Math.max(0, Math.min(this.scale(), target));
  });

  protected readonly targetPercent = computed(() => {
    const target = this.clampedTarget();

    return target == null ? null : (target / this.scale()) * 100;
  });

  protected readonly isIndet = computed(() => this.indeterminate());
}
