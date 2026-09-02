import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import type { IconName } from '../../icons/icons.data';
import type { ToastAction, ToastVariant } from './toast.types';

/**
 * Single toast pill. Consumed by ToastRegion for service-driven runtime toasts
 * AND by static showcases that need to display a toast specimen inline.
 */
@Component({
  selector: 'ds-toast',
  standalone: true,
  imports: [IconComponent, SpinnerComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ToastComponent {
  /** Severity — drives colour and the default icon or spinner. */
  readonly variant = input<ToastVariant>('info');
  /** Optional bold heading above the message. */
  readonly title = input<string>('');
  /** Body text of the toast — the same field `ToastOptions.body` carries. */
  readonly body = input<string>('');
  /** Show a close button that emits `closed`. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Override the variant's default icon. */
  readonly icon = input<IconName | null>(null);
  /** Optional action button rendered before the dismiss control. */
  readonly action = input<ToastAction | null>(null);
  /** Fires when the toast is dismissed or its action is invoked. */
  readonly closed = output<void>();

  protected readonly isLoading = computed(() => this.variant() === 'loading');

  protected onAction(action: ToastAction): void {
    action.handler();
    this.closed.emit();
  }

  protected readonly classes = computed(() => `toast ${this.variant()}`);

  protected readonly defaultIcon = computed<IconName>(() => {
    switch (this.variant()) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warn';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  });

  protected onDismiss(): void {
    this.closed.emit();
  }
}
