export type DatePickerMode = 'single' | 'range';

export type DateValue = Date | null;
export type DateRangeValue = [Date | null, Date | null];
export type DatePickerValue = DateValue | DateRangeValue;

export interface DatePickerPreset {
  label: string;
  value: Date | DateRangeValue;
}
