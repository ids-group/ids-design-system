import * as React from 'react';

/**
 * TimeColumns — the real TimeColumnsComponent, run by Angular behind `<ds-x-time-columns>`.
 * The scrolling hour/minute (and AM/PM) columns inside TimePicker's panel. Use TimePicker unless you are composing a custom time surface.
 */
export interface TimeColumnsProps {
  /** Current time as `HH:mm` (24h, always — `format` changes only what is DISPLAYED). */
  value?: string | null;
  /** Display clock. `12h` adds an AM/PM column; the emitted value stays 24h either way. */
  format?: ('24h' | '12h');
  /** Minute granularity — 15 gives four rows an hour instead of sixty. */
  minuteStep?: number;
  /** Earliest selectable time, `HH:mm`. Earlier rows render disabled rather than being removed, so the columns do not reflow as the bound changes. */
  minTime?: string | null;
  /** Latest selectable time, `HH:mm`. */
  maxTime?: string | null;
  /** Per-time predicate for what a range cannot express — booked slots, a lunch break. Receives `HH:mm`; return true to disable. */
  disabledTime?: unknown;
  /** A complete time was picked, as `HH:mm`. Not emitted while only one column has moved. */
  onTimeChange?: (value: string) => void;
  /** Which column the pick came from. `timeChange` alone cannot say: it carries a whole time, and a host that wants to close once the user has been through both columns cannot infer the difference between "chose the same hour again" and "did not touch hours". Emitted immediately after `timeChange`. */
  onPartPicked?: (value: ('hours' | 'minutes' | 'period')) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const TimeColumns: React.ComponentType<TimeColumnsProps>;
