import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { StatusValue } from './status-dot.types';

@Component({
  selector: 'ds-status-dot',
  standalone: true,
  template: `<span [class]="classes()" aria-hidden="true"></span>`,
  styleUrl: './status-dot.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'img',
    '[attr.aria-label]': 'ariaLabel() || status()',
  },
})
export class StatusDotComponent {
  readonly status = input<StatusValue>('planning');
  /** Override the colour-only status with a human label for assistive tech. */
  readonly ariaLabel = input<string | null>(null);
  protected readonly classes = computed(() => `status-dot ${this.status()}`);
}
