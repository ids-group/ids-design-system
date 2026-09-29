/**
 * Jump-to-option-by-typing, as a native `<select>` does: "ba" moves to the first option
 * starting with "ba". The timeout separates "ba" from two separate presses; 500ms is the
 * native and APG interval.
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
      // Named keys ("Enter", "ArrowDown") are not text; only a single printable character counts.
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
