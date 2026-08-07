import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { devWarn } from '../../core/dev-warning';
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
  constructor() {
    // `unit` concatenates onto the INPUT value, so a projected value silently
    // drops it — and "kg" quietly missing from a tile is the kind of thing that
    // reads as fine until someone checks the number against the source.
    devWarn(() =>
      this.unit() && !this.value()
        ? `[ds-stat] unit="${this.unit()}" is set but there is no \`value\` input — a projected [dsStatValue] owns the whole line, so the unit is not rendered. Put it inside the projected content, or drop the input.`
        : null,
    );
  }

  /** Metric name shown above the value. */
  readonly label = input.required<string>();
  /** Headline metric; `unit` is appended directly after it.
   *
   *  Optional because the value can be PROJECTED instead — `[dsStatValue]`
   *  takes a badge, a status dot, anything a tile needs where a number would go.
   *  The input is the fallback, the same shape `[delta]` already has.
   *
   *  Namespaced, unlike `[delta]`: twenty components in this library have a
   *  `value` input, so a bare `value` attribute used to slot one of them in
   *  would also set that input to the empty string. */
  readonly value = input<string | number>('');
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
