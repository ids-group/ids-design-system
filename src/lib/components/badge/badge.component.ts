import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { BadgeVariant } from './badge.types';

@Component({
  selector: 'ds-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly withDot = input<boolean>(false);
  readonly solid = input<boolean>(false);

  protected readonly classes = computed(() => {
    const parts = ['badge', this.variant(), this.solid() ? 'solid' : ''];

    return parts.filter(Boolean).join(' ');
  });
}
