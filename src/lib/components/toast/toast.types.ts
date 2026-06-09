export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

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
}

export type DsToastHorizontalPosition = 'left' | 'center' | 'right';
export type DsToastVerticalPosition = 'top' | 'bottom';

export interface DsToastPosition {
  readonly horizontalPosition: DsToastHorizontalPosition;
  readonly verticalPosition: DsToastVerticalPosition;
  readonly offset: string;
}
