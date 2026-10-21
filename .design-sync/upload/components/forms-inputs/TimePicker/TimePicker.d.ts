import * as React from 'react';

/**
 * TimePicker — the real TimePickerComponent, run by Angular behind `<ds-time-picker>`.
 * Time field — clock-icon trigger button(s) opening a panel of scrollable Hours/Minutes (and AM/PM in 12h format) listbox columns, with "Now" and "Done" footer actions. Sizes `sm`/`md`/`lg` align with Input/Select.
 */
export interface TimePickerProps {
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
  /** Selected time, or `[start, end]` tuple when `mode="range"`. Two-way bound. */
  value?: string | ([string | null, string | null]) | null;
  onValueChange?: (value: string | ([string | null, string | null]) | null) => void;
  /** Single time or `[start, end]` range picker. */
  mode?: ('single' | 'range');
  /** Minute increment shown in the picker columns. */
  minuteStep?: number;
  /** Earliest selectable time ("HH:MM"). */
  minTime?: string | null;
  /** Latest selectable time ("HH:MM"). */
  maxTime?: string | null;
  /** Predicate marking individual times unselectable. */
  disabledTime?: unknown;
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Stretches the trigger to fill its container instead of hugging its content. */
  fullWidth?: boolean;
  /** Field label above the trigger. */
  label?: string;
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker beside the label - ignored when `required` is set. */
  optional?: boolean;
  /** Extra classes for the portaled panel, the only way to style one instance of it. */
  panelClass?: string | readonly string[];
  /** Disables the picker and blocks all interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  success?: string;
  /** Shown in the trigger when no time is set. */
  placeholder?: string;
  /** Shows an inline clear button when a value is set - single mode only. */
  clearable?: boolean;
  /** Accessible name for the trigger(s), suffixed "(from)"/"(to)" in range mode. */
  ariaLabel?: string | null;
  /** Display clock; falls back to `DS_CONFIG.timePicker.format`, then the hour cycle of `DS_CONFIG.locale` / `LOCALE_ID`. */
  format?: ('24h' | '12h') | null;
  /** Whether the hour and minute columns run on past either end; falls back to `DS_CONFIG.timePicker.loop`, then `'auto'`, which loops a column that holds more values than it shows. */
  loop?: ('auto' | 'always' | 'never') | null;
  staticPreview?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const TimePicker: React.ComponentType<TimePickerProps>;
