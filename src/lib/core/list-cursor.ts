/**
 * Index arithmetic for a keyboard cursor over options: skips disabled entries, wraps at the ends.
 */
export interface DsListCursorList {
  length: number;
  isEnabled: (index: number) => boolean;
}

/** Where the cursor lands, or -1 when nothing in the list can take it.
 * @internal
 */
export function firstEnabledIndex(list: DsListCursorList): number {
  for (let index = 0; index < list.length; index += 1) {
    if (list.isEnabled(index)) {
      return index;
    }
  }

  return -1;
}

/** @internal */
export function lastEnabledIndex(list: DsListCursorList): number {
  for (let index = list.length - 1; index >= 0; index -= 1) {
    if (list.isEnabled(index)) {
      return index;
    }
  }

  return -1;
}

const CURSOR_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
  'Enter',
]);

/** Whether `key` moves the cursor or picks the row under it.
 * @internal
 */
export function isListCursorKey(key: string): boolean {
  return CURSOR_KEYS.has(key);
}

/**
 * The next enabled index `step` away from `from`, wrapping at both ends.
 *
 * `from` of -1 means "no cursor yet".
 * @internal
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
  // eslint-disable-next-line @typescript-eslint/prefer-for-of -- walks from `from` with modulo wraparound; `attempts` only bounds the walk, it is not a sequential index
  for (let attempts = 0; attempts < list.length; attempts += 1) {
    index = (index + step + list.length) % list.length;
    if (list.isEnabled(index)) {
      return index;
    }
  }

  return from;
}
