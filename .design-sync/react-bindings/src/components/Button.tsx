import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'neutral'
  | 'error'
  | 'success'
  | 'warning';
export type ButtonVariant = 'solid' | 'tonal' | 'ghost' | 'outline' | 'text';
/** sm/md/lg = 32/40/48px, aligned with input, select, dropdown and icon-button. */
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  /** Brand/status hue family. Default 'primary'. */
  color?: ButtonColor;
  /** Fill pattern: solid | tonal | ghost | outline | text. All color×variant
   *  pairs render; some are UX-discouraged (neutral+solid reads as disabled;
   *  success/warning at ghost/outline emphasis read poorly). `text` is
   *  discouraged for ALL colours — prefer the global `.link` class. */
  variant?: ButtonVariant;
  /** Button height — sm/md/lg. Default 'md'. */
  size?: ButtonSize;
  /** Native `<button>` `type` attribute. Default 'button'. */
  type?: ButtonType;
  /** Disables the button and blocks `onPressed`. */
  disabled?: boolean;
  /** Busy state — disables interaction and sets `aria-busy`. */
  loading?: boolean;
  /** Stretch the button to fill its container — use for mobile primary CTAs
   *  and full-bleed form submit buttons. */
  fullWidth?: boolean;
  /** Accessible name when the visible label is absent or non-descriptive. */
  ariaLabel?: string;
  /** Leading icon, before the label. */
  icon?: IconName;
  /** Trailing icon, after the label. */
  trailingIcon?: IconName;
  /** ARIA `aria-haspopup` — set when this button triggers a menu/dialog overlay. */
  ariaHasPopup?: 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /** ARIA `aria-expanded` — bind to the overlay's open state on a trigger button. */
  ariaExpanded?: boolean;
  /** Second line of smaller text under the label (the `[dsButtonSubtext]` slot). */
  subtext?: React.ReactNode;
  /** Button label content. */
  children?: React.ReactNode;
  /** Fires on click, unless `disabled` or `loading`. */
  onPressed?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/** Action button — port of `ds-button`. Two orthogonal axes: `color` (hue
 *  family) and `variant` (fill pattern). Icon-only actions → IconButton. */
export function Button({
  color = 'primary',
  variant = 'solid',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  ariaLabel,
  icon,
  trailingIcon,
  ariaHasPopup,
  ariaExpanded,
  subtext,
  children,
  onPressed,
}: ButtonProps) {
  const classes = cx(
    'button',
    color !== 'primary' && `c-${color}`,
    variant !== 'solid' && `v-${variant}`,
    size,
    loading && 'loading',
  );
  return host(
    'ds-button',
    { class: cx(fullWidth && 'full-width') || undefined },
    <button
      className={classes}
      type={type}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded ?? undefined}
      aria-busy={loading ? 'true' : undefined}
      disabled={disabled || loading}
      onClick={(e) => {
        if (!disabled && !loading) onPressed?.(e);
      }}
    >
      <span className="button-main">
        {icon && <Icon name={icon} />}
        {children}
        {trailingIcon && <Icon name={trailingIcon} />}
      </span>
      <span className="subtext-slot">{subtext}</span>
    </button>,
  );
}
