import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';
import type { ButtonColor } from './Button';

// Material 3-style icon-button taxonomy — distinct from ds-button's text variants.
//   standard — chromeless tool button (chrome on hover); the default
//   filled   — solid --primary fill (high-emphasis single action)
//   tonal    — --primary-muted tint (medium emphasis)
//   outlined — bordered, transparent fill
export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';
/** Heights align with the field / button scale: sm 32, md 40, lg 48. */
export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonType = 'button' | 'submit' | 'reset';

export interface IconButtonProps {
  /** Icon to render — the button's only visible content. */
  icon: IconName;
  /** Accessible name — required since the button has no visible text. */
  ariaLabel: string;
  /** Fill style — standard (chromeless), filled, tonal, or outlined. */
  variant?: IconButtonVariant;
  /** Brand/status hue family (shared with Button). `variant` is the fill
   *  axis; `color` recolours the accent the fill consumes. Default primary. */
  color?: ButtonColor;
  /** Button size — sm/md/lg, matches the field/button height scale. */
  size?: IconButtonSize;
  /** Native `button` type attribute. */
  type?: IconButtonType;
  /** Disables the button and blocks `onPressed`. */
  disabled?: boolean;
  /** Toggle state — renders the pressed/active look and sets aria-pressed. */
  selected?: boolean;
  /** Fires on click, unless disabled. */
  onPressed?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Icon-only action button — port of `ds-icon-button`. Its own variant taxonomy
 * (standard / filled / tonal / outlined) + an optional toggle (`selected`)
 * state. Distinct from Button — use this for square/round icon affordances;
 * use Button for labelled actions. `ariaLabel` is REQUIRED (icon-only has no
 * text label).
 */
export function IconButton({
  icon,
  ariaLabel,
  variant = 'standard',
  color = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  selected = false,
  onPressed,
}: IconButtonProps) {
  const classes = cx(
    'icon-button',
    variant,
    size,
    color !== 'primary' && `c-${color}`,
    selected && 'selected',
  );
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  return host(
    'ds-icon-button',
    null,
    <button
      className={classes}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={selected ? true : undefined}
      onClick={(e) => {
        if (!disabled) onPressed?.(e);
      }}
    >
      <Icon name={icon} size={iconSize} />
    </button>,
  );
}
