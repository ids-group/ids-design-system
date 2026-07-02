import type { TimeConstraints, TimeFormat } from './time-picker.types';

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
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
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  return { h, m };
}

export function toMinutes(value: string | null | undefined): number | null {
  const t = parseTime(value);
  return t ? t.h * 60 + t.m : null;
}

export function fromMinutes(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`;
}

export function to12h(h24: number): { h: number; period: 'AM' | 'PM' } {
  const period = h24 < 12 ? 'AM' : 'PM';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return { h, period };
}

export function from12h(h12: number, period: 'AM' | 'PM'): number {
  const base = h12 % 12; // 12 → 0
  return period === 'PM' ? base + 12 : base;
}

/** Display string for the trigger; '' when value is null/invalid. */
export function formatTime(value: string | null, format: TimeFormat): string {
  const t = parseTime(value);
  if (!t) {
    return '';
  }
  if (format === '24h') {
    return `${pad2(t.h)}:${pad2(t.m)}`;
  }
  const { h, period } = to12h(t.h);
  return `${pad2(h)}:${pad2(t.m)} ${period}`;
}

export function genHours(format: TimeFormat): number[] {
  return format === '24h'
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);
}

export function genMinutes(step: number): number[] {
  const s = step >= 1 ? Math.floor(step) : 1;
  const out: number[] = [];
  for (let m = 0; m < 60; m += s) {
    out.push(m);
  }
  return out;
}

export function snapToStep(value: string, step: number): string {
  const mins = toMinutes(value);
  if (mins === null) {
    return value;
  }
  const s = step >= 1 ? Math.floor(step) : 1;
  return fromMinutes(Math.round(mins / s) * s);
}

export function isTimeDisabled(value: string, c: TimeConstraints): boolean {
  const mins = toMinutes(value);
  if (mins === null) {
    return true;
  }
  const min = toMinutes(c.minTime ?? null);
  const max = toMinutes(c.maxTime ?? null);
  if (min !== null && mins < min) {
    return true;
  }
  if (max !== null && mins > max) {
    return true;
  }
  return c.disabledTime ? c.disabledTime(value) : false;
}

export function clampToRange(value: string, c: TimeConstraints): string {
  const mins = toMinutes(value);
  if (mins === null) {
    return value;
  }
  const min = toMinutes(c.minTime ?? null);
  const max = toMinutes(c.maxTime ?? null);
  let out = mins;
  if (min !== null) {
    out = Math.max(out, min);
  }
  if (max !== null) {
    out = Math.min(out, max);
  }
  return fromMinutes(out);
}
