import { inject, Injectable } from '@angular/core';
import { ToastService } from '@ids-group-ltd/ids-design-system';
import { type ErrorSource, NotificationService } from '@app/common';

/** NotificationService backed by the IDS design-system `ds-toast`. */
@Injectable()
export class ToastNotificationService extends NotificationService {
  private readonly toast = inject(ToastService);

  error(source?: ErrorSource, title = 'Error'): void {
    this.toast.show({
      variant: 'error',
      title,
      body: this.resolveErrorMessage(source),
      durationMs: 7000,
    });
  }

  success(message: string, title = 'Success'): void {
    this.toast.show({ variant: 'success', title, body: message });
  }

  warning(message: string, title = 'Warning'): void {
    this.toast.show({ variant: 'warning', title, body: message });
  }

  info(message: string, title = 'Info'): void {
    this.toast.show({ variant: 'info', title, body: message });
  }
}
