import * as React from 'react';
import { host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface ToastProps {
  /** Severity — drives colour, the default icon/spinner and the ARIA role/live. */
  variant?: ToastVariant;
  /** Optional bold heading above the message. */
  title?: string;
  /** Body text of the toast. */
  message?: string;
  /** Show a close button that fires `onClosed`. */
  dismissible?: boolean;
  /** Override the variant's default icon. */
  icon?: IconName | null;
  /** Optional action button rendered before the dismiss control. Invoking it
   *  also fires `onClosed`. */
  action?: ToastAction | null;
  /** Fires when the toast is dismissed or its action is invoked. */
  onClosed?: () => void;
  /** Extra body content after `message` (the default `<ng-content>` slot). */
  children?: React.ReactNode;
  /** Trailing custom controls (the `<ng-content select="[actions]">` slot). */
  actions?: React.ReactNode;
}

/** Single toast pill — port of `ds-toast`. In Angular it is usually raised via
 *  ToastService; this binding renders the specimen statically wherever you put
 *  it (compose several inside `ToastRegion` for a stack). Error/warning get
 *  `role="alert"` (assertive); info/success/loading get `role="status"`. */
export function Toast({
  variant = 'info',
  title = '',
  message = '',
  dismissible = false,
  icon = null,
  action = null,
  onClosed,
  children,
  actions,
}: ToastProps) {
  const isLoading = variant === 'loading';
  const role: 'alert' | 'status' =
    variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const defaultIcon: IconName =
    variant === 'success' ? 'success' : variant === 'warning' ? 'warn' : variant === 'error' ? 'error' : 'info';

  return host(
    'ds-toast',
    null,
    <div
      aria-atomic="true"
      className={`toast ${variant}`}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      {isLoading ? (
        // Inline `<ds-spinner class="icon" size="sm">` — host classes only,
        // same markup the Spinner binding renders (it takes no className prop).
        host('ds-spinner', { class: 'icon sm', role: 'status', 'aria-label': 'Loading' })
      ) : (
        <Icon className="icon" name={icon ?? defaultIcon} size={16} />
      )}
      <div className="body">
        {title && <div className="title">{title}</div>}
        {message}
        {children}
      </div>
      {action && (
        <button
          type="button"
          className="action"
          onClick={() => {
            action.handler();
            onClosed?.();
          }}
        >
          {action.label}
        </button>
      )}
      <span className="actions">{actions}</span>
      {dismissible && (
        <button type="button" className="close" aria-label="Dismiss" onClick={() => onClosed?.()}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>,
  );
}

export interface ToastEntry {
  id: number;
  title?: string;
  body: string;
  variant: ToastVariant;
  dismissible: boolean;
  action?: ToastAction;
}

export interface ToastRegionProps {
  /** Toasts to display, oldest first (in Angular the ToastService feeds these). */
  toasts?: readonly ToastEntry[];
  /** Cap on concurrently visible toasts; extras beyond it are not rendered.
   *  0 = unlimited (default). */
  maxVisible?: number;
  /** Fires with the entry id when a toast is dismissed or its action runs —
   *  remove it from `toasts`. */
  onClosed?: (id: number) => void;
}

/** Vertical toast stack — port of `ds-toast-region`. Angular portals the
 *  region to a viewport corner via ToastService; this binding renders the
 *  stack INLINE where you place it. To pin it, wrap it yourself (e.g.
 *  `position: fixed; top: 16px; right: 16px; z-index: var(--layer-toast)`). */
export function ToastRegion({ toasts = [], maxVisible = 0, onClosed }: ToastRegionProps) {
  const visible = maxVisible > 0 ? toasts.slice(0, maxVisible) : toasts;

  return host(
    'ds-toast-region',
    { role: 'region', 'aria-label': 'Notifications' },
    visible.map((entry) => (
      <Toast
        key={entry.id}
        variant={entry.variant}
        title={entry.title ?? ''}
        message={entry.body}
        dismissible={entry.dismissible}
        action={entry.action ?? null}
        onClosed={() => onClosed?.(entry.id)}
      />
    )),
  );
}
