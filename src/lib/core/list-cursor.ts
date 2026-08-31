/**
 * Index arithmetic for a keyboard cursor over a list of options.
 *
 * Every picker walks the same four ways — next, previous, first, last — skipping
 * whatever is disabled and wrapping at the ends. Three of them had written that
 * walk out separately, with three different loop shapes and one off-by-one, which
 * is what this replaces.
 *
 * It deliberately knows nothing about WHERE the cursor is applied.
 * `ds-select`, `ds-multi-select` and `ds-autocomplete` point
 * `aria-activedescendant` at a row id; `ds-menu` moves real DOM focus through a
 * roving `tabindex`. Only the arithmetic is shared, and forcing the application
 * to be shared as well is what made the earlier survey recommend against a base
 * class.
 *
 * @param length how many entries the list has right now
 * @param isEnabled whether the entry at that index can take the cursor
 */
export interface DsListCursorList {
  length: number;
  isEnabled: (index: number) => boolean;
}

/** Where the cursor lands, or -1 when nothing in the list can take it. */
export function firstEnabledIndex(list: DsListCursorList): number {
  for (let index = 0; index < list.length; index += 1) {
    if (list.isEnabled(index)) {
      return index;
    }
  }

  return -1;
}

export function lastEnabledIndex(list: DsListCursorList): number {
  for (let index = list.length - 1; index >= 0; index -= 1) {
    if (list.isEnabled(index)) {
      return index;
    }
  }

  return -1;
}

/**
 * The next enabled index `step` away from `from`, wrapping at both ends.
 *
 * `from` of -1 means "no cursor yet": stepping forward lands on the first
 * enabled entry and stepping back on the last, which is what a reader expects
 * from a freshly opened panel and what the hand-written loops got wrong.
 */
export function nextEnabledIndex(
  list: DsListCursorList,
  from: number,
  step: number,
): number {
  if (list.length === 0) {
    return -1;
  }
  if (from < 0) {
    return step > 0 ? firstEnabledIndex(list) : lastEnabledIndex(list);
  }

  let index = from;
  for (let attempts = 0; attempts < list.length; attempts += 1) {
    index = (index + step + list.length) % list.length;
    if (list.isEnabled(index)) {
      return index;
    }
  }

  return from;
}
