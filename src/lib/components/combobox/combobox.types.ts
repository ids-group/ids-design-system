export type ComboboxSize = 'sm' | 'md' | 'lg';

export interface ComboboxOption<T = unknown> {
  readonly value: T;
  readonly label: string;
}

export interface ComboboxOptionGroup<T = unknown> {
  readonly label: string;
  readonly options: ComboboxOption<T>[];
}
