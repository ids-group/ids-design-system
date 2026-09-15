import * as React from 'react';

/**
 * Input — the real InputComponent, run by Angular behind `<ds-x-input>`.
 * Single-line text field. Label above (or inside with `floating`), helper `hint` below, validation via `invalid`/`success` (error text goes in `hint`). Sizes `sm`/`md`/`lg` = 32/40/48px.
 */
export interface InputProps {
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
  /** Text value, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Native input type — also affects the default clear button and password toggle. */
  type?: ('text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search');
  /** Field height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
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
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Shows a trailing spinner — e.g. async validation in flight. The input stays editable; pair with a `hint` like "Checking availability…". */
  loading?: boolean;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `name` attribute. */
  name?: string | null;
  /** Native `min` attribute — applies when `type="number"`. */
  min?: number | null;
  /** Native `max` attribute — applies when `type="number"`. */
  max?: number | null;
  /** Native `step` attribute — applies when `type="number"`. */
  step?: number | null;
  /** Native autocomplete token (e.g. "email", "current-password"). */
  autocomplete?: string | null;
  /** Focuses the field automatically on render. */
  autofocus?: boolean;
  /** Accessible name when no visible `label` is provided (falls back to the placeholder so the control is never unnamed). */
  ariaLabel?: string | null;
  /** Extra element ids to describe the control with — a password-rule list, a policy note. MERGED with the field's own message id rather than replacing it, and it has to be an input because the attribute belongs on the inner `<input>`: set on the host it lands on a wrapper no screen reader reads. */
  ariaDescribedBy?: string | null;
  /** Hard character cap — applies the native maxlength attribute and shows a live "{current}/{max}" counter below the field. */
  maxLength?: number | null;
  /** Native `minlength` attribute. */
  minLength?: number | null;
  /** Native `pattern` attribute — signal forms sends the schema's RegExp list. */
  pattern?: readonly RegExp[];
  /** Mobile keyboard hints — forwarded to the native input as attributes. */
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | null;
  /** Native `inputmode` attribute — hints the on-screen keyboard layout. */
  inputMode?: | 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url' | null;
  /** Emits when the native input loses focus. */
  onBlurred?: (value: void) => void;
  /** Show an inline clear (×) button when the input has a non-empty value. Defaults to true when `type="search"`, false otherwise — pass an explicit boolean to override. */
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
