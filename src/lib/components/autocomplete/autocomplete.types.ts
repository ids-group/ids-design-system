/** `fill` stretches to the host container (default); `content` hugs chips/value + a min typing area. */
export type AutocompleteWidth = 'fill' | 'content';

export interface AutocompleteOption<T = unknown> {
  readonly value: T;
  readonly label: string;
}

export interface AutocompleteOptionGroup<T = unknown> {
  readonly label: string;
  readonly options: AutocompleteOption<T>[];
}
