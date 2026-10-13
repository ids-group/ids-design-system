import * as React from 'react';

/**
 * IconButton — the real IconButtonComponent, run by Angular behind `<ds-icon-button>`.
 * Icon-only action button with its own Material-3-style fill taxonomy: `variant` (standard | filled | tonal | outlined, default standard = chromeless) crossed with the same `color` hue family as Button (primary | secondary | tertiary | neutral | error | success | warning). Use for toolbars, table-row actions, close/back/overflow affordances; use Button for labelled actions.
 */
export interface IconButtonProps {
  /** Icon to render - the button's only visible content. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */;
  /** Accessible name; required since the button has no visible text. */
  ariaLabel?: string;
  /** `aria-describedby`: the id of text the app already renders beside the button, such as why the action is refused. */
  ariaDescribedBy?: string | null;
  /** Fill style; `standard` is chromeless. */
  variant?: ('standard' | 'filled' | 'tonal' | 'outlined');
  /** Brand/status hue family, shared with ds-button. `color` recolours the accent the fill uses. */
  color?: ('primary' | 'secondary' | 'tertiary' | 'neutral' | 'error' | 'success' | 'warning');
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Native `type`; defaults to `'button'` so it never submits an ancestor form. */
  type?: ('button' | 'submit' | 'reset');
  /** Disables the button and blocks `pressed`. */
  disabled?: boolean;
  /** Toggle state: renders the pressed look and sets `aria-pressed`, `"false"` when bound off. Unbound, the button is no toggle and carries no `aria-pressed`. */
  selected?: boolean | null;
  /** `aria-expanded` on the inner `<button>`; bind to the open state. On the host it would land on a non-focusable wrapper. */
  ariaExpanded?: boolean | null;
  /** `aria-controls` on the inner `<button>`: the id of the panel this button opens. */
  ariaControls?: string | null;
  /** Fires on click unless disabled. */
  onPressed?: (value: MouseEvent) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const IconButton: React.ComponentType<IconButtonProps>;
