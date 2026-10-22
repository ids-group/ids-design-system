import * as React from 'react';

/**
 * Switch — the real SwitchComponent, run by Angular behind `<ds-switch>`.
 * Toggle switch (`role="switch"`) with inline `label` and `hint` below — use for instant on/off settings, not form choices that need a submit. Same state pattern as Checkbox: `checked` + `onCheckedChange` (controlled) or just an initial `checked`. Sizes `sm`/`md`/`lg`.
 */
export interface SwitchProps {
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
  /** Hides the control; see `DsControlValueAccessor.hidden`. */
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
  /** Overrides the generated id of the native `<input>` and its `<label for>`. */
  inputId?: string | null;
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Label beside the track, wired via for/id. Omit to bring your own <label>. */
  label?: string;
  /** Accessible name for a control with no visible label; overrides `label` when both are set. */
  ariaLabel?: string | null;
  /** The switch never flips itself: a click or Space cancels the native toggle and `checkedRequested` carries the value the user asked for. It moves only when `checked` changes from outside, so a cancelled confirmation changes nothing. */
  controlled?: boolean;
  /** The value the user asked for, emitted in place of a flip when `controlled`. Silent otherwise. */
  onCheckedRequested?: (value: boolean) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Switch: React.ComponentType<SwitchProps>;
