import * as React from 'react';

/**
 * Checkbox — the real CheckboxComponent, run by Angular behind `<ds-checkbox>`.
 * Checkbox with an inline `label` beside the box and a `hint` line below. Sizes `sm`/`md`/`lg`. Checked state follows the Input pattern: pass `checked` + `onCheckedChange` (controlled) or just an initial `checked`.
 */
export interface CheckboxProps {
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
  /** Validation errors, shown once the user has interacted. Bound automatically by signal forms; reactive and template-driven forms are read through `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  errors?: unknown;
  /** Paints the error state and sets `aria-invalid`, WITHOUT a message of its own — for when the text lives elsewhere, such as a form-level error summary or one message covering a whole field group. Use `error` to show text. */
  invalid?: boolean;
  /** Whether the user has interacted with the field. Bound by signal forms; gates `errors`, so a `required` error does not greet an untouched form. */
  touched?: boolean;
  /** Hides the control — see the note on `DsControlValueAccessor.hidden`. */
  hidden?: boolean;
  /** Checked state, two-way bound. */
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  /** Shows the partial/mixed visual state — independent of `checked`. */
  indeterminate?: boolean;
  /** Disables the checkbox and blocks all interaction. */
  disabled?: boolean;
  /** Native `name` attribute. */
  name?: string | null;
  /** Overrides the generated id used by the native `<input>` and its `<label for>`. */
  inputId?: string | null;
  /** Checkbox size — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Inline label rendered beside the box and wired via for/id. Omit to bring your own <label>. */
  label?: string;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Checkbox: React.ComponentType<CheckboxProps>;
