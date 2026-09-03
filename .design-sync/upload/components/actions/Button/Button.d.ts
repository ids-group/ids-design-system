import * as React from 'react';

/**
 * Button — the real ButtonComponent, run by Angular behind `<ds-x-button>`.
 * Action button with two orthogonal axes: `color` (primary | secondary | tertiary | neutral | error | success | warning) and `variant` (solid | tonal | outline | ghost | text). Default is primary solid. All pairs render, but prefer solid/tonal for success & warning and tonal/outline/ghost for neutral; `variant="text"` is discouraged — use the global `.link` class for link-styled actions.
 */
export interface ButtonProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately — binding it says the consumer has already decided this is in error. Takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so the control doesn't shift the layout below it when a hint/error appears. Falls back to `DS_CONFIG.field.reserveMessage`, then off. */
  reserveMessage?: boolean | null;
  /** Glyph on the message line, overriding what the state resolves to. Unset follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  messageIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Brand/status hue family. */
  color?: ('primary' | 'secondary' | 'tertiary' | 'neutral' | 'error' | 'success' | 'warning');
  /** Fill pattern: solid | tonal | ghost | outline | text. All color×variant pairs render; some are UX-discouraged and emit a dev-mode warning naming the reason — they work, but read poorly. `text` is discouraged for ALL colours — prefer the global `.link` class; it stays for cases needing the ds-button API (loading/fullWidth/typed pressed). */
  variant?: ('solid' | 'tonal' | 'ghost' | 'outline' | 'text');
  /** Button height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Native `<button>` `type`; defaults to `'button'` (not `'submit'`) so it never submits an ancestor form by accident. */
  type?: ('button' | 'submit' | 'reset');
  /** Disables the button and blocks `pressed`. */
  disabled?: boolean;
  /** Busy state — disables interaction and sets `aria-busy`. */
  loading?: boolean;
  /** Stretch the button to fill its container — the host becomes block-level and 100% wide (the inner control is already full-width). Use for mobile primary CTAs and full-bleed form submit buttons. */
  fullWidth?: boolean;
  /** Accessible name — forwarded to the inner <button> as aria-label. Use when the visible label is absent or non-descriptive. */
  ariaLabel?: string | null;
  /** Leading icon, before the projected content. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Trailing icon, after the projected content. */
  trailingIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** ARIA `aria-haspopup`, forwarded to the inner <button> — set when this button triggers a menu/dialog/listbox overlay. */
  ariaHasPopup?: 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null;
  /** ARIA `aria-expanded`, forwarded to the inner <button> — bind to the overlay's open state on a trigger button. */
  ariaExpanded?: boolean | null;
  /** ARIA `aria-controls`, forwarded to the inner <button> — the id of the panel this button opens, e.g. `ds-app-layout`'s `railId`. */
  ariaControls?: string | null;
  /** Why the button is refused, shown as its second line. Read only while `disabled` — a greyed control that does not say why is a dead end. Setting it also changes HOW the button is disabled: it takes `aria-disabled` instead of the native attribute, because a natively disabled button cannot be focused and the reason would never be announced. The click is swallowed in `onClick` instead. Leave it unset and nothing changes. Length is deliberately not capped: the text wraps and the button grows. Same name and meaning as `TableRowAction.disabledReason`. */
  disabledReason?: string;
  /** ARIA `aria-describedby` — point the button at a description the app renders itself, such as a `ds-field-message` under a form. Merged with the id of `disabledReason` when both are present. */
  ariaDescribedBy?: string | null;
  /** Fires on click, unless `disabled` or `loading`. */
  onPressed?: (value: MouseEvent) => void;
  /** Content for the `[dsButtonSubtext]` slot. */
  subtext?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Button: React.ComponentType<ButtonProps>;
