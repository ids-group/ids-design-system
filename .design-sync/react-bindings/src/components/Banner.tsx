import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export type BannerVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'severe'
  | 'error'
  | 'neutral';
export type BannerLayout = 'stacked' | 'row';

const DEFAULT_ICON: Record<BannerVariant, IconName> = {
  info: 'info',
  success: 'success',
  warning: 'warn',
  severe: 'warn',
  error: 'error',
  neutral: 'info',
};

export interface BannerProps {
  /** Severity — drives colour, the default icon and the ARIA role/live. */
  variant?: BannerVariant;
  /** Optional bold heading above the message. */
  title?: string;
  /** Show a close button that fires `onClosed`. */
  dismissible?: boolean;
  /** Override the variant's default icon. */
  icon?: IconName | null;
  /** Tighter padding, centred items, single-line title. */
  compact?: boolean;
  /** `'stacked'` wraps actions onto their own line; `'row'` keeps them inline. */
  layout?: BannerLayout;
  /** Coloured accent rail on the leading edge; set false to hide it. */
  accentRail?: boolean;
  /** Action buttons/links (the `[actions]` slot). */
  actions?: React.ReactNode;
  /** Banner message content. */
  children?: React.ReactNode;
  /** Fires when the user dismisses the banner — the parent removes it. */
  onClosed?: () => void;
}

/** Page/section-level message strip — port of `ds-banner`. Errors, warnings
 *  and `severe` announce as `role="alert"` (assertive); info/success/neutral
 *  as `status` (polite). */
export function Banner({
  variant = 'info',
  title = '',
  dismissible = false,
  icon = null,
  compact = false,
  layout = 'stacked',
  accentRail = true,
  actions,
  children,
  onClosed,
}: BannerProps) {
  const role =
    variant === 'error' || variant === 'warning' || variant === 'severe'
      ? 'alert'
      : 'status';
  return host(
    'ds-banner',
    {
      class: accentRail ? undefined : 'no-rail',
      role,
      'aria-live': role === 'alert' ? 'assertive' : 'polite',
    },
    <div className={cx('banner', variant, `layout-${layout}`, compact && 'compact')}>
      {/* Angular puts class="icon" on the ds-icon host; Icon takes no class,
          so a wrapper span carries `.icon` (global 16px box, banner rules)
          around the 20px glyph — same box quirk as the Angular host. */}
      <span
        className="icon"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name={icon ?? DEFAULT_ICON[variant]} size={20} />
      </span>

      <div className="body">
        {title && <div className="title">{title}</div>}

        {children}
      </div>

      <div className="actions">{actions}</div>

      {dismissible && (
        <button
          className="close"
          type="button"
          aria-label="Dismiss"
          onClick={() => onClosed?.()}
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </div>,
  );
}
