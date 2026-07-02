export type TimePickerMode = 'single' | 'range';
export type TimePickerSize = 'sm' | 'md' | 'lg';
export type TimeFormat = '24h' | '12h';

/** Canonical stored value: 24h `"HH:MM"`. */
export type TimeValue = string;
export type TimeRangeValue = [string | null, string | null];
export type TimePickerValue = TimeValue | TimeRangeValue | null;

export interface TimeConstraints {
  minTime?: string | null;
  maxTime?: string | null;
  disabledTime?: ((time: string) => boolean) | null;
}
