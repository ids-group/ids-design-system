import * as React from 'react';

/**
 * IconButton — the real IconButtonComponent, run by Angular behind `<ds-icon-button>`.
 * Icon-only action button with its own Material-3-style fill taxonomy: `variant` (standard | filled | tonal | outlined, default standard = chromeless) crossed with the same `color` hue family as Button (primary | secondary | tertiary | neutral | error | success | warning). Use for toolbars, table-row actions, close/back/overflow affordances; use Button for labelled actions.
 */
export interface IconButtonProps {
  /** Icon to render — the button's only visible content. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */;
  /** Accessible name — required since the button has no visible text. */
  ariaLabel?: string;
  /** ARIA `aria-describedby` — the id of text the app renders beside the button, such as why the action is refused. Icon-only leaves no room for a second line, so unlike `ds-button` there is no `disabledReason` here: the text has to exist on screen already for this to point at it. */
  ariaDescribedBy?: string | null;
  /** Fill style — standard (chromeless), filled, tonal, or outlined. */
  variant?: ('standard' | 'filled' | 'tonal' | 'outlined');
  /** Brand/status hue family (shared with ds-button). `variant` is the fill axis; `color` recolours the accent the fill consumes. Default primary. */
  color?: ('primary' | 'secondary' | 'tertiary' | 'neutral' | 'error' | 'success' | 'warning');
  /** Button size — sm/md/lg, matches the field/button height scale. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Native `<button>` `type`; defaults to `'button'` (not `'submit'`) so it never submits an ancestor form by accident. */
  type?: ('button' | 'submit' | 'reset');
  /** Disables the button and blocks `pressed`. */
  disabled?: boolean;
  /** Toggle state — renders the pressed/active look and sets aria-pressed. */
  selected?: boolean;
  /** ARIA `aria-expanded`, forwarded to the inner `<button>` — bind to the open state when this button opens a panel. On the host element it would land on a non-focusable wrapper, which no screen reader reads. */
  ariaExpanded?: boolean | null;
  /** ARIA `aria-controls`, forwarded to the inner `<button>` — the id of the panel this button opens, e.g. `ds-app-layout`'s `railId`. */
  ariaControls?: string | null;
  /** Fires on click, unless disabled. */
  onPressed?: (value: MouseEvent) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const IconButton: React.ComponentType<IconButtonProps>;
