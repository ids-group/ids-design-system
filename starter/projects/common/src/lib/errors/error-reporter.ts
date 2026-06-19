import { Injectable } from '@angular/core';

/**
 * Abstract crash/error reporter. `GlobalErrorHandler` forwards every unhandled
 * error here. Provide a concrete implementation in app.config (default: Noop);
 * wire your own reporter here if/when you add crash reporting.
 */
export abstract class ErrorReporter {
  abstract report(error: unknown): void;
}

/** Default reporter — does nothing. Swap for your own ErrorReporter as needed. */
@Injectable()
export class NoopErrorReporter extends ErrorReporter {
  report(): void {
    // no-op
  }
}
