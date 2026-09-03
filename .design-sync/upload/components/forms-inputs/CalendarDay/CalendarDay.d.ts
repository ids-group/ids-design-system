import * as React from 'react';

/**
 * CalendarDay — the real CalendarDayComponent, run by Angular behind `<ds-x-calendar-day>`.
 * One day cell in a calendar grid — the button DatePicker builds its month out of. Rarely used directly; reach for DatePicker unless you are building a custom calendar.
 */
export interface CalendarDayProps {
  /** The chosen day in single mode, or an end of the range in range mode. Drives `aria-selected`. */
  selected?: boolean;
  /** A day BETWEEN the two ends of a range — tinted, but not itself selected. */
  inRange?: boolean;
  /** First day of a range: rounds the leading corners and counts as selected. */
  rangeStart?: boolean;
  /** Last day of a range: rounds the trailing corners and counts as selected. */
  rangeEnd?: boolean;
  /** Marks the current date. Independent of selection — today can be unselected. */
  today?: boolean;
  /** Day from an adjacent month — dimmed. */
  muted?: boolean;
  /** Outside `minDate`/`maxDate` or rejected by `disabledDate` — dimmed and not clickable. */
  disabled?: boolean;
  /** Stable key the date-picker uses to focus a specific day (roving tabindex). */
  dataDay?: string | null;
  /** Roving tabindex: exactly one day in the grid carries 0, the rest -1, so Tab enters the grid once and arrows move within it. */
  tabIndex?: number;
  /** Full spoken date ("12 March 2026"), since the cell text is only the day number. */
  ariaLabel?: string | null;
  /** Click on an enabled day. Carries the event so the host can read modifier keys. */
  onDaySelected?: (value: MouseEvent) => void;
  /** Key press on the focused day — the grid owns arrow/Home/End navigation, not the cell. */
  onDayKeydown?: (value: KeyboardEvent) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const CalendarDay: React.ComponentType<CalendarDayProps>;
