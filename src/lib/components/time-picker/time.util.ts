import type { TimeConstraints, TimeFormat } from './time-picker.types';

/** The locale's clock: `'12h'` when its hour cycle is h11/h12, else `'24h'`. */
export function localeTimeFormat(locale: string): TimeFormat {
  const { hourCycle } = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
  }).resolvedOptions();

  return hourCycle === 'h11' || hourCycle === 'h12' ? '12h' : '24h';
}

export function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

/** Parse "HH:MM" (24h) → {h,m}, or null when malformed / out of range. */
export function parseTime(
  value: string | null | undefined,
): { h: number; m: number } | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { h: hours, m: minutes };
}

export function toMinutes(value: string | null | undefined): number | null {
  const parsed = parseTime(value);

  return parsed ? parsed.h * 60 + parsed.m : null;
}

export function fromMinutes(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440;

  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`;
}

export function to12h(h24: number): { h: number; period: 'AM' | 'PM' } {
  const period = h24 < 12 ? 'AM' : 'PM';
  const hours = h24 % 12 === 0 ? 12 : h24 % 12;

  return { h: hours, period };
}

export function from12h(h12: number, period: 'AM' | 'PM'): number {
  const base = h12 % 12; // 12 → 0

  return period === 'PM' ? base + 12 : base;
}

/** Display string for the trigger; '' when value is null/invalid. */
export function formatTime(value: string | null, format: TimeFormat): string {
  const parsed = parseTime(value);
  if (!parsed) {
    return '';
  }
  if (format === '24h') {
    return `${pad2(parsed.h)}:${pad2(parsed.m)}`;
  }
  const { h: hours, period } = to12h(parsed.h);

  return `${pad2(hours)}:${pad2(parsed.m)} ${period}`;
}

export function genHours(format: TimeFormat): number[] {
  return format === '24h'
    ? Array.from({ length: 24 }, (_, index) => index)
    : Array.from({ length: 12 }, (_, index) => index + 1);
}

export function genMinutes(step: number): number[] {
  const stepSize = step >= 1 ? Math.floor(step) : 1;
  const out: number[] = [];
  for (let minute = 0; minute < 60; minute += stepSize) {
    out.push(minute);
  }

  return out;
}

export function snapToStep(value: string, step: number): string {
  const mins = toMinutes(value);
  if (mins === null) {
    return value;
  }
  const stepSize = step >= 1 ? Math.floor(step) : 1;

  return fromMinutes(Math.round(mins / stepSize) * stepSize);
}

export function isTimeDisabled(
  value: string,
  constraints: TimeConstraints,
): boolean {
  const mins = toMinutes(value);
  if (mins === null) {
    return true;
  }
  const min = toMinutes(constraints.minTime ?? null);
  const max = toMinutes(constraints.maxTime ?? null);
  if (min !== null && mins < min) {
    return true;
  }
  if (max !== null && mins > max) {
    return true;
  }

  return constraints.disabledTime ? constraints.disabledTime(value) : false;
}

export function clampToRange(
  value: string,
  constraints: TimeConstraints,
): string {
  const mins = toMinutes(value);
  if (mins === null) {
    return value;
  }
  const min = toMinutes(constraints.minTime ?? null);
  const max = toMinutes(constraints.maxTime ?? null);
  let out = mins;
  if (min !== null) {
    out = Math.max(out, min);
  }
  if (max !== null) {
    out = Math.min(out, max);
  }

  return fromMinutes(out);
}
