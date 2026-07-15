import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import type { IconName } from '../../icons/icons.data';
import type { EmptyStateVariant } from './empty-state.types';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [IconComponent, LoadingOverlayComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class EmptyStateComponent {
  /** State — drives the default icon and shows a loading overlay when `'loading'`. */
  readonly variant = input<EmptyStateVariant>('none');
  /** Override the variant's default icon. */
  readonly icon = input<IconName | null>(null);
  /** Optional heading below the icon. */
  readonly title = input<string>('');
  /** Optional supporting text below the title. */
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
