export type DatePickerMode = 'single' | 'range';
export type DatePickerSize = 'sm' | 'md' | 'lg';

export type DateValue = Date | null;
export type RangeValue = [Date | null, Date | null];
export type DatePickerValue = DateValue | RangeValue;

export interface DatePickerPreset {
  label: string;
  value: Date | RangeValue;
}
