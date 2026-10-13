import * as React from 'react';

/**
 * Select — the real SelectComponent, run by Angular behind `<ds-x-select>`.
 * Single-choice dropdown field. Trigger button + listbox panel; `label` above, helper `hint` below, error via `invalid` (error text goes in `hint`). Sizes `sm`/`md`/`lg` = 32/40/48px, aligned with Input.
 */
export interface SelectProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately; takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so a hint/error does not shift the layout. Unset falls back to `DS_CONFIG.field.reserveMessage` for a field, not for a button. */
  reserveMessage?: boolean | null;
  /** Glyph on the message line, overriding what the state resolves to. Unset follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  messageIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Validation errors, shown once the user has interacted. Bound by signal forms; reactive and template-driven forms are read through `NgControl`. */
  errors?: unknown;
  /** Paints the error state and sets `aria-invalid` WITHOUT a message; use `error` to show text. */
  invalid?: boolean;
  /** Whether the user has interacted with the field. Bound by signal forms; gates `errors`. */
  touched?: boolean;
  /** Whether an async validator is running. Bound by signal forms; shows a trailing spinner. */
  pending?: boolean;
  /** Whether the user has changed the value. Bound by signal forms; drawn only under `showDirty`. */
  dirty?: boolean;
  /** Marks a changed value with a dot and a "Changed" line. Unset falls back to `DS_CONFIG.field.showDirty`, then `false`. */
  showDirty?: boolean | null;
  /** Hides the control. Inline `display`: the `hidden` attribute loses to each control's `:host` display. */
  hidden?: boolean;
  /** Selected option's value, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Flat options or option groups rendered in the dropdown panel. */
  options?: unknown;
  /** Trigger width: `fill` stretches to the container and pins the panel to it; `content` hugs the trigger and uses its width as the panel's floor. */
  width?: (('fill' | 'content'));
  /** Shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Label shown above the trigger. */
  label?: string;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Options are still being fetched and the list reports `aria-busy`: with no options it shows placeholder rows, with options it keeps them under an overlay until they are replaced. */
  loading?: boolean;
  /** The panel opened. */
  onOpened?: (value: void) => void;
  /** The panel closed, for any reason - a pick, Escape, an outside click, a scroll. */
  onClosed?: (value: void) => void;
  /** Scrolls the keyboard cursor's row into view. Set `false` only when driving the scroll position yourself. */
  scrollActiveIntoView?: boolean;
  /** Extra classes for the portaled panel, the only way to style one instance of it. */
  panelClass?: string | readonly string[];
  /** Prevents opening the dropdown while still allowing focus. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonlyBinding?: boolean;
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  success?: string;
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `name` attribute forwarded to the trigger. */
  name?: string | null;
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string | null;
  /** Shows an inline clear (×) button when a value is selected. */
  clearable?: boolean;
  staticPreview?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Select: React.ComponentType<SelectProps>;
