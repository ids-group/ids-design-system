import type { IconName } from './icon-names';

/**
 * The shape every picker's option shares (select, multi-select, autocomplete). Add a field
 * HERE so the three do not drift apart. Each keeps its own exported name: those are public API.
 *
 * `T` exists because autocomplete carries typed values; the other two are keyed by string.
 */
export interface DsOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Why this option cannot be picked. Reaches the row as `aria-describedby`. Ignored unless
   *  `disabled` is set. */
  disabledReason?: string;
  /** Rendered before the label at 16px by every picker's option row. */
  icon?: IconName;
}

/** A labelled section of options. `disabled` turns the whole section off. */
export interface DsOptionGroup<T = string> {
  label: string;
  options: DsOption<T>[];
  disabled?: boolean;
}

/**
 * What a picker's `options` input takes: flat options, groups, or both mixed. One input
 * rather than two, so there is no "both set" case to silently resolve.
 */
export type DsOptionItem<T = string> = DsOption<T> | DsOptionGroup<T>;

export function isDsOptionGroup<T>(
  item: DsOptionItem<T>,
): item is DsOptionGroup<T> {
  return 'options' in item && Array.isArray((item as DsOptionGroup<T>).options);
}

/** Every option in `items`, groups flattened in place, in source order. */
export function flattenDsOptions<T>(
  items: readonly DsOptionItem<T>[],
): DsOption<T>[] {
  return items.flatMap((item) =>
    isDsOptionGroup(item)
      ? item.options.map((option) =>
          // Copy only when the flag is missing: the pickers pre-apply a disabled group to the
          // options THEY render, and a second copy would break the object identity their
          // flat-index lookup compares by.
          item.disabled && !option.disabled
            ? { ...option, disabled: true }
            : option,
        )
      : [item],
  );
}
