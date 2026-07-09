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
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly delta = input<number | null>(null);
  readonly deltaLabel = input<string>('');
  readonly deltaTone = input<'neutral' | 'secondary' | null>(null);
  readonly caption = input<string>('');
  readonly unit = input<string>('');
  readonly variant = input<'default' | 'error'>('default');
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
