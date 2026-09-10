import * as React from 'react';

/**
 * Radio — the real RadioComponent, run by Angular behind `<ds-radio>`.
 * Single radio button with inline `label` and `hint` below. Usually placed inside `RadioGroup`, which supplies the shared `name`, selection state and disabled state — set a distinct `value` on each option (compared against the group's selection). Sizes `sm`/`md`/`lg`.
 */
export interface RadioProps {
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
  /** The ONLY way to drive a lone radio: this is deliberately not a `ControlValueAccessor`, so `[formControl]` and `ngModel` do not bind to it — inside `ds-radio-group` the GROUP is the form control, and a second accessor on one option would fight it. Inside a group this input is not read at all. */
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  /** Lets a checked standalone radio be cleared by clicking it again. Off by default, and ignored inside `ds-radio-group`: there a radio is one option of a choice, and clearing it would leave the group with no value through a gesture the group cannot see. */
  deselectable?: boolean;
  /** A disabled parent `ds-radio-group` also disables it, whatever this is set to. */
  disabled?: boolean;
  /** Native `name` attribute — overridden by the group's name when inside `ds-radio-group`. */
  name?: string;
  /** Value compared against the group's selection when inside `ds-radio-group`. */
  value?: unknown;
  /** Overrides the auto-generated id used for the input and its label's `for`. */
  inputId?: string | null;
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Marks the radio required — shows an asterisk on the label and sets `aria-required`. */
  required?: boolean;
  /** Inline label rendered beside the dot and wired via for/id. Omit to bring your own <label>. */
  label?: string;
  /** Accessible name for a control with no visible label — the row's `<label>` collapses when it is empty, leaving nothing to name it. Set beside a label it OVERRIDES the label, per ARIA. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Radio: React.ComponentType<RadioProps>;
