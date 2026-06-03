import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type { ToastVariant } from './toast.types';

/**
 * Single toast pill. Consumed by ToastRegion for service-driven runtime toasts
 * AND by static showcases that need to display a toast specimen inline.
 */
@Component({
  selector: 'ds-toast',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ToastComponent {
  readonly variant = input<ToastVariant>('info');
  readonly title = input<string>('');
  readonly message = input<string>('');
  readonly dismissible = input<boolean>(false);
  readonly icon = input<IconName | null>(null);
  readonly dismissed = output<void>();

  protected readonly classes = computed(() => `toast ${this.variant()}`);

  /** Errors/warnings interrupt (assertive); info/success wait their turn. */
  protected readonly role = computed<'alert' | 'status'>(() =>
    this.variant() === 'error' || this.variant() === 'warning' ? 'alert' : 'status',
  );

  protected readonly defaultIcon = computed<IconName>(() => {
    switch (this.variant()) {
      case 'success': return 'success';
      case 'warning': return 'warn';
      case 'error':   return 'error';
      default:        return 'info';
    }
  });

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
