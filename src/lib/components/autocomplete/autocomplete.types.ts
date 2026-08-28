import type { DsOption } from '../../core/option';
import type { DsControlWidth } from '../../core/width';

/** `fill` stretches to the host container (default); `content` hugs chips/value + a min typing area. */
export type AutocompleteWidth = DsControlWidth;

export interface AutocompleteOption<T = unknown> extends DsOption<T> {}

export interface AutocompleteOptionGroup<T = unknown> {
  readonly label: string;
  readonly options: AutocompleteOption<T>[];
}
