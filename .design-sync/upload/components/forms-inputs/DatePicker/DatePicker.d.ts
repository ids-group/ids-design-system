import * as React from 'react';

/**
 * DatePicker — the real DatePickerComponent, run by Angular behind `<ds-x-date-picker>`.
 * Date field with masked typing (`MM/DD/YYYY`-style per-slot editing) plus a calendar panel — month grid, month/year dropdown pickers, prev/next nav, optional quick-pick presets column. Sizes `sm`/`md`/`lg` align with Input/Select.
 */
export interface DatePickerProps {
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
  /** Hides the control. On the base so signal forms reaches every control at once. Inline `display`, not the `hidden` attribute — each control sets its own `:host` display, which the attribute's weaker UA rule would lose to. */
  hidden?: boolean;
  /** Selection mode — single date or start/end range. */
  mode?: ('single' | 'range');
  /** Trigger height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Stretch the trigger to fill its container instead of hugging the mask width — opt in when the field shares a grid/flex track with inputs. */
  fullWidth?: boolean;
  /** Selected date (single) or `[start, end]` (range), two-way bound. */
  value?: Date | ([Date | null, Date | null]) | null;
  onValueChange?: (value: Date | ([Date | null, Date | null]) | null) => void;
  /** Accessible-name fallback only — the mask fills the visible placeholder, not this. */
  placeholder?: string;
  /** Field label shown above the trigger. */
  label?: string;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker beside the label — ignored when `required` is set. */
  optional?: boolean;
  /** Extra classes for the portaled panel, beside `ds-dropdown-panel`, `ds-overlay-pane` and this component's own `ds-date-picker-panel`. The panel is portaled out of the host, so a class on the pane is the only way a consumer stylesheet reaches ONE instance of it. */
  panelClass?: string | readonly string[];
  /** Disables the picker and blocks all interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string | null;
  /** Lower bound for the year dropdown in the calendar header. */
  minYear?: number;
  /** Upper bound for the year dropdown in the calendar header. */
  maxYear?: number;
  /** Earliest selectable date (inclusive). Days before this are disabled. */
  minDate?: Date | null;
  /** Latest selectable date (inclusive). Days after this are disabled. */
  maxDate?: Date | null;
  /** Predicate — return true to disable an individual day. */
  disabledDate?: unknown;
  /** Quick-pick shortcuts shown as a button column inside the calendar panel. */
  presets?: unknown;
  /** BCP-47 locale driving month/weekday names and the value format. */
  locale?: string | null;
  /** Explicit token format e.g. `'MM/DD/YYYY'`; default derived from `locale`. */
  dateFormat?: string | null;
  /** First weekday column: 0=Sunday … 6=Saturday. Default 1 (Monday). */
  firstDayOfWeek?: number | null;
  /** Date the calendar opens on when the value is empty (e.g. a Date Of Birth): the panel shows its month and grid focus lands on its exact day. Never written to `value` — selection stays with the user. */
  defaultDate?: Date | null;
  /** Allow masked manual typing. When false the field is read-only and a date can only be picked from the calendar. */
  allowInput?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const DatePicker: React.ComponentType<DatePickerProps>;
