import * as React from 'react';

/**
 * OtpInput — the real OtpInputComponent, run by Angular behind `<ds-otp-input>`.
 * One-time-code entry rendered as N single-character cells. Typing advances to the next cell, Backspace on an empty cell steps back, paste distributes across cells, and focus snaps to the first empty cell so codes stay left-packed.
 */
export interface OtpInputProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately — binding it says the consumer has already decided this is in error. Takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so the control doesn't shift the layout below it when a hint/error appears. What an unset value falls back to is the subclass's call, in `reserveMessageResolved`: a field takes `DS_CONFIG.field.reserveMessage`, a button does not. */
  reserveMessage?: boolean | null;
  /** Glyph on the message line, overriding what the state resolves to. Unset follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  messageIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Validation errors, shown once the user has interacted. Bound automatically by signal forms; reactive and template-driven forms are read through `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  errors?: unknown;
  /** Paints the error state and sets `aria-invalid`, WITHOUT a message of its own — for when the text lives elsewhere, such as a form-level error summary or one message covering a whole field group. Use `error` to show text. */
  invalid?: boolean;
  /** Whether the user has interacted with the field. Bound by signal forms; gates `errors`, so a `required` error does not greet an untouched form. */
  touched?: boolean;
  /** Hides the control. On the base so signal forms reaches every control at once. Inline `display`, not the `hidden` attribute — each control sets its own `:host` display, which the attribute's weaker UA rule would lose to. */
  hidden?: boolean;
  /** Entered code, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Number of character cells. */
  length?: number;
  /** Restricts input and the mobile keyboard to digits-only, or allows letters too. */
  mode?: ('numeric' | 'alphanumeric');
  /** Renders each cell as a password dot instead of the typed character. */
  mask?: boolean;
  /** Disables all cells and blocks interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Accessible group label for the cell row. Unset falls back to `DS_INTL.otpInput.label`. */
  ariaLabel?: string | null;
  /** Fires once, with the full code, on the partial → complete transition. */
  onCompleted?: (value: string) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const OtpInput: React.ComponentType<OtpInputProps>;
