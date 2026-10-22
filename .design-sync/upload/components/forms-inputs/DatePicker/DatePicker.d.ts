import * as React from 'react';

/**
 * DatePicker — the real DatePickerComponent, run by Angular behind `<ds-x-date-picker>`.
 * Date field with masked typing (`MM/DD/YYYY`-style per-slot editing) plus a calendar panel — month grid, month/year dropdown pickers, prev/next nav, optional quick-pick presets column. Sizes `sm`/`md`/`lg` align with Input/Select.
 */
export interface DatePickerProps {
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
  /** Hides the control. Inline `display`: the `hidden` attribute loses to each control's `:host` display. */
  hidden?: boolean;
  /** Selection mode - single date or start/end range. */
  mode?: ('single' | 'range');
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Stretches the trigger to fill its container instead of hugging the mask width. */
  fullWidth?: boolean;
  /** Selected date (single) or `[start, end]` (range), two-way bound. */
  value?: Date | ([Date | null, Date | null]) | null;
  onValueChange?: (value: Date | ([Date | null, Date | null]) | null) => void;
  /** Accessible-name fallback only; the mask fills the visible placeholder. Falls back to `DS_INTL.datePicker.placeholder`. */
  placeholder?: string | null;
  /** Field label shown above the trigger. */
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
  /** Predicate - return true to disable an individual day. */
  disabledDate?: unknown;
  /** Quick-pick shortcuts shown as a button column inside the calendar panel. */
  presets?: unknown;
  /** BCP-47 locale for names and value format; falls back to `DS_CONFIG.datePicker.locale`, `DS_CONFIG.locale`, then `LOCALE_ID`. */
  locale?: string | null;
  /** Explicit token format e.g. `'MM/DD/YYYY'`; default derived from `locale`. */
  dateFormat?: string | null;
  /** First weekday column: 0=Sunday … 6=Saturday. Falls back to `DS_CONFIG.datePicker.firstDayOfWeek`, then the resolved `locale`'s week, then 1 (Monday). */
  firstDayOfWeek?: number | null;
  /** Date the calendar opens on when the value is empty; never written to `value`. */
  defaultDate?: Date | null;
  /** Allow masked manual typing; when false a date can only be picked from the calendar. */
  allowInput?: boolean;
  staticPreview?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const DatePicker: React.ComponentType<DatePickerProps>;
