export type {
  DsToastHorizontalPosition,
  DsToastVerticalPosition,
  DsToastPosition,
} from '../../core/toast-position';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface ToastAction {
  readonly label: string;
  readonly handler: () => void;
}

export interface ToastOptions {
  readonly title?: string;
  readonly body: string;
  readonly variant?: ToastVariant;
  readonly dismissible?: boolean;
  readonly durationMs?: number;
  readonly action?: ToastAction;
}

export interface ToastRef {
  readonly id: number;
  dismiss(): void;
}

export interface ToastEntry {
  readonly id: number;
  readonly title?: string;
  readonly body: string;
  readonly variant: ToastVariant;
  readonly dismissible: boolean;
  readonly action?: ToastAction;
  /** Auto-dismiss delay, counted from the moment the toast becomes VISIBLE — a
   *  queued toast must not expire while it is still waiting behind the cap.
   *  `0`, and any negative, means it never expires. */
  readonly durationMs: number;
}

export interface ToastPromiseMessages<T = unknown> {
  readonly loading: string;
  readonly success: string | ((value: T) => string);
  readonly error: string | ((reason: unknown) => string);
}
