import * as React from 'react';

/**
 * Input — the real InputComponent, run by Angular behind `<ds-x-input>`.
 * Single-line text field. Label above (or inside with `floating`), helper `hint` below, validation via `invalid`/`success` (error text goes in `hint`). Sizes `sm`/`md`/`lg` = 32/40/48px.
 */
export interface InputProps {
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
  /** Text value, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Native input type; also drives the default clear button and password toggle. */
  type?: ('text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search');
  /** Field height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Label shown above the field. */
  label?: string;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Disables the field and blocks all interaction. */
  disabled?: boolean;
  /** Prevents editing while still allowing focus and selection. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonlyBinding?: boolean;
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  success?: string;
  /** Shows a trailing spinner, e.g. while async validation runs. The input stays editable. */
  loading?: boolean;
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `name` attribute. */
  name?: string | null;
  /** Native `min` attribute - applies when `type="number"`. */
  min?: number | null;
  /** Native `max` attribute - applies when `type="number"`. */
  max?: number | null;
  /** Native `step` attribute - applies when `type="number"`. */
  step?: number | null;
  /** Native autocomplete token (e.g. "email", "current-password"). */
  autocomplete?: string | null;
  /** Focuses the field automatically on render. */
  autofocus?: boolean;
  /** Accessible name when no visible `label` is provided; falls back to the placeholder. */
  ariaLabel?: string | null;
  /** Extra element ids to describe the control with, merged with the field's own message id. Set on the inner `<input>`; on the host it would reach no screen reader. */
  ariaDescribedBy?: string | null;
  /** Hard character cap: native maxlength plus a live "{current}/{max}" counter. */
  maxLength?: number | null;
  /** Native `minlength` attribute. */
  minLength?: number | null;
  /** Native `pattern` attribute - signal forms sends the schema's RegExp list. */
  pattern?: readonly RegExp[];
  /** Native `enterkeyhint` attribute: labels the on-screen Enter key. */
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | null;
  /** Native `inputmode` attribute - hints the on-screen keyboard layout. */
  inputMode?: | 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url' | null;
  /** Emits when the native input loses focus. */
  onBlurred?: (value: void) => void;
  /** Shows a clear (×) button on a non-empty value. Defaults to true for `type="search"`, false otherwise. */
  clearable?: boolean | null;
  /** Shows a show/hide button when `type="password"`. */
  passwordToggle?: boolean;
  /** Whether the password is currently shown as plain text, two-way bound. */
  passwordVisible?: boolean;
  onPasswordVisibleChange?: (value: boolean) => void;
  /** Content for the `[dsInputPrefix]` slot. */
  prefix?: React.ReactNode;
  /** Content for the `[dsInputSuffix]` slot. */
  suffix?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Input: React.ComponentType<InputProps>;
