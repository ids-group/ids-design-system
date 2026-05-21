import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { StatusValue } from './status-dot.types';

@Component({
  selector: 'ds-status-dot',
  standalone: true,
  template: `<span [class]="classes()"></span>`,
  styleUrl: './status-dot.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class StatusDotComponent {
  readonly status = input<StatusValue>('planning');
  protected readonly classes = computed(() => `status-dot ${this.status()}`);
}
