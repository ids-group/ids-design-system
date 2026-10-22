import * as React from 'react';

/**
 * Radio — the real RadioComponent, run by Angular behind `<ds-radio>`.
 * Single radio button with inline `label` and `hint` below. Usually placed inside `RadioGroup`, which supplies the shared `name`, selection state and disabled state — set a distinct `value` on each option (compared against the group's selection). Sizes `sm`/`md`/`lg`.
 */
export interface RadioProps {
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
  /** The only way to drive a lone radio: it is not a `ControlValueAccessor`, so `[formControl]` and `ngModel` do not bind to it (inside `ds-radio-group` the group is the form control). Not read inside a group. */
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  /** Lets a checked standalone radio be cleared by clicking it again. Ignored inside `ds-radio-group`, which cannot see that gesture. */
  deselectable?: boolean;
  /** A disabled parent `ds-radio-group` also disables it, whatever this is set to. */
  disabled?: boolean;
  /** Native `name`; the group's name overrides it inside `ds-radio-group`. */
  name?: string;
  /** Value compared against the group's selection when inside `ds-radio-group`. */
  value?: unknown;
  /** Overrides the generated id of the input and its label's `for`. */
  inputId?: string | null;
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Shows an asterisk on the label and sets `aria-required`. */
  required?: boolean;
  /** Label beside the dot, wired via for/id. Omit to bring your own <label>. */
  label?: string;
  /** Accessible name for a control with no visible label; overrides `label` when both are set. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Radio: React.ComponentType<RadioProps>;
