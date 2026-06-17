import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import type { IconName } from '../../icons/icons.data';
import type { EmptyStateVariant } from './empty-state.types';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [IconComponent, SpinnerComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class EmptyStateComponent {
  readonly variant = input<EmptyStateVariant>('none');
  readonly icon = input<IconName | null>(null);
  readonly title = input<string>('');
  readonly body = input<string>('');

  protected readonly classes = computed(() => {
    const variant = this.variant();

    return variant === 'none' ? 'empty-state' : `empty-state ${variant}`;
  });

  protected readonly resolvedIcon = computed<IconName>(() => {
    const explicit = this.icon();
    if (explicit) {
      return explicit;
    }
    const variant = this.variant();
    if (variant === 'error') {
      return 'warn';
    }
    if (variant === 'locked') {
      return 'lock';
    }
    if (variant === 'success') {
      return 'success';
    }
    if (variant === 'loading') {
      return 'package';
    }

    return 'package';
  });
}
