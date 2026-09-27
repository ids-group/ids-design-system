import * as React from 'react';

/**
 * TimePicker — the real TimePickerComponent, run by Angular behind `<ds-time-picker>`.
 * Time field — clock-icon trigger button(s) opening a panel of scrollable Hours/Minutes (and AM/PM in 12h format) listbox columns, with "Now" and "Done" footer actions. Sizes `sm`/`md`/`lg` align with Input/Select.
 */
export interface TimePickerProps {
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
  /** Trigger height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Stretch the trigger to fill its container instead of hugging its content — opt in when the field shares a grid/flex track with inputs. */
  fullWidth?: boolean;
  /** Field label shown above the trigger — same row a `ds-date-picker` label occupies, so date + time in one form row line up without a hand-rolled label. */
  label?: string;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker beside the label — ignored when `required` is set. */
  optional?: boolean;
  /** Extra classes for the portaled panel, beside `ds-dropdown-panel`, `ds-overlay-pane` and this component's own `ds-time-picker-panel`. The panel is portaled out of the host, so a class on the pane is the only way a consumer stylesheet reaches ONE instance of it. */
  panelClass?: string | readonly string[];
  /** Disables the picker and blocks all interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Shown in the trigger when no time is set. */
  placeholder?: string;
  /** Shows an inline clear button when a value is set — single mode only. */
  clearable?: boolean;
  /** Accessible name for the trigger(s), suffixed "(from)"/"(to)" in range mode. */
  ariaLabel?: string | null;
  /** Override the DS-config format for this instance. */
  format?: ('24h' | '12h') | null;
  staticPreview?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const TimePicker: React.ComponentType<TimePickerProps>;
