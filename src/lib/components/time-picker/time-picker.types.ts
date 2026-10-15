export type TimePickerMode = 'single' | 'range';
export type TimeFormat = '24h' | '12h';
/** Whether the hour and minute columns run on past either end: `'auto'` when a column holds more
 *  values than it shows, `'always'`, or `'never'`. */
export type TimePickerLoop = 'auto' | 'always' | 'never';

/** Canonical stored value: 24h `"HH:MM"`. */
export type TimeValue = string;
export type TimeRangeValue = [string | null, string | null];
export type TimePickerValue = TimeValue | TimeRangeValue | null;

export interface TimeConstraints {
  minTime?: string | null;
  maxTime?: string | null;
  disabledTime?: ((time: string) => boolean) | null;
}
