export type {
  DsToastHorizontalPosition,
  DsToastVerticalPosition,
  DsToastPosition,
} from '@ids-group-ltd/ids-design-system/core';

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
  /** Under `provideDsConfig({ toast: { groupDuplicates: true } })`, toasts with the same key
   *  fold into one `×N` stack whatever their text. Unset, the key is `variant`, `title` and
   *  `body`. Ignored while `groupDuplicates` is off. */
  readonly groupKey?: string;
}

/** One `show()` call folded into a stack. `at` is `Date.now()` at the call. */
export interface ToastOccurrence {
  readonly id: number;
  readonly body: string;
  readonly at: number;
}

/** A `show()` folded into a stack returns the stack's ref: `id` is the stack's, and `dismiss()`
 *  closes the whole stack. */
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
  /** Auto-dismiss delay, counted from when the toast becomes VISIBLE. `0` or negative never expires. */
  readonly durationMs: number;
  /** Set only under `groupDuplicates`, on a toast that can fold. */
  readonly groupKey?: string;
  /** Every call folded into this toast, oldest first; two or more draw it as a `×N` stack. */
  readonly occurrences?: readonly ToastOccurrence[];
}

export interface ToastPromiseMessages<T = unknown> {
  readonly loading: string;
  readonly success: string | ((value: T) => string);
  readonly error: string | ((reason: unknown) => string);
}
