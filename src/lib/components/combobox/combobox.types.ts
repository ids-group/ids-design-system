export type ComboboxSize = 'sm' | 'md' | 'lg';

/** `fill` stretches to the host container (default); `content` hugs chips/value + a min typing area. */
export type ComboboxWidth = 'fill' | 'content';

export interface ComboboxOption<T = unknown> {
  readonly value: T;
  readonly label: string;
}

export interface ComboboxOptionGroup<T = unknown> {
  readonly label: string;
  readonly options: ComboboxOption<T>[];
}
