import * as React from 'react';

/**
 * OtpInput — the real OtpInputComponent, run by Angular behind `<ds-otp-input>`.
 * One-time-code entry rendered as N single-character cells. Typing advances to the next cell, Backspace on an empty cell steps back, paste distributes across cells, and focus snaps to the first empty cell so codes stay left-packed.
 */
export interface OtpInputProps {
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
  /** Validation errors, shown once the form is submitted (`[dsSubmitted]`, or `ngSubmit` of a reactive or template-driven form). Bound by signal forms; reactive and template-driven forms are read through `NgControl`. */
  errors?: unknown;
  /** Paints the error state and sets `aria-invalid` WITHOUT a message; use `error` to show text. Signal forms binds it alongside `errors`, and then it waits for the submit like them. */
  invalid?: boolean;
  /** Whether an async validator is running. Bound by signal forms; shows a trailing spinner. */
  pending?: boolean;
  /** Whether the user has changed the value. Bound by signal forms; drawn only under `showDirty`. */
  dirty?: boolean;
  /** Marks a changed value with a dot and a "Changed" line. Unset falls back to `DS_CONFIG.field.showDirty`, then `false`. */
  showDirty?: boolean | null;
  /** Hides the control. Inline `display`: the `hidden` attribute loses to each control's `:host` display. */
  hidden?: boolean;
  /** Entered code, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Number of character cells. */
  length?: number;
  /** `numeric` restricts input and the mobile keyboard to digits; otherwise letters are allowed. */
  mode?: ('numeric' | 'alphanumeric');
  /** Renders each cell as a password dot. */
  mask?: boolean;
  /** Disables all cells and blocks interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning; also paints the success border. */
  success?: string;
  /** Accessible group label for the cell row. Unset falls back to `DS_INTL.otpInput.label`. */
  ariaLabel?: string | null;
  /** Fires once, with the full code, on the partial-to-complete transition. */
  onCompleted?: (value: string) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const OtpInput: React.ComponentType<OtpInputProps>;
