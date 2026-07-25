import * as React from 'react';
import { host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export interface ToggleButtonProps {
  /** Pressed (on/off) state. Controlled when `onPressedChange` is provided;
   *  otherwise the component manages its own state seeded from this value. */
  pressed?: boolean;
  /** Emits the new pressed state on every toggle. */
  onPressedChange?: (pressed: boolean) => void;
  /** Optional leading icon name. */
  icon?: IconName;
  /** Disables the toggle. */
  disabled?: boolean;
  /** Toggle label content. */
  children?: React.ReactNode;
}

/** A single binary toggle button (pressed / not pressed) with an optional
 *  leading icon and a projected label — port of `ds-toggle-button`. Distinct
 *  from Segmented (a one-of-many value toggle) — this is a standalone on/off
 *  control. */
export function ToggleButton({
  pressed,
  onPressedChange,
  icon,
  disabled = false,
  children,
}: ToggleButtonProps) {
  const [ownPressed, setOwnPressed] = React.useState(pressed ?? false);
  const isPressed = onPressedChange ? (pressed ?? false) : ownPressed;
  const toggle = () => {
    if (disabled) return;
    const next = !isPressed;
    if (!onPressedChange) setOwnPressed(next);
    onPressedChange?.(next);
  };
  return host(
    'ds-toggle-button',
    null,
    <button
      type="button"
      className="button-toggle"
      aria-pressed={isPressed}
      disabled={disabled}
      onClick={toggle}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>,
  );
}
