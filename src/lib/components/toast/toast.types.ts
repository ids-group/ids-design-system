export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  readonly title?: string;
  readonly body: string;
  readonly variant?: ToastVariant;
  readonly dismissible?: boolean;
  readonly durationMs?: number;
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
}
