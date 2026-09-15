import * as React from 'react';

/**
 * Switch — the real SwitchComponent, run by Angular behind `<ds-switch>`.
 * Toggle switch (`role="switch"`) with inline `label` and `hint` below — use for instant on/off settings, not form choices that need a submit. Same state pattern as Checkbox: `checked` + `onCheckedChange` (controlled) or just an initial `checked`. Sizes `sm`/`md`/`lg`.
 */
export interface SwitchProps {
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
  /** Hides the control — see the note on `DsControlValueAccessor.hidden`. */
  hidden?: boolean;
  /** On/off state, two-way bound. */
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  /** Disables the switch and blocks all interaction. */
  disabled?: boolean;
  /** Native `name` attribute. */
  name?: string | null;
  /** Track colour when checked. */
  variant?: 'default' | 'success' | 'error';
  /** Overrides the generated id used by the native `<input>` and its `<label for>`. */
  inputId?: string | null;
  /** Switch size — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Inline label rendered beside the track and wired via for/id. Omit to bring your own <label>. */
  label?: string;
  /** Accessible name for a control with no visible label — the row's `<label>` collapses when it is empty, leaving nothing to name it. Set beside a label it OVERRIDES the label, per ARIA. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Switch: React.ComponentType<SwitchProps>;
