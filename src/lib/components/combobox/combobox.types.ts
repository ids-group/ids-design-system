export type ComboboxSize = 'sm' | 'md' | 'lg';

export interface ComboboxOption<T = unknown> {
  readonly value: T;
  readonly label: string;
}
