// Shared by the ESLint and stylelint plugins: does an entry belong to the releases a consumer is
// upgrading across, after `from` and up to and including `to`? An entry for the unreleased version
// has no number: it counts with no `to`, and never with one.
export const VERSION = /^\d+\.\d+\.\d+/;

const core = (version) => version.match(VERSION)?.[0].split('.').map(Number);

const compare = (left, right) => {
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }

  return 0;
};

export function inRange(since, { from, to } = {}) {
  const released = core(since);
  if (!released) return to === undefined;
  const lower = from === undefined ? undefined : core(from);
  const upper = to === undefined ? undefined : core(to);

  return (
    (!lower || compare(released, lower) > 0) &&
    (!upper || compare(released, upper) <= 0)
  );
}
