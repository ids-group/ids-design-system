import { ErrorHandler, inject, Injectable } from '@angular/core';
import { NotificationService } from '../notifications/notification.service';
import { ErrorReporter } from '../errors/error-reporter';
import { ENVIRONMENT_NAME } from '../tokens/environment.tokens';

/**
 * Global error handler. Forwards every unhandled error to the pluggable
 * ErrorReporter; in dev/test surfaces the message via a toast, in prod shows a
 * generic toast only.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationService);
  private readonly reporter = inject(ErrorReporter);
  private readonly envName = inject(ENVIRONMENT_NAME);

  handleError(error: unknown): void {
    const origin = (error as { rejection?: unknown })?.rejection ?? error;

    this.reporter.report(error);

    if (this.envName === 'development' || this.envName === 'test') {
      console.error(error);
      this.notifications.error(this.describe(origin), 'Runtime Error');

      return;
    }

    this.notifications.error();
  }

  private describe(origin: unknown): string {
    if (origin instanceof Error) {
      return origin.message;
    }

    if (typeof origin === 'object' && origin !== null) {
      try {
        return JSON.stringify(origin);
      } catch {
        return String(origin);
      }
    }

    return String(origin);
  }
}
