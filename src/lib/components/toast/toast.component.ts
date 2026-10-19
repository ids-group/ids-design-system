import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import { DS_INTL, retainStyles } from '@ids-group-ltd/ids-design-system/core';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import type { ToastAction, ToastVariant } from './toast.types';

/**
 * Single toast pill, rendered by ToastRegion for service-driven toasts or placed inline as a specimen.
 */
@Component({
  selector: 'ds-toast',
  standalone: true,
  imports: [IconComponent, SpinnerComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  // Keeps a static `title` attribute from becoming a native tooltip on the host.
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
})
export class ToastComponent {
  protected readonly intl = inject(DS_INTL);

  /** Severity: drives colour and the default icon or spinner. */
  readonly variant = input<ToastVariant>('info');
  /** Optional bold heading above the message. */
  readonly title = input<string>('');
  /** Message text; the same field as `ToastOptions.body`. */
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

  constructor() {
    retainStyles(ToastComponent);
  }

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
