import * as React from 'react';

/**
 * Checkbox — the real CheckboxComponent, run by Angular behind `<ds-checkbox>`.
 * Checkbox with an inline `label` beside the box and a `hint` line below. Sizes `sm`/`md`/`lg`. Checked state follows the Input pattern: pass `checked` + `onCheckedChange` (controlled) or just an initial `checked`.
 */
export interface CheckboxProps {
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
  /** Hides the control; see `DsControlValueAccessor.hidden`. */
  hidden?: boolean;
  /** Checked state, two-way bound. */
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  /** Partial/mixed visual state, independent of `checked`. */
  indeterminate?: boolean;
  /** Disables the checkbox and blocks all interaction. */
  disabled?: boolean;
  /** Native `name` attribute. */
  name?: string | null;
  /** Overrides the generated id of the native `<input>` and its `<label for>`. */
  inputId?: string | null;
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Label beside the box, wired via for/id. Omit to bring your own <label>. */
  label?: string;
  /** Accessible name when no `label` is set; ignored when `label` is set. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Checkbox: React.ComponentType<CheckboxProps>;
