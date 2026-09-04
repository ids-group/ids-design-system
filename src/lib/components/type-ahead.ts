/**
 * The jump-to-option-by-typing that a native `<select>` has and ours did not.
 *
 * Typing "ba" on a closed control moves to the first option starting with "ba",
 * and keeps extending the buffer while the user keeps typing. The timeout is what
 * separates "ba" from two separate "b" and "a" presses; 500ms is the interval
 * every native control and APG example uses.
 */
const RESET_AFTER_MS = 500;

export interface DsTypeAhead {
  /** Feed it a keypress. Returns the index to move to, or -1 when the key is not
   *  a character or nothing matches. */
  match: (key: string, labels: readonly string[], from: number) => number;
}

/** @internal */
export function createTypeAhead(): DsTypeAhead {
  let buffer = '';
  let last = 0;

  return {
    match(key, labels, from) {
      // A modifier combination and any named key ("Enter", "ArrowDown") are not
      // text; only a single printable character extends the buffer.
      if (key.length !== 1 || !/\S/.test(key)) {
        return -1;
      }

      const now = Date.now();
      buffer = now - last > RESET_AFTER_MS ? key : buffer + key;
      last = now;

      const query = buffer.toLowerCase();
      const cycling =
        buffer.length > 1 &&
        [...buffer].every((character) => character === buffer[0]);
      const needle = cycling ? buffer[0].toLowerCase() : query;
      const start = cycling || buffer.length === 1 ? from + 1 : 0;

      for (let offset = 0; offset < labels.length; offset += 1) {
        const index = (start + offset + labels.length) % labels.length;
        if (labels[index].toLowerCase().startsWith(needle)) {
          return index;
        }
      }

      return -1;
    },
  };
}
