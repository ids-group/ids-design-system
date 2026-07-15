import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'ds-stat',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.error]': "variant() === 'error'",
    '[class.size-sm]': "size() === 'sm'",
    '[class.size-lg]': "size() === 'lg'",
  },
})
export class StatComponent {
  /** Metric name shown above the value. */
  readonly label = input.required<string>();
  /** Headline metric; `unit` is appended directly after it. */
  readonly value = input.required<string | number>();
  /** Change amount; sign drives the up/down arrow and color. */
  readonly delta = input<number | null>(null);
  /** Suffix appended after the delta's magnitude, e.g. "vs last month". */
  readonly deltaLabel = input<string>('');
  /** Overrides the automatic up/down coloring of the delta. */
  readonly deltaTone = input<'neutral' | 'secondary' | null>(null);
  /** Secondary text shown below the value when there's no `delta`. */
  readonly caption = input<string>('');
  /** Suffix appended directly after `value`, e.g. "%". */
  readonly unit = input<string>('');
  /** `error` applies the error color treatment. */
  readonly variant = input<'default' | 'error'>('default');
  /** Controls the stat's overall type scale. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly deltaClasses = computed(() => {
    const delta = this.delta();
    if (delta === null) {
      return '';
    }
    const tone = this.deltaTone();
    if (tone) {
      return `delta ${tone}`;
    }
    if (delta > 0) {
      return 'delta up';
    }
    if (delta < 0) {
      return 'delta down';
    }

    return 'delta';
  });

  protected readonly deltaIcon = computed<'arrowUp' | 'arrowDown' | null>(
    () => {
      const delta = this.delta();
      if (delta === null || delta === 0) {
        return null;
      }

      return delta > 0 ? 'arrowUp' : 'arrowDown';
    },
  );

  protected readonly deltaText = computed(() => {
    const delta = this.delta();
    if (delta === null) {
      return '';
    }
    const magnitude = Math.abs(delta);
    const suffix = this.deltaLabel() ? ` ${this.deltaLabel()}` : '';

    return `${magnitude}${suffix}`;
  });
}
