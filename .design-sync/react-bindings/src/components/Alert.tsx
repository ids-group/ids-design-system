import * as React from 'react';
import { host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

const DEFAULT_ICON: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'success',
  warning: 'warn',
  error: 'error',
  neutral: 'info',
};

export interface AlertProps {
  /** Severity — drives colour, the default icon and the ARIA role/live. */
  variant?: AlertVariant;
  /** Optional bold heading above the message. */
  title?: string;
  /** Show a close button that fires `onClosed`. */
  dismissible?: boolean;
  /** Override the variant's default icon. */
  icon?: IconName | null;
  /** Inline actions under the message (the `[actions]` slot). */
  actions?: React.ReactNode;
  /** Alert message content. */
  children?: React.ReactNode;
  /** Fires when the user dismisses the alert — the parent removes it. */
  onClosed?: () => void;
}

/** Inline contextual message — port of `ds-alert`. Errors/warnings announce
 *  as `role="alert"` (assertive); info/success/neutral as `status` (polite). */
export function Alert({
  variant = 'info',
  title = '',
  dismissible = false,
  icon = null,
  actions,
  children,
  onClosed,
}: AlertProps) {
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  return host(
    'ds-alert',
    { role, 'aria-live': role === 'alert' ? 'assertive' : 'polite' },
    <div className={`alert ${variant}`}>
      {/* Angular puts the class on the ds-icon host; Icon takes no class, so a
          styled wrapper carries `.a-icon` (flex-shrink/colour/margin rules). */}
      <span className="a-icon" style={{ display: 'inline-flex' }}>
        <Icon name={icon ?? DEFAULT_ICON[variant]} size={16} />
      </span>

      <div className="a-body">
        {title && <div className="a-title">{title}</div>}

        <div className="a-msg">{children}</div>

        <div className="a-actions">{actions}</div>
      </div>

      {dismissible && (
        <button
          className="a-close"
          type="button"
          aria-label="Dismiss"
          onClick={() => onClosed?.()}
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>,
  );
}
