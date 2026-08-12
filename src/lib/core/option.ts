import type { IconName } from '../icons/icons.data';

/**
 * The shape every picker's option shares — select, multi-select, autocomplete.
 * Add a field HERE, or the three drift apart the way `icon` did. Each keeps its
 * own exported name: those are public API.
 *
 * `T` exists because autocomplete carries typed values; the other two are keyed
 * by string.
 */
export interface DsOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Rendered before the label at 16px by every picker's option row. */
  icon?: IconName;
}
